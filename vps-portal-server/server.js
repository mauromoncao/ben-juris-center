// ============================================================
// BEN PORTAL DO CLIENTE — Backend API v2.0
// Porta: 3600 | VPS Hostinger: 181.215.135.202
//
// ROTAS:
//   GET  /health                              — status do serviço
//
//   ── Autenticação (admin escritório) ──
//   POST /auth/login                          — login admin
//   GET  /auth/me                             — dados do usuário logado
//
//   ── Autenticação (clientes portal) ──
//   POST /cliente/auth/login                  — login cliente (email + senha)
//   GET  /cliente/auth/me                     — dados do cliente logado
//
//   ── Clientes ──
//   GET  /clientes                            — listar clientes
//   POST /clientes                            — criar cliente
//   GET  /clientes/:id                        — detalhes do cliente
//   PATCH /clientes/:id                       — atualizar cliente
//
//   ── Departamentos ──
//   GET  /clientes/:id/departamentos          — listar departamentos
//   POST /clientes/:id/departamentos          — criar departamento
//
//   ── Procedimentos (chat + documento) ──
//   GET  /procedimentos?cliente_id=           — listar procedimentos
//   POST /procedimentos                       — criar procedimento
//   GET  /procedimentos/:id                   — detalhes + mensagens
//   POST /procedimentos/:id/mensagens         — enviar mensagem (escritório ou cliente)
//   POST /procedimentos/:id/documentos        — anexar documento ao procedimento
//
//   ── Processos ──
//   GET  /processos?cliente_id=               — listar processos
//   POST /processos                           — criar processo
//   GET  /processos/:id                       — detalhes
//   PATCH /processos/:id/status               — atualizar status
//
//   ── WhatsApp (Z-API via MARA - 5586999484761) ──
//   POST /webhook/whatsapp                    — receber mensagens do WhatsApp
//   POST /mensagens/enviar                    — enviar mensagem (WA + email opcional)
//   GET  /mensagens/historico/:cliente_id     — histórico de mensagens do cliente
//   GET  /mensagens/nao-lidas                 — total não lidas (admin)
//
// ============================================================

require('dotenv').config()

const express = require('express')
const cors    = require('cors')
const jwt     = require('jsonwebtoken')
const bcrypt  = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')

const app  = express()
const PORT = process.env.PORT || 3600

// ── Configurações ─────────────────────────────────────────────
const JWT_SECRET   = process.env.JWT_SECRET   || 'ben-portal-secret-2026'
const ZAPI_MARA_INSTANCE = process.env.MARA_ZAPI_INSTANCE_ID || process.env.ZAPI_INSTANCE_ID || ''
const ZAPI_MARA_TOKEN    = process.env.MARA_ZAPI_TOKEN       || process.env.ZAPI_TOKEN       || ''
const ZAPI_MARA_CLIENT   = process.env.MARA_ZAPI_CLIENT_TOKEN || process.env.ZAPI_CLIENT_TOKEN || ''
const ZAPI_BASE    = ZAPI_MARA_INSTANCE && ZAPI_MARA_TOKEN
  ? `https://api.z-api.io/instances/${ZAPI_MARA_INSTANCE}/token/${ZAPI_MARA_TOKEN}`
  : ''
// Número do Dr. Mauro que os clientes já conhecem (MARA / Escritório)
const ESCRITORIO_WHATSAPP = (process.env.PLANTONISTA_WHATSAPP || '5586999484761').replace(/\D/g, '')

// SMTP para envio de e-mail
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER || 'mauromoncaoadv.escritorio@gmail.com'
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || '"Mauro Monção Advogados" <mauromoncaoadv.escritorio@gmail.com>'

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── In-Memory Storage (substituível por banco de dados) ──────
// Para produção, substituir por SQLite/PostgreSQL
const db = {
  admins: [
    { id: 'adm001', email: 'mauromoncaoestudos@gmail.com', senha: bcrypt.hashSync('BenHub@Center2026', 10), nome: 'Dr. Mauro Monção', role: 'admin' },
    { id: 'adm002', email: 'mauromoncaoadv.escritorio@gmail.com', senha: bcrypt.hashSync('BenHub@Center2026', 10), nome: 'Dr. Mauro Monção', role: 'admin' },
  ],
  clientes: [],
  departamentos: [],
  procedimentos: [],
  mensagens_proc: [],
  processos: [],
  whatsapp_msgs: [],   // histórico de mensagens WhatsApp
}

