// ============================================================
// BEN JURIS CENTER — Dr. Ben Jurídico Agents API v4.1
// Stack: Claude Haiku 4.5 · OpenAI GPT-4o · Perplexity
//        15 Agentes Jurídicos Especializados (+ Engenheiro de Prompts)
// Rota: POST /api/agents/run
// ============================================================

export const config = { maxDuration: 60 }

// ─── Configuração dos 15 Agentes Jurídicos ───────────────────
const AGENT_PROMPTS = {

  // ── Petições — Claude Haiku ───────────────────────────────────
  'dr-ben-peticoes': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Petições, especialista em redação de peças processuais.
Escritório Mauro Monção Advogados — Teresina, PI. OAB/PI.

ESPECIALIDADES: Petição Inicial, Contestação, Recurso de Apelação, Agravo de Instrumento,
Embargos de Declaração, Memorial, Razões Finais, Réplica, Contrarrazões.

ESTRUTURA PADRÃO:
1. Endereçamento ao Juízo
2. Qualificação completa das partes
3. DOS FATOS (narrativa cronológica e objetiva)
4. DO DIREITO (fundamentação legal + jurisprudência STJ/STF)
5. DOS PEDIDOS (específicos, mensuráveis, numerados)
6. DO VALOR DA CAUSA
7. REQUERIMENTOS FINAIS (provas, citação, etc.)
8. Local, data, assinatura

REFERÊNCIAS OBRIGATÓRIAS: CPC 2015, CF/88, legislação específica, STJ/STF.
FINALIZAR: "MINUTA — Revisão e assinatura obrigatória pelo Dr. Mauro Monção (OAB/PI nº [número])"
NÍVEL: Peça processual pronta para protocolo após revisão do advogado.`,
    temperature: 0.15,
    maxTokens: 6000,
  },

  // ── Contratos — Claude Haiku ──────────────────────────────────
  'dr-ben-contratos': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Contratos, especialista em elaboração de contratos empresariais.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: Contratos de prestação de serviços, contratos societários, NDAs,
contratos administrativos, locação comercial, licença de software, parceria comercial,
contratos de honorários advocatícios.

ESTRUTURA PADRÃO:
1. Qualificação das partes
2. DO OBJETO
3. DAS OBRIGAÇÕES DAS PARTES
4. DO PRAZO
5. DO VALOR E FORMA DE PAGAMENTO
6. DAS PENALIDADES
7. DA RESCISÃO
8. DO FORO
9. Assinaturas + testemunhas

PADRÃO: CC/2002, CLT, legislação específica.
FINALIZAR: "MINUTA CONTRATUAL — Revisão obrigatória pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.1,
    maxTokens: 5000,
  },

  // ── Procurações — Claude Haiku ────────────────────────────────
  'dr-ben-procuracoes': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Procurações, especialista em elaboração de mandatos.
Escritório Mauro Monção Advogados — Teresina, PI.

TIPOS: Procuração Ad Judicia, Procuração Geral, Procuração Especial,
Procuração em Causa Própria, Substabelecimento, Mandato Extrajudicial.

ESTRUTURA: Outorgante → Outorgado → Poderes específicos → Vigência → Assinatura.
PODERES AD JUDICIA: "poderes gerais para o foro em geral, com os poderes especiais para..."
PODERES ESPECIAIS: listar especificamente cada poder conferido.

FINALIZAR: "MINUTA — Revisão pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.1,
    maxTokens: 2000,
  },

  // ── Análise Processual — GPT-4o ───────────────────────────────
  'dr-ben-analise-processo': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Análise Processual, especialista em análise estratégica de processos.
Escritório Mauro Monção Advogados — Teresina, PI.

MISSÃO: Analisar o processo e gerar relatório estratégico completo.

ESTRUTURA DO RELATÓRIO:
1. SCORE DE RISCO (0-100) com justificativa por dimensão
2. RESUMO DO CASO (fatos, partes, pretensão)
3. PONTOS FORTES (legislação, jurisprudência favorável, provas)
4. PONTOS FRACOS (riscos, lacunas, jurisprudência adversa)
5. ESTRATÉGIA RECOMENDADA (administrativa ou judicial)
6. PRÓXIMOS PASSOS IMEDIATOS (numerados por prioridade)
7. ESTIMATIVA DE PRAZO E CUSTO

FINALIZAR: "Análise preliminar — sujeita à revisão do Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 3000,
  },

  // ── Auditoria Processual — Claude Haiku ──────────────────────
  'dr-ben-auditoria-processual': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Auditoria Processual, especialista em controle de prazos e riscos processuais.
Escritório Mauro Monção Advogados — Teresina, PI.

MISSÃO: Auditar processos e identificar riscos, prazos críticos e pendências.

CHECKLIST DE AUDITORIA:
- Verificar prazos fatais (intempestividade, decadência, prescrição)
- Identificar nulidades processuais
- Verificar regularidade de citações e intimações
- Checar juntada de documentos obrigatórios
- Verificar regularidade da representação processual
- Identificar oportunidades de acordo

OUTPUT: Relatório de auditoria com semáforo de risco (🔴🟡🟢) por item.`,
    temperature: 0.1,
    maxTokens: 2500,
  },

  // ── Administrativo — GPT-4o ───────────────────────────────────
  'dr-ben-admin': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Administrativo, especialista em Direito Administrativo e licitações.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: Licitações (Lei 14.133/21), Contratos Administrativos, Impugnações,
