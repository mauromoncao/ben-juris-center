import React, { useState } from 'react';
import {
  Target, TrendingUp, BookOpen, CheckSquare, Plus, Search, Filter,
  ChevronRight, Calendar, Users, BarChart3, AlertTriangle, CheckCircle,
  Clock, Star, Flag, Edit, Trash2, Eye, ArrowUp, ArrowDown, Play,
  Lightbulb, Award, Zap, Brain, FileText, Activity, DollarSign,
  Building2, Settings, ChevronDown, Info, Download, RefreshCw,
  ListChecks, Map, Layers, Milestone, BookMarked, CircleDot
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type MetaStatus = 'no_prazo' | 'em_risco' | 'atrasada' | 'concluida';
type Prioridade = 'critica' | 'alta' | 'media' | 'baixa';

interface Meta {
  id: number; titulo: string; descricao: string; categoria: string;
  responsavel: string; status: MetaStatus; prioridade: Prioridade;
  progresso: number; prazo: string; valor_alvo: string; valor_atual: string;
  iniciativas: string[];
}

interface PlanoAcao {
  id: number; acao: string; responsavel: string; prazo: string;
  status: 'pendente' | 'em_andamento' | 'concluida'; prioridade: Prioridade;
  metaId: number; recursos: string;
}

interface POP {
  id: number; codigo: string; titulo: string; setor: string; versao: string;
  autor: string; aprovado: boolean; data_aprovacao: string; revisao: string;
  objetivo: string; escopo: string; etapas: { num: number; desc: string; resp: string; prazo: string }[];
  indicadores: string[]; documentos_relacionados: string[];
}

// ─── Dados ─────────────────────────────────────────────────────────────────────
const METAS: Meta[] = [
  {
    id: 1, titulo: 'Ampliar Carteira Setor Público – 60 Clientes', descricao: 'Expandir atuação no setor público municipal e estadual, atingindo 60 contratos ativos.',
    categoria: 'Comercial', responsavel: 'Dr. Mauro Monção', status: 'no_prazo', prioridade: 'alta',
    progresso: 57, prazo: '2026-12-31', valor_alvo: '60 clientes', valor_atual: '34 clientes',
    iniciativas: ['Campanha ativa em municípios <50k hab.','Parceria com entidades municipalistas','Proposta padrão para câmaras municipais']
  },
  {
    id: 2, titulo: 'Receita Anual R$ 1,8 Milhão', descricao: 'Alcançar faturamento bruto de R$ 1,8M com mix de contratos mensais e êxito.',
    categoria: 'Financeiro', responsavel: 'Dr. Mauro Monção', status: 'no_prazo', prioridade: 'critica',
    progresso: 69, prazo: '2026-12-31', valor_alvo: 'R$ 1.800.000', valor_atual: 'R$ 1.237.000',
    iniciativas: ['Contratos de êxito em ações tributárias','Honorários advocatícios reajustados','Expansão do módulo financeiro SaaS']
  },
  {
    id: 3, titulo: 'Implementar IA em 100% das Peças', descricao: 'Utilizar Dr. Ben IA em todas as peças processuais, contratos e pareceres.',
    categoria: 'Operacional', responsavel: 'Dra. Ana Carla', status: 'em_risco', prioridade: 'alta',
    progresso: 43, prazo: '2026-06-30', valor_alvo: '100%', valor_atual: '43%',
    iniciativas: ['Treinamento da equipe nos agentes IA','Workflow obrigatório via Dr. Ben Petições','Revisão humana em todas as saídas IA']
  },
  {
    id: 4, titulo: 'Conformidade LGPD 100%', descricao: 'Alcançar plena conformidade com a LGPD em todos os processos internos e para clientes.',
    categoria: 'Jurídico', responsavel: 'Dra. Ana Carla', status: 'em_risco', prioridade: 'alta',
    progresso: 75, prazo: '2026-04-30', valor_alvo: '100%', valor_atual: '75%',
    iniciativas: ['Conclusão do RIPD','Treinamento de todos os colaboradores','Implementar DPO externo']
  },
  {
    id: 5, titulo: 'Taxa de Sucesso Processual 80%', descricao: 'Atingir 80% de êxito em processos judiciais e administrativos.',
    categoria: 'Jurídico', responsavel: 'Dr. Felipe Torres', status: 'no_prazo', prioridade: 'media',
    progresso: 72, prazo: '2026-12-31', valor_alvo: '80%', valor_atual: '72%',
    iniciativas: ['Análise preditiva via Dr. Ben IA','Seleção criteriosa de casos','Banco de teses vencedoras']
  },
  {
    id: 6, titulo: 'Lançar Ben Juris Center SaaS', descricao: 'Deploy da plataforma Ben Juris Center como SaaS multi-tenant para outros escritórios.',
    categoria: 'Tecnologia', responsavel: 'Dr. Mauro Monção', status: 'no_prazo', prioridade: 'alta',
    progresso: 35, prazo: '2026-09-30', valor_alvo: '1.0 Released', valor_atual: 'Beta',
    iniciativas: ['Arquitetura multi-tenant','Onboarding de 5 escritórios piloto','Pricing model definido']
  },
];

const PLANOS: PlanoAcao[] = [
  { id:1, acao:'Elaborar proposta comercial padrão para municípios', responsavel:'Dr. Mauro', prazo:'2026-03-15', status:'em_andamento', prioridade:'alta', metaId:1, recursos:'Marketing + IA' },
  { id:2, acao:'Revisar tabela de honorários e reajustar contratos', responsavel:'Dr. Mauro', prazo:'2026-03-10', status:'pendente', prioridade:'critica', metaId:2, recursos:'Financeiro' },
  { id:3, acao:'Treinamento equipe – Agentes Dr. Ben IA (8h)', responsavel:'Dra. Ana', prazo:'2026-03-20', status:'em_andamento', prioridade:'alta', metaId:3, recursos:'Operacional' },
  { id:4, acao:'Concluir Relatório de Impacto LGPD (RIPD)', responsavel:'Dra. Ana', prazo:'2026-03-12', status:'pendente', prioridade:'alta', metaId:4, recursos:'Jurídico' },
  { id:5, acao:'Implantar banco de teses vencedoras no sistema', responsavel:'Dr. Felipe', prazo:'2026-03-25', status:'pendente', prioridade:'media', metaId:5, recursos:'IA + Equipe' },
  { id:6, acao:'Setup infraestrutura multi-tenant do Ben Juris Center', responsavel:'Dr. Mauro', prazo:'2026-04-01', status:'em_andamento', prioridade:'alta', metaId:6, recursos:'Dev + DevOps' },
  { id:7, acao:'Campanha outbound em 120 prefeituras SP', responsavel:'Dr. Mauro', prazo:'2026-03-30', status:'pendente', prioridade:'alta', metaId:1, recursos:'BGC + CRM' },
  { id:8, acao:'Integrar receitas com Ben Growth Center', responsavel:'Dr. Mauro', prazo:'2026-03-18', status:'em_andamento', prioridade:'critica', metaId:2, recursos:'Financeiro + IA' },
];

const POPS: POP[] = [
  {
    id: 1, codigo: 'POP-JUR-001', titulo: 'Protocolo de Recebimento e Distribuição de Processos',
    setor: 'Gestão Jurídica', versao: '2.1', autor: 'Dra. Ana Carla', aprovado: true,
    data_aprovacao: '2026-01-15', revisao: '2026-07-15',
    objetivo: 'Padronizar o recebimento, análise inicial e distribuição de novos processos judiciais e administrativos entre os membros da equipe.',
    escopo: 'Aplica-se a todos os novos processos recebidos pela equipe jurídica, incluindo ações judiciais, processos administrativos e consultas formais.',
    etapas: [
      { num:1, desc:'Receber intimação/processo via sistema CNJ, DJEN ou cliente direto', resp:'Recepcionista/Estagiário', prazo:'Imediato' },
      { num:2, desc:'Protocolar no Ben Juris Center com número único e dados completos', resp:'Estagiário', prazo:'2h após recebimento' },
      { num:3, desc:'Triagem inicial: classificar área, urgência e valor da causa', resp:'Advogado Pleno', prazo:'Mesmo dia' },
      { num:4, desc:'Análise de viabilidade via Dr. Ben – Análise Processual (IA)', resp:'Advogado Responsável', prazo:'24 horas' },
      { num:5, desc:'Distribuição ao advogado responsável conforme carga de trabalho', resp:'Sócio-Diretor', prazo:'24 horas' },
      { num:6, desc:'Abertura do projeto no Núcleo de Projetos e definição de tarefas', resp:'Advogado Responsável', prazo:'48 horas' },
      { num:7, desc:'Comunicação ao cliente com protocolo e prazo estimado de resposta', resp:'Advogado Responsável', prazo:'48 horas' },
    ],
    indicadores: ['% processos protocolados em < 2h','% análises IA concluídas em 24h','NPS do cliente na abertura'],
    documentos_relacionados: ['POP-JUR-002','POP-FIN-001','Modelo de E-mail de Recebimento']
  },
  {
    id: 2, codigo: 'POP-JUR-002', titulo: 'Elaboração de Peças Processuais com Apoio de IA',
    setor: 'Gestão Jurídica', versao: '1.3', autor: 'Dr. Mauro Monção', aprovado: true,
    data_aprovacao: '2026-01-20', revisao: '2026-07-20',
    objetivo: 'Padronizar a utilização dos agentes Dr. Ben IA na elaboração de peças processuais, garantindo qualidade, consistência e conformidade legal.',
    escopo: 'Petições iniciais, contestações, recursos, memoriais, pareceres e qualquer peça processual de autoria do escritório.',
    etapas: [
      { num:1, desc:'Abrir o processo no Ben Juris Center e revisar todos os documentos do caso', resp:'Advogado Responsável', prazo:'Antes de iniciar' },
      { num:2, desc:'Acionar agente específico: Dr. Ben Petições, Contratos ou Pareceres', resp:'Advogado Responsável', prazo:'N/A' },
      { num:3, desc:'Fornecer contexto completo ao agente: fatos, provas, tese desejada', resp:'Advogado', prazo:'N/A' },
      { num:4, desc:'Revisar minuta gerada pela IA e adaptar ao caso concreto', resp:'Advogado Responsável', prazo:'Mesma sessão' },
      { num:5, desc:'Análise jurídica crítica: verificar legislação, jurisprudência e doutrina', resp:'Advogado Sênior', prazo:'Até 24h' },
      { num:6, desc:'Aprovação do Sócio-Diretor para peças de valor > R$ 50.000 ou STJ/STF', resp:'Sócio-Diretor', prazo:'24h' },
      { num:7, desc:'Assinatura digital ICP-Brasil e protocolo no sistema', resp:'Advogado Responsável', prazo:'Antes do prazo' },
    ],
    indicadores: ['% peças com revisão IA','Tempo médio de elaboração','Taxa de aprovação sem revisão significativa'],
    documentos_relacionados: ['POP-JUR-001','Manual Dr. Ben IA','Checklist de Revisão de Peças']
  },
  {
    id: 3, codigo: 'POP-FIN-001', titulo: 'Gestão de Honorários e Contratos Financeiros',
    setor: 'Financeiro', versao: '1.0', autor: 'Dr. Mauro Monção', aprovado: true,
    data_aprovacao: '2026-02-01', revisao: '2026-08-01',
    objetivo: 'Padronizar a gestão de contratos de honorários, geração de cobranças e controle financeiro dos clientes.',
    escopo: 'Todos os contratos de prestação de serviços advocatícios, acordos de êxito e cobranças avulsas.',
    etapas: [
      { num:1, desc:'Elaborar minuta de contrato via Dr. Ben – Contratos', resp:'Advogado', prazo:'Na captação' },
      { num:2, desc:'Aprovar valores e condições com o Sócio-Diretor', resp:'Sócio-Diretor', prazo:'24h' },
      { num:3, desc:'Enviar para assinatura digital via ZapSign/DocuSign', resp:'Administrativo', prazo:'24h' },
      { num:4, desc:'Cadastrar contrato no módulo Financeiro do Ben Juris Center', resp:'Administrativo', prazo:'Após assinatura' },
      { num:5, desc:'Gerar cobranças mensais via PIX/Boleto na data acordada', resp:'Sistema Automático', prazo:'D-3 do vencimento' },
      { num:6, desc:'Conferir reconciliação bancária semanal', resp:'Administrativo', prazo:'Toda segunda-feira' },
      { num:7, desc:'Relatório mensal de DRE para revisão do Sócio', resp:'Administrativo', prazo:'5º dia útil' },
    ],
    indicadores: ['% inadimplência','Prazo médio de recebimento','DRE mensal positivo'],
    documentos_relacionados: ['POP-JUR-001','Modelo Contrato Advocatícios','Tabela de Honorários']
  },
  {
    id: 4, codigo: 'POP-OPE-001', titulo: 'Onboarding de Novos Clientes Institucionais',
    setor: 'Operações', versao: '1.1', autor: 'Dra. Ana Carla', aprovado: true,
    data_aprovacao: '2026-01-25', revisao: '2026-07-25',
    objetivo: 'Garantir uma experiência de onboarding padronizada e eficiente para novos clientes institucionais.',
    escopo: 'Municípios, câmaras, secretarias, empresas, fundações e demais clientes institucionais.',
    etapas: [
      { num:1, desc:'Receber sinal de contratação do Ben Growth Center (score ≥ 70)', resp:'Sistema IA', prazo:'Automático' },
      { num:2, desc:'Criar cadastro institucional completo no Ben Juris Center', resp:'Administrativo', prazo:'1 dia útil' },
      { num:3, desc:'Enviar kit boas-vindas e credenciais do Portal do Cliente', resp:'Administrativo', prazo:'2 dias úteis' },
      { num:4, desc:'Reunião de onboarding (presencial ou remoto) com advogado responsável', resp:'Advogado Sênior', prazo:'5 dias úteis' },
      { num:5, desc:'Levantamento de passivos, demandas pendentes e SLA acordado', resp:'Advogado Sênior', prazo:'Reunião de onboarding' },
      { num:6, desc:'Configurar alertas e calendário do cliente no sistema', resp:'Administrativo', prazo:'Após onboarding' },
    ],
    indicadores: ['NPS 30 dias','Time-to-value (1ª entrega)','Completude do cadastro'],
    documentos_relacionados: ['POP-JUR-001','POP-FIN-001','Kit Boas-Vindas']
  },
  {
    id: 5, codigo: 'POP-SEC-001', titulo: 'Gestão de Acessos e Segurança LGPD',
    setor: 'Segurança', versao: '1.0', autor: 'Dra. Ana Carla', aprovado: false,
    data_aprovacao: '', revisao: '',
    objetivo: 'Controlar os acessos ao sistema, garantir a proteção de dados pessoais e cumprir as obrigações da LGPD.',
    escopo: 'Todos os usuários do Ben Juris Center, incluindo advogados, estagiários, clientes e integrações externas.',
    etapas: [
      { num:1, desc:'Criar usuário com perfil RBAC adequado ao cargo', resp:'Administrador', prazo:'Na contratação' },
      { num:2, desc:'Aplicar MFA obrigatório para todos os acessos', resp:'Administrador', prazo:'Primeiro acesso' },
      { num:3, desc:'Briefing de LGPD e assinatura de termo de confidencialidade', resp:'Sócio-Diretor', prazo:'Onboarding' },
      { num:4, desc:'Auditoria trimestral de acessos e permissões', resp:'Administrador', prazo:'Trimestral' },
      { num:5, desc:'Comunicar incidentes à ANPD em até 72h', resp:'DPO/Sócio', prazo:'72h do incidente' },
    ],
    indicadores: ['% usuários com MFA','Tempo de resposta a incidentes','Score LGPD'],
    documentos_relacionados: ['Política de Privacidade','RIPD','POP-OPE-001']
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMetaCfg: Record<MetaStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  no_prazo: { label: 'No Prazo',  bg: 'bg-green-50',   text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  em_risco: { label: 'Em Risco',  bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  atrasada: { label: 'Atrasada',  bg: 'bg-red-50',     text: 'text-red-700',   border: 'border-red-200',   dot: 'bg-red-500' },
  concluida:{ label: 'Concluída', bg: 'bg-blue-50',    text: 'text-blue-700',  border: 'border-blue-200',  dot: 'bg-blue-500' },
};
const priorCfg: Record<Prioridade, { label: string; bg: string; text: string; border: string }> = {
  critica: { label: 'Crítica', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  alta:    { label: 'Alta',    bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  media:   { label: 'Média',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  baixa:   { label: 'Baixa',   bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200' },
};
const catColors: Record<string, string> = {
  'Comercial': '#2563eb', 'Financeiro': '#059669', 'Operacional': '#7c3aed',
  'Jurídico': '#0891b2', 'Tecnologia': '#d97706', 'Segurança': '#dc2626',
};

function StatusBadge({ status }: { status: MetaStatus }) {
  const c = statusMetaCfg[status];
  return <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${c.bg} ${c.text} ${c.border}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}
  </span>;
}
function PriorBadge({ p }: { p: Prioridade }) {
  const c = priorCfg[p];
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${c.bg} ${c.text} ${c.border}`}>
    <Flag size={9} />{c.label}
  </span>;
}

// ─── POP Detail Modal ─────────────────────────────────────────────────────────
function PopModal({ pop, onClose }: { pop: POP; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono">{pop.codigo}</span>
                <span className="text-xs text-slate-500">v{pop.versao}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pop.aprovado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                  {pop.aprovado ? '✓ Aprovado' : '⏳ Aguardando Aprovação'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800">{pop.titulo}</h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Building2 size={11}/>{pop.setor}</span>
                <span className="flex items-center gap-1"><Users size={11}/>{pop.autor}</span>
                {pop.data_aprovacao && <span className="flex items-center gap-1"><Calendar size={11}/>Aprovado: {new Date(pop.data_aprovacao).toLocaleDateString('pt-BR')}</span>}
                {pop.revisao && <span className="flex items-center gap-1"><RefreshCw size={11}/>Revisão: {new Date(pop.revisao).toLocaleDateString('pt-BR')}</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Objetivo + Escopo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target size={12}/>Objetivo</h4>
              <p className="text-sm text-slate-700">{pop.objetivo}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers size={12}/>Escopo</h4>
              <p className="text-sm text-slate-700">{pop.escopo}</p>
            </div>
          </div>

          {/* Etapas */}
          <div>
            <h4 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2"><ListChecks size={16} className="text-blue-500"/>Procedimento Passo a Passo</h4>
            <div className="space-y-2">
              {pop.etapas.map(e => (
                <div key={e.num} className="flex gap-4 bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-blue-200 transition-colors">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-black shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>{e.num}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700">{e.desc}</div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users size={10}/>{e.resp}</span>
                      <span className="flex items-center gap-1"><Clock size={10}/>{e.prazo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores + Docs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-2 flex items-center gap-2"><BarChart3 size={14} className="text-green-500"/>Indicadores de Desempenho</h4>
              <div className="space-y-2">
                {pop.indicadores.map((ind, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <CheckCircle size={13} className="text-green-500 flex-shrink-0"/>{ind}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-2 flex items-center gap-2"><FileText size={14} className="text-blue-500"/>Documentos Relacionados</h4>
              <div className="space-y-2">
                {pop.documentos_relacionados.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition-colors">
                    <FileText size={13} className="text-blue-500 flex-shrink-0"/>{d}
                    <Download size={11} className="ml-auto text-blue-400"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button className="flex items-center gap-2 btn-primary px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
            <Download size={14}/>Exportar PDF
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
            <Edit size={14}/>Editar POP
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
            <RefreshCw size={14}/>Nova Revisão
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function GestaoEstrategica() {
  const [tab, setTab] = useState<'metas' | 'plano' | 'pops' | 'planejamento'>('metas');
  const [selectedPop, setSelectedPop] = useState<POP | null>(null);
  const [search, setSearch] = useState('');

  // Aggregates
  const metasNoPrazo   = METAS.filter(m => m.status === 'no_prazo').length;
  const metasEmRisco   = METAS.filter(m => m.status === 'em_risco').length;
  const progMedio      = Math.round(METAS.reduce((a, m) => a + m.progresso, 0) / METAS.length);
  const planosAtivos   = PLANOS.filter(p => p.status === 'em_andamento').length;
  const planConcluidos = PLANOS.filter(p => p.status === 'concluida').length;
  const popsAprovados  = POPS.filter(p => p.aprovado).length;

  const filteredPops = POPS.filter(p =>
    !search || p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.setor.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ── Header banner ────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #4c1d95 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 80%, #60a5fa 0%, transparent 40%), radial-gradient(circle at 80% 20%, #a78bfa 0%, transparent 40%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Target size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">Gestão Estratégica</h1>
                <span className="text-xs bg-white/10 text-white/80 border border-white/20 px-2 py-0.5 rounded-full">Ben Juris Center</span>
              </div>
              <p className="text-blue-200 text-sm">Metas · Plano de Ação · Planejamento · POPs</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Metas',    value: METAS.length, color: 'text-blue-300' },
              { label: 'No Prazo', value: metasNoPrazo, color: 'text-green-300' },
              { label: 'Progresso', value: `${progMedio}%`, color: 'text-purple-300' },
              { label: 'POPs',     value: popsAprovados, color: 'text-yellow-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2 text-center border border-white/20">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-white/60 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-sm w-fit">
        {[
          { id: 'metas',       label: 'Metas Estratégicas', icon: Target },
          { id: 'plano',       label: 'Plano de Ação',      icon: ListChecks },
          { id: 'planejamento',label: 'Planejamento',        icon: Map },
          { id: 'pops',        label: 'POPs',               icon: BookMarked },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          METAS ESTRATÉGICAS
      ════════════════════════════════════════════ */}
      {tab === 'metas' && (
        <div className="space-y-4">
          {/* OKR summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de Metas',  value: METAS.length,    icon: Target,        color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
              { label: 'No Prazo',        value: metasNoPrazo,    icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
              { label: 'Em Risco',        value: metasEmRisco,    icon: AlertTriangle, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
              { label: 'Progresso Médio', value: `${progMedio}%`, icon: TrendingUp,    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <c.icon size={18} className={c.color} />
                </div>
                <div className="text-3xl font-black text-slate-800">{c.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Meta cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {METAS.map(meta => {
              const catColor = catColors[meta.categoria] || '#64748b';
              return (
                <div key={meta.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
                  {/* Color accent bar */}
                  <div className="h-1.5" style={{ background: catColor }} />
                  <div className="p-5">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <StatusBadge status={meta.status} />
                          <PriorBadge p={meta.prioridade} />
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: catColor }}>{meta.categoria}</span>
                        </div>
                        <h3 className="font-black text-slate-800 text-sm leading-snug">{meta.titulo}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">{meta.descricao}</p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Progresso</span>
                        <span className="font-black text-slate-800">{meta.progresso}%</span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-2.5">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${meta.progresso}%`, background: meta.status === 'em_risco' ? '#eab308' : meta.status === 'atrasada' ? '#ef4444' : catColor }} />
                      </div>
                      <div className="flex justify-between text-xs mt-1.5">
                        <span className="text-slate-400">{meta.valor_atual}</span>
                        <span className="text-slate-600 font-semibold">Meta: {meta.valor_alvo}</span>
                      </div>
                    </div>

                    {/* Initiatives */}
                    <div className="mb-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Iniciativas</div>
                      <div className="space-y-1.5">
                        {meta.iniciativas.map((ini, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <CircleDot size={10} className="mt-0.5 flex-shrink-0" style={{ color: catColor }} />
                            {ini}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users size={11}/>{meta.responsavel.split(' ').slice(0,2).join(' ')}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={11}/>{new Date(meta.prazo).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Add meta */}
            <button className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 p-8 text-slate-400 hover:text-blue-600 min-h-48 group">
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                <Plus size={22} />
              </div>
              <span className="text-sm font-semibold">Nova Meta Estratégica</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PLANO DE AÇÃO
      ════════════════════════════════════════════ */}
      {tab === 'plano' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total de Ações',   value: PLANOS.length,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200', icon: ListChecks },
              { label: 'Em Andamento',     value: planosAtivos,       color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Play },
              { label: 'Concluídas',       value: planConcluidos,     color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200', icon: CheckCircle },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-4 shadow-sm flex items-center gap-3`}>
                <c.icon size={22} className={c.color} />
                <div>
                  <div className="text-2xl font-black text-slate-800">{c.value}</div>
                  <div className="text-xs font-semibold text-slate-500">{c.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-700 text-sm flex items-center gap-2"><ListChecks size={16} className="text-blue-500"/>Plano de Ação Estratégico</h3>
              <button className="flex items-center gap-1.5 btn-primary text-xs px-3 py-2 rounded-xl shadow-sm font-semibold transition-colors">
                <Plus size={12}/>Nova Ação
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Ação','Meta Vinculada','Responsável','Prazo','Recursos','Prioridade','Status'].map(h => (
                      <th key={h} className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left border-b border-slate-100">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLANOS.map(pl => {
                    const meta = METAS.find(m => m.id === pl.metaId);
                    const stCls: Record<string, string> = {
                      pendente:    'bg-slate-100 text-slate-600',
                      em_andamento:'bg-blue-100 text-blue-700',
                      concluida:   'bg-green-100 text-green-700',
                    };
                    const stLbl: Record<string, string> = {
                      pendente: 'Pendente', em_andamento: 'Em Andamento', concluida: 'Concluída'
                    };
                    return (
                      <tr key={pl.id} className="border-t border-slate-100 hover:bg-blue-50/40 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 max-w-xs">{pl.acao}</td>
                        <td className="px-4 py-3">
                          {meta && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{meta.titulo.substring(0,35)}…</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-medium">{pl.responsavel}</td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">{new Date(pl.prazo).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{pl.recursos}</td>
                        <td className="px-4 py-3"><PriorBadge p={pl.prioridade} /></td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stCls[pl.status]}`}>{stLbl[pl.status]}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PLANEJAMENTO (Timeline / Roadmap)
      ════════════════════════════════════════════ */}
      {tab === 'planejamento' && (
        <div className="space-y-5">
          {/* Quarter roadmap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2 mb-5"><Map size={16} className="text-blue-500"/>Roadmap Estratégico 2026</h3>
            <div className="space-y-4">
              {[
                { q: 'Q1 2026', months: 'Jan – Mar', items: [
                  { label: 'Deploy Ben Juris Center v1.0', done: true,  color: '#2563eb' },
                  { label: 'Treinamento Dr. Ben IA Equipe', done: false, color: '#7c3aed' },
                  { label: 'Onboarding 10 novos clientes', done: false, color: '#059669' },
                  { label: 'LGPD 100% – Completar RIPD',   done: false, color: '#d97706' },
                ]},
                { q: 'Q2 2026', months: 'Abr – Jun', items: [
                  { label: 'Lançamento SaaS multi-tenant',        done: false, color: '#2563eb' },
                  { label: 'IA em 100% das peças processuais',    done: false, color: '#7c3aed' },
                  { label: 'Meta 40 clientes ativos',             done: false, color: '#059669' },
                  { label: 'Módulo Setor Público expandido',      done: false, color: '#0891b2' },
                ]},
                { q: 'Q3 2026', months: 'Jul – Set', items: [
                  { label: 'Receita R$ 1.2M acumulada',          done: false, color: '#059669' },
                  { label: 'Ben Juris Center – 5 escritórios piloto', done: false, color: '#2563eb' },
                  { label: '50 clientes institucionais ativos',  done: false, color: '#7c3aed' },
                  { label: 'Expansão BI – Relatórios Setor Público', done: false, color: '#d97706' },
                ]},
                { q: 'Q4 2026', months: 'Out – Dez', items: [
                  { label: 'Meta anual R$ 1.8M atingida',        done: false, color: '#059669' },
                  { label: '60 clientes – Meta anual',           done: false, color: '#2563eb' },
                  { label: 'Taxa de sucesso processual 80%',     done: false, color: '#7c3aed' },
                  { label: 'Planejamento estratégico 2027',      done: false, color: '#64748b' },
                ]},
              ].map(quarter => (
                <div key={quarter.q} className="flex gap-4">
                  <div className="w-28 flex-shrink-0">
                    <div className="text-sm font-black text-slate-700">{quarter.q}</div>
                    <div className="text-xs text-slate-400 font-medium">{quarter.months}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {quarter.items.map((item, i) => (
                      <div key={i} className={`rounded-xl px-3 py-2.5 border text-xs font-semibold flex items-center gap-2 ${item.done ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.done ? '#22c55e' : item.color }} />
                        {item.label}
                        {item.done && <CheckCircle size={11} className="ml-auto flex-shrink-0 text-green-500"/>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Annual OKRs progress */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-green-500"/>OKRs Anuais – Progresso Consolidado</h3>
            <div className="space-y-4">
              {METAS.map(meta => {
                const catColor = catColors[meta.categoria] || '#64748b';
                return (
                  <div key={meta.id} className="flex items-center gap-4">
                    <div className="w-48 flex-shrink-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{meta.titulo}</div>
                      <div className="text-xs text-slate-400">{meta.categoria} · {meta.responsavel.split(' ').slice(0,2).join(' ')}</div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-slate-100 rounded-full h-3">
                        <div className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                          style={{ width: `${meta.progresso}%`, background: meta.status === 'em_risco' ? '#eab308' : catColor }}>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm font-black text-slate-800">{meta.progresso}%</span>
                    </div>
                    <div className="w-24 text-right"><StatusBadge status={meta.status} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          POPs – PROCEDIMENTOS OPERACIONAIS PADRÃO
      ════════════════════════════════════════════ */}
      {tab === 'pops' && (
        <div className="space-y-4">
          {/* Header + search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar POP por código, título ou setor..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm" />
            </div>
            <div className="flex gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-green-600 font-semibold">{popsAprovados} aprovados</span>
              <span>·</span>
              <span className="text-yellow-600 font-semibold">{POPS.length - popsAprovados} pendentes</span>
            </div>
            <button className="ml-auto flex items-center gap-2 btn-primary text-sm px-4 py-2.5 rounded-xl shadow-sm font-semibold transition-colors">
              <Plus size={14}/>Novo POP
            </button>
          </div>

          {/* POP cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPops.map(pop => (
              <div key={pop.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => setSelectedPop(pop)}>
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-purple-600" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-mono">{pop.codigo}</span>
                        <span className="text-xs text-slate-400">v{pop.versao}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pop.aprovado ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                          {pop.aprovado ? '✓ Aprovado' : '⏳ Pendente'}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-800 text-sm leading-snug group-hover:text-blue-700 transition-colors">{pop.titulo}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', border: '1px solid #e0e7ff' }}>
                      <BookMarked size={18} className="text-blue-600" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{pop.objetivo}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-lg font-medium"><Building2 size={10}/>{pop.setor}</span>
                    <span className="flex items-center gap-1"><Users size={10}/>{pop.autor}</span>
                    <span className="flex items-center gap-1"><ListChecks size={10}/>{pop.etapas.length} etapas</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-400">
                      {pop.aprovado ? `Aprovado: ${new Date(pop.data_aprovacao).toLocaleDateString('pt-BR')}` : 'Aguardando aprovação'}
                    </div>
                    <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors">
                      Ver POP <ChevronRight size={12}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New POP */}
            <button className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-3 p-8 text-slate-400 hover:text-blue-600 group">
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                <Plus size={22} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Criar Novo POP</div>
                <div className="text-xs text-slate-400 mt-0.5">Procedimento Operacional Padrão</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* POP Modal */}
      {selectedPop && <PopModal pop={selectedPop} onClose={() => setSelectedPop(null)} />}
    </div>
  );
}