// ── JWT Middleware ────────────────────────────────────────────
function authAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' })
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

function authCliente(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.clienteAuth = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// ── Helpers ───────────────────────────────────────────────────
function now() { return new Date().toISOString() }

async function zapiSendText(phone, message) {
  if (!ZAPI_BASE) {
    console.warn('[PORTAL-WA] Z-API não configurada — simulando envio para', phone)
    return { simulated: true }
  }
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (ZAPI_MARA_CLIENT) headers['Client-Token'] = ZAPI_MARA_CLIENT
    const r = await fetch(`${ZAPI_BASE}/send-text`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, message }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await r.json()
    if (r.ok) console.log(`[PORTAL-WA] ✅ WhatsApp enviado para ${phone}`)
    else console.error(`[PORTAL-WA] ❌ Erro WA:`, JSON.stringify(data).slice(0,200))
    return data
  } catch (e) {
    console.error('[PORTAL-WA] fetch error:', e.message)
    return null
  }
}

async function sendEmail({ to, subject, html, text }) {
  if (!SMTP_PASS) {
    console.warn('[PORTAL-MAIL] SMTP não configurado — simulando envio para', to)
    return { simulated: true }
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    const info = await transporter.sendMail({ from: SMTP_FROM, to, subject, html, text })
    console.log(`[PORTAL-MAIL] ✅ E-mail enviado para ${to}: ${info.messageId}`)
    return info
  } catch (e) {
    console.error('[PORTAL-MAIL] Erro:', e.message)
    return null
  }
}

function formatarMensagemWA(textoEscritorio, remetente, procedimentoTitulo, clienteNome) {
  return (
    `📋 *Portal do Cliente — ${clienteNome}*\n\n` +
    `*${remetente}* enviou uma mensagem:\n\n` +
    `${textoEscritorio}\n\n` +
    `_Procedimento: ${procedimentoTitulo}_\n` +
    `_Responda pelo portal: portaldocliente.mauromoncao.adv.br_`
  )
}

// ════════════════════════════════════════════════════════════
// ROTAS
// ════════════════════════════════════════════════════════════

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Ben Portal Cliente API',
    port: PORT,
    version: '2.0.0',
    clientes: db.clientes.length,
    procedimentos: db.procedimentos.length,
    mensagens_wa: db.whatsapp_msgs.length,
    zapi_configurada: !!ZAPI_BASE,
    smtp_configurado: !!SMTP_PASS,
    timestamp: now(),
  })
})

// ── Auth Admin ────────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' })

  const admin = db.admins.find(a => a.email === email)
  if (!admin) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ok = await bcrypt.compare(senha, admin.senha)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

  const token = jwt.sign({ id: admin.id, email: admin.email, nome: admin.nome, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id: admin.id, email: admin.email, nome: admin.nome, role: admin.role } })
})

app.get('/auth/me', authAdmin, (req, res) => {
  res.json({ user: req.admin })
})

// ── Auth Cliente ──────────────────────────────────────────────
app.post('/cliente/auth/login', async (req, res) => {
  const { email, senha } = req.body || {}
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' })

  const cliente = db.clientes.find(c => c.email === email)
  if (!cliente) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ok = await bcrypt.compare(senha, cliente.senha_hash)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

  if (cliente.status_acesso === 'bloqueado') return res.status(403).json({ error: 'Acesso bloqueado. Contate o escritório.' })

  // atualizar último acesso
  cliente.ultimo_acesso = now()

  const depts = db.departamentos.filter(d => d.cliente_id === cliente.id)
  const token = jwt.sign({ id: cliente.id, email: cliente.email, nome: cliente.nome, role: 'cliente', cliente_id: cliente.id }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, cliente: { ...cliente, senha_hash: undefined, departamentos: depts } })
})