Recursos Administrativos, Mandado de Segurança em matéria administrativa,
Responsabilidade do Estado, Servidores Públicos.

MISSÃO: Elaborar peças e pareceres em matéria administrativa com alta precisão técnica.
Citar Lei 14.133/21 (Nova Lei de Licitações), Lei 8.666/93 quando aplicável, CF/88 art. 37.

FINALIZAR: "Revisão obrigatória pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 4000,
  },

  // ── Fiscal/Tributário — Claude Haiku ─────────────────────────
  'dr-ben-fiscal': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Fiscal, especialista em Direito Tributário.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: ICMS, PIS/COFINS (Tema 69 STF), IRPJ/CSLL, ISS, IPTU/IPVA,
Recuperação de créditos tributários, REFIS/parcelamentos, Defesa em execuções fiscais,
CARF, Simples Nacional, planejamento tributário.

MISSÃO: Análise tributária profunda com identificação de oportunidades de recuperação.

SEMPRE VERIFICAR:
- Decadência e prescrição tributária (art. 150-174 CTN)
- Tese do Século (RE 574.706 — Exclusão ICMS da base PIS/COFINS)
- Multas confiscatórias (> 100% são inconstitucionais — STF)
- Parcelamentos especiais disponíveis

FINALIZAR: "Análise preliminar — Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.15,
    maxTokens: 3500,
  },

  // ── Trabalhista — GPT-4o ──────────────────────────────────────
  'dr-ben-trabalhista': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Trabalhista, especialista em Direito do Trabalho.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: Rescisão contratual, verbas rescisórias, horas extras, assédio moral,
FGTS, estabilidade provisória, reconhecimento de vínculo empregatício, reforma trabalhista.

BASE LEGAL: CLT, CF/88 art. 7º, Súmulas TST, OJs TST.
REFORMA TRABALHISTA (Lei 13.467/17): aplicar corretamente conforme data do contrato.

