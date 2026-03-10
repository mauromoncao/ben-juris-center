import React, { useState } from 'react';
import {
  Target, Plus, Search, Filter, Calendar, Clock, Users, CheckCircle,
  AlertTriangle, BarChart3, TrendingUp, FileText, Brain, Zap, ChevronRight,
  Edit, Trash2, Eye, MessageSquare, Paperclip, Flag, Activity, Star,
  ArrowUp, ArrowDown, DollarSign, Award, RefreshCw, Download, List,
  LayoutGrid, ChevronDown, Circle, CheckSquare, Play, Pause, StopCircle
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const MEMBERS = [
  { id: 'MM', name: 'Dr. Mauro Monção', role: 'Sócio-Diretor', color: '#2563eb' },
  { id: 'AC', name: 'Dra. Ana Carla', role: 'Advogada Sênior', color: '#7c3aed' },
  { id: 'FT', name: 'Dr. Felipe Torres', role: 'Advogado Pleno', color: '#059669' },
  { id: 'BS', name: 'Beatriz Santos', role: 'Estagiária', color: '#d97706' },
  { id: 'LF', name: 'Lucas Ferreira', role: 'Estagiário', color: '#0891b2' },
];

interface Task {
  id: number; title: string; assignee: string; priority: 'critica' | 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_andamento' | 'revisao' | 'concluida'; dueDate: string;
  tags: string[]; hours: number; aiSuggested: boolean; description: string;
}

interface Project {
  id: number; name: string; client: string; type: string;
  status: 'planejamento' | 'em_andamento' | 'revisao' | 'concluido' | 'pausado';
  priority: 'critica' | 'alta' | 'media' | 'baixa'; progress: number;
  startDate: string; deadline: string; team: string[]; value: number;
  description: string; tasks: Task[];
}

const PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Ação Anulatória – Decreto Municipal nº 4.521',
    client: 'Prefeitura de São Paulo',
    type: 'Contencioso Administrativo',
    status: 'em_andamento',
    priority: 'alta',
    progress: 68,
    startDate: '2026-01-10',
    deadline: '2026-03-15',
    team: ['MM', 'AC'],
    value: 85000,
    description: 'Ação anulatória contra decreto municipal que impõe restrições inconstitucionais ao exercício de atividade econômica.',
    tasks: [
      { id: 1, title: 'Pesquisa jurisprudencial STF – Livre iniciativa', assignee: 'AC', priority: 'alta', status: 'concluida', dueDate: '2026-01-20', tags: ['pesquisa', 'STF'], hours: 8, aiSuggested: true, description: 'Levantamento de precedentes sobre livre iniciativa e proporcionalidade' },
      { id: 2, title: 'Elaborar petição inicial com fundamentação constitucional', assignee: 'MM', priority: 'alta', status: 'concluida', dueDate: '2026-01-28', tags: ['petição', 'IA'], hours: 12, aiSuggested: true, description: 'Peça principal com Dr. Ben – Petições' },
      { id: 3, title: 'Protocolar nos autos e acompanhar distribuição', assignee: 'BS', priority: 'media', status: 'concluida', dueDate: '2026-01-30', tags: ['protocolo'], hours: 2, aiSuggested: false, description: '' },
      { id: 4, title: 'Analisar contestação do Município', assignee: 'MM', priority: 'alta', status: 'em_andamento', dueDate: '2026-02-28', tags: ['análise', 'IA'], hours: 6, aiSuggested: true, description: 'Análise via Dr. Ben – Análise Processual' },
      { id: 5, title: 'Elaborar réplica à contestação', assignee: 'MM', priority: 'alta', status: 'em_andamento', dueDate: '2026-03-07', tags: ['petição'], hours: 10, aiSuggested: true, description: '' },
      { id: 6, title: 'Preparar memoriais finais', assignee: 'AC', priority: 'media', status: 'pendente', dueDate: '2026-03-12', tags: ['memorial'], hours: 8, aiSuggested: true, description: '' },
      { id: 7, title: 'Audiência de instrução – Preparação completa', assignee: 'MM', priority: 'critica', status: 'pendente', dueDate: '2026-03-14', tags: ['audiência', 'urgente'], hours: 4, aiSuggested: false, description: '' },
    ]
  },
  {
    id: 2,
    name: 'Contencioso Tributário – ISS sobre Software',
    client: 'Empresa ABC Tecnologia Ltda',
    type: 'Contencioso Tributário',
    status: 'em_andamento',
    priority: 'critica',
    progress: 45,
    startDate: '2026-01-15',
    deadline: '2026-03-08',
    team: ['MM', 'FT'],
    value: 120000,
    description: 'Mandado de segurança contra cobrança de ISS sobre licenciamento de software SaaS – tese de imunidade e não incidência.',
    tasks: [
      { id: 8, title: 'Auditoria fiscal – verificar todos os autos de infração', assignee: 'FT', priority: 'critica', status: 'concluida', dueDate: '2026-01-22', tags: ['auditoria', 'IA'], hours: 16, aiSuggested: true, description: '' },
      { id: 9, title: 'Elaborar Mandado de Segurança com liminar', assignee: 'MM', priority: 'critica', status: 'concluida', dueDate: '2026-01-30', tags: ['petição', 'MS'], hours: 14, aiSuggested: true, description: '' },
      { id: 10, title: 'Análise de Súmula Vinculante nº 31 e impactos', assignee: 'FT', priority: 'alta', status: 'em_andamento', dueDate: '2026-02-15', tags: ['pesquisa', 'STF'], hours: 6, aiSuggested: true, description: '' },
      { id: 11, title: 'Elaborar razões de recurso ao TJ', assignee: 'MM', priority: 'alta', status: 'pendente', dueDate: '2026-03-01', tags: ['recurso'], hours: 12, aiSuggested: true, description: '' },
      { id: 12, title: 'Identificar créditos tributários a recuperar', assignee: 'FT', priority: 'alta', status: 'pendente', dueDate: '2026-03-05', tags: ['créditos', 'IA'], hours: 8, aiSuggested: true, description: '' },
    ]
  },
  {
    id: 3,
    name: 'Due Diligence Completa – M&A Grupo Norte',
    client: 'Grupo Empresarial Norte S.A.',
    type: 'M&A / Due Diligence',
    status: 'em_andamento',
    priority: 'alta',
    progress: 15,
    startDate: '2026-02-01',
    deadline: '2026-04-01',
    team: ['MM', 'AC', 'FT'],
    value: 200000,
    description: 'Due diligence jurídica completa para aquisição de grupo empresarial com 5 subsidiárias.',
    tasks: [
      { id: 13, title: 'Levantamento societário – Grupo e subsidiárias', assignee: 'AC', priority: 'alta', status: 'em_andamento', dueDate: '2026-02-20', tags: ['societário'], hours: 20, aiSuggested: false, description: '' },
      { id: 14, title: 'Mapeamento contencioso (judicial e admin.)', assignee: 'FT', priority: 'alta', status: 'em_andamento', dueDate: '2026-02-25', tags: ['contencioso', 'IA'], hours: 24, aiSuggested: true, description: '' },
      { id: 15, title: 'Análise trabalhista – passivos ocultos', assignee: 'LF', priority: 'media', status: 'pendente', dueDate: '2026-03-05', tags: ['trabalhista'], hours: 16, aiSuggested: true, description: '' },
      { id: 16, title: 'Auditoria tributária – 5 anos', assignee: 'FT', priority: 'alta', status: 'pendente', dueDate: '2026-03-10', tags: ['tributário', 'IA'], hours: 32, aiSuggested: true, description: '' },
      { id: 17, title: 'Análise de contratos vigentes (>R$ 100k)', assignee: 'AC', priority: 'alta', status: 'pendente', dueDate: '2026-03-15', tags: ['contratos', 'IA'], hours: 20, aiSuggested: true, description: '' },
      { id: 18, title: 'Elaborar relatório final de due diligence', assignee: 'MM', priority: 'alta', status: 'pendente', dueDate: '2026-03-28', tags: ['relatório'], hours: 16, aiSuggested: true, description: '' },
    ]
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────
const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critica: { label: 'Crítica', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  alta: { label: 'Alta', color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
  media: { label: 'Média', color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)' },
  baixa: { label: 'Baixa', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: 'Pendente', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  revisao: { label: 'Em Revisão', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  concluida: { label: 'Concluída', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  planejamento: { label: 'Planejamento', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  concluido: { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  pausado: { label: 'Pausado', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
};

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] || priorityConfig.baixa;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Flag size={9} /> {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pendente;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function MemberAvatar({ id, size = 'sm' }: { id: string; size?: 'sm' | 'md' }) {
  const m = MEMBERS.find(x => x.id === id);
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: m?.color || '#4b5563' }} title={m?.name}>
      {id}
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ title, tasks, color, count }: { title: string; tasks: Task[]; color: string; count: number }) {
  return (
    <div className="flex-1 min-w-60 max-w-72">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{count}</span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="rounded-xl p-3 border border-slate-100 hover:border-blue-700/40 transition-all cursor-pointer group"
            style={{ background: '#FFFFFF' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-medium leading-snug flex-1" style={{ color: '#222222' }}>{task.title}</span>
              {task.aiSuggested && <span title="Sugerido por IA"><Brain size={11} className="text-purple-400 flex-shrink-0 mt-0.5" /></span>}
            </div>
            <div className="flex items-center justify-between">
              <PriorityBadge priority={task.priority} />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 flex items-center gap-0.5"><Clock size={9} />{task.hours}h</span>
                <MemberAvatar id={task.assignee} />
              </div>
            </div>
            {task.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {task.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-slate-50 text-blue-400 border border-blue-800/20 rounded px-1.5 py-0.5">{t}</span>
                ))}
              </div>
            )}
            <div className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
              <Calendar size={9} />{new Date(task.dueDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
        <button className="w-full border border-dashed border-slate-200 text-slate-400 hover:text-slate-500 hover:border-blue-700/40 rounded-xl py-2 text-xs transition-colors flex items-center justify-center gap-1">
          <Plus size={12} /> Adicionar tarefa
        </button>
      </div>
    </div>
  );
}

// ─── Project Detail Modal ─────────────────────────────────────────────────────
function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const tasksByStatus = {
    pendente: project.tasks.filter(t => t.status === 'pendente'),
    em_andamento: project.tasks.filter(t => t.status === 'em_andamento'),
    revisao: project.tasks.filter(t => t.status === 'revisao'),
    concluida: project.tasks.filter(t => t.status === 'concluida'),
  };

  const totalHours = project.tasks.reduce((a, t) => a + t.hours, 0);
  const completedHours = project.tasks.filter(t => t.status === 'concluida').reduce((a, t) => a + t.hours, 0);
  const aiTasks = project.tasks.filter(t => t.aiSuggested).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="min-h-full p-4 flex items-start justify-center pt-8">
        <div className="w-full max-w-6xl rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(25,56,92,0.12)' }}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200" style={{ background: '#F9FAFB' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={project.status} />
                  <PriorityBadge priority={project.priority} />
                  <span className="text-xs text-slate-500">{project.type}</span>
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#19385C' }}>{project.name}</h2>
                <div className="text-sm text-slate-500">{project.client}</div>
                <p className="text-xs text-slate-500 mt-2 max-w-2xl">{project.description}</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl font-bold ml-4">&times;</button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-6 mt-4">
              {[
                { label: 'Tarefas', value: `${project.tasks.filter(t => t.status === 'concluida').length}/${project.tasks.length}`, icon: CheckCircle },
                { label: 'Horas', value: `${completedHours}/${totalHours}h`, icon: Clock },
                { label: 'Valor', value: `R$ ${(project.value / 1000).toFixed(0)}k`, icon: DollarSign },
                { label: 'Com IA', value: `${aiTasks} tarefas`, icon: Brain },
                { label: 'Prazo', value: new Date(project.deadline).toLocaleDateString('pt-BR'), icon: Calendar },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5 text-xs">
                  <s.icon size={13} className="text-slate-500" />
                  <span className="text-slate-500">{s.label}:</span>
                  <span className="text-slate-800 font-medium">{s.value}</span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1">
                  {project.team.map(m => <MemberAvatar key={m} id={m} size="md" />)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progresso geral</span>
                <span className="text-slate-700 font-medium">{project.progress}%</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </div>

          {/* View toggle */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
              {[{ id: 'kanban', label: 'Kanban', icon: LayoutGrid }, { id: 'list', label: 'Lista', icon: List }].map(v => (
                <button key={v.id} onClick={() => setView(v.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  style={view === v.id ? { background: '#19385C' } : {}}>
                  <v.icon size={12} />{v.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border"
                style={{ background: 'rgba(25,56,92,0.06)', color: '#19385C', borderColor: 'rgba(25,56,92,0.20)' }}>
                <Brain size={12} /> Dr. Ben IA – Sugerir Tarefas
              </button>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors border"
                style={{ background: '#F9FAFB', color: '#19385C', borderColor: '#E5E7EB' }}>
                <Plus size={12} /> Nova Tarefa
              </button>
            </div>
          </div>

          {/* Task Views */}
          <div className="p-6">
            {view === 'kanban' && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[
                  { key: 'pendente', title: 'Pendente', color: '#9ca3af' },
                  { key: 'em_andamento', title: 'Em Andamento', color: '#3b82f6' },
                  { key: 'revisao', title: 'Em Revisão', color: '#eab308' },
                  { key: 'concluida', title: 'Concluída', color: '#22c55e' },
                ].map(col => (
                  <KanbanColumn
                    key={col.key}
                    title={col.title}
                    color={col.color}
                    tasks={tasksByStatus[col.key as keyof typeof tasksByStatus]}
                    count={tasksByStatus[col.key as keyof typeof tasksByStatus].length}
                  />
                ))}
              </div>
            )}

            {view === 'list' && (
              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-700/30 transition-all group"
                    style={{ background: '#FFFFFF' }}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${task.status === 'concluida' ? 'bg-green-500' : 'border border-gray-600'}`}>
                      {task.status === 'concluida' && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${task.status === 'concluida' ? 'line-through' : ''}`}
                          style={{ color: task.status === 'concluida' ? '#9CA3AF' : '#222222' }}>{task.title}</span>
                        {task.aiSuggested && <span title="IA"><Brain size={11} className="text-purple-400" /></span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {task.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-xs text-blue-500">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-slate-500 flex items-center gap-0.5"><Clock size={10} />{task.hours}h</span>
                      <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
                      <MemberAvatar id={task.assignee} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NucleoProjetos() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = PROJECTS.filter(p => {
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchMember = filterMember === 'all' || p.team.includes(filterMember);
    const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.client.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchMember && matchSearch;
  });

  // Aggregates
  const totalValue = PROJECTS.reduce((a, p) => a + p.value, 0);
  const totalTasks = PROJECTS.reduce((a, p) => a + p.tasks.length, 0);
  const completedTasks = PROJECTS.reduce((a, p) => a + p.tasks.filter(t => t.status === 'concluida').length, 0);
  const aiTasks = PROJECTS.reduce((a, p) => a + p.tasks.filter(t => t.aiSuggested).length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 1px 6px rgba(25,56,92,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
              style={{ border: '2px solid rgba(222,192,120,0.50)', boxShadow: '0 0 20px rgba(222,192,120,0.25)' }}>
              <img src="/ben-logo.png" alt="BEN Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#19385C' }}>Núcleo de Projetos</h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>Gestão completa da produtividade do escritório com IA integrada</p>
            </div>
          </div>
          <button className="flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Novo Projeto
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
          {[
            { label: 'Projetos Ativos', value: PROJECTS.filter(p => p.status === 'em_andamento').length, icon: Activity, color: '#2563eb' },
            { label: 'Total Tarefas', value: totalTasks, icon: CheckCircle, color: '#7c3aed', sub: `${completedTasks} concluídas` },
            { label: 'Tarefas com IA', value: aiTasks, icon: Brain, color: '#a855f7', sub: `${Math.round(aiTasks / totalTasks * 100)}% do total` },
            { label: 'Carteira Total', value: `R$ ${(totalValue / 1000).toFixed(0)}k`, icon: DollarSign, color: '#059669' },
            { label: 'Eficiência IA', value: '38%', icon: TrendingUp, color: '#d97706', sub: 'economia de tempo' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>{s.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: '#19385C' }}>{s.value}</div>
              {s.sub && <div className="text-xs" style={{ color: '#9CA3AF' }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Member productivity strip */}
      <div className="rounded-xl p-4 border border-slate-200 flex items-center gap-4 overflow-x-auto" style={{ background: '#FFFFFF' }}>
        <span className="text-xs font-medium whitespace-nowrap flex items-center gap-1.5" style={{ color: '#19385C' }}>
          <Users size={12} /> Produtividade da Equipe:
        </span>
        {MEMBERS.map(m => {
          const memberTasks = PROJECTS.flatMap(p => p.tasks).filter(t => t.assignee === m.id);
          const done = memberTasks.filter(t => t.status === 'concluida').length;
          const pct = memberTasks.length ? Math.round(done / memberTasks.length * 100) : 0;
          return (
            <div key={m.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-blue-800/20 flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: m.color }}>{m.id}</div>
              <div>
                <div className="text-xs font-medium text-slate-700">{m.name.split(' ')[1]}</div>
                <div className="text-xs text-slate-500">{done}/{memberTasks.length} · {pct}%</div>
              </div>
              <div className="w-12 bg-slate-100 rounded-full h-1">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Buscar projeto..."
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-52" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="all">Todos os status</option>
          <option value="planejamento">Planejamento</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="revisao">Em Revisão</option>
          <option value="concluido">Concluído</option>
          <option value="pausado">Pausado</option>
        </select>
        <select value={filterMember} onChange={e => setFilterMember(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500">
          <option value="all">Toda a equipe</option>
          {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="ml-auto flex gap-1 bg-slate-100 p-0.5 rounded-lg">
          {[{ id: 'grid', icon: LayoutGrid }, { id: 'list', icon: List }].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id as any)}
              className={`p-1.5 rounded-md transition-all ${viewMode === v.id ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
              style={viewMode === v.id ? { background: '#19385C' } : {}}>
              <v.icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const completedCount = project.tasks.filter(t => t.status === 'concluida').length;
            const priorityCfg = priorityConfig[project.priority];
            const aiCount = project.tasks.filter(t => t.aiSuggested).length;
            return (
              <div key={project.id}
                className="rounded-xl border border-slate-200 hover:border-blue-700/50 transition-all cursor-pointer group overflow-hidden"
                style={{ background: '#FFFFFF' }}
                onClick={() => setSelectedProject(project)}>
                {/* Priority bar */}
                <div className="h-1" style={{ background: priorityCfg.color }} />
                <div className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={project.status} />
                        <PriorityBadge priority={project.priority} />
                      </div>
                      <h3 className="font-semibold text-sm leading-snug transition-colors" style={{ color: '#222222' }}>{project.name}</h3>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{project.client} · {project.type}</div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{completedCount}/{project.tasks.length} tarefas</span>
                      <span className="text-slate-700 font-medium">{project.progress}%</span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-1.5">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {project.team.map(m => <MemberAvatar key={m} id={m} />)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {aiCount > 0 && <span className="flex items-center gap-1 text-purple-400"><Brain size={10} />{aiCount} IA</span>}
                      <span className="flex items-center gap-1"><Calendar size={10} />{new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#00b37e' }}>R$ {(project.value / 1000).toFixed(0)}k</span>
                    <button className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">
                      Abrir projeto <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* New project card */}
          <button className="rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-700/50 transition-all p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-500 min-h-48">
            <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center">
              <Plus size={22} />
            </div>
            <span className="text-sm font-medium">Novo Projeto</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ background: '#FFFFFF' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Projeto', 'Cliente', 'Status', 'Prioridade', 'Progresso', 'Tarefas', 'Equipe', 'Prazo', 'Valor', 'IA'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(project => {
                const done = project.tasks.filter(t => t.status === 'concluida').length;
                const aiCount = project.tasks.filter(t => t.aiSuggested).length;
                return (
                  <tr key={project.id} className="border-b border-blue-900/10 hover:bg-amber-50/40 cursor-pointer transition-colors" onClick={() => setSelectedProject(project)}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">{project.name}</div>
                      <div className="text-xs text-slate-500">{project.type}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{project.client}</td>
                    <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={project.priority} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{done}/{project.tasks.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">{project.team.map(m => <MemberAvatar key={m} id={m} />)}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(project.deadline).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: '#00b37e' }}>R$ {(project.value / 1000).toFixed(0)}k</td>
                    <td className="px-4 py-3">
                      {aiCount > 0 && <span className="flex items-center gap-1 text-xs text-purple-400"><Brain size={11} />{aiCount}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
