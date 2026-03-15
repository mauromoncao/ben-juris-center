// ============================================================
// BEN KNOWLEDGE BASE — Google Drive Sync Worker
// Rota: POST /api/knowledge/drive-sync
// Detecta arquivos novos/alterados no Drive e indexa no Pinecone
// Versão: 1.0.0 — 2026-03-15
//
// SETUP NO GOOGLE CLOUD CONSOLE:
// 1. Ativar Google Drive API
// 2. Criar Service Account → baixar JSON de credenciais
// 3. Compartilhar pastas do Drive com o e-mail da Service Account
// 4. Configurar variáveis abaixo no CF Pages
// ============================================================

const VPS_PARSER_URL    = process.env.VPS_PARSER_URL    || 'http://181.215.135.202:3010'
const FILE_PARSER_TOKEN = process.env.FILE_PARSER_TOKEN || 'ben-parser-2026'
const GOOGLE_SA_EMAIL   = process.env.GOOGLE_SA_EMAIL   || '' // service account email
const GOOGLE_SA_KEY     = process.env.GOOGLE_SA_KEY     || '' // private key (PEM, base64)
const GOOGLE_DRIVE_ROOT = process.env.GOOGLE_DRIVE_ROOT || '' // folder ID raiz do escritório
const SYNC_TOKEN_KEY    = 'gdrive_sync_token'                 // salvo no KV ou similar

// Mapa de pasta → categoria KB
const FOLDER_CATEGORY_MAP = {
  'Processos':        'processos',
  'Contratos':        'contratos',
  'Clientes':         'clientes',
  'Biblioteca':       'biblioteca',
  'Jurisprudencias':  'jurisprudencias',
  'Jurisprudências':  'jurisprudencias',
  'Modelos':          'modelos',
  'Pareceres':        'biblioteca',
  'Financeiro':       'financeiro',
}

// ── Gera JWT para Google APIs (Service Account) ───────────
async function getGoogleToken() {
  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_KEY) {
    throw new Error('GOOGLE_SA_EMAIL e GOOGLE_SA_KEY não configurados')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss:   GOOGLE_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  }

  // Encode header + payload
  const toBase64Url = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const signingInput = `${toBase64Url(header)}.${toBase64Url(payload)}`

  // Import private key (PEM → CryptoKey)
  const pemKey = atob(GOOGLE_SA_KEY)
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const keyBuffer = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  const jwt = `${signingInput}.${sigB64}`

  // Troca JWT por access_token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!tokenRes.ok) throw new Error(`Google token error: ${await tokenRes.text()}`)
  const data = await tokenRes.json()
  return data.access_token
}

// ── Lista arquivos do Drive alterados/criados desde lastSync ─
async function getDriveChanges(token, accessToken, folderId = null) {
  const baseUrl = 'https://www.googleapis.com/drive/v3'
  const headers = { Authorization: `Bearer ${accessToken}` }

  let files = []

  if (folderId) {
    // Lista arquivos de uma pasta específica
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields: 'files(id,name,mimeType,size,modifiedTime,parents)',
      pageSize: '100',
      orderBy: 'modifiedTime desc',
    })

    const res = await fetch(`${baseUrl}/files?${params}`, { headers })
    if (!res.ok) throw new Error(`Drive list error: ${await res.text()}`)
    const data = await res.json()
    files = data.files || []
  } else {
    // Usa Changes API com page token para detectar mudanças
    let startPageToken = token

    if (!startPageToken) {
      const r = await fetch(`${baseUrl}/changes/startPageToken`, { headers })
      const d = await r.json()
      startPageToken = d.startPageToken
    }

    const params = new URLSearchParams({
      pageToken: startPageToken,
      fields: 'newStartPageToken,changes(file(id,name,mimeType,size,modifiedTime,parents))',
      includeRemoved: 'false',
    })

    const res = await fetch(`${baseUrl}/changes?${params}`, { headers })
    if (!res.ok) throw new Error(`Drive changes error: ${await res.text()}`)
    const data = await res.json()
    files = (data.changes || []).map(c => c.file).filter(Boolean)
  }

  // Filtra apenas tipos suportados
  const SUPPORTED = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4',
    // Google Docs nativos → exportar como DOCX/PDF
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
  ]

  return files.filter(f =>
    f && f.id && f.name &&
    (SUPPORTED.includes(f.mimeType) || f.name.match(/\.(pdf|docx|doc|xlsx|xls|csv|txt|jpg|jpeg|png)$/i))
  )
}

