/**
 * BEN Admin Exec — Servidor temporário de administração remota
 * Porta: 3099 | Token: ben-admin-exec-2026
 * USO: node admin-exec.js &
 * REMOVER após uso: pm2 delete ben-admin-exec && rm admin-exec.js
 */
const http    = require('http')
const { exec } = require('child_process')
const path    = require('path')
const fs      = require('fs')

const PORT    = 3099
const TOKEN   = 'ben-admin-exec-2026'
const WORK_DIR = path.join(__dirname)

// Carregar .env do mesmo diretório
let envVars = {}
try {
  const envContent = fs.readFileSync(path.join(WORK_DIR, '.env'), 'utf8')
  envContent.split('\n').forEach(line => {
    const t = line.trim()
    if (!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if (i < 0) return
    envVars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  })
} catch (e) { /* sem .env */ }

// Comandos pré-definidos seguros
const SAFE_COMMANDS = {
  'health':          'curl -s http://localhost:3010/health 2>&1 || echo OFFLINE',
  'pm2-list':        'pm2 list --no-color 2>&1',
  'pm2-restart':     'pm2 delete ben-file-parser 2>/dev/null; pm2 start /root/ben-juris-center/vps-file-parser/ecosystem.config.js && pm2 save && sleep 4 && curl -s http://localhost:3010/health 2>&1',
  'pm2-restart-fork':'cd /root/ben-juris-center/vps-file-parser && pm2 delete ben-file-parser 2>/dev/null; PORT=3010 R2_ENDPOINT="'+(envVars.R2_ENDPOINT||'')+'" R2_ACCESS_KEY="'+(envVars.R2_ACCESS_KEY||'')+'" R2_SECRET_KEY="'+(envVars.R2_SECRET_KEY||'')+'" R2_BUCKET="'+(envVars.R2_BUCKET||'ben-knowledge-base')+'" OPENAI_API_KEY="'+(envVars.OPENAI_API_KEY||'')+'" ANTHROPIC_API_KEY="'+(envVars.ANTHROPIC_API_KEY||'')+'" GEMINI_API_KEY="'+(envVars.GEMINI_API_KEY||'')+'" PINECONE_API_KEY="'+(envVars.PINECONE_API_KEY||'')+'" PINECONE_INDEX_HOST="'+(envVars.PINECONE_INDEX_HOST||'')+'" FILE_PARSER_TOKEN="'+(envVars.FILE_PARSER_TOKEN||'ben-parser-2026')+'" VPS_KB_TOKEN="'+(envVars.VPS_KB_TOKEN||'ben-kb-2026')+'" pm2 start server.js --name ben-file-parser --max-memory-restart 512M && pm2 save && sleep 5 && curl -s http://localhost:3010/health',
  'check-env':       'cat /root/ben-juris-center/vps-file-parser/.env | grep -E "R2_|PINECONE|OPENAI" | cut -c1-60 2>&1',
  'show-logs':       'pm2 logs ben-file-parser --nostream --lines 30 --no-color 2>&1',
  'git-pull':        'cd /root/ben-juris-center && git pull origin main 2>&1',
  'self-destruct':   'pm2 delete ben-admin-exec 2>/dev/null; sleep 1; kill $(cat /tmp/admin-exec.pid 2>/dev/null) 2>/dev/null; echo DESTROYED',
}

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Auth check
  const auth = req.headers['authorization'] || req.headers['x-admin-token'] || ''
  if (!auth.includes(TOKEN)) {
    res.writeHead(401)
    return res.end(JSON.stringify({ error: 'Unauthorized' }))
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const cmdKey = url.pathname.replace('/', '') || url.searchParams.get('cmd') || 'health'

  if (req.method === 'GET' && cmdKey === 'list') {
    res.writeHead(200)
    return res.end(JSON.stringify({ 
      commands: Object.keys(SAFE_COMMANDS),
      env_loaded: Object.keys(envVars).length > 0,
      env_keys: Object.keys(envVars)
    }))
  }

  const cmd = SAFE_COMMANDS[cmdKey]
  if (!cmd) {
    res.writeHead(404)
    return res.end(JSON.stringify({ error: `Command not found: ${cmdKey}`, available: Object.keys(SAFE_COMMANDS) }))
  }

  console.log(`[admin-exec] Running: ${cmdKey}`)
  exec(cmd, { timeout: 60000, cwd: WORK_DIR }, (err, stdout, stderr) => {
    res.writeHead(200)
    res.end(JSON.stringify({
      cmd: cmdKey,
      exit: err ? err.code : 0,
      stdout: stdout || '',
      stderr: stderr || '',
      error: err ? err.message : null,
      timestamp: new Date().toISOString()
    }))
  })
})

server.listen(PORT, '0.0.0.0', () => {
  fs.writeFileSync('/tmp/admin-exec.pid', process.pid.toString())
  console.log(`\n✅ BEN Admin Exec rodando na porta ${PORT}`)
  console.log(`   Token: ${TOKEN}`)
  console.log(`   Comandos: ${Object.keys(SAFE_COMMANDS).join(', ')}`)
  console.log(`   Exemplo: curl -H "Authorization: Bearer ${TOKEN}" http://localhost:${PORT}/health\n`)
})

// Auto-destruir após 30 minutos
setTimeout(() => {
  console.log('[admin-exec] Auto-destruindo após 30min...')
  process.exit(0)
}, 30 * 60 * 1000)
