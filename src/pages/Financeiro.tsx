import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Eye, Download, CreditCard, Banknote, CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const receitaMensal = [
  { mes: 'Set', receita: 85000, despesas: 32000, honorarios: 72000, sucesso: 13000 },
  { mes: 'Out', receita: 92000, despesas: 35000, honorarios: 78000, sucesso: 14000 },
  { mes: 'Nov', receita: 78000, despesas: 28000, honorarios: 65000, sucesso: 13000 },
  { mes: 'Dez', receita: 110000, despesas: 42000, honorarios: 88000, sucesso: 22000 },
  { mes: 'Jan', receita: 96000, despesas: 38000, honorarios: 80000, sucesso: 16000 },
  { mes: 'Fev', receita: 125000, despesas: 45000, honorarios: 103000, sucesso: 22000 },
];

const contratos = [
  { id: 'CT001', cliente: 'Prefeitura SP', tipo: 'mensal', valor: 35000, vencimento: '15/03/2024', status: 'ativo', forma: 'pix' },
  { id: 'CT002', cliente: 'Câmara RJ', tipo: 'mensal', valor: 22000, vencimento: '01/03/2024', status: 'atrasado', forma: 'boleto' },
  { id: 'CT003', cliente: 'TechSol', tipo: 'mensal', valor: 12000, vencimento: '10/03/2024', status: 'ativo', forma: 'pix' },
  { id: 'CT004', cliente: 'Secretaria MG', tipo: 'mensal', valor: 28000, vencimento: '05/03/2024', status: 'ativo', forma: 'transferencia' },
  { id: 'CT005', cliente: 'Fundação Campinas', tipo: 'mensal', valor: 8000, vencimento: '20/03/2024', status: 'ativo', forma: 'boleto' },
  { id: 'CT006', cliente: 'ANEEL', tipo: 'mensal', valor: 18500, vencimento: '12/03/2024', status: 'ativo', forma: 'pix' },
];

const statusCor: Record<string, string> = {
  ativo: 'bg-green-500/20 text-green-400',
  atrasado: 'bg-red-500/20 text-red-400',
  pago: 'bg-blue-500/20 text-blue-400',
  cancelado: 'bg-gray-500/20 text-gray-400',
};

const formaLabel: Record<string, string> = { pix: '💚 PIX', boleto: '📄 Boleto', transferencia: '🏦 Transferência' };

export default function Financeiro() {
  const totalHonorarios = contratos.filter(c => c.status === 'ativo').reduce((s, c) => s + c.valor, 0);
  const totalAtrasado = contratos.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><DollarSign size={24} className="text-green-400" />Financeiro Corporativo</h1>
          <p className="text-gray-500 text-sm mt-0.5">Contratos, honorários, recebíveis, PIX/Boleto, conciliação</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={14} />Gerar Cobrança
          </button>
          <button className="flex items-center gap-2 bg-blue-900/30 text-blue-400 border border-blue-900/40 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-900/50 transition-colors">
            <Download size={14} />DRE
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Receita Fev/2024', value: 'R$ 125.000', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
          { label: 'A Receber (Mês)', value: `R$ ${totalHonorarios.toLocaleString('pt-BR')}`, icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Inadimplente', value: `R$ ${totalAtrasado.toLocaleString('pt-BR')}`, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
          { label: 'Margem Líquida', value: '64%', icon: BarChart3, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`${k.bg} border ${k.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={k.color} />
                <span className="text-xs text-gray-500">{k.label}</span>
              </div>
              <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-green-400" />Receita vs Despesas — 6 meses</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={receitaMensal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a30" />
            <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}K`} />
            <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid #1e3a8a', borderRadius: 8, color: '#e2e8f0' }}
              formatter={(v: number | undefined) => [`R$ ${(v ?? 0).toLocaleString('pt-BR')}`, '']} />
            <Bar dataKey="honorarios" fill="#2563eb" name="Honorários Fixos" radius={[3, 3, 0, 0]} />
            <Bar dataKey="sucesso" fill="#10b981" name="Êxito" radius={[3, 3, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contratos / Recebíveis */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
          <Banknote size={16} className="text-green-400" />
          <span className="font-semibold text-gray-200 text-sm">Contratos & Recebíveis — Março/2024</span>
          {totalAtrasado > 0 && (
            <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
              ⚠ R$ {totalAtrasado.toLocaleString('pt-BR')} em atraso
            </span>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Cliente', 'Tipo', 'Valor', 'Vencimento', 'Forma', 'Status', 'Ações'].map(h => (
                <th key={h} className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contratos.map(c => (
              <tr key={c.id} className="border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-200">{c.cliente}</td>
                <td className="px-4 py-3 text-sm text-gray-400 capitalize">{c.tipo}</td>
                <td className="px-4 py-3 text-sm font-bold text-green-400">R$ {c.valor.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{c.vencimento}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{formaLabel[c.forma]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCor[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {c.status === 'atrasado' && (
                      <button className="text-xs bg-orange-600/20 text-orange-400 border border-orange-600/30 px-2 py-1 rounded hover:bg-orange-600/30 transition-colors">
                        Cobrar
                      </button>
                    )}
                    <button className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors">
                      Recibo
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-blue-900/30 flex justify-end">
          <div className="text-sm font-bold text-green-400">
            Total a Receber: R$ {totalHonorarios.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
}
