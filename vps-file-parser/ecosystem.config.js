// PM2 Ecosystem — BEN File Parser v3.0
// Porta 3010 | VPS Hostinger
// As chaves ficam no .env (mesmo diretório) — PM2 carrega via env_file
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

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
      FILE_PARSER_TOKEN:     process.env.FILE_PARSER_TOKEN     || 'ben-parser-2026',
      VPS_KB_TOKEN:          process.env.VPS_KB_TOKEN          || 'ben-kb-2026',
      // APIs de IA — lidas do .env
      OPENAI_API_KEY:        process.env.OPENAI_API_KEY        || '',
      ANTHROPIC_API_KEY:     process.env.ANTHROPIC_API_KEY     || '',
      GEMINI_API_KEY:        process.env.GEMINI_API_KEY        || '',
      // Pinecone RAG
      PINECONE_API_KEY:      process.env.PINECONE_API_KEY      || '',
      PINECONE_INDEX_HOST:   process.env.PINECONE_INDEX_HOST   || '',
      // Cloudflare R2 Storage
      R2_ENDPOINT:           process.env.R2_ENDPOINT           || '',
      R2_ACCESS_KEY:         process.env.R2_ACCESS_KEY         || '',
      R2_SECRET_KEY:         process.env.R2_SECRET_KEY         || '',
      R2_BUCKET:             process.env.R2_BUCKET             || 'ben-knowledge-base',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:   '/var/log/ben-file-parser-error.log',
    out_file:     '/var/log/ben-file-parser-out.log',
  }],
}
