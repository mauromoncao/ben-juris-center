// ============================================================
// BEN KNOWLEDGE BASE — API Gateway (Cloudflare Pages Function)
// Rota: /api/knowledge/*
// Orquestra: R2 storage, VPS Parser, Pinecone, Google Drive sync
// Versão: 1.0.0 — 2026-03-15
// ============================================================

const VPS_PARSER_URL    = process.env.VPS_PARSER_URL    || 'http://181.215.135.202:3010'
const FILE_PARSER_TOKEN = process.env.FILE_PARSER_TOKEN || 'ben-parser-2026'
const PINECONE_KEY      = process.env.PINECONE_API_KEY  || ''
const PINECONE_HOST     = process.env.PINECONE_INDEX_HOST || ''
const OPENAI_KEY        = process.env.OPENAI_API_KEY    || ''
const VPS_KB_TOKEN      = process.env.VPS_KB_TOKEN      || 'ben-kb-2026'

// ── CORS Helper ───────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-kb-token')
}

// ── Embedding via OpenAI ──────────────────────────────────
async function getEmbedding(text) {
  if (!OPENAI_KEY) return null
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
        dimensions: 1536,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data?.[0]?.embedding || null
  } catch { return null }
}

// ── Pinecone Query ────────────────────────────────────────
async function pineconeQuery({ query, namespace, topK = 8, filter = {} }) {
  if (!PINECONE_KEY || !PINECONE_HOST) return []

  const embedding = await getEmbedding(query)
  if (!embedding) return []

  const body = {
    vector: embedding,
    topK,
    includeMetadata: true,
  }
  if (namespace) body.namespace = namespace
  if (Object.keys(filter).length > 0) body.filter = filter

  try {
    const res = await fetch(`${PINECONE_HOST}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PINECONE_KEY,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.matches || []
  } catch { return [] }
}

// ── Pinecone Stats ────────────────────────────────────────
async function pineconeStats(namespace) {
  if (!PINECONE_KEY || !PINECONE_HOST) return null
  try {
    const body = namespace ? { filter: { namespace: { '$eq': namespace } } } : {}
    const res = await fetch(`${PINECONE_HOST}/describe_index_stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// ── VPS Proxy ─────────────────────────────────────────────
async function vpsRequest(path, body) {
  const res = await fetch(`${VPS_PARSER_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-parser-token': FILE_PARSER_TOKEN,
    },
    body: JSON.stringify(body),
  })
  return res
}

// ════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ════════════════════════════════════════════════════════
export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const url  = new URL(req.url, `https://juris.mauromoncao.adv.br`)
  const path = url.pathname.replace('/api/knowledge', '')

  // ── POST /api/knowledge/search ────────────────────────
  // Busca semântica unificada em todo o acervo
  if (req.method === 'POST' && path === '/search') {
    try {
      const {
        query,
        namespace,       // se omitido: busca em todo o acervo
        category,        // 'processos' | 'biblioteca' | 'contratos' | 'jurisprudencias'
        topK = 10,
        date_from,
        date_to,
      } = req.body

      if (!query) return res.status(400).json({ error: 'query é obrigatório' })

      // Monta filtro Pinecone
      const filter = {}
      if (category) filter.category = { '$eq': category }
      if (date_from || date_to) {
        filter.created_at = {}
        if (date_from) filter.created_at['$gte'] = date_from
        if (date_to)   filter.created_at['$lte'] = date_to
      }

      const matches = await pineconeQuery({
        query,
        namespace: namespace || undefined,
        topK,
        filter: Object.keys(filter).length > 0 ? filter : {},
      })

      // Agrupa por documento (filename)
      const docMap = {}
      for (const m of matches) {
        const fname = m.metadata?.filename || 'desconhecido'
        if (!docMap[fname]) {
          docMap[fname] = {
            filename:   fname,
            namespace:  m.metadata?.namespace || namespace,
            category:   m.metadata?.category || 'geral',
            client_id:  m.metadata?.client_id,
            process_id: m.metadata?.process_id,
            source:     m.metadata?.source || 'upload',
            created_at: m.metadata?.created_at,
            score:      m.score,
            excerpts:   [],
          }
        }
        if (m.score > 0.35) {
          docMap[fname].excerpts.push({
            text:  m.metadata?.text?.slice(0, 400),
            score: m.score,
          })
        }
        // Mantém score máximo
        if (m.score > docMap[fname].score) docMap[fname].score = m.score
      }

      const results = Object.values(docMap)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)

      return res.status(200).json({
        success:     true,
        query,
        total:       results.length,
        results,
        pinecone_ok: !!(PINECONE_KEY && PINECONE_HOST),
      })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── POST /api/knowledge/upload ────────────────────────
  // Envia arquivo para VPS Parser + indexa no Pinecone
  // Body: { base64, filename, mimetype, category, client_id?, process_id?, tags? }
  if (req.method === 'POST' && path === '/upload') {
    try {
      const {
        base64,
        filename,
        mimetype,
        category = 'geral',    // processos | biblioteca | contratos | jurisprudencias | geral
        client_id,
        process_id,
        tags = [],
        source = 'upload',
      } = req.body

      if (!base64 || !filename) {
        return res.status(400).json({ error: 'base64 e filename são obrigatórios' })
      }

      // Monta namespace semântico
      let namespace = `kb-${category}`
      if (client_id)  namespace = `kb-cliente-${client_id}`
      if (process_id) namespace = `kb-processo-${process_id.replace(/[^a-z0-9]/gi, '_')}`

      // Envia para VPS Parser
      const parserRes = await vpsRequest('/extract', {
        base64,
        filename,
        mimetype: mimetype || '',
        index_rag: true,
        namespace,
        agent_id: 'ben-knowledge-base',
        metadata: {
          category,
          client_id:  client_id  || null,
          process_id: process_id || null,
          tags:       tags.join(','),
          source,
          added_by: 'ben-kb-api',
        },
      })

      if (!parserRes.ok) {
        const errText = await parserRes.text()
        return res.status(503).json({
          success: false,
          error: 'VPS Parser indisponível',
          detail: errText,
        })
      }

      const data = await parserRes.json()

      return res.status(200).json({
        success:    true,
        filename,
        category,
        namespace,
        client_id,
        process_id,
        pages:      data.pages,
        chunks:     data.chunks,
        indexed:    data.indexed,
        rag_ready:  data.rag_ready,
        preview:    data.preview_text?.slice(0, 300),
        message:    `✅ ${filename} indexado — ${data.chunks} chunks em "${namespace}"`,
      })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── POST /api/knowledge/bulk-index ───────────────────
  // Indexa lista de arquivos em lote (migração HD/Drive)
  // Body: { files: [{ base64, filename, mimetype, category, client_id, process_id }] }
  if (req.method === 'POST' && path === '/bulk-index') {
    try {
      const { files = [] } = req.body

      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'files[] é obrigatório e deve ser um array' })
      }

      const results = []
      let success = 0, failed = 0

      for (const file of files) {
        try {
          const category  = file.category  || 'geral'
          const client_id  = file.client_id
          const process_id = file.process_id

          let namespace = `kb-${category}`
          if (client_id)  namespace = `kb-cliente-${client_id}`
          if (process_id) namespace = `kb-processo-${process_id.replace(/[^a-z0-9]/gi, '_')}`

          const parserRes = await vpsRequest('/extract', {
            base64:    file.base64,
            filename:  file.filename,
            mimetype:  file.mimetype || '',
            index_rag: true,
            namespace,
            agent_id:  'ben-bulk-indexer',
            metadata: {
              category,
              client_id:  client_id || null,
              process_id: process_id || null,
              source: 'bulk_import',
            },
          })

          if (parserRes.ok) {
            const data = await parserRes.json()
            results.push({
              filename:  file.filename,
              status:    'ok',
              namespace,
              chunks:    data.chunks,
              indexed:   data.indexed,
            })
            success++
          } else {
            results.push({ filename: file.filename, status: 'error', error: await parserRes.text() })
            failed++
          }
        } catch (e) {
          results.push({ filename: file.filename, status: 'error', error: e.message })
          failed++
        }

        // Pausa entre arquivos
        await new Promise(r => setTimeout(r, 300))
      }

      return res.status(200).json({
        success: true,
        total:   files.length,
        indexed: success,
        failed,
        results,
      })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── GET /api/knowledge/stats ──────────────────────────
  // Estatísticas do acervo (total de docs, chunks por categoria)
  if (req.method === 'GET' && path === '/stats') {
    try {
      const stats = await pineconeStats()

      const namespaceStats = stats?.namespaces || {}
      const categories = {
        processos:       0,
        biblioteca:      0,
        contratos:       0,
        jurisprudencias: 0,
        geral:           0,
        clientes:        0,
      }

      for (const [ns, info] of Object.entries(namespaceStats)) {
        const count = info.vectorCount || 0
        if (ns.startsWith('kb-processo'))      categories.processos += count
        else if (ns.startsWith('kb-biblioteca'))categories.biblioteca += count
        else if (ns.startsWith('kb-contratos')) categories.contratos += count
        else if (ns.startsWith('kb-jurisprud')) categories.jurisprudencias += count
        else if (ns.startsWith('kb-cliente'))   categories.clientes += count
        else categories.geral += count
      }

      const totalVectors = stats?.totalVectorCount || 0
      const totalDocs    = Math.ceil(totalVectors / 8) // estimativa: ~8 chunks/doc

      return res.status(200).json({
        success:        true,
        pinecone_ok:    !!(PINECONE_KEY && PINECONE_HOST),
        total_vectors:  totalVectors,
        total_docs_est: totalDocs,
        categories,
        namespaces:     Object.keys(namespaceStats).length,
        raw_stats:      stats,
      })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── GET /api/knowledge/namespaces ────────────────────
  // Lista todos os namespaces (= todos os conjuntos de documentos)
  if (req.method === 'GET' && path === '/namespaces') {
    try {
      const stats = await pineconeStats()
      const ns    = stats?.namespaces || {}

      const list = Object.entries(ns).map(([name, info]) => {
        let type = 'geral'
        let label = name
        if (name.startsWith('kb-processo-')) {
          type  = 'processo'
          label = name.replace('kb-processo-', '').replace(/_/g, '.')
        } else if (name.startsWith('kb-cliente-')) {
          type  = 'cliente'
          label = name.replace('kb-cliente-', '')
        } else if (name.startsWith('kb-')) {
          type  = name.replace('kb-', '')
          label = type.charAt(0).toUpperCase() + type.slice(1)
        }
        return {
          namespace:    name,
          type,
          label,
          vector_count: info.vectorCount || 0,
          docs_est:     Math.ceil((info.vectorCount || 0) / 8),
        }
      }).sort((a, b) => b.vector_count - a.vector_count)

      return res.status(200).json({ success: true, total: list.length, namespaces: list })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── DELETE /api/knowledge/namespace ──────────────────
  // Remove namespace do Pinecone
  if (req.method === 'DELETE' && path === '/namespace') {
    try {
      const { namespace } = req.body
      if (!namespace) return res.status(400).json({ error: 'namespace é obrigatório' })

      const res2 = await fetch(`${PINECONE_HOST}/vectors/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
        body: JSON.stringify({ deleteAll: true, namespace }),
      })

      return res.status(200).json({ success: res2.ok, namespace })

    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // ── GET /api/knowledge/health ─────────────────────────
  if (req.method === 'GET' && path === '/health') {
    let vpsOk = false
    try {
      const r = await fetch(`${VPS_PARSER_URL}/health`, { signal: AbortSignal.timeout(3000) })
      vpsOk = r.ok
    } catch {}

    return res.status(200).json({
      success:     true,
      service:     'BEN Knowledge Base',
      version:     '1.0.0',
      vps_parser:  vpsOk ? 'online' : 'offline',
      pinecone:    !!(PINECONE_KEY && PINECONE_HOST) ? 'configured' : 'not_configured',
      openai:      !!OPENAI_KEY ? 'configured' : 'not_configured',
      timestamp:   new Date().toISOString(),
    })
  }

  return res.status(404).json({ error: `Rota não encontrada: ${path}` })
}
