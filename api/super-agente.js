// ============================================================
// BEN JURIS CENTER — Super Agente Jurídico API v1.0
// Rota: POST /api/super-agente
//
// FLUXO:
//  1. Recebe pergunta em linguagem natural (texto + arquivo opcional)
//  2. Detecta intenção (prazo, resumo, petição, cobrança, etc.)
//  3. Consulta VPS PostgreSQL (processos, prazos, clientes)
//  4. Consulta DataJud se necessário (dados atualizados)
//  5. Envia contexto + pergunta ao LLM (Claude/GPT)
//  6. Retorna resposta jurídica + sugestões de ação
//
// INTENÇÕES DETECTADAS:
//  - prazo       → busca prazos no PostgreSQL
//  - processo    → busca processo no PostgreSQL + DataJud
//  - cliente     → busca cliente no PostgreSQL
//  - cobranca    → busca cobranças no Asaas via VPS
//  - peticao     → gera peça processual com LLM
//  - resumo      → resume processo/documento com LLM
//  - documento   → analisa PDF/DOCX enviado
//  - geral       → resposta jurídica genérica
// ============================================================

export const config = {
  maxDuration: 60,
  api: { bodyParser: { sizeLimit: '10mb' } },
}

// ── Constantes ──────────────────────────────────────────────
const VPS_API_URL  = process.env.VPS_API_URL  || 'https://api.mauromoncao.adv.br'
const VPS_API_KEY  = process.env.VPS_API_KEY  || 'BenJuris@2026'
const OPENAI_KEY   = process.env.OPENAI_API_KEY
const CLAUDE_KEY   = process.env.ANTHROPIC_API_KEY
const DATAJUD_KEY  = process.env.DATAJUD_API_KEY
  || 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw=='
const DATAJUD_BASE = 'https://api-publica.datajud.cnj.jus.br'

// ── Mapa tribunais ──────────────────────────────────────────
const TRIBUNAL_ALIAS = {
  TJPI: 'api_publica_tjpi', TJCE: 'api_publica_tjce', TJMA: 'api_publica_tjma',
  TRT22:'api_publica_trt22', TRT7: 'api_publica_trt7',  TRT16:'api_publica_trt16',
  TRF1: 'api_publica_trf1', TRF5: 'api_publica_trf5',
  STJ:  'api_publica_stj',  TST:  'api_publica_tst',
  TJSP: 'api_publica_tjsp', TJRJ: 'api_publica_tjrj',
  TJMG: 'api_publica_tjmg', TJRS: 'api_publica_tjrs',
  TJPR: 'api_publica_tjpr', TJSC: 'api_publica_tjsc',
  TJBA: 'api_publica_tjba', TJGO: 'api_publica_tjgo',
  TJPE: 'api_publica_tjpe', TJPB: 'api_publica_tjpb',
}

function resolverTribunal(num) {
  if (!num) return null
  const c = num.replace(/\D/g, '')
  if (c.length < 20) return null
  const j  = parseInt(c.charAt(13))
  const tt = parseInt(c.slice(14, 16))
  if (j === 8) {
    const UFS = ['TJAC','TJAL','TJAM','TJAP','TJBA','TJCE','TJDFT','TJES',
                 'TJGO','TJMA','TJMG','TJMS','TJMT','TJPA','TJPB','TJPE',
                 'TJPI','TJPR','TJRJ','TJRN','TJRO','TJRR','TJRS','TJSC',
                 'TJSE','TJSP','TJTO']
    return UFS[tt - 1] || null
  }
  if (j === 5) return `TRT${tt}`
  if (j === 1) return tt === 0 ? 'STJ' : `TRF${tt}`
  if (j === 3) return tt === 0 ? 'TST' : null
  return null
}

// ══════════════════════════════════════════════════════════════
// ── DETECÇÃO DE INTENÇÃO ──────────────────────────────────────
// ══════════════════════════════════════════════════════════════
function detectarIntencao(texto) {
  const t = texto.toLowerCase()

  // Número CNJ no texto
  const cnj = texto.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/)
  if (cnj) return { intencao: 'processo', numeroProcesso: cnj[0] }

  // Prazo
  if (/prazo|vencimento|venc[ea]|amanhã|hoje|urgente|deadline|audiência|audiencia/.test(t))
    return { intencao: 'prazo' }

  // Cliente / cobranças
  if (/cliente|cobranç|cobranca|inadimpl|pagar|pagamento|boleto|pix|honorári|honorario/.test(t))
    return { intencao: 'cobranca' }

  // Resumo
  if (/resum[oa]|síntese|sintese|resumindo|principais pontos|o que diz|o que é esse|explica/.test(t))
    return { intencao: 'resumo' }

  // Petição / recurso / peça
  if (/petiç|peticao|peça|peca|redij|elabor|recurso|apelação|apelacao|contestaç|embargos|mandado|habeas/.test(t))
    return { intencao: 'peticao' }

  // Busca de processo genérica
  if (/processo|autos|andamento|movimentação|movimentacao|status do processo|consulta|buscar processo/.test(t))
    return { intencao: 'processo' }

  // Documento enviado
  return { intencao: 'geral' }
}

