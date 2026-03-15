// PM2 Ecosystem — BEN File Parser v3.0
// Porta 3010 | VPS Hostinger
// As chaves são lidas diretamente do .env via dotenv.parse (valores literais)
const path = require('path')
const fs   = require('fs')

// Lê e parseia o .env do mesmo diretório
let envVars = {}
try {
  const envPath    = path.join(__dirname, '.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  // Parse manual: ignora comentários e linhas vazias
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx < 0) return
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    envVars[key] = val
  })
  console.log('[ecosystem] .env carregado — chaves:', Object.keys(envVars).join(', '))
} catch (e) {
  console.warn('[ecosystem] Aviso: .env não encontrado ou ilegível:', e.message)
}

module.exports = {
  apps: [{
    name:         'ben-file-parser',
    script:       'server.js',
    cwd:          __dirname,
    instances:    1,
    exec_mode:    'fork',
    autorestart:  true,
    watch:        false,
    max_memory_restart: '512M',
    env: {
      PORT:                  3010,
      NODE_ENV:              'production',
      // Tokens de acesso
      FILE_PARSER_TOKEN:     envVars.FILE_PARSER_TOKEN     || 'ben-parser-2026',
      VPS_KB_TOKEN:          envVars.VPS_KB_TOKEN          || 'ben-kb-2026',
      // APIs de IA
      OPENAI_API_KEY:        envVars.OPENAI_API_KEY        || '',
      ANTHROPIC_API_KEY:     envVars.ANTHROPIC_API_KEY     || '',
      GEMINI_API_KEY:        envVars.GEMINI_API_KEY        || '',
      // Pinecone RAG
      PINECONE_API_KEY:      envVars.PINECONE_API_KEY      || '',
      PINECONE_INDEX_HOST:   envVars.PINECONE_INDEX_HOST   || '',
      // Cloudflare R2 Storage
      R2_ENDPOINT:           envVars.R2_ENDPOINT           || '',
      R2_ACCESS_KEY:         envVars.R2_ACCESS_KEY         || '',
      R2_SECRET_KEY:         envVars.R2_SECRET_KEY         || '',
      R2_BUCKET:             envVars.R2_BUCKET             || 'ben-knowledge-base',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:   '/var/log/ben-file-parser-error.log',
    out_file:     '/var/log/ben-file-parser-out.log',
  }],
}
