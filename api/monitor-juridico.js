// ============================================================
// BEN MONITOR JURÍDICO — API Orquestradora
// Rota: POST /api/monitor-juridico
// Orquestra: Escavador DJe + DataJud CNJ + IA (Claude Sonnet)
// ============================================================

export const config = { maxDuration: 60 }

const JURIS_API  = 'https://juris.mauromoncao.adv.br'
const ESCAVADOR_TOKEN = process.env.ESCAVADOR_TOKEN || process.env.VITE_ESCAVADOR_TOKEN
const DATAJUD_BASE    = 'https://api-publica.datajud.cnj.jus.br'
const DATAJUD_KEY     = process.env.DATAJUD_API_KEY
  || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

// ── Identificadores do escritório ───────────────────────────
const ESCRITORIO = {
  nomes:  ['Mauro Monção da Silva', 'Mauro Moncao da Silva'],
  oabs:   [
    { sigla: 'OAB/PI', numero: '7304-A',  query: 'OAB PI 7304'  },
    { sigla: 'OAB/CE', numero: '22.502',  query: 'OAB CE 22502' },
    { sigla: 'OAB/MA', numero: '29037-A', query: 'OAB MA 29037' },
  ],
}

// ── Mapa tribunal ────────────────────────────────────────────
const TRIBUNAL_MAP = {
  TJPI: 'api_publica_tjpi', TJCE: 'api_publica_tjce', TJMA: 'api_publica_tjma',
  STJ:  'api_publica_stj',  STM:  'api_publica_stm',  TST:  'api_publica_tst',
  TRF1: 'api_publica_trf1', TRF2: 'api_publica_trf2', TRF3: 'api_publica_trf3',
  TRF4: 'api_publica_trf4', TRF5: 'api_publica_trf5',
  TJSP: 'api_publica_tjsp', TJRJ: 'api_publica_tjrj', TJDF: 'api_publica_tjdf',
}

// ── CORS ─────────────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

// ── Escavador: busca DJe ─────────────────────────────────────
async function escavadorBusca(termo, tipo = 'diario') {
  if (!ESCAVADOR_TOKEN) return { itens: [], erro: 'ESCAVADOR_TOKEN não configurado' }
  try {
    const url = new URL('https://api.escavador.com/api/v1/busca')
    url.searchParams.set('q', termo)
    url.searchParams.set('qo', tipo)
    url.searchParams.set('limit', '10')
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${ESCAVADOR_TOKEN}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { itens: [], erro: `Escavador HTTP ${res.status}` }
    const data = await res.json()
    const itens = data.items ?? data.data ?? data.results ?? []
    return { itens, creditos: Number(res.headers.get('Creditos-Utilizados') ?? 0) }
  } catch (e) {
    return { itens: [], erro: e.message }
  }
}

