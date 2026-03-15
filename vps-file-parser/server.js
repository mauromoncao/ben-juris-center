// ============================================================
// BEN FILE PARSER — Servidor VPS Hostinger porta 3002
// Extração de texto + Chunking + Indexação Pinecone (RAG)
// Suporte: PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, imagens
// Volumes: até 3.000+ páginas com chunking semântico
// ============================================================

const express  = require('express')
const cors     = require('cors')
const multer   = require('multer')
const path     = require('path')
const fs       = require('fs')
const fetch    = require('node-fetch')

// ── Parsers de documento ─────────────────────────────────
let pdfParse, mammoth, XLSX

try { pdfParse = require('pdf-parse')  } catch(e) { console.warn('pdf-parse não instalado') }
try { mammoth  = require('mammoth')    } catch(e) { console.warn('mammoth não instalado') }
try { XLSX     = require('xlsx')       } catch(e) { console.warn('xlsx não instalado') }

const app  = express()
const PORT = process.env.PORT || 3010

// ── Configuração ─────────────────────────────────────────
const PINECONE_KEY  = process.env.PINECONE_API_KEY  || ''
const PINECONE_HOST = process.env.PINECONE_INDEX_HOST || ''
const GEMINI_KEY    = process.env.GEMINI_API_KEY    || ''
const OPENAI_KEY    = process.env.OPENAI_API_KEY    || ''
const CLAUDE_KEY    = process.env.ANTHROPIC_API_KEY || ''
const INTERNAL_TOKEN = process.env.FILE_PARSER_TOKEN || 'ben-parser-2026'

// ── Limites generosos para documentos grandes ────────────
const CHUNK_SIZE     = 1800   // tokens aproximados por chunk
const CHUNK_OVERLAP  = 200    // sobreposição entre chunks
const MAX_FILE_MB    = 100    // 100 MB por arquivo
const MAX_PAGES_LOG  = 3000   // log de aviso para 3000+ páginas

// ── Upload: memória (não salva em disco) ─────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv', 'text/plain',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff',
      'video/mp4', 'video/mpeg', 'audio/mpeg', 'audio/mp4',
    ]
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExt = ['.pdf','.docx','.doc','.xlsx','.xls','.csv','.txt',
                        '.jpg','.jpeg','.png','.webp','.gif','.tiff',
                        '.mp4','.mp3','.m4a']
    if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo não suportado: ${file.mimetype} (${ext})`))
    }
  },
})

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '50mb' }))

// ── Autenticação simples ──────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers['x-parser-token'] || req.query.token
  if (token !== INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' })
  }
  next()
}

// ── Health ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BEN File Parser',
    port: PORT,
    version: '2.0.0',
    capabilities: {
      pdf:    !!pdfParse,
      docx:   !!mammoth,
      xlsx:   !!XLSX,
      images: true,   // via Claude Vision
      chunking: true,
      rag_pinecone: !!(PINECONE_KEY && PINECONE_HOST),
    },
    limits: {
      max_file_mb:  MAX_FILE_MB,
      chunk_size:   CHUNK_SIZE,
      max_pages:    `${MAX_PAGES_LOG}+`,
    },
    timestamp: new Date().toISOString(),
  })
})

// ════════════════════════════════════════════════════════
// EXTRATORES DE TEXTO
// ════════════════════════════════════════════════════════

// ── PDF ───────────────────────────────────────────────────
async function extractPdf(buffer) {
  if (!pdfParse) throw new Error('pdf-parse não instalado no VPS')
  const data = await pdfParse(buffer, {
    max: 0, // sem limite de páginas
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  })
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info,
    metadata: data.metadata,
  }
}

// ── DOCX/DOC ──────────────────────────────────────────────
async function extractDocx(buffer) {
  if (!mammoth) throw new Error('mammoth não instalado no VPS')
  const result = await mammoth.extractRawText({ buffer })
  return { text: result.value, pages: null }
}

// ── XLSX/XLS/CSV ──────────────────────────────────────────
function extractXlsx(buffer, mimetype, filename) {
  if (!XLSX) throw new Error('xlsx não instalado no VPS')
  const ext  = path.extname(filename).toLowerCase()
  const type = ext === '.csv' ? 'string' : undefined
  const wb   = type
    ? XLSX.read(buffer.toString('utf8'), { type: 'string' })
    : XLSX.read(buffer, { type: 'buffer' })

  let text = ''
  wb.SheetNames.forEach(sheetName => {
    text += `\n=== PLANILHA: ${sheetName} ===\n`
    const ws  = wb.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(ws)
    text += csv
  })
  return { text, pages: wb.SheetNames.length }
}

// ── TXT/CSV (texto puro) ──────────────────────────────────
function extractText(buffer) {
  return { text: buffer.toString('utf8'), pages: null }
}

// ── Imagem via Claude Vision ──────────────────────────────
async function extractImage(buffer, mimetype, filename) {
  if (!CLAUDE_KEY && !OPENAI_KEY) {
    return { text: `[Imagem: ${filename} — APIs de visão não configuradas no VPS]`, pages: 1 }
  }

  const base64 = buffer.toString('base64')
  const mediaType = mimetype || 'image/jpeg'

  // Preferência: Claude Vision (melhor OCR para documentos jurídicos)
  if (CLAUDE_KEY) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'Extraia e transcreva TODO o texto visível nesta imagem/documento com máxima fidelidade. Se for documento jurídico, mantenha formatação. Se for planilha, mantenha estrutura tabular. Se for manuscrito, transcreva fielmente. NÃO adicione comentários — apenas o texto extraído.',
            },
          ],
        }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return { text: data.content?.[0]?.text || '[sem texto]', pages: 1 }
    }
  }

  // Fallback: GPT-4o Vision
  if (OPENAI_KEY) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}`, detail: 'high' } },
            { type: 'text', text: 'Extraia todo o texto desta imagem com máxima fidelidade.' },
          ],
        }],
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return { text: data.choices?.[0]?.message?.content || '[sem texto]', pages: 1 }
    }
  }

  return { text: `[Imagem: ${filename} — extração falhou]`, pages: 1 }
}