// ── Detecta categoria a partir do nome/path ───────────────
function detectCategory(filename, parentName = '') {
  const combined = `${parentName} ${filename}`.toLowerCase()
  if (combined.includes('processo') || combined.includes('ação') || combined.includes('acao'))
    return 'processos'
  if (combined.includes('contrato') || combined.includes('nda') || combined.includes('acordo'))
    return 'contratos'
  if (combined.includes('jurisprud') || combined.includes('decisão') || combined.includes('acórdão'))
    return 'jurisprudencias'
  if (combined.includes('livro') || combined.includes('doutrina') || combined.includes('biblioteca'))
    return 'biblioteca'
  if (combined.includes('cliente') || combined.includes('client'))
    return 'clientes'
  if (combined.includes('parecer'))
    return 'biblioteca'
  if (combined.includes('modelo') || combined.includes('template'))
    return 'modelos'
  // Fallback por pasta
  for (const [folder, cat] of Object.entries(FOLDER_CATEGORY_MAP)) {
    if (combined.includes(folder.toLowerCase())) return cat
  }
  return 'geral'
}

// ── Baixa arquivo do Drive e converte para base64 ─────────
async function downloadDriveFile(fileId, mimeType, accessToken) {
  const baseUrl = 'https://www.googleapis.com/drive/v3'
  const headers = { Authorization: `Bearer ${accessToken}` }

  let url
  let exportMime = mimeType

  // Google Docs nativos precisam ser exportados
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `${baseUrl}/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    exportMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    url = `${baseUrl}/files/${fileId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    exportMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  } else {
    url = `${baseUrl}/files/${fileId}?alt=media`
  }

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Download error ${res.status}: ${await res.text()}`)

  const buffer = await res.arrayBuffer()
  const bytes  = new Uint8Array(buffer)
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
  const base64  = btoa(binary)

  return { base64, mimetype: exportMime, size: buffer.byteLength }
}

// ════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  if (!GOOGLE_SA_EMAIL || !GOOGLE_SA_KEY) {
    return res.status(200).json({
      success: false,
      message: 'Google Drive Sync não configurado. Configure GOOGLE_SA_EMAIL e GOOGLE_SA_KEY no CF Pages.',
      instructions: [
        '1. Acesse console.cloud.google.com',
        '2. Ative a Google Drive API',
        '3. Crie uma Service Account e baixe o JSON',
        '4. Configure GOOGLE_SA_EMAIL = client_email do JSON',
        '5. Configure GOOGLE_SA_KEY = base64 da private_key do JSON',
        '6. Compartilhe as pastas do Drive com o e-mail da Service Account',
      ],
    })
  }

  try {
    const { folder_id, sync_all = false, last_sync_token } = req.body || {}

    const startTime = Date.now()

    // 1. Obtém access token Google
    const accessToken = await getGoogleToken()

    // 2. Lista arquivos do Drive
    const targetFolder = folder_id || GOOGLE_DRIVE_ROOT || null
    const files = await getDriveChanges(last_sync_token, accessToken, targetFolder)

    if (files.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum arquivo novo ou alterado encontrado no Drive',
        synced:  0,
        elapsed_ms: Date.now() - startTime,
      })
    }

    // 3. Para cada arquivo: baixa → envia para VPS Parser → indexa Pinecone
    const results  = []
    let synced     = 0
    let failed     = 0
    const MAX_SYNC = 20 // máximo por execução (evitar timeout CF)

    for (const file of files.slice(0, MAX_SYNC)) {
      try {
        // Download
        const { base64, mimetype, size } = await downloadDriveFile(
          file.id, file.mimeType, accessToken
        )

        if (size > 100 * 1024 * 1024) {
          results.push({ filename: file.name, status: 'skipped', reason: 'arquivo > 100MB' })
          continue
        }

        const category = detectCategory(file.name)
        const namespace = `kb-${category}-drive`

        // Envia para VPS Parser
        const parserRes = await fetch(`${VPS_PARSER_URL}/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-parser-token': FILE_PARSER_TOKEN,
          },
          body: JSON.stringify({
            base64,
            filename: file.name,
            mimetype,
            index_rag: true,
            namespace,
            agent_id: 'ben-drive-sync',
            metadata: {
              category,
              source:        'google_drive',
              drive_file_id: file.id,
              drive_modified: file.modifiedTime,
              added_by:      'drive-sync-worker',
            },
          }),
        })

        if (parserRes.ok) {
          const data = await parserRes.json()
          results.push({
            filename:  file.name,
            status:    'ok',
            category,
            namespace,
            chunks:    data.chunks,
            indexed:   data.indexed,
          })
          synced++
        } else {
          results.push({ filename: file.name, status: 'error', error: await parserRes.text() })
          failed++
        }

      } catch (e) {
        results.push({ filename: file.name, status: 'error', error: e.message })
        failed++
      }

      // Pausa entre arquivos
      await new Promise(r => setTimeout(r, 500))
    }

    return res.status(200).json({
      success:    true,
      found:      files.length,
      processed:  Math.min(files.length, MAX_SYNC),
      synced,
      failed,
      remaining:  Math.max(0, files.length - MAX_SYNC),
      results,
      elapsed_ms: Date.now() - startTime,
      message:    `✅ Google Drive Sync: ${synced} arquivo(s) indexados no Knowledge Base`,
    })

  } catch (err) {
    console.error('[DRIVE-SYNC] Erro:', err)
    return res.status(500).json({ error: err.message })
  }
}
