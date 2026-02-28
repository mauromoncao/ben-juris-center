import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Gavel, Clock, AlertTriangle, CheckCircle, TrendingUp, DollarSign,
  Building2, FileText, Scale, Calendar, ArrowUp, ArrowDown, Activity,
  Zap, Shield, BarChart3, Brain, Users, Star, Target
} from 'lucide-react';

const revenueData = [
  { mes: 'Set', receita: 85000, despesa: 32000 },
  { mes: 'Out', receita: 92000, despesa: 35000 },
  { mes: 'Nov', receita: 78000, despesa: 28000 },
  { mes: 'Dez', receita: 110000, despesa: 42000 },
  { mes: 'Jan', receita: 96000, despesa: 38000 },
  { mes: 'Fev', receita: 125000, despesa: 45000 },
];

const areaData = [
  { name: 'Tributário',     value: 35, color: '#2563eb' },
  { name: 'Administrativo', value: 28, color: '#7c3aed' },
  { name: 'Civil',          value: 20, color: '#059669' },
  { name: 'Trabalhista',    value: 12, color: '#d97706' },
  { name: 'Previdenciário', value:  5, color: '#dc2626' },
];

const setorData = [
  { setor: 'Municípios',   processos: 68 },
  { setor: 'Câmaras',      processos: 42 },
  { setor: 'Secretarias',  processos: 37 },
  { setor: 'Empresas',     processos: 55 },
  { setor: 'Fundações',    processos: 24 },
  { setor: 'Autarquias',   processos: 21 },
];

const alertas = [
  { tipo: 'danger',  icon: AlertTriangle, msg: 'Prazo fatal: Processo nº 0001234-55.2024 — vence HOJE 18h', area: 'Tributário' },
  { tipo: 'danger',  icon: AlertTriangle, msg: 'Prazo fatal: Apelação Cível nº 0009876-44.2023 — vence HOJE', area: 'Civil' },
  { tipo: 'warning', icon: Clock,         msg: 'D-3: Contestação nº 0004321-66.2024 — vence 03/03', area: 'Trabalhista' },
  { tipo: 'warning', icon: Calendar,      msg: 'Audiência amanhã 14h — Fórum Central, Sala 5', area: 'Administrativo' },
  { tipo: 'info',    icon: FileText,      msg: 'Nova intimação recebida via DJEN — Processo nº 0007654-11.2024', area: 'Tributário' },
];

const processosList = [
  { num: '0001234-55.2024', cliente: 'Prefeitura Municipal de SP',   area: 'Tributário',    instancia: '1ª instância', status: 'ativo',           prazo: '28/02', urgencia: 'critico' },
  { num: '0009876-44.2023', cliente: 'Câmara Municipal RJ',          area: 'Administrativo',instancia: '2ª instância', status: 'recurso',          prazo: '05/03', urgencia: 'alta' },
  { num: '0004321-66.2024', cliente: 'Fundação Educacional SP',      area: 'Trabalhista',   instancia: '1ª instância', status: 'ativo',            prazo: '03/03', urgencia: 'media' },
  { num: '0007654-11.2024', cliente: 'Secretaria da Saúde MG',       area: 'Administrativo',instancia: 'STJ',          status: 'recurso_especial', prazo: '12/03', urgencia: 'baixa' },
  { num: '0002345-78.2024', cliente: 'Agência Reguladora Federal',   area: 'Administrativo',instancia: '1ª instância', status: 'ativo',            prazo: '18/03', urgencia: 'baixa' },
];

