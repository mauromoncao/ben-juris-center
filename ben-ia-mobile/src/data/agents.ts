// src/data/agents.ts
// FONTE ÚNICA: copiado exatamente do Ecosystem IA src/App.tsx SIDEBAR_CATEGORIES
// Agentes removidos/inexistentes NÃO estão aqui.

export interface Agent {
  id: string
  emoji: string
  shortName: string
  name: string
  model: string
  category: string
  categoryLabel: string
  categoryColor: string
  badge?: string
  badgeColor?: string
  color: string
  accentColor: string
  description: string
}

// ── Paleta idêntica ao Ecosystem ──────────────────────────────
export const THEME = {
  // Fundo geral (área de conteúdo)
  bgPage:    '#F2F4F8',
  // Cards, mensagens bot, input
  bgCard:    '#FFFFFF',
  bgInput:   '#FFFFFF',
  // Sidebar
  sidebarBg: '#0d1f3c',           // linear-gradient no original
  sidebarBg2:'#0d2d4a',
  // Texto principal
  textMain:  '#1A1A1A',
  textMuted: '#6B7280',
  textSub:   '#374151',
  // Bordas
  border:    '#E8ECF0',
  borderSub: '#EEEEEE',
  // Dourado (marca BEN)
  gold:      '#E4B71E',
  goldDark:  '#D4A017',
  // Mensagem usuário
  userBubble:'#0d1f3c',
  userText:  '#FFFFFF',
  // Header sidebar
  sidebarText:'#A8C4E0',
  sidebarTextHover:'#D0E4FF',
  // Accent azul
  blue:      '#1d4ed8',
  blueBg:    '#EFF6FF',
  blueBorder:'#BFDBFE',
}

