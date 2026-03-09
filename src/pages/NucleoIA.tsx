import React, { useState } from 'react';
import {
  Brain, Zap, FileText, Scale, Shield, DollarSign, Search, AlertTriangle,
  CheckCircle, Clock, Star, Send, Sparkles, Bot, TrendingUp, BookOpen,
  Gavel, Building2, Users, BarChart3, Eye, Download, Copy, RefreshCw,
  ChevronRight, Activity, Target, Award, MessageSquare, PenTool, Lock,
  Globe, Database, Cpu, Play, Pause, RotateCcw, ThumbsUp, ThumbsDown,
  Lightbulb, Archive, Link2, ArrowRight, Info, Plus, Filter
} from 'lucide-react';

// ─── Dr. Ben IA Agent Definitions ─────────────────────────────────────────────
const DR_BEN_AGENTS = [
  {
    id: 'peticoes',
    name: 'BEN Peticionista Jurídico',
    specialty: 'Redação de Petições Judiciais',
    avatar: 'PJ',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    icon: FileText,
    status: 'online',
    requests: 1247,
    accuracy: 97.4,
    description: 'Especialista em redação de peças processuais: petição inicial, contestação, recurso, embargos, réplica, memoriais e mais.',
    capabilities: ['Petição Inicial', 'Contestação', 'Recurso de Apelação', 'Agravo de Instrumento', 'Embargos de Declaração', 'Memorial', 'Razões Finais', 'Réplica', 'Contrarrazões'],
    prompts: [
      'Redigir petição inicial para ação de cobrança contra pessoa jurídica',
      'Elaborar contestação com preliminares de ilegitimidade passiva',
      'Redigir recurso de apelação contra sentença que julgou improcedente',
      'Elaborar agravo de instrumento contra decisão interlocutória',
    ]
  },
  {
    id: 'contratos',
    name: 'Dr. Ben – Contratos',
    specialty: 'Contratos & Minutas Corporativas',
    avatar: 'CC',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #164e63, #0891b2)',
    icon: BookOpen,
    status: 'online',
    requests: 892,
    accuracy: 98.1,
    description: 'Especialista em elaboração, revisão e análise de contratos empresariais, societários, administrativos e de prestação de serviços.',
    capabilities: ['Contrato de Prestação de Serviços', 'Contrato Social', 'Acordo de Sócios', 'NDA/Confidencialidade', 'Contrato Administrativo', 'Locação Comercial', 'Licença de Software', 'Parceria Comercial'],
    prompts: [
      'Elaborar contrato de prestação de serviços advocatícios com cláusula de êxito',
      'Redigir NDA entre empresa e prestador de serviços tecnológicos',
      'Elaborar acordo de sócios com cláusula de não-concorrência',
      'Revisar contrato administrativo e identificar cláusulas abusivas',
    ]
  },
  {
    id: 'procuracoes',
    name: 'Dr. Ben – Procurações',
    specialty: 'Procurações & Mandatos',
    avatar: 'PM',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
    icon: PenTool,
    status: 'online',
    requests: 634,
    accuracy: 99.2,
    description: 'Especialista em elaboração de procurações: judiciais, extrajudiciais, especiais, gerais e ad negotia para pessoas físicas e jurídicas.',
    capabilities: ['Procuração Ad Judicia', 'Procuração Geral', 'Procuração Especial', 'Procuração em Causa Própria', 'Substabelecimento', 'Mandato Extrajudicial', 'Procuração por Instrumento Público'],
    prompts: [
      'Elaborar procuração ad judicia e extra para pessoa física com poderes específicos',
      'Redigir procuração geral de representação para pessoa jurídica',
      'Elaborar substabelecimento com e sem reservas de iguais poderes',
      'Criar procuração especial para transação imobiliária',
    ]
  },
  {
    id: 'analise-processo',
    name: 'Dr. Ben – Análise Processual',
    specialty: 'Análise de Processos com IA',
    avatar: 'AP',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #064e3b, #059669)',
    icon: Search,
    status: 'online',
    requests: 1089,
    accuracy: 96.8,
    description: 'Analisa processos judiciais completos: identifica riscos, oportunidades, estratégias, prazos críticos e sugere a melhor linha de atuação.',
    capabilities: ['Análise de Risco Processual', 'Mapeamento de Partes', 'Identificação de Nulidades', 'Estratégia de Defesa', 'Análise Jurisprudencial', 'Resumo Executivo', 'Identificação de Prazos', 'Avaliação de Êxito'],
    prompts: [
      'Analisar processo e identificar principais riscos e oportunidades',
      'Realizar análise de viabilidade e probabilidade de êxito',
      'Identificar nulidades processuais e preliminares de mérito',
      'Mapear jurisprudência aplicável ao caso e sugerir teses',
    ]
  },
  {
    id: 'auditoria-processual',
    name: 'Dr. Ben – Auditoria Processual',
    specialty: 'Auditoria & Compliance Processual',
    avatar: 'AU',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #78350f, #d97706)',
    icon: Eye,
    status: 'online',
    requests: 423,
    accuracy: 98.5,
    description: 'Audita o andamento processual identificando falhas, prazos perdidos, movimentações suspeitas, inconsistências e não-conformidades.',
    capabilities: ['Auditoria de Movimentações', 'Verificação de Prazos', 'Controle de Intimações', 'Análise de Sentença', 'Verificação de Nulidades', 'Auditoria de Honorários', 'Compliance Processual', 'Relatório de Irregularidades'],
    prompts: [
      'Auditar movimentações do processo e identificar inconsistências',
      'Verificar se todos os prazos foram cumpridos e não há preclusão',
      'Analisar sentença e identificar erros materiais e vícios formais',
      'Gerar relatório de auditoria completo com recomendações',
    ]
  },
  {
    id: 'processo-administrativo',
    name: 'Dr. Ben – Proc. Administrativo',
    specialty: 'Processo Administrativo & PAD',
    avatar: 'PA',
    color: '#0e7490',
    gradient: 'linear-gradient(135deg, #164e63, #0e7490)',
    icon: Building2,
    status: 'online',
    requests: 318,
    accuracy: 97.1,
    description: 'Especialista em processos administrativos disciplinares, licitatórios, tributários e regulatórios perante órgãos públicos e agências.',
    capabilities: ['PAD – Processo Administrativo Disciplinar', 'Defesa em Processo Licitatório', 'Recurso Administrativo', 'Mandado de Segurança Preventivo', 'Defesa em Processo Regulatório', 'Análise de Ato Administrativo', 'Impugnação de Edital'],
    prompts: [
      'Elaborar defesa em processo administrativo disciplinar (PAD)',
      'Redigir impugnação a edital de licitação com vícios formais',
      'Elaborar recurso administrativo contra penalidade aplicada',
      'Analisar ato administrativo e identificar vícios de legalidade',
    ]
  },
  {
    id: 'auditoria-fiscal',
    name: 'Dr. Ben – Auditoria Fiscal',
    specialty: 'Auditoria Tributária & Fiscal',
    avatar: 'AF',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626)',
    icon: DollarSign,
    status: 'online',
    requests: 567,
    accuracy: 96.2,
    description: 'Audita obrigações tributárias, analisa autos de infração, verifica conformidade fiscal e elabora estratégias de defesa tributária.',
    capabilities: ['Análise de Auto de Infração', 'Defesa Administrativa Fiscal', 'Planejamento Tributário', 'Recuperação de Créditos', 'Parcelamento PERT/REFIS', 'Análise de NOA', 'Compliance Tributário', 'Auditoria de ISS/ICMS/PIS/COFINS'],
    prompts: [
      'Analisar auto de infração e elaborar defesa administrativa fiscal',
      'Identificar créditos tributários passíveis de recuperação',
      'Elaborar planejamento tributário lícito para redução de carga fiscal',
      'Analisar conformidade com obrigações acessórias e principais',
    ]
  },
  {
    id: 'parecer-juridico',
    name: 'Dr. Ben – Pareceres',
    specialty: 'Pareceres & Opiniões Jurídicas',
    avatar: 'PJ',
    color: '#6d28d9',
    gradient: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
    icon: Scale,
    status: 'online',
    requests: 445,
    accuracy: 97.8,
    description: 'Elabora pareceres jurídicos fundamentados em doutrina e jurisprudência atualizada para suporte a decisões estratégicas corporativas.',
    capabilities: ['Parecer Jurídico Fundamentado', 'Opinião Legal (Legal Opinion)', 'Análise Doutrinária', 'Research Jurisprudencial', 'Nota Técnica Jurídica', 'Due Diligence Legal', 'Análise de Viabilidade'],
    prompts: [
      'Elaborar parecer jurídico sobre viabilidade de operação societária',
      'Redigir legal opinion para operação de M&A transnacional',
      'Elaborar nota técnica sobre constitucionalidade de lei municipal',
      'Analisar jurisprudência do STJ/STF sobre tema tributário',
    ]
  },
  {
    id: 'compliance-lgpd',
    name: 'Dr. Ben – LGPD & Compliance',
    specialty: 'Compliance, LGPD & Governança',
    avatar: 'CL',
    color: '#0f766e',
    gradient: 'linear-gradient(135deg, #134e4a, #0f766e)',
    icon: Shield,
    status: 'online',
    requests: 289,
    accuracy: 98.3,
    description: 'Especialista em adequação à LGPD, programas de compliance, políticas corporativas, códigos de conduta e gestão de riscos.',
    capabilities: ['Adequação LGPD', 'Políticas de Privacidade', 'Termos de Uso', 'Programa de Compliance', 'Código de Conduta', 'Mapeamento de Dados', 'RIPD', 'Treinamento LGPD', 'Gestão de Incidentes'],
    prompts: [
      'Elaborar política de privacidade e proteção de dados conforme LGPD',
      'Criar programa de compliance anticorrupção (Lei 12.846/2013)',
      'Elaborar relatório de impacto à proteção de dados (RIPD)',
      'Revisar contratos para cláusulas de adequação à LGPD',
    ]
  },
  {
    id: 'estrategia-judicial',
    name: 'Dr. Ben – Estratégia',
    specialty: 'Estratégia Judicial & Precedentes',
    avatar: 'EJ',
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #78350f, #b45309)',
    icon: Target,
    status: 'beta',
    requests: 178,
    accuracy: 94.6,
    description: 'Analisa precedentes vinculantes, teses repetitivas, jurisprudência dos tribunais superiores e traça estratégias judiciais de alto impacto.',
    capabilities: ['Análise de Precedentes STF/STJ', 'Teses Repetitivas', 'Súmulas Vinculantes', 'Jurisprudência Defensiva', 'Estratégia de Litigância', 'Simulação de Resultado', 'Monitoramento de Teses'],
    prompts: [
      'Analisar precedentes do STJ sobre responsabilidade civil e indicar estratégia',
      'Identificar teses repetitivas aplicáveis ao caso e avaliar riscos',
      'Traçar estratégia de litigância considerando jurisprudência atual',
      'Simular probabilidade de sucesso com base em dados históricos',
    ]
  },
];

