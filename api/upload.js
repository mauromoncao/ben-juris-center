// ============================================================
// BEN JURIS CENTER — Upload Proxy para VPS File Parser
// Rota: POST /api/upload
// Recebe arquivo base64 do frontend, proxies para VPS Parser (porta 3010)
// Retorna: { success, namespace, pages, chunks, rag_ready, preview_text }
// ============================================================

export const config = {
  maxDuration: 120,  // 2 minutos para documentos grandes
  api: {
    bodyParser: {
      sizeLimit: '50mb',  // aceita até 50MB via base64
    },
  },
}

const VPS_PARSER_URL   = process.env.VPS_PARSER_URL    || 'http://181.215.135.202:3010'
const FILE_PARSER_TOKEN = process.env.FILE_PARSER_TOKEN || 'ben-parser-2026'

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const { base64, filename, mimetype, agent_id, index_rag = true, namespace } = req.body

    if (!base64 || !filename) {
      return res.status(400).json({ error: 'base64 e filename são obrigatórios' })
    }

    console.log(`[UPLOAD] Proxying ${filename} (${(base64.length * 0.75 / 1024 / 1024).toFixed(2)}MB) → VPS Parser`)

    // Proxy para o VPS Parser
    const parserRes = await fetch(`${VPS_PARSER_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-parser-token': FILE_PARSER_TOKEN,
      },
      body: JSON.stringify({
        base64,
        filename,
        mimetype: mimetype || '',
        index_rag,
        namespace: namespace || undefined,
        agent_id: agent_id || 'ben-agente-operacional-standard',
      }),
      // Sem timeout aqui — deixa o Vercel timeoutar pelo maxDuration
    })

    if (!parserRes.ok) {
      const errText = await parserRes.text()
      console.error('[UPLOAD] VPS Parser error:', errText)
      
      // Fallback: retorna erro com instruções
      return res.status(503).json({
        success: false,
        error: 'Parser VPS indisponível',
        detail: errText,
        fallback_message: `Arquivo ${filename} recebido mas não pôde ser processado. O servidor de parsing (VPS porta 3010) não está respondendo. Inicie o serviço no VPS com: cd ~/ben-juris-center/vps-file-parser && bash install.sh`,
      })
    }

    const data = await parserRes.json()
    console.log(`[UPLOAD] ✅ ${filename}: ${data.pages}p, ${data.chunks}ch, RAG:${data.rag_ready}`)

    return res.status(200).json({
      success:      true,
      filename:     data.filename,
      mimetype:     data.mimetype,
      size_mb:      data.size_mb,
      pages:        data.pages,
      chars:        data.chars,
      tokens_approx: data.tokens_approx,
      chunks:       data.chunks,
      namespace:    data.namespace,
      indexed:      data.indexed,
      rag_ready:    data.rag_ready,
      preview_text: data.preview_text,
      has_more:     data.has_more,
      full_text:    data.full_text,
      elapsed_ms:   data.elapsed_ms,
      message:      data.message,
    })

  } catch (err) {
    console.error('[UPLOAD] Erro:', err)
    return res.status(500).json({
      success: false,
      error: 'Falha no upload/parsing',
      detail: err.message,
    })
  }
}
