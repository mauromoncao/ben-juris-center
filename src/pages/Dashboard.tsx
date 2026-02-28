import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Gavel, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign,
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
  { name: 'Tributário',     value: 35, color: '#D4A017' },
  { name: 'Administrativo', value: 28, color: '#0f2044' },
  { name: 'Civil',          value: 20, color: '#00b37e' },
  { name: 'Trabalhista',    value: 12, color: '#f59e0b' },
  { name: 'Previdenciário', value:  5, color: '#e11d48' },
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
  critico: 'badge-urgente',
  alta:    'badge-alta',
  media:   'badge-media',
  baixa:   'badge-baixa',
};
const statusCor: Record<string, string> = {
  ativo:            'badge-navy',
  recurso:          'badge-amber',
  recurso_especial: 'badge-violet',
};
const statusLabel: Record<string, string> = {
  ativo: 'Ativo', recurso: 'Recurso', recurso_especial: 'Rec. Especial',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ── Header – padrão Ben Growth ─────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif" style={{ letterSpacing: '-0.01em' }}>Dashboard Executivo</h1>
          <p className="text-slate-500 text-sm mt-1 font-sans">Gestão Jurídica · Operações · Setor Público · Processos · Financeiro</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border" style={{ background: 'rgba(0,179,126,0.10)', borderColor: 'rgba(0,179,126,0.35)', color: '#00b37e', fontSize: '0.75rem', fontWeight: 500 }}>
            <CheckCircle size={12} />
            <span className="font-sans">CNJ Conectado</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border font-sans"
            style={{ background: 'rgba(212,160,23,0.08)', borderColor: 'rgba(212,160,23,0.30)', color: '#92700a', fontSize: '0.75rem', fontWeight: 500 }}>
            <Brain size={12} />
            <span>Dr. Ben IA Ativo</span>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Activity size={14} />
            Acionar Agente
          </button>
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
          const kpiClass: Record<string, { card: string; icon: string; iconColor: string }> = {
            blue:   { card: 'kpi-navy',    icon: 'icon-navy',    iconColor: '#0f2044' },
            red:    { card: 'kpi-crimson', icon: 'icon-crimson', iconColor: '#e11d48' },
            green:  { card: 'kpi-emerald', icon: 'icon-emerald', iconColor: '#00b37e' },
            purple: { card: 'kpi-gold',    icon: 'icon-gold',    iconColor: '#C8960E' },
          };
          const k = kpiClass[card.color];
          return (
            <div key={card.label} className={k.card}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium font-sans">{card.label}</p>
                  <p className="text-2xl font-bold mt-1 font-serif" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>{card.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5 font-sans">{card.sub}</p>
                </div>
                <div className={k.icon}>
                  <Icon size={22} style={{ color: k.iconColor }} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {card.up
                  ? <TrendingUp size={14} style={{ color: '#00b37e' }} />
                  : <TrendingDown size={14} style={{ color: '#e11d48' }} />}
                <span className="text-sm font-medium font-sans" style={{ color: card.up ? '#00b37e' : '#e11d48' }}>{card.change}</span>
                <span className="text-slate-400 text-xs font-sans">vs. mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Módulos rápidos ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Gestão Jurídica',  icon: Scale,     color: '#0f2044', bg: '' },
          { label: 'Operações',        icon: Activity,  color: '#1e3470', bg: '' },
          { label: 'Setor Público',    icon: Building2, color: '#007a6a', bg: '' },
          { label: 'Processos',        icon: Gavel,     color: '#00917a', bg: '' },
          { label: 'Financeiro',       icon: DollarSign,color: '#C8960E', bg: '' },
          { label: 'Dr. Ben IA',       icon: Brain,     color: '#be123c', bg: '' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label}
              className="rounded-xl p-4 cursor-pointer text-white hover:shadow-lg hover:-translate-y-0.5 transition-all text-center group shadow-md"
              style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)` }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110 bg-white/15">
                <Icon size={20} className="text-white" />
              </div>
              <div className="text-xs font-bold text-white/95 leading-tight">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Alertas Críticos ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b flex items-center gap-2"
          style={{ background: '#0f2044', borderColor: 'rgba(255,255,255,0.08)' }}>
          <AlertTriangle size={16} style={{ color: '#e11d48' }} />
          <span className="font-bold text-white text-sm font-sans">Alertas & Prazos Críticos</span>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(225,29,72,0.20)', color: '#fca5a5', border: '1px solid rgba(225,29,72,0.40)' }}>
            5 alertas
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {alertas.map((a, i) => {
            const Icon = a.icon;
            const styles: Record<string, { row: string; icon: string; badge: string }> = {
              danger:  { row: 'border-l-4 hover:bg-red-50/60',    icon: '#e11d48', badge: 'bg-red-50 text-red-700 border border-red-200' },
              warning: { row: 'border-l-4 hover:bg-amber-50/60',  icon: '#f59e0b', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
              info:    { row: 'border-l-4 hover:bg-blue-50/40',   icon: '#1e3470', badge: 'badge-navy' },
            };
            const borderCol: Record<string, string> = { danger: '#e11d48', warning: '#f59e0b', info: '#1e3470' };
            const s = styles[a.tipo];
            return (
              <div key={i} className={`flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer ${s.row}`}
                style={{ borderLeftColor: borderCol[a.tipo] }}>
                <Icon size={15} style={{ color: s.icon, flexShrink: 0 }} />
                <span className="text-sm text-slate-700 flex-1 font-sans">{a.msg}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold font-sans ${s.badge}`}>{a.area}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue */}
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm flex items-center gap-2 font-sans" style={{ color: '#0f2044' }}>
              <TrendingUp size={16} style={{ color: '#00b37e' }} />Receita vs Despesas
            </span>
            <span className="text-xs font-sans px-2 py-1 rounded-lg border" style={{ color: '#92700a', background: 'rgba(212,160,23,0.08)', borderColor: 'rgba(212,160,23,0.30)' }}>Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0f2044" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#0f2044" stopOpacity={0} />
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
              <Area type="monotone" dataKey="receita" stroke="#0f2044" strokeWidth={2.5} fill="url(#rec)" name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2.5} fill="url(#desp)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card">
          <div className="font-bold text-sm flex items-center gap-2 mb-4 font-sans" style={{ color: '#0f2044' }}>
            <Scale size={16} style={{ color: '#D4A017' }} />Processos por Área
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
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-sm flex items-center gap-2 font-sans" style={{ color: '#0f2044' }}>
            <Building2 size={16} style={{ color: '#D4A017' }} />Distribuição Setor Público
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
                <Cell key={i} fill={['#0f2044','#D4A017','#00b37e','#f59e0b','#e11d48','#1e3470'][i % 6]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Processos Urgentes ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ background: '#0f2044', borderColor: 'rgba(255,255,255,0.08)' }}>
          <Gavel size={16} style={{ color: '#D4A017' }} />
          <span className="font-bold text-white text-sm font-sans">Processos em Andamento — Mais Urgentes</span>
          <span className="ml-auto text-xs font-semibold cursor-pointer font-sans" style={{ color: '#D4A017' }}>Ver todos →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Nº Processo','Cliente','Área','Instância','Status','Próx. Prazo','Urgência'].map(h => (
                  <th key={h} className="text-xs font-bold uppercase px-4 py-3 text-left font-sans" style={{ background: 'rgba(15,32,68,0.04)', color: '#0f2044', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processosList.map((p, i) => (
                <tr key={i} className="border-t border-slate-100 hover:bg-amber-50/40 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm font-mono font-bold" style={{ color: '#0f2044' }}>{p.num}</td>
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
          { label: 'Docs Gerados IA',  value: '1.247', icon: FileText,   kpi: 'kpi-violet', ico: 'icon-violet', icolor: '#7c3aed' },
          { label: 'Assin. Pendentes', value: '23',    icon: PenTool,   kpi: 'kpi-amber',  ico: 'icon-amber',  icolor: '#f59e0b' },
          { label: 'Taxa de Sucesso',  value: '72%',   icon: TrendingUp,kpi: 'kpi-emerald',ico: 'icon-emerald',icolor: '#00b37e' },
          { label: 'Audiências/Mês',   value: '18',    icon: Calendar,  kpi: 'kpi-gold',   ico: 'icon-gold',   icolor: '#C8960E' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.kpi} flex items-center gap-4`}>
              <div className={s.ico}><Icon size={22} style={{ color: s.icolor }} /></div>
              <div>
                <div className="text-2xl font-bold font-serif" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 font-sans mt-0.5">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Dr. Ben IA Quick Access ──────────────────────────────────── */}
      <div className="rounded-2xl p-5 shadow-md" style={{ background: '#0f2044' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #C8960E, #F0C040)', border: '1px solid rgba(212,160,23,0.50)' }}>
            <Brain size={20} style={{ color: '#0f2044' }} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-serif" style={{ letterSpacing: '-0.01em' }}>Acesso Rápido — Agentes Dr. Ben IA</h3>
            <p className="text-xs font-sans" style={{ color: 'rgba(159,176,215,0.80)' }}>Selecione um agente especialista para iniciar</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold font-sans" style={{ color: '#00d4a0' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />10 agentes online
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Petições',          color: '#D4A017', bg: 'rgba(212,160,23,0.15)', emoji: '⚖️' },
            { label: 'Contratos',         color: '#00d4a0', bg: 'rgba(0,212,160,0.15)',  emoji: '📋' },
            { label: 'Análise Processual',color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', emoji: '🔍' },
            { label: 'Auditoria Fiscal',  color: '#fb923c', bg: 'rgba(251,146,60,0.15)', emoji: '💰' },
            { label: 'Eng. de Prompts',   color: '#c084fc', bg: 'rgba(192,132,252,0.15)',emoji: '🤖' },
          ].map(a => (
            <div key={a.label}
              className="rounded-xl p-3 flex items-center gap-2 cursor-pointer transition-all group"
              style={{ background: a.bg, border: `1px solid ${a.color}40` }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = a.color; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 14px ${a.color}35`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${a.color}40`; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
              <span className="text-xl">{a.emoji}</span>
              <span className="text-xs font-bold font-sans" style={{ color: a.color }}>{a.label}</span>
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
