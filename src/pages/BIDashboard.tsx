import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Gavel, Clock, Users, CheckCircle, Activity, Target } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts';

const receitaCliente = [
  { cliente: 'Prefeitura SP', receita: 35000, processos: 47 },
  { cliente: 'Secretaria MG', receita: 28000, processos: 31 },
  { cliente: 'Câmara RJ', receita: 22000, processos: 23 },
  { cliente: 'ANEEL', receita: 18500, processos: 19 },
  { cliente: 'TechSol', receita: 12000, processos: 8 },
  { cliente: 'Fundação', receita: 8000, processos: 5 },
];

const slaData = [
  { mes: 'Set', cumprido: 94, descumprido: 6 },
  { mes: 'Out', cumprido: 97, descumprido: 3 },
  { mes: 'Nov', cumprido: 91, descumprido: 9 },
  { mes: 'Dez', cumprido: 96, descumprido: 4 },
  { mes: 'Jan', cumprido: 98, descumprido: 2 },
  { mes: 'Fev', cumprido: 95, descumprido: 5 },
];

const producaoAdv = [
  { nome: 'Mauro Monção', area: 'Sócio-Diretor', processos: 247, pareceres: 34, honorarios: 125000, taxa_sucesso: 72 },
];

const areaDistrib = [
  { name: 'Tributário', value: 35, color: '#2563eb' },
  { name: 'Administrativo', value: 28, color: '#7c3aed' },
  { name: 'Civil', value: 20, color: '#059669' },
  { name: 'Trabalhista', value: 12, color: '#d97706' },
  { name: 'Previdenciário', value: 5, color: '#dc2626' },
];

const instanciaData = [
  { instancia: '1ª Inst.', processos: 142 },
  { instancia: '2ª Inst.', processos: 67 },
  { instancia: 'TRF/TRT', processos: 23 },
  { instancia: 'STJ', processos: 11 },
  { instancia: 'STF', processos: 4 },
];

export default function BIDashboard() {
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'ano'>('mes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}><BarChart3 size={24} className="text-blue-400" />BI & Dashboards Executivos</h1>
          <p className="text-slate-500 text-sm mt-0.5">Receita, SLA, produtividade, instâncias e sucesso</p>
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(['mes', 'trimestre', 'ano'] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${periodo === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
              {p === 'mes' ? 'Mês' : p === 'trimestre' ? 'Trimestre' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Receita Fev/24', v: 'R$ 125K', icon: DollarSign, c: '#00b37e', delta: '+23%', up: true },
          { l: 'Taxa de Sucesso', v: '72%', icon: Target, c: '#0f2044', delta: '+4%', up: true },
          { l: 'SLA Cumprido', v: '95%', icon: Clock, c: '#D4A017', delta: '-3%', up: false },
          { l: 'Processos Ativos', v: '247', icon: Gavel, c: '#7c3aed', delta: '+12', up: true },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.l} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={k.c} />
                <span className="text-xs text-slate-500">{k.l}</span>
              </div>
              <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${k.up ? '#00b37e' : '#e11d48'}`}>
                {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{k.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receita por Cliente */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Receita por Cliente</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={receitaCliente} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a30" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}K`} />
              <YAxis type="category" dataKey="cliente" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8, color: '#e2e8f0' }}
                formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toLocaleString('pt-BR')}`, 'Honorários']} />
              <Bar dataKey="receita" fill="#2563eb" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Área */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Processos por Área Jurídica</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={areaDistrib} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {areaDistrib.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8 }}
                  formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {areaDistrib.map(a => (
                <div key={a.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                  <span className="text-xs text-slate-500 flex-1">{a.name}</span>
                  <span className="text-xs font-semibold text-slate-800">{a.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLA */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Performance SLA — 6 meses (%)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={slaData}>
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a30" />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} domain={[80, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8 }}
                formatter={(v: number | undefined) => [`${v ?? 0}%`, '']} />
              <Area type="monotone" dataKey="cumprido" stroke="#10b981" strokeWidth={2} fill="url(#slaGrad)" name="SLA Cumprido" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Por instância */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Processos por Instância</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={instanciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a30" />
              <XAxis dataKey="instancia" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8 }} />
              <Bar dataKey="processos" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Processos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtividade */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <span className="font-semibold text-slate-800 text-sm flex items-center gap-2"><Users size={16} className="text-blue-400" />Produtividade — Equipe Jurídica</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Advogado', 'Cargo', 'Processos', 'Pareceres', 'Honorários Gerados', 'Taxa Sucesso'].map(h => (
                <th key={h} className="bg-white/60 table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {producaoAdv.map(a => (
              <tr key={a.nome} className="border-t border-slate-100">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{a.nome}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{a.area}</td>
                <td className="px-4 py-3 text-sm font-bold text-white">{a.processos}</td>
                <td className="px-4 py-3 text-sm font-bold text-white">{a.pareceres}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-400">R$ {a.honorarios.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${a.taxa_sucesso}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-green-400">{a.taxa_sucesso}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