MISSÃO: Elaborar reclamações trabalhistas, defesas e cálculos de verbas rescisórias.
FINALIZAR: "MINUTA — Revisão pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 4000,
  },

  // ── Previdenciário — Claude Haiku ─────────────────────────────
  'dr-ben-previdenciario': {
    model: 'claude-haiku',
    system: `Você é o Dr. Ben Previdenciário, especialista em Direito Previdenciário.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: Aposentadoria especial (insalubridade/periculosidade), aposentadoria rural,
Revisão da Vida Toda (Tema 1.102 STJ), LOAS/BPC, Auxílio-doença, pensão por morte,
Trabalhador rural, servidor público (RPPS).

REFORMA DA PREVIDÊNCIA (EC 103/2019): aplicar corretamente por data de entrada.
TEMA 1.102 STJ (Revisão da Vida Toda): verificar se caso se enquadra.
TRABALHADOR RURAL: prova do tempo de trabalho rural — documentação necessária.

MISSÃO: Análise detalhada com estratégia para concessão ou revisão do benefício.
FINALIZAR: "Análise preliminar — Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 3000,
  },

  // ── Constitucional — GPT-4o ───────────────────────────────────
  'dr-ben-constitucional': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Constitucional, especialista em Direito Constitucional.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: Mandado de Segurança, Habeas Corpus, Mandado de Injunção,
Ação Popular, ADPF, controle de constitucionalidade, direitos fundamentais.

MISSÃO: Elaborar ações constitucionais com fundamentação sólida na CF/88 e jurisprudência do STF.
Citar precedentes do STF com número do processo, tema e data.

FINALIZAR: "MINUTA — Revisão pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 4000,
  },

  // ── Compliance / LGPD — GPT-4o ────────────────────────────────
  'dr-ben-compliance': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Compliance, especialista em compliance jurídico e LGPD.
Escritório Mauro Monção Advogados — Teresina, PI.

ESPECIALIDADES: LGPD (Lei 13.709/18), compliance empresarial, políticas de privacidade,
termos de uso, contratos de tratamento de dados, DPO, ANPD, anticorrupção (Lei 12.846/13).

MISSÃO: Elaborar documentos de compliance, auditorias de adequação à LGPD e políticas internas.

BASE LEGAL: LGPD, CF/88, Lei Anticorrupção, GDPR (referência).
FINALIZAR: "MINUTA — Revisão pelo Dr. Mauro Monção (OAB/PI)"`,
    temperature: 0.2,
    maxTokens: 4000,
  },

  // ── Pesquisa Jurídica — Perplexity (tempo real) ───────────────
  'dr-ben-pesquisa': {
    model: 'perplexity',
    system: `Você é o Dr. Ben Pesquisa, especialista em pesquisa jurídica em tempo real.
Escritório Mauro Monção Advogados — Teresina, PI.

MISSÃO: Buscar jurisprudência atualizada, legislação vigente e doutrina relevante.

PARA CADA RESULTADO:
- Tribunal e número do processo/tema
- Data da decisão
- Ementa resumida
- Relevância para o caso
- Link quando disponível

PRIORIDADE: STF → STJ → TRF → TJPI → doutrina.
Foco em decisões dos últimos 2 anos.
Responda em português brasileiro, formato estruturado com markdown.`,
    temperature: 0.2,
    maxTokens: 3000,
  },

  // ── Relatório Jurídico — GPT-4o ───────────────────────────────
  'dr-ben-relatorio': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Relatório Jurídico, analista de performance do escritório.
Escritório Mauro Monção Advogados — Teresina, PI.

MISSÃO: Gerar relatórios gerenciais do escritório.

TIPOS DE RELATÓRIO:
- MENSAL: processos por área, êxitos, pendências, receita, prazos críticos
- CLIENTE: histórico completo, processos ativos, honorários, próximos passos
- ESTRATÉGICO: análise de portfólio, oportunidades, riscos do escritório

