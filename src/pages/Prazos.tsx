import React, { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar, Bell, Filter, Plus, Eye, X } from 'lucide-react';

type NivelPrazo = 'fatal' | 'd1' | 'd3' | 'd5' | 'normal';

interface Prazo {
  id: string;
  processo: string;
  cliente: string;
  descricao: string;
  data_vencimento: string;
  nivel: NivelPrazo;
  responsavel: string;
  area: string;
  conferido: boolean;
}

const NIVEL: Record<NivelPrazo, { label: string; color: string; bg: string }> = {
  fatal: { label: 'D-0 FATAL', color: 'text-red-400', bg: 'bg-red-500/10 border-l-4 border-l-red-500' },
  d1: { label: 'D-1', color: 'text-orange-400', bg: 'bg-orange-500/10 border-l-4 border-l-orange-500' },
  d3: { label: 'D-3', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-l-4 border-l-yellow-500' },
  d5: { label: 'D-5', color: 'text-blue-400', bg: 'bg-blue-500/10 border-l-4 border-l-blue-400' },
  normal: { label: 'Normal', color: 'text-gray-400', bg: '' },
};

const prazos: Prazo[] = [
  { id: 'PZ001', processo: '0001234-55.2024.8.26.0100', cliente: 'Prefeitura SP', descricao: 'Manifestação sobre conclusão para sentença', data_vencimento: '2024-02-28', nivel: 'fatal', responsavel: 'Mauro Monção', area: 'Tributário', conferido: false },
  { id: 'PZ002', processo: '0009876-44.2023.8.19.0001', cliente: 'Câmara RJ', descricao: 'Interposição de Recurso Especial', data_vencimento: '2024-02-29', nivel: 'd1', responsavel: 'Mauro Monção', area: 'Administrativo', conferido: false },
  { id: 'PZ003', processo: '0004321-66.2024.5.15.0001', cliente: 'Fundação Campinas', descricao: 'Contestação à reclamação trabalhista', data_vencimento: '2024-03-03', nivel: 'd3', responsavel: 'Mauro Monção', area: 'Trabalhista', conferido: true },
  { id: 'PZ004', processo: '0002345-78.2024.1.00.0001', cliente: 'ANEEL', descricao: 'Juntar documentos complementares — ADPF', data_vencimento: '2024-03-05', nivel: 'd5', responsavel: 'Mauro Monção', area: 'Constitucional', conferido: false },
  { id: 'PZ005', processo: '0007123-90.2024.8.26.0100', cliente: 'Secretaria MG', descricao: 'Apresentação de alegações finais', data_vencimento: '2024-03-12', nivel: 'normal', responsavel: 'Mauro Monção', area: 'Administrativo', conferido: false },
  { id: 'PZ006', processo: '0005678-33.2024.8.26.0100', cliente: 'TechSol', descricao: 'Réplica ao recurso do réu', data_vencimento: '2024-03-18', nivel: 'normal', responsavel: 'Mauro Monção', area: 'Civil', conferido: false },
];

export default function Prazos() {
  const [lista, setLista] = useState<Prazo[]>(prazos);

  const toggleConferido = (id: string) => {
    setLista(prev => prev.map(p => p.id === id ? { ...p, conferido: !p.conferido } : p));
  };

  const criticos = lista.filter(p => ['fatal', 'd1'].includes(p.nivel));
  const atencao = lista.filter(p => ['d3', 'd5'].includes(p.nivel));
  const normais = lista.filter(p => p.nivel === 'normal');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Clock size={24} className="text-red-400" />Prazos & Controle</h1>
          <p className="text-gray-500 text-sm mt-0.5">Contagem automática, alertas D-5/D-3/D-1, dupla conferência</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Adicionar Prazo
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'FATAIS (Hoje)', value: lista.filter(p => p.nivel === 'fatal').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
          { label: 'D-1 (Amanhã)', value: lista.filter(p => p.nivel === 'd1').length, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
          { label: 'D-3 (3 dias)', value: lista.filter(p => p.nivel === 'd3').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
          { label: 'D-5 (5 dias)', value: lista.filter(p => p.nivel === 'd5').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prazos críticos */}
      {criticos.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={14} />⚠ Prazos Críticos — Ação Imediata
          </h2>
          <div className="space-y-3">
            {criticos.map(p => {
              const nv = NIVEL[p.nivel];
              return (
                <div key={p.id} className={`rounded-xl p-4 ${nv.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${nv.color} bg-current/10`}>{nv.label}</span>
                        <span className="text-xs text-blue-400 font-mono">{p.processo}</span>
                        <span className="text-xs text-gray-500">{p.area}</span>
                      </div>
                      <div className="font-semibold text-gray-200 text-sm">{p.descricao}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.cliente} • {p.responsavel}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${nv.color}`}>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs text-gray-600">Vencimento</div>
                      </div>
                      <button
                        onClick={() => toggleConferido(p.id)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${p.conferido ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-green-500/50 hover:text-green-400'}`}>
                        <CheckCircle size={12} />{p.conferido ? 'Conferido' : 'Conferir'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Atenção */}
      {atencao.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={14} />Atenção — Próximos Dias
          </h2>
          <div className="space-y-2">
            {atencao.map(p => {
              const nv = NIVEL[p.nivel];
              return (
                <div key={p.id} className={`rounded-xl p-3 flex items-center gap-4 ${nv.bg || 'bg-[#1a2744] border border-blue-900/30'}`}>
                  <span className={`text-xs font-bold ${nv.color} whitespace-nowrap`}>{nv.label}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200">{p.descricao}</div>
                    <div className="text-xs text-gray-500">{p.cliente} • {p.processo}</div>
                  </div>
                  <div className={`text-sm font-bold ${nv.color}`}>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</div>
                  <button onClick={() => toggleConferido(p.id)}
                    className={`text-xs px-2 py-1 rounded border ${p.conferido ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-green-400'}`}>
                    {p.conferido ? '✓' : 'Conferir'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Normais */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Calendar size={14} />Prazos Futuros
        </h2>
        <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {['Processo', 'Descrição', 'Cliente', 'Área', 'Vencimento', 'Status'].map(h => (
                  <th key={h} className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normais.map(p => (
                <tr key={p.id} className="border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors">
                  <td className="px-4 py-3 text-xs text-blue-400 font-mono">{p.processo.slice(-12)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{p.descricao}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{p.cliente}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.area}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleConferido(p.id)}
                      className={`text-xs px-2 py-1 rounded border ${p.conferido ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 hover:text-green-400'}`}>
                      {p.conferido ? '✓ Conferido' : 'Conferir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