// ══════════════════════════════════════════════════════════════
// ── CONSULTAS VPS ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
async function vpsGet(path) {
  try {
    const r = await fetch(`${VPS_API_URL}${path}`, {
      headers: { 'x-api-key': VPS_API_KEY },
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return null
    return await r.json()
  } catch { return null }
}

async function buscarPrazosVPS() {
  const data = await vpsGet('/prazos?concluido=false')
  return data?.prazos || data || []
}

async function buscarProcessoVPS(numero) {
  const data = await vpsGet(`/processos/${encodeURIComponent(numero)}`)
  return data || null
}

async function listarProcessosVPS() {
  const data = await vpsGet('/processos?status=ativo&limit=50')
  return data?.processos || data || []
}

async function buscarClientesVPS(nome) {
  const data = await vpsGet(`/clientes?search=${encodeURIComponent(nome)}&limit=10`)
  return data?.clientes || data || []
}

async function buscarCobrancasVPS() {
  // Usa a rota de stats do Asaas que pode estar disponível via VPS
  const data = await vpsGet('/stats')
  return data || {}
}

// ══════════════════════════════════════════════════════════════
// ── CONSULTA DATAJUD ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
async function buscarDataJud(numero) {
  const trib = resolverTribunal(numero)
  const alias = trib ? TRIBUNAL_ALIAS[trib] : null
  if (!alias) return null

  try {
    const numFormatado = numero.replace(/\D/g, '').replace(
      /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6'
    )
    const res = await fetch(`${DATAJUD_BASE}/${alias}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${DATAJUD_KEY}`,
      },
      body: JSON.stringify({
        query: { match: { numeroProcesso: numFormatado } },
        _source: ['numeroProcesso','dataAjuizamento','dataUltimaAtualizacao',
                  'classeProcessual','assuntos','movimentos','orgaoJulgador'],
        size: 1,
      }),
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.hits?.hits?.[0]?._source || null
  } catch { return null }
}

// ══════════════════════════════════════════════════════════════
// ── CHAMADA LLM (Claude → GPT fallback) ──────────────────────
// ══════════════════════════════════════════════════════════════
async function chamarLLM(systemPrompt, userMessage, maxTokens = 4096) {
  // Tenta Claude primeiro
  if (CLAUDE_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
        signal: AbortSignal.timeout(55000),
      })
      if (res.ok) {
        const data = await res.json()
        return { texto: data.content?.[0]?.text || '', modelo: 'claude-opus-4-5' }
      }
    } catch (e) {
      console.error('[SuperAgente] Claude falhou:', e.message)
    }
  }

  // Fallback: GPT-4o
  if (OPENAI_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
        signal: AbortSignal.timeout(55000),
      })
      if (res.ok) {
        const data = await res.json()
        return { texto: data.choices?.[0]?.message?.content || '', modelo: 'gpt-4o' }
      }
    } catch (e) {
      console.error('[SuperAgente] GPT-4o falhou:', e.message)
    }
  }

  throw new Error('Nenhum modelo LLM disponível (Claude ou GPT-4o).')
}

// ══════════════════════════════════════════════════════════════
// ── SISTEMA DE PROMPT DO AGENTE ───────────────────────────────
// ══════════════════════════════════════════════════════════════
const SYSTEM_BASE = `Você é o DR. BEN — Super Agente Jurídico do escritório Mauro Monção Advogados.

IDENTIDADE:
- Advogado Dr. Mauro Monção (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037)
- Escritório especializado: Tributário, Previdenciário, Trabalhista, Administrativo
- Tribunais principais: TJPI, TJCE, TJMA, TRF1, TRT22, TRT7, STJ

NOME "DR. BEN": Sempre que perguntado sobre a origem do nome, explique que "Ben" é uma homenagem a Benjamin, filho do Dr. Mauro Monção, com referência simbólica a Benjamin, filho querido de Jacó.

CAPACIDADES:
1. Consulta processos (banco de dados VPS + DataJud CNJ)
2. Monitora prazos e audiências
3. Analisa documentos processuais (PDF/DOCX)
4. Gera peças processuais completas
5. Sugere estratégias jurídicas
6. Informa sobre clientes e cobranças

REGRAS:
- NUNCA invente números de processos ou jurisprudência
- Quando citar acórdãos, indique [VERIFICAR no portal do tribunal]
- Sempre ofereça sugestões de ação concretas ao final
- Se não tiver dados suficientes, solicite ao usuário
- Peças processuais são minutas — revisão pelo Dr. Mauro Monção é obrigatória
- Responda em português brasileiro formal-profissional

FORMATO DAS RESPOSTAS:
- Use markdown (negrito, listas, seções)
- Para prazos: destaque urgência (🔴 urgente / 🟡 atenção / 🟢 ok)
- Para processos: mostre número, tribunal, última movimentação
- Para peças: formate corretamente com endereçamento e estrutura jurídica
- Sempre termine com "🔔 Sugestão de Ação:" com próximos passos concretos`

