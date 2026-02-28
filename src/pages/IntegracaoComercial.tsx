import React from 'react';
import { Link2, ArrowRight, TrendingUp, DollarSign, Users, CheckCircle, Zap, Activity } from 'lucide-react';

const leads = [
  { nome: 'Prefeitura de Osasco', origem: 'Instagram DM', score: 87, status: 'convertido', valor: 18000, data: '15/02/2024' },
  { nome: 'Hospital Municipal ABC', origem: 'Site', score: 72, status: 'proposta', valor: 25000, data: '20/02/2024' },
  { nome: 'Câmara de Sorocaba', origem: 'WhatsApp', score: 91, status: 'convertido', valor: 14000, data: '22/02/2024' },
  { nome: 'Construtora Horizonte', origem: 'Indicação', score: 65, status: 'negociacao', valor: 12000, data: '25/02/2024' },
  { nome: 'Secretaria Educação CE', origem: 'Instagram DM', score: 78, status: 'proposta', valor: 20000, data: '27/02/2024' },
];

const statusCor: Record<string, string> = {
  convertido: 'bg-green-500/20 text-green-400 border-green-500/30',
  proposta: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  negociacao: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function IntegracaoComercial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Link2 size={24} className="text-blue-400" />Integração Comercial</h1>
        <p className="text-gray-500 text-sm mt-0.5">Ben Growth Center ↔ Lex Jurídico — Sincronização de leads e contratos</p>
      </div>

      {/* Status integração */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">Ben Growth Center</div>
            <div className="text-xs text-gray-400">CRM Comercial</div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30 font-medium">
              <Activity size={12} className="animate-pulse" />API Ativa
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-green-500 to-purple-500"></div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">Lex Jurídico</div>
            <div className="text-xs text-gray-400">Plataforma Jurídica</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Leads Sincronizados', value: '48', icon: Users },
            { label: 'Propostas → Contratos', value: '12', icon: CheckCircle },
            { label: 'Receita via CRM', value: 'R$ 156K', icon: DollarSign },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[#0f1623]/40 rounded-lg p-3 text-center border border-blue-900/20">
                <Icon size={18} className="text-blue-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads convertidos */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="font-semibold text-gray-200 text-sm">Leads Recentes — Ben Growth Center</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Cliente/Lead', 'Origem', 'Score IA', 'Status', 'Valor/Mês', 'Data', 'Ação'].map(h => (
                <th key={h} className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={i} className="border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-200">{l.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{l.origem}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${l.score}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold ${l.score >= 80 ? 'text-green-400' : l.score >= 70 ? 'text-blue-400' : 'text-yellow-400'}`}>{l.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusCor[l.status]}`}>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-400">R$ {l.valor.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{l.data}</td>
                <td className="px-4 py-3">
                  {l.status === 'convertido' ? (
                    <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} />Cadastrado</span>
                  ) : (
                    <button className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1 rounded hover:bg-blue-600/30 transition-colors flex items-center gap-1">
                      <ArrowRight size={11} />Converter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fluxo automático */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Fluxo Automático de Integração</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            'Lead no BGC', 'Score Dr. Ben ≥ 70', 'Proposta Aprovada', 'Contrato ZapSign', 'Recebível Asaas', 'Cadastro Lex Jurídico', 'Processo Aberto'
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg px-3 py-2 text-xs text-blue-300 font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight size={14} className="text-gray-600 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