// ── DataJud: movimentações por número de processo ───────────
async function datajudMovimentos(numero, tribunal) {
  try {
    // Detecta tribunal do número CNJ se não informado
    const trib = tribunal?.toUpperCase() || detectarTribunal(numero)
    const alias = trib ? TRIBUNAL_MAP[trib] : null
    if (!alias) return { movimentos: [], erro: `Tribunal ${trib || '?'} não mapeado` }

    const url = `${DATAJUD_BASE}/${alias}/_search`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${DATAJUD_KEY}`,
      },
      body: JSON.stringify({
        query: { match: { 'numeroProcesso': numero.replace(/\D/g, '').replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6') } },
        size: 1,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { movimentos: [], erro: `DataJud HTTP ${res.status}` }
    const data = await res.json()
    const hit = data.hits?.hits?.[0]?._source
    if (!hit) return { movimentos: [], erro: 'Processo não encontrado no DataJud' }
    return {
      processo: {
        numero: hit.numeroProcesso,
        classe: hit.classe?.nome,
        tribunal: hit.tribunal?.nome || trib,
        orgao: hit.orgaoJulgador?.nome,
        dataAjuizamento: hit.dataAjuizamento,
        assuntos: hit.assuntos?.map(a => a.nome),
      },
      movimentos: (hit.movimentos || []).slice(0, 15).map(m => ({
        data: m.dataHora,
        tipo: m.nome,
        complemento: m.complementosTabelados?.[0]?.descricao || m.complemento,
      })),
    }
  } catch (e) {
    return { movimentos: [], erro: e.message }
  }
}

// ── Detectar tribunal a partir do número CNJ ─────────────────
function detectarTribunal(numero) {
  // Formato CNJ: NNNNNNN-DD.AAAA.J.TT.OOOO
  const m = numero?.replace(/\s/g, '').match(/\d{7}-\d{2}\.\d{4}\.(\d)\.(\d{2})/)
  if (!m) return null
  const j = m[1], tt = m[2]
  if (j === '8') { // Justiça Estadual
    const map = { '18': 'TJPI', '06': 'TJCE', '10': 'TJMA', '26': 'TJSP', '19': 'TJRJ' }
    return map[tt] || null
  }
  if (j === '4') { // TRF
    const map = { '01': 'TRF1', '02': 'TRF2', '03': 'TRF3', '04': 'TRF4', '05': 'TRF5' }
    return map[tt] || null
  }
  if (j === '5') return 'TST'
  if (j === '3') return 'STJ'
  return null
}

// ── Chamar agente IA para análise ───────────────────────────
async function analisarComIA(dadosBrutos, clientId) {
  try {
    const res = await fetch(`${JURIS_API}/api/agents/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'ben-monitor-juridico',
        input: JSON.stringify(dadosBrutos, null, 2).slice(0, 8000),
        clientId: clientId || 'escritorio-moncao',
        context: { fonte: 'monitor-juridico', timestamp: new Date().toISOString() },
        useSearch: false,
      }),
      signal: AbortSignal.timeout(55000),
    })
    if (!res.ok) return { analise: null, erro: `IA HTTP ${res.status}` }
    const data = await res.json()
    return { analise: data.output, modelo: data.modelUsed }
  } catch (e) {
    return { analise: null, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method === 'GET' && req.query?.action === 'status') {
    return res.status(200).json({
      ok: true,
      escavador: !!ESCAVADOR_TOKEN,
      datajud: !!DATAJUD_KEY,
      escritorio: ESCRITORIO.oabs.map(o => o.sigla),
      timestamp: new Date().toISOString(),
    })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const {
      action = 'monitorar_tudo',
      numero,          // número CNJ para consulta específica
      tribunal,        // tribunal para consulta específica
      clientId,
      comIA = true,    // se deve chamar Claude para análise
    } = req.body || {}

    // ── ACTION: consultar processo específico ────────────────
    if (action === 'consultar_processo') {
      if (!numero) return res.status(400).json({ error: 'numero é obrigatório' })
      const resultado = await datajudMovimentos(numero, tribunal)
      if (comIA && (resultado.movimentos?.length > 0)) {
        const { analise, modelo } = await analisarComIA({
          acao: 'analise_processo',
          processo: resultado.processo,
          movimentos: resultado.movimentos,
        }, clientId)
        return res.status(200).json({ success: true, ...resultado, analise, modelo_ia: modelo })
      }
      return res.status(200).json({ success: true, ...resultado })
    }

    // ── ACTION: monitorar DJe ─────────────────────────────────
    if (action === 'monitorar_dje') {
      const buscas = [
        ...ESCRITORIO.nomes.map(n => escavadorBusca(n, 'diario')),
        ...ESCRITORIO.oabs.map(o => escavadorBusca(o.query, 'diario')),
      ]
      const resultados = await Promise.allSettled(buscas)
      const itens = [], erros = []
      resultados.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          if (r.value.erro) erros.push(r.value.erro)
          else itens.push(...r.value.itens.map(item => ({ ...item, _termo: i < 2 ? ESCRITORIO.nomes[i] : ESCRITORIO.oabs[i-2]?.sigla })))
        }
      })
      // Deduplica por id
      const unicos = [...new Map(itens.map(i => [i.id || JSON.stringify(i), i])).values()]
      return res.status(200).json({ success: true, fonte: 'escavador-dje', total: unicos.length, itens: unicos, erros })
    }

    // ── ACTION: monitorar_tudo (DJe + Processos) ─────────────
    if (action === 'monitorar_tudo') {
      const inicio = Date.now()

      // Busca paralela: DJe + Processos por todos os identificadores
      const [djeResults, processoResults] = await Promise.allSettled([
        Promise.allSettled([
          ...ESCRITORIO.nomes.map(n => escavadorBusca(n, 'diario')),
          ...ESCRITORIO.oabs.map(o => escavadorBusca(o.query, 'diario')),
        ]),
        Promise.allSettled([
          ...ESCRITORIO.nomes.map(n => escavadorBusca(n, 'processo')),
          ...ESCRITORIO.oabs.map(o => escavadorBusca(o.query, 'processo')),
        ]),
      ])

      // Agrega resultados DJe
      const itensDje = [], errosDje = []
      if (djeResults.status === 'fulfilled') {
        djeResults.value.forEach(r => {
          if (r.status === 'fulfilled') {
            if (r.value.erro) errosDje.push(r.value.erro)
            else itensDje.push(...r.value.itens)
          }
        })
      }

      // Agrega resultados Processos
      const itensProcesso = [], errosProcesso = []
      if (processoResults.status === 'fulfilled') {
        processoResults.value.forEach(r => {
          if (r.status === 'fulfilled') {
            if (r.value.erro) errosProcesso.push(r.value.erro)
            else itensProcesso.push(...r.value.itens)
          }
        })
      }

      // Deduplica
      const djeFinal = [...new Map(itensDje.map(i => [i.id || JSON.stringify(i), i])).values()]
      const processoFinal = [...new Map(itensProcesso.map(i => [i.id || JSON.stringify(i), i])).values()]

      const dadosBrutos = {
        acao: 'monitoramento_completo',
        timestamp: new Date().toISOString(),
        escritorio: { nomes: ESCRITORIO.nomes, oabs: ESCRITORIO.oabs.map(o => `${o.sigla} ${o.numero}`) },
        dje: { total: djeFinal.length, itens: djeFinal.slice(0, 20) },
        processos: { total: processoFinal.length, itens: processoFinal.slice(0, 20) },
      }

      // Análise IA
      let analise = null, modeloIA = null
      if (comIA && (djeFinal.length + processoFinal.length > 0)) {
        const iaResult = await analisarComIA(dadosBrutos, clientId)
        analise = iaResult.analise
        modeloIA = iaResult.modelo
      } else if (comIA) {
        analise = '✅ Nenhuma publicação encontrada para os identificadores do escritório no período consultado.'
      }

      return res.status(200).json({
        success: true,
        elapsed_ms: Date.now() - inicio,
        dje: { total: djeFinal.length, itens: djeFinal, erros: errosDje },
        processos: { total: processoFinal.length, itens: processoFinal, erros: errosProcesso },
        analise,
        modelo_ia: modeloIA,
        fontes: {
          escavador: !!ESCAVADOR_TOKEN,
          datajud: !!DATAJUD_KEY,
          identificadores: [...ESCRITORIO.nomes, ...ESCRITORIO.oabs.map(o => o.query)],
        },
      })
    }

    return res.status(400).json({ error: `action '${action}' desconhecida` })

  } catch (error) {
    console.error('[Monitor Jurídico] Erro:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
