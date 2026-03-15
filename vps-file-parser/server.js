// ============================================================
// BEN FILE PARSER — Servidor VPS Hostinger porta 3010
// Extração de texto + Chunking + Indexação Pinecone (RAG)
// Suporte: PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, imagens, MP4, MP3
// Volumes: até 3.000+ páginas com chunking semântico
// v3.0.0 — 2026-03-15 — Whisper + Bulk Indexer + R2 Sync
// ============================================================

const express    = require('express')
const cors       = require('cors')
const multer     = require('multer')
const path       = require('path')
const fs         = require('fs')
const fsp        = require('fs').promises
const fetch      = require('node-fetch')
const FormData   = require('form-data')
const os         = require('os')

// ── Parsers de documento ─────────────────────────────────
let pdfParse, mammoth, XLSX

try { pdfParse = require('pdf-parse')  } catch(e) { console.warn('pdf-parse não instalado') }
try { mammoth  = require('mammoth')    } catch(e) { console.warn('mammoth não instalado') }
try { XLSX     = require('xlsx')       } catch(e) { console.warn('xlsx não instalado') }

const app  = express()
const PORT = process.env.PORT || 3010

// ── Configuração ─────────────────────────────────────────
const PINECONE_KEY    = process.env.PINECONE_API_KEY    || ''
const PINECONE_HOST   = process.env.PINECONE_INDEX_HOST || ''
const OPENAI_KEY      = process.env.OPENAI_API_KEY      || ''
const CLAUDE_KEY      = process.env.ANTHROPIC_API_KEY   || ''
const INTERNAL_TOKEN  = process.env.FILE_PARSER_TOKEN   || 'ben-parser-2026'
// Cloudflare R2 (S3-compatible)
const R2_ENDPOINT     = process.env.R2_ENDPOINT         || ''  // https://<acct>.r2.cloudflarestorage.com
const R2_ACCESS_KEY   = process.env.R2_ACCESS_KEY       || ''
const R2_SECRET_KEY   = process.env.R2_SECRET_KEY       || ''
const R2_BUCKET       = process.env.R2_BUCKET           || 'ben-knowledge-base'

