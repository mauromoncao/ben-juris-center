import React, { useState } from 'react';
import {
  FileText, Plus, Search, Clock, CheckCircle, AlertTriangle,
  User, Building2, Tag, Paperclip, Send, Eye, Edit, X,
  Calendar, Hash, ArrowRight, Filter, Download, ChevronDown
} from 'lucide-react';

type Urgencia = 'urgente' | 'alta' | 'media' | 'baixa';
type StatusDemanda = 'recebida' | 'triagem' | 'em_andamento' | 'aguardando_info' | 'concluida' | 'arquivada';
type TipoDemanda = 'consulta_juridica' | 'peticao' | 'recurso' | 'contrato' | 'parecer' | 'notificacao' | 'medida_cautelar' | 'outro';

interface Demanda {
  id: string;
  protocolo: string;
  titulo: string;
  tipo: TipoDemanda;
  cliente: string;
  secretaria: string;
  urgencia: Urgencia;
  status: StatusDemanda;
  advogado: string;
  data_abertura: string;
  prazo_sla: string;
  descricao: string;
  anexos: string[];
  historico: { data: string; acao: string; usuario: string }[];
}

const URGENCIAS: Record<Urgencia, { label: string; color: string }> = {
  urgente: { label: 'Urgente', color: 'bg-crimson/10 text-crimson border-crimson/25' },
  alta: { label: 'Alta', color: 'bg-amber/15 text-amber-800 border-amber/40' },
  media: { label: 'Média', color: 'bg-amber/10 text-amber-700 border-amber/30' },
  baixa: { label: 'Baixa', color: 'bg-emerald/10 text-emerald border-emerald/25' },
};

const STATUS: Record<StatusDemanda, { label: string; color: string; dot: string }> = {
  recebida: { label: 'Recebida', color: 'bg-navy-mid/10 text-navy font-semibold', dot: 'bg-navy-mid' },
  triagem: { label: 'Em Triagem', color: 'bg-violet/10 text-violet', dot: 'bg-violet' },
  em_andamento: { label: 'Em Andamento', color: 'bg-amber/10 text-amber-700', dot: 'bg-yellow-400' },
  aguardando_info: { label: 'Aguard. Info', color: 'bg-amber/15 text-amber-800', dot: 'bg-orange-400' },
  concluida: { label: 'Concluída', color: 'bg-emerald/10 text-emerald', dot: 'bg-emerald' },
  arquivada: { label: 'Arquivada', color: 'bg-gray-500/20 text-slate-500', dot: 'bg-gray-400' },
};

const TIPOS: Record<TipoDemanda, string> = {
  consulta_juridica: 'Consulta Jurídica',
  peticao: 'Petição',
  recurso: 'Recurso',
  contrato: 'Contrato',
  parecer: 'Parecer',
  notificacao: 'Notificação',
  medida_cautelar: 'Medida Cautelar',
  outro: 'Outro',
};