// ── Agentes — exatamente os do Ecosystem IA (App.tsx SIDEBAR_CATEGORIES) ──
export const AGENTS: Agent[] = [
  // ─── Sistema: Assistente Geral PRIMEIRO (padrão do chat) ──────
  {
    id: 'ben-assistente-geral',
    emoji: 'B', shortName: 'Copilot',
    name: 'BEN Copilot',
    model: 'GPT-4o', category: 'sistema', categoryLabel: 'Sistema', categoryColor: '#A5B4FC',
    badge: 'FIXO', badgeColor: '#6d28d9',
    color: '#6d28d9', accentColor: '#ede9fe',
    description: 'Copiloto universal BEN IA — sem restrições temáticas, responde qualquer pergunta.',
  },

  // ─── Jurídico ─────────────────────────────────────────────────
  {
    id: 'ben-agente-operacional-maximus',
    emoji: 'B', shortName: 'Agente Maximus',
    name: 'AGENTE OPERACIONAL MAXIMUS',
    model: 'Claude Opus 4', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    badge: 'OPUS', badgeColor: '#92400e',
    color: '#92400e', accentColor: '#fef3c7',
    description: 'Análise jurídica de máxima profundidade — última instância, análise final e vinculante.',
  },
  {
    id: 'ben-agente-operacional-premium',
    emoji: 'B', shortName: 'Agente Premium',
    name: 'AGENTE OPERACIONAL PREMIUM',
    model: 'Claude Sonnet 4', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#1d4ed8', accentColor: '#dbeafe',
    description: 'Análise jurídica moderada a profunda. Thinking adaptativo automático.',
  },
  {
    id: 'ben-agente-operacional-standard',
    emoji: 'B', shortName: 'Agente Standard',
    name: 'AGENTE OPERACIONAL STANDARD',
    model: 'Claude Haiku 4', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    badge: 'HAIKU', badgeColor: '#16a34a',
    color: '#16a34a', accentColor: '#dcfce7',
    description: 'Execução operacional rápida. Extração, resumo, classificação, checklist.',
  },
  {
    id: 'ben-tributarista-estrategista',
    emoji: 'B', shortName: 'Tributarista Estrat.',
    name: 'AGENTE TRIBUTARISTA ESTRATEGISTA',
    model: 'Claude Opus 4', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    badge: 'OPUS', badgeColor: '#b45309',
    color: '#b45309', accentColor: '#fef3c7',
    description: 'Especialista em Direito Tributário Puro. Defesa no CARF, TJ, STJ e STF.',
  },
  {
    id: 'ben-processualista-estrategico',
    emoji: 'B', shortName: 'Processualista Estrat.',
    name: 'AGENTE PROCESSUALISTA ESTRATÉGICO',
    model: 'Claude Opus 4', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    badge: 'OPUS', badgeColor: '#1e3a5f',
    color: '#1e3a5f', accentColor: '#dbeafe',
    description: 'Estrategista processual de nível STF/STJ. Análise em 6 camadas.',
  },
  {
    emoji: 'B', shortName: 'Peticionista',
    name: 'BEN Peticionista Jurídico',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#1d4ed8', accentColor: '#dbeafe',
    description: 'Peças processuais conforme o caso concreto e jurisprudência.',
  },
  {
    emoji: 'B', shortName: 'Contratualista',
    name: 'BEN Contratualista',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#7c3aed', accentColor: '#ede9fe',
    description: 'Contratos empresariais, NDAs, societários e negociais.',
  },
  {
    emoji: 'B', shortName: 'Mandatário',
    name: 'BEN Mandatário Jurídico',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#059669', accentColor: '#d1fae5',
    description: 'Procurações, Ad Judicia, gerais e especiais.',
  },
  {
    emoji: 'B', shortName: 'Analista Proc.',
    name: 'BEN Analista Processual',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#dc2626', accentColor: '#fee2e2',
    description: 'Análise estratégica de processos com avaliação de risco.',
  },
  {
    emoji: 'B', shortName: 'Tributarista',
    name: 'BEN Tributarista',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#d97706', accentColor: '#fef3c7',
    description: 'Direito tributário, planejamento fiscal e teses avançadas.',
  },
  {
    emoji: 'B', shortName: 'Trabalhista',
    name: 'BEN Trabalhista',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#0369a1', accentColor: '#e0f2fe',
    description: 'Direito do trabalho, TST, reclamações e acordos.',
  },
  {
    emoji: 'B', shortName: 'Previdenciarista',
    name: 'BEN Previdenciarista',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#7c3aed', accentColor: '#ede9fe',
    description: 'Benefícios INSS, aposentadorias e revisões previdenciárias.',
  },
  {
    emoji: 'B', shortName: 'Constitucionalista',
    name: 'BEN Constitucionalista',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#b91c1c', accentColor: '#fee2e2',
    description: 'MS, HC, Mandado de Injunção e ações constitucionais.',
  },
  {
    emoji: 'B', shortName: 'Compliance',
    name: 'BEN Especialista Compliance',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#0f766e', accentColor: '#ccfbf1',
    description: 'Conformidade LGPD, políticas de privacidade e proteção de dados.',
  },
  {
    id: 'ben-pesquisador-juridico',
    emoji: 'B', shortName: 'Pesquisador',
    name: 'BEN Pesquisador Jurídico',
    model: 'Perplexity', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#6d28d9', accentColor: '#ede9fe',
    description: 'Pesquisa em tempo real: STF, STJ, TRF, TJPI com citações.',
  },
  {
    emoji: 'B', shortName: 'Relator',
    name: 'BEN Relator Jurídico',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#1e40af', accentColor: '#dbeafe',
    description: 'Artigos jurídicos, pareceres técnicos e publicações.',
  },
  {
    emoji: 'B', shortName: 'Redator',
    name: 'BEN Redator Jurídico',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#374151', accentColor: '#f3f4f6',
    description: 'Redação técnica jurídica, memorandos, ofícios.',
  },
  {
    emoji: 'B', shortName: 'Auditor',
    name: 'BEN Auditor Processual',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#0f766e', accentColor: '#ccfbf1',
    description: 'Auditoria de prazos críticos e conformidade OAB.',
  },
  {
    emoji: 'B', shortName: 'Gestor',
    name: 'BEN Gestor Jurídico',
    model: 'GPT-4o', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#374151', accentColor: '#f3f4f6',
    description: 'Gestão de escritório, produtividade e governança.',
  },
  {
    emoji: 'B', shortName: 'Revisor',
    name: 'BEN Revisor Jurídico',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#374151', accentColor: '#f3f4f6',
    description: 'Revisão técnica e linguística de peças jurídicas.',
  },
  {
    emoji: 'B', shortName: 'Peticionista G.',
    name: 'BEN Peticionista',
    model: 'Claude Haiku 4.5', category: 'juridico', categoryLabel: 'Jurídico', categoryColor: '#93C5FD',
    color: '#1d4ed8', accentColor: '#dbeafe',
    description: 'Petições iniciais, recursos e peças de urgência.',
  },

  // ─── Contador ─────────────────────────────────────────────────
  {
    id: 'ben-contador-tributarista',
    emoji: 'B', shortName: 'Triagem',
    name: 'BEN Contador — Triagem',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#92400e', accentColor: '#fef3c7',
    description: 'Triagem fiscal e orientação tributária inicial.',
  },
  {
    id: 'ben-contador-especialista',
    emoji: 'B', shortName: 'Especialista',
    name: 'BEN Contador — Especialista',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#b45309', accentColor: '#fef9c3',
    description: 'Análise fiscal profunda e consultoria especializada.',
  },
  {
    id: 'ben-contador-planejamento',
    emoji: 'B', shortName: 'Planejamento',
    name: 'BEN Contador — Planejamento',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#d97706', accentColor: '#fef3c7',
    description: 'Planejamento tributário estratégico.',
  },
  {
    id: 'ben-contador-creditos',
    emoji: 'B', shortName: 'Créditos',
    name: 'BEN Contador — Créditos',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#059669', accentColor: '#d1fae5',
    description: 'Recuperação de créditos tributários.',
  },
  {
    id: 'ben-contador-auditoria',
    emoji: 'B', shortName: 'Auditoria',
    name: 'BEN Contador — Auditoria',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#dc2626', accentColor: '#fee2e2',
    description: 'Auditoria fiscal e contábil.',
  },
  {
    id: 'ben-contador-relatorio',
    emoji: 'B', shortName: 'Relatório',
    name: 'BEN Contador — Relatório',
    model: 'Claude Sonnet 4', category: 'contador', categoryLabel: 'Contador', categoryColor: '#FCD34D',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#0369a1', accentColor: '#e0f2fe',
    description: 'Relatórios fiscais e demonstrativos contábeis.',
  },

  // ─── Perito Forense ───────────────────────────────────────────
  {
    id: 'ben-perito-forense',
    emoji: 'B', shortName: 'Padrão',
    name: 'BEN Perito Forense — Padrão',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#4f46e5', accentColor: '#e0e7ff',
    description: 'Laudos periciais padrão com metodologia técnica.',
  },
  {
    id: 'ben-perito-forense-profundo',
    emoji: 'B', shortName: 'Profundo',
    name: 'BEN Perito Forense — Profundo',
    model: 'Claude Opus 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'OPUS', badgeColor: '#b45309',
    color: '#b91c1c', accentColor: '#fee2e2',
    description: 'Análise pericial profunda — máxima precisão técnica.',
  },
  {
    id: 'ben-perito-forense-digital',
    emoji: 'B', shortName: 'Digital',
    name: 'BEN Perito Forense Digital',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#7c3aed', accentColor: '#ede9fe',
    description: 'Perícia digital: EXIF, metadados, WhatsApp forense.',
  },
  {
    id: 'ben-perito-forense-laudo',
    emoji: 'B', shortName: 'Laudo',
    name: 'BEN Perito Forense — Laudo',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#0369a1', accentColor: '#e0f2fe',
    description: 'Elaboração de laudos técnicos periciais.',
  },
  {
    id: 'ben-perito-forense-contestar',
    emoji: 'B', shortName: 'Contraditório',
    name: 'BEN Perito — Contraditório',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#059669', accentColor: '#d1fae5',
    description: 'Contestação e contraditório de laudos periciais.',
  },
  {
    id: 'ben-perito-forense-relatorio',
    emoji: 'B', shortName: 'Relatório',
    name: 'BEN Perito Forense — Relatório',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#374151', accentColor: '#f3f4f6',
    description: 'Relatórios periciais completos e padronizados.',
  },
  {
    id: 'ben-perito-imobiliario',
    emoji: 'B', shortName: 'Imobiliário',
    name: 'BEN Perito Imobiliário — ABNT',
    model: 'Claude Sonnet 4', category: 'perito', categoryLabel: 'Perito Forense', categoryColor: '#C4B5FD',
    badge: 'SONNET', badgeColor: '#1d4ed8',
    color: '#0f766e', accentColor: '#ccfbf1',
    description: 'Avaliação imobiliária conforme ABNT NBR 14.653.',
  },

  // ─── Growth & Marketing ───────────────────────────────────────
  {
    id: 'ben-atendente',
    emoji: 'B', shortName: 'Atendente',
    name: 'BEN Atendente',
    model: 'GPT-4o Mini', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#059669', accentColor: '#d1fae5',
    description: 'Atendimento jurídico 24/7 e triagem de clientes.',
  },
  {
    id: 'ben-conteudista',
    emoji: 'B', shortName: 'Conteudista',
    name: 'BEN Conteudista Jurídico',
    model: 'GPT-4o', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#7c3aed', accentColor: '#ede9fe',
    description: 'Artigos jurídicos e conteúdo para redes sociais OAB.',
  },
  {
    id: 'ben-estrategista-campanhas',
    emoji: 'B', shortName: 'Campanhas',
    name: 'BEN Estrategista Campanhas',
    model: 'GPT-4o', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#059669', accentColor: '#d1fae5',
    description: 'Meta Ads e Google Ads para escritório jurídico.',
  },
  {
    id: 'ben-estrategista-marketing',
    emoji: '📣', shortName: 'Marketing',
    name: 'BEN Estrategista Marketing',
    model: 'GPT-4o', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#0369a1', accentColor: '#e0f2fe',
    description: 'Redes sociais e branding jurídico.',
  },
  {
    id: 'ben-analista-relatorios',
    emoji: 'B', shortName: 'Relatórios',
    name: 'BEN Analista de Relatórios',
    model: 'Claude Haiku 4.5', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#d97706', accentColor: '#fef3c7',
    description: 'Relatórios de performance e métricas do escritório.',
  },
  {
    id: 'ben-diretor-criativo',
    emoji: 'B', shortName: 'Dir. Criativo',
    name: 'BEN Diretor Criativo',
    model: 'GPT-4o', category: 'growth', categoryLabel: 'Growth & Marketing', categoryColor: '#6EE7B7',
    color: '#7c3aed', accentColor: '#ede9fe',
    description: 'Branding jurídico e identidade visual.',
  },

  // ─── Sistema (restante) ───────────────────────────────────────
  {
    id: 'ben-engenheiro-prompt',
    emoji: 'B', shortName: 'Eng. Prompt',
    name: 'BEN Engenheiro de Prompt',
    model: 'GPT-4o', category: 'sistema', categoryLabel: 'Sistema', categoryColor: '#A5B4FC',
    color: '#4f46e5', accentColor: '#e0e7ff',
    description: 'Otimização de prompts e arquitetura de agentes IA.',
  },
  {
    id: 'ben-analista-monitoramento',
    emoji: 'B', shortName: 'Monitoramento',
    name: 'BEN Analista Monitoramento',
    model: 'GPT-4o Mini', category: 'sistema', categoryLabel: 'Sistema', categoryColor: '#A5B4FC',
    color: '#dc2626', accentColor: '#fee2e2',
    description: 'Monitoramento de saúde do sistema e alertas.',
  },
  {
    id: 'ben-monitor-juridico',
    emoji: 'B', shortName: 'Monitor Jurídico',
    name: 'BEN Monitor Jurídico DJe + CNJ',
    model: 'Claude Sonnet 4', category: 'sistema', categoryLabel: 'Sistema', categoryColor: '#A5B4FC',
    badge: 'NEW', badgeColor: '#0e7490',
    color: '#0e7490', accentColor: '#cffafe',
    description: 'Monitor DJe + DataJud CNJ em tempo real.',
  },
  {
    id: 'ben-assistente-cnj',
    emoji: 'B', shortName: 'Assistente CNJ',
    name: 'BEN Assistente CNJ DataJud',
    model: 'Claude Sonnet 4', category: 'sistema', categoryLabel: 'Sistema', categoryColor: '#A5B4FC',
    badge: 'NEW', badgeColor: '#0e7490',
    color: '#0e7490', accentColor: '#cffafe',
    description: 'Consulta e análise de processos no DataJud CNJ.',
  },
]

// Agente padrão ao abrir o app
export const DEFAULT_AGENT = AGENTS[0] // ben-assistente-geral

export const CATEGORIES = [
  { key: 'juridico', label: 'Jurídico',          emoji: 'B', color: '#93C5FD' },
  { key: 'contador', label: 'Contador',           emoji: 'B', color: '#FCD34D' },
  { key: 'perito',   label: 'Perito Forense',     emoji: 'B', color: '#C4B5FD' },
  { key: 'growth',   label: 'Growth & Marketing', emoji: '📣', color: '#6EE7B7' },
  { key: 'sistema',  label: 'Sistema',            emoji: '⚙️', color: '#A5B4FC' },
]

export const JURIS_API = 'https://ben-juris-center.vercel.app'
