import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Gavel, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, DollarSign,
  Building2, FileText, Scale, Calendar, Activity, Brain, Target
} from 'lucide-react';

// ─── dados ────────────────────────────────────────────────────────────────────
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
  { name: 'Administrativo', value: 28, color: '#38bdf8' },
  { name: 'Civil',          value: 20, color: '#00b37e' },
  { name: 'Trabalhista',    value: 12, color: '#f59e0b' },
  { name: 'Previdenciário', value:  5, color: '#e11d48' },
];

const setorData = [
  { setor: 'Municípios',  processos: 68 },
  { setor: 'Câmaras',     processos: 42 },
  { setor: 'Secretarias', processos: 37 },
  { setor: 'Empresas',    processos: 55 },
  { setor: 'Fundações',   processos: 24 },
  { setor: 'Autarquias',  processos: 21 },
];

const alertas = [
  { tipo: 'danger',  icon: AlertTriangle, msg: 'Prazo fatal: Processo nº 0001234-55.2024 — vence HOJE 18h',          area: 'Tributário' },
  { tipo: 'danger',  icon: AlertTriangle, msg: 'Prazo fatal: Apelação Cível nº 0009876-44.2023 — vence HOJE',         area: 'Civil' },
  { tipo: 'warning', icon: Clock,         msg: 'D-3: Contestação nº 0004321-66.2024 — vence 03/03',                   area: 'Trabalhista' },
  { tipo: 'warning', icon: Calendar,      msg: 'Audiência amanhã 14h — Fórum Central, Sala 5',                        area: 'Administrativo' },
  { tipo: 'info',    icon: FileText,      msg: 'Nova intimação recebida via DJEN — Processo nº 0007654-11.2024',      area: 'Tributário' },
];

const processosList = [
  { num: '0001234-55.2024', cliente: 'Prefeitura Municipal de SP',  area: 'Tributário',     instancia: '1ª instância', status: 'ativo',            prazo: '28/02', urgencia: 'critico' },
  { num: '0009876-44.2023', cliente: 'Câmara Municipal RJ',         area: 'Administrativo', instancia: '2ª instância', status: 'recurso',          prazo: '05/03', urgencia: 'alta'    },
  { num: '0004321-66.2024', cliente: 'Fundação Educacional SP',     area: 'Trabalhista',    instancia: '1ª instância', status: 'ativo',            prazo: '03/03', urgencia: 'media'   },
  { num: '0007654-11.2024', cliente: 'Secretaria da Saúde MG',      area: 'Administrativo', instancia: 'STJ',          status: 'recurso_especial', prazo: '12/03', urgencia: 'baixa'   },
  { num: '0002345-78.2024', cliente: 'Agência Reguladora Federal',  area: 'Administrativo', instancia: '1ª instância', status: 'ativo',            prazo: '18/03', urgencia: 'baixa'   },
];

// ─── helpers de cor ───────────────────────────────────────────────────────────
const urgMap: Record<string, { bg: string; text: string; label: string }> = {
  critico: { bg: 'rgba(225,29,72,0.20)',   text: '#fca5a5', label: 'Crítico'  },
  alta:    { bg: 'rgba(251,146,60,0.20)',  text: '#fdba74', label: 'Alta'     },
  media:   { bg: 'rgba(234,179,8,0.20)',   text: '#fde047', label: 'Média'    },
  baixa:   { bg: 'rgba(56,189,248,0.15)',  text: '#7dd3fc', label: 'Baixa'    },
};
const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  ativo:            { bg: 'rgba(0,179,126,0.18)',  text: '#6ee7b7', label: 'Ativo'         },
  recurso:          { bg: 'rgba(212,160,23,0.18)', text: '#F0C040', label: 'Recurso'       },
  recurso_especial: { bg: 'rgba(192,132,252,0.20)',text: '#d8b4fe', label: 'Rec. Especial' },
};

// ─── sub-componentes ──────────────────────────────────────────────────────────
function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans"
      style={{ background: bg, color: text }}>
      {label}
    </span>
  );
}

