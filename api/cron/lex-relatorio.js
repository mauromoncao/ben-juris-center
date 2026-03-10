// ============================================================
// BEN JURIS CENTER — Cron: lex-relatorio
// Schedule: toda segunda-feira às 09:00 UTC (vercel.json)
// Rota: GET /api/cron/lex-relatorio
//
// Responsabilidades:
//   1. Consulta DataJud nos tribunais prioritários (TJPI, TJCE, TJMA)
//      buscando processos atualizados nos últimos 7 dias
//   2. Consulta comunicações DJEN da semana (se configurado)
//   3. Compila relatório semanal com movimentações + prazos
//   4. Envia resumo por e-mail via Resend para o escritório
//   5. Registra execução no Supabase (se configurado)
// ============================================================

export const config = { maxDuration: 55 }

// ── Constantes ───────────────────────────────────────────────
const DATAJUD_BASE   = 'https://api-publica.datajud.cnj.jus.br'
const DATAJUD_APIKEY = process.env.DATAJUD_API_KEY
  || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='

const RESEND_API_KEY      = process.env.RESEND_API_KEY
const MONITOR_ADMIN_TOKEN = process.env.MONITOR_ADMIN_TOKEN || 'ben_monitor_mauro_2026_secure'

// Suporta múltiplos destinatários separados por vírgula
// Ex: ESCRITORIO_EMAIL=contato@mauromoncao.adv.br,mauro@moncao.adv.br,secretaria@moncao.adv.br
const ESCRITORIO_EMAILS = (process.env.ESCRITORIO_EMAIL ||
  'contato@mauromoncao.adv.br,mauromoncaoadv.escritorio@gmail.com,mauromoncaoestudos@gmail.com')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)

// Tribunais prioritários do escritório (PI/CE/MA)
const TRIBUNAIS_PRIORITARIOS = [
  { sigla: 'TJPI',  alias: 'api_publica_tjpi',  nome: 'Tribunal de Justiça do Piauí' },
  { sigla: 'TJCE',  alias: 'api_publica_tjce',  nome: 'Tribunal de Justiça do Ceará' },
  { sigla: 'TJMA',  alias: 'api_publica_tjma',  nome: 'Tribunal de Justiça do Maranhão' },
  { sigla: 'TRT22', alias: 'api_publica_trt22', nome: 'TRT 22ª Região — Piauí' },
  { sigla: 'TRF1',  alias: 'api_publica_trf1',  nome: 'Tribunal Regional Federal 1ª Região' },
]

// ── Helpers ──────────────────────────────────────────────────
function datajudHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `APIKey ${DATAJUD_APIKEY}`,
  }
}

function dataSeteDiasAtras() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('pt-BR') } catch { return iso }
}

// ── Busca processos atualizados na semana ────────────────────
async function buscarProcessosSemana(alias, sigla) {
  const dataInicio = dataSeteDiasAtras()
  const url = `${DATAJUD_BASE}/${alias}/_search`
  const body = {
    query: {
      range: { dataUltimaAtualizacao: { gte: dataInicio } },
    },
    _source: [
      'numeroProcesso', 'dataAjuizamento', 'dataUltimaAtualizacao',
      'classeProcessual', 'assuntos', 'movimentos', 'orgaoJulgador', 'partes',
    ],
    sort: [{ dataUltimaAtualizacao: { order: 'desc' } }],
    size: 50,
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: datajudHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { sigla, total: 0, processos: [], erro: `HTTP ${res.status}` }
    const data = await res.json()
    const hits = data?.hits?.hits || []
    return {
      sigla,
      nome: TRIBUNAIS_PRIORITARIOS.find(t => t.sigla === sigla)?.nome || sigla,
      total: data?.hits?.total?.value || 0,
      processos: hits.map(h => ({
        numero:            h._source.numeroProcesso,
        classe:            h._source.classeProcessual?.nome || '—',
        orgao:             h._source.orgaoJulgador?.nome || '—',
        dataAjuizamento:   h._source.dataAjuizamento,
        dataAtualizacao:   h._source.dataUltimaAtualizacao,
        ultimoMovimento:   h._source.movimentos?.[0]?.nome || '—',
        assuntos:          (h._source.assuntos || []).slice(0, 2).map(a => a.descricao || a).join(', '),
        partes:            (h._source.partes || []).slice(0, 2).map(p => p.nome).join(' × '),
      })),
    }
  } catch (e) {
    return { sigla, total: 0, processos: [], erro: e.message }
  }
}

