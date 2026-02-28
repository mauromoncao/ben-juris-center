import React, { useState } from 'react';
import { BookOpen, Plus, Search, Download, Edit, Eye, Clock, CheckCircle, FileText, Tag, Filter } from 'lucide-react';

type TipoDoc = 'parecer' | 'peticao' | 'contrato' | 'minuta' | 'relatorio' | 'oficio' | 'recurso' | 'notificacao';
type StatusDoc = 'rascunho' | 'revisao' | 'aprovado' | 'enviado' | 'arquivado';

interface Documento {
  id: string;
  titulo: string;
  tipo: TipoDoc;
  cliente: string;
  processo?: string;
  status: StatusDoc;
  autor: string;
  data_criacao: string;
  ultima_revisao: string;
  versao: string;
  confidencial: boolean;
  tags: string[];
}

const TIPOS: Record<TipoDoc, { label: string; icon: string; color: string }> = {
  parecer: { label: 'Parecer Jurídico', icon: '⚖️', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  peticao: { label: 'Petição', icon: '📝', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  contrato: { label: 'Contrato', icon: '📋', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  minuta: { label: 'Minuta', icon: '📄', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  relatorio: { label: 'Relatório', icon: '📊', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  oficio: { label: 'Ofício', icon: '✉️', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  recurso: { label: 'Recurso', icon: '🔁', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  notificacao: { label: 'Notificação', icon: '🔔', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const STATUS: Record<StatusDoc, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-500/20 text-gray-400' },
  revisao: { label: 'Em Revisão', color: 'bg-yellow-500/20 text-yellow-400' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400' },
  enviado: { label: 'Enviado', color: 'bg-blue-500/20 text-blue-400' },
  arquivado: { label: 'Arquivado', color: 'bg-gray-500/20 text-gray-500' },
};

const mockDocs: Documento[] = [
  { id: 'DC001', titulo: 'Parecer sobre Licitação nº 456/2024 — Irregularidades', tipo: 'parecer', cliente: 'Prefeitura SP', processo: '0001234-55.2024', status: 'revisao', autor: 'Mauro Monção', data_criacao: '27/02/2024', ultima_revisao: '28/02/2024', versao: 'v2.1', confidencial: true, tags: ['licitação', 'tributário', 'urgente'] },
  { id: 'DC002', titulo: 'Contestação à Reclamação Trabalhista — Fundação Campinas', tipo: 'peticao', cliente: 'Fundação Campinas', processo: '0004321-66.2024', status: 'rascunho', autor: 'Mauro Monção', data_criacao: '28/02/2024', ultima_revisao: '28/02/2024', versao: 'v1.0', confidencial: false, tags: ['trabalhista', 'contestação'] },
  { id: 'DC003', titulo: 'Contrato de Prestação de Serviços Jurídicos — Câmara RJ 2024', tipo: 'contrato', cliente: 'Câmara Municipal RJ', status: 'aprovado', autor: 'Mauro Monção', data_criacao: '15/01/2024', ultima_revisao: '20/01/2024', versao: 'v3.0', confidencial: false, tags: ['contrato', 'honorários'] },
  { id: 'DC004', titulo: 'Recurso Especial — Responsabilidade Estado por Omissão', tipo: 'recurso', cliente: 'Secretaria MG', processo: '0007654-11.2024', status: 'enviado', autor: 'Mauro Monção', data_criacao: '20/02/2024', ultima_revisao: '25/02/2024', versao: 'v1.2', confidencial: true, tags: ['recurso', 'STJ', 'saúde'] },
  { id: 'DC005', titulo: 'Relatório Mensal — Situação Processual Fev/2024', tipo: 'relatorio', cliente: 'Todos os Clientes', status: 'aprovado', autor: 'Mauro Monção', data_criacao: '28/02/2024', ultima_revisao: '28/02/2024', versao: 'v1.0', confidencial: false, tags: ['relatório', 'mensal'] },
  { id: 'DC006', titulo: 'Ofício à Secretaria de Saúde — Solicitação de Informações', tipo: 'oficio', cliente: 'Secretaria MG', processo: '0007654-11.2024', status: 'enviado', autor: 'Mauro Monção', data_criacao: '22/02/2024', ultima_revisao: '22/02/2024', versao: 'v1.0', confidencial: false, tags: ['ofício', 'saúde'] },
];

const templates = [
  { nome: 'Petição Inicial Cível', tipo: 'peticao', usos: 47 },
  { nome: 'Contestação Trabalhista', tipo: 'peticao', usos: 32 },
  { nome: 'Recurso de Apelação', tipo: 'recurso', usos: 28 },
  { nome: 'Parecer Administrativo', tipo: 'parecer', usos: 41 },
  { nome: 'Contrato de Honorários', tipo: 'contrato', usos: 23 },
  { nome: 'Ofício Administrativo', tipo: 'oficio', usos: 19 },
];

export default function Documentos() {
  const [docs] = useState<Documento[]>(mockDocs);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoDoc | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusDoc | 'todos'>('todos');
  const [aba, setAba] = useState<'docs' | 'templates'>('docs');

  const filtrados = docs.filter(d => {
    const matchBusca = d.titulo.toLowerCase().includes(busca.toLowerCase()) || d.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || d.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || d.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen size={24} className="text-blue-400" />Documentos & Pareceres</h1>
          <p className="text-gray-500 text-sm mt-0.5">Biblioteca de documentos, templates, versionamento e aprovação</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Novo Documento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Docs', value: docs.length, c: 'text-blue-400' },
          { label: 'Em Revisão', value: docs.filter(d => d.status === 'revisao').length, c: 'text-yellow-400' },
          { label: 'Aprovados', value: docs.filter(d => d.status === 'aprovado').length, c: 'text-green-400' },
          { label: 'Templates', value: templates.length, c: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a2744] border border-blue-900/30 p-1 rounded-xl w-fit">
        {(['docs', 'templates'] as const).map(t => (
          <button key={t} onClick={() => setAba(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
            {t === 'docs' ? '📄 Documentos' : '📝 Templates'}
          </button>
        ))}
      </div>

      {aba === 'docs' ? (
        <>
          {/* Filters */}
          <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                placeholder="Buscar documentos..." />
            </div>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)}
              className="bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="todos">Todos os tipos</option>
              {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)}
              className="bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="todos">Todos os status</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Docs grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrados.map(d => {
              const tipo = TIPOS[d.tipo];
              const st = STATUS[d.status];
              return (
                <div key={d.id} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tipo.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${tipo.color}`}>{tipo.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        {d.confidencial && <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">🔒 Conf.</span>}
                        <span className="text-xs text-gray-600 ml-auto">{d.versao}</span>
                      </div>
                      <h3 className="font-semibold text-gray-200 text-sm leading-tight">{d.titulo}</h3>
                      <div className="text-xs text-gray-500 mt-1">{d.cliente} {d.processo ? `• ${d.processo}` : ''}</div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-600">Criado {d.data_criacao}</span>
                        <span className="text-xs text-gray-600">Rev. {d.ultima_revisao}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.tags.map(t => (
                          <span key={t} className="text-xs bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/40">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-blue-900/20">
                    <button className="flex-1 flex items-center justify-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg py-1.5 hover:bg-blue-600/30 transition-colors">
                      <Eye size={12} />Visualizar
                    </button>
                    <button className="flex items-center justify-center gap-1 text-xs bg-[#0f1623] text-gray-400 border border-blue-900/30 rounded-lg px-3 py-1.5 hover:text-gray-200 transition-colors">
                      <Download size={12} />
                    </button>
                    <button className="flex items-center justify-center gap-1 text-xs bg-[#0f1623] text-gray-400 border border-blue-900/30 rounded-lg px-3 py-1.5 hover:text-gray-200 transition-colors">
                      <Edit size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map(t => {
            const tipo = TIPOS[t.tipo as TipoDoc];
            return (
              <div key={t.nome} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{tipo.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-200 text-sm">{t.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tipo.color}`}>{tipo.label}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Usado {t.usos} vezes</div>
                <button className="mt-3 w-full flex items-center justify-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg py-1.5 hover:bg-blue-600/30 transition-colors">
                  <Plus size={12} />Usar Template
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
