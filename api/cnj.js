// ============================================================
// BEN JURIS CENTER — CNJ Integration API v2.0
// Rota: POST /api/cnj
// Body: { action, ...params }
//
// ⚠️  LIMITAÇÃO CONFIRMADA DO DATAJUD API PÚBLICA (mar/2026):
//   O campo "partes" (nome, tipo, advogados) NÃO é indexado
//   na API pública — retorna vazio em TODOS os tribunais.
//   Busca por nome de parte ou OAB NÃO é possível via DataJud.
//
// ESTRATÉGIA ADOTADA — Monitoramento por número de processo:
//   1. Usuário cadastra os números dos seus processos (lista fixa)
//   2. Sistema monitora movimentações novas em cada número
//   3. Cron a cada 2h compara com último estado salvo e alerta
//
// MÓDULO 1 — DataJud (API Pública CNJ)
//   Chave pública fixa: APIKey cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==
//   Campos disponíveis: numeroProcesso, classe, movimentos, orgaoJulgador,
//                       assuntos, dataAjuizamento, tribunal, nivelSigilo
//
// MÓDULO 2 — DJEN (Domicílio Judicial Eletrônico)
//   Base: https://gateway.cloud.pje.jus.br/domicilio-eletronico
//   Autenticação: Bearer token (env var DJEN_TOKEN)
//   ✅ DJEN SIM indexa por CNPJ/CPF — recebe intimações automaticamente
//
// Actions disponíveis:
//   datajud_busca_numero        → busca processo por número CNJ
//   datajud_movimentos          → movimentações de um processo
//   datajud_monitorar_lista     → monitora lista de números cadastrados
//   datajud_status              → status de conectividade
//   djen_listar                 → comunicações DJEN pendentes
//   djen_marcar_ciencia         → registrar ciência
//   djen_detalhe                → detalhe de comunicação
//   djen_status                 → status DJEN
// ============================================================

export const config = { maxDuration: 30 }

// ── DataJud ─────────────────────────────────────────────────
// Chave pública oficial CNJ (atualizada em mar/2026)
// Fonte: https://datajud-wiki.cnj.jus.br/api-publica/acesso
// NOTA: STF NÃO está disponível no DataJud (retorna 404).
// Tribunais disponíveis: todos os TJs, TRFs, TRTs, TREs, TST, STJ, STM.
const DATAJUD_BASE   = 'https://api-publica.datajud.cnj.jus.br'
const DATAJUD_APIKEY = process.env.DATAJUD_API_KEY
  || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

// ── DJEN ─────────────────────────────────────────────────────
// Token gerado manualmente em: https://domicilio-eletronico.pdpj.jus.br
// Menu: Gerenciar credenciais API → Solicitar → copiar Bearer token
const DJEN_BASE  = 'https://gateway.cloud.pje.jus.br/domicilio-eletronico'
const DJEN_TOKEN = process.env.DJEN_TOKEN   // Bearer token da credencial
const DJEN_CNPJ  = process.env.DJEN_CNPJ   // CNPJ do escritório (sem máscara)

