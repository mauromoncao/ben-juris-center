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
  fatal: { label: 'D-0 FATAL', color: 'text-crimson', bg: 'bg-crimson/08 border-l-4 border-l-crimson' },
  d1: { label: 'D-1', color: 'text-amber-700', bg: 'bg-amber/10 border-l-4 border-l-amber' },
  d3: { label: 'D-3', color: 'text-amber-600', bg: 'bg-yellow-50 border-l-4 border-l-amber' },
  d5: { label: 'D-5', color: 'text-navy font-medium', bg: 'bg-slate-50 border-l-4 border-l-navy' },
  normal: { label: 'Normal', color: 'text-slate-500', bg: 'bg-white' },
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
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}><Clock size={24} style={{ color: '#e11d48' }} />Prazos & Controle</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-sans">Contagem automática, alertas D-5/D-3/D-1, dupla conferência</p>
        </div>
        <button className="flex items-center gap-2 btn-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Adicionar Prazo
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'FATAIS (Hoje)', value: lista.filter(p => p.nivel === 'fatal').length, color: '#e11d48', bg: 'kpi-crimson' },
          { label: 'D-1 (Amanhã)', value: lista.filter(p => p.nivel === 'd1').length, color: '#f59e0b', bg: 'kpi-amber' },
          { label: 'D-3 (3 dias)', value: lista.filter(p => p.nivel === 'd3').length, color: '#D4A017', bg: 'kpi-gold' },
          { label: 'D-5 (5 dias)', value: lista.filter(p => p.nivel === 'd5').length, color: '#0f2044', bg: 'kpi-navy' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} text-center`}>
            <div className="text-3xl font-bold font-serif" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prazos críticos */}
      {criticos.length > 0 && (
        <div>
          <h2 className="section-label flex items-center gap-2 mb-3" style={{ color: '#e11d48', fontSize: '0.8rem' }}>
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
                        <span className="text-xs font-mono font-bold" style={{ color: '#1e3470' }}>{p.processo}</span>
                        <span className="text-xs text-slate-500">{p.area}</span>
                      </div>
                      <div className="font-semibold text-slate-800 text-sm">{p.descricao}</div>
                      <div className="text-xs text-slate-500 mt-1">{p.cliente} • {p.responsavel}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className={`text-sm font-bold ${nv.color}`}>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs text-slate-400">Vencimento</div>
                      </div>
                      <button
                        onClick={() => toggleConferido(p.id)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${p.conferido ? 'bg-emerald/10 text-emerald border-emerald/25' : 'bg-white text-slate-500 border-slate-300 hover:border-emerald hover:text-emerald'}`}>
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
          <h2 className="section-label flex items-center gap-2 mb-3" style={{ color: '#D4A017', fontSize: '0.8rem' }}>
            <Clock size={14} />Atenção — Próximos Dias
          </h2>
          <div className="space-y-2">
            {atencao.map(p => {
              const nv = NIVEL[p.nivel];
              return (
                <div key={p.id} className={`rounded-xl p-3 flex items-center gap-4 ${nv.bg || 'bg-white border border-slate-200'}`}>
                  <span className={`text-xs font-bold ${nv.color} whitespace-nowrap`}>{nv.label}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{p.descricao}</div>
                    <div className="text-xs text-slate-500">{p.cliente} • {p.processo}</div>
                  </div>
                  <div className={`text-sm font-bold ${nv.color}`}>{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</div>
                  <button onClick={() => toggleConferido(p.id)}
                    className={`text-xs px-2 py-1 rounded border ${p.conferido ? 'bg-emerald/10 text-emerald border-emerald/25' : 'bg-white text-slate-500 border-slate-300 hover:text-emerald'}`}>
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
        <h2 className="section-label flex items-center gap-2 mb-3">
          <Calendar size={14} />Prazos Futuros
        </h2>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
          <table className="w-full">
            <thead>
              <tr>
                {['Processo', 'Descrição', 'Cliente', 'Área', 'Vencimento', 'Status'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normais.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 text-xs font-mono font-bold" style={{ color: '#1e3470' }}>{p.processo.slice(-12)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{p.descricao}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{p.cliente}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.area}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(p.data_vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleConferido(p.id)}
                      className={`text-xs px-2 py-1 rounded border ${p.conferido ? 'bg-emerald/10 text-emerald border-emerald/25' : 'bg-white text-slate-500 border-slate-300 hover:text-emerald'}`}>
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