app.get('/cliente/auth/me', authCliente, (req, res) => {
  const cliente = db.clientes.find(c => c.id === req.clienteAuth.cliente_id)
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })
  const depts = db.departamentos.filter(d => d.cliente_id === cliente.id)
  res.json({ cliente: { ...cliente, senha_hash: undefined, departamentos: depts } })
})

// ── Clientes (Admin) ──────────────────────────────────────────
app.get('/clientes', authAdmin, (req, res) => {
  const lista = db.clientes.map(c => ({
    ...c, senha_hash: undefined,
    total_procedimentos: db.procedimentos.filter(p => p.cliente_id === c.id).length,
    total_processos: db.processos.filter(p => p.cliente_id === c.id).length,
    mensagens_nao_lidas: db.whatsapp_msgs.filter(m => m.cliente_id === c.id && !m.lida && m.de === 'cliente').length,
  }))
  res.json({ clientes: lista, total: lista.length })
})

app.post('/clientes', authAdmin, async (req, res) => {
  const { nome, email, senha, telefone, whatsapp, cidade, uf, tipo, plano, cnpj_cpf, responsavel } = req.body || {}
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha obrigatórios' })

  if (db.clientes.find(c => c.email === email)) return res.status(409).json({ error: 'E-mail já cadastrado' })

  const id = 'PC' + Date.now()
  const novo = {
    id, nome, email,
    senha_hash: await bcrypt.hash(senha, 10),
    telefone: telefone || '',
    whatsapp: (whatsapp || telefone || '').replace(/\D/g, ''),
    cidade: cidade || '', uf: uf || '',
    tipo: tipo || 'empresa',
    plano: plano || 'basico',
    cnpj_cpf: cnpj_cpf || '',
    responsavel: responsavel || '',
    status_acesso: 'ativo',
    criado_em: now(),
    ultimo_acesso: null,
    preferencia_comunicacao: ['whatsapp', 'email'],
  }
  db.clientes.push(novo)
  console.log(`[PORTAL] ✅ Cliente criado: ${nome} (${email}) | WA: ${novo.whatsapp}`)
  res.status(201).json({ cliente: { ...novo, senha_hash: undefined } })
})

app.get('/clientes/:id', authAdmin, (req, res) => {
  const c = db.clientes.find(c => c.id === req.params.id)
  if (!c) return res.status(404).json({ error: 'Cliente não encontrado' })
  const depts = db.departamentos.filter(d => d.cliente_id === c.id)
  const procs = db.processos.filter(p => p.cliente_id === c.id)
  const proced = db.procedimentos.filter(p => p.cliente_id === c.id)
  res.json({ cliente: { ...c, senha_hash: undefined, departamentos: depts, processos: procs, procedimentos: proced } })
})

