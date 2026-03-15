// ============================================================
// BEN PORTAL DO CLIENTE — Backend API v3.0
// Porta: 3600 | VPS Hostinger: 181.215.135.202
// Banco: PostgreSQL local (mesmo servidor VPS)
//
// ROTAS:
//   GET  /health
//   POST /auth/login                  — login admin
//   GET  /auth/me
//   POST /cliente/auth/login          — login cliente
//   GET  /cliente/auth/me
//   GET  /clientes                    — listar
//   POST /clientes                    — criar
//   GET  /clientes/:id                — detalhes
//   PATCH /clientes/:id               — atualizar
//   GET  /clientes/:id/departamentos
//   POST /clientes/:id/departamentos
//   GET  /procedimentos?cliente_id=
//   POST /procedimentos
//   GET  /procedimentos/:id
//   POST /procedimentos/:id/mensagens
//   POST /procedimentos/:id/documentos
//   GET  /processos?cliente_id=
//   POST /processos
//   GET  /processos/:id
//   PATCH /processos/:id/status
//   POST /webhook/whatsapp
//   POST /mensagens/enviar
//   GET  /mensagens/historico/:cliente_id
//   GET  /mensagens/nao-lidas
//   PATCH /mensagens/:id/lida
//   GET  /cliente/procedimentos
//   GET  /cliente/processos
// ============================================================

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const jwt        = require('jsonwebtoken')
const bcrypt     = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')
const { Pool }   = require('pg')

const app  = express()
const PORT = process.env.PORT || 3600

// ── PostgreSQL ────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'ben_portal',
  user:     process.env.DB_USER     || 'ben_admin',
  password: process.env.DB_PASS     || process.env.DB_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

async function query(sql, params = []) {
  const client = await pool.connect()
  try {
    const r = await client.query(sql, params)
    return r
  } finally {
    client.release()
  }
}

// ── Configurações ─────────────────────────────────────────────
const JWT_SECRET         = process.env.JWT_SECRET          || 'ben-portal-secret-2026'
const ZAPI_MARA_INSTANCE = process.env.MARA_ZAPI_INSTANCE_ID || ''
const ZAPI_MARA_TOKEN    = process.env.MARA_ZAPI_TOKEN       || ''
const ZAPI_MARA_CLIENT   = process.env.MARA_ZAPI_CLIENT_TOKEN || ''
const ZAPI_BASE          = ZAPI_MARA_INSTANCE && ZAPI_MARA_TOKEN
  ? `https://api.z-api.io/instances/${ZAPI_MARA_INSTANCE}/token/${ZAPI_MARA_TOKEN}`
  : ''
const ESCRITORIO_WHATSAPP = (process.env.PLANTONISTA_WHATSAPP || '5586999484761').replace(/\D/g, '')

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || 'mauromoncaoadv.escritorio@gmail.com'
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || '"Mauro Monção Advogados" <mauromoncaoadv.escritorio@gmail.com>'

const PORTAL_URL = process.env.PORTAL_URL || 'https://portaldocliente.mauromoncao.adv.br'

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── JWT Auth ──────────────────────────────────────────────────
function authAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' })
    req.admin = payload
    next()
  } catch { return res.status(401).json({ error: 'Token inválido' }) }
}

function authCliente(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.clienteAuth = payload
    next()
  } catch { return res.status(401).json({ error: 'Token inválido' }) }
}

// ── Helpers ───────────────────────────────────────────────────
function now() { return new Date().toISOString() }