// ── Limites generosos para documentos grandes ────────────
const CHUNK_SIZE     = 1800   // tokens aproximados por chunk
const CHUNK_OVERLAP  = 200    // sobreposição entre chunks
const MAX_FILE_MB    = 200    // 200 MB por arquivo
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
    service: 'BEN File Parser + Knowledge Base',
    port: PORT,
    version: '3.0.0',
    capabilities: {
      pdf:          !!pdfParse,
      docx:         !!mammoth,
      xlsx:         !!XLSX,
      images:       true,   // via Claude Vision / GPT-4o
      audio_video:  !!OPENAI_KEY, // via Whisper
      chunking:     true,
      rag_pinecone: !!(PINECONE_KEY && PINECONE_HOST),
      r2_storage:   !!(R2_ENDPOINT && R2_ACCESS_KEY),
      bulk_indexer: true,
      kb_search:    !!(PINECONE_KEY && PINECONE_HOST),
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
// Recebe arquivo em base64 (para uso direto das CF Pages Functions)
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
    } else if (mimetype.startsWith('audio/') || mimetype.startsWith('video/') ||
               ['.mp3','.mp4','.m4a','.wav','.webm','.ogg','.mov','.mpeg'].includes(ext)) {
      extracted = await extractAudioVideo(buffer, mimetype, filename)
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

// ── Vídeo/Áudio via OpenAI Whisper ───────────────────────
async function extractAudioVideo(buffer, mimetype, filename) {
  if (!OPENAI_KEY) {
    return {
      text: `[Mídia: ${filename} — configure OPENAI_API_KEY no VPS para transcrição Whisper]`,
      pages: 1,
    }
  }

  // Salva buffer temporário para enviar ao Whisper (API exige arquivo real)
  const tmpPath = path.join(os.tmpdir(), `ben-media-${Date.now()}-${filename}`)
  await fsp.writeFile(tmpPath, buffer)

  try {
    const ext = path.extname(filename).toLowerCase()
    // Whisper aceita: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg
    const whisperExts = ['.mp3','.mp4','.mpeg','.mpga','.m4a','.wav','.webm','.ogg','.mov']
    if (!whisperExts.includes(ext)) {
      return { text: `[Mídia não suportada pelo Whisper: ${filename}]`, pages: 1 }
    }

    const form = new FormData()
    form.append('file', fs.createReadStream(tmpPath), {
      filename,
      contentType: mimetype || 'audio/mpeg',
    })
    form.append('model', 'whisper-1')
    form.append('language', 'pt') // Português — melhora precisão jurídica
    form.append('response_format', 'verbose_json') // retorna segmentos com timestamps
    form.append('prompt',
      'Transcrição jurídica: audiência, depoimento, reunião, videoconferência. ' +
      'Mantenha termos jurídicos, nomes próprios e números de processo.'
    )

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[WHISPER] Erro:', err)
      return { text: `[Whisper error: ${err}]`, pages: 1 }
    }

    const data = await res.json()
    const text = data.text || ''
    const duration = data.duration || 0
    const segments = data.segments || []

    // Formata transcrição com timestamps (útil para audiências)
    let formatted = `=== TRANSCRIÇÃO: ${filename} ===\n`
    formatted += `Duração: ${Math.floor(duration/60)}min ${Math.floor(duration%60)}s\n\n`

    if (segments.length > 0) {
      for (const seg of segments) {
        const start = new Date(seg.start * 1000).toISOString().substr(11, 8)
        formatted += `[${start}] ${seg.text.trim()}\n`
      }
    } else {
      formatted += text
    }

    const pages = Math.ceil(duration / 120) || 1 // ~1 pág por 2 min de áudio

    console.log(`[WHISPER] ✅ ${filename}: ${text.length} chars, ${duration.toFixed(0)}s, ${segments.length} segmentos`)

    return { text: formatted, pages }

  } finally {
    // Limpa arquivo temporário
    fsp.unlink(tmpPath).catch(() => {})
  }
}