function SectionTitle({ icon: Icon, iconColor, children }: {
  icon: React.ElementType; iconColor: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} style={{ color: iconColor }} />
      <span className="font-bold text-sm font-sans text-white">{children}</span>
    </div>
  );
}

// ─── card de vidro (glass card) ───────────────────────────────────────────────
const glass = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  backdropFilter: 'blur(4px)',
} as React.CSSProperties;

const glassDark = {
  background: 'rgba(0,0,0,0.18)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
} as React.CSSProperties;

// ─── componente principal ─────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 rounded-2xl px-6 py-5"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <div>
          <h1 className="text-2xl font-bold text-white font-serif" style={{ letterSpacing: '-0.01em' }}>
            Dashboard Executivo
          </h1>
          <p className="text-sm mt-1 font-sans" style={{ color: 'rgba(159,176,215,0.85)' }}>
            Gestão Jurídica · Operações · Setor Público · Processos · Financeiro
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(0,179,126,0.18)', border: '1px solid rgba(0,179,126,0.40)', color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 500 }}>
            <CheckCircle size={12} /><span className="font-sans">CNJ Conectado</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: 'rgba(212,160,23,0.18)', border: '1px solid rgba(212,160,23,0.40)', color: '#F0C040', fontSize: '0.75rem', fontWeight: 500 }}>
            <Brain size={12} /><span className="font-sans">Dr. Ben IA Ativo</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-sans transition-all hover:brightness-110 active:scale-95"
            style={{ background: '#D4A017', color: '#0f2044' }}>
            <Activity size={14} />Acionar Agente
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Processos Ativos', value: '247',      icon: Gavel,         change: '+12',  up: true,  accent: '#38bdf8', sub: '18 novas entradas' },
          { label: 'Prazos Críticos',  value: '8',         icon: AlertTriangle, change: '+3',   up: false, accent: '#e11d48', sub: '3 vencem hoje' },
          { label: 'Receita do Mês',   value: 'R$ 125K',   icon: DollarSign,   change: '+23%', up: true,  accent: '#00b37e', sub: 'vs mês anterior' },
          { label: 'Clientes Ativos',  value: '34',        icon: Building2,     change: '+2',   up: true,  accent: '#D4A017', sub: '6 públicos, 28 privados' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ ...glass, borderLeft: `3px solid ${card.accent}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium font-sans" style={{ color: 'rgba(159,176,215,0.80)' }}>{card.label}</p>
                  <p className="text-2xl font-bold mt-1 font-serif text-white" style={{ letterSpacing: '-0.02em' }}>{card.value}</p>
                  <p className="text-xs mt-0.5 font-sans" style={{ color: 'rgba(159,176,215,0.60)' }}>{card.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${card.accent}22` }}>
                  <Icon size={20} style={{ color: card.accent }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {card.up
                  ? <TrendingUp size={13} style={{ color: '#00b37e' }} />
                  : <TrendingDown size={13} style={{ color: '#e11d48' }} />}
                <span className="text-sm font-bold font-sans" style={{ color: card.up ? '#00b37e' : '#e11d48' }}>{card.change}</span>
                <span className="text-xs font-sans" style={{ color: 'rgba(159,176,215,0.55)' }}>vs. mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── MÓDULOS RÁPIDOS ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Gestão Jurídica', icon: Scale,      color: '#38bdf8' },
          { label: 'Operações',       icon: Activity,   color: '#00b37e' },
          { label: 'Setor Público',   icon: Building2,  color: '#a78bfa' },
          { label: 'Processos',       icon: Gavel,      color: '#D4A017' },
          { label: 'Financeiro',      icon: DollarSign, color: '#34d399' },
          { label: 'Dr. Ben IA',      icon: Brain,      color: '#f472b6' },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label}
              className="rounded-xl p-4 cursor-pointer text-center group transition-all hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: `${m.color}1a`, border: `1px solid ${m.color}40` }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${m.color}2a` }}>
                <Icon size={20} style={{ color: m.color }} />
              </div>
              <div className="text-xs font-bold font-sans leading-tight" style={{ color: m.color }}>{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── ALERTAS CRÍTICOS ───────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={glassDark}>
        {/* cabeçalho */}
        <div className="px-5 py-3.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <AlertTriangle size={16} style={{ color: '#e11d48' }} />
          <span className="font-bold text-white text-sm font-sans">Alertas & Prazos Críticos</span>
          <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-sans"
            style={{ background: 'rgba(225,29,72,0.22)', color: '#fca5a5', border: '1px solid rgba(225,29,72,0.40)' }}>
            5 alertas
          </span>
        </div>
        {/* linhas */}
        {alertas.map((a, i) => {
          const Icon = a.icon;
          const cfg: Record<string, { accent: string; areaBg: string; areaColor: string }> = {
            danger:  { accent: '#e11d48', areaBg: 'rgba(225,29,72,0.18)',  areaColor: '#fca5a5' },
            warning: { accent: '#f59e0b', areaBg: 'rgba(245,158,11,0.18)', areaColor: '#fde68a' },
            info:    { accent: '#38bdf8', areaBg: 'rgba(56,189,248,0.15)', areaColor: '#7dd3fc' },
          };
          const c = cfg[a.tipo];
          return (
            <div key={i}
              className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-white/5"
              style={{ borderBottom: i < alertas.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                       borderLeft: `3px solid ${c.accent}` }}>
              <Icon size={15} style={{ color: c.accent, flexShrink: 0 }} />
              <span className="text-sm flex-1 font-sans text-white/85">{a.msg}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold font-sans flex-shrink-0"
                style={{ background: c.areaBg, color: c.areaColor }}>{a.area}</span>
            </div>
          );
        })}
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Receita vs Despesas */}
        <div className="md:col-span-2 rounded-2xl p-5" style={glass}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-sm flex items-center gap-2 font-sans text-white">
              <TrendingUp size={16} style={{ color: '#00b37e' }} />Receita vs Despesas
            </span>
            <span className="text-xs font-sans px-2 py-1 rounded-lg"
              style={{ color: '#F0C040', background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.30)' }}>
              Últimos 6 meses
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="desp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e11d48" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(159,176,215,0.70)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(159,176,215,0.70)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: '#0f2044', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#fff' }}
                formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toLocaleString('pt-BR')}`, '']} />
              <Area type="monotone" dataKey="receita" stroke="#38bdf8" strokeWidth={2.5} fill="url(#rec)"  name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#e11d48" strokeWidth={2.5} fill="url(#desp)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — Processos por Área */}
        <div className="rounded-2xl p-5" style={glass}>
          <SectionTitle icon={Scale} iconColor="#D4A017">Processos por Área</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={areaData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                {areaData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f2044', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff' }}
                formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {areaData.map(a => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="flex-1 font-sans" style={{ color: 'rgba(159,176,215,0.80)' }}>{a.name}</span>
                <span className="font-bold text-white">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BAR — Setor Público ─────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={glass}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-sm flex items-center gap-2 font-sans text-white">
            <Building2 size={16} style={{ color: '#D4A017' }} />Distribuição Setor Público
          </span>
          <span className="text-xs font-sans" style={{ color: 'rgba(159,176,215,0.60)' }}>Processos por segmento</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={setorData} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="setor" tick={{ fill: 'rgba(159,176,215,0.70)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(159,176,215,0.70)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0f2044', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff' }} />
            <Bar dataKey="processos" radius={[6, 6, 0, 0]}>
              {setorData.map((_, i) => (
                <Cell key={i} fill={['#D4A017','#38bdf8','#00b37e','#f59e0b','#e11d48','#a78bfa'][i % 6]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── TABELA — Processos Urgentes ─────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={glassDark}>
        {/* header */}
        <div className="px-5 py-3.5 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Gavel size={16} style={{ color: '#D4A017' }} />
          <span className="font-bold text-white text-sm font-sans">Processos em Andamento — Mais Urgentes</span>
          <span className="ml-auto text-xs font-semibold cursor-pointer font-sans" style={{ color: '#D4A017' }}>
            Ver todos →
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Nº Processo', 'Cliente', 'Área', 'Instância', 'Status', 'Próx. Prazo', 'Urgência'].map(h => (
                  <th key={h} className="text-xs font-bold uppercase px-4 py-3 text-left font-sans"
                    style={{ color: 'rgba(159,176,215,0.70)', letterSpacing: '0.07em', background: 'rgba(0,0,0,0.15)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processosList.map((p, i) => {
                const urg = urgMap[p.urgencia] ?? urgMap['baixa'];
                const sta = statusMap[p.status]  ?? statusMap['ativo'];
                return (
                  <tr key={i}
                    className="transition-colors cursor-pointer hover:bg-white/5"
                    style={{ borderBottom: i < processosList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <td className="px-4 py-3 text-sm font-mono font-bold" style={{ color: '#38bdf8' }}>{p.num}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white font-sans">{p.cliente}</td>
                    <td className="px-4 py-3 text-sm font-sans" style={{ color: 'rgba(159,176,215,0.80)' }}>{p.area}</td>
                    <td className="px-4 py-3 text-sm font-sans" style={{ color: 'rgba(159,176,215,0.80)' }}>{p.instancia}</td>
                    <td className="px-4 py-3">
                      <Badge bg={sta.bg} text={sta.text} label={sta.label} />
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-white font-sans">{p.prazo}</td>
                    <td className="px-4 py-3">
                      <Badge bg={urg.bg} text={urg.text} label={urg.label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── KPI BOTTOM ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Docs Gerados IA',  value: '1.247', icon: FileText,   accent: '#a78bfa' },
          { label: 'Assin. Pendentes', value: '23',    icon: PenTool,    accent: '#f59e0b' },
          { label: 'Taxa de Sucesso',  value: '72%',   icon: Target,     accent: '#00b37e' },
          { label: 'Audiências/Mês',   value: '18',    icon: Calendar,   accent: '#D4A017' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 flex items-center gap-4"
              style={{ ...glass, borderLeft: `3px solid ${s.accent}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.accent}22` }}>
                <Icon size={20} style={{ color: s.accent }} />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-white" style={{ letterSpacing: '-0.02em' }}>{s.value}</div>
                <div className="text-xs font-semibold font-sans mt-0.5" style={{ color: 'rgba(159,176,215,0.70)' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DR. BEN IA — ACESSO RÁPIDO ─────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #C8960E, #F0C040)', border: '1px solid rgba(212,160,23,0.50)' }}>
            <Brain size={20} style={{ color: '#0f2044' }} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-serif" style={{ letterSpacing: '-0.01em' }}>
              Acesso Rápido — Agentes Dr. Ben IA
            </h3>
            <p className="text-xs font-sans mt-0.5" style={{ color: 'rgba(159,176,215,0.75)' }}>
              Selecione um agente especialista para iniciar
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold font-sans" style={{ color: '#6ee7b7' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            10 agentes online
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Petições',           color: '#D4A017', emoji: '⚖️' },
            { label: 'Contratos',          color: '#00b37e', emoji: '📋' },
            { label: 'Análise Processual', color: '#38bdf8', emoji: '🔍' },
            { label: 'Auditoria Fiscal',   color: '#f59e0b', emoji: '💰' },
            { label: 'Eng. de Prompts',    color: '#c084fc', emoji: '🤖' },
          ].map(a => (
            <div key={a.label}
              className="rounded-xl p-3 flex items-center gap-2.5 cursor-pointer transition-all group hover:brightness-125"
              style={{ background: `${a.color}18`, border: `1px solid ${a.color}35` }}>
              <span className="text-xl">{a.emoji}</span>
              <span className="text-xs font-bold font-sans" style={{ color: a.color }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── ícone PenTool inline ─────────────────────────────────────────────────────
function PenTool({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}