async function zapiSendText(phone, message) {
  if (!ZAPI_BASE) { console.warn('[PORTAL-WA] Z-API não configurada'); return { simulated: true } }
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (ZAPI_MARA_CLIENT) headers['Client-Token'] = ZAPI_MARA_CLIENT
    const r = await fetch(`${ZAPI_BASE}/send-text`, {
      method: 'POST', headers,
      body: JSON.stringify({ phone, message }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await r.json()
    if (r.ok) console.log(`[PORTAL-WA] ✅ WA enviado → ${phone}`)
    else console.error(`[PORTAL-WA] ❌ Erro:`, JSON.stringify(data).slice(0,200))
    return data
  } catch (e) { console.error('[PORTAL-WA] fetch error:', e.message); return null }
}

async function sendEmail({ to, subject, html, text }) {
  if (!SMTP_PASS) { console.warn('[PORTAL-MAIL] SMTP não configurado'); return { simulated: true } }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    const info = await transporter.sendMail({ from: SMTP_FROM, to, subject, html, text })
    console.log(`[PORTAL-MAIL] ✅ E-mail → ${to}: ${info.messageId}`)
    return info
  } catch (e) { console.error('[PORTAL-MAIL] Erro:', e.message); return null }
}

function emailHtmlBase(titulo, conteudo) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#0f2044;padding:24px;text-align:center">
      <h2 style="color:#D4A017;margin:0;font-size:18px">Mauro Monção Advogados Associados</h2>
      <p style="color:#ffffff;margin:6px 0 0;font-size:12px">${titulo}</p>
    </div>
    <div style="padding:30px;background:#FAFBFC">${conteudo}</div>
    <div style="padding:15px;background:#f0f0f0;text-align:center;font-size:11px;color:#888">
      Mauro Monção Advogados Associados · ${PORTAL_URL}
    </div>
  </div>`
}

// ════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DO BANCO
// ════════════════════════════════════════════════════════════
async function initDB() {
  console.log('[DB] Inicializando tabelas PostgreSQL...')
  await query(`
    CREATE TABLE IF NOT EXISTS portal_admins (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      senha_hash  TEXT NOT NULL,
      nome        TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'admin',
      criado_em   TIMESTAMPTZ DEFAULT NOW()
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_clientes (
      id                       TEXT PRIMARY KEY,
      nome                     TEXT NOT NULL,
      email                    TEXT UNIQUE NOT NULL,
      senha_hash               TEXT NOT NULL,
      telefone                 TEXT DEFAULT '',
      whatsapp                 TEXT DEFAULT '',
      cidade                   TEXT DEFAULT '',
      uf                       TEXT DEFAULT '',
      tipo                     TEXT DEFAULT 'empresa',
      plano                    TEXT DEFAULT 'basico',
      cnpj_cpf                 TEXT DEFAULT '',
      responsavel              TEXT DEFAULT '',
      status_acesso            TEXT DEFAULT 'ativo',
      preferencia_comunicacao  TEXT[] DEFAULT ARRAY['whatsapp','email'],
      criado_em                TIMESTAMPTZ DEFAULT NOW(),
      ultimo_acesso            TIMESTAMPTZ
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_departamentos (
      id          TEXT PRIMARY KEY,
      cliente_id  TEXT NOT NULL REFERENCES portal_clientes(id) ON DELETE CASCADE,
      nome        TEXT NOT NULL,
      descricao   TEXT DEFAULT '',
      responsavel TEXT DEFAULT '',
      criado_em   TIMESTAMPTZ DEFAULT NOW()
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_procedimentos (
      id              TEXT PRIMARY KEY,
      cliente_id      TEXT NOT NULL REFERENCES portal_clientes(id) ON DELETE CASCADE,
      departamento_id TEXT DEFAULT '',
      titulo          TEXT NOT NULL,
      tipo_documento  TEXT DEFAULT 'Outro',
      descricao       TEXT DEFAULT '',
      status          TEXT DEFAULT 'aberto',
      canal_origem    TEXT DEFAULT 'portal',
      criado_em       TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em   TIMESTAMPTZ DEFAULT NOW()
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_mensagens_proc (
      id              TEXT PRIMARY KEY,
      procedimento_id TEXT NOT NULL REFERENCES portal_procedimentos(id) ON DELETE CASCADE,
      de              TEXT NOT NULL,
      texto           TEXT DEFAULT '',
      anexo           JSONB,
      canal           TEXT DEFAULT 'portal',
      lida            BOOLEAN DEFAULT FALSE,
      enviado_whatsapp BOOLEAN DEFAULT FALSE,
      enviado_email    BOOLEAN DEFAULT FALSE,
      enviado_em      TIMESTAMPTZ DEFAULT NOW()
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_processos (
      id               TEXT PRIMARY KEY,
      cliente_id       TEXT NOT NULL REFERENCES portal_clientes(id) ON DELETE CASCADE,
      numero           TEXT NOT NULL,
      titulo           TEXT DEFAULT '',
      area             TEXT DEFAULT '',
      tribunal         TEXT DEFAULT '',
      status           TEXT DEFAULT 'ativo',
      risco            TEXT DEFAULT 'baixo',
      resumo           TEXT DEFAULT '',
      proximo_prazo    TEXT,
      ultimo_movimento TIMESTAMPTZ DEFAULT NOW(),
      criado_em        TIMESTAMPTZ DEFAULT NOW()
    )`)

  await query(`
    CREATE TABLE IF NOT EXISTS portal_whatsapp_msgs (
      id                 TEXT PRIMARY KEY,
      cliente_id         TEXT NOT NULL REFERENCES portal_clientes(id) ON DELETE CASCADE,
      cliente_nome       TEXT DEFAULT '',
      whatsapp           TEXT DEFAULT '',
      email              TEXT DEFAULT '',
      texto              TEXT DEFAULT '',
      de                 TEXT NOT NULL,
      canal              TEXT DEFAULT 'whatsapp',
      procedimento_id    TEXT,
      procedimento_titulo TEXT,
      lida               BOOLEAN DEFAULT FALSE,
      enviado_em         TIMESTAMPTZ DEFAULT NOW()
    )`)

  // Índices para performance
  await query(`CREATE INDEX IF NOT EXISTS idx_proc_cliente    ON portal_procedimentos(cliente_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_msgs_proc       ON portal_mensagens_proc(procedimento_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_wa_cliente      ON portal_whatsapp_msgs(cliente_id)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_wa_nao_lidas    ON portal_whatsapp_msgs(lida, de)`)
  await query(`CREATE INDEX IF NOT EXISTS idx_processos_cli   ON portal_processos(cliente_id)`)

  // Garantir admins reais
  const admins = [
    { id: 'adm001', email: 'mauromoncaoestudos@gmail.com',         nome: 'Dr. Mauro Monção' },
    { id: 'adm002', email: 'mauromoncaoadv.escritorio@gmail.com',  nome: 'Dr. Mauro Monção' },
  ]
  for (const a of admins) {
    const existe = await query('SELECT id FROM portal_admins WHERE email=$1', [a.email])
    if (existe.rows.length === 0) {
      const hash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || '', 10)
      await query(
        'INSERT INTO portal_admins(id,email,senha_hash,nome,role) VALUES($1,$2,$3,$4,$5)',
        [a.id, a.email, hash, a.nome, 'admin']
      )
      console.log(`[DB] ✅ Admin criado: ${a.email}`)
    }
  }

  console.log('[DB] ✅ Banco pronto!')
}

// ════════════════════════════════════════════════════════════
// ROTAS
// ════════════════════════════════════════════════════════════

// ── Health ────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const [c, p, w] = await Promise.all([
      query('SELECT COUNT(*) FROM portal_clientes'),
      query('SELECT COUNT(*) FROM portal_procedimentos'),
      query('SELECT COUNT(*) FROM portal_whatsapp_msgs'),
    ])
    res.json({
      ok: true, service: 'Ben Portal Cliente API', port: PORT, version: '3.0.0',
      db: 'postgresql',
      clientes:       parseInt(c.rows[0].count),
      procedimentos:  parseInt(p.rows[0].count),
      mensagens_wa:   parseInt(w.rows[0].count),
      zapi_configurada: !!ZAPI_BASE,
      smtp_configurado: !!SMTP_PASS,
      timestamp: now(),
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// ── Auth Admin ────────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' })
  try {
    const r = await query('SELECT * FROM portal_admins WHERE email=$1', [email])
    const admin = r.rows[0]
    if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' })
    const ok = await bcrypt.compare(senha, admin.senha_hash)
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })
    const token = jwt.sign({ id: admin.id, email: admin.email, nome: admin.nome, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: admin.id, email: admin.email, nome: admin.nome, role: admin.role } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/auth/me', authAdmin, (req, res) => res.json({ user: req.admin }))

// ── Auth Cliente ──────────────────────────────────────────────
app.post('/cliente/auth/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' })
  try {
    const r = await query('SELECT * FROM portal_clientes WHERE email=$1', [email])
    const cliente = r.rows[0]
    if (!cliente) return res.status(401).json({ error: 'Credenciais inválidas' })
    const ok = await bcrypt.compare(senha, cliente.senha_hash)
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })
    if (cliente.status_acesso === 'bloqueado') return res.status(403).json({ error: 'Acesso bloqueado. Contate o escritório.' })
    await query('UPDATE portal_clientes SET ultimo_acesso=NOW() WHERE id=$1', [cliente.id])
    const depts = await query('SELECT * FROM portal_departamentos WHERE cliente_id=$1', [cliente.id])
    const token = jwt.sign({ id: cliente.id, email: cliente.email, nome: cliente.nome, role: 'cliente', cliente_id: cliente.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, cliente: { ...cliente, senha_hash: undefined, departamentos: depts.rows } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/cliente/auth/me', authCliente, async (req, res) => {
  try {
    const r = await query('SELECT * FROM portal_clientes WHERE id=$1', [req.clienteAuth.cliente_id])
    const cliente = r.rows[0]
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })
    const depts = await query('SELECT * FROM portal_departamentos WHERE cliente_id=$1', [cliente.id])
    res.json({ cliente: { ...cliente, senha_hash: undefined, departamentos: depts.rows } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Clientes ──────────────────────────────────────────────────
app.get('/clientes', authAdmin, async (req, res) => {
  try {
    const r = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM portal_procedimentos p WHERE p.cliente_id=c.id)::int  AS total_procedimentos,
        (SELECT COUNT(*) FROM portal_processos    pr WHERE pr.cliente_id=c.id)::int AS total_processos,
        (SELECT COUNT(*) FROM portal_whatsapp_msgs m WHERE m.cliente_id=c.id AND NOT m.lida AND m.de='cliente')::int AS mensagens_nao_lidas
      FROM portal_clientes c ORDER BY c.criado_em DESC`)
    res.json({ clientes: r.rows.map(c => ({ ...c, senha_hash: undefined })), total: r.rows.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/clientes', authAdmin, async (req, res) => {
  const { nome, email, senha, telefone, whatsapp, cidade, uf, tipo, plano, cnpj_cpf, responsavel } = req.body || {}
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha obrigatórios' })
  try {
    const existe = await query('SELECT id FROM portal_clientes WHERE email=$1', [email])
    if (existe.rows.length) return res.status(409).json({ error: 'E-mail já cadastrado' })
    const id   = 'PC' + Date.now()
    const hash = await bcrypt.hash(senha, 10)
    const wa   = (whatsapp || telefone || '').replace(/\D/g, '')
    await query(`
      INSERT INTO portal_clientes(id,nome,email,senha_hash,telefone,whatsapp,cidade,uf,tipo,plano,cnpj_cpf,responsavel,status_acesso,preferencia_comunicacao)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'ativo',ARRAY['whatsapp','email'])`,
      [id, nome, email, hash, telefone||'', wa, cidade||'', uf||'', tipo||'empresa', plano||'basico', cnpj_cpf||'', responsavel||''])
    const novo = (await query('SELECT * FROM portal_clientes WHERE id=$1', [id])).rows[0]
    console.log(`[PORTAL] ✅ Cliente criado: ${nome} (${email}) | WA: ${wa}`)
    res.status(201).json({ cliente: { ...novo, senha_hash: undefined } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/clientes/:id', authAdmin, async (req, res) => {
  try {
    const c = (await query('SELECT * FROM portal_clientes WHERE id=$1', [req.params.id])).rows[0]
    if (!c) return res.status(404).json({ error: 'Cliente não encontrado' })
    const [depts, procs, proced] = await Promise.all([
      query('SELECT * FROM portal_departamentos WHERE cliente_id=$1', [c.id]),
      query('SELECT * FROM portal_processos WHERE cliente_id=$1', [c.id]),
      query('SELECT * FROM portal_procedimentos WHERE cliente_id=$1', [c.id]),
    ])
    res.json({ cliente: { ...c, senha_hash: undefined, departamentos: depts.rows, processos: procs.rows, procedimentos: proced.rows } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/clientes/:id', authAdmin, async (req, res) => {
  try {
    const campos = ['nome','telefone','whatsapp','cidade','uf','tipo','plano','cnpj_cpf','responsavel','status_acesso']
    const sets = []; const vals = []
    campos.forEach(k => {
      if (req.body[k] !== undefined) { sets.push(`${k}=$${sets.length+1}`); vals.push(k==='whatsapp' ? req.body[k].replace(/\D/g,'') : req.body[k]) }
    })
    if (req.body.preferencia_comunicacao) { sets.push(`preferencia_comunicacao=$${sets.length+1}`); vals.push(req.body.preferencia_comunicacao) }
    if (req.body.senha) { sets.push(`senha_hash=$${sets.length+1}`); vals.push(await bcrypt.hash(req.body.senha,10)) }
    if (!sets.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' })
    vals.push(req.params.id)
    await query(`UPDATE portal_clientes SET ${sets.join(',')} WHERE id=$${vals.length}`, vals)
    const updated = (await query('SELECT * FROM portal_clientes WHERE id=$1',[req.params.id])).rows[0]
    res.json({ cliente: { ...updated, senha_hash: undefined } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Departamentos ─────────────────────────────────────────────
app.get('/clientes/:id/departamentos', authAdmin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM portal_departamentos WHERE cliente_id=$1 ORDER BY criado_em', [req.params.id])
    res.json({ departamentos: r.rows })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/clientes/:id/departamentos', authAdmin, async (req, res) => {
  const { nome, descricao, responsavel } = req.body || {}
  if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })
  try {
    const id = 'D' + Date.now()
    await query('INSERT INTO portal_departamentos(id,cliente_id,nome,descricao,responsavel) VALUES($1,$2,$3,$4,$5)',
      [id, req.params.id, nome, descricao||'', responsavel||''])
    const dept = (await query('SELECT * FROM portal_departamentos WHERE id=$1',[id])).rows[0]
    res.status(201).json({ departamento: dept })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Procedimentos ─────────────────────────────────────────────
app.get('/procedimentos', authAdmin, async (req, res) => {
  try {
    const { cliente_id } = req.query
    const r = cliente_id
      ? await query('SELECT * FROM portal_procedimentos WHERE cliente_id=$1 ORDER BY atualizado_em DESC',[cliente_id])
      : await query('SELECT * FROM portal_procedimentos ORDER BY atualizado_em DESC')
    res.json({ procedimentos: r.rows })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/procedimentos', async (req, res) => {
  const { cliente_id, departamento_id, titulo, tipo_documento, descricao } = req.body || {}
  if (!cliente_id || !titulo) return res.status(400).json({ error: 'cliente_id e titulo obrigatórios' })
  try {
    const id = 'PROC' + Date.now()
    await query(`INSERT INTO portal_procedimentos(id,cliente_id,departamento_id,titulo,tipo_documento,descricao,status)
      VALUES($1,$2,$3,$4,$5,$6,'aberto')`,
      [id, cliente_id, departamento_id||'', titulo, tipo_documento||'Outro', descricao||''])
    const proc = (await query('SELECT * FROM portal_procedimentos WHERE id=$1',[id])).rows[0]
    res.status(201).json({ procedimento: proc })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/procedimentos/:id', async (req, res) => {
  try {
    const p = (await query('SELECT * FROM portal_procedimentos WHERE id=$1',[req.params.id])).rows[0]
    if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })
    const msgs = await query('SELECT * FROM portal_mensagens_proc WHERE procedimento_id=$1 ORDER BY enviado_em',[p.id])
    res.json({ procedimento: { ...p, mensagens: msgs.rows } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/procedimentos/:id/mensagens', async (req, res) => {
  const { texto, de, anexo, enviar_whatsapp, enviar_email } = req.body || {}
  if (!texto && !anexo) return res.status(400).json({ error: 'texto ou anexo obrigatório' })
  if (!de || !['cliente','escritorio'].includes(de)) return res.status(400).json({ error: 'de deve ser cliente ou escritorio' })
  try {
    const p = (await query('SELECT * FROM portal_procedimentos WHERE id=$1',[req.params.id])).rows[0]
    if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })

    const id = 'MSG' + Date.now()
    await query(`INSERT INTO portal_mensagens_proc(id,procedimento_id,de,texto,anexo,lida,enviado_whatsapp,enviado_email)
      VALUES($1,$2,$3,$4,$5,$6,false,false)`,
      [id, p.id, de, texto||'', anexo ? JSON.stringify(anexo) : null, de==='escritorio'])
    await query(`UPDATE portal_procedimentos SET atualizado_em=NOW(),
      status=CASE WHEN status='aberto' AND $1='escritorio' THEN 'em_andamento' ELSE status END
      WHERE id=$2`, [de, p.id])

    // Se escritório respondeu → notificar cliente por WA e/ou e-mail
    if (de === 'escritorio') {
      const cliente = (await query('SELECT * FROM portal_clientes WHERE id=$1',[p.cliente_id])).rows[0]
      if (cliente) {
        const remetente = 'Dr. Mauro Monção | Advogados Associados'
        const deveWA    = enviar_whatsapp === true || (enviar_whatsapp !== false && cliente.preferencia_comunicacao?.includes('whatsapp'))
        const deveEmail = enviar_email    === true || (enviar_email    !== false && cliente.preferencia_comunicacao?.includes('email'))

        if (deveWA && cliente.whatsapp) {
          const waMsg = `📋 *Portal do Cliente — ${cliente.nome}*\n\n*${remetente}* enviou:\n\n${texto}\n\n_Procedimento: ${p.titulo}_\n_Responda: ${PORTAL_URL}_`
          const waResult = await zapiSendText(cliente.whatsapp, waMsg)
          if (waResult && !waResult.error) await query('UPDATE portal_mensagens_proc SET enviado_whatsapp=true WHERE id=$1',[id])
        }

        if (deveEmail && cliente.email) {
          const html = emailHtmlBase('Nova Mensagem no Procedimento', `
            <p>Olá, <strong>${cliente.nome}</strong></p>
            <p>Nova mensagem em: <strong>${p.titulo}</strong></p>
            <div style="background:#fff;border-left:4px solid #0f2044;padding:15px;margin:20px 0;border-radius:4px">
              <p style="margin:0;color:#333">${(texto||'').replace(/\n/g,'<br>')}</p>
            </div>
            ${anexo ? `<p>📎 Anexo: <strong>${anexo.nome}</strong></p>` : ''}
            <a href="${PORTAL_URL}" style="display:inline-block;background:#0f2044;color:#D4A017;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:15px">Acessar Portal</a>`)
          const eResult = await sendEmail({ to: cliente.email, subject: `📋 Nova mensagem — ${p.titulo}`, html, text: `${remetente}:\n\n${texto}` })
          if (eResult && !eResult.simulated) await query('UPDATE portal_mensagens_proc SET enviado_email=true WHERE id=$1',[id])
        }
      }
    }

    // Se cliente enviou → registrar como WA msg não lida para o escritório ver
    if (de === 'cliente') {
      const cliente = (await query('SELECT * FROM portal_clientes WHERE id=$1',[p.cliente_id])).rows[0]
      if (cliente) {
        await query(`INSERT INTO portal_whatsapp_msgs(id,cliente_id,cliente_nome,whatsapp,email,texto,de,canal,procedimento_id,procedimento_titulo,lida)
          VALUES($1,$2,$3,$4,$5,$6,'cliente','portal',$7,$8,false)`,
          ['WA'+Date.now(), cliente.id, cliente.nome, cliente.whatsapp||'', cliente.email||'', texto||'', p.id, p.titulo])
      }
    }

    const msg = (await query('SELECT * FROM portal_mensagens_proc WHERE id=$1',[id])).rows[0]
    res.status(201).json({ mensagem: msg })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/procedimentos/:id/documentos', async (req, res) => {
  try {
    const p = (await query('SELECT * FROM portal_procedimentos WHERE id=$1',[req.params.id])).rows[0]
    if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })
    const { nome, tipo, tamanho, de } = req.body || {}
    if (!nome) return res.status(400).json({ error: 'nome obrigatório' })
    const anexo = { nome, tipo: tipo||'PDF', tamanho: tamanho||'' }
    const id = 'MSG' + Date.now()
    await query(`INSERT INTO portal_mensagens_proc(id,procedimento_id,de,texto,anexo,lida)
      VALUES($1,$2,$3,$4,$5,false)`,
      [id, p.id, de||'escritorio', `📎 Documento: ${nome}`, JSON.stringify(anexo)])
    await query('UPDATE portal_procedimentos SET atualizado_em=NOW() WHERE id=$1',[p.id])
    res.status(201).json({ ok: true, mensagem: id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Processos ─────────────────────────────────────────────────
app.get('/processos', async (req, res) => {
  try {
    const { cliente_id } = req.query
    const r = cliente_id
      ? await query('SELECT * FROM portal_processos WHERE cliente_id=$1 ORDER BY criado_em DESC',[cliente_id])
      : await query('SELECT * FROM portal_processos ORDER BY criado_em DESC')
    res.json({ processos: r.rows })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/processos', authAdmin, async (req, res) => {
  const { cliente_id, numero, titulo, area, tribunal, status, risco, resumo, proximo_prazo } = req.body || {}
  if (!cliente_id || !numero) return res.status(400).json({ error: 'cliente_id e numero obrigatórios' })
  try {
    const id = 'PROC_' + Date.now()
    await query(`INSERT INTO portal_processos(id,cliente_id,numero,titulo,area,tribunal,status,risco,resumo,proximo_prazo)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, cliente_id, numero, titulo||'', area||'', tribunal||'', status||'ativo', risco||'baixo', resumo||'', proximo_prazo||null])
    const proc = (await query('SELECT * FROM portal_processos WHERE id=$1',[id])).rows[0]
    res.status(201).json({ processo: proc })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/processos/:id', async (req, res) => {
  try {
    const p = (await query('SELECT * FROM portal_processos WHERE id=$1',[req.params.id])).rows[0]
    if (!p) return res.status(404).json({ error: 'Processo não encontrado' })
    res.json({ processo: p })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/processos/:id/status', authAdmin, async (req, res) => {
  const { status, resumo, proximo_prazo } = req.body || {}
  try {
    const sets = ['ultimo_movimento=NOW()']; const vals = []
    if (status)           { sets.push(`status=$${vals.length+1}`);         vals.push(status) }
    if (resumo)           { sets.push(`resumo=$${vals.length+1}`);         vals.push(resumo) }
    if (proximo_prazo !== undefined) { sets.push(`proximo_prazo=$${vals.length+1}`); vals.push(proximo_prazo) }
    vals.push(req.params.id)
    await query(`UPDATE portal_processos SET ${sets.join(',')} WHERE id=$${vals.length}`, vals)
    const proc = (await query('SELECT * FROM portal_processos WHERE id=$1',[req.params.id])).rows[0]
    res.json({ processo: proc })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ════════════════════════════════════════════════════════════
// WHATSAPP
// ════════════════════════════════════════════════════════════
app.post('/webhook/whatsapp', async (req, res) => {
  const body = req.body || {}
  if (body?.fromMe) return res.json({ ok: true, cliente_encontrado: false, ignorado: 'mensagem_propria' })

  const phone = (body?.phone || body?.from || '').replace('@s.whatsapp.net','').replace(/\D/g,'')
  const text  = body?.text?.message || body?.message || body?.text || ''
  const nome  = body?.senderName || body?.pushName || ''
  if (!phone || !text?.trim()) return res.json({ ok: true, cliente_encontrado: false, ignorado: 'sem_dados' })

  try {
    // Busca cliente pelo número (últimos 11 ou 10 dígitos)
    const r = await query(`SELECT * FROM portal_clientes WHERE
      RIGHT(REGEXP_REPLACE(whatsapp,'\\D','','g'),11) = RIGHT($1,11)
      OR RIGHT(REGEXP_REPLACE(whatsapp,'\\D','','g'),10) = RIGHT($2,10)
      LIMIT 1`, [phone, phone])
    const cliente = r.rows[0]

    if (!cliente) {
      console.log(`[WH] ${phone} não é cliente — MARA responde`)
      return res.json({ ok: true, cliente_encontrado: false })
    }

    console.log(`[WH] ✅ Cliente: ${cliente.nome} | "${text.slice(0,80)}"`)

    // Registrar mensagem WA
    const waId = 'WA' + Date.now()
    await query(`INSERT INTO portal_whatsapp_msgs(id,cliente_id,cliente_nome,whatsapp,email,texto,de,canal,lida)
      VALUES($1,$2,$3,$4,$5,$6,'cliente','whatsapp',false)`,
      [waId, cliente.id, cliente.nome, phone, cliente.email||'', text])

    // Vincular ao procedimento aberto mais recente ou criar novo
    const procR = await query(`SELECT * FROM portal_procedimentos WHERE cliente_id=$1 AND status!='concluido'
      ORDER BY atualizado_em DESC LIMIT 1`, [cliente.id])
    let procId
    if (procR.rows.length) {
      procId = procR.rows[0].id
      const msgId = 'MSG' + Date.now()
      await query(`INSERT INTO portal_mensagens_proc(id,procedimento_id,de,texto,canal,lida)
        VALUES($1,$2,'cliente',$3,'whatsapp',false)`, [msgId, procId, text])
      await query('UPDATE portal_procedimentos SET atualizado_em=NOW() WHERE id=$1',[procId])
      await query('UPDATE portal_whatsapp_msgs SET procedimento_id=$1,procedimento_titulo=$2 WHERE id=$3',
        [procId, procR.rows[0].titulo, waId])
    } else {
      procId = 'PROC' + Date.now()
      const titulo = `Mensagem WhatsApp — ${new Date().toLocaleDateString('pt-BR')}`
      await query(`INSERT INTO portal_procedimentos(id,cliente_id,titulo,tipo_documento,status,canal_origem)
        VALUES($1,$2,$3,'Outro','aberto','whatsapp')`, [procId, cliente.id, titulo])
      const msgId = 'MSG' + Date.now()
      await query(`INSERT INTO portal_mensagens_proc(id,procedimento_id,de,texto,canal,lida)
        VALUES($1,$2,'cliente',$3,'whatsapp',false)`, [msgId, procId, text])
      await query('UPDATE portal_whatsapp_msgs SET procedimento_id=$1,procedimento_titulo=$2 WHERE id=$3',
        [procId, titulo, waId])
    }

    // Confirmação ao cliente
    const confirma = `✅ Olá, ${nome || cliente.nome.split(' ')[0]}! Sua mensagem foi recebida.\n\nAcompanhe a resposta:\n🔗 ${PORTAL_URL}\n\n_Mauro Monção Advogados Associados_`
    await zapiSendText(phone, confirma)

    return res.json({ ok: true, cliente_encontrado: true, procedimento_id: procId, cliente: cliente.nome })
  } catch (e) {
    console.error('[WH] Erro:', e.message)
    return res.json({ ok: true, cliente_encontrado: false, error: e.message })
  }
})

app.post('/mensagens/enviar', authAdmin, async (req, res) => {
  const { cliente_id, texto, procedimento_id, enviar_whatsapp, enviar_email, anexo } = req.body || {}
  if (!cliente_id || !texto) return res.status(400).json({ error: 'cliente_id e texto obrigatórios' })
  try {
    const cliente = (await query('SELECT * FROM portal_clientes WHERE id=$1',[cliente_id])).rows[0]
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })

    const wmId = 'WA' + Date.now()
    await query(`INSERT INTO portal_whatsapp_msgs(id,cliente_id,cliente_nome,whatsapp,email,texto,de,canal,procedimento_id,lida)
      VALUES($1,$2,$3,$4,$5,$6,'escritorio','portal',$7,true)`,
      [wmId, cliente.id, cliente.nome, cliente.whatsapp||'', cliente.email||'', texto, procedimento_id||null])

    const resultados = { whatsapp: null, email: null, portal: null }

    if (procedimento_id) {
      const p = (await query('SELECT * FROM portal_procedimentos WHERE id=$1',[procedimento_id])).rows[0]
      if (p) {
        const msgId = 'MSG' + Date.now()
        await query(`INSERT INTO portal_mensagens_proc(id,procedimento_id,de,texto,anexo,lida)
          VALUES($1,$2,'escritorio',$3,$4,true)`,
          [msgId, procedimento_id, texto, anexo ? JSON.stringify(anexo) : null])
        await query(`UPDATE portal_procedimentos SET atualizado_em=NOW(),
          status=CASE WHEN status='aberto' THEN 'em_andamento' ELSE status END WHERE id=$1`,[procedimento_id])
        resultados.portal = msgId
      }
    }

    const deveWA    = enviar_whatsapp !== false && cliente.whatsapp && cliente.preferencia_comunicacao?.includes('whatsapp')
    const deveEmail = enviar_email    === true  && cliente.email

    if (deveWA) {
      const proc = procedimento_id ? (await query('SELECT titulo FROM portal_procedimentos WHERE id=$1',[procedimento_id])).rows[0] : null
      const waMsg = `📋 *Portal do Cliente — ${cliente.nome}*\n\n*Dr. Mauro Monção | Advogados Associados* enviou:\n\n${texto}\n\n_${proc ? 'Procedimento: '+proc.titulo : 'Mensagem do escritório'}_\n_Responda: ${PORTAL_URL}_`
      const waResult = await zapiSendText(cliente.whatsapp, waMsg)
      resultados.whatsapp = waResult ? 'enviado' : 'erro'
    }

    if (deveEmail) {
      const proc = procedimento_id ? (await query('SELECT titulo FROM portal_procedimentos WHERE id=$1',[procedimento_id])).rows[0] : null
      const html = emailHtmlBase('Mensagem do Escritório', `
        <p>Olá, <strong>${cliente.nome}</strong></p>
        ${proc ? `<p>Procedimento: <strong>${proc.titulo}</strong></p>` : ''}
        <div style="background:#fff;border-left:4px solid #0f2044;padding:15px;margin:20px 0;border-radius:4px">
          <p style="margin:0;color:#333">${texto.replace(/\n/g,'<br>')}</p>
        </div>
        ${anexo ? `<p>📎 Documento: <strong>${anexo.nome}</strong></p>` : ''}
        <a href="${PORTAL_URL}" style="display:inline-block;background:#0f2044;color:#D4A017;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:15px">Acessar Portal</a>`)
      const eResult = await sendEmail({ to: cliente.email, subject: `📩 Mensagem do escritório${proc ? ' — '+proc.titulo : ''}`, html, text: texto })
      resultados.email = eResult ? 'enviado' : 'erro'
    }

    res.json({ ok: true, resultados })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/mensagens/historico/:cliente_id', authAdmin, async (req, res) => {
  try {
    const r = await query('SELECT * FROM portal_whatsapp_msgs WHERE cliente_id=$1 ORDER BY enviado_em',[req.params.cliente_id])
    res.json({ mensagens: r.rows, total: r.rows.length })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/mensagens/nao-lidas', authAdmin, async (req, res) => {
  try {
    const r = await query(`SELECT cliente_id, cliente_nome, COUNT(*)::int as total, MAX(enviado_em) as ultima
      FROM portal_whatsapp_msgs WHERE NOT lida AND de='cliente' GROUP BY cliente_id,cliente_nome`)
    const total = r.rows.reduce((s,x) => s+x.total, 0)
    res.json({ total, por_cliente: r.rows })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.patch('/mensagens/:id/lida', authAdmin, async (req, res) => {
  try {
    await query('UPDATE portal_whatsapp_msgs SET lida=true WHERE id=$1',[req.params.id])
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Rotas do cliente autenticado ──────────────────────────────
app.get('/cliente/procedimentos', authCliente, async (req, res) => {
  try {
    const { departamento_id } = req.query
    const base = `SELECT * FROM portal_procedimentos WHERE cliente_id=$1`
    const r = departamento_id
      ? await query(base+` AND departamento_id=$2 ORDER BY atualizado_em DESC`,[req.clienteAuth.cliente_id, departamento_id])
      : await query(base+` ORDER BY atualizado_em DESC`,[req.clienteAuth.cliente_id])
    const procedimentos = await Promise.all(r.rows.map(async p => {
      const msgs = await query('SELECT * FROM portal_mensagens_proc WHERE procedimento_id=$1 ORDER BY enviado_em',[p.id])
      return { ...p, mensagens: msgs.rows }
    }))
    res.json({ procedimentos })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/cliente/processos', authCliente, async (req, res) => {
  try {
    const r = await query('SELECT * FROM portal_processos WHERE cliente_id=$1 ORDER BY criado_em DESC',[req.clienteAuth.cliente_id])
    res.json({ processos: r.rows })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Start ─────────────────────────────────────────────────────
async function start() {
  try {
    await initDB()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 BEN Portal Cliente API v3.0 (PostgreSQL)`)
      console.log(`   Porta:   ${PORT}`)
      console.log(`   DB:      PostgreSQL → ${process.env.DB_NAME || 'ben_portal'}`)
      console.log(`   Z-API:   ${ZAPI_BASE ? '✅ Configurada' : '⚠️  Não configurada'}`)
      console.log(`   SMTP:    ${SMTP_PASS ? '✅ Configurado' : '⚠️  Não configurado'}`)
      console.log(`   Portal:  ${PORTAL_URL}`)
      console.log(`   Pronto!\n`)
    })
  } catch (e) {
    console.error('❌ Falha ao iniciar:', e.message)
    process.exit(1)
  }
}

start()