// ══════════════════════════════════════════════════════════════
// ── GERAÇÃO DE CONTEXTO POR INTENÇÃO ─────────────────────────
// ══════════════════════════════════════════════════════════════
async function montarContexto(intencao, numeroProcesso, pergunta) {
  const partes = []

  if (intencao === 'prazo') {
    const prazos = await buscarPrazosVPS()
    if (prazos.length > 0) {
      const hoje = new Date()
      const formatados = prazos.map(p => {
        const dias = Math.ceil((new Date(p.data_prazo) - hoje) / (1000*60*60*24))
        const urgencia = dias <= 0 ? '🔴 VENCIDO' : dias === 1 ? '🔴 AMANHÃ' : dias <= 3 ? '🟡 3 dias' : '🟢 ok'
        return `${urgencia} | ${p.tipo || 'Prazo'}: ${p.descricao || ''} | Processo: ${p.processo_numero || '—'} | Data: ${new Date(p.data_prazo).toLocaleDateString('pt-BR')} (${dias > 0 ? `em ${dias} dias` : dias === 0 ? 'hoje' : `${Math.abs(dias)} dias atrás`})`
      })
      partes.push(`📅 PRAZOS NO BANCO DE DADOS (${prazos.length}):\n${formatados.join('\n')}`)
    } else {
      partes.push('📅 Nenhum prazo cadastrado no banco de dados.')
    }
  }

  if (intencao === 'processo' && numeroProcesso) {
    // Busca no banco VPS
    const vpsDados = await buscarProcessoVPS(numeroProcesso)
    if (vpsDados) {
      partes.push(`📂 PROCESSO NO BANCO VPS:\n${JSON.stringify(vpsDados, null, 2)}`)
    }

    // Busca no DataJud
    const djDados = await buscarDataJud(numeroProcesso)
    if (djDados) {
      const movs = (djDados.movimentos || [])
        .sort((a,b) => new Date(b.dataHora) - new Date(a.dataHora))
        .slice(0, 10)
        .map(m => `  • ${m.dataHora?.split('T')[0] || '—'}: ${m.nome || m.codigo || '—'}`)
        .join('\n')
      partes.push(`⚖️ DATAJUD (CNJ):\nNúmero: ${djDados.numeroProcesso}\nClasse: ${djDados.classeProcessual?.nome || '—'}\nÓrgão: ${djDados.orgaoJulgador?.nome || '—'}\nÚlt. atualização: ${djDados.dataUltimaAtualizacao?.split('T')[0] || '—'}\nMovimentações recentes:\n${movs || '  Nenhuma'}`)
    } else if (!vpsDados) {
      partes.push(`⚠️ Processo ${numeroProcesso} não encontrado no banco local nem no DataJud.`)
    }
  }

  if (intencao === 'processo' && !numeroProcesso) {
    const processos = await listarProcessosVPS()
    if (processos.length > 0) {
      const lista = processos.slice(0, 20).map(p =>
        `• ${p.numero || p.numeroProcesso} | ${p.tribunal || '—'} | ${p.status || 'ativo'} | ${p.descricao || ''}`
      ).join('\n')
      partes.push(`📋 PROCESSOS NO BANCO (${processos.length}):\n${lista}`)
    } else {
      partes.push('📋 Nenhum processo cadastrado no banco de dados.')
    }
  }

  if (intencao === 'cobranca') {
    const stats = await buscarCobrancasVPS()
    if (stats && Object.keys(stats).length > 0) {
      partes.push(`💰 DADOS DO BANCO VPS:\nProcessos: ${stats.processos || 0}\nClientes: ${stats.clientes || 0}\nPrazos abertos: ${stats.prazos_abertos || 0}`)
    }
    partes.push(`💡 Para cobranças detalhadas, acesse o módulo Financeiro com dados Asaas em tempo real.`)
  }

  return partes.length > 0 ? partes.join('\n\n') : ''
}