// ════════════════════════════════════════════════════════
// CHUNKING SEMÂNTICO
// ════════════════════════════════════════════════════════
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  // Estima tokens: ~4 chars = 1 token
  const charSize    = chunkSize * 4
  const charOverlap = overlap * 4

  const chunks = []
  let start = 0

  // Tenta quebrar em parágrafos/sentenças (não no meio de palavras)
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  while (start < normalized.length) {
    let end = Math.min(start + charSize, normalized.length)

    // Se não chegou ao fim, tenta quebrar em parágrafo ou sentença
    if (end < normalized.length) {
      const breakPoints = [
        normalized.lastIndexOf('\n\n', end),
        normalized.lastIndexOf('.\n', end),
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf('\n', end),
      ]
      const bp = breakPoints.find(p => p > start + charSize * 0.5)
      if (bp && bp > start) end = bp + 1
    }

    const chunk = normalized.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)

    start = Math.max(start + 1, end - charOverlap)
  }

  return chunks
}

// ════════════════════════════════════════════════════════
// EMBEDDINGS + PINECONE (RAG)
// ════════════════════════════════════════════════════════
async function generateEmbedding(text) {
  // OpenAI text-embedding-3-small: 1536 dims — match exato com índice Pinecone 'memória ben'
  // NÃO usar Gemini text-embedding-004 (768 dims) — incompatível com o índice 1536
  if (OPENAI_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.slice(0, 8000),
          dimensions: 1536,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.data?.[0]?.embedding
      }
    } catch(e) { /* continua */ }
  }

  return null
}

async function indexToPinecone(chunks, namespace, filename) {
  if (!PINECONE_KEY || !PINECONE_HOST) {
    console.warn('[PINECONE] Não configurado — pulando indexação')
    return 0
  }

  let indexed = 0
  const BATCH = 50 // Pinecone aceita até 100 vetores por upsert

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch  = chunks.slice(i, i + BATCH)
    const vectors = []

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j]
      const embedding = await generateEmbedding(chunk)
      if (!embedding) continue

      vectors.push({
        id: `${namespace}-chunk-${i + j}`,
        values: embedding,
        metadata: {
          text:      chunk.slice(0, 1000), // Pinecone limita metadata a 40KB
          namespace,
          filename,
          chunk_idx: i + j,
          total_chunks: chunks.length,
          created_at: new Date().toISOString(),
        },
      })
    }

    if (vectors.length === 0) continue

    try {
      const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': PINECONE_KEY,
        },
        body: JSON.stringify({ vectors, namespace }),
      })
      if (res.ok) {
        indexed += vectors.length
        console.log(`[PINECONE] Indexados ${indexed}/${chunks.length} chunks (namespace: ${namespace})`)
      } else {
        const err = await res.text()
        console.error('[PINECONE] Erro upsert:', err)
      }
    } catch(e) {
      console.error('[PINECONE] Falha no batch:', e.message)
    }

    // Pausa entre batches para não sobrecarregar
    if (i + BATCH < chunks.length) await new Promise(r => setTimeout(r, 200))
  }

  return indexed
}

