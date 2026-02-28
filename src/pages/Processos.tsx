import React, { useState } from 'react';
import {
  Gavel, Plus, Search, Filter, Clock, AlertTriangle, CheckCircle,
  Eye, Edit, FileText, User, Building2, ChevronDown, X, Scale,
  ArrowUp, ArrowDown, Activity, Tag, Hash, Calendar, Download,
  Shield, BarChart3, Paperclip, ArrowRight, MapPin
} from 'lucide-react';

type AreaJuridica = 'tributario' | 'administrativo' | 'civil' | 'trabalhista' | 'previdenciario' | 'constitucional' | 'ambiental' | 'consumidor';
type Instancia = '1a_instancia' | '2a_instancia' | 'stj' | 'stf' | 'trf' | 'trt' | 'tce' | 'administrativo';
type StatusProcesso = 'ativo' | 'recurso' | 'suspenso' | 'aguardando_julgamento' | 'encerrado_favoravel' | 'encerrado_desfavoravel' | 'arquivado';
type RiscoProcesso = 'alto' | 'medio' | 'baixo' | 'muito_alto';

interface Processo {
  id: string;
  numero_cnj: string;
  titulo: string;
  cliente: string;
  area: AreaJuridica;
  instancia: Instancia;
  status: StatusProcesso;
  risco: RiscoProcesso;
  valor_causa: number;
  advogado: string;
  parte_contraria: string;
  comarca: string;
  tribunal: string;
  data_distribuicao: string;
  ultimo_movimento: string;
  proximo_prazo: string;
  descricao: string;
  partes: { tipo: string; nome: string }[];
}

const AREAS: Record<AreaJuridica, { label: string; color: string }> = {
  tributario: { label: 'Tributário', color: 'badge-navy' },
  administrativo: { label: 'Administrativo', color: 'badge-violet' },
  civil: { label: 'Civil', color: 'badge-emerald' },
  trabalhista: { label: 'Trabalhista', color: 'badge-alta' },
  previdenciario: { label: 'Previdenciário', color: 'badge-cyan' },
  constitucional: { label: 'Constitucional', color: 'badge-urgente' },
  ambiental: { label: 'Ambiental', color: 'badge-emerald' },
  consumidor: { label: 'Consumidor', color: 'badge-amber' },
};

const INSTANCIAS: Record<Instancia, string> = {
  '1a_instancia': '1ª Instância',
  '2a_instancia': '2ª Instância',
  stj: 'STJ',
  stf: 'STF',
  trf: 'TRF',
  trt: 'TRT',
  tce: 'TCE',
  administrativo: 'Adm.',
};

const STATUS: Record<StatusProcesso, { label: string; color: string }> = {
  ativo: { label: 'Ativo', color: 'badge-navy' },
  recurso: { label: 'Recurso', color: 'badge-violet' },
  suspenso: { label: 'Suspenso', color: 'badge-amber' },
  aguardando_julgamento: { label: 'Ag. Julgamento', color: 'badge-alta' },
  encerrado_favoravel: { label: 'Encerrado ✓', color: 'badge-emerald' },
  encerrado_desfavoravel: { label: 'Encerrado ✗', color: 'badge-urgente' },
  arquivado: { label: 'Arquivado', color: 'bg-gray-500/20 text-slate-500' },
};

const RISCOS: Record<RiscoProcesso, { label: string; color: string }> = {
  muito_alto: { label: 'Muito Alto', color: 'badge-urgente' },
  alto: { label: 'Alto', color: 'badge-alta' },
  medio: { label: 'Médio', color: 'badge-amber' },
  baixo: { label: 'Baixo', color: 'badge-emerald' },
};

