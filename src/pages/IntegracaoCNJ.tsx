import React, { useState } from 'react';
import { Scale, RefreshCw, CheckCircle, AlertTriangle, Clock, Activity, Download, Bell, Zap, FileText, Hash } from 'lucide-react';

const sistemas = [
  { id: 'djen', nome: 'Domicílio Eletrônico Judicial (DJEN)', status: 'online', ultima_sync: '28/02/2024 14:30', intimacoes_hoje: 3, tribunal: 'CNJ' },
  { id: 'mni', nome: 'Modelo Nacional de Interoperabilidade (MNI)', status: 'online', ultima_sync: '28/02/2024 12:00', intimacoes_hoje: 7, tribunal: 'CNJ/TJSP' },
  { id: 'datajud', nome: 'DataJud — Base de Dados do Poder Judiciário', status: 'online', ultima_sync: '28/02/2024 08:00', intimacoes_hoje: 0, tribunal: 'CNJ' },
  { id: 'pje', nome: 'PJe — Processo Judicial Eletrônico', status: 'online', ultima_sync: '28/02/2024 13:45', intimacoes_hoje: 5, tribunal: 'TJMG/TRT' },
  { id: 'esaj', nome: 'e-SAJ — Sistema de Automação da Justiça', status: 'online', ultima_sync: '28/02/2024 14:00', intimacoes_hoje: 2, tribunal: 'TJSP' },
  { id: 'eproc', nome: 'e-Proc — Processo Eletrônico', status: 'degradado', ultima_sync: '28/02/2024 10:00', intimacoes_hoje: 1, tribunal: 'TRF4/TRF1' },
];

const notificacoes = [
  { id: 'N001', tipo: 'intimacao', processo: '0001234-55.2024.8.26.0100', descricao: 'Despacho: Conclusão para sentença. Prazo de 15 dias para manifestação.', tribunal: 'TJSP', data: '28/02 14:30', prazo: '15/03/2024', status: 'novo', urgencia: 'alta' },
  { id: 'N002', tipo: 'citacao', processo: '0004321-66.2024.5.15.0001', descricao: 'Citação para contestar reclamação trabalhista. Prazo de 5 dias úteis.', tribunal: 'TRT15', data: '28/02 11:00', prazo: '05/03/2024', status: 'novo', urgencia: 'urgente' },
  { id: 'N003', tipo: 'pauta', processo: '0009876-44.2023.8.19.0001', descricao: 'Inclusão em pauta de julgamento — Câmara Cível. Data: 12/03/2024 14h.', tribunal: 'TJRJ', data: '27/02 16:00', prazo: '12/03/2024', status: 'lido', urgencia: 'media' },
  { id: 'N004', tipo: 'despacho', processo: '0007654-11.2024.1.00.0000', descricao: 'Processo distribuído ao Ministro Relator. Aguardando inclusão em pauta.', tribunal: 'STJ', data: '27/02 10:00', prazo: '—', status: 'lido', urgencia: 'media' },
  { id: 'N005', tipo: 'sentenca', processo: '0002200-12.2023.8.26.0100', descricao: 'Sentença publicada — Julgamento FAVORÁVEL. Trânsito em julgado em 15 dias.', tribunal: 'TJSP', data: '26/02 09:00', prazo: '14/03/2024', status: 'lido', urgencia: 'baixa' },
];

const tipoIcone: Record<string, string> = { intimacao: '📬', citacao: '⚖️', pauta: '📅', despacho: '📄', sentenca: '🏛️' };
const urgCor: Record<string, string> = {
  urgente: 'bg-crimson/10 text-crimson border-crimson/25',
  alta: 'bg-amber/15 text-amber-800 border-amber/40',
  media: 'bg-amber/10 text-amber-700 border-amber/30',
  baixa: 'bg-emerald/10 text-emerald border-emerald/25',
};

export default function IntegracaoCNJ() {
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => setSyncing(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}>
            <Scale size={24} className="text-blue-400" />Integração CNJ
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">DJEN, MNI, DataJud, PJe — Recepção automática de notificações</p>
        </div>
        <button className="btn-primary">
          <RefreshCw size={14} />Sincronizar Todos
        </button>
      </div>

      {/* Status dos sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sistemas.map(s => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-slate-800 leading-tight">{s.nome}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.tribunal}</div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${s.status === 'online' ? 'bg-emerald/10 text-emerald' : 'bg-amber/10 text-amber-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'online' ? 'bg-emerald' : 'bg-yellow-400'} animate-pulse`}></div>
                {s.status === 'online' ? 'Online' : 'Degradado'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white rounded-lg p-2 border border-slate-100">
                <div className="text-xs text-slate-500">Última Sync</div>
                <div className="text-xs text-slate-700 font-medium mt-0.5">{s.ultima_sync}</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-slate-100">
                <div className="text-xs text-slate-500">Intimações Hoje</div>
                <div className={`text-sm font-bold mt-0.5 ${s.intimacoes_hoje > 0 ? '#19385C' : 'text-slate-500'}`}>{s.intimacoes_hoje}</div>
              </div>
            </div>
            <button onClick={() => handleSync(s.id)}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 text-xs font-medium py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
              <RefreshCw size={12} className={syncing === s.id ? 'animate-spin' : ''} />
              {syncing === s.id ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        ))}
      </div>

      {/* Notificações recebidas */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Bell size={16} className="text-blue-400" />
          <span className="font-semibold text-slate-800 text-sm">Notificações Recebidas — Último Ciclo</span>
          <span className="ml-auto text-xs bg-navy-mid/10 text-navy font-semibold border border-blue-500/30 px-2 py-0.5 rounded-full">{notificacoes.filter(n => n.status === 'novo').length} novas</span>
        </div>
        <div className="divide-y divide-blue-900/20">
          {notificacoes.map(n => (
            <div key={n.id} className={`flex items-start gap-4 px-4 py-4 hover:bg-amber-50/40 transition-colors cursor-pointer ${n.status === 'novo' ? 'border-l-2 border-l-blue-500' : ''}`}>
              <span className="text-2xl">{tipoIcone[n.tipo]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs text-blue-400 font-mono">{n.processo}</span>
                  <span className="text-xs bg-slate-100 text-blue-300 px-2 py-0.5 rounded">{n.tribunal}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${urgCor[n.urgencia]}`}>{n.urgencia.charAt(0).toUpperCase() + n.urgencia.slice(1)}</span>
                  {n.status === 'novo' && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">NOVO</span>}
                </div>
                <p className="text-sm text-slate-700">{n.descricao}</p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-xs text-slate-400">{n.data}</span>
                  {n.prazo !== '—' && <span className="text-xs text-yellow-400 flex items-center gap-1"><Clock size={10} />Prazo: {n.prazo}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-green-600/20 text-green-400 border border-green-600/30 px-3 py-1.5 rounded-lg hover:bg-green-600/30 transition-colors flex items-center gap-1">
                  <CheckCircle size={12} />Registrar Prazo
                </button>
                <button className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors flex items-center gap-1">
                  <FileText size={12} />Ver Processo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
