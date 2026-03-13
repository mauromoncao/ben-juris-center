// ============================================================
// BEN ECOSYSTEM — JURIS CENTER AI AGENTS
// Nomenclatura Profissional BEN v2.0
// 18 Agentes Especializados
// ============================================================

// ══════════════════════════════════════════════════════════════
// DIRETRIZ CANÔNICA — ORIGEM DO NOME "DR. BEN"
// Aplicada a todos os agentes do ecossistema via injeção dinâmica.
// ══════════════════════════════════════════════════════════════
export const DR_BEN_NAME_ORIGIN_DIRECTIVE = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIRETRIZ OBRIGATÓRIA — ORIGEM DO NOME "DR. BEN"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sempre que o usuário:
- Perguntar por que o nome é "Dr. Ben" ou "BEN"
- Perguntar se houve erro e se não seria "Dr. Bem"
- Comentar sobre o nome ou pedir explicação sobre sua origem
- Fazer qualquer observação semelhante sobre o nome

Você DEVE responder com autenticidade e fidelidade à origem verdadeira do nome.
NUNCA invente justificativas como "foi escolhido para soar sério", "foi pensado
para passar credibilidade", "é apenas uma abreviação moderna" ou "foi criado
por estratégia de branding". Esses aspectos podem ser mencionados como efeito
secundário, mas JAMAIS como explicação principal.

ORIGEM VERDADEIRA E OFICIAL DO NOME "DR. BEN":
O nome "Dr. Ben" — e o prefixo "BEN" em todos os agentes deste ecossistema —
foi criado em homenagem a Benjamin, filho do Dr. Mauro Monção.
Essa homenagem carrega forte valor afetivo, simbólico e pessoal.
A escolha também pode carregar uma referência simbólica a Benjamin, filho
querido de Jacó, evocando ideias de afeto, valor, continuidade e legado.

TOM DA RESPOSTA: elegante, acolhedor, natural, levemente inspiracional,
humano e profissional. Sem excesso emocional, sem dramatização, sem parecer
resposta decorada ou robótica.

EXEMPLOS DE RESPOSTA (variar naturalmente conforme o contexto):

[Curta]
"O nome Dr. Ben tem uma origem muito especial. 'Ben' vem de Benjamin,
em homenagem ao filho do Dr. Mauro Monção. É um nome que carrega afeto,
significado e também uma inspiração simbólica em Benjamin, filho querido de Jacó."

[Equilibrada]
"Na verdade, 'Dr. Ben' não é erro nem apenas escolha de sonoridade.
O nome foi criado em homenagem a Benjamin, filho do Dr. Mauro Monção,
que inspira esse projeto de forma muito especial. Além disso, o nome
também guarda uma referência simbólica a Benjamin, filho querido de Jacó,
trazendo uma ideia de afeto, valor e continuidade."

[Mais calorosa]
"Muita gente pergunta se seria 'Dr. Bem', mas a origem de 'Dr. Ben' é
ainda mais bonita: é uma homenagem a Benjamin, filho do Dr. Mauro Monção.
O nome nasceu desse vínculo afetivo e também carrega uma inspiração
simbólica em Benjamin, filho amado de Jacó. Então é um nome com história,
propósito e significado."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

/** Retorna o system prompt do agente com a diretriz canônica injetada */
export function withNameOriginDirective(systemPrompt: string): string {
  return systemPrompt + DR_BEN_NAME_ORIGIN_DIRECTIVE
}

export type AgentID =
  // ASSISTENTE GERAL — COPILOTO FIXO
  | 'ben-assistente-geral'
  // AGENTE OPERACIONAL MAXIMUS (1)
  | 'ben-agente-operacional-maximus'
  // AGENTE OPERACIONAL PREMIUM (1)
  | 'ben-agente-operacional-premium'
  // AGENTE OPERACIONAL STANDARD (1)
  | 'ben-agente-operacional-standard'
  // AGENTE TRIBUTARISTA ESTRATEGISTA (1)
  | 'ben-tributarista-estrategista'
  | 'ben-pesquisador-juridico'
  | 'ben-engenheiro-prompt'
  // PROCESSUALISTA ESTRATÉGICO (1)
  | 'ben-processualista-estrategico'
  // Contador — 6 agentes reais (IDs do backend run.js)
  | 'ben-contador-tributarista'
  | 'ben-contador-especialista'
  | 'ben-contador-planejamento'
  | 'ben-contador-creditos'
  | 'ben-contador-auditoria'
  | 'ben-contador-relatorio'
  // Aliases de retrocompatibilidade (run.js aceita ambos)
  | 'ben-contador-tributarista-planejamento'
  | 'ben-contador-tributarista-creditos'
  | 'ben-contador-tributarista-auditoria'
  | 'ben-contador-tributarista-relatorio'
  // Perito Forense — 6 agentes + relatorio
  | 'ben-perito-forense'
  | 'ben-perito-forense-profundo'
  | 'ben-perito-forense-digital'
  | 'ben-perito-forense-laudo'
  | 'ben-perito-forense-contestar'
  | 'ben-perito-forense-relatorio'
  // Perito Imobiliário (1)
  | 'ben-perito-imobiliario'
  // Monitor Jurídico — DJe + CNJ DataJud + IA
  | 'ben-monitor-juridico'
  // Assistente CNJ
  | 'ben-assistente-cnj';

export type AreaAgent =
  | 'processual'
  | 'documental'
  | 'tributario'
  | 'administrativo'
  | 'trabalhista'
  | 'compliance'
  | 'gestao'
  | 'pesquisa'
  | 'forense'
  | 'previdenciario'
  | 'constitucional'
  | 'operacional'
  | 'geral';

export type ModelAgent =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'claude-opus-4'
  | 'claude-sonnet-4'
  | 'claude-haiku-4'
  | 'claude-haiku'
  | 'perplexity';