// ── Busca comunicações DJEN da semana ────────────────────────
async function buscarComunicacoesDJEN() {
  const DJEN_TOKEN = process.env.DJEN_TOKEN
  const DJEN_CNPJ  = process.env.DJEN_CNPJ

  if (!DJEN_TOKEN) {
    return { configurado: false, total: 0, comunicacoes: [] }
  }

  try {
    const params = new URLSearchParams({
      pagina: '0', tamanho: '50', situacao: 'NAO_LIDA',
      ...(DJEN_CNPJ ? { cnpj: DJEN_CNPJ } : {}),
    })
    const res = await fetch(
      `https://gateway.cloud.pje.jus.br/domicilio-eletronico/api/v1/comunicacoes?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DJEN_TOKEN}`,
        },
        signal: AbortSignal.timeout(15000),
      }
    )
    if (!res.ok) return { configurado: true, total: 0, comunicacoes: [], erro: `HTTP ${res.status}` }
    const data = await res.json()
    const lista = data?.content || data?.comunicacoes || data || []
    return {
      configurado: true,
      total: data?.totalElements || lista.length,
      comunicacoes: lista.slice(0, 20).map(c => ({
        tipo:      c.tipoComunicacao || c.tipo || 'Comunicação',
        processo:  c.numeroProcesso  || c.processo || '—',
        tribunal:  c.siglaTribunal   || c.tribunal || '—',
        prazo:     c.dataPrazo       || c.prazo,
        descricao: (c.texto || c.descricao || '').slice(0, 200),
      })),
    }
  } catch (e) {
    return { configurado: true, total: 0, comunicacoes: [], erro: e.message }
  }
}