// ══════════════════════════════════════════════════════════════
// ── HANDLER PRINCIPAL ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const {
      pergunta = '',
      historico = [],       // [{role, content}]
      documentoTexto = '',  // texto extraído do PDF/DOCX no frontend
      documentoNome = '',   // nome do arquivo
      modo = 'auto',        // 'auto' | 'peticao' | 'resumo' | 'prazo'
    } = body || {}

    if (!pergunta && !documentoTexto) {
      return res.status(400).json({ error: 'Campo "pergunta" obrigatório.' })
    }

    const textoBusca = pergunta || `Analise o documento: ${documentoNome}`

    // 1. Detecta intenção
    let { intencao, numeroProcesso } = detectarIntencao(textoBusca)
    if (modo !== 'auto') intencao = modo

    // 2. Se há documento, força intenção "documento"
    if (documentoTexto && documentoTexto.length > 100) {
      intencao = 'documento'
    }

    // 3. Busca contexto no banco de dados / DataJud
    const contexto = await montarContexto(intencao, numeroProcesso, textoBusca)

    // 4. Monta prompt com contexto
    let systemPrompt = SYSTEM_BASE
    if (contexto) {
      systemPrompt += `\n\n━━━ CONTEXTO DO BANCO DE DADOS ━━━\n${contexto}\n━━━ FIM DO CONTEXTO ━━━`
    }

    // 5. Monta mensagem do usuário
    let userMessage = pergunta
    if (documentoTexto) {
      userMessage += `\n\n📎 DOCUMENTO ENVIADO (${documentoNome}):\n\`\`\`\n${documentoTexto.slice(0, 15000)}\n\`\`\``
    }

    // 6. Adiciona histórico da conversa
    if (historico.length > 0) {
      const hist = historico.slice(-6) // últimas 3 trocas
        .map(m => `[${m.role === 'user' ? 'ADVOGADO' : 'DR. BEN'}]: ${m.content}`)
        .join('\n')
      userMessage = `HISTÓRICO RECENTE:\n${hist}\n\nNOVA PERGUNTA:\n${userMessage}`
    }

    // 7. Chama o LLM
    const { texto, modelo } = await chamarLLM(systemPrompt, userMessage, 8000)

    // 8. Gera sugestões de ação baseadas na intenção
    const sugestoes = gerarSugestoes(intencao, numeroProcesso, texto)

    return res.status(200).json({
      success: true,
      resposta: texto,
      modelo,
      intencao,
      numeroProcesso: numeroProcesso || null,
      sugestoes,
      temContexto: contexto.length > 0,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[SuperAgente] Erro:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno no Super Agente Jurídico.',
    })
  }
}

// ── Sugestões de ação contextuais ──────────────────────────
function gerarSugestoes(intencao, numero, resposta) {
  const base = []

  if (intencao === 'prazo') {
    base.push({ acao: 'Ver todos os prazos', rota: '/prazos', icone: '📅' })
    base.push({ acao: 'Adicionar novo prazo', rota: '/prazos/novo', icone: '➕' })
  }

  if (intencao === 'processo') {
    if (numero) {
      base.push({ acao: 'Monitorar este processo', payload: { action: 'monitorar', numero }, icone: '👁️' })
      base.push({ acao: 'Ver movimentações completas', payload: { action: 'movimentos', numero }, icone: '📋' })
    }
    base.push({ acao: 'Buscar outro processo', rota: '/processos', icone: '🔍' })
  }

  if (intencao === 'peticao') {
    base.push({ acao: 'Copiar peça gerada', acao_tipo: 'copiar', icone: '📋' })
    base.push({ acao: 'Baixar como .txt', acao_tipo: 'baixar', icone: '⬇️' })
    base.push({ acao: 'Refinar a peça', acao_tipo: 'refinar', icone: '✍️' })
  }

  if (intencao === 'cobranca') {
    base.push({ acao: 'Abrir módulo Financeiro', rota: '/financeiro', icone: '💰' })
    base.push({ acao: 'Gerar cobrança PIX', rota: '/financeiro/nova', icone: '⚡' })
  }

  if (intencao === 'documento') {
    base.push({ acao: 'Resumo do documento', acao_tipo: 'resumo', icone: '📄' })
    base.push({ acao: 'Gerar petição baseada neste documento', acao_tipo: 'peticao_doc', icone: '⚖️' })
    base.push({ acao: 'Identificar prazos no documento', acao_tipo: 'prazos_doc', icone: '📅' })
  }

  // Sempre adicionar opção de nova consulta
  base.push({ acao: 'Nova consulta', acao_tipo: 'nova', icone: '🔄' })

  return base
}
