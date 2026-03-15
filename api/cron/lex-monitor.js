// ============================================================
// BEN JURIS CENTER — Cron: lex-monitor
// Schedule: a cada 2 horas (vercel.json: "0 */2 * * *")
// Rota: GET /api/cron/lex-monitor
//
// Responsabilidades:
//   1. Verifica saúde das integrações (DataJud, DJEN, Resend, Pinecone, OpenAI)
//   2. Detecta novas intimações DJEN urgentes e envia alerta por e-mail/WhatsApp
//   3. Monitora o ecosystem ben-ecosystem-ia (ECOSYSTEM_URL)
//   4. Registra métricas de uptime no log (Supabase se configurado)
// ============================================================

export const config = { maxDuration: 30 }

// ── Constantes ───────────────────────────────────────────────
const DATAJUD_BASE    = 'https://api-publica.datajud.cnj.jus.br'
const DATAJUD_APIKEY  = process.env.DATAJUD_API_KEY
  || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
const ECOSYSTEM_URL   = process.env.ECOSYSTEM_URL || 'https://ecosystem.mauromoncao.adv.br'
const RESEND_API_KEY  = process.env.RESEND_API_KEY
const MONITOR_ADMIN_TOKEN = process.env.MONITOR_ADMIN_TOKEN || 'ben_monitor_mauro_2026_secure'

// Suporta múltiplos destinatários separados por vírgula
// Ex: ESCRITORIO_EMAIL=contato@mauromoncao.adv.br,mauro@moncao.adv.br,secretaria@moncao.adv.br
const ESCRITORIO_EMAILS = (process.env.ESCRITORIO_EMAIL ||
  'contato@mauromoncao.adv.br,mauromoncaoadv.escritorio@gmail.com,mauromoncaoestudos@gmail.com')
  .split(',')
  .map(e => e.trim())
  .filter(Boolean)
const PLANTONISTA_WHATSAPP = process.env.PLANTONISTA_WHATSAPP

// ── Checagens individuais ─────────────────────────────────────

// 1. DataJud — teste de conectividade rápido
async function checkDataJud() {
  const start = Date.now()
  try {
    const res = await fetch(`${DATAJUD_BASE}/api_publica_tjpi/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${DATAJUD_APIKEY}`,
      },
      body: JSON.stringify({ query: { match_all: {} }, size: 1 }),
      signal: AbortSignal.timeout(8000),
    })
    return {
      servico:    'datajud',
      status:     res.ok ? 'online' : 'degradado',
      httpStatus: res.status,
      latency_ms: Date.now() - start,
    }
  } catch (e) {
    return { servico: 'datajud', status: 'offline', erro: e.message, latency_ms: Date.now() - start }
  }
}

// 2. DJEN — verifica token se configurado
async function checkDJEN() {
  const DJEN_TOKEN = process.env.DJEN_TOKEN
  const DJEN_CNPJ  = process.env.DJEN_CNPJ
  if (!DJEN_TOKEN) return { servico: 'djen', status: 'nao_configurado', configurado: false }

  const start = Date.now()
  try {
    const params = new URLSearchParams({ pagina: '0', tamanho: '1', ...(DJEN_CNPJ ? { cnpj: DJEN_CNPJ } : {}) })
    const res = await fetch(
      `https://gateway.cloud.pje.jus.br/domicilio-eletronico/api/v1/comunicacoes?${params}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DJEN_TOKEN}` },
        signal: AbortSignal.timeout(8000),
      }
    )
    return {
      servico:     'djen',
      status:      res.ok ? 'online' : res.status === 401 ? 'token_invalido' : 'degradado',
      configurado: true,
      httpStatus:  res.status,
      latency_ms:  Date.now() - start,
    }
  } catch (e) {
    return { servico: 'djen', status: 'offline', configurado: true, erro: e.message, latency_ms: Date.now() - start }
  }
}

// 3. Ecosystem BEN
async function checkEcosystem() {
  const start = Date.now()
  try {
    const res = await fetch(`${ECOSYSTEM_URL}/api/status`, {
      signal: AbortSignal.timeout(8000),
    })
    return {
      servico:    'ecosystem',
      status:     res.ok ? 'online' : 'degradado',
      url:        ECOSYSTEM_URL,
      httpStatus: res.status,
      latency_ms: Date.now() - start,
    }
  } catch (e) {
    return { servico: 'ecosystem', status: 'offline', url: ECOSYSTEM_URL, erro: e.message, latency_ms: Date.now() - start }
  }
}

// 4. OpenAI — validação da chave
async function checkOpenAI() {
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) return { servico: 'openai', status: 'nao_configurado' }

  const start = Date.now()
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
      signal: AbortSignal.timeout(8000),
    })
    return {
      servico:    'openai',
      status:     res.ok ? 'online' : res.status === 401 ? 'chave_invalida' : 'degradado',
      httpStatus: res.status,
      latency_ms: Date.now() - start,
    }
  } catch (e) {
    return { servico: 'openai', status: 'offline', erro: e.message, latency_ms: Date.now() - start }
  }
}