// ── Mapa: tribunal → alias DataJud ──────────────────────────
// Tribunais prioritários do escritório Mauro Monção (PI/CE/MA)
const TRIBUNAL_ALIAS = {
  // Prioritários (escritório PI/CE/MA)
  TJPI:  'api_publica_tjpi',
  TJCE:  'api_publica_tjce',
  TJMA:  'api_publica_tjma',
  // Trabalho (região NE)
  TRT22: 'api_publica_trt22',  // TRT 22ª = Piauí
  TRT7:  'api_publica_trt7',   // TRT 7ª  = Ceará
  TRT16: 'api_publica_trt16',  // TRT 16ª = Maranhão
  // Federal
  TRF1:  'api_publica_trf1',
  TRF5:  'api_publica_trf5',
  // Superiores
  STJ:   'api_publica_stj',
  // STF: não disponível no DataJud (use o portal do STF diretamente)
  TST:   'api_publica_tst',
  STM:   'api_publica_stm',
  TSE:   'api_publica_tse',
  // Outros (cobertura total)
  TJSP:  'api_publica_tjsp',
  TJRJ:  'api_publica_tjrj',
  TJMG:  'api_publica_tjmg',
  TJRS:  'api_publica_tjrs',
  TJPR:  'api_publica_tjpr',
  TJSC:  'api_publica_tjsc',
  TJBA:  'api_publica_tjba',
  TJGO:  'api_publica_tjgo',
  TJPE:  'api_publica_tjpe',
  TJPB:  'api_publica_tjpb',
  TJRN:  'api_publica_tjrn',
  TJAL:  'api_publica_tjal',
  TJSE:  'api_publica_tjse',
  TJDFT: 'api_publica_tjdft',
  TJMS:  'api_publica_tjms',
  TJMT:  'api_publica_tjmt',
  TJPA:  'api_publica_tjpa',
  TJAM:  'api_publica_tjam',
  TJAC:  'api_publica_tjac',
  TJRO:  'api_publica_tjro',
  TJRR:  'api_publica_tjrr',
  TJAP:  'api_publica_tjap',
  TJTO:  'api_publica_tjto',
  TJES:  'api_publica_tjes',
  TRF2:  'api_publica_trf2',
  TRF3:  'api_publica_trf3',
  TRF4:  'api_publica_trf4',
  TRF6:  'api_publica_trf6',
}

// ── Detecta automaticamente o tribunal pelo número CNJ ──────
// Número CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
// J=8 → Estadual, J=5 → Trabalho, J=1 → Federal, J=9 → Militar
// TT → código do tribunal
function resolverTribunal(numeroCNJ) {
  if (!numeroCNJ) return null
  const clean = numeroCNJ.replace(/\D/g, '')
  // Formato: 20 dígitos — NNNNNNNDDAAAAJTTOOOO
  if (clean.length < 20) return null
  const j  = parseInt(clean.charAt(13))  // segmento J
  const tt = parseInt(clean.slice(14, 16)) // segmento TT
  if (j === 8) {
    // Estadual — TT=01..27 → UF
    const UFS = ['TJAC','TJAL','TJAM','TJAP','TJBA','TJCE','TJDFT','TJES',
                 'TJGO','TJMA','TJMG','TJMS','TJMT','TJPA','TJPB','TJPE',
                 'TJPI','TJPR','TJRJ','TJRN','TJRO','TJRR','TJRS','TJSC',
                 'TJSE','TJSP','TJTO']
    return UFS[tt - 1] || null
  }
  if (j === 5) return `TRT${tt}`
  if (j === 1) return tt === 0 ? 'STJ' : `TRF${tt}`
  if (j === 3) return tt === 0 ? 'TST' : null
  if (j === 9) return tt === 0 ? 'STM' : null  // Justiça Militar
  return null
}

// ── Headers DataJud ─────────────────────────────────────────
function datajudHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `APIKey ${DATAJUD_APIKEY}`,
  }
}