// ════════════════════════════════════════════════════════
// ROTA: POST /bulk-index
// Recebe lista de arquivos base64 para indexação em lote
// Ideal para migração de HD local → Pinecone
// Body: { files: [{ base64, filename, mimetype, namespace, category, client_id, process_id }] }
// ════════════════════════════════════════════════════════
app.post('/bulk-index', authMiddleware, async (req, res) => {
  const { files = [], dry_run = false } = req.body

  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'files[] é obrigatório' })
  }

  console.log(`[BULK] Iniciando indexação de ${files.length} arquivo(s)${dry_run ? ' [DRY RUN]' : ''}`)

  const results   = []
  let success     = 0
  let failed      = 0
  let totalChunks = 0
  const startTime = Date.now()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const { base64, filename, mimetype: mimeIn, namespace: nsIn, category = 'geral',
            client_id, process_id } = file

    if (!base64 || !filename) {
      results.push({ filename: filename || `file_${i}`, status: 'error', error: 'base64/filename ausente' })
      failed++
      continue
    }

    // Monta namespace
    let namespace = nsIn || `kb-${category}`
    if (client_id)  namespace = `kb-cliente-${client_id}`
    if (process_id) namespace = `kb-processo-${process_id.replace(/[^a-z0-9]/gi, '_')}`

    if (dry_run) {
      const sizeKB = Math.round(base64.length * 0.75 / 1024)
      results.push({ filename, status: 'dry_run', namespace, size_kb: sizeKB })
      continue
    }

    try {
      const buffer    = Buffer.from(base64, 'base64')
      const mimetype  = mimeIn || guessMimetype(filename)
      const ext       = path.extname(filename).toLowerCase()

      // Extrai texto
      let extracted
      const imgExts   = ['.jpg','.jpeg','.png','.webp','.gif','.tiff','.bmp']
      const imgMimes  = ['image/jpeg','image/png','image/webp','image/gif','image/tiff']
      const audioExts = ['.mp3','.mp4','.m4a','.wav','.webm','.ogg','.mov','.mpeg']

      if (mimetype === 'application/pdf' || ext === '.pdf') {
        extracted = await extractPdf(buffer)
      } else if (mimetype.includes('wordprocessingml') || ['.docx','.doc'].includes(ext)) {
        extracted = await extractDocx(buffer)
      } else if (mimetype.includes('spreadsheetml') || mimetype.includes('excel') ||
                 ['.xlsx','.xls','.csv'].includes(ext)) {
        extracted = extractXlsx(buffer, mimetype, filename)
      } else if (mimetype === 'text/plain' || ext === '.txt') {
        extracted = extractText(buffer)
      } else if (imgMimes.includes(mimetype) || imgExts.includes(ext)) {
        extracted = await extractImage(buffer, mimetype, filename)
      } else if (audioExts.includes(ext) || mimetype.startsWith('audio/') || mimetype.startsWith('video/')) {
        extracted = await extractAudioVideo(buffer, mimetype, filename)
      } else {
        extracted = { text: buffer.toString('utf8').replace(/\0/g,' '), pages: null }
      }

      const rawText  = extracted.text || ''
      const numPages = extracted.pages || Math.ceil(rawText.length / 2000)

      if (rawText.trim().length < 10) {
        results.push({ filename, status: 'empty', namespace, reason: 'sem texto extraído' })
        continue
      }

      // Chunking + Indexação
      const chunks = chunkText(rawText)
      let indexedCount = 0

      if (PINECONE_KEY && PINECONE_HOST) {
        indexedCount = await indexToPinecone(chunks, namespace, filename)
      }

      totalChunks += chunks.length
      results.push({
        filename,
        status:    'ok',
        category,
        namespace,
        pages:     numPages,
        chunks:    chunks.length,
        indexed:   indexedCount,
        size_kb:   Math.round(buffer.length / 1024),
      })
      success++
      console.log(`[BULK] ✅ ${i+1}/${files.length} — ${filename} (${chunks.length} chunks)`)

    } catch (e) {
      results.push({ filename, status: 'error', error: e.message })
      failed++
      console.error(`[BULK] ❌ ${filename}:`, e.message)
    }

    // Pausa entre arquivos (respeita rate limits)
    if (i < files.length - 1) await new Promise(r => setTimeout(r, 300))
  }

  const elapsed = Date.now() - startTime
  console.log(`[BULK] Concluído: ${success} ok, ${failed} erro(s), ${totalChunks} chunks — ${elapsed}ms`)

  res.json({
    success:      true,
    total:        files.length,
    indexed:      success,
    failed,
    total_chunks: totalChunks,
    elapsed_ms:   elapsed,
    results,
    message:      `✅ Bulk indexing: ${success}/${files.length} arquivos indexados, ${totalChunks} chunks totais`,
  })
})