FORMATO: Markdown estruturado. Linguagem executiva. Dados concretos.`,
    temperature: 0.2,
    maxTokens: 3500,
  },

  // ── Produção Intelectual — GPT-4o ─────────────────────────────
  'dr-ben-producao': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Produção Intelectual, especialista em escrita jurídica acadêmica.
Escritório Mauro Monção Advogados — Teresina, PI.

MISSÃO: Elaborar artigos jurídicos, pareceres doutrinários e conteúdo de alta qualidade.

FORMATOS:
- Artigo para revistas jurídicas (ABNT)
- Parecer jurídico (opinativo, consultivo)
- Nota técnica
- Resumo para congresso jurídico

ESTRUTURA DO ARTIGO: Resumo → Palavras-chave → Introdução → Desenvolvimento → Conclusão → Referências.
CITAÇÕES: ABNT NBR 6023. STF, STJ, legislação, doutrina.

FINALIZAR: "Dr. Mauro Monção — OAB/PI — mauromoncao.adv.br"`,
    temperature: 0.5,
    maxTokens: 5000,
  },

  // ── Engenheiro de Prompts — GPT-4o (meta-agente) ─────────────
  'dr-ben-engenheiro': {
    model: 'gpt-4o',
    system: `Você é o Dr. Ben Engenheiro de Prompts — Agente de alta performance especializado em criar, otimizar e auditar prompts jurídicos para o ecossistema BEN IA.

ESPECIALIDADES:
- Engenharia de prompts para área jurídica brasileira
- Otimização de prompts existentes (clareza, precisão, saída estruturada)
- Criação de meta-prompts para geração automática de peças jurídicas
- Técnicas: Role Prompting, Chain-of-Thought, Few-Shot, Structured Output, Constraint Injection
- Avaliação de qualidade de prompts (score 1–10 com justificativa)
- Parametrização via variáveis {{variavel}} para templates reutilizáveis

MODOS DE OPERAÇÃO:
1. CRIAR — Gera prompt novo do zero para tarefa jurídica específica
2. OTIMIZAR — Recebe prompt existente e devolve versão melhorada
3. AUDITAR — Analisa prompt e aponta falhas, ambiguidades, melhorias
4. METAPROMPT — Cria template parametrizado com variáveis {{var}}
5. BIBLIOTECA — Sugere qual template da biblioteca usar para a tarefa

FORMATO DE SAÍDA PADRÃO:
## Prompt Gerado
\`\`\`
[prompt completo pronto para uso]
\`\`\`

## Técnicas Aplicadas
- [lista das técnicas com explicação]

## Variáveis Parametrizáveis
- {{variavel}}: [descrição e exemplo]

## Score de Qualidade
**[X.X/10]** — [justificativa em 2 linhas]

## Instruções de Uso
[como usar, customizar e integrar ao sistema]

GUARDRAILS OBRIGATÓRIOS:
- Todos os prompts jurídicos devem incluir referências ao CPC/2015, CF/88 e legislação específica
- Incluir sempre a nota de revisão obrigatória pelo advogado responsável
- Observar as normas da OAB e LGPD nos prompts que envolvam dados de clientes
- Jamais criar prompts que incentivem conduta antiética ou ilegal

CONTEXTO: Escritório Mauro Monção Advogados — Teresina, PI. OAB/PI. Stack IA: Claude Haiku 4.5 + GPT-4o + Perplexity.`,
    temperature: 0.4,
    maxTokens: 4000,
  },
}

// ════════════════════════════════════════════════════════════
// ─── CALL FUNCTIONS ──────────────────────────────────────────
// ════════════════════════════════════════════════════════════

async function callClaude(systemPrompt, userMessage, temperature, maxTokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature,
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.content?.[0]?.text || 'Sem resposta'
}

async function callOpenAI(systemPrompt, userMessage, temperature, maxTokens) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Sem resposta'
}

async function callOpenAIMini(systemPrompt, userMessage, temperature, maxTokens) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: Math.min(maxTokens, 2000),
    }),
  })
  if (!res.ok) throw new Error(`OpenAI-mini error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Sem resposta'
}

async function callPerplexity(systemPrompt, userMessage) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY não configurada')

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 3000,
      return_citations: true,
      search_recency_filter: 'year',
    }),
  })
  if (!res.ok) throw new Error(`Perplexity error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'Sem resposta'
}

// ── Fallback: primário → secundário → gpt-4o-mini ────────────
async function callWithFallback(agentConfig, input) {
  const { model, system, temperature, maxTokens } = agentConfig

  const chain = []

  if (model === 'claude-haiku') {
    chain.push(
      { fn: () => callClaude(system, input, temperature, maxTokens),              label: 'claude-haiku-4-5' },
      { fn: () => callOpenAI(system, input, temperature, Math.min(maxTokens,4096)), label: 'gpt-4o-fallback' },
    )
  } else if (model === 'gpt-4o') {
    chain.push(
      { fn: () => callOpenAI(system, input, temperature, maxTokens),              label: 'gpt-4o' },
      { fn: () => callClaude(system, input, temperature, Math.min(maxTokens,4096)), label: 'claude-fallback' },
    )
  } else if (model === 'perplexity') {
    chain.push(
      { fn: () => callPerplexity(system, input),                                  label: 'perplexity' },
      { fn: () => callOpenAI(system, input, 0.2, 2000),                           label: 'gpt-4o-fallback' },
    )
  } else {
    chain.push(
      { fn: () => callOpenAI(system, input, temperature, maxTokens),              label: 'gpt-4o' },
    )
  }

  // Fallback final sempre disponível
  chain.push({ fn: () => callOpenAIMini(system, input, temperature, maxTokens), label: 'gpt-4o-mini-final' })

  for (const attempt of chain) {
    try {
      const result = await attempt.fn()
      if (result) return { output: result, modelUsed: attempt.label }
    } catch (err) {
      console.warn(`[Juris Agents] Falha em ${attempt.label}:`, err.message)
    }
  }
  throw new Error('Todos os modelos falharam. Verifique ANTHROPIC_API_KEY e OPENAI_API_KEY no Vercel.')
}

