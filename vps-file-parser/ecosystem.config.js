// PM2 Ecosystem — BEN File Parser
// Porta 3010 | VPS Hostinger
module.exports = {
  apps: [{
    name:         'ben-file-parser',
    script:       'server.js',
    cwd:          __dirname,
    instances:    1,
    autorestart:  true,
    watch:        false,
    max_memory_restart: '512M',
    env: {
      PORT:                  3010,
      NODE_ENV:              'production',
      FILE_PARSER_TOKEN:     'ben-parser-2026',
      // Preencher com as chaves reais no VPS:
      PINECONE_API_KEY:      process.env.PINECONE_API_KEY      || '',
      PINECONE_INDEX_HOST:   process.env.PINECONE_INDEX_HOST   || '',
      GEMINI_API_KEY:        '',  // NÃO USADO — embeddings via OpenAI
      OPENAI_API_KEY:        process.env.OPENAI_API_KEY        || '',
      ANTHROPIC_API_KEY:     process.env.ANTHROPIC_API_KEY     || '',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file:   '/var/log/ben-file-parser-error.log',
    out_file:     '/var/log/ben-file-parser-out.log',
  }],
}