app.patch('/clientes/:id', authAdmin, async (req, res) => {
  const idx = db.clientes.findIndex(c => c.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Cliente não encontrado' })
  const campos = ['nome','telefone','whatsapp','cidade','uf','tipo','plano','cnpj_cpf','responsavel','status_acesso','preferencia_comunicacao']
  campos.forEach(k => { if (req.body[k] !== undefined) db.clientes[idx][k] = req.body[k] })
  if (req.body.senha) db.clientes[idx].senha_hash = await bcrypt.hash(req.body.senha, 10)
  if (req.body.whatsapp) db.clientes[idx].whatsapp = req.body.whatsapp.replace(/\D/g, '')
  res.json({ cliente: { ...db.clientes[idx], senha_hash: undefined } })
})

// ── Departamentos ─────────────────────────────────────────────
app.get('/clientes/:id/departamentos', authAdmin, (req, res) => {
  const depts = db.departamentos.filter(d => d.cliente_id === req.params.id)
  res.json({ departamentos: depts })
})

app.post('/clientes/:id/departamentos', authAdmin, (req, res) => {
  const { nome, descricao, responsavel } = req.body || {}
  if (!nome) return res.status(400).json({ error: 'Nome obrigatório' })
  const dept = { id: 'D' + Date.now(), cliente_id: req.params.id, nome, descricao: descricao || '', responsavel: responsavel || '', criado_em: now() }
  db.departamentos.push(dept)
  res.status(201).json({ departamento: dept })
})

// ── Procedimentos (chat + documento) ─────────────────────────
app.get('/procedimentos', authAdmin, (req, res) => {
  const { cliente_id } = req.query
  let lista = cliente_id ? db.procedimentos.filter(p => p.cliente_id === cliente_id) : db.procedimentos
  lista = lista.map(p => ({
    ...p,
    total_mensagens: db.mensagens_proc.filter(m => m.procedimento_id === p.id).length,
    ultima_msg: db.mensagens_proc.filter(m => m.procedimento_id === p.id).slice(-1)[0] || null,
  }))
  res.json({ procedimentos: lista })
})

app.post('/procedimentos', (req, res) => {
  // pode ser criado pelo cliente ou pelo escritório
  const { cliente_id, departamento_id, titulo, tipo_documento, descricao } = req.body || {}
  if (!cliente_id || !titulo) return res.status(400).json({ error: 'cliente_id e titulo obrigatórios' })
  const proc = {
    id: 'PROC' + Date.now(), cliente_id, departamento_id: departamento_id || '',
    titulo, tipo_documento: tipo_documento || 'Outro',
    descricao: descricao || '', status: 'aberto',
    criado_em: now(), atualizado_em: now(),
  }
  db.procedimentos.push(proc)
  res.status(201).json({ procedimento: proc })
})

app.get('/procedimentos/:id', (req, res) => {
  const p = db.procedimentos.find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })
  const msgs = db.mensagens_proc.filter(m => m.procedimento_id === p.id)
  res.json({ procedimento: { ...p, mensagens: msgs } })
})

