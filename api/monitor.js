// ============================================================
// BEN ECOSYSTEM IA — Monitor de Custos de Tokens v1.0
// Rota: GET|POST /api/monitor
// Acesso: RESTRITO — apenas Dr. Mauro (token admin)
// ============================================================

export const config = { maxDuration: 15 }

const ADMIN_TOKEN = (process.env.MONITOR_ADMIN_TOKEN || 'ben_monitor_mauro_2026_secure').trim()
const ECOSYSTEM_MONITOR_URL = (process.env.ECOSYSTEM_URL || 'https://ben-ecosystem-ia.vercel.app').trim()

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Monitor-Token')
}

function checkAuth(req) {
  const authHeader = req.headers['authorization'] || req.headers['x-monitor-token'] || ''
  return authHeader.includes(ADMIN_TOKEN) || (req.query?.token === ADMIN_TOKEN)
}

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!checkAuth(req)) {
    return res.status(401).json({
      error: 'Acesso restrito — Monitor Administrativo BEN Juris Center',
      hint: 'Forneça X-Monitor-Token no header ou ?token=... na URL',
    })
  }

  try {
    const action = req.query?.action || 'stats'
    const token  = ADMIN_TOKEN

    const upstreamUrl = `${ECOSYSTEM_MONITOR_URL}/api/monitor?action=${action}&token=${token}`
    const r = await fetch(upstreamUrl, { signal: AbortSignal.timeout(8000) })

    if (r.ok) {
      const data = await r.json()
      return res.status(200).json({ ...data, relayedFrom: 'juris-center' })
    }

    return res.status(r.status).json({ error: 'Falha ao consultar monitor principal', status: r.status })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
