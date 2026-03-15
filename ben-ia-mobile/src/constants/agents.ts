// ─────────────────────────────────────────────────────────────────
// BEN IA — Constantes globais
// ─────────────────────────────────────────────────────────────────

export const JURIS_API = 'https://juris.mauromoncao.adv.br'

// ── Autenticação ─────────────────────────────────────────────────
export const AUTH_PASSWORD = '12345678'
export const ALLOWED_EMAILS = [
  'mauromoncaoestudos@gmail.com',
  'mauromoncaoadv.escritorio@gmail.com',
]

// ── Cores base ───────────────────────────────────────────────────
export const COLORS = {
  bg:           '#0A1628',
  bgCard:       '#0d1f3c',
  bgInput:      '#0f2645',
  border:       '#1a3560',
  borderLight:  '#243f6a',
  gold:         '#E2B714',
  goldLight:    '#F7D060',
  textPrimary:  '#E0EAFF',
  textSecondary:'#7096C8',
  textMuted:    '#4a6080',
  userBubble:   '#1a3a6e',
  botBubble:    '#0d2340',
  error:        '#EF4444',
  success:      '#22C55E',
}

// ── Agentes (espelho exato do Ecosystem IA) ──────────────────────
export interface Agent {
  id: string
  emoji: string
  shortName: string
  name: string
  model: string
  badge?: string
  badgeColor?: string
  category: string
}