const mockProcessos: Processo[] = [
  {
    id: 'P001', numero_cnj: '0001234-55.2024.8.26.0100',
    titulo: 'Ação Anulatória de Débito Fiscal — ICMS 2019-2022',
    cliente: 'Prefeitura Municipal de SP', area: 'tributario', instancia: '1a_instancia',
    status: 'ativo', risco: 'alto', valor_causa: 850000,
    advogado: 'Mauro Monção', parte_contraria: 'Estado de SP / Fazenda Estadual',
    comarca: 'São Paulo', tribunal: 'TJSP', data_distribuicao: '2024-01-15',
    ultimo_movimento: '2024-02-25 — Despacho: Conclusão para sentença',
    proximo_prazo: '2024-02-28', descricao: 'Ação anulatória visando afastar lançamento tributário de ICMS questionável.',
    partes: [
      { tipo: 'Requerente', nome: 'Prefeitura Municipal de SP' },
      { tipo: 'Requerido', nome: 'Fazenda do Estado de São Paulo' },
    ]
  },
  {
    id: 'P002', numero_cnj: '0009876-44.2023.8.19.0001',
    titulo: 'Mandado de Segurança — Concurso Público Irregular',
    cliente: 'Câmara Municipal do Rio de Janeiro', area: 'administrativo', instancia: '2a_instancia',
    status: 'recurso', risco: 'medio', valor_causa: 150000,
    advogado: 'Mauro Monção', parte_contraria: 'Prefeitura do Rio de Janeiro',
    comarca: 'Rio de Janeiro', tribunal: 'TJRJ', data_distribuicao: '2023-08-20',
    ultimo_movimento: '2024-02-22 — Acórdão publicado — Aguardando prazo para REsp',
    proximo_prazo: '2024-03-05', descricao: 'MS impetrado por candidatos contra ato ilegal em concurso público.',
    partes: [
      { tipo: 'Impetrante', nome: 'Câmara Municipal do RJ' },
      { tipo: 'Impetrado', nome: 'Prefeitura do Rio de Janeiro' },
    ]
  },
  {
    id: 'P003', numero_cnj: '0004321-66.2024.5.15.0001',
    titulo: 'Reclamação Trabalhista — 15 Servidores Celetistas',
    cliente: 'Fundação Educacional de Campinas', area: 'trabalhista', instancia: '1a_instancia',
    status: 'ativo', risco: 'alto', valor_causa: 320000,
    advogado: 'Mauro Monção', parte_contraria: 'Sindicato dos Trabalhadores em Educação',
    comarca: 'Campinas', tribunal: 'TRT15', data_distribuicao: '2024-02-01',
    ultimo_movimento: '2024-02-26 — Notificação para contestação',
    proximo_prazo: '2024-03-03', descricao: 'Reclamação trabalhista envolvendo 15 servidores sobre diferenças salariais.',
    partes: [
      { tipo: 'Reclamado', nome: 'Fundação Educacional de Campinas' },
      { tipo: 'Reclamante', nome: 'Sindicato dos Trabalhadores' },
    ]
  },
  {
    id: 'P004', numero_cnj: '0007654-11.2024.1.00.0000',
    titulo: 'REsp — Responsabilidade do Estado por Omissão',
    cliente: 'Secretaria de Saúde MG', area: 'administrativo', instancia: 'stj',
    status: 'aguardando_julgamento', risco: 'muito_alto', valor_causa: 2800000,
    advogado: 'Mauro Monção', parte_contraria: 'Ministério Público Federal',
    comarca: 'Brasília', tribunal: 'STJ', data_distribuicao: '2023-11-10',
    ultimo_movimento: '2024-02-20 — Distribuído ao Min. Relator',
    proximo_prazo: '2024-03-12', descricao: 'Recurso Especial sobre responsabilidade civil do Estado por falha na saúde pública.',
    partes: [
      { tipo: 'Recorrente', nome: 'Estado de Minas Gerais' },
      { tipo: 'Recorrido', nome: 'Ministério Público Federal' },
    ]
  },
  {
    id: 'P005', numero_cnj: '0002345-78.2024.1.00.0001',
    titulo: 'ADPF — Inconstitucionalidade Lei Municipal 1.890/2023',
    cliente: 'Agência Reguladora Nacional de Energia', area: 'constitucional', instancia: 'stf',
    status: 'ativo', risco: 'alto', valor_causa: 0,
    advogado: 'Mauro Monção', parte_contraria: 'Câmara Municipal de Brasília',
    comarca: 'Brasília', tribunal: 'STF', data_distribuicao: '2024-01-25',
    ultimo_movimento: '2024-02-24 — Petição inicial distribuída',
    proximo_prazo: '2024-03-18', descricao: 'ADPF questionando constitucionalidade de lei municipal que invade competência federal.',
    partes: [
      { tipo: 'Requerente', nome: 'ANEEL' },
      { tipo: 'Interessado', nome: 'Câmara Municipal de Brasília' },
    ]
  },
];

