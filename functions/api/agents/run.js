// ============================================================
// BEN JURIS CENTER — CF Pages Function Adapter
// Converte o handler Vercel para Cloudflare Workers format
// Rota: /api/agents/run (POST)
// ============================================================

// Importa o handler original (Vercel format)
import handler from '../../api/agents/run.js'

export async function onRequestPost(context) {
  const { request, env } = context

  // ── Injetar env vars como process.env (para compatibilidade) ──
  if (typeof process === 'undefined') {
    globalThis.process = { env: {} }
  }
  
  // Mapear CF env → process.env
  const envKeys = [
    'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY',
    'PINECONE_API_KEY', 'PINECONE_INDEX_HOST', 'GEMINI_API_KEY',
    'VPS_LEADS_URL', 'DB_TOKEN', 'JWT_SECRET', 'MONITOR_ADMIN_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_TOKEN', 'PLANTONISTA_WHATSAPP',
    'ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ESCRITORIO_EMAIL',
    'RESEND_API_KEY', 'ASAAS_API_KEY', 'DATAJUD_API_KEY',
    'DJEN_TOKEN', 'DJEN_CNPJ', 'CRON_SECRET', 'ECOSYSTEM_URL',
    'SUPABASE_REST_URL', 'SUPABASE_ANON_KEY',
  ]
  for (const key of envKeys) {
    if (env[key]) process.env[key] = env[key]
  }

  // ── Construir objeto req compatível Vercel ─────────────────
  let body = {}
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const req = {
    method: 'POST',
    headers: Object.fromEntries(request.headers.entries()),
    body,
    query: {},
  }

  // ── Construir objeto res compatível Vercel ─────────────────
  let statusCode = 200
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  let responseBody = null

  const res = {
    status(code) {
      statusCode = code
      return res
    },
    setHeader(name, value) {
      responseHeaders[name] = value
      return res
    },
    json(data) {
      responseBody = JSON.stringify(data)
      return res
    },
    end() {
      return res
    },
  }

  // ── Executar handler original ──────────────────────────────
  await handler(req, res)

  return new Response(responseBody || '{}', {
    status: statusCode,
    headers: responseHeaders,
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}