export interface AgentCategory {
  key: string
  label: string
  color: string
  agents: Agent[]
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    key: 'juridico', label: 'Jurídico', color: '#93C5FD',
    agents: [
      { id: 'ben-agente-operacional-premium',   emoji: '🔷', shortName: 'Agente Premium',          name: 'AGENTE OPERACIONAL PREMIUM',           model: 'Claude Sonnet 4',  badge: 'SONNET', badgeColor: '#1d4ed8', category: 'juridico' },
      { id: 'ben-agente-operacional-standard',  emoji: '🟢', shortName: 'Agente Standard',         name: 'AGENTE OPERACIONAL STANDARD',          model: 'Claude Haiku 4',   badge: 'HAIKU',  badgeColor: '#16a34a', category: 'juridico' },
      { id: 'ben-tributarista-estrategista',    emoji: '⚖️', shortName: 'Tributarista Estrat.',    name: 'AGENTE TRIBUTARISTA ESTRATEGISTA',     model: 'Claude Opus 4',    badge: 'OPUS',   badgeColor: '#b45309', category: 'juridico' },
      { id: 'ben-processualista-estrategico',   emoji: '📋', shortName: 'Processualista Estrat.',  name: 'AGENTE PROCESSUALISTA ESTRATÉGICO',    model: 'Claude Opus 4',    badge: 'OPUS',   badgeColor: '#1e3a5f', category: 'juridico' },
      { id: 'ben-pesquisador-juridico',         emoji: '🔎', shortName: 'Pesquisador',             name: 'BEN Pesquisador Jurídico',             model: 'Perplexity',       category: 'juridico' },
    ],
  },
  {
    key: 'contador', label: 'Contador', color: '#FCD34D',
    agents: [
      { id: 'ben-contador-tributarista', emoji: '🧮', shortName: 'Triagem',      name: 'BEN Contador — Triagem',      model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
      { id: 'ben-contador-especialista', emoji: '📊', shortName: 'Especialista', name: 'BEN Contador — Especialista', model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
      { id: 'ben-contador-planejamento', emoji: '🗺️', shortName: 'Planejamento', name: 'BEN Contador — Planejamento', model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
      { id: 'ben-contador-creditos',     emoji: '💳', shortName: 'Créditos',     name: 'BEN Contador — Créditos',     model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
      { id: 'ben-contador-auditoria',    emoji: '🔍', shortName: 'Auditoria',    name: 'BEN Contador — Auditoria',    model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
      { id: 'ben-contador-relatorio',    emoji: '📋', shortName: 'Relatório',    name: 'BEN Contador — Relatório',    model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'contador' },
    ],
  },
  {
    key: 'perito', label: 'Perito Forense', color: '#C4B5FD',
    agents: [
      { id: 'ben-perito-forense',           emoji: '🔬', shortName: 'Padrão',       name: 'BEN Perito Forense — Padrão',    model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
      { id: 'ben-perito-forense-profundo',  emoji: '🧬', shortName: 'Profundo',      name: 'BEN Perito Forense — Profundo',  model: 'Claude Opus 4',   badge: 'OPUS',   badgeColor: '#b45309', category: 'perito' },
      { id: 'ben-perito-forense-digital',   emoji: '💻', shortName: 'Digital',       name: 'BEN Perito Forense Digital',     model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
      { id: 'ben-perito-forense-laudo',     emoji: '📄', shortName: 'Laudo',         name: 'BEN Perito Forense — Laudo',     model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
      { id: 'ben-perito-forense-contestar', emoji: '🛡️', shortName: 'Contraditório', name: 'BEN Perito — Contraditório',     model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
      { id: 'ben-perito-forense-relatorio', emoji: '📊', shortName: 'Relatório',     name: 'BEN Perito Forense — Relatório', model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
      { id: 'ben-perito-imobiliario',       emoji: '🏠', shortName: 'Imobiliário',   name: 'BEN Perito Imobiliário — ABNT',  model: 'Claude Sonnet 4', badge: 'SONNET', badgeColor: '#1d4ed8', category: 'perito' },
    ],
  },
  {
    key: 'growth', label: 'Growth & Marketing', color: '#6EE7B7',
    agents: [
      { id: 'ben-atendente',              emoji: '🤝', shortName: 'Atendente',     name: 'BEN Atendente',               model: 'GPT-4o Mini',      category: 'growth' },
      { id: 'ben-conteudista',            emoji: '✍️', shortName: 'Conteudista',   name: 'BEN Conteudista Jurídico',    model: 'GPT-4o',           category: 'growth' },
      { id: 'ben-estrategista-campanhas', emoji: '📊', shortName: 'Campanhas',     name: 'BEN Estrategista Campanhas',  model: 'GPT-4o',           category: 'growth' },
      { id: 'ben-estrategista-marketing', emoji: '📣', shortName: 'Marketing',     name: 'BEN Estrategista Marketing',  model: 'GPT-4o',           category: 'growth' },
      { id: 'ben-analista-relatorios',    emoji: '📈', shortName: 'Relatórios',    name: 'BEN Analista de Relatórios',  model: 'Claude Haiku 4.5', category: 'growth' },
      { id: 'ben-diretor-criativo',       emoji: '🎨', shortName: 'Dir. Criativo', name: 'BEN Diretor Criativo',        model: 'GPT-4o',           category: 'growth' },
    ],
  },
  {
    key: 'sistema', label: 'Sistema', color: '#A5B4FC',
    agents: [
      { id: 'ben-assistente-geral',       emoji: '🤖', shortName: 'Assistente Geral', name: 'BEN Assistente Geral (Copiloto)', model: 'GPT-4o',          badge: 'FIXO', badgeColor: '#6d28d9', category: 'sistema' },
      { id: 'ben-engenheiro-prompt',      emoji: '🧠', shortName: 'Eng. Prompt',      name: 'BEN Engenheiro de Prompt',       model: 'GPT-4o',          category: 'sistema' },
      { id: 'ben-analista-monitoramento', emoji: '🔍', shortName: 'Monitoramento',    name: 'BEN Analista Monitoramento',     model: 'GPT-4o Mini',     category: 'sistema' },
      { id: 'ben-monitor-juridico',       emoji: '📡', shortName: 'Monitor Jurídico', name: 'BEN Monitor Jurídico DJe + CNJ', model: 'Claude Sonnet 4', badge: 'NEW', badgeColor: '#0e7490', category: 'sistema' },
      { id: 'ben-assistente-cnj',         emoji: '⚖️', shortName: 'Assistente CNJ',   name: 'BEN Assistente CNJ DataJud',     model: 'Claude Sonnet 4', badge: 'NEW', badgeColor: '#0e7490', category: 'sistema' },
    ],
  },
]

// Helper: achatar todos os agentes em uma lista plana
export const ALL_AGENTS: Agent[] = AGENT_CATEGORIES.flatMap(c => c.agents)

export function getAgentById(id: string): Agent | undefined {
  return ALL_AGENTS.find(a => a.id === id)
}