// ════════════════════════════════════════════════════════
// ROTA PRINCIPAL: POST /parse
// Recebe arquivo multipart/form-data, extrai texto,
// opcionalmente indexa no Pinecone e retorna texto + namespace
// ════════════════════════════════════════════════════════
app.post('/parse', authMiddleware, upload.single('file'), async (req, res) => {
  const startTime = Date.now()

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado. Use campo "file" em multipart/form-data' })
  }

  const { buffer, mimetype, originalname, size } = req.file
  const indexRag   = req.body.index_rag   !== 'false'  // default: true
  const namespace  = req.body.namespace   || `doc-${Date.now()}-${originalname.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`
  const agentId    = req.body.agent_id    || 'unknown'
  const ext        = path.extname(originalname).toLowerCase()

  console.log(`[PARSE] ${originalname} (${(size/1024/1024).toFixed(2)}MB) — ${mimetype} — agente: ${agentId}`)

  try {
    // ── 1. EXTRAÇÃO DE TEXTO ──────────────────────────────
    let extracted
    const imgExts = ['.jpg','.jpeg','.png','.webp','.gif','.tiff','.bmp']
    const imgMimes = ['image/jpeg','image/png','image/webp','image/gif','image/tiff']

    if (mimetype === 'application/pdf' || ext === '.pdf') {
      extracted = await extractPdf(buffer)
    } else if (mimetype.includes('wordprocessingml') || ext === '.docx') {
      extracted = await extractDocx(buffer)
    } else if (ext === '.doc') {
      // DOC antigo: tenta mammoth, fallback para extração ASCII
      try { extracted = await extractDocx(buffer) }
      catch { extracted = { text: buffer.toString('latin1').replace(/[^\x20-\x7E\n]/g, ' '), pages: null } }
    } else if (mimetype.includes('spreadsheetml') || mimetype.includes('excel') ||
               ['.xlsx','.xls','.csv'].includes(ext)) {
      extracted = extractXlsx(buffer, mimetype, originalname)
    } else if (mimetype === 'text/plain' || mimetype === 'text/csv' || ext === '.txt') {
      extracted = extractText(buffer)
    } else if (imgMimes.includes(mimetype) || imgExts.includes(ext)) {
      extracted = await extractImage(buffer, mimetype, originalname)
    } else {
      // Fallback: tenta UTF-8, depois ASCII
      try {
        extracted = { text: buffer.toString('utf8'), pages: null }
      } catch {
        extracted = { text: buffer.toString('ascii').replace(/[^\x20-\x7E\n]/g, ' '), pages: null }
      }
    }

    const rawText  = extracted.text || ''
    const numPages = extracted.pages || Math.ceil(rawText.length / 2000)

    if (!rawText || rawText.trim().length < 10) {
      return res.status(422).json({
        error:   'Nenhum texto extraído do arquivo',
        detail:  'Arquivo pode estar corrompido, protegido por senha, ou ser uma imagem sem OCR disponível',
        file:    originalname,
        size_mb: (size/1024/1024).toFixed(2),
      })
    }

    console.log(`[PARSE] Texto extraído: ${rawText.length} chars, ~${numPages} págs`)

    if (numPages >= MAX_PAGES_LOG) {
      console.log(`[PARSE] ⚠️ Documento grande: ~${numPages} páginas — usando chunking completo`)
    }

    // ── 2. CHUNKING ───────────────────────────────────────
    const chunks = chunkText(rawText)
    console.log(`[PARSE] ${chunks.length} chunks gerados`)

    // ── 3. INDEXAÇÃO PINECONE (RAG) ───────────────────────
    let indexedCount = 0
    if (indexRag && chunks.length > 0) {
      indexedCount = await indexToPinecone(chunks, namespace, originalname)
    }

    // ── 4. PREVIEW DO TEXTO (primeiros 8.000 chars para contexto imediato) ──
    const previewText = rawText.slice(0, 8000)
    const hasMore     = rawText.length > 8000

    const elapsed = Date.now() - startTime

    res.json({
      success:       true,
      filename:      originalname,
      mimetype,
      size_mb:       parseFloat((size/1024/1024).toFixed(2)),
      pages:         numPages,
      chars:         rawText.length,
      tokens_approx: Math.ceil(rawText.length / 4),
      chunks:        chunks.length,
      namespace,
      indexed:       indexedCount,
      rag_ready:     indexedCount > 0,
      preview_text:  previewText,
      has_more:      hasMore,
      full_text:     rawText.length <= 50000 ? rawText : null, // retorna texto completo se < 50K chars
      elapsed_ms:    elapsed,
      message:       indexedCount > 0
        ? `✅ ${chunks.length} chunks indexados no Pinecone (namespace: ${namespace})`
        : `✅ Texto extraído — ${chunks.length} chunks prontos (Pinecone não configurado)`,
    })

  } catch (err) {
    console.error('[PARSE] Erro:', err)
    res.status(500).json({
      error:    'Falha na extração do arquivo',
      detail:   err.message,
      file:     originalname,
      size_mb:  parseFloat((size/1024/1024).toFixed(2)),
    })
  }
})