app.post('/procedimentos/:id/mensagens', async (req, res) => {
  const p = db.procedimentos.find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })

  const { texto, de, anexo, enviar_whatsapp, enviar_email } = req.body || {}
  if (!texto && !anexo) return res.status(400).json({ error: 'texto ou anexo obrigatório' })
  if (!de || !['cliente', 'escritorio'].includes(de)) return res.status(400).json({ error: 'de deve ser cliente ou escritorio' })

  const msg = {
    id: 'MSG' + Date.now(), procedimento_id: p.id, de,
    texto: texto || '',
    anexo: anexo || null,
    enviado_em: now(), lida: de === 'cliente' ? false : true,
    enviado_whatsapp: false, enviado_email: false,
  }
  db.mensagens_proc.push(msg)
  p.atualizado_em = now()
  if (de === 'escritorio' && p.status === 'aberto') p.status = 'em_andamento'

  // Buscar dados do cliente
  const cliente = db.clientes.find(c => c.id === p.cliente_id)

  // Se escritório respondeu → notificar cliente por WA e/ou email
  if (de === 'escritorio' && cliente) {
    const remetente = 'Dr. Mauro Monção | Advogados Associados'

    // Enviar WhatsApp se solicitado ou se cliente prefere WA
    const deveWA = enviar_whatsapp === true ||
      (enviar_whatsapp !== false && cliente.preferencia_comunicacao?.includes('whatsapp'))

    if (deveWA && cliente.whatsapp) {
      const waMsg = formatarMensagemWA(texto, remetente, p.titulo, cliente.nome)
      const waResult = await zapiSendText(cliente.whatsapp, waMsg)
      if (waResult && !waResult.error) msg.enviado_whatsapp = true
    }

    // Enviar e-mail se solicitado
    const deveEmail = enviar_email === true ||
      (enviar_email !== false && cliente.preferencia_comunicacao?.includes('email'))

    if (deveEmail && cliente.email) {
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0f2044;padding:20px;text-align:center">
            <h2 style="color:#D4A017;margin:0">Mauro Monção Advogados Associados</h2>
            <p style="color:#ffffff;margin:5px 0;font-size:12px">Portal do Cliente — Nova Mensagem</p>
          </div>
          <div style="padding:30px;background:#FAFBFC">
            <p>Olá, <strong>${cliente.nome}</strong></p>
            <p>Você recebeu uma nova mensagem no procedimento <strong>${p.titulo}</strong>:</p>
            <div style="background:#ffffff;border-left:4px solid #0f2044;padding:15px;margin:20px 0;border-radius:4px">
              <p style="margin:0;color:#333">${texto?.replace(/\n/g, '<br>') || ''}</p>
            </div>
            ${anexo ? `<p>📎 Documento anexado: <strong>${anexo.nome}</strong></p>` : ''}
            <a href="https://portaldocliente.mauromoncao.adv.br" 
              style="display:inline-block;background:#0f2044;color:#D4A017;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:15px">
              Acessar Portal do Cliente
            </a>
          </div>
          <div style="padding:15px;background:#f0f0f0;text-align:center;font-size:11px;color:#888">
            Mauro Monção Advogados Associados · portaldocliente.mauromoncao.adv.br
          </div>
        </div>`
      const emailResult = await sendEmail({
        to: cliente.email,
        subject: `📋 Nova mensagem — ${p.titulo}`,
        html: emailHtml,
        text: `Nova mensagem de ${remetente}:\n\n${texto}`,
      })
      if (emailResult && !emailResult.simulated) msg.enviado_email = true
    }
  }

  // Se o cliente enviou mensagem → registrar como WhatsApp msg não lida para o escritório
  if (de === 'cliente' && cliente) {
    const wamsg = {
      id: 'WA' + Date.now(), cliente_id: cliente.id, cliente_nome: cliente.nome,
      whatsapp: cliente.whatsapp || '', email: cliente.email,
      texto: texto || '', de: 'cliente',
      procedimento_id: p.id, procedimento_titulo: p.titulo,
      enviado_em: now(), lida: false,
    }
    db.whatsapp_msgs.push(wamsg)
  }

  res.status(201).json({ mensagem: msg })
})

app.post('/procedimentos/:id/documentos', (req, res) => {
  const p = db.procedimentos.find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Procedimento não encontrado' })
  const { nome, tipo, tamanho, base64, de } = req.body || {}
  if (!nome) return res.status(400).json({ error: 'nome obrigatório' })
  const doc = { id: 'DOC' + Date.now(), nome, tipo: tipo || 'PDF', tamanho: tamanho || '', base64: base64 || '', de: de || 'escritorio', criado_em: now() }
  const msg = {
    id: 'MSG' + Date.now(), procedimento_id: p.id, de: de || 'escritorio',
    texto: `📎 Documento: ${nome}`, anexo: { nome, tipo: doc.tipo, tamanho: doc.tamanho },
    enviado_em: now(), lida: false,
  }
  db.mensagens_proc.push(msg)
  p.atualizado_em = now()
  res.status(201).json({ documento: doc, mensagem: msg })
})

// ── Processos ─────────────────────────────────────────────────
app.get('/processos', (req, res) => {
  const { cliente_id } = req.query
  const lista = cliente_id ? db.processos.filter(p => p.cliente_id === cliente_id) : db.processos
  res.json({ processos: lista })
})

app.post('/processos', authAdmin, (req, res) => {
  const { cliente_id, numero, titulo, area, tribunal, status, risco, resumo, proximo_prazo } = req.body || {}
  if (!cliente_id || !numero) return res.status(400).json({ error: 'cliente_id e numero obrigatórios' })
  const proc = {
    id: 'PROC_' + Date.now(), cliente_id, numero, titulo: titulo || '',
    area: area || '', tribunal: tribunal || '', status: status || 'ativo',
    risco: risco || 'baixo', resumo: resumo || '', proximo_prazo: proximo_prazo || null,
    ultimo_movimento: now(), criado_em: now(),
  }
  db.processos.push(proc)
  res.status(201).json({ processo: proc })
})

app.get('/processos/:id', (req, res) => {
  const p = db.processos.find(p => p.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Processo não encontrado' })
  res.json({ processo: p })
})

app.patch('/processos/:id/status', authAdmin, (req, res) => {
  const idx = db.processos.findIndex(p => p.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Processo não encontrado' })
  const { status, resumo, proximo_prazo } = req.body || {}
  if (status) db.processos[idx].status = status
  if (resumo) db.processos[idx].resumo = resumo
  if (proximo_prazo !== undefined) db.processos[idx].proximo_prazo = proximo_prazo
  db.processos[idx].ultimo_movimento = now()
  res.json({ processo: db.processos[idx] })
})

// ════════════════════════════════════════════════════════════
// WHATSAPP — WEBHOOK + ENVIO + HISTÓRICO
// ════════════════════════════════════════════════════════════

// ── POST /webhook/whatsapp ────────────────────────────────────
// Recebe mensagens da Z-API (canal MARA 5586999484761)
// Identifica se o remetente é um cliente cadastrado
// Se for → armazena como mensagem do cliente no histórico e na aba do procedimento
//          e retorna { ok: true, cliente_encontrado: true, procedimento_id: ... }
// Se não for → retorna { ok: true, cliente_encontrado: false }
//             (passará para o handler do MARA sem resposta automática)
app.post('/webhook/whatsapp', async (req, res) => {

  const body = req.body || {}
  console.log('[PORTAL-WH] Webhook recebido:', JSON.stringify(body).slice(0, 300))

  const fromMe  = body?.fromMe || false
  if (fromMe) return res.status(200).json({ ok: true, cliente_encontrado: false, ignorado: 'mensagem_propria' })

  const phone = (body?.phone || body?.from || '').replace('@s.whatsapp.net', '').replace(/\D/g, '')
  const text  = body?.text?.message || body?.message || body?.text || ''
  const nome  = body?.senderName || body?.pushName || ''

  if (!phone || !text?.trim()) return res.status(200).json({ ok: true, cliente_encontrado: false, ignorado: 'sem_dados' })

  // Verificar se o número pertence a algum cliente cadastrado
  const clienteMatch = db.clientes.find(c => {
    const wa = (c.whatsapp || '').replace(/\D/g, '')
    if (!wa) return false
    // comparar últimos 11 dígitos (evita problema de prefixo +55)
    return wa.slice(-11) === phone.slice(-11) || wa.slice(-10) === phone.slice(-10)
  })

  if (!clienteMatch) {
    console.log(`[PORTAL-WH] Número ${phone} não é cliente cadastrado — passará para MARA`)
    return res.status(200).json({ ok: true, cliente_encontrado: false })
  }

  console.log(`[PORTAL-WH] ✅ Mensagem de cliente: ${clienteMatch.nome} (${phone}): "${text.slice(0,100)}"`)

  // Registrar como mensagem WhatsApp não lida
  const wamsg = {
    id: 'WA' + Date.now(),
    cliente_id: clienteMatch.id,
    cliente_nome: clienteMatch.nome,
    whatsapp: phone,
    email: clienteMatch.email,
    texto: text,
    de: 'cliente',
    canal: 'whatsapp',
    procedimento_id: null, // sem vínculo direto com procedimento (será vinculado pelo escritório)
    procedimento_titulo: null,
    enviado_em: now(),
    lida: false,
  }
  db.whatsapp_msgs.push(wamsg)

  // Verificar se existe procedimento aberto para este cliente (sem departamento específico)
  // Se existir, adicionar a mensagem ao procedimento aberto mais recente
  const procAberto = db.procedimentos
    .filter(p => p.cliente_id === clienteMatch.id && p.status !== 'concluido')
    .sort((a, b) => new Date(b.atualizado_em) - new Date(a.atualizado_em))[0]

  if (procAberto) {
    const msgProc = {
      id: 'MSG' + Date.now(), procedimento_id: procAberto.id, de: 'cliente',
      texto: text, canal: 'whatsapp', anexo: null,
      enviado_em: now(), lida: false,
    }
    db.mensagens_proc.push(msgProc)
    procAberto.atualizado_em = now()
    wamsg.procedimento_id = procAberto.id
    wamsg.procedimento_titulo = procAberto.titulo
    console.log(`[PORTAL-WH] ✅ Mensagem vinculada ao procedimento: ${procAberto.titulo}`)
  } else {
    // Criar procedimento automático "Mensagem via WhatsApp"
    const novoProcedimento = {
      id: 'PROC' + Date.now(),
      cliente_id: clienteMatch.id,
      departamento_id: '',
      titulo: `Mensagem WhatsApp — ${new Date().toLocaleDateString('pt-BR')}`,
      tipo_documento: 'Outro',
      descricao: 'Procedimento criado automaticamente via mensagem WhatsApp',
      status: 'aberto',
      criado_em: now(),
      atualizado_em: now(),
      canal_origem: 'whatsapp',
    }
    db.procedimentos.push(novoProcedimento)
    const msgProc = {
      id: 'MSG' + Date.now(), procedimento_id: novoProcedimento.id, de: 'cliente',
      texto: text, canal: 'whatsapp', anexo: null,
      enviado_em: now(), lida: false,
    }
    db.mensagens_proc.push(msgProc)
    wamsg.procedimento_id = novoProcedimento.id
    wamsg.procedimento_titulo = novoProcedimento.titulo
    console.log(`[PORTAL-WH] ✅ Procedimento automático criado: ${novoProcedimento.id}`)
  }

  // Enviar confirmação de recebimento ao cliente via WhatsApp
  const confirmacao = `✅ Olá, ${nome || clienteMatch.nome.split(' ')[0]}! Sua mensagem foi recebida.\n\nAcompanhe a resposta do escritório pelo Portal do Cliente:\n🔗 portaldocliente.mauromoncao.adv.br\n\n_Mauro Monção Advogados Associados_`
  await zapiSendText(phone, confirmacao)

  // Retornar cliente_encontrado: true para o roteador MARA não responder automaticamente
  return res.status(200).json({
    ok: true,
    cliente_encontrado: true,
    procedimento_id: wamsg.procedimento_id,
    cliente: clienteMatch.nome,
  })
})

// ── POST /mensagens/enviar ─────────────────────────────────────
// Escritório envia mensagem para o cliente via WA e/ou email
app.post('/mensagens/enviar', authAdmin, async (req, res) => {
  const { cliente_id, texto, procedimento_id, enviar_whatsapp, enviar_email, anexo } = req.body || {}
  if (!cliente_id || !texto) return res.status(400).json({ error: 'cliente_id e texto obrigatórios' })

  const cliente = db.clientes.find(c => c.id === cliente_id)
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' })

  const resultados = { whatsapp: null, email: null, portal: null }

  // Registrar no histórico de mensagens WhatsApp
  const wmsg = {
    id: 'WA' + Date.now(), cliente_id, cliente_nome: cliente.nome,
    whatsapp: cliente.whatsapp, email: cliente.email,
    texto, de: 'escritorio', canal: 'portal',
    procedimento_id: procedimento_id || null,
    enviado_em: now(), lida: true,
  }
  db.whatsapp_msgs.push(wmsg)

  // Se vinculado a procedimento → adicionar mensagem no chat
  if (procedimento_id) {
    const proc = db.procedimentos.find(p => p.id === procedimento_id)
    if (proc) {
      const msgProc = {
        id: 'MSG' + Date.now(), procedimento_id, de: 'escritorio',
        texto, anexo: anexo || null, enviado_em: now(), lida: true,
      }
      db.mensagens_proc.push(msgProc)
      proc.atualizado_em = now()
      if (proc.status === 'aberto') proc.status = 'em_andamento'
      resultados.portal = msgProc.id
    }
  }

  // Enviar WhatsApp
  if (enviar_whatsapp !== false && cliente.whatsapp && cliente.preferencia_comunicacao?.includes('whatsapp')) {
    const proc = db.procedimentos.find(p => p.id === procedimento_id)
    const waMsg = formatarMensagemWA(texto, 'Dr. Mauro Monção | Advogados Associados', proc?.titulo || 'Mensagem do escritório', cliente.nome)
    const waResult = await zapiSendText(cliente.whatsapp, waMsg)
    resultados.whatsapp = waResult ? 'enviado' : 'erro'
  }

  // Enviar email
  if (enviar_email === true && cliente.email) {
    const proc = db.procedimentos.find(p => p.id === procedimento_id)
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f2044;padding:20px;text-align:center">
          <h2 style="color:#D4A017;margin:0">Mauro Monção Advogados Associados</h2>
          <p style="color:#ffffff;margin:5px 0;font-size:12px">Mensagem do Escritório</p>
        </div>
        <div style="padding:30px;background:#FAFBFC">
          <p>Olá, <strong>${cliente.nome}</strong></p>
          ${proc ? `<p>Referente ao procedimento: <strong>${proc.titulo}</strong></p>` : ''}
          <div style="background:#ffffff;border-left:4px solid #0f2044;padding:15px;margin:20px 0;border-radius:4px">
            <p style="margin:0;color:#333">${texto.replace(/\n/g, '<br>')}</p>
          </div>
          ${anexo ? `<p>📎 Documento: <strong>${anexo.nome}</strong></p>` : ''}
          <a href="https://portaldocliente.mauromoncao.adv.br" 
            style="display:inline-block;background:#0f2044;color:#D4A017;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:15px">
            Acessar Portal do Cliente
          </a>
        </div>
        <div style="padding:15px;background:#f0f0f0;text-align:center;font-size:11px;color:#888">
          Mauro Monção Advogados Associados · portaldocliente.mauromoncao.adv.br
        </div>
      </div>`
    const emailResult = await sendEmail({
      to: cliente.email,
      subject: `📩 Mensagem do escritório${proc ? ` — ${proc.titulo}` : ''}`,
      html: emailHtml,
      text: texto,
    })
    resultados.email = emailResult ? 'enviado' : 'erro'
  }

  res.json({ ok: true, mensagem: wmsg, resultados })
})