// ─── Productivity / Project metrics ───────────────────────────────────────────
const TEAM_MEMBERS = [
  { id: 1, name: 'Dr. Mauro Monção', role: 'Sócio-Diretor', avatar: 'MM', color: '#2563eb', tasks: 24, completed: 19, hours: 142, billable: 128, performance: 95, rank: 1 },
  { id: 2, name: 'Dra. Ana Carla', role: 'Advogada Sênior', avatar: 'AC', color: '#7c3aed', tasks: 31, completed: 26, hours: 156, billable: 140, performance: 92, rank: 2 },
  { id: 3, name: 'Dr. Felipe Torres', role: 'Advogado Pleno', avatar: 'FT', color: '#059669', tasks: 28, completed: 21, hours: 134, billable: 118, performance: 87, rank: 3 },
  { id: 4, name: 'Beatriz Santos', role: 'Estagiária', avatar: 'BS', color: '#d97706', tasks: 15, completed: 13, hours: 88, billable: 0, performance: 91, rank: 4 },
  { id: 5, name: 'Lucas Ferreira', role: 'Estagiário', avatar: 'LF', color: '#0891b2', tasks: 12, completed: 9, hours: 72, billable: 0, performance: 83, rank: 5 },
];

const ACTIVE_PROJECTS = [
  { id: 1, name: 'Ação Anulatória – Prefeitura XYZ', client: 'Prefeitura de São Paulo', status: 'em_andamento', priority: 'alta', progress: 68, deadline: '2026-03-15', team: ['MM', 'AC'], tasks: 12, completed_tasks: 8, value: 85000 },
  { id: 2, name: 'Contencioso Tributário ISS', client: 'Empresa ABC Ltda', status: 'em_andamento', priority: 'critica', progress: 45, deadline: '2026-03-08', team: ['MM', 'FT'], tasks: 18, completed_tasks: 8, value: 120000 },
  { id: 3, name: 'Elaboração Contrato Social', client: 'StartUp Tech LTDA', status: 'revisao', priority: 'media', progress: 88, deadline: '2026-03-05', team: ['AC', 'BS'], tasks: 6, completed_tasks: 5, value: 15000 },
  { id: 4, name: 'PAD – Servidor Municipal', client: 'Câmara Municipal SP', status: 'em_andamento', priority: 'alta', progress: 32, deadline: '2026-03-20', team: ['FT', 'LF'], tasks: 22, completed_tasks: 7, value: 45000 },
  { id: 5, name: 'Due Diligence M&A', client: 'Grupo Empresarial Norte', status: 'planejamento', priority: 'alta', progress: 15, deadline: '2026-04-01', team: ['MM', 'AC', 'FT'], tasks: 35, completed_tasks: 5, value: 200000 },
  { id: 6, name: 'Compliance LGPD Completo', client: 'Hospital Santa Cruz', status: 'em_andamento', priority: 'media', progress: 74, deadline: '2026-03-25', team: ['AC', 'BS'], tasks: 14, completed_tasks: 10, value: 32000 },
];

