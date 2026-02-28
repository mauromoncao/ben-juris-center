import React, { useState } from 'react';
import { PenTool, Plus, CheckCircle, Clock, AlertTriangle, Download, Eye, Send, Shield, Users, FileText } from 'lucide-react';

const assinaturas = [
  { id: 'AS001', documento: 'Contrato de Prestação de Serviços 2024 — Câmara RJ', tipo: 'contrato', signatarios: [{ nome: 'Mauro Monção', status: 'assinado', data: '28/02/2024' }, { nome: 'Dra. Ana Paula Souza', status: 'pendente', data: null }, { nome: 'Presidente Câmara RJ', status: 'pendente', data: null }], status: 'aguardando', criado: '27/02/2024', prazo: '05/03/2024', certificado: 'ICP-Brasil A3', plataforma: 'ClickSign' },
  { id: 'AS002', documento: 'Procuração Especial — Processo STJ 0007654', tipo: 'procuracao', signatarios: [{ nome: 'Mauro Monção', status: 'assinado', data: '26/02/2024' }, { nome: 'Dr. Marcos Lima', status: 'assinado', data: '27/02/2024' }], status: 'concluido', criado: '26/02/2024', prazo: '28/02/2024', certificado: 'ICP-Brasil A1', plataforma: 'DocuSign' },
  { id: 'AS003', documento: 'Acordo Extrajudicial — TechSol x Sindicato', tipo: 'acordo', signatarios: [{ nome: 'Mauro Monção', status: 'pendente', data: null }, { nome: 'Roberto Silveira', status: 'pendente', data: null }, { nome: 'Representante Sindicato', status: 'pendente', data: null }], status: 'aguardando', criado: '28/02/2024', prazo: '10/03/2024', certificado: 'ICP-Brasil A3', plataforma: 'ZapSign' },
];

const statusCor: Record<string, string> = {
  assinado: 'bg-emerald/10 text-emerald',
  pendente: 'bg-amber/10 text-amber-700',
};

const statusDocCor: Record<string, string> = {
  aguardando: 'bg-amber/10 text-amber-700 border-amber/30',
  concluido: 'bg-emerald/10 text-emerald border-emerald/25',
  cancelado: 'bg-crimson/10 text-crimson border-crimson/25',
};

export default function Assinaturas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}><PenTool size={24} className="text-blue-400" />Assinatura Digital</h1>
          <p className="text-slate-500 text-sm mt-0.5">ICP-Brasil A1/A3 — ClickSign, DocuSign, ZapSign</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />Novo Envelope
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Aguardando', v: assinaturas.filter(a => a.status === 'aguardando').length, c: '#D4A017' },
          { l: 'Concluídos', v: assinaturas.filter(a => a.status === 'concluido').length, c: '#00b37e' },
          { l: 'Signatários Pendentes', v: assinaturas.flatMap(a => a.signatarios).filter(s => s.status === 'pendente').length, c: '#f59e0b' },
          { l: 'Plataformas', v: 3, c: '#0f2044' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Integration badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { nome: 'ClickSign', status: 'online', cor: '#00b37e' },
          { nome: 'DocuSign', status: 'online', cor: '#00b37e' },
          { nome: 'ZapSign', status: 'online', cor: '#00b37e' },
          { nome: 'ICP-Brasil A1', status: 'válido', cor: '#0f2044' },
          { nome: 'ICP-Brasil A3', status: 'válido', cor: '#0f2044' },
        ].map(p => (
          <div key={p.nome} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
            <Shield size={14} className={p.cor} />
            <span className="text-sm font-medium text-slate-700">{p.nome}</span>
            <span className={`text-xs ${p.cor}`}>{p.status}</span>
          </div>
        ))}
      </div>

      {/* Lista de assinaturas */}
      <div className="space-y-4">
        {assinaturas.map(a => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusDocCor[a.status]}`}>
                    {a.status === 'aguardando' ? '⏳ Aguardando' : '✅ Concluído'}
                  </span>
                  <span className="text-xs text-slate-500">{a.plataforma}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">{a.certificado}</span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{a.documento}</h3>
                <div className="text-xs text-slate-500 mt-1">Criado {a.criado} • Prazo {a.prazo}</div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                  <Eye size={12} />Ver
                </button>
                {a.status === 'aguardando' && (
                  <button className="flex items-center gap-1 text-xs bg-green-600/20 text-green-400 border border-green-600/30 px-3 py-1.5 rounded-lg hover:bg-green-600/30 transition-colors">
                    <Send size={12} />Reenviar
                  </button>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-1"><Users size={12} />Signatários</div>
              <div className="space-y-2">
                {a.signatarios.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.status === 'assinado' ? 'bg-emerald' : 'bg-yellow-400'}`}></div>
                    <span className="text-sm text-slate-700 flex-1">{s.nome}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusCor[s.status]}`}>
                      {s.status === 'assinado' ? `✓ Assinado ${s.data}` : '⏳ Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