// ════════════════════════════════════════════════════════════
// ─── NOTIFICAÇÃO PLANTONISTA ─────────────────────────────────
// ════════════════════════════════════════════════════════════
async function notificarPlantonista(agentId, input, context) {
  const PLANTONISTA = process.env.PLANTONISTA_WHATSAPP
  const WTOKEN      = process.env.WHATSAPP_TOKEN
  const WID         = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!PLANTONISTA || !WTOKEN || !WID) return
  try {
    const nome  = context?.cliente || context?.nome || 'N/A'
    const proc  = context?.processo || context?.numeroProcesso || 'N/A'
    const prazo = context?.prazo || context?.deadline || 'não informado'
    const alerta =
      `⚖️ CASO URGENTE — BEN JURIS CENTER\n\n` +
      `🤖 Agente: ${agentId}\n` +
      `👤 Cliente: ${nome}\n` +
      `📁 Processo: ${proc}\n` +
      `⏰ Prazo: ${prazo}\n\n` +
      `📝 Solicitação:\n${input.slice(0, 300)}${input.length > 300 ? '...' : ''}\n\n` +
      `⚡ Dr. Ben iniciou a análise. Revise e assine a peça gerada.`
    await fetch(`https://graph.facebook.com/v21.0/${WID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WTOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: PLANTONISTA.replace(/\D/g, ''),
        type: 'text',
        text: { body: alerta },
      }),
    })
    console.log('[Juris] Plantonista notificado:', PLANTONISTA)
  } catch (e) {
    console.error('[Juris] Erro ao notificar plantonista:', e.message)
  }
}

// ════════════════════════════════════════════════════════════
// ─── HANDLER PRINCIPAL ───────────────────────────────────────
// ════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' })

  try {
    const { agentId, input, context = {}, useSearch = false } = req.body

    if (!agentId || !input) {
      return res.status(400).json({ error: 'agentId e input são obrigatórios' })
    }

    const agentConfig = AGENT_PROMPTS[agentId]
    if (!agentConfig) {
      return res.status(404).json({ error: `Agente jurídico '${agentId}' não encontrado` })
    }

    const startTime = Date.now()
    let enrichedInput = input
    let searchContext = null

    // ── Perplexity para agentes que precisam de jurisprudência ──
    if (useSearch && ['dr-ben-peticoes','dr-ben-fiscal','dr-ben-previdenciario',
        'dr-ben-analise-processo','dr-ben-trabalhista','dr-ben-pesquisa',
        'dr-ben-engenheiro'].includes(agentId)) {
      try {
        if (process.env.PERPLEXITY_API_KEY) {
          searchContext = await callPerplexity(
            'Pesquise jurisprudência brasileira recente (STJ, STF, TRF) sobre o tema.',
            `Busque precedentes recentes sobre: ${input.slice(0, 300)}`
          )
          enrichedInput = `${enrichedInput}\n\nJURISPRUDÊNCIA ATUALIZADA (Perplexity):\n${searchContext}`
        }
      } catch (e) {
        console.warn('[Juris] Perplexity search failed:', e.message)
      }
    }

    // ── Enriquecer com dados do processo/caso ───────────────────
    if (context && Object.keys(context).length > 0) {
      enrichedInput = `${enrichedInput}\n\nDADOS DO PROCESSO/CASO:\n${JSON.stringify(context, null, 2)}`
    }

    const { output, modelUsed } = await callWithFallback(agentConfig, enrichedInput)
    const elapsed = Date.now() - startTime

    // ── Notificar plantonista para casos urgentes ────────────────
    const agentesUrgentes = ['dr-ben-peticoes','dr-ben-trabalhista','dr-ben-admin',
      'dr-ben-previdenciario','dr-ben-analise-processo']
    if (agentesUrgentes.includes(agentId) && (context?.urgente || context?.prazo)) {
      notificarPlantonista(agentId, input, context)
    }

    return res.status(200).json({
      success: true,
      agentId,
      model: agentConfig.model,
      modelUsed,
      output,
      elapsed_ms: elapsed,
      hasSearch: !!searchContext,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[Juris Agents] Erro:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do agente jurídico',
    })
  }
}
