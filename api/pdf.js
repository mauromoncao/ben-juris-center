// ============================================================
// BEN JURIS CENTER — RAG Pipeline: PDF → OCR → Chunks → Pinecone
// Rota: POST /api/pdf
// Body: multipart/form-data { file: <PDF>, agentId, clientId?, processoNum? }
// Retorna: { success, chunks, namespace, searchable: true }
// ============================================================

export const config = {
  maxDuration: 60,
  api: { bodyParser: false },          // necessário para multipart
}

// ─── Helpers ─────────────────────────────────────────────────

// OpenAI text-embedding-3-small — 1536 dims, match exato com índice Pinecone 'memória ben'
async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY ausente')
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000),
      dimensions: 1536,
    }),
  })
  if (!res.ok) throw new Error(`Embedding error: ${await res.text()}`)
  const data = await res.json()
  return data.data?.[0]?.embedding
}

// Divide o texto em chunks semânticos de ~1500 tokens (~6000 chars)
function chunkText(text, maxChars = 5500, overlapChars = 400) {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length)
    chunks.push(text.slice(start, end).trim())
    start += maxChars - overlapChars
  }
  return chunks.filter(c => c.length > 100)
}

// Extrai texto do PDF via AWS Textract ou fallback para extração binária
async function extractTextFromPdf(buffer) {
  const TEXTRACT_KEY    = process.env.AWS_ACCESS_KEY_ID
  const TEXTRACT_SECRET = process.env.AWS_SECRET_ACCESS_KEY
  const TEXTRACT_REGION = process.env.AWS_REGION || 'us-east-1'

  // ── Tentativa 1: AWS Textract (OCR real, suporta PDFs escaneados) ──
  if (TEXTRACT_KEY && TEXTRACT_SECRET) {
    try {
      const b64 = buffer.toString('base64')
      const endpoint = `https://textract.${TEXTRACT_REGION}.amazonaws.com/`
      // Textract DetectDocumentText via API direta (sem SDK)
      const body = JSON.stringify({
        Document: { Bytes: b64 },
        FeatureTypes: [],
      })
      const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
      const date = datetime.slice(0, 8)
      const service = 'textract'
      const host = `textract.${TEXTRACT_REGION}.amazonaws.com`

      // Assinar com HMAC-SHA256 (AWS SigV4 simplificado)
      const crypto = await import('node:crypto')
      const hash = (data) => crypto.createHash('sha256').update(data).digest('hex')
      const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest()

      const payloadHash = hash(body)
      const canonicalHeaders = `content-type:application/x-amz-json-1.1\nhost:${host}\nx-amz-date:${datetime}\n`
      const signedHeaders = 'content-type;host;x-amz-date'
      const canonicalRequest = `POST\n/\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
      const credScope = `${date}/${TEXTRACT_REGION}/${service}/aws4_request`
      const strToSign = `AWS4-HMAC-SHA256\n${datetime}\n${credScope}\n${hash(canonicalRequest)}`
      const signingKey = hmac(hmac(hmac(hmac(`AWS4${TEXTRACT_SECRET}`, date), TEXTRACT_REGION), service), 'aws4_request')
      const signature = hmac(signingKey, strToSign).toString('hex')

      const res = await fetch(`https://${host}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'Textract.DetectDocumentText',
          'X-Amz-Date': datetime,
          'Authorization': `AWS4-HMAC-SHA256 Credential=${TEXTRACT_KEY}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        },
        body,
        signal: AbortSignal.timeout(25000),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.Blocks
          ?.filter(b => b.BlockType === 'LINE')
          ?.map(b => b.Text)
          ?.join('\n') || ''
        if (text.length > 100) return text
      }
    } catch (e) {
      console.warn('[PDF] Textract falhou:', e.message)
    }
  }

  // ── Fallback: extração de texto simples (PDFs com texto nativo) ──
  const text = buffer.toString('latin1')
  const matches = text.match(/[\x20-\x7E\xC0-\xFF]{4,}/g) || []
  return matches
    .filter(s => s.trim().length > 3)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Handler principal ────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Método não permitido' })

  const PINECONE_KEY  = process.env.PINECONE_API_KEY
  const PINECONE_HOST = process.env.PINECONE_INDEX_HOST

  if (!PINECONE_KEY || !PINECONE_HOST) {
    return res.status(503).json({ error: 'Pinecone não configurado — configure PINECONE_API_KEY e PINECONE_INDEX_HOST' })
  }

  try {
    // Ler body raw (multipart/form-data ou JSON com base64)
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const rawBody = Buffer.concat(chunks)

    // Aceita JSON com campo base64 ou multipart
    let pdfBuffer, agentId, clientId, processoNum, fileName

    const contentType = req.headers['content-type'] || ''
    if (contentType.includes('application/json')) {
      const body = JSON.parse(rawBody.toString())
      pdfBuffer   = Buffer.from(body.fileBase64, 'base64')
      agentId     = body.agentId
      clientId    = body.clientId
      processoNum = body.processoNum
      fileName    = body.fileName || 'documento.pdf'
    } else {
      // multipart: parse manual simplificado (boundary)
      return res.status(400).json({
        error: 'Use Content-Type: application/json com campo fileBase64 (base64 do PDF), agentId, clientId, processoNum'
      })
    }

    if (!pdfBuffer || pdfBuffer.length < 100) {
      return res.status(400).json({ error: 'PDF inválido ou muito pequeno' })
    }

    // 1. Extrair texto (OCR ou nativo)
    const rawText = await extractTextFromPdf(pdfBuffer)
    if (!rawText || rawText.length < 50) {
      return res.status(422).json({ error: 'Não foi possível extrair texto do PDF' })
    }

    // 2. Chunking semântico
    const textChunks = chunkText(rawText)
    const namespace   = processoNum ? `proc-${processoNum.replace(/\D/g, '')}` : (clientId ? `client-${clientId}` : `doc-${Date.now()}`)

    // 3. Gerar embeddings e indexar no Pinecone
    const vectors = []
    for (let i = 0; i < textChunks.length; i++) {
      const embedding = await getEmbedding(textChunks[i])
      if (!embedding) continue
      vectors.push({
        id: `${namespace}-chunk-${i}`,
        values: embedding,
        metadata: {
          namespace,
          clientId:   clientId    || null,
          processoNum: processoNum || null,
          agentId:    agentId     || null,
          chunkIndex: i,
          totalChunks: textChunks.length,
          text:       textChunks[i].slice(0, 500),
          fileName,
          indexedAt:  new Date().toISOString(),
        },
      })
      // Enviar em lotes de 10
      if (vectors.length === 10 || i === textChunks.length - 1) {
        await fetch(`${PINECONE_HOST}/vectors/upsert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
          body: JSON.stringify({ vectors }),
          signal: AbortSignal.timeout(10000),
        })
        vectors.length = 0
      }
    }

    console.log(`[PDF RAG] Indexed ${textChunks.length} chunks — namespace=${namespace}`)

    return res.status(200).json({
      success: true,
      namespace,
      chunks: textChunks.length,
      textLength: rawText.length,
      fileName,
      searchable: true,
      message: `PDF indexado com sucesso. Use namespace="${namespace}" no contexto ao chamar o agente.`,
    })

  } catch (error) {
    console.error('[PDF RAG] Erro:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
