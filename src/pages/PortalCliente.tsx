import React, { useState } from 'react';
import { Users, Eye, Download, FileText, MessageSquare, CheckCircle, Clock, Building2, Bell, Lock } from 'lucide-react';

const clientes = [
  { id: 'PC001', nome: 'Prefeitura Municipal de SP', tipo: 'municipio', ultimo_acesso: '28/02/2024 10:30', processos: 47, documentos_novos: 3, mensagens: 1 },
  { id: 'PC002', nome: 'Câmara Municipal do RJ', tipo: 'camara', ultimo_acesso: '27/02/2024 16:00', processos: 23, documentos_novos: 0, mensagens: 2 },
  { id: 'PC003', nome: 'TechSol Soluções', tipo: 'empresa', ultimo_acesso: '26/02/2024 09:00', processos: 8, documentos_novos: 1, mensagens: 0 },
  { id: 'PC004', nome: 'Secretaria de Saúde MG', tipo: 'secretaria', ultimo_acesso: '28/02/2024 08:00', processos: 31, documentos_novos: 5, mensagens: 3 },
];

const atividades = [
  { tipo: 'processo', descricao: 'Novo movimento no processo 0001234-55.2024', cliente: 'Prefeitura SP', hora: '14:30', icone: '⚖️' },
  { tipo: 'documento', descricao: 'Parecer Jurídico disponível para download', cliente: 'Câmara RJ', hora: '12:00', icone: '📄' },
  { tipo: 'relatorio', descricao: 'Relatório mensal Fev/2024 publicado', cliente: 'Todos', hora: '09:00', icone: '📊' },
  { tipo: 'mensagem', descricao: 'Nova mensagem: "Quando sai a sentença?"', cliente: 'Secretaria MG', hora: '08:30', icone: '💬' },
];

export default function PortalCliente() {
  const [selecionado, setSelecionado] = useState<typeof clientes[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}><Users size={24} className="text-blue-400" />Portal do Cliente</h1>
        <p className="text-slate-500 text-sm mt-0.5">Acesso institucional — processos, pareceres, financeiro e comunicação</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Clientes com Acesso', v: clientes.length, c: '#0f2044' },
          { l: 'Acessos Hoje', v: 7, c: '#00b37e' },
          { l: 'Docs Publicados', v: 12, c: '#7c3aed' },
          { l: 'Mensagens Pendentes', v: 6, c: '#D4A017' },
        ].map(s => (
          <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clientes */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <Building2 size={16} className="text-blue-400" />
            <span className="font-semibold text-slate-800 text-sm">Acessos Recentes dos Clientes</span>
          </div>
          <div className="divide-y divide-blue-900/20">
            {clientes.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-amber-50/40 transition-colors cursor-pointer" onClick={() => setSelecionado(c)}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                  {c.tipo === 'municipio' ? '🏛️' : c.tipo === 'camara' ? '⚖️' : c.tipo === 'empresa' ? '🏢' : '📋'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">{c.nome}</div>
                  <div className="text-xs text-slate-500">Último acesso: {c.ultimo_acesso}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{c.processos}</div>
                    <div className="text-xs text-slate-400">proc.</div>
                  </div>
                  {c.documentos_novos > 0 && (
                    <span className="bg-navy-mid/10 text-navy font-semibold text-xs px-1.5 py-0.5 rounded-full border border-blue-500/30">{c.documentos_novos} docs</span>
                  )}
                  {c.mensagens > 0 && (
                    <span className="bg-amber/10 text-amber-700 text-xs px-1.5 py-0.5 rounded-full border border-yellow-500/30">{c.mensagens} msg</span>
                  )}
                  <button className="text-blue-400 hover:text-blue-300 transition-colors"><Eye size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividades */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <Bell size={16} className="text-yellow-400" />
            <span className="font-semibold text-slate-800 text-sm">Atividades do Portal</span>
          </div>
          <div className="divide-y divide-blue-900/20">
            {atividades.map((a, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">{a.icone}</span>
                  <div>
                    <p className="text-xs text-slate-700 leading-tight">{a.descricao}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{a.hora}</span>
                      <span className="text-xs text-blue-400">{a.cliente}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recursos do portal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { nome: 'Acompanhamento de Processos', icon: '⚖️', desc: 'Visualização em tempo real com movimentos' },
          { nome: 'Download de Pareceres', icon: '📄', desc: 'Documentos publicados pelo escritório' },
          { nome: 'Relatórios Mensais', icon: '📊', desc: 'Dashboard financeiro e processual' },
          { nome: 'Chat Direto', icon: '💬', desc: 'Comunicação segura e rastreada' },
        ].map(r => (
          <div key={r.nome} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-3xl block mb-2">{r.icon}</span>
            <h3 className="text-xs font-semibold text-slate-800 mb-1">{r.nome}</h3>
            <p className="text-xs text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