// ── POST /parse-base64 ────────────────────────────────────
// Recebe arquivo em base64 (para uso direto das Vercel Functions)
app.post('/parse-base64', authMiddleware, async (req, res) => {
  const { base64, filename, mimetype: mimeIn, index_rag, namespace: nsIn, agent_id } = req.body

  if (!base64 || !filename) {
    return res.status(400).json({ error: 'base64 e filename são obrigatórios' })
  }

  const buffer   = Buffer.from(base64, 'base64')
  const mimetype = mimeIn || guessMimetype(filename)
  const namespace = nsIn || `doc-${Date.now()}-${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`

  // Injeta como se fosse multer upload
  req.file = { buffer, mimetype, originalname: filename, size: buffer.length }
  req.body.namespace  = namespace
  req.body.index_rag  = index_rag !== false ? 'true' : 'false'
  req.body.agent_id   = agent_id || 'unknown'

  // Reutiliza o handler do /parse
  return app._router.handle({ ...req, url: '/parse', method: 'POST' }, res, () => {})
})

// Alternativa simples para parse-base64
app.post('/extract', authMiddleware, async (req, res) => {
  const { base64, filename, mimetype: mimeIn, index_rag = true, namespace: nsIn, agent_id } = req.body
  if (!base64 || !filename) return res.status(400).json({ error: 'base64 e filename obrigatórios' })

  const buffer    = Buffer.from(base64, 'base64')
  const mimetype  = mimeIn || guessMimetype(filename)
  const ext       = path.extname(filename).toLowerCase()
  const namespace = nsIn || `doc-${Date.now()}-${filename.replace(/[^a-z0-9]/gi,'_').toLowerCase()}`
  const startTime = Date.now()

  console.log(`[EXTRACT] ${filename} (${(buffer.length/1024/1024).toFixed(2)}MB) — agente: ${agent_id}`)

  try {
    let extracted
    const imgExts  = ['.jpg','.jpeg','.png','.webp','.gif','.tiff','.bmp']
    const imgMimes = ['image/jpeg','image/png','image/webp','image/gif','image/tiff']

    if (mimetype === 'application/pdf' || ext === '.pdf') {
      extracted = await extractPdf(buffer)
    } else if (mimetype.includes('wordprocessingml') || ['.docx','.doc'].includes(ext)) {
      extracted = await extractDocx(buffer)
    } else if (mimetype.includes('spreadsheetml') || mimetype.includes('excel') || ['.xlsx','.xls','.csv'].includes(ext)) {
      extracted = extractXlsx(buffer, mimetype, filename)
    } else if (mimetype === 'text/plain' || ext === '.txt') {
      extracted = extractText(buffer)
    } else if (imgMimes.includes(mimetype) || imgExts.includes(ext)) {
      extracted = await extractImage(buffer, mimetype, filename)
    } else {
      extracted = { text: buffer.toString('utf8').replace(/\0/g,' '), pages: null }
    }

    const rawText  = extracted.text || ''
    const numPages = extracted.pages || Math.ceil(rawText.length / 2000)

    if (rawText.trim().length < 10) {
      return res.status(422).json({ error: 'Nenhum texto extraído', file: filename })
    }

    const chunks      = chunkText(rawText)
    let indexedCount  = 0

    if (index_rag && chunks.length > 0 && PINECONE_KEY && PINECONE_HOST) {
      indexedCount = await indexToPinecone(chunks, namespace, filename)
    }

    const previewText = rawText.slice(0, 8000)

    res.json({
      success:       true,
      filename,
      mimetype,
      size_mb:       parseFloat((buffer.length/1024/1024).toFixed(2)),
      pages:         numPages,
      chars:         rawText.length,
      tokens_approx: Math.ceil(rawText.length / 4),
      chunks:        chunks.length,
      namespace,
      indexed:       indexedCount,
      rag_ready:     indexedCount > 0,
      preview_text:  previewText,
      has_more:      rawText.length > 8000,
      full_text:     rawText.length <= 50000 ? rawText : null,
      elapsed_ms:    Date.now() - startTime,
    })

  } catch(err) {
    console.error('[EXTRACT] Erro:', err)
    res.status(500).json({ error: err.message, file: filename })
  }
})