// ─── Helper components ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    online: { label: 'Online', cls: 'badge-emerald' },
    beta: { label: 'Beta', cls: 'badge-amber' },
    offline: { label: 'Offline', cls: 'badge-urgente' },
    em_andamento: { label: 'Em Andamento', cls: 'badge-navy' },
    revisao: { label: 'Em Revisão', cls: 'badge-amber' },
    planejamento: { label: 'Planejamento', cls: 'badge-violet' },
    concluido: { label: 'Concluído', cls: 'badge-emerald' },
  };
  const item = map[status] || { label: status, cls: 'bg-gray-500/20 text-slate-500' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${item.cls}`}>{item.label}</span>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    critica: { label: 'Crítica', cls: 'bg-crimson/10 text-crimson border-crimson/25' },
    alta: { label: 'Alta', cls: 'badge-alta' },
    media: { label: 'Média', cls: 'badge-media' },
    baixa: { label: 'Baixa', cls: 'bg-gray-500/20 text-slate-500 border-gray-500/30' },
  };
  const item = map[priority] || { label: priority, cls: 'bg-gray-500/20 text-slate-500' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${item.cls}`}>{item.label}</span>;
};

// ─── AI Chat Modal ─────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; time: string; }

function AgentChatModal({ agent, onClose }: { agent: typeof DR_BEN_AGENTS[0]; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Olá! Sou o **${agent.name}**, especialista em ${agent.specialty}.\n\nEstou integrado ao ecossistema **Genspark IA** com acesso a toda a base jurídica brasileira, jurisprudência atualizada dos tribunais superiores (STF, STJ, TST, TRF) e legislação vigente.\n\nComo posso ajudá-lo hoje?`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        peticoes: `**Analisando sua solicitação...**\n\nCom base na sua demanda, elaborei a estrutura da peça processual:\n\n**EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE ___**\n\n**[NOME DO CLIENTE]**, [qualificação completa], por meio de seus advogados signatários, vem, respeitosamente, perante Vossa Excelência, propor a presente\n\n**AÇÃO DE [TIPO]**\n\nem face de **[NOME DO RÉU]**, [qualificação], pelos fatos e fundamentos jurídicos a seguir expostos.\n\n**I – DOS FATOS**\n[Narrativa fática detalhada]\n\n**II – DO DIREITO**\n[Fundamentação jurídica com base nos artigos do CPC/CC e jurisprudência do STJ]\n\n**III – DOS PEDIDOS**\nDiante do exposto, requer-se:\na) [pedido principal]\nb) [pedidos cumulativos]\nc) Condenação nas custas processuais e honorários advocatícios\n\n*Análise completa disponível. Deseja que eu finalize a peça com os dados específicos do caso?*`,
        contratos: `**Elaborando minuta contratual...**\n\n**CONTRATO DE [TIPO]**\n\nPelas presentes cláusulas e condições, celebram entre si:\n\n**CONTRATANTE:** [Qualificação completa]\n**CONTRATADO:** [Qualificação completa]\n\n**CLÁUSULA 1ª – DO OBJETO**\nO presente contrato tem por objeto [descrição detalhada]...\n\n**CLÁUSULA 2ª – DO PRAZO**\n...\n\n**CLÁUSULA 3ª – DO VALOR E FORMA DE PAGAMENTO**\n...\n\n**CLÁUSULA 4ª – DAS OBRIGAÇÕES DAS PARTES**\n...\n\n**CLÁUSULA 5ª – DA CONFIDENCIALIDADE E SIGILO**\n...\n\n**CLÁUSULA 6ª – DA RESCISÃO E PENALIDADES**\n...\n\n**CLÁUSULA 7ª – DO FORO**\nFica eleito o foro da Comarca de [cidade] para dirimir eventuais controvérsias.\n\n*Minuta gerada com base nas melhores práticas. Informe os dados específicos para finalizar.*`,
        default: `**${agent.name} processando...**\n\nAnalisei sua solicitação e tenho as seguintes considerações jurídicas:\n\n**1. Enquadramento Legal**\nSua demanda se enquadra no âmbito do [legislação aplicável], especificamente nos artigos [X] e [Y].\n\n**2. Jurisprudência Aplicável**\nO STJ/STF possui entendimento consolidado sobre o tema (Súmula X, REsp X.XXX/XX), que favorece [posição].\n\n**3. Estratégia Recomendada**\n- [Passo 1 da estratégia]\n- [Passo 2 da estratégia]\n- [Passo 3 da estratégia]\n\n**4. Riscos Identificados**\n⚠️ Risco 1: [descrição]\n⚠️ Risco 2: [descrição]\n\n**5. Probabilidade de Êxito**\n🟢 Alta probabilidade (estimativa: 78-85%)\n\n*Análise baseada em 847 casos similares na base Genspark IA. Deseja aprofundamento em algum ponto?*`
      };
      const content = responses[agent.id] || responses.default;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-3xl rounded-2xl flex flex-col" style={{ background: '#fff', border: '1px solid rgba(30,58,138,0.4)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-slate-200" style={{ background: agent.gradient, borderRadius: '1rem 1rem 0 0' }}>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">{agent.avatar}</div>
          <div className="flex-1">
            <div className="text-white font-bold">{agent.name}</div>
            <div className="text-white/70 text-sm">{agent.specialty} · Genspark IA</div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white text-xs">Online</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white ml-2 text-xl font-bold">&times;</button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-b border-slate-100 flex gap-2 flex-wrap" style={{ background: 'rgba(25,56,92,0.06)' }}>
          {agent.prompts.slice(0, 2).map((p, i) => (
            <button key={i} onClick={() => setInput(p)}
              className="text-xs bg-slate-100 hover:bg-slate-100 text-blue-300 border border-blue-700/30 rounded-lg px-3 py-1.5 transition-colors text-left">
              ⚡ {p.substring(0, 55)}...
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ minHeight: '300px' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={msg.role === 'assistant'
                  ? { background: agent.gradient, color: '#fff' }
                  : { background: '#19385C', color: '#DEC078' }}>
                {msg.role === 'assistant' ? agent.avatar : 'EU'}
              </div>
              <div className="max-w-lg rounded-xl p-3"
                style={msg.role === 'assistant'
                  ? { background: '#F5F5F5', border: '1px solid #E5E7EB', color: '#222222', borderRadius: '18px 18px 18px 4px', lineHeight: '1.6' }
                  : { background: '#E9F2FF', color: '#1A1A1A', borderRadius: '18px 18px 4px 18px', lineHeight: '1.6' }
                }>
                <div className="text-sm whitespace-pre-line" style={{ lineHeight: '1.6' }}>{msg.content}</div>
                <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{msg.time}</div>
                {msg.role === 'assistant' && (
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}><Copy size={10} /> Copiar</button>
                    <button className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}><Download size={10} /> Exportar</button>
                    <button className="text-xs flex items-center gap-1" style={{ color: '#00b37e' }}><ThumbsUp size={10} /></button>
                    <button className="text-xs flex items-center gap-1" style={{ color: '#e11d48' }}><ThumbsDown size={10} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: agent.gradient }}>{agent.avatar}</div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#DEC078', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Pergunte ao ${agent.name}...`}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none" style={{ background: 'rgba(222,192,120,0.08)', border: '1px solid rgba(222,192,120,0.25)' }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: agent.gradient }}>
              <Send size={16} />
            </button>
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            Powered by Genspark IA · {agent.name} · Alta Performance · Dados criptografados
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NucleoIA() {
  const [activeTab, setActiveTab] = useState<'agents' | 'projetos' | 'produtividade' | 'insights'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<typeof DR_BEN_AGENTS[0] | null>(null);
  const [filterAgent, setFilterAgent] = useState('');

  const filteredAgents = DR_BEN_AGENTS.filter(a =>
    a.name.toLowerCase().includes(filterAgent.toLowerCase()) ||
    a.specialty.toLowerCase().includes(filterAgent.toLowerCase())
  );

  const totalRequests = DR_BEN_AGENTS.reduce((acc, a) => acc + a.requests, 0);
  const avgAccuracy = (DR_BEN_AGENTS.reduce((acc, a) => acc + a.accuracy, 0) / DR_BEN_AGENTS.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #19385C 0%, #19385C 50%, #19385C 100%)', border: '1px solid rgba(222,192,120,0.25)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #7c3aed 0%, transparent 50%)' }} />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A052, #EDD090)', boxShadow: '0 0 28px rgba(222,192,120,0.45)' }}>
              <Brain size={30} style={{ color: '#19385C' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">Núcleo Operacional IA</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(222,192,120,0.18)", color: "#DEC078", border: "1px solid rgba(222,192,120,0.40)" }}>Dr. Ben IA</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.14)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.35)" }}>Genspark Ecosystem</span>
              </div>
              <p className="text-slate-500 text-sm max-w-2xl">Agentes especialistas de alta performance integrados ao ecossistema Genspark IA. Petições, contratos, análise processual, auditoria fiscal, compliance e muito mais — automatizados com precisão jurídica.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center bg-white/5 rounded-xl px-4 py-2 border border-white/10">
              <div className="text-2xl font-bold text-white">{DR_BEN_AGENTS.length}</div>
              <div className="text-xs text-slate-500">Agentes</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl px-4 py-2 border border-white/10">
              <div className="text-2xl font-bold text-green-400">{totalRequests.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Solicitações</div>
            </div>
            <div className="text-center bg-white/5 rounded-xl px-4 py-2 border border-white/10">
              <div className="text-2xl font-bold text-blue-400">{avgAccuracy}%</div>
              <div className="text-xs text-slate-500">Precisão Média</div>
            </div>
          </div>
        </div>

        {/* Genspark badge */}
        <div className="relative mt-4 flex items-center gap-6">
          {[
            { icon: Cpu, label: 'Genspark LLM', color: '#2563eb' },
            { icon: Database, label: 'Base CNJ/Tribunais', color: '#7c3aed' },
            { icon: Globe, label: 'Jurisprudência Live', color: '#059669' },
            { icon: Lock, label: 'Criptografia E2E', color: '#d97706' },
            { icon: Activity, label: '99.9% Uptime', color: '#0891b2' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <item.icon size={12} style={{ color: item.color }} />
              <span className="text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
        {[
          { id: 'agents', label: 'Agentes Dr. Ben IA', icon: Bot },
          { id: 'projetos', label: 'Núcleo de Projetos', icon: Target },
          { id: 'produtividade', label: 'Produtividade', icon: BarChart3 },
          { id: 'insights', label: 'Insights IA', icon: Lightbulb },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: AGENTES DR. BEN IA
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
                placeholder="Buscar agente por especialidade..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="text-sm text-slate-500">{filteredAgents.length} agentes disponíveis</div>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAgents.map(agent => {
              const Icon = agent.icon;
              return (
                <div key={agent.id} className="rounded-xl border border-slate-200 overflow-hidden hover:border-blue-700/50 transition-all group cursor-pointer"
                  style={{ background: '#fff' }}
                  onClick={() => setSelectedAgent(agent)}>
                  {/* Card Header */}
                  <div className="p-4 relative" style={{ background: agent.gradient }}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <Icon size={22} className="text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{agent.name}</div>
                          <div className="text-white/70 text-xs mt-0.5">{agent.specialty}</div>
                        </div>
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                    <div className="relative mt-3 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{agent.requests.toLocaleString()}</div>
                        <div className="text-white/60 text-xs">Solicitações</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{agent.accuracy}%</div>
                        <div className="text-white/60 text-xs">Precisão</div>
                      </div>
                      <div className="ml-auto">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={12} className={i <= 5 ? 'text-yellow-300 fill-yellow-300' : 'text-slate-500'} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{agent.description}</p>

                    {/* Capabilities */}
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 font-sans">Capacidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 4).map(cap => (
                          <span key={cap} className="text-xs bg-slate-100 text-blue-300 border border-blue-800/30 rounded px-1.5 py-0.5">{cap}</span>
                        ))}
                        {agent.capabilities.length > 4 && (
                          <span className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">+{agent.capabilities.length - 4}</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 group-hover:shadow-lg"
                      style={{ background: agent.gradient }}
                      onClick={e => { e.stopPropagation(); setSelectedAgent(agent); }}>
                      <Zap size={14} />
                      Acionar {agent.name.split('–')[1]?.trim()}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: NÚCLEO DE PROJETOS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'projetos' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Projetos Ativos', value: ACTIVE_PROJECTS.filter(p => p.status === 'em_andamento').length, icon: Activity, color: '#2563eb', sub: 'em andamento' },
              { label: 'Valor Total', value: `R$ ${(ACTIVE_PROJECTS.reduce((a, p) => a + p.value, 0) / 1000).toFixed(0)}k`, icon: DollarSign, color: '#059669', sub: 'carteira ativa' },
              { label: 'Tarefas Totais', value: ACTIVE_PROJECTS.reduce((a, p) => a + p.tasks, 0), icon: CheckCircle, color: '#7c3aed', sub: `${ACTIVE_PROJECTS.reduce((a, p) => a + p.completed_tasks, 0)} concluídas` },
              { label: 'Prazo Crítico', value: '2', icon: AlertTriangle, color: '#dc2626', sub: 'próximos 7 dias' },
            ].map(card => (
              <div key={card.label} className="card-compact">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">{card.label}</span>
                  <card.icon size={16} style={{ color: card.color }} />
                </div>
                <div className="text-2xl font-bold font-serif" style={{ color: '#19385C' }}>{card.value}</div>
                <div className="text-xs text-slate-400 font-sans mt-0.5">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Projects table */}
          <div className="card overflow-hidden p-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2"><Target size={16} className="text-blue-400" /> Projetos em Andamento</h3>
              <button className="flex items-center gap-1.5 btn-primary text-xs px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={12} /> Novo Projeto
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Projeto', 'Cliente', 'Status', 'Prioridade', 'Progresso', 'Equipe', 'Prazo', 'Valor', 'IA'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTIVE_PROJECTS.map(proj => (
                    <tr key={proj.id} className="table-row">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-800">{proj.name}</div>
                        <div className="text-xs text-slate-400 font-sans">{proj.completed_tasks}/{proj.tasks} tarefas</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-medium">{proj.client}</td>
                      <td className="px-4 py-3"><StatusBadge status={proj.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={proj.priority} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                            <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: proj.progress >= 75 ? '#059669' : proj.progress >= 40 ? '#2563eb' : '#d97706' }} />
                          </div>
                          <span className="text-xs text-slate-500">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {proj.team.map(m => (
                            <div key={m} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white rounded-full">{m}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(proj.deadline).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 font-medium">R$ {(proj.value / 1000).toFixed(0)}k</td>
                      <td className="px-4 py-3">
                        <button className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 px-2 py-1 rounded transition-colors flex items-center gap-1">
                          <Brain size={10} /> IA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: PRODUTIVIDADE
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'produtividade' && (
        <div className="space-y-4">
          {/* Team performance header */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {TEAM_MEMBERS.map(member => (
              <div key={member.id} className="card-compact text-center">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white mb-2 relative"
                  style={{ background: member.color }}>
                  {member.avatar}
                  {member.rank <= 3 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-black font-bold">
                      {member.rank}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-800">{member.name.split(' ')[1]}</div>
                <div className="text-xs text-slate-500 mb-2">{member.role.split(' ')[0]}</div>
                <div className="text-2xl font-bold font-serif" style={{ color: '#19385C' }}>{member.performance}%</div>
                <div className="text-xs text-slate-500">Performance</div>
                <div className="mt-2 bg-slate-100 rounded-full h-1">
                  <div className="progress-gold" style={{ width: `${member.performance}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed table */}
          <div className="card overflow-hidden p-0">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-sm font-sans flex items-center gap-2" style={{ color: '#19385C' }}><Users size={16} style={{ color: '#DEC078' }} /> Desempenho da Equipe – Fevereiro 2026</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Rank', 'Membro', 'Cargo', 'Tarefas', 'Concluídas', 'Horas', 'Faturável', 'Performance', 'IA Utilizada'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM_MEMBERS.sort((a, b) => b.performance - a.performance).map((m, i) => (
                  <tr key={m.id} className="table-row">
                    <td className="px-4 py-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: i === 0 ? '#DEC078' : i === 1 ? '#cbd5e1' : i === 2 ? '#cd7f32' : '#f1f5f9', color: i === 0 ? '#19385C' : i === 1 ? '#475569' : i === 2 ? '#fff' : '#64748b' }}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: m.color }}>{m.avatar}</div>
                        <span className="text-sm text-slate-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.role}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{m.tasks}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: '#00b37e' }}>{m.completed}</span>
                      <span className="text-xs text-slate-500">/{m.tasks}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{m.hours}h</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{m.billable > 0 ? `${m.billable}h` : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                          <div className="progress-navy" style={{ width: `${m.performance}%` }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#19385C' }}>{m.performance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs" style={{ color: '#19385C' }}>
                        <Brain size={12} />
                        <span>{Math.floor(m.hours * 0.3)}h com IA</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* IA Usage stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Top Agentes Utilizados', items: [
                  { name: 'BEN Peticionista Jurídico', usage: 847, pct: 35 },
                  { name: 'Dr. Ben – Análise Processual', usage: 634, pct: 26 },
                  { name: 'Dr. Ben – Contratos', usage: 412, pct: 17 },
                  { name: 'Dr. Ben – Pareceres', usage: 298, pct: 12 },
                  { name: 'Outros', usage: 256, pct: 10 },
                ]
              },
              {
                title: 'Economia de Tempo com IA', items: [
                  { name: 'Redação de Petições', usage: 0, pct: 72, extra: '~4.2h → 1.2h' },
                  { name: 'Elaboração de Contratos', usage: 0, pct: 68, extra: '~3.5h → 1.1h' },
                  { name: 'Análise Processual', usage: 0, pct: 65, extra: '~2.8h → 1.0h' },
                  { name: 'Pesquisa Jurisprudencial', usage: 0, pct: 85, extra: '~3.0h → 0.5h' },
                  { name: 'Parecer Jurídico', usage: 0, pct: 60, extra: '~5.0h → 2.0h' },
                ]
              },
              {
                title: 'Qualidade das Entregas', items: [
                  { name: 'Peças aprovadas sem revisão', usage: 0, pct: 78, extra: '78%' },
                  { name: 'Revisão mínima necessária', usage: 0, pct: 17, extra: '17%' },
                  { name: 'Revisão significativa', usage: 0, pct: 5, extra: '5%' },
                  { name: 'Satisfação dos clientes', usage: 0, pct: 94, extra: '4.7/5.0' },
                  { name: 'NPS do escritório', usage: 0, pct: 92, extra: '92 pts' },
                ]
              }
            ].map(card => (
              <div key={card.title} className="card-compact">
                <h4 className="font-semibold text-sm text-slate-800 mb-3">{card.title}</h4>
                <div className="space-y-2.5">
                  {card.items.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-slate-500">{item.name}</span>
                        <span className="text-slate-700">{('extra' in item ? item.extra : undefined) || item.usage}</span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-1.5">
                        <div className="progress-gold" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB: INSIGHTS IA
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Daily Briefing */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A052, #EDD090)' }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm font-sans" style={{ color: '#19385C' }}>Briefing Diário – Dr. Ben IA</h3>
                  <div className="text-xs text-slate-500">28/02/2026 · Genspark Ecosystem</div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'danger', icon: AlertTriangle, msg: '3 prazos fatais em 48h: REsp 1.234.567, APL 0001234, MS 0009876. Ação imediata necessária.' },
                  { type: 'warning', icon: Clock, msg: '2 audiências amanhã sem checklist concluído. Recomendo acionar BEN Peticionista Jurídico para memoriais.' },
                  { type: 'info', icon: TrendingUp, msg: 'Processo 0023456 teve movimentação: Acórdão publicado. Alta probabilidade de recurso favorável identificada.' },
                  { type: 'success', icon: CheckCircle, msg: 'Contrato Empresa ABC assinado via ZapSign. Receivable de R$ 48.000 gerado automaticamente.' },
                  { type: 'info', icon: Brain, msg: 'Nova súmula STJ (nº 668) impacta 4 processos ativos. Dr. Ben – Estratégia analisará e sugerirá petições.' },
                ].map((item, i) => {
                  const colorMap = { danger: 'alert-crimson text-crimson', warning: 'alert-amber text-amber-700', info: 'alert-navy text-navy', success: 'alert-emerald text-emerald' };
                  return (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${colorMap[item.type as keyof typeof colorMap]}`}>
                      <item.icon size={13} className="flex-shrink-0 mt-0.5" />
                      <span>{item.msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00b37e, #0891b2)' }}>
                  <Lightbulb size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm font-sans" style={{ color: '#19385C' }}>Recomendações Estratégicas IA</h3>
              </div>
              <div className="space-y-3">
                {[
                  {
                    agent: 'Dr. Ben – Análise Processual',
                    color: '#059669',
                    rec: 'Processo 0023456 – Identificada tese de nulidade absoluta por cerceamento de defesa. Probabilidade de acolhimento: 82%.',
                    action: 'Elaborar embargos de declaração'
                  },
                  {
                    agent: 'Dr. Ben – Auditoria Fiscal',
                    color: '#dc2626',
                    rec: 'Cliente Hospital Santa Cruz – Identificados R$ 340.000 em créditos de PIS/COFINS passíveis de recuperação nos últimos 5 anos.',
                    action: 'Iniciar due diligence fiscal'
                  },
                  {
                    agent: 'Dr. Ben – Contratos',
                    color: '#0891b2',
                    rec: 'Contrato de prestação de serviços com Câmara Municipal vence em 45 dias. Recomendo início antecipado da renovação.',
                    action: 'Elaborar minuta de renovação'
                  },
                  {
                    agent: 'Dr. Ben – LGPD',
                    color: '#0f766e',
                    rec: 'Score de compliance LGPD em 75%. 3 pendências críticas identificadas para alcançar 95%+.',
                    action: 'Ver plano de adequação'
                  },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-100 bg-blue-900/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: item.color + '40', border: `1px solid ${item.color}60`, color: item.color }}>{item.agent}</span>
                    </div>
                    <p className="text-xs text-slate-700 mb-2">{item.rec}</p>
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      <Zap size={10} /> {item.action} <ChevronRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Documentos Gerados', value: '4.847', sub: 'este mês', icon: FileText, color: '#2563eb', change: '+23%' },
              { label: 'Horas Economizadas', value: '312h', sub: 'equipe toda', icon: Clock, color: '#059669', change: '+41%' },
              { label: 'Prazos Monitorados', value: '187', sub: 'ativos', icon: AlertTriangle, color: '#d97706', change: 'Em dia' },
              { label: 'Economia Financeira', value: 'R$ 94k', sub: 'em produtividade', icon: TrendingUp, color: '#7c3aed', change: '+18%' },
            ].map(card => (
              <div key={card.label} className="card-compact">
                <div className="flex items-center justify-between mb-2">
                  <card.icon size={18} style={{ color: card.color }} />
                  <span className="text-xs text-green-400 font-medium">{card.change}</span>
                </div>
                <div className="text-2xl font-bold font-serif" style={{ color: '#19385C' }}>{card.value}</div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">{card.label}</div>
                <div className="text-xs text-slate-400">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Genspark Integration Panel */}
          <div className="rounded-xl border border-purple-900/30 p-5" style={{ background: 'linear-gradient(135deg, rgba(76,29,149,0.15), rgba(30,27,75,0.15))' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                <Globe size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Ecossistema Genspark IA – Status de Integração</h3>
                <div className="text-xs text-purple-400">Todos os módulos Dr. Ben IA conectados ao core Genspark</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Genspark LLM Core', status: 'Ativo', icon: Cpu, color: '#2563eb' },
                { name: 'CNJ DataJud API', status: 'Sincronizado', icon: Database, color: '#059669' },
                { name: 'Jurisprudência Live', status: 'Online', icon: Globe, color: '#0891b2' },
                { name: 'ICP-Brasil Certs', status: 'Validado', icon: Lock, color: '#7c3aed' },
                { name: 'Ben Growth Center', status: 'Integrado', icon: Link2, color: '#d97706' },
              ].map(item => (
                <div key={item.name} className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <item.icon size={20} className="mx-auto mb-2" style={{ color: item.color }} />
                  <div className="text-xs font-medium text-slate-800 mb-1">{item.name}</div>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-green-400">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Modal ──────────────────────────────────────────────────────── */}
      {selectedAgent && <AgentChatModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
    </div>
  );
}