// ── Headers DJEN ─────────────────────────────────────────────
function djenHeaders() {
  if (!DJEN_TOKEN) return null
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DJEN_TOKEN}`,
  }
}

// ════════════════════════════════════════════════════════════
// ── HANDLERS DataJud ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════

// Busca processo por número CNJ exato
async function datajudBuscaNumero({ numero, tribunal }) {
  const alias = tribunal
    ? (TRIBUNAL_ALIAS[tribunal.toUpperCase()] || null)
    : resolverTribunal(numero) && TRIBUNAL_ALIAS[resolverTribunal(numero)]

  if (!alias) {
    return {
      success: false,
      error: 'Tribunal não identificado. Informe o parâmetro "tribunal" (ex: "TJPI").',
      tribunaisDisponiveis: Object.keys(TRIBUNAL_ALIAS),
    }
  }

  const url = `${DATAJUD_BASE}/${alias}/_search`
  const body = {
    query: {
      match: { numeroProcesso: numero.replace(/\D/g, '').replace(
        /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,
        '$1-$2.$3.$4.$5.$6'
      )},
    },
    _source: [
      'numeroProcesso','dataAjuizamento','dataUltimaAtualizacao',
      'classeProcessual','assuntos','movimentos','orgaoJulgador',
      'partes','nivelSigilo','tribunal',
    ],
    size: 5,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: datajudHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DataJud [${res.status}]: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const hits = data?.hits?.hits || []

  return {
    success: true,
    total: data?.hits?.total?.value || 0,
    tribunal: alias,
    processos: hits.map(h => ({
      id: h._id,
      ...h._source,
    })),
    fonte: 'datajud',
    timestamp: new Date().toISOString(),
  }
}

// Busca processos por nome da parte
async function datajudBuscaParte({ nome, tribunal, area, page = 0 }) {
  const alias = tribunal
    ? (TRIBUNAL_ALIAS[tribunal.toUpperCase()] || null)
    : null  // sem tribunal: faz busca nos prioritários PI/CE/MA

  const tributaisQuery = alias
    ? [`${DATAJUD_BASE}/${alias}/_search`]
    : ['TJPI','TJCE','TJMA','TRT22','TRF1','STJ'].map(
        t => `${DATAJUD_BASE}/${TRIBUNAL_ALIAS[t]}/_search`
      )

  const body = {
    query: {
      bool: {
        must: [
          {
            nested: {
              path: 'partes',
              query: {
                match: { 'partes.nome': { query: nome, operator: 'and' } },
              },
            },
          },
        ],
        ...(area ? {
          filter: [{
            nested: {
              path: 'assuntos',
              query: { match: { 'assuntos.descricao': area } },
            },
          }],
        } : {}),
      },
    },
    _source: [
      'numeroProcesso','dataAjuizamento','dataUltimaAtualizacao',
      'classeProcessual','assuntos','orgaoJulgador','partes',
    ],
    sort: [{ dataUltimaAtualizacao: { order: 'desc' } }],
    from: page * 10,
    size: 10,
  }

  const resultados = []
  let totalGeral = 0

  for (const url of tributaisQuery) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: datajudHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const hits = data?.hits?.hits || []
      totalGeral += data?.hits?.total?.value || 0
      resultados.push(...hits.map(h => ({ id: h._id, ...h._source })))
    } catch {
      // ignora falha em tribunal individual
    }
  }

  return {
    success: true,
    total: totalGeral,
    processos: resultados.slice(0, 20),
    fonte: 'datajud',
    timestamp: new Date().toISOString(),
  }
}

// Movimentações de um processo
async function datajudMovimentos({ numero, tribunal, limite = 20 }) {
  const trib = tribunal
    ? tribunal.toUpperCase()
    : resolverTribunal(numero)
  const alias = trib ? TRIBUNAL_ALIAS[trib] : null

  if (!alias) throw new Error('Tribunal não identificado. Informe o parâmetro "tribunal".')

  const url = `${DATAJUD_BASE}/${alias}/_search`
  const body = {
    query: { match: { numeroProcesso: numero } },
    _source: ['numeroProcesso','movimentos','dataUltimaAtualizacao','orgaoJulgador'],
    size: 1,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: datajudHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`DataJud [${res.status}]: ${await res.text().then(t => t.slice(0,200))}`)

  const data = await res.json()
  const processo = data?.hits?.hits?.[0]?._source

  if (!processo) {
    return { success: false, error: 'Processo não encontrado no DataJud.', numero }
  }

  const movimentos = (processo.movimentos || [])
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
    .slice(0, limite)

  return {
    success: true,
    numero: processo.numeroProcesso,
    dataUltimaAtualizacao: processo.dataUltimaAtualizacao,
    orgaoJulgador: processo.orgaoJulgador,
    totalMovimentos: (processo.movimentos || []).length,
    movimentos,
    fonte: 'datajud',
    timestamp: new Date().toISOString(),
  }
}

// Status de conectividade DataJud
async function datajudStatus() {
  const tribunaisTeste = ['TJPI', 'TJCE', 'TJMA', 'STJ', 'TRT22']
  const resultados = []

  for (const trib of tribunaisTeste) {
    const alias = TRIBUNAL_ALIAS[trib]
    const url   = `${DATAJUD_BASE}/${alias}/_search`
    const start = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: datajudHeaders(),
        body: JSON.stringify({ query: { match_all: {} }, size: 1 }),
        signal: AbortSignal.timeout(8000),
      })
      const latency = Date.now() - start
      resultados.push({
        tribunal: trib,
        alias,
        status: res.ok ? 'online' : 'degradado',
        httpStatus: res.status,
        latency_ms: latency,
      })
    } catch (e) {
      resultados.push({
        tribunal: trib,
        alias,
        status: 'offline',
        error: e.message,
        latency_ms: Date.now() - start,
      })
    }
  }

  const online = resultados.filter(r => r.status === 'online').length
  return {
    success: true,
    datajud: online > 0 ? 'online' : 'offline',
    apikey_configurada: true,
    tribunais_testados: resultados,
    timestamp: new Date().toISOString(),
  }
}

// ════════════════════════════════════════════════════════════
// ── MONITORAMENTO POR LISTA DE PROCESSOS ─────────────────────
// ════════════════════════════════════════════════════════════
//
// ⚠️ LIMITAÇÃO DATAJUD API PÚBLICA:
//   O campo "partes" NÃO é indexado — busca por nome/OAB impossível.
//   Estratégia adotada: monitorar por número de processo cadastrado.
//
// PERFIL DR. MAURO MONÇÃO — dados para referência e uso interno
// OAB/CE 22502 | OAB/PI 7304-A | OAB/MA 29037
// Nomes possíveis nos autos: MAURO MONÇÃO DA SILVA / MAURO MONCAO DA SILVA / MAURO MONCAO
//
// Para buscar nos sistemas dos próprios tribunais (com partes):
//   TJPI:  https://pje.tjpi.jus.br → Consulta Processual → nome da parte
//   TJCE:  https://eproc.tjce.jus.br → Pesquisa por advogado + OAB/CE 22502
//   TJMA:  https://pje.tjma.jus.br → Pesquisa por OAB/MA 29037
//   TRF1:  https://pje1g.trf1.jus.br → Pesquisa por OAB
//   TRT22: https://pje.trt22.jus.br → Pesquisa por OAB/PI 7304-A

// Monitorar lista de processos por número e detectar novos movimentos
async function datajudMonitorarLista({ processos = [] }) {
  // processos = [{ numero, tribunal, ultimoMovimento? }]
  if (!processos || processos.length === 0) {
    return {
      success: false,
      erro: 'Informe o parâmetro "processos" com lista de { numero, tribunal }.',
      exemplo: [
        { numero: '0001234-55.2024.8.22.0001', tribunal: 'TJPI' },
        { numero: '0009999-11.2023.8.06.0001', tribunal: 'TJCE' },
      ],
    }
  }

  const resultados = []

  for (const proc of processos.slice(0, 30)) {
    const { numero, tribunal, ultimoMovimento } = proc
    const alias = tribunal
      ? (TRIBUNAL_ALIAS[tribunal.toUpperCase()] || null)
      : resolverTribunal(numero) && TRIBUNAL_ALIAS[resolverTribunal(numero)]

    if (!alias) {
      resultados.push({ numero, tribunal, erro: 'Tribunal não reconhecido', novosMovimentos: 0 })
      continue
    }

    try {
      const url  = `${DATAJUD_BASE}/${alias}/_search`
      const body = {
        query: { match: { numeroProcesso: numero.replace(/\D/g,'').replace(
          /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,'$1-$2.$3.$4.$5.$6'
        )}},
        _source: ['numeroProcesso','dataHoraUltimaAtualizacao','classe','movimentos','orgaoJulgador','assuntos'],
        size: 1,
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: datajudHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      })

      if (!res.ok) {
        resultados.push({ numero, tribunal, erro: `HTTP ${res.status}`, novosMovimentos: 0 })
        continue
      }

      const data   = await res.json()
      const source = data?.hits?.hits?.[0]?._source

      if (!source) {
        resultados.push({ numero, tribunal, encontrado: false, novosMovimentos: 0 })
        continue
      }

      const movimentos = (source.movimentos || [])
        .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))

      const ultimoDataHora = movimentos[0]?.dataHora || null

      // Detectar movimentos NOVOS (posteriores ao último conhecido)
      const novosMovimentos = ultimoMovimento
        ? movimentos.filter(m => m.dataHora > ultimoMovimento)
        : movimentos.slice(0, 3)

      resultados.push({
        numero:               source.numeroProcesso,
        tribunal,
        alias,
        encontrado:           true,
        classe:               source.classe?.nome || '—',
        orgao:                source.orgaoJulgador?.nome || '—',
        assuntos:             (source.assuntos || []).slice(0, 2).map(a => a.nome),
        dataUltimaAtualizacao: source.dataHoraUltimaAtualizacao,
        ultimoMovimento:      ultimoDataHora,
        novosMovimentos:      novosMovimentos.length,
        movimentosRecentes:   novosMovimentos.slice(0, 5).map(m => ({
          dataHora: m.dataHora,
          nome:     m.nome || m.codigo,
          codigo:   m.codigo,
        })),
        totalMovimentos: movimentos.length,
      })
    } catch (e) {
      resultados.push({ numero, tribunal, erro: e.message, novosMovimentos: 0 })
    }
  }

  const comNovos    = resultados.filter(r => r.novosMovimentos > 0)
  const encontrados = resultados.filter(r => r.encontrado)

  return {
    success: true,
    totalMonitorados:  processos.length,
    totalEncontrados:  encontrados.length,
    totalComNovidades: comNovos.length,
    processos:         resultados,
    fonte:             'datajud',
    timestamp:         new Date().toISOString(),
  }
}



// Listar comunicações processuais (intimações, citações, etc.)
async function djenListar({ pagina = 0, tamanho = 20, status = 'NAO_LIDA' } = {}) {
  const headers = djenHeaders()
  if (!headers) {
    return {
      success: false,
      configurado: false,
      mensagem: 'DJEN não configurado. Configure DJEN_TOKEN e DJEN_CNPJ no Cloudflare Pages.',
      instrucoes: [
        '1. Acesse https://domicilio-eletronico.pdpj.jus.br com certificado digital do escritório',
        '2. Menu lateral → "Gerenciar credenciais API" → "Solicitar"',
        '3. Aceite os termos e clique em "Gerar credencial"',
        '4. Copie o Bearer token gerado',
        '5. Configure DJEN_TOKEN=<token> e DJEN_CNPJ=<cnpj_sem_mascara> no Cloudflare Pages',
      ],
      comunicacoes: [],
    }
  }

  const params = new URLSearchParams({
    pagina: String(pagina),
    tamanho: String(tamanho),
    ...(status !== 'TODAS' ? { situacao: status } : {}),
    ...(DJEN_CNPJ ? { cnpj: DJEN_CNPJ } : {}),
  })

  const res = await fetch(
    `${DJEN_BASE}/api/v1/comunicacoes?${params}`,
    { method: 'GET', headers, signal: AbortSignal.timeout(15000) }
  )

  if (res.status === 401) {
    return {
      success: false,
      configurado: true,
      mensagem: 'Token DJEN inválido ou expirado. Gere uma nova credencial no portal.',
      comunicacoes: [],
    }
  }

  if (!res.ok) {
    throw new Error(`DJEN [${res.status}]: ${await res.text().then(t => t.slice(0,300))}`)
  }

  const data = await res.json()

  // Normalizar resposta para o frontend
  const comunicacoes = (data?.content || data?.comunicacoes || data || []).map(c => ({
    id:          c.id || c.idComunicacao,
    tipo:        c.tipoComunicacao || c.tipo || 'comunicacao',
    processo:    c.numeroProcesso || c.processo,
    tribunal:    c.siglaTribunal  || c.tribunal,
    descricao:   c.texto         || c.descricao || c.conteudo || '',
    dataEnvio:   c.dataEnvio     || c.dataComunicacao,
    prazo:       c.dataPrazo     || c.prazo,
    situacao:    c.situacao      || c.status || 'NAO_LIDA',
    urgencia:    inferirUrgencia(c),
    destinatario: c.nomeDestinatario || c.destinatario,
  }))

  return {
    success: true,
    configurado: true,
    total:  data?.totalElements || data?.total || comunicacoes.length,
    pagina,
    tamanho,
    comunicacoes,
    fonte: 'djen',
    timestamp: new Date().toISOString(),
  }
}

// Registrar ciência de uma comunicação
async function djenMarcarCiencia({ idComunicacao }) {
  const headers = djenHeaders()
  if (!headers) {
    return { success: false, mensagem: 'DJEN_TOKEN não configurado.' }
  }

  const res = await fetch(
    `${DJEN_BASE}/api/v1/comunicacoes/${idComunicacao}/ciencia`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        dataCiencia: new Date().toISOString(),
        ...(DJEN_CNPJ ? { cnpj: DJEN_CNPJ } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    }
  )

  if (!res.ok) {
    throw new Error(`DJEN ciência [${res.status}]: ${await res.text().then(t => t.slice(0,200))}`)
  }

  return {
    success: true,
    idComunicacao,
    dataCiencia: new Date().toISOString(),
    mensagem: 'Ciência registrada com sucesso no DJEN.',
  }
}

// Detalhe de uma comunicação
async function djenDetalhe({ idComunicacao }) {
  const headers = djenHeaders()
  if (!headers) return { success: false, mensagem: 'DJEN_TOKEN não configurado.' }

  const res = await fetch(
    `${DJEN_BASE}/api/v1/comunicacoes/${idComunicacao}`,
    { method: 'GET', headers, signal: AbortSignal.timeout(10000) }
  )

  if (!res.ok) {
    throw new Error(`DJEN detalhe [${res.status}]: ${await res.text().then(t => t.slice(0,200))}`)
  }

  return { success: true, comunicacao: await res.json(), fonte: 'djen' }
}

// Status de conectividade DJEN
async function djenStatus() {
  const headers = djenHeaders()

  if (!headers) {
    return {
      success: true,
      djen: 'não_configurado',
      configurado: false,
      mensagem: 'DJEN_TOKEN não definido. Configure no Cloudflare Pages.',
      instrucoes: [
        'Acesse https://domicilio-eletronico.pdpj.jus.br',
        'Menu → Gerenciar credenciais API → Solicitar',
        'Copie o Bearer token',
        'Adicione DJEN_TOKEN=<token> nas variáveis de ambiente do Cloudflare Pages',
      ],
    }
  }

  const start = Date.now()
  try {
    const res = await fetch(
      `${DJEN_BASE}/api/v1/comunicacoes?pagina=0&tamanho=1`,
      { method: 'GET', headers, signal: AbortSignal.timeout(8000) }
    )
    return {
      success: true,
      djen: res.ok ? 'online' : 'degradado',
      configurado: true,
      httpStatus: res.status,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    }
  } catch (e) {
    return {
      success: true,
      djen: 'offline',
      configurado: true,
      error: e.message,
      latency_ms: Date.now() - start,
    }
  }
}

// ── Inferir urgência pela comunicação DJEN ──────────────────
function inferirUrgencia(c) {
  const texto = ((c.texto || c.descricao || c.tipoComunicacao || '') + '').toLowerCase()
  const prazo = c.dataPrazo || c.prazo
  if (!prazo) return 'media'
  const diasRestantes = Math.ceil(
    (new Date(prazo) - new Date()) / (1000 * 60 * 60 * 24)
  )
  if (diasRestantes <= 0)  return 'urgente'
  if (diasRestantes <= 1)  return 'urgente'
  if (diasRestantes <= 3)  return 'alta'
  if (diasRestantes <= 7)  return 'media'
  return 'baixa'
}

// ════════════════════════════════════════════════════════════
// ── HANDLER PRINCIPAL ────────────────────────────────────────
// ════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET /api/cnj?action=status → retorna status rápido de ambos os módulos
  if (req.method === 'GET') {
    try {
      const [dj, dj2] = await Promise.all([datajudStatus(), djenStatus()])
      return res.status(200).json({
        success: true,
        datajud: dj,
        djen:    dj2,
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { action, ...params } = body || {}

  if (!action) {
    return res.status(400).json({
      error: 'Campo "action" obrigatório.',
      actions_disponiveis: [
        'datajud_busca_numero',
        'datajud_busca_parte',
        'datajud_movimentos',
        'datajud_status',
        'djen_listar',
        'djen_marcar_ciencia',
        'djen_detalhe',
        'djen_status',
      ],
    })
  }

  try {
    let resultado

    switch (action) {
      // ── DataJud ────────────────────────────────────────────
      case 'datajud_busca_numero':
        if (!params.numero) throw new Error('"numero" é obrigatório.')
        resultado = await datajudBuscaNumero(params)
        break

      case 'datajud_busca_parte':
        // ⚠️ DataJud API pública NÃO indexa partes — retorna orientação
        resultado = {
          success: false,
          aviso: 'A API Pública do DataJud não indexa o campo "partes" (confirmado mar/2026). ' +
            'Busca por nome ou OAB não é possível via DataJud. ' +
            'Use "datajud_monitorar_lista" com os números dos processos, ' +
            'ou acesse diretamente o PJe/eProc do tribunal.',
          alternativas: {
            TJPI:  'https://pje.tjpi.jus.br — consulta por advogado (OAB/PI 7304-A)',
            TJCE:  'https://eproc.tjce.jus.br — pesquisa por OAB/CE 22502',
            TJMA:  'https://pje.tjma.jus.br — pesquisa por OAB/MA 29037',
            TRF1:  'https://pje1g.trf1.jus.br — pesquisa por OAB',
            TRT22: 'https://pje.trt22.jus.br — pesquisa por OAB/PI 7304-A',
          },
        }
        break

      case 'datajud_monitorar_lista':
        if (!params.processos || params.processos.length === 0)
          throw new Error('"processos" é obrigatório: lista de { numero, tribunal }.')
        resultado = await datajudMonitorarLista(params)
        break

      case 'datajud_movimentos':
        if (!params.numero) throw new Error('"numero" é obrigatório.')
        resultado = await datajudMovimentos(params)
        break

      case 'datajud_status':
        resultado = await datajudStatus()
        break

      // ── DJEN ──────────────────────────────────────────────
      case 'djen_listar':
        resultado = await djenListar(params)
        break

      case 'djen_marcar_ciencia':
        if (!params.idComunicacao) throw new Error('"idComunicacao" é obrigatório.')
        resultado = await djenMarcarCiencia(params)
        break

      case 'djen_detalhe':
        if (!params.idComunicacao) throw new Error('"idComunicacao" é obrigatório.')
        resultado = await djenDetalhe(params)
        break

      case 'djen_status':
        resultado = await djenStatus()
        break

      default:
        return res.status(400).json({
          error: `Action desconhecida: "${action}".`,
          actions_disponiveis: [
            'datajud_busca_numero','datajud_busca_parte',
            'datajud_movimentos','datajud_status',
            'djen_listar','djen_marcar_ciencia',
            'djen_detalhe','djen_status',
          ],
        })
    }

    return res.status(200).json(resultado)

  } catch (error) {
    console.error(`[CNJ API] Erro em action="${action}":`, error.message)
    return res.status(500).json({
      success: false,
      action,
      error: error.message || 'Erro interno na integração CNJ',
    })
  }
}
