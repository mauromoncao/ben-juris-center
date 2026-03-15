// ============================================================
// BEN ECOSYSTEM — Integration Bridge API (JURIS)
// Rota: /api/bridge
// Comunicação bidirecional: Ben Growth Center ↔ Ben Juris Center
// Backend: Supabase (tabela cross_module_events)
// ============================================================

export const config = { maxDuration: 30 }

const SUPABASE_URL  = process.env.DATABASE_URL       // connection string
const SUPABASE_REST = process.env.SUPABASE_REST_URL  // ex: https://xxx.supabase.co
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY  // anon key pública
const JURIS_URL     = 'https://juris.mauromoncao.adv.br'
const GROWTH_URL    = 'https://bengrowth.mauromoncao.adv.br'
const BRIDGE_SECRET = process.env.JWT_SECRET || 'ben_jwt_mauro_moncao_2026_enterprise_secret_key_advogados'

// ── Helpers ──────────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Ben-Module')
}

function gerarId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ── Supabase REST helper ──────────────────────────────────────
async function supabaseInsert(tabela, payload) {
  if (!SUPABASE_REST || !SUPABASE_KEY) return { mock: true }
  const r = await fetch(`${SUPABASE_REST}/rest/v1/${tabela}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  })
  return r.json()
}

async function supabaseSelect(tabela, filtros = '') {
  if (!SUPABASE_REST || !SUPABASE_KEY) return []
  const r = await fetch(`${SUPABASE_REST}/rest/v1/${tabela}?${filtros}&order=created_at.desc&limit=50`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  return r.json()
}

// ── Notificar o módulo destino via webhook ────────────────────
async function notificarModuloDestino(evento) {
  const destUrl = evento.destino === 'juris'
    ? `${JURIS_URL}/api/bridge`
    : `${GROWTH_URL}/api/bridge`
  try {
    await fetch(destUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ben-Module': evento.origem,
        Authorization: `Bearer ${BRIDGE_SECRET}`,
      },
      body: JSON.stringify({ action: 'receber_evento', evento }),
    })
  } catch (e) {
    console.warn('[Bridge] Falha ao notificar módulo destino:', e.message)
  }
}

// ═══════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.method === 'GET' ? req.query : (req.body || {})

  try {
    // ── GET /api/bridge?action=listar ─────────────────────────
    if (req.method === 'GET' && action === 'listar') {
      const modulo = req.query.modulo || 'growth'
      const eventos = await supabaseSelect(
        'cross_module_events',
        `or=(origem.eq.${modulo},destino.eq.${modulo})`
      )
      // Fallback: retorna eventos mock se Supabase não configurado
      if (!Array.isArray(eventos) || eventos.length === 0) {
        return res.status(200).json({ success: true, eventos: MOCK_EVENTS_JURIS, fonte: 'mock' })
      }
      return res.status(200).json({ success: true, eventos, fonte: 'supabase' })
    }

    // ── GET /api/bridge?action=status ────────────────────────
    if (req.method === 'GET' && action === 'status') {
      const supabaseOk = !!(SUPABASE_REST && SUPABASE_KEY)
      return res.status(200).json({
        success: true,
        modulo: 'ben-juris-center',
        versao: '2.0',
        supabase: supabaseOk ? 'conectado' : 'mock',
        juris_url: JURIS_URL,
        growth_url: GROWTH_URL,
        timestamp: new Date().toISOString(),
        eventos_suportados: [
          'LEAD_QUALIFICADO', 'CLIENTE_ATIVO', 'CONTRATO_ASSINADO',
          'PROCESSO_ABERTO', 'HONORARIO_PAGO', 'ALERTA_PRAZO',
          'CAMPANHA_ATIVADA', 'RELATORIO_CONSOLIDADO',
        ],
      })
    }

    // ── POST: enviar evento para o Juris ─────────────────────
    if (req.method === 'POST' && action === 'enviar_evento') {
      const { tipo, destino = 'juris', payload = {}, agenteOrigem } = req.body

      if (!tipo) return res.status(400).json({ error: 'tipo é obrigatório' })

      const evento = {
        id: gerarId(),
        tipo,
        origem: 'juris',
        destino,
        timestamp: new Date().toISOString(),
        payload,
        status: 'pendente',
        agenteOrigem: agenteOrigem || 'Dr. Ben Growth',
        created_at: new Date().toISOString(),
      }

      // Salvar no Supabase
      await supabaseInsert('cross_module_events', evento)

      // Notificar o módulo destino
      await notificarModuloDestino(evento)
      evento.status = 'entregue'

      console.log('[Bridge Growth→Juris]', tipo, JSON.stringify(payload).slice(0, 100))
      return res.status(200).json({ success: true, evento })
    }

    // ── POST: envio de lead qualificado (atalho) ─────────────
    if (req.method === 'POST' && action === 'enviar_lead') {
      const { nome, telefone, email, area, score, valorEstimado, urgencia, origem: origemLead } = req.body

      const payload = { nome, telefone, email, area, score, valorEstimado, urgencia, origemLead }
      const evento = {
        id: gerarId(),
        tipo: 'LEAD_QUALIFICADO',
        origem: 'juris',
        destino: 'growth',
        timestamp: new Date().toISOString(),
        payload,
        status: 'pendente',
        agenteOrigem: 'Dr. Ben Juris CRM',
        created_at: new Date().toISOString(),
      }

      await supabaseInsert('cross_module_events', evento)
      await notificarModuloDestino(evento)
      evento.status = 'entregue'

      return res.status(200).json({ success: true, evento, mensagem: `Lead ${nome} enviado ao Juris Center` })
    }

    // ── POST: receber evento vindo do Juris ──────────────────
    if (req.method === 'POST' && action === 'receber_evento') {
      const authHeader = req.headers.authorization || ''
      if (!authHeader.includes(BRIDGE_SECRET)) {
        return res.status(401).json({ error: 'Não autorizado' })
      }
      const { evento } = req.body
      if (!evento) return res.status(400).json({ error: 'evento ausente' })

      // Salvar evento recebido localmente
      await supabaseInsert('cross_module_events', { ...evento, recebido_em: new Date().toISOString() })

      // Processar automaticamente por tipo
      await processarEventoRecebido(evento)

      console.log('[Bridge Juris→Growth] Evento recebido:', evento.tipo)
      return res.status(200).json({ success: true, processado: true })
    }

    // ── POST: sincronizar (pull do Juris) ─────────────────────
    if (req.method === 'POST' && action === 'sincronizar') {
      try {
        const r = await fetch(`${JURIS_URL}/api/bridge?action=listar&modulo=juris`, {
          headers: { Authorization: `Bearer ${BRIDGE_SECRET}` },
        })
        const data = await r.json()
        return res.status(200).json({
          success: true,
          mensagem: 'Sincronização concluída',
          eventos_juris: data.eventos?.length || 0,
          timestamp: new Date().toISOString(),
        })
      } catch (e) {
        return res.status(200).json({
          success: false,
          mensagem: 'Juris Center indisponível no momento',
          erro: e.message,
        })
      }
    }

    return res.status(400).json({ error: 'action inválida ou não informada' })

  } catch (error) {
    console.error('[Bridge Growth] Erro:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// ── Enviar WhatsApp ao plantonista via Z-API ─────────────────
async function whatsappPlantonista(mensagem) {
  const PLANTONISTA   = process.env.PLANTONISTA_WHATSAPP
  const ZAPI_TOKEN    = process.env.ZAPI_TOKEN
  const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID
  const ZAPI_CLIENT   = process.env.ZAPI_CLIENT_TOKEN
  if (!PLANTONISTA || !ZAPI_TOKEN || !ZAPI_INSTANCE) {
    console.log('[Bridge Juris] Z-API não configurado — mensagem logada:', mensagem.slice(0, 80))
    return
  }
  try {
    const numero = PLANTONISTA.replace(/\D/g, '')
    await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': ZAPI_CLIENT || '',
      },
      body: JSON.stringify({ phone: numero, message: mensagem }),
    })
    console.log('[Bridge Juris] ✅ Plantonista notificado via Z-API:', PLANTONISTA)
  } catch (e) {
    console.error('[Bridge Juris] Erro Z-API plantonista:', e.message)
  }
}

// ── Processar evento recebido do Growth ──────────────────────
async function processarEventoRecebido(evento) {
  switch (evento.tipo) {
    case 'LEAD_QUALIFICADO':
      console.log('[Bridge Juris] Lead qualificado recebido do Growth:', evento.payload?.nome)
      await whatsappPlantonista(
        `🎯 LEAD QUALIFICADO — BEN GROWTH\n\n` +
        `👤 Nome: ${evento.payload?.nome || 'N/A'}\n` +
        `📞 Telefone: ${evento.payload?.telefone || 'N/A'}\n` +
        `🔱 Área: ${evento.payload?.area || 'N/A'}\n` +
        `⭐ Score: ${evento.payload?.score || 'N/A'}/100\n` +
        `💰 Valor Est.: R$ ${Number(evento.payload?.valorEstimado || 0).toLocaleString('pt-BR')}\n\n` +
        `⚡ Triagem jurídica iniciada no Juris Center.`
      )
      break
    case 'CAMPANHA_ATIVADA':
      console.log('[Bridge Juris] Campanha ativada pelo Growth:', evento.payload?.campanha)
      await whatsappPlantonista(
        `📢 CAMPANHA ATIVA — BEN GROWTH\n\n` +
        `📊 Campanha: ${evento.payload?.campanha || 'N/A'}\n` +
        `🎯 Área alvo: ${evento.payload?.areaAlvo || 'N/A'}\n` +
        `💵 Orçamento/dia: R$ ${evento.payload?.orcamentoDia || 0}\n` +
        `👥 Leads esperados: ${evento.payload?.leadsEsperados || 'N/A'}`
      )
      break
    case 'ALERTA_PRAZO':
      console.log('[Bridge Juris] Alerta de prazo:', evento.payload?.prazo)
      await whatsappPlantonista(
        `🔴 ALERTA DE PRAZO — BEN JURIS\n\n` +
        `👤 Cliente: ${evento.payload?.cliente || 'N/A'}\n` +
        `📅 Prazo: ${evento.payload?.prazo || 'N/A'}\n` +
        `🔱 ${evento.payload?.descricao || 'Prazo processual crítico'}\n` +
        `🚨 Urgência: ${(evento.payload?.urgencia || 'ALTA').toUpperCase()}\n\n` +
        `⚡ Ação imediata necessária!`
      )
      break
    default:
      console.log('[Bridge] Evento recebido sem handler específico:', evento.tipo)
  }
}

// ── Dados mock de fallback ────────────────────────────────────
const MOCK_EVENTS_JURIS = [
  {
    id: 'evt-mock-001',
    tipo: 'LEAD_QUALIFICADO',
    origem: 'juris',
    destino: 'growth',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    payload: { cliente: 'Carlos Mendes', area: 'Tributário', score: 92, valorEstimado: 180000 },
    status: 'entregue',
    agenteOrigem: 'Dr. Ben Juris CRM',
  },
  {
    id: 'evt-mock-002',
    tipo: 'CONTRATO_ASSINADO',
    origem: 'juris',
    destino: 'growth',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    payload: { cliente: 'Fernanda Costa', contrato: 'Juros Abusivos', honorario: 8500 },
    status: 'entregue',
    agenteOrigem: 'Dr. Ben Contratos',
  },
  {
    id: 'evt-mock-003',
    tipo: 'CAMPANHA_ATIVADA',
    origem: 'juris',
    destino: 'growth',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    payload: { campanha: 'Recuperação Tributária', orcamentoDia: 150, areaAlvo: 'Tributário' },
    status: 'entregue',
    agenteOrigem: 'Lex Campanhas',
  },
]