// ── GET /mensagens/historico/:cliente_id ─────────────────────
// Histórico de mensagens WhatsApp/portal de um cliente (admin)
app.get('/mensagens/historico/:cliente_id', authAdmin, (req, res) => {
  const msgs = db.whatsapp_msgs
    .filter(m => m.cliente_id === req.params.cliente_id)
    .sort((a, b) => new Date(a.enviado_em) - new Date(b.enviado_em))
  res.json({ mensagens: msgs, total: msgs.length })
})

// ── GET /mensagens/nao-lidas ──────────────────────────────────
// Total de mensagens não lidas por cliente (painel admin)
app.get('/mensagens/nao-lidas', authAdmin, (req, res) => {
  const naolidas = db.whatsapp_msgs.filter(m => !m.lida && m.de === 'cliente')
  const porCliente = {}
  naolidas.forEach(m => {
    if (!porCliente[m.cliente_id]) porCliente[m.cliente_id] = { cliente_id: m.cliente_id, cliente_nome: m.cliente_nome, total: 0, ultima: null }
    porCliente[m.cliente_id].total++
    porCliente[m.cliente_id].ultima = m.enviado_em
  })
  res.json({ total: naolidas.length, por_cliente: Object.values(porCliente) })
})

// ── PATCH /mensagens/:id/lida ─────────────────────────────────
app.patch('/mensagens/:id/lida', authAdmin, (req, res) => {
  const msg = db.whatsapp_msgs.find(m => m.id === req.params.id)
  if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' })
  msg.lida = true
  res.json({ ok: true })
})

