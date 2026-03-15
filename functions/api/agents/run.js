// ============================================================
// BEN JURIS CENTER — CF Pages Function
// Proxy para o Ben Agents Worker (Cloudflare Workers)
// Rota: POST /api/agents/run
// ============================================================
// 
// ESTRATÉGIA: proxy direto para o Worker CF que tem todas as
// chaves de API configuradas como secrets do Worker.
// Mais simples, mais seguro, sem duplicação de chaves.
// ============================================================

const WORKER_URL = 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const body = await request.text()

    // Proxy para o Worker com as mesmas headers
    const workerRes = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Proxied-By': 'ben-juris-center-cf-pages',
        'X-Origin': new URL(request.url).origin,
      },
      body,
    })

    const data = await workerRes.text()

    return new Response(data, {
      status: workerRes.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'X-Proxied-By': 'ben-juris-center',
      },
    })

  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `CF Function proxy error: ${err.message}`,
        proxiedTo: WORKER_URL,
      }),
      {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    )
  }
}

// GET → status
export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: 'online',
      service: 'Ben Juris Center — Agents API Proxy',
      proxyTo: WORKER_URL,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  )
}