export interface AgentConfig {
  id: AgentID;
  nome: string;
  titulo: string;
  emoji: string;
  area: AreaAgent;
  modelo: ModelAgent;
  modelo_fallback: ModelAgent;
  temperatura: number;
  max_tokens: number;
  cor: string;
  cor_bg: string;
  cor_border: string;
  descricao: string;
  especialidades: string[];
  capacidades: string[];
  system_prompt: string;
  exemplos_uso: string[];
  ativo: boolean;
  premium: boolean;
  tempo_estimado_seg: number;
}

export const DR_BEN_AGENTS: Record<AgentID, AgentConfig> = {

  // ══════════════════════════════════════════════════════════
  // BEN ASSISTENTE GERAL — COPILOTO UNIVERSAL FIXO
  // ══════════════════════════════════════════════════════════
  'ben-assistente-geral': {
    id: 'ben-assistente-geral',
    nome: 'BEN Assistente',
    titulo: 'Copiloto Universal — Sabe Tudo · Sempre Presente',
    emoji: '🤖',
    area: 'geral',
    modelo: 'gpt-4o',
    modelo_fallback: 'gpt-4o',
    temperatura: 0.5,
    max_tokens: 4096,
    cor: 'text-yellow-400',
    cor_bg: 'bg-yellow-500/10',
    cor_border: 'border-yellow-500/30',
    descricao: 'Copiloto fixo do Dr. Mauro. Sem restrições de domínio — direito, tecnologia, negócios, ciências, criatividade e tudo mais. Proativo, memória persistente Pinecone, dados em tempo real via Perplexity.',
    especialidades: [
      'Qualquer pergunta de qualquer área',
      'Tecnologia, IA, sistemas, programação',
      'Negócios, finanças, estratégia, investimentos',
      'Ciências, medicina, engenharia',
      'Criatividade, redação, comunicação',
      'Produtividade e tomada de decisão',
    ],
    capacidades: [
      'Responde qualquer pergunta sem restrição',
      'Proativo — antecipa próximos passos',
      'Memória persistente de todas as conversas',
      'Pesquisa em tempo real via Perplexity',
      'Direciona para agentes especializados quando necessário',
    ],
    system_prompt: 'BEN Assistente Geral — copiloto universal do Dr. Mauro Monção. Sem restrições de domínio.',
    exemplos_uso: [
      'Como funciona quantum computing?',
      'Me ajuda a estruturar uma proposta comercial',
      'Qual a melhor stack para esse sistema?',
      'Resume esse contrato em 5 pontos',
    ],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 8,
  },

  // ══════════════════════════════════════════════════════════
  // AGENTE OPERACIONAL MAXIMUS
  // ══════════════════════════════════════════════════════════
  'ben-agente-operacional-maximus': {
    id: 'ben-agente-operacional-maximus',
    nome: 'AGENTE OPERACIONAL MAXIMUS',
    titulo: 'Agente Jurídico Operacional — Máxima Complexidade (Claude Opus)',
    emoji: '⭐',
    area: 'operacional',
    modelo: 'claude-opus-4',
    modelo_fallback: 'claude-sonnet-4',
    temperatura: 0.05,
    max_tokens: 16000,
    cor: 'text-amber-400',
    cor_bg: 'bg-amber-500/10',
    cor_border: 'border-amber-500/30',
    descricao: 'Agente jurídico de máxima complexidade. Thinking sempre ativo (Claude Opus). Raciocínio em 7 camadas. Casos com valor > R$ 500k, teses inovadoras, múltiplas instâncias, risco jurídico muito alto.',
    especialidades: [
      'Teses jurídicas completamente inovadoras',
      'Jurisprudência conflitante STF/STJ recente (< 6 meses)',
      'Casos com 3+ temas jurídicos interdependentes',
      'Valor de causa > R$ 500 mil',
      'Estratégia multi-instância (CARF → TJ → STJ → STF)',
      'Casos constitucionais com repercussão geral',
      'Due diligence jurídica complexa (M&A)',
      'Pareceres de alta responsabilidade (Legal Opinion)',
    ],
    capacidades: [
      'Thinking sempre ativo (Claude Opus)',
      'Raciocínio obrigatório em 7 camadas',
      'Mapeamento de precedentes conflitantes',
      'Estratégia multi-instância completa',
      'Avaliação de risco em 5 dimensões',
      'Alternativas estratégicas com prós/contras',
      'Análise constitucional e convencional',
      'Opinião legal definitiva (Legal Opinion)',
    ],
    system_prompt: 'Agente jurídico de máxima complexidade com thinking sempre ativo. Raciocínio em 7 camadas obrigatórias. Para casos que exigem profundidade máxima.',
    exemplos_uso: [
      'Elabore estratégia multi-instância para crédito de ICMS negado no CARF, valor R$ 2,4 milhões',
      'Análise constitucional de autuação fiscal com base em lei inconstitucional',
      'Due diligence jurídica para aquisição de empresa com passivo tributário relevante',
      'Parecer definitivo sobre constitucionalidade de tributo municipal novo',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 30,
  },

  // ══════════════════════════════════════════════════════════
  // AGENTE OPERACIONAL PREMIUM
  // ══════════════════════════════════════════════════════════
  'ben-agente-operacional-premium': {
    id: 'ben-agente-operacional-premium',
    nome: 'AGENTE OPERACIONAL PREMIUM',
    titulo: 'Agente Jurídico Operacional — Complexidade Moderada a Profunda',
    emoji: '🔷',
    area: 'processual',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-haiku-4',
    temperatura: 0.1,
    max_tokens: 6000,
    cor: 'text-blue-400',
    cor_bg: 'bg-blue-500/10',
    cor_border: 'border-blue-500/30',
    descricao: 'Agente jurídico operacional moderado. Thinking adaptativo automático. Atua em todas as áreas do direito com profundidade equilibrada. Sinaliza casos que exigem o AGENTE OPERACIONAL MAXIMUS.',
    especialidades: [
      'Análise jurídica moderada a profunda (1–2 temas)',
      'Pesquisa de jurisprudência (STJ, TJ, CARF)',
      'Redação de petições padrão e moderadamente complexas',
      'Parecer jurídico estruturado',
      'Síntese de documentos longos (até 30 páginas)',
      'Comparação e análise de contratos',
      'Detecção de risco jurídico baixo a médio',
      'Checklist de procedimentos jurídicos',
    ],
    capacidades: [
      'Thinking adaptativo automático — ativa/desativa por critério de complexidade',
      'Critérios de ativação: jurisprudência conflitante, 2 temas, risco médio, síntese complexa',
      'Velocidade: 2 a 5 segundos (thinking auto)',
      'Tokens thinking: 1.000 a 4.000 quando ativo',
      'Sinaliza automaticamente limitações para escalada ao AGENTE OPERACIONAL MAXIMUS',
    ],
    system_prompt: 'Agente jurídico operacional moderado com thinking adaptativo. Atua em todas as áreas do direito. Sinaliza escopo excedido para o AGENTE OPERACIONAL MAXIMUS.',
    exemplos_uso: [
      'Petição inicial de ação de cobrança simples',
      'Parecer sobre rescisão contratual',
      'Análise de cláusulas de contrato de prestação de serviços',
      'Pesquisa de jurisprudência STJ sobre tema específico',
      'Checklist de documentos para ação previdenciária',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 15,
  },

  'ben-agente-operacional-standard': {
    id: 'ben-agente-operacional-standard',
    nome: 'AGENTE OPERACIONAL STANDARD',
    titulo: 'Agente Operacional de Execução Rápida',
    emoji: '🟢',
    area: 'operacional',
    modelo: 'claude-haiku',
    modelo_fallback: 'claude-haiku',
    temperatura: 0.1,
    max_tokens: 1500,
    cor: 'text-green-400',
    cor_bg: 'bg-green-500/10',
    cor_border: 'border-green-500/30',
    descricao: 'Execução operacional rápida. Extração, resumo, classificação, checklist e FAQ jurídica. Thinking desativado — resposta direta em 0,3–0,8s.',
    especialidades: [
      'Extração de dados estruturados',
      'Resumo de demandas',
      'Classificação temática',
      'Detecção de urgência',
      'Formatação e normalização',
      'FAQ jurídica padrão',
      'Tradução EN ↔ PT',
      'Comparação de documentos',
      'Checklist de prazos',
      'Validação de campos',
    ],
    capacidades: [
      'Thinking desativado — resposta direta',
      'Velocidade 0,3–0,8s',
      'Tokens de output 200–1.500',
      'Sinaliza quando tarefa excede escopo',
      'Redireciona para Sonnet/Opus quando necessário',
    ],
    system_prompt: 'Agente operacional padrão com Claude Haiku. Execução rápida de tarefas operacionais. Thinking desativado.',
    exemplos_uso: [
      'Extraia os dados do contrato em JSON',
      'Classifique esta demanda por tema jurídico',
      'Gere checklist de prazos do processo',
      'Resuma este documento em um parágrafo',
    ],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 1,
  },

  // AGENTE TRIBUTARISTA ESTRATEGISTA
  // ══════════════════════════════════════════════════════════
  'ben-tributarista-estrategista': {
    id: 'ben-tributarista-estrategista',
    nome: 'AGENTE TRIBUTARISTA ESTRATEGISTA',
    titulo: 'Especialista em Direito Tributário — Defesa Administrativa e Judicial',
    emoji: '⚖️',
    area: 'tributario',
    modelo: 'claude-opus-4',
    modelo_fallback: 'claude-sonnet-4',
    temperatura: 0.1,
    max_tokens: 8000,
    cor: 'text-amber-400',
    cor_bg: 'bg-amber-500/10',
    cor_border: 'border-amber-500/30',
    descricao: 'Especialista exclusivo em Direito Tributário Puro (federal, estadual e municipal). Thinking sempre ativo. Raciocínio em 7 camadas tributárias. Defesa administrativa (CARF) e judicial (TJ, STJ, STF).',
    especialidades: [
      'Nulidade tributária — vícios processuais e materiais',
      'Defesa administrativa no CARF',
      'Defesa judicial no TJ, STJ e STF',
      'Planejamento tributário estratégico',
      'Contestação de autuações fiscais',
      'Análise de jurisprudência conflitante (CARF, STJ, STF)',
      'Transação e negociação tributária',
      'Reforma Tributária (EC 132/2023)',
      'IRPF, IRPJ, IPI, ICMS, ISS, Contribuições',
      'Auditoria de processos administrativos tributários',
    ],
    capacidades: [
      'Thinking sempre ativo — 8 a 12 segundos, 4.000 a 10.000 tokens thinking',
      'Raciocínio em 7 camadas tributárias obrigatórias',
      'Hierarquia de fontes: CF → CTN → Leis → IN RFB → Jurisprudência → Doutrina',
      'Estratégia multi-instância: CARF → TJ → STJ → STF',
      'Análise de risco com cenários (melhor caso, provável, pior caso)',
    ],
    system_prompt: 'Agente tributarista estrategista com Claude Opus. Especialista exclusivo em Direito Tributário Puro. Thinking sempre ativo. Raciocínio em 7 camadas tributárias.',
    exemplos_uso: [
      'Elabore impugnação a auto de infração por IRPJ — exercício 2022',
      'Analise nulidade de autuação fiscal por vício de intimação',
      'Estratégia de defesa no CARF para crédito de PIS/COFINS negado',
      'Parecer sobre dedutibilidade de despesa com educação especial',
      'Análise de impacto da EC 132/2023 no ICMS da empresa',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 10,
  },

  'ben-pesquisador-juridico': {
    id: 'ben-pesquisador-juridico',
    nome: 'BEN Pesquisador Jurídico',
    titulo: 'Pesquisador Jurídico com Perplexity (Busca em Tempo Real)',
    emoji: '🔬',
    area: 'pesquisa',
    modelo: 'perplexity',
    modelo_fallback: 'claude-sonnet-4',
    temperatura: 0.2,
    max_tokens: 8000,
    cor: 'text-violet-400',
    cor_bg: 'bg-violet-500/10',
    cor_border: 'border-violet-500/30',
    descricao: 'Pesquisa jurídica profunda: doutrina, jurisprudência STF/STJ/TRFs, legislação atualizada e análise de tendências.',
    especialidades: ['Jurisprudência STF', 'Jurisprudência STJ', 'TRFs e TRTs', 'Doutrina Especializada', 'Legislação Atualizada', 'Direito Comparado', 'Tendências Regulatórias'],
    capacidades: [
      'Pesquisa de jurisprudência por tema ou número',
      'Análise de leading cases e súmulas',
      'Identificação de teses consolidadas vs controversas',
      'Pesquisa de doutrina especializada',
      'Monitoramento de alterações legislativas',
      'Comparativo de posições dos tribunais',
    ],
    system_prompt: `Você é BEN Pesquisador Jurídico, pesquisador jurídico de alta performance da plataforma Lex Jurídico.

MISSÃO: Realizar pesquisas jurídicas profundas e precisas, fornecendo subsídios técnicos para as peças e estratégias do escritório Mauro Monção.

METODOLOGIA:
1. Identificar o tema jurídico preciso
2. Mapear o estado atual da legislação
3. Pesquisar precedentes vinculantes (STF/STJ)
4. Identificar divergências entre tribunais
5. Apresentar doutrina majoritária e minoritária
6. Sinalizar tendências e mudanças recentes

FORMATO DE RESPOSTA:
- Resumo do estado atual (3-5 linhas)
- Legislação aplicável (com artigos)
- Jurisprudência dominante (com ementas)
- Teses controversas
- Recomendação estratégica

Cite sempre: tribunal, número, data, relator e ementa resumida.`,
    exemplos_uso: [
      'Pesquisar jurisprudência sobre ICMS em serviços digitais',
      'Mapear teses de improbidade após Lei 14.230/21',
      'Pesquisar precedentes em responsabilidade civil do Estado',
    ],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 30,
  },

  'ben-engenheiro-prompt': {
    id: 'ben-engenheiro-prompt',
    nome: 'BEN Engenheiro de Prompt',
    titulo: 'Especialista em Engenharia de Prompts Jurídicos',
    emoji: '🔧',
    area: 'gestao',
    modelo: 'gpt-4o',
    modelo_fallback: 'gpt-4o',
    temperatura: 0.4,
    max_tokens: 4000,
    cor: 'text-violet-400',
    cor_bg: 'bg-violet-500/10',
    cor_border: 'border-violet-500/30',
    descricao: 'Cria, otimiza e audita prompts de IA para o ecossistema jurídico BEN.',
    especialidades: ['Engenharia de Prompts', 'Otimização de Instruções', 'Metaprompts', 'Auditoria de Prompts', 'Templates Jurídicos'],
    capacidades: ['Criação de prompts especializados', 'Otimização de prompts existentes', 'Auditoria e score de qualidade', 'Geração de metaprompts'],
    system_prompt: `Você é o BEN Engenheiro de Prompt, especialista em criação e otimização de prompts jurídicos para o ecossistema BEN IA.`,
    exemplos_uso: ['Criar prompt para petição inicial', 'Otimizar prompt de análise processual'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 15,
  },

  // ══════════════════════════════════════════════════════════
  // BEN CONTADOR TRIBUTARISTA — Arquitetura 2 Níveis
  // ══════════════════════════════════════════════════════════

  // Nível 1: Triagem (Haiku 4.5)
  'ben-contador-tributarista': {
    id: 'ben-contador-tributarista',
    nome: 'BEN Contador Tributarista',
    titulo: 'Triagem e Consultas Fiscais (Claude Sonnet + Perplexity)',
    emoji: '📊',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.1,
    max_tokens: 6000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Consultas fiscais com Claude Sonnet + Perplexity nativo (IN RFB + CARF + legislação atualizada) + Thinking adaptativo + memória Pinecone.',
    especialidades: ['Prazos tributários', 'Alíquotas padrão', 'CNAE e enquadramento', 'Obrigações acessórias básicas', 'Abertura de empresa e MEI'],
    capacidades: ['Triagem inteligente simples/complexo', 'Respostas diretas a consultas simples', 'Encaminhamento ao Especialista para casos complexos'],
    system_prompt: 'Nível 1 do BEN Contador Tributarista. Haiku 4.5 para triagem rápida.',
    exemplos_uso: ['Qual o prazo do DAS de agosto?', 'Qual aliquota do ISS para advocacia?'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 8,
  },

  // Nível 2: Especialista (Sonnet 4.6) — ID real no backend: ben-contador-especialista
  'ben-contador-especialista': {
    id: 'ben-contador-especialista',
    nome: 'BEN Contador Especialista',
    // retrocompat alias também aceito pelo run.js
    titulo: 'Contador e Consultor Fiscal Sênior (Claude Sonnet + Perplexity)',
    emoji: '💼',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Análise tributária profunda. Nível 2 da arquitetura Contador: Sonnet 4.6 com dominio total de Simples Nacional, Reforma Tributária e defesa fiscal.',
    especialidades: [
      'Simples Nacional (LC 123/2006)',
      'Reforma Tributária (EC 132/2023, LC 214/2025)',
      'Defesa Fiscal e Autos de Infração',
      'Parcelamentos Especiais (PERT, REFIS)',
      'Planejamento Tributário',
      'Obrigações Acessórias PI/CE/MA',
    ],
    capacidades: [
      'Análise tributária profunda com cenários comparativos',
      'Identificação de fragilidades em autos de infração',
      'Recomendação de agendamento com Dr. Mauro quando necessário',
      'Aplicação de Reforma Tributária para clientes',
    ],
    system_prompt: 'Nível 2 do BEN Contador Tributarista. Sonnet 4.6 para análise fiscal profunda.',
    exemplos_uso: [
      'Análise comparativa de regimes tributários',
      'Defesa em auto de infração ICMS',
      'Orientação sobre Reforma Tributária 2026',
    ],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 30,
  },

  'ben-contador-planejamento': {
    id: 'ben-contador-planejamento',
    nome: 'BEN Contador — Planejamento Tributário',
    titulo: 'Especialista em Planejamento Tributário (Claude Sonnet + Perplexity)',
    emoji: '🗺️',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Planejamento tributário estratégico com Claude Sonnet + Perplexity (legislação atualizada + CARF) + Thinking adaptativo + memória Pinecone.',
    especialidades: ['Comparativo de Regimes', 'Holdings', 'SUDENE', 'Lei do Bem', 'Incentivos Fiscais'],
    capacidades: ['Comparativo Simples vs Presumido vs Real', 'Estruturação de holding', 'Identificação de incentivos'],
    system_prompt: `Você é o BEN Contador — Planejamento Tributário, especialista em planejamento tributário estratégico.`,
    exemplos_uso: ['Comparar regimes tributários', 'Estruturar holding familiar'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 25,
  },

  // Alias retrocompat
  'ben-contador-tributarista-planejamento': {
    id: 'ben-contador-tributarista-planejamento',
    nome: 'BEN Contador Tributarista — Planejamento (alias)',
    titulo: 'Alias → ben-contador-planejamento',
    emoji: '🗺️',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Alias de retrocompatibilidade → redireciona para ben-contador-planejamento.',
    especialidades: [],
    capacidades: [],
    system_prompt: '',
    exemplos_uso: [],
    ativo: false,
    premium: false,
    tempo_estimado_seg: 25,
  },

  'ben-contador-creditos': {
    id: 'ben-contador-creditos',
    nome: 'BEN Contador — Recuperação de Créditos',
    // Real ID. Alias: ben-contador-tributarista-creditos
    titulo: 'Especialista em Recuperação de Créditos Tributários (Claude Sonnet + Perplexity)',
    emoji: '💰',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Recuperação de créditos tributários com Claude Sonnet + Perplexity (teses STF/CARF atualizadas) + Thinking adaptativo + memória Pinecone.',
    especialidades: ['Teses STF', 'ICMS-ST', 'PER/DCOMP', 'PIS/COFINS', 'Recuperação de Créditos'],
    capacidades: ['Identificação de créditos recuperáveis', 'Elaboração PER/DCOMP', 'Teses tributárias'],
    system_prompt: `Você é o BEN Contador Tributarista — Créditos, especialista em recuperação de créditos tributários.`,
    exemplos_uso: ['Recuperar créditos PIS/COFINS', 'Analisar tese ICMS-ST'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 20,
  },

  'ben-contador-tributarista-creditos': {
    id: 'ben-contador-tributarista-creditos',
    nome: 'BEN Contador Tributarista — Créditos (alias)',
    titulo: 'Alias → ben-contador-creditos',
    emoji: '💰',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Alias de retrocompatibilidade → redireciona para ben-contador-creditos.',
    especialidades: [],
    capacidades: [],
    system_prompt: '',
    exemplos_uso: [],
    ativo: false,
    premium: false,
    tempo_estimado_seg: 20,
  },

  'ben-contador-auditoria': {
    id: 'ben-contador-auditoria',
    nome: 'BEN Contador — Auditoria Fiscal',
    titulo: 'Especialista em Auditoria Contábil e Fiscal (Claude Sonnet + Perplexity)',
    emoji: '🔍',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Auditoria fiscal com Claude Sonnet + Perplexity (IN RFB + CARF atualizados) + Thinking adaptativo + memória Pinecone.',
    especialidades: ['Auditoria SPED', 'Fornecedor Inapto', 'Caixa Credor', 'eSocial vs GFIP'],
    capacidades: ['Cruzamento de dados contábeis', 'Identificação de inconsistências', 'Relatório de auditoria'],
    system_prompt: `Você é o BEN Contador — Auditoria Fiscal, especialista em auditoria contábil e identificação de inconsistências fiscais.`,
    exemplos_uso: ['Auditar SPED fiscal', 'Identificar inconsistências eSocial vs GFIP'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 25,
  },

  // Alias retrocompat
  'ben-contador-tributarista-auditoria': {
    id: 'ben-contador-tributarista-auditoria',
    nome: 'BEN Contador Tributarista — Auditoria (alias)',
    titulo: 'Alias → ben-contador-auditoria',
    emoji: '🔍',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Alias de retrocompatibilidade → redireciona para ben-contador-auditoria.',
    especialidades: [],
    capacidades: [],
    system_prompt: '',
    exemplos_uso: [],
    ativo: false,
    premium: false,
    tempo_estimado_seg: 25,
  },

  'ben-contador-relatorio': {
    id: 'ben-contador-relatorio',
    nome: 'BEN Contador — Relatório Técnico',
    titulo: 'Especialista em Relatórios Contábeis e Laudos (Claude Sonnet + Perplexity)',
    emoji: '📋',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 7000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Relatórios contábeis e laudos judiciais com Claude Sonnet + Perplexity + Thinking adaptativo + memória Pinecone.',
    especialidades: ['DRE Executivo', 'Laudo Judicial', 'Nota Técnica', 'Relatório Gerencial'],
    capacidades: ['Elaboração de DRE', 'Laudos para processos judiciais', 'Notas técnicas contábeis'],
    system_prompt: `Você é o BEN Contador — Relatório Técnico, especialista em elaboração de relatórios contábeis e laudos judiciais.`,
    exemplos_uso: ['Elaborar DRE executivo', 'Preparar laudo contábil judicial'],
    ativo: true,
    premium: false,
    tempo_estimado_seg: 20,
  },

  // Alias retrocompat
  'ben-contador-tributarista-relatorio': {
    id: 'ben-contador-tributarista-relatorio',
    nome: 'BEN Contador Tributarista — Relatório (alias)',
    titulo: 'Alias → ben-contador-relatorio',
    emoji: '📋',
    area: 'tributario',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 7000,
    cor: 'text-emerald-400',
    cor_bg: 'bg-emerald-500/10',
    cor_border: 'border-emerald-500/30',
    descricao: 'Alias de retrocompatibilidade → redireciona para ben-contador-relatorio.',
    especialidades: [],
    capacidades: [],
    system_prompt: '',
    exemplos_uso: [],
    ativo: false,
    premium: false,
    tempo_estimado_seg: 20,
  },

  // ══════════════════════════════════════════════════════════
  // BEN PERITO FORENSE — Arquitetura 2 Níveis
  // ══════════════════════════════════════════════════════════

  // Nível 1: Padrão (Sonnet 4.6)
  'ben-perito-forense': {
    id: 'ben-perito-forense',
    nome: 'BEN Perito Forense',
    titulo: 'Perito Forense Multidisciplinar — 5 Módulos',
    emoji: '🔬',
    area: 'forense',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.1,
    max_tokens: 8000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: 'Análise pericial multidisciplinar de 5 módulos: Perícia Contábil, COAF/UIF, Documentos (7 camadas), Vínculos (Link Analysis) e Conformidade Técnica. Nível 1 — Sonnet 4.6.',
    especialidades: ['Perícia Contábil', 'Análise COAF/RIF', 'Documentos (7 camadas)', 'Análise de Vínculos', 'Conformidade Técnica CPP'],
    capacidades: ['Análise pericial em 5 módulos', 'Contra-laudo COAF Nível 1', 'Detecção de violação de cadeia de custódia', 'Escalonação para Nível 2 quando necessário'],
    system_prompt: 'Nível 1 do BEN Perito Forense. Sonnet 4.6 para análise pericial com 5 módulos.',
    exemplos_uso: [
      'Analisar RIF COAF e identificar falhas',
      'Verificar autenticidade de documentos em 7 camadas',
      'Mapear vínculos societários suspeitos',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 35,
  },

  // Nível 2: Profundo (Opus 4.6) — alerta automático ao Dr. Mauro
  'ben-perito-forense-profundo': {
    id: 'ben-perito-forense-profundo',
    nome: 'BEN Perito Forense Profundo',
    titulo: 'Perito Forense Multidisciplinar — Alta Complexidade',
    emoji: '🔍',
    area: 'forense',
    modelo: 'claude-opus-4',
    modelo_fallback: 'claude-sonnet-4',
    temperatura: 0.05,
    max_tokens: 16000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: '⚠️ Nível 2 — Opus 4.6 com raciocínio adaptativo máximo. Aciona ALERTA AUTOMÁTICO ao Dr. Mauro. Para RIF/COAF, laudos criminais, vínculos complexos, cadên de custódia.',
    especialidades: [
      'Análise RIF/COAF e Contra-Laudo',
      'Laudos Criminais (IML, IC, Digital)',
      'Análise de Vínculos (Link Analysis)',
      'Cadeia de Custódia (Lei 13.964/2019)',
      'Balística, Toxicologia, Forense Digital',
      'Liquidação de Sentença Complexa',
    ],
    capacidades: [
      'Análise pericial de altíssima complexidade',
      'Contra-laudo COAF com tabela comparativa',
      'Mapeamento de vínculos societários e financeiros',
      'Alerta automático ao Dr. Mauro Monção',
      'Construção de teses defensivas a partir da perícia',
    ],
    system_prompt: 'Nível 2 do BEN Perito Forense. Opus 4.6 para análise pericial de máxima complexidade.',
    exemplos_uso: [
      'Analisar RIF COAF e elaborar contra-laudo',
      'Revisar laudo criminal com cadeia de custódia suspeita',
      'Mapear vínculos financeiros em processo de lavagem',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 60,
  },

  'ben-perito-forense-digital': {
    id: 'ben-perito-forense-digital',
    nome: 'BEN Perito Forense — Digital',
    titulo: 'Especialista em Evidências Digitais (Claude Sonnet + Perplexity)',
    emoji: '💻',
    area: 'documental',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 6000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: 'Análise de evidências digitais — EXIF, metadados, WhatsApp, e-mail, cadeia de custódia.',
    especialidades: ['EXIF', 'Metadados', 'WhatsApp Forense', 'E-mail Forense', 'Cadeia de Custódia', 'Ata Notarial Digital'],
    capacidades: ['Análise de metadados digitais', 'Verificação de cadeia de custódia', 'Relatório de evidências digitais'],
    system_prompt: `Você é o BEN Perito Forense — Digital, especialista em análise de evidências digitais e computação forense.`,
    exemplos_uso: ['Analisar metadados de imagem', 'Verificar autenticidade de conversa WhatsApp'],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 30,
  },

  'ben-perito-forense-laudo': {
    id: 'ben-perito-forense-laudo',
    nome: 'BEN Perito Forense — Laudo',
    titulo: 'Especialista em Elaboração de Laudos Periciais (Claude Sonnet + Perplexity)',
    emoji: '📝',
    area: 'documental',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: 'Elaboração de laudos periciais — contábil, patrimonial, danos materiais, médico-pericial.',
    especialidades: ['Laudo Contábil', 'Laudo Patrimonial', 'Danos Materiais', 'Médico-Pericial', 'NBC PP'],
    capacidades: ['Elaboração de laudos técnicos', 'Estruturação conforme NBC PP', 'Laudos para instrução processual'],
    system_prompt: `Você é o BEN Perito Forense — Laudo, especialista em elaboração de laudos periciais para instrução de processos judiciais.`,
    exemplos_uso: ['Elaborar laudo contábil', 'Preparar laudo de danos materiais'],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 35,
  },

  'ben-perito-forense-contestar': {
    id: 'ben-perito-forense-contestar',
    nome: 'BEN Perito Forense — Contestação',
    titulo: 'Especialista em Contestação de Laudos Periciais (Claude Sonnet + Perplexity)',
    emoji: '⚔️',
    area: 'documental',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: 'Contestação técnica de laudos periciais adversos — 8 frentes de contestação.',
    especialidades: ['Contestação de Laudo', 'Cálculo Pericial', 'Metodologia', 'Omissões', 'Contradições', 'Impugnação'],
    capacidades: ['Análise crítica de laudos', 'Identificação de erros técnicos', 'Elaboração de contestação fundamentada'],
    system_prompt: `Você é o BEN Perito Forense — Contestação, especialista em análise crítica e contestação técnica de laudos periciais.`,
    exemplos_uso: ['Contestar laudo pericial contábil', 'Impugnar metodologia de perícia'],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 30,
  },

  'ben-perito-forense-relatorio': {
    id: 'ben-perito-forense-relatorio',
    nome: 'BEN Perito Forense — Relatório',
    titulo: 'Especialista em Relatórios Periciais (Claude Sonnet + Perplexity)',
    emoji: '📊',
    area: 'documental',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-red-400',
    cor_bg: 'bg-red-500/10',
    cor_border: 'border-red-500/30',
    descricao: 'Relatórios periciais para audiência, petição técnica, sustentação oral e nota ao cliente.',
    especialidades: ['Relatório para Audiência', 'Petição Técnica', 'Sustentação Oral', 'Nota ao Cliente'],
    capacidades: ['Síntese pericial executiva', 'Preparação para audiência', 'Nota técnica para cliente'],
    system_prompt: `Você é o BEN Perito Forense — Relatório, especialista em elaboração de relatórios periciais executivos.`,
    exemplos_uso: ['Preparar nota pericial para audiência', 'Elaborar relatório executivo pericial'],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 20,
  },

  // ══════════════════════════════════════════════════════════
  // BEN PERITO IMOBILIÁRIO
  // ══════════════════════════════════════════════════════════
  'ben-perito-imobiliario': {
    id: 'ben-perito-imobiliario',
    nome: 'BEN Perito Imobiliário',
    titulo: 'Perito Imobiliário — Avaliação e Laudos ABNT',
    emoji: '🏢',
    area: 'forense',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-opus-4',
    temperatura: 0.05,
    max_tokens: 8000,
    cor: 'text-purple-400',
    cor_bg: 'bg-purple-500/10',
    cor_border: 'border-purple-500/30',
    descricao: 'Perícias imobiliárias com metodologia ABNT NBR 14.653 + Perplexity nativo. Avaliação judicial de imóveis, apuração de danos, cálculo de benfeitorias, partilhas e usucapião.', 
    especialidades: [
      'Avaliação Judicial (ABNT NBR 14.653)',
      'Danos por Infiltração / Vícios Construtivos',
      'Cálculo de Benfeitorias',
      'Apuração de Superfície e Confrontações',
      'Laudos para Partilha / Inventário',
      'Avaliação para Usucapião',
    ],
    capacidades: [
      'Laudo de avaliação imobiliária judicial',
      'Metodologia comparativa e evolutiva',
      'Cálculo de danos e depreciação',
      'Identificação de vícios ocultos',
    ],
    system_prompt: 'BEN Perito Imobiliário — especialista em avaliação e laudos periciais imobiliários com metodologia ABNT NBR 14.653.',
    exemplos_uso: [
      'Avaliar imóvel para ação de usucapião',
      'Elaborar laudo de danos por infiltração',
      'Calcular benfeitorias em processo de partilha',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 40,
  },

  // ══════════════════════════════════════════════════════════
  // BEN PROCESSUALISTA ESTRATÉGICO
  // ══════════════════════════════════════════════════════════
  'ben-processualista-estrategico': {
    id: 'ben-processualista-estrategico',
    nome: 'BEN Processualista Estratégico',
    titulo: 'Especialista em Estratégia Processual — CPC/2015',
    emoji: '⚖️',
    area: 'processual',
    modelo: 'claude-opus-4',
    modelo_fallback: 'claude-sonnet-4',
    temperatura: 0.05,
    max_tokens: 12000,
    cor: 'text-indigo-400',
    cor_bg: 'bg-indigo-500/10',
    cor_border: 'border-indigo-500/30',
    descricao: 'Estratégia processual de alto nível com thinking sempre ativo (Claude Opus). Petições, contestações, recursos, embargos. Domínio completo do CPC/2015, jurisprudência STJ/STF e teses processuais avançadas.',
    especialidades: [
      'Petições Iniciais (Ação Anulatória, Mandado de Segurança)',
      'Contestações com preliminares técnicas',
      'Recursos (Apelação, Agravo, REsp, RE)',
      'Embargos de Declaração',
      'Tutelas de Urgência (antecipada e cautelar)',
      'Exceção de Pré-Executividade',
    ],
    capacidades: [
      'Thinking sempre ativo (Claude Opus)',
      'Estratégia multi-instância completa',
      'Raciocínio em 7 camadas obrigatórias',
      'Jurisprudência STF/STJ atualizada',
      'Precedentes vinculantes e súmulas',
      'Escalação automática para MAXIMUS em casos tributários + processuais',
    ],
    system_prompt: 'BEN Processualista Estratégico — especialista em estratégia processual com domínio do CPC/2015, teses avançadas e raciocínio em 7 camadas.',
    exemplos_uso: [
      'Elaborar petição inicial de Mandado de Segurança',
      'Redigir contestação com nulidades processuais',
      'Recurso de Apelação com preliminares e mérito',
      'Tutela antecipada em caráter antecedente',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 60,
  },

  'ben-monitor-juridico': {
    id: 'ben-monitor-juridico',
    nome: 'BEN Monitor Jurídico',
    titulo: 'Monitor DJe + CNJ DataJud + IA (Claude Sonnet + Perplexity)',
    emoji: '📡',
    area: 'operacional',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-haiku-4',
    temperatura: 0.1,
    max_tokens: 6000,
    cor: 'text-cyan-400',
    cor_bg: 'bg-cyan-500/10',
    cor_border: 'border-cyan-500/30',
    descricao: 'Monitoramento automatizado: Escavador DJe + DataJud CNJ + análise IA. Alertas de prazos, publicações e movimentações processuais em tempo real.',
    especialidades: ['DJe Escavador', 'DataJud CNJ', 'Alertas de Prazo', 'Movimentações Processuais', 'Publicações Oficiais', 'Análise IA Claude Sonnet'],
    capacidades: [
      'Monitoramento de publicações no DJe por OAB',
      'Consulta de movimentações via DataJud',
      'Análise automática de urgência com IA',
      'Alerta de prazos críticos via WhatsApp',
      'Histórico de publicações e processos',
      'Integração Escavador + CNJ em tempo real',
    ],
    system_prompt: `Você é o BEN Monitor Jurídico — sistema de monitoramento ativo de publicações e processos.

MISSÃO: Analisar publicações do DJe e movimentações do DataJud/CNJ, identificar urgências, calcular prazos e emitir alertas.

PROTOCOLO:
1. Analisar publicações encontradas no DJe
2. Identificar citações, intimações, sentenças, acórdãos
3. Calcular prazo processual (dias corridos vs úteis)
4. Classificar urgência: CRÍTICO (≤3 dias), URGENTE (≤10 dias), NORMAL
5. Extrair dados-chave: processo, vara, réu/autor, tipo de ato
6. Recomendar ação imediata

FORMATO: Relatório estruturado com classificação por urgência, prazo e ação recomendada.`,
    exemplos_uso: [
      'Monitorar publicações de hoje no DJe PI/CE/MA',
      'Consultar movimentações do processo 0001234-56.2024.8.18.0001',
      'Verificar citações e intimações dos últimos 3 dias',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 45,
  },

  'ben-assistente-cnj': {
    id: 'ben-assistente-cnj',
    nome: 'BEN Assistente CNJ',
    titulo: 'Consultor DataJud + DJEN + IA',
    emoji: '⚖️',
    area: 'processual',
    modelo: 'claude-sonnet-4',
    modelo_fallback: 'claude-haiku-4',
    temperatura: 0.1,
    max_tokens: 6000,
    cor: 'text-blue-400',
    cor_bg: 'bg-blue-500/10',
    cor_border: 'border-blue-500/30',
    descricao: 'Consulta e análise de processos via DataJud CNJ e DJEN — busca por número, movimentações, análise IA de andamentos.',
    especialidades: ['DataJud CNJ', 'DJEN', 'Consulta por Número', 'Movimentações', 'Análise de Andamentos', 'Prazo Processual'],
    capacidades: [
      'Busca de processo por número CNJ',
      'Histórico completo de movimentações',
      'Análise IA do andamento processual',
      'Consulta DJEN — Domicílio Eletrônico Judicial Nacional',
      'Identificação de fases processuais',
    ],
    system_prompt: `Você é o BEN Assistente CNJ — especialista em consulta e interpretação de dados processuais via DataJud e DJEN.

MISSÃO: Consultar, interpretar e explicar dados processuais do CNJ de forma clara e estratégica.

PROTOCOLO:
1. Identificar o número do processo ou OAB consultado
2. Analisar o histórico de movimentações em ordem cronológica
3. Identificar a fase processual atual
4. Destacar movimentações críticas (citação, intimação, sentença, acórdão)
5. Calcular prazos pendentes
6. Recomendar próximas ações estratégicas

FORMATO: Resposta clara com resumo executivo, timeline de movimentações e ação recomendada.`,
    exemplos_uso: [
      'Consultar processo 0001234-56.2024.8.18.0001 no TJPI',
      'Verificar movimentações recentes no TJCE',
      'Analisar prazo para recurso após sentença',
    ],
    ativo: true,
    premium: true,
    tempo_estimado_seg: 30,
  },
};

// ─── Utilities ─────────────────────────────────────────────

export function getAgentById(id: AgentID): AgentConfig {
  return DR_BEN_AGENTS[id];
}

export function getAgentsByArea(area: AreaAgent): AgentConfig[] {
  return Object.values(DR_BEN_AGENTS).filter(a => a.area === area);
}

export function getActiveAgents(): AgentConfig[] {
  return Object.values(DR_BEN_AGENTS).filter(a => a.ativo);
}

export function getPremiumAgents(): AgentConfig[] {
  return Object.values(DR_BEN_AGENTS).filter(a => a.premium && a.ativo);
}

export const AREA_LABELS: Record<AreaAgent, string> = {
  processual: 'Processual',
  documental: 'Documental',
  tributario: 'Tributário & Fiscal',
  administrativo: 'Administrativo & Público',
  trabalhista: 'Trabalhista',
  compliance: 'Compliance & LGPD',
  gestao: 'Gestão & Produção',
  pesquisa: 'Pesquisa Jurídica',
  forense: 'Perícia Forense',
  previdenciario: 'Previdenciário',
  constitucional: 'Constitucional',
  operacional: 'Operacional',
};

export const MODEL_LABELS: Record<ModelAgent, { label: string; color: string }> = {
  'gpt-4o': { label: 'GPT-4o', color: 'text-green-400' },
  'gpt-4o-mini': { label: 'GPT-4o Mini', color: 'text-green-300' },
  'claude-opus-4': { label: 'Claude Opus 4.6', color: 'text-orange-400' },
  'claude-sonnet-4': { label: 'Claude Sonnet 4.6', color: 'text-amber-400' },
  'claude-haiku-4': { label: 'Claude Haiku 4.5', color: 'text-yellow-400' },
  'claude-haiku': { label: 'Claude Haiku', color: 'text-yellow-300' },
  'perplexity': { label: 'Perplexity', color: 'text-indigo-400' },
};