const mockDemandas: Demanda[] = [
  {
    id: 'D001', protocolo: 'MMJ-2024-001234', titulo: 'Consulta sobre licitação irregular Proc. 456/2024',
    tipo: 'consulta_juridica', cliente: 'Prefeitura Municipal de SP', secretaria: 'Secretaria de Compras',
    urgencia: 'urgente', status: 'em_andamento', advogado: 'Mauro Monção',
    data_abertura: '2024-02-26 09:15', prazo_sla: '2024-02-28 09:15',
    descricao: 'Solicitação de parecer jurídico sobre possível irregularidade no processo de licitação 456/2024 referente à aquisição de equipamentos de TI.',
    anexos: ['edital_456_2024.pdf', 'impugnacao_empresa_xyz.docx'],
    historico: [
      { data: '26/02 09:15', acao: 'Demanda recebida e protocolo gerado', usuario: 'Sistema' },
      { data: '26/02 09:45', acao: 'Triagem concluída — atribuída ao Dr. Mauro Monção', usuario: 'Cristina Santos' },
      { data: '26/02 14:30', acao: 'Análise inicial concluída — aguardando documentação complementar', usuario: 'Mauro Monção' },
    ]
  },
  {
    id: 'D002', protocolo: 'MMJ-2024-001235', titulo: 'Recurso administrativo multa PROCON',
    tipo: 'recurso', cliente: 'TechSol Soluções Empresariais', secretaria: 'Departamento Jurídico',
    urgencia: 'alta', status: 'triagem', advogado: 'Mauro Monção',
    data_abertura: '2024-02-27 11:00', prazo_sla: '2024-03-02 11:00',
    descricao: 'Recurso administrativo contra multa aplicada pelo PROCON no valor de R$ 45.000,00. Prazo fatal para interposição: 05/03/2024.',
    anexos: ['auto_infracao_procon.pdf'],
    historico: [
      { data: '27/02 11:00', acao: 'Demanda recebida via portal do cliente', usuario: 'Sistema' },
      { data: '27/02 11:30', acao: 'Em triagem — verificando documentação', usuario: 'Cristina Santos' },
    ]
  },
  {
    id: 'D003', protocolo: 'MMJ-2024-001236', titulo: 'Elaboração de contrato de prestação de serviços',
    tipo: 'contrato', cliente: 'Fundação Educacional de Campinas', secretaria: 'Presidência',
    urgencia: 'media', status: 'recebida', advogado: 'N/A',
    data_abertura: '2024-02-28 08:00', prazo_sla: '2024-03-07 08:00',
    descricao: 'Elaboração de contrato de prestação de serviços de consultoria entre a Fundação e empresa parceira.',
    anexos: [],
    historico: [
      { data: '28/02 08:00', acao: 'Demanda recebida — aguardando triagem', usuario: 'Sistema' },
    ]
  },
  {
    id: 'D004', protocolo: 'MMJ-2024-001237', titulo: 'Parecer sobre concurso público — Câmara RJ',
    tipo: 'parecer', cliente: 'Câmara Municipal do Rio de Janeiro', secretaria: 'Assessoria Jurídica',
    urgencia: 'alta', status: 'em_andamento', advogado: 'Mauro Monção',
    data_abertura: '2024-02-25 14:00', prazo_sla: '2024-02-29 14:00',
    descricao: 'Parecer sobre legalidade de concurso público para cargos efetivos. Análise do edital e verificação de conformidade com a CF/88.',
    anexos: ['edital_concurso_2024.pdf', 'lei_organica_camara.pdf'],
    historico: [
      { data: '25/02 14:00', acao: 'Recebida e atribuída', usuario: 'Cristina Santos' },
      { data: '25/02 16:00', acao: 'Análise do edital iniciada', usuario: 'Mauro Monção' },
      { data: '26/02 10:00', acao: 'Parecer 70% concluído — revisando jurisprudência STF', usuario: 'Mauro Monção' },
    ]
  },
];