// 5. Anthropic — validação da chave
async function checkAnthropic() {
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return { servico: 'anthropic', status: 'nao_configurado' }

  const start = Date.now()
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(8000),
    })
    return {
      servico:    'anthropic',
      status:     res.ok ? 'online' : res.status === 401 ? 'chave_invalida' : 'degradado',
      httpStatus: res.status,
      latency_ms: Date.now() - start,
    }
  } catch (e) {
    return { servico: 'anthropic', status: 'offline', erro: e.message, latency_ms: Date.now() - start }
  }
}

// ── Detectar intimações urgentes DJEN ────────────────────────
async function detectarIntimacaoUrgente() {
  const DJEN_TOKEN = process.env.DJEN_TOKEN
  const DJEN_CNPJ  = process.env.DJEN_CNPJ
  if (!DJEN_TOKEN) return []

  try {
    const params = new URLSearchParams({
      pagina: '0', tamanho: '20', situacao: 'NAO_LIDA',
      ...(DJEN_CNPJ ? { cnpj: DJEN_CNPJ } : {}),
    })
    const res = await fetch(
      `https://gateway.cloud.pje.jus.br/domicilio-eletronico/api/v1/comunicacoes?${params}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DJEN_TOKEN}` },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    const lista = data?.content || data?.comunicacoes || data || []

    return lista.filter(c => {
      const prazo = c.dataPrazo || c.prazo
      if (!prazo) return false
      const dias = Math.ceil((new Date(prazo) - new Date()) / (1000 * 60 * 60 * 24))
      return dias >= 0 && dias <= 2  // urgentes: prazo em até 2 dias
    }).map(c => ({
      tipo:     c.tipoComunicacao || c.tipo || 'Comunicação',
      processo: c.numeroProcesso  || c.processo || '—',
      tribunal: c.siglaTribunal   || c.tribunal || '—',
      prazo:    c.dataPrazo       || c.prazo,
    }))
  } catch { return [] }
}

// ── Enviar alerta por e-mail ──────────────────────────────────
async function enviarAlertaUrgente(urgentes) {
  if (!RESEND_API_KEY || urgentes.length === 0) return false

  const listagem = urgentes.map(u =>
    `<li><strong>${u.tipo}</strong> — ${u.processo} (${u.tribunal}) — Prazo: <span style="color:#dc2626">${
      u.prazo ? new Date(u.prazo).toLocaleDateString('pt-BR') : '—'
    }</span></li>`
  ).join('')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:    'BEN Juris Center <noreply@mauromoncao.adv.br>',
        to:      ESCRITORIO_EMAILS,
        subject: `🚨 URGENTE — ${urgentes.length} intimação(ões) com prazo em até 2 dias`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#dc2626;color:white;padding:12px 16px;border-radius:8px 8px 0 0">
              <h2 style="margin:0;font-size:18px">🚨 Intimações Urgentes — DJEN</h2>
            </div>
            <div style="border:1px solid #fecaca;padding:16px;border-radius:0 0 8px 8px">
              <p style="color:#374151">As seguintes intimações requerem atenção <strong>imediata</strong>:</p>
              <ul style="color:#374151;line-height:1.8">${listagem}</ul>
              <p style="margin-top:16px">
                <a href="https://juris.mauromoncao.adv.br/cnj" 
                   style="background:#19385C;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px">
                  Acessar BEN Juris Center
                </a>
              </p>
            </div>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(10000),
    })
    return res.ok
  } catch { return false }
}

// ── Handler principal ─────────────────────────────────────────
export default async function handler(req, res) {
  const authHeader = req.headers['authorization'] || ''
  const cronSecret = process.env.CRON_SECRET || ''
  const adminToken = MONITOR_ADMIN_TOKEN

  const isVercelCron = authHeader === `Bearer ${cronSecret}` && cronSecret
  const isAdminCall  = authHeader === `Bearer ${adminToken}`
  const isGetNoAuth  = req.method === 'GET'

  if (!isVercelCron && !isAdminCall && !isGetNoAuth) {
    return res.status(401).json({ error: 'Não autorizado.' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const inicio = Date.now()

  try {
    // Executa todas as checagens em paralelo
    const [datajud, djen, ecosystem, openai, anthropic] = await Promise.all([
      checkDataJud(),
      checkDJEN(),
      checkEcosystem(),
      checkOpenAI(),
      checkAnthropic(),
    ])

    const servicos = [datajud, djen, ecosystem, openai, anthropic]
    const online   = servicos.filter(s => s.status === 'online').length
    const total    = servicos.length

    // Detectar intimações urgentes (DJEN)
    const urgentes         = await detectarIntimacaoUrgente()
    const alertaEnviado    = await enviarAlertaUrgente(urgentes)

    // Status geral
    const statusGeral = online === total ? 'all_online'
                      : online >= total / 2 ? 'partial'
                      : 'degradado'

    return res.status(200).json({
      success:          true,
      cron:             'lex-monitor',
      timestamp:        new Date().toISOString(),
      duracao_ms:       Date.now() - inicio,
      statusGeral,
      online,
      total,
      servicos,
      djen: {
        intimacoesUrgentes: urgentes.length,
        alertaEnviado,
        urgentes,
      },
    })

  } catch (error) {
    console.error('[lex-monitor] Erro crítico:', error.message)
    return res.status(500).json({
      success:    false,
      cron:       'lex-monitor',
      error:      error.message,
      duracao_ms: Date.now() - inicio,
    })
  }
}