// ── GET /namespaces/:namespace/chunks ─────────────────────
// Lista chunks de um documento já indexado no Pinecone
app.get('/namespaces/:namespace/chunks', authMiddleware, async (req, res) => {
  const { namespace } = req.params
  const { query = 'documento processual' } = req.query

  if (!PINECONE_KEY || !PINECONE_HOST) {
    return res.status(503).json({ error: 'Pinecone não configurado' })
  }

  try {
    const embedding = await generateEmbedding(query)
    if (!embedding) return res.status(500).json({ error: 'Falha ao gerar embedding' })

    const qRes = await fetch(`${PINECONE_HOST}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
      body: JSON.stringify({
        vector: embedding,
        topK: 20,
        includeMetadata: true,
        filter: { namespace: { '$eq': namespace } },
      }),
    })

    if (!qRes.ok) return res.status(500).json({ error: 'Erro na query Pinecone' })
    const data = await qRes.json()

    res.json({
      namespace,
      chunks: data.matches?.map(m => ({
        score:     m.score,
        text:      m.metadata?.text,
        chunk_idx: m.metadata?.chunk_idx,
        filename:  m.metadata?.filename,
      })) || [],
    })
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
})

// ── DELETE /namespaces/:namespace ─────────────────────────
// Remove namespace do Pinecone (limpar depois de processar)
app.delete('/namespaces/:namespace', authMiddleware, async (req, res) => {
  const { namespace } = req.params
  if (!PINECONE_KEY || !PINECONE_HOST) return res.status(503).json({ error: 'Pinecone não configurado' })

  try {
    const r = await fetch(`${PINECONE_HOST}/vectors/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
      body: JSON.stringify({ deleteAll: true, namespace }),
    })
    res.json({ success: r.ok, namespace })
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Utilitários ───────────────────────────────────────────
function guessMimetype(filename) {
  const ext = path.extname(filename).toLowerCase()
  const map = {
    '.pdf':  'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc':  'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls':  'application/vnd.ms-excel',
    '.csv':  'text/csv',
    '.txt':  'text/plain',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
  }
  return map[ext] || 'application/octet-stream'
}

// ── Erro global ───────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `Arquivo muito grande. Limite: ${MAX_FILE_MB}MB`,
      limit_mb: MAX_FILE_MB,
    })
  }
  console.error('[ERROR]', err)
  res.status(500).json({ error: err.message })
})

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  BEN FILE PARSER — VPS Hostinger                      ║
║  Porta: ${PORT}  |  Versão: 2.0.0                       ║
║  PDF ✅ DOCX ✅ XLSX ✅ Imagens ✅ RAG Pinecone ✅     ║
║  Limite: ${MAX_FILE_MB}MB | Chunks: ${CHUNK_SIZE} tokens | 3000+ págs ║
╚═══════════════════════════════════════════════════════╝
  `)
})