// ════════════════════════════════════════════════════════
// ROTA: GET /kb-stats
// Estatísticas do Knowledge Base no Pinecone
// ════════════════════════════════════════════════════════
app.get('/kb-stats', authMiddleware, async (req, res) => {
  if (!PINECONE_KEY || !PINECONE_HOST) {
    return res.status(200).json({
      pinecone_configured: false,
      message: 'Configure PINECONE_API_KEY e PINECONE_INDEX_HOST no VPS',
    })
  }

  try {
    const r = await fetch(`${PINECONE_HOST}/describe_index_stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
      body: JSON.stringify({}),
    })

    if (!r.ok) return res.status(500).json({ error: 'Erro ao consultar Pinecone' })
    const stats = await r.json()

    const ns = stats.namespaces || {}
    const categories = {
      processos: 0, contratos: 0, biblioteca: 0,
      jurisprudencias: 0, clientes: 0, geral: 0,
    }

    for (const [name, info] of Object.entries(ns)) {
      const count = info.vectorCount || 0
      if (name.includes('processo'))       categories.processos += count
      else if (name.includes('contrato'))  categories.contratos += count
      else if (name.includes('biblioteca'))categories.biblioteca += count
      else if (name.includes('jurisprud')) categories.jurisprudencias += count
      else if (name.includes('cliente'))   categories.clientes += count
      else categories.geral += count
    }

    res.json({
      pinecone_configured: true,
      total_vectors:    stats.totalVectorCount || 0,
      total_docs_est:   Math.ceil((stats.totalVectorCount || 0) / 8),
      dimensions:       stats.dimension,
      namespaces_count: Object.keys(ns).length,
      categories,
      namespaces: Object.entries(ns).map(([name, info]) => ({
        name,
        vectors: info.vectorCount || 0,
      })).sort((a, b) => b.vectors - a.vectors),
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ════════════════════════════════════════════════════════
// ROTA: POST /kb-search
// Busca semântica direta no Pinecone
// ════════════════════════════════════════════════════════
app.post('/kb-search', authMiddleware, async (req, res) => {
  const { query, namespace, category, topK = 8, date_from, date_to } = req.body

  if (!query) return res.status(400).json({ error: 'query é obrigatório' })
  if (!PINECONE_KEY || !PINECONE_HOST) {
    return res.status(503).json({ error: 'Pinecone não configurado' })
  }

  try {
    const embedding = await generateEmbedding(query)
    if (!embedding) return res.status(500).json({ error: 'Falha no embedding' })

    const body = {
      vector: embedding,
      topK,
      includeMetadata: true,
    }
    if (namespace) body.namespace = namespace

    const filter = {}
    if (category)  filter.category  = { '$eq': category }
    if (date_from || date_to) {
      filter.created_at = {}
      if (date_from) filter.created_at['$gte'] = date_from
      if (date_to)   filter.created_at['$lte'] = date_to
    }
    if (Object.keys(filter).length > 0) body.filter = filter

    const r = await fetch(`${PINECONE_HOST}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_KEY },
      body: JSON.stringify(body),
    })

    if (!r.ok) return res.status(500).json({ error: 'Erro na query Pinecone' })
    const data = await r.json()

    const matches = (data.matches || []).map(m => ({
      score:      m.score,
      text:       m.metadata?.text?.slice(0, 500),
      filename:   m.metadata?.filename,
      namespace:  m.metadata?.namespace || namespace,
      category:   m.metadata?.category,
      client_id:  m.metadata?.client_id,
      process_id: m.metadata?.process_id,
      source:     m.metadata?.source,
      created_at: m.metadata?.created_at,
      chunk_idx:  m.metadata?.chunk_idx,
    })).filter(m => m.score > 0.3)

    // Agrupa por documento
    const docs = {}
    for (const m of matches) {
      if (!docs[m.filename]) {
        docs[m.filename] = { ...m, excerpts: [] }
      }
      docs[m.filename].excerpts.push({ text: m.text, score: m.score })
      if (m.score > docs[m.filename].score) docs[m.filename].score = m.score
    }

    res.json({
      success:  true,
      query,
      total:    Object.keys(docs).length,
      results:  Object.values(docs).sort((a, b) => b.score - a.score),
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
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
╔═══════════════════════════════════════════════════════════════╗
║  BEN FILE PARSER + KNOWLEDGE BASE — VPS Hostinger            ║
║  Porta: ${PORT}  |  Versão: 3.0.0  |  2026-03-15              ║
║  PDF ✅ DOCX ✅ XLSX ✅ Imagens ✅ Whisper ✅ RAG ✅          ║
║  Bulk Indexer ✅ KB Search ✅ R2 Storage: ${R2_ENDPOINT ? '✅' : '⚠️ config'}    ║
║  Limite: ${MAX_FILE_MB}MB | Chunks: ${CHUNK_SIZE} tokens | 3000+ págs             ║
╚═══════════════════════════════════════════════════════════════╝
  `)
})