const urgCor: Record<string, string> = {
  critico: 'bg-red-100 text-red-600 border border-red-200',
  alta:    'bg-orange-100 text-orange-600 border border-orange-200',
  media:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  baixa:   'bg-green-100 text-green-700 border border-green-200',
};
const statusCor: Record<string, string> = {
  ativo:            'bg-blue-100 text-blue-700',
  recurso:          'bg-purple-100 text-purple-700',
  recurso_especial: 'bg-indigo-100 text-indigo-700',
};
const statusLabel: Record<string, string> = {
  ativo: 'Ativo', recurso: 'Recurso', recurso_especial: 'Rec. Especial',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ── Banner ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 relative overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #fff 0%, transparent 40%), radial-gradient(circle at 90% 20%, #a5b4fc 0%, transparent 40%)' }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                <Scale size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Ben Juris Center</h1>
                <p className="text-blue-200 text-xs font-medium">Gestão Jurídica · Operações · Setor Público · Processos · Financeiro</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: CheckCircle, label: 'Sistema Online',  color: 'bg-green-400/20 text-green-300 border-green-400/30' },
              { icon: Activity,    label: 'CNJ Conectado',   color: 'bg-blue-300/20  text-blue-200  border-blue-300/30' },
              { icon: Brain,       label: 'Dr. Ben IA Ativo',color: 'bg-purple-300/20 text-purple-200 border-purple-300/30' },
            ].map(b => (
              <span key={b.label} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${b.color}`}>
                <b.icon size={12} />{b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Processos Ativos',  value: '247', icon: Gavel,         change: '+12', up: true,  color: 'blue',   sub: '18 novas entradas' },
          { label: 'Prazos Críticos',   value: '8',   icon: AlertTriangle, change: '+3',  up: false, color: 'red',    sub: '3 vencem hoje' },
          { label: 'Receita do Mês',    value: 'R$ 125K', icon: DollarSign, change: '+23%', up: true, color: 'green',  sub: 'vs mês anterior' },
          { label: 'Clientes Ativos',   value: '34',  icon: Building2,     change: '+2',  up: true,  color: 'purple', sub: '6 públicos, 28 privados' },
        ].map(card => {
          const Icon = card.icon;
          const theme: Record<string, { bg: string; accent: string; iconBg: string; iconColor: string; border: string }> = {
            blue:   { bg: 'bg-blue-50',   accent: 'text-blue-600',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   border: 'border-blue-200' },
            red:    { bg: 'bg-red-50',    accent: 'text-red-600',    iconBg: 'bg-red-100',    iconColor: 'text-red-600',    border: 'border-red-200' },
            green:  { bg: 'bg-green-50',  accent: 'text-green-600',  iconBg: 'bg-green-100',  iconColor: 'text-green-600',  border: 'border-green-200' },
            purple: { bg: 'bg-purple-50', accent: 'text-purple-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-200' },
          };
          const t = theme[card.color];
          return (
            <div key={card.label} className={`${t.bg} border ${t.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${t.iconBg} flex items-center justify-center shadow-sm`}>
                  <Icon size={22} className={t.iconColor} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${card.up ? 'text-green-600' : 'text-red-500'}`}>
                  {card.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{card.change}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-800">{card.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{card.label}</div>
              <div className={`text-xs mt-1 font-medium ${t.accent}`}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Módulos rápidos ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Gestão Jurídica',  icon: Scale,    color: '#2563eb', bg: '#eff6ff' },
          { label: 'Operações',        icon: Activity,  color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Setor Público',    icon: Building2, color: '#0891b2', bg: '#ecfeff' },
          { label: 'Processos',        icon: Gavel,     color: '#059669', bg: '#f0fdf4' },
          { label: 'Financeiro',       icon: DollarSign,color: '#d97706', bg: '#fffbeb' },
          { label: 'Dr. Ben IA',       icon: Brain,     color: '#dc2626', bg: '#fef2f2' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="rounded-2xl p-4 border border-slate-200 bg-white hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-center shadow-sm group">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: m.bg }}>
                <Icon size={20} style={{ color: m.color }} />
              </div>
              <div className="text-xs font-semibold text-slate-600">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Alertas Críticos ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="font-bold text-slate-700 text-sm">Alertas & Prazos Críticos</span>
          <span className="ml-auto text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">5 alertas</span>
        </div>
        <div className="divide-y divide-slate-100">
          {alertas.map((a, i) => {
            const Icon = a.icon;
            const styles: Record<string, string> = {
              danger:  'bg-red-50    border-l-4 border-l-red-400',
              warning: 'bg-yellow-50 border-l-4 border-l-yellow-400',
              info:    'bg-blue-50   border-l-4 border-l-blue-400',
            };
            const iconCls: Record<string, string> = {
              danger: 'text-red-500', warning: 'text-yellow-600', info: 'text-blue-500',
            };
            return (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 ${styles[a.tipo]}`}>
                <Icon size={15} className={iconCls[a.tipo]} />
                <span className="text-sm text-slate-700 flex-1">{a.msg}</span>
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{a.area}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />Receita vs Despesas
            </span>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="desp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, color: '#1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toLocaleString('pt-BR')}`, '']} />
              <Area type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2.5} fill="url(#rec)" name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2.5} fill="url(#desp)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-4">
            <Scale size={16} className="text-blue-500" />Processos por Área
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={areaData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                {areaData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {areaData.map(a => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-slate-500 flex-1">{a.name}</span>
                <span className="font-bold text-slate-700">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Setor público bar ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
            <Building2 size={16} className="text-cyan-500" />Distribuição Setor Público
          </span>
          <span className="text-xs text-slate-400">Processos por segmento</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={setorData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="setor" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
            <Bar dataKey="processos" radius={[6, 6, 0, 0]}>
              {setorData.map((_, i) => (
                <Cell key={i} fill={['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626'][i % 6]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Processos Urgentes ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Gavel size={16} className="text-blue-500" />
          <span className="font-bold text-slate-700 text-sm">Processos em Andamento — Mais Urgentes</span>
          <span className="ml-auto text-xs text-blue-600 font-medium hover:text-blue-800 cursor-pointer">Ver todos →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Nº Processo','Cliente','Área','Instância','Status','Próx. Prazo','Urgência'].map(h => (
                  <th key={h} className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processosList.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-blue-50/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm text-blue-600 font-mono font-semibold">{p.num}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{p.cliente}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.area}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.instancia}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[p.status]}`}>{statusLabel[p.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">{p.prazo}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgCor[p.urgencia]}`}>
                      {p.urgencia.charAt(0).toUpperCase() + p.urgencia.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom stats + IA metrics ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Docs Gerados IA',    value: '1.247', icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
          { label: 'Assin. Pendentes',   value: '23',    icon: PenTool,     color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
          { label: 'Taxa de Sucesso',     value: '72%',   icon: TrendingUp,  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
          { label: 'Audiências/Mês',      value: '18',    icon: Calendar,    color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-11 h-11 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border ${s.border}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dr. Ben IA Quick Access ──────────────────────────────────── */}
      <div className="rounded-2xl p-5 border border-purple-200 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Acesso Rápido — Agentes Dr. Ben IA</h3>
            <p className="text-xs text-slate-500">Selecione um agente especialista para iniciar</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />10 agentes online
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Petições',          color: '#2563eb', emoji: '⚖️' },
            { label: 'Contratos',         color: '#0891b2', emoji: '📋' },
            { label: 'Análise Processual',color: '#059669', emoji: '🔍' },
            { label: 'Auditoria Fiscal',  color: '#dc2626', emoji: '💰' },
            { label: 'Eng. de Prompts',   color: '#7c3aed', emoji: '🤖' },
          ].map(a => (
            <div key={a.label}
              className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group shadow-sm">
              <span className="text-xl">{a.emoji}</span>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 transition-colors">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function PenTool({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19 7-7 3 3-7 7-3-3z" /><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" /><circle cx="11" cy="11" r="2" />
    </svg>
  );
}