// ── Procedimentos do cliente (acesso pelo portal público) ─────
app.get('/cliente/procedimentos', authCliente, (req, res) => {
  const { departamento_id } = req.query
  let lista = db.procedimentos.filter(p => p.cliente_id === req.clienteAuth.cliente_id)
  if (departamento_id) lista = lista.filter(p => p.departamento_id === departamento_id)
  lista = lista.map(p => ({
    ...p,
    mensagens: db.mensagens_proc.filter(m => m.procedimento_id === p.id),
  }))
  res.json({ procedimentos: lista })
})

// Processos do cliente
app.get('/cliente/processos', authCliente, (req, res) => {
  const { departamento_id } = req.query
  const lista = db.processos.filter(p => p.cliente_id === req.clienteAuth.cliente_id)
  res.json({ processos: lista })
})

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 BEN Portal Cliente API v2.0`)
  console.log(`   Porta: ${PORT}`)
  console.log(`   Z-API (MARA): ${ZAPI_BASE ? '✅ Configurada' : '⚠️ Não configurada — simular envios'}`)
  console.log(`   SMTP Email: ${SMTP_PASS ? '✅ Configurado' : '⚠️ Não configurado — simular envios'}`)
  console.log(`   WhatsApp escritório: ${ESCRITORIO_WHATSAPP}`)
  console.log(`   Pronto!\n`)
})