export default function Processos() {
  const [processos] = useState<Processo[]>(mockProcessos);
  const [busca, setBusca] = useState('');
  const [filtroArea, setFiltroArea] = useState<AreaJuridica | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusProcesso | 'todos'>('todos');
  const [selecionado, setSelecionado] = useState<Processo | null>(null);

  const filtrados = processos.filter(p => {
    const matchBusca = p.numero_cnj.includes(busca) || p.titulo.toLowerCase().includes(busca.toLowerCase()) || p.cliente.toLowerCase().includes(busca.toLowerCase());
    const matchArea = filtroArea === 'todos' || p.area === filtroArea;
    const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus;
    return matchBusca && matchArea && matchStatus;
  });

  const totalValor = processos.reduce((s, p) => s + p.valor_causa, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}>
            <Gavel size={24} style={{ color: '#D4A017' }} />
            Gestão Processual
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 font-sans">Processos judiciais e administrativos — padrão CNJ</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />Novo Processo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: processos.length, color: '#0f2044' },
          { label: 'Ativos', value: processos.filter(p => p.status === 'ativo').length, color: '#00b37e' },
          { label: 'Em Recurso', value: processos.filter(p => p.status === 'recurso').length, color: '#7c3aed' },
          { label: 'Risco Alto/+', value: processos.filter(p => ['alto', 'muito_alto'].includes(p.risco)).length, color: '#e11d48' },
          { label: 'Valor Total', value: `R$ ${(totalValor / 1000000).toFixed(1)}M`, color: '#D4A017' },
        ].map(s => (
          <div key={s.label} className="card-compact text-center">
            <div className="text-xl font-bold font-serif" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-compact flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            className="input-field pl-9"
            placeholder="Buscar nº CNJ, cliente, título..." />
        </div>
        <select value={filtroArea} onChange={e => setFiltroArea(e.target.value as any)}
          className="select-field">
          <option value="todos">Todas as áreas</option>
          {Object.entries(AREAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)}
          className="select-field">
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Nº CNJ', 'Título / Cliente', 'Área', 'Instância', 'Status', 'Risco', 'Valor da Causa', 'Próx. Prazo', 'Ações'].map(h => (
                  <th key={h} className="table-header whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const area = AREAS[p.area];
                const st = STATUS[p.status];
                const risco = RISCOS[p.risco];
                return (
                  <tr key={p.id} className="table-row" onClick={() => setSelecionado(p)}>
                    <td className="px-4 py-3 text-xs font-mono font-bold whitespace-nowrap" style={{ color: '#1e3470' }}>{p.numero_cnj}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800 max-w-xs">{p.titulo}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.cliente}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${area.color}`}>{area.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{INSTANCIAS[p.instancia]}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${risco.color}`}>{risco.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">
                      {p.valor_causa > 0 ? `R$ ${(p.valor_causa / 1000).toFixed(0)}K` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap font-bold" style={{ color: '#D4A017' }}>{new Date(p.proximo_prazo).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="transition-colors hover:opacity-70" style={{ color: '#1e3470' }}><Eye size={14} /></button>
                        <button className="transition-colors hover:opacity-70 text-slate-400"><Edit size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelecionado(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold" style={{ color: '#1e3470' }}>{selecionado.numero_cnj}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${AREAS[selecionado.area].color}`}>{AREAS[selecionado.area].label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${RISCOS[selecionado.risco].color}`}>Risco {RISCOS[selecionado.risco].label}</span>
                </div>
                <h2 className="font-bold text-gray-100 text-base mt-1 leading-tight">{selecionado.titulo}</h2>
              </div>
              <button onClick={() => setSelecionado(null)} className="text-slate-500 hover:text-slate-700 ml-4">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Cliente', value: selecionado.cliente },
                  { label: 'Parte Contrária', value: selecionado.parte_contraria },
                  { label: 'Área Jurídica', value: AREAS[selecionado.area].label },
                  { label: 'Instância', value: INSTANCIAS[selecionado.instancia] },
                  { label: 'Tribunal', value: selecionado.tribunal },
                  { label: 'Comarca', value: selecionado.comarca },
                  { label: 'Advogado', value: selecionado.advogado },
                  { label: 'Distribuído em', value: new Date(selecionado.data_distribuicao).toLocaleDateString('pt-BR') },
                  { label: 'Valor da Causa', value: selecionado.valor_causa > 0 ? `R$ ${selecionado.valor_causa.toLocaleString('pt-BR')}` : 'Sem valor definido' },
                  { label: 'Próximo Prazo', value: new Date(selecionado.proximo_prazo).toLocaleDateString('pt-BR') },
                ].map(f => (
                  <div key={f.label}>
                    <div className="section-label">{f.label}</div>
                    <div className="text-sm text-slate-700 font-sans">{f.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="section-label">Último Movimento</div>
                <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">{selecionado.ultimo_movimento}</div>
              </div>
              <div>
                <div className="section-label">Partes do Processo</div>
                <div className="space-y-2">
                  {selecionado.partes.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs bg-slate-100 text-blue-400 px-2 py-0.5 rounded border border-slate-200 font-medium">{pt.tipo}</span>
                      <span className="text-sm text-slate-700 font-sans">{pt.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="section-label">Descrição</div>
                <div className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">{selecionado.descricao}</div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 flex-wrap">
              <button className="flex items-center gap-2 btn-primary text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Clock size={14} />Registrar Prazo
              </button>
              <button className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                <FileText size={14} />Adicionar Documento
              </button>
              <button className="flex items-center gap-2 bg-green-600/20 text-green-400 border border-green-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-600/30 transition-colors">
                <Activity size={14} />Timeline Completa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
