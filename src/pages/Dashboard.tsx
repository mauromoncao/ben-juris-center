import React from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Gavel, Clock, AlertTriangle, CheckCircle, TrendingUp, DollarSign,
  Users, FileText, Scale, Calendar, ArrowUp, ArrowDown, Activity,
  Building2, Zap, Shield, BarChart3
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
  { name: 'Tributário', value: 35, color: '#2563eb' },
  { name: 'Administrativo', value: 28, color: '#7c3aed' },
  { name: 'Civil', value: 20, color: '#059669' },
  { name: 'Trabalhista', value: 12, color: '#d97706' },
  { name: 'Previdenciário', value: 5, color: '#dc2626' },
];

const prazosData = [
  { dia: 'Seg', criticos: 2, normais: 5 },
  { dia: 'Ter', criticos: 1, normais: 8 },
  { dia: 'Qua', criticos: 4, normais: 3 },
  { dia: 'Qui', criticos: 0, normais: 6 },
  { dia: 'Sex', criticos: 3, normais: 4 },
  { dia: 'Sáb', criticos: 1, normais: 2 },
];

const alertas = [
  { tipo: 'danger', icon: AlertTriangle, msg: 'Prazo fatal: Processo nº 0001234-55.2024 — vence HOJE 18h', area: 'Tributário' },
  { tipo: 'danger', icon: AlertTriangle, msg: 'Prazo fatal: Apelação Cível nº 0009876-44.2023 — vence HOJE', area: 'Civil' },
  { tipo: 'warning', icon: Clock, msg: 'D-3: Contestação nº 0004321-66.2024 — vence 03/03', area: 'Trabalhista' },
  { tipo: 'warning', icon: Calendar, msg: 'Audiência amanhã 14h — Fórum Central, Sala 5', area: 'Administrativo' },
  { tipo: 'info', icon: FileText, msg: 'Nova intimação recebida via DJEN — Processo nº 0007654-11.2024', area: 'Tributário' },
];

const processosList = [
  { num: '0001234-55.2024', cliente: 'Prefeitura Municipal de SP', area: 'Tributário', instancia: '1ª instância', status: 'ativo', prazo: '28/02', urgencia: 'critico' },
  { num: '0009876-44.2023', cliente: 'Câmara Municipal RJ', area: 'Administrativo', instancia: '2ª instância', status: 'recurso', prazo: '05/03', urgencia: 'alta' },
  { num: '0004321-66.2024', cliente: 'Fundação Educacional SP', area: 'Trabalhista', instancia: '1ª instância', status: 'ativo', prazo: '03/03', urgencia: 'media' },
  { num: '0007654-11.2024', cliente: 'Secretaria Saúde MG', area: 'Administrativo', instancia: 'STJ', status: 'recurso_especial', prazo: '12/03', urgencia: 'baixa' },
  { num: '0002345-78.2024', cliente: 'Agência Reguladora Federal', area: 'Administrativo', instancia: '1ª instância', status: 'ativo', prazo: '18/03', urgencia: 'baixa' },
];

const urgCor: Record<string, string> = {
  critico: 'bg-red-500/20 text-red-400 border-red-500/30',
  alta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  media: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  baixa: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusCor: Record<string, string> = {
  ativo: 'bg-blue-500/20 text-blue-400',
  recurso: 'bg-purple-500/20 text-purple-400',
  recurso_especial: 'bg-indigo-500/20 text-indigo-400',
};

const statusLabel: Record<string, string> = {
  ativo: 'Ativo',
  recurso: 'Recurso',
  recurso_especial: 'Rec. Especial',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Executivo</h1>
          <p className="text-gray-500 text-sm mt-0.5">Lex Jurídico — Plataforma Corporativa | {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30 font-medium">
            <CheckCircle size={12} />Sistema Operacional
          </span>
          <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-full border border-blue-500/30 font-medium">
            <Activity size={12} />CNJ Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Processos Ativos', value: '247', icon: Gavel, change: '+12', up: true, color: 'blue', sub: '18 novas entradas' },
          { label: 'Prazos Críticos', value: '8', icon: AlertTriangle, change: '+3', up: false, color: 'red', sub: '3 vencem hoje' },
          { label: 'Receita do Mês', value: 'R$ 125K', icon: DollarSign, change: '+23%', up: true, color: 'green', sub: 'vs mês anterior' },
          { label: 'Clientes Ativos', value: '34', icon: Building2, change: '+2', up: true, color: 'purple', sub: '6 públicos, 28 privados' },
        ].map(card => {
          const Icon = card.icon;
          const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: 'text-blue-500' },
            red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: 'text-red-500' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: 'text-green-500' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'text-purple-500' },
          };
          const c = colors[card.color];
          return (
            <div key={card.label} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${card.up ? 'text-green-400' : 'text-red-400'}`}>
                  {card.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{card.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
              <div className={`text-xs mt-1 ${c.text}`}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Alertas Críticos */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="font-semibold text-gray-200 text-sm">Alertas & Prazos Críticos</span>
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">5 alertas</span>
        </div>
        <div className="divide-y divide-blue-900/20">
          {alertas.map((a, i) => {
            const Icon = a.icon;
            const colors: Record<string, string> = {
              danger: 'text-red-400',
              warning: 'text-yellow-400',
              info: 'text-blue-400',
            };
            const bgColors: Record<string, string> = {
              danger: 'bg-red-500/10 border-l-2 border-l-red-500',
              warning: 'bg-yellow-500/10 border-l-2 border-l-yellow-500',
              info: 'bg-blue-500/10 border-l-2 border-l-blue-500',
            };
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${bgColors[a.tipo]}`}>
                <Icon size={15} className={colors[a.tipo]} />
                <span className="text-sm text-gray-300 flex-1">{a.msg}</span>
                <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full border border-blue-900/40">{a.area}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="md:col-span-2 bg-[#1a2744] border border-blue-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-200 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-green-400" />Receita vs Despesas</span>
            <span className="text-xs text-gray-500">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="desp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a30" />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}K`} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toLocaleString('pt-BR')}`, '']} />
              <Area type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2} fill="url(#rec)" name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#ef4444" strokeWidth={2} fill="url(#desp)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Areas */}
        <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-200 text-sm flex items-center gap-2"><Scale size={16} className="text-blue-400" />Processos por Área</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={areaData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {areaData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8 }}
                formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {areaData.map(a => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-gray-400 flex-1">{a.name}</span>
                <span className="font-semibold text-gray-200">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processos Recentes */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
          <Gavel size={16} className="text-blue-400" />
          <span className="font-semibold text-gray-200 text-sm">Processos em Andamento — Mais Urgentes</span>
          <span className="ml-auto text-xs text-gray-500 hover:text-blue-400 cursor-pointer transition-colors">Ver todos →</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Nº Processo</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Cliente</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Área</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Instância</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Status</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Próximo Prazo</th>
                <th className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">Urgência</th>
              </tr>
            </thead>
            <tbody>
              {processosList.map((p, i) => (
                <tr key={i} className="border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-sm text-blue-400 font-mono">{p.num}</td>
                  <td className="px-4 py-3 text-sm text-gray-200 font-medium">{p.cliente}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.area}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.instancia}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[p.status]}`}>{statusLabel[p.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-300">{p.prazo}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urgCor[p.urgencia]}`}>
                      {p.urgencia.charAt(0).toUpperCase() + p.urgencia.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Documentos Gerados', value: '1.247', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Assinaturas Pendentes', value: '23', icon: PenTool, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Taxa de Sucesso', value: '72%', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Audiências este Mês', value: '18', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Missing import
function PenTool({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
}