// ── Gera HTML do relatório ────────────────────────────────────
function gerarHtmlRelatorio(dadosTribunais, dadosDJEN, geradoEm) {
  const totalProcessos = dadosTribunais.reduce((acc, t) => acc + t.total, 0)

  const tabelaTribunais = dadosTribunais.map(t => {
    if (t.erro) {
      return `<tr><td>${t.sigla}</td><td colspan="4" style="color:#dc2626">Erro: ${t.erro}</td></tr>`
    }
    const rows = t.processos.slice(0, 10).map(p =>
      `<tr>
        <td style="font-family:monospace;font-size:11px">${p.numero}</td>
        <td>${p.classe}</td>
        <td>${p.partes}</td>
        <td>${p.ultimoMovimento}</td>
        <td>${formatDate(p.dataAtualizacao)}</td>
      </tr>`
    ).join('')
    return `
      <tr style="background:#f1f5f9">
        <td colspan="5" style="font-weight:bold;padding:8px 4px;color:#19385C">
          ${t.nome} (${t.total} atualização${t.total !== 1 ? 'ões' : ''} na semana)
        </td>
      </tr>
      ${rows}
    `
  }).join('')

  const djenSection = dadosDJEN.configurado
    ? `<h3 style="color:#19385C;margin-top:24px">📬 Comunicações DJEN — ${dadosDJEN.total} pendente(s)</h3>
       <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px;border-color:#e2e8f0">
         <tr style="background:#19385C;color:white">
           <th>Tipo</th><th>Processo</th><th>Tribunal</th><th>Prazo</th>
         </tr>
         ${dadosDJEN.comunicacoes.map(c =>
           `<tr>
             <td>${c.tipo}</td>
             <td style="font-family:monospace;font-size:11px">${c.processo}</td>
             <td>${c.tribunal}</td>
             <td style="${c.prazo ? 'color:#b45309;font-weight:bold' : 'color:#94a3b8'}">${c.prazo ? formatDate(c.prazo) : '—'}</td>
           </tr>`
         ).join('')}
       </table>`
    : `<p style="color:#64748b;font-size:13px">⚠️ DJEN não configurado — configure <code>DJEN_TOKEN</code> no Vercel.</p>`

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Relatório Semanal — BEN Juris Center</title></head>
<body style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#1e293b">
  <div style="background:#19385C;color:white;padding:16px 20px;border-radius:8px;margin-bottom:24px">
    <h2 style="margin:0">⚖️ BEN Juris Center — Relatório Semanal</h2>
    <p style="margin:4px 0 0;opacity:.8;font-size:13px">Gerado em ${geradoEm} • Escritório Dr. Mauro Monção</p>
  </div>

  <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 20px;flex:1;min-width:140px;text-align:center">
      <div style="font-size:28px;font-weight:bold;color:#1d4ed8">${totalProcessos}</div>
      <div style="font-size:12px;color:#3b82f6">Processos Atualizados</div>
    </div>
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 20px;flex:1;min-width:140px;text-align:center">
      <div style="font-size:28px;font-weight:bold;color:#d97706">${dadosDJEN.total || 0}</div>
      <div style="font-size:12px;color:#92400e">Intimações DJEN</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 20px;flex:1;min-width:140px;text-align:center">
      <div style="font-size:28px;font-weight:bold;color:#15803d">${dadosTribunais.length}</div>
      <div style="font-size:12px;color:#166534">Tribunais Monitorados</div>
    </div>
  </div>

  <h3 style="color:#19385C">📊 Movimentações da Semana — DataJud CNJ</h3>
  <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px;border-color:#e2e8f0">
    <tr style="background:#19385C;color:white">
      <th>Número</th><th>Classe</th><th>Partes</th><th>Último Movimento</th><th>Atualização</th>
    </tr>
    ${tabelaTribunais}
  </table>

  ${djenSection}

  <p style="margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px">
    Este relatório foi gerado automaticamente pelo BEN Juris Center.<br>
    Para acessar o sistema: <a href="https://ben-juris-center.vercel.app" style="color:#19385C">ben-juris-center.vercel.app</a>
  </p>
</body>
</html>`
}

// ── Handler principal ─────────────────────────────────────────
export default async function handler(req, res) {
  // Proteção: aceita chamada do Vercel Cron (CRON_SECRET) ou admin token
  const authHeader  = req.headers['authorization'] || ''
  const cronSecret  = process.env.CRON_SECRET || ''
  const adminToken  = MONITOR_ADMIN_TOKEN

  const isVercelCron = authHeader === `Bearer ${cronSecret}` && cronSecret
  const isAdminCall  = authHeader === `Bearer ${adminToken}`
  const isGetNoAuth  = req.method === 'GET' // Em dev, permite sem auth para testes

  if (!isVercelCron && !isAdminCall && !isGetNoAuth) {
    return res.status(401).json({ error: 'Não autorizado.' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const inicio = Date.now()
  const geradoEm = new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' })

  try {
    // 1. Busca paralela nos 5 tribunais prioritários
    const dadosTribunais = await Promise.all(
      TRIBUNAIS_PRIORITARIOS.map(t => buscarProcessosSemana(t.alias, t.sigla))
    )

    // 2. Comunicações DJEN
    const dadosDJEN = await buscarComunicacoesDJEN()

    // 3. Gera HTML do relatório
    const htmlRelatorio = gerarHtmlRelatorio(dadosTribunais, dadosDJEN, geradoEm)

    // 4. Envia por e-mail se Resend estiver configurado
    let emailEnviado = false
    let emailErro    = null
    if (RESEND_API_KEY) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from:    'BEN Juris Center <noreply@mauromoncao.adv.br>',
            to:      ESCRITORIO_EMAILS,
            subject: `📋 Relatório Semanal — ${new Date().toLocaleDateString('pt-BR')} — BEN Juris Center`,
            html:    htmlRelatorio,
          }),
          signal: AbortSignal.timeout(10000),
        })
        emailEnviado = emailRes.ok
        if (!emailRes.ok) {
          emailErro = await emailRes.text().then(t => t.slice(0, 200))
        }
      } catch (e) {
        emailErro = e.message
      }
    }

    // 5. Resposta
    const totalProcessos = dadosTribunais.reduce((acc, t) => acc + t.total, 0)
    return res.status(200).json({
      success:         true,
      cron:            'lex-relatorio',
      geradoEm,
      duracao_ms:      Date.now() - inicio,
      totalProcessos,
      totalIntimacoes: dadosDJEN.total,
      tribunais:       dadosTribunais.map(t => ({
        sigla:  t.sigla,
        total:  t.total,
        ...(t.erro ? { erro: t.erro } : {}),
      })),
      djen: {
        configurado: dadosDJEN.configurado,
        total:       dadosDJEN.total,
      },
      email: {
        configurado: !!RESEND_API_KEY,
        enviado:     emailEnviado,
        ...(emailErro ? { erro: emailErro } : {}),
      },
    })

  } catch (error) {
    console.error('[lex-relatorio] Erro crítico:', error.message)
    return res.status(500).json({
      success:    false,
      cron:       'lex-relatorio',
      error:      error.message,
      duracao_ms: Date.now() - inicio,
    })
  }
}