export default function Protocolo() {
  const [demandas] = useState<Demanda[]>(mockDemandas);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusDemanda | 'todos'>('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState<Urgencia | 'todos'>('todos');
  const [selecionada, setSelecionada] = useState<Demanda | null>(null);
  const [showNova, setShowNova] = useState(false);

  const filtradas = demandas.filter(d => {
    const matchBusca = d.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      d.protocolo.includes(busca) || d.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || d.status === filtroStatus;
    const matchUrg = filtroUrgencia === 'todos' || d.urgencia === filtroUrgencia;
    return matchBusca && matchStatus && matchUrg;
  });

  const contadores = {
    recebida: demandas.filter(d => d.status === 'recebida').length,
    triagem: demandas.filter(d => d.status === 'triagem').length,
    em_andamento: demandas.filter(d => d.status === 'em_andamento').length,
    urgente: demandas.filter(d => d.urgencia === 'urgente').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}>
            <FileText size={24} className="text-blue-400" />
            Protocolo Digital de Demandas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Recepção, triagem e acompanhamento de demandas jurídicas</p>
        </div>
        <button onClick={() => setShowNova(true)}
          className="btn-primary">
          <Plus size={16} />Abrir Demanda
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Aguardando Triagem', value: contadores.recebida, color: 'blue', dot: '🔵' },
          { label: 'Em Triagem', value: contadores.triagem, color: 'purple', dot: '🟣' },
          { label: 'Em Andamento', value: contadores.em_andamento, color: 'yellow', dot: '🟡' },
          { label: 'Urgentes (Hoje)', value: contadores.urgente, color: 'red', dot: '🔴' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-2xl font-bold font-serif mb-1" style={{ color: '#0f2044' }}>{s.dot} {s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban-style pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['recebida', 'triagem', 'em_andamento', 'concluida'] as StatusDemanda[]).map(st => {
          const info = STATUS[st];
          const items = demandas.filter(d => d.status === st);
          return (
            <div key={st} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${info.dot}`}></div>
                <span className="text-xs font-semibold text-slate-700">{info.label}</span>
                <span className="ml-auto text-xs text-slate-500">{items.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {items.map(d => {
                  const urg = URGENCIAS[d.urgencia];
                  return (
                    <div key={d.id}
                      className="bg-white border border-slate-200 rounded-lg p-2 cursor-pointer hover:border-blue-500/50 transition-all"
                      onClick={() => setSelecionada(d)}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-400 font-mono">{d.protocolo.slice(-6)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${urg.color}`}>{urg.label}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-tight font-medium">{d.titulo.slice(0, 45)}...</p>
                      <p className="text-xs text-slate-400 mt-1">{d.cliente.slice(0, 25)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={busca} onChange={e => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-400"
              placeholder="Buscar protocolo, cliente, título..." />
          </div>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filtroUrgencia} onChange={e => setFiltroUrgencia(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="todos">Todas as urgências</option>
            {Object.entries(URGENCIAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Protocolo', 'Título', 'Tipo', 'Cliente', 'Urgência', 'Status', 'Prazo SLA', 'Advogado', 'Ações'].map(h => (
                <th key={h} className="bg-white/60 table-header whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map(d => {
              const urg = URGENCIAS[d.urgencia];
              const st = STATUS[d.status];
              const isVencendo = new Date(d.prazo_sla) < new Date();
              return (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-amber-50/40 transition-colors cursor-pointer" onClick={() => setSelecionada(d)}>
                  <td className="px-4 py-3 text-xs text-blue-400 font-mono">{d.protocolo}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-800 font-medium">{d.titulo}</div>
                    <div className="text-xs text-slate-500">{d.data_abertura}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{TIPOS[d.tipo]}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{d.cliente}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${urg.color}`}>{urg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${st.dot}`}></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${isVencendo ? '#e11d48' : 'text-slate-500'}`}>
                      {isVencendo && <AlertTriangle size={10} className="inline mr-1" />}
                      {new Date(d.prazo_sla).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{d.advogado}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors" onClick={e => { e.stopPropagation(); setSelecionada(d); }}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelecionada(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 font-mono">{selecionada.protocolo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${URGENCIAS[selecionada.urgencia].color}`}>{URGENCIAS[selecionada.urgencia].label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[selecionada.status].color}`}>{STATUS[selecionada.status].label}</span>
                </div>
                <h2 className="font-bold text-gray-100 text-base mt-1">{selecionada.titulo}</h2>
              </div>
              <button onClick={() => setSelecionada(null)} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Cliente</div><div className="text-sm text-slate-800">{selecionada.cliente}</div></div>
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Tipo</div><div className="text-sm text-slate-800">{TIPOS[selecionada.tipo]}</div></div>
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Abertura</div><div className="text-sm text-slate-800">{selecionada.data_abertura}</div></div>
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Prazo SLA</div><div className="text-sm text-red-400 font-medium">{selecionada.prazo_sla}</div></div>
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Secretaria</div><div className="text-sm text-slate-800">{selecionada.secretaria}</div></div>
                <div><div className="text-xs text-slate-500 uppercase font-semibold mb-1">Advogado</div><div className="text-sm text-slate-800">{selecionada.advogado}</div></div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Descrição</div>
                <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200 leading-relaxed">{selecionada.descricao}</div>
              </div>
              {selecionada.anexos.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-1"><Paperclip size={12} />Anexos</div>
                  <div className="flex flex-wrap gap-2">
                    {selecionada.anexos.map(a => (
                      <span key={a} className="flex items-center gap-1.5 text-xs bg-slate-100 text-blue-400 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <Download size={12} />{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2 flex items-center gap-1"><Clock size={12} />Histórico de Comunicação</div>
                <div className="space-y-2">
                  {selecionada.historico.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        {i < selecionada.historico.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
                      </div>
                      <div className="pb-2">
                        <div className="text-xs text-slate-700">{h.acao}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{h.data} — {h.usuario}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button className="btn-primary">
                <ArrowRight size={14} />Avançar Status
              </button>
              <button className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                <Edit size={14} />Editar
              </button>
              <button className="flex items-center gap-2 bg-green-600/20 text-green-400 border border-green-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-600/30 transition-colors">
                <Send size={14} />Criar Processo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
