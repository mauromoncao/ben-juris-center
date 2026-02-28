import React, { useState } from 'react';
import {
  Building2, Plus, Search, Filter, MapPin, Phone, Mail, FileText,
  User, Star, Edit, Trash2, Eye, ChevronDown, X, CheckCircle,
  AlertCircle, Shield, Calendar, Clock, Users
} from 'lucide-react';

type TipoEntidade = 'municipio' | 'camara' | 'secretaria' | 'empresa_privada' | 'agencia' | 'ministerio_publico' | 'pessoa_fisica' | 'fundacao';

interface Cadastro {
  id: string;
  tipo: TipoEntidade;
  nome: string;
  cnpj_cpf: string;
  cidade: string;
  estado: string;
  responsavel: string;
  cargo: string;
  email: string;
  telefone: string;
  advogado_responsavel: string;
  processos_ativos: number;
  honorarios_mensais: number;
  sla_horas: number;
  certificado_digital: boolean;
  status: 'ativo' | 'inativo' | 'prospecto';
  data_inicio: string;
  area_principal: string;
  observacoes?: string;
}

const TIPOS: Record<TipoEntidade, { label: string; color: string; icon: string }> = {
  municipio: { label: 'Município', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '🏛️' },
  camara: { label: 'Câmara Municipal', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '⚖️' },
  secretaria: { label: 'Secretaria', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: '📋' },
  empresa_privada: { label: 'Empresa Privada', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🏢' },
  agencia: { label: 'Agência/Fundação', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '🏗️' },
  ministerio_publico: { label: 'Ministério Público', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🔏' },
  pessoa_fisica: { label: 'Pessoa Física', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', icon: '👤' },
  fundacao: { label: 'Fundação', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🎓' },
};

const mockCadastros: Cadastro[] = [
  {
    id: 'C001', tipo: 'municipio', nome: 'Prefeitura Municipal de São Paulo', cnpj_cpf: '46.395.000/0001-39',
    cidade: 'São Paulo', estado: 'SP', responsavel: 'Dr. Carlos Mendes', cargo: 'Secretário Jurídico',
    email: 'juridico@sp.gov.br', telefone: '(11) 3113-8000', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 47, honorarios_mensais: 35000, sla_horas: 48, certificado_digital: true,
    status: 'ativo', data_inicio: '2022-03-15', area_principal: 'Tributário',
    observacoes: 'Cliente institucional prioritário. Contratos anuais renovados.'
  },
  {
    id: 'C002', tipo: 'camara', nome: 'Câmara Municipal do Rio de Janeiro', cnpj_cpf: '33.650.404/0001-44',
    cidade: 'Rio de Janeiro', estado: 'RJ', responsavel: 'Dra. Ana Paula Souza', cargo: 'Assessora Jurídica',
    email: 'assessoria@camara.rj.gov.br', telefone: '(21) 2588-1500', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 23, honorarios_mensais: 22000, sla_horas: 72, certificado_digital: true,
    status: 'ativo', data_inicio: '2023-01-08', area_principal: 'Administrativo'
  },
  {
    id: 'C003', tipo: 'empresa_privada', nome: 'TechSol Soluções Empresariais Ltda', cnpj_cpf: '12.345.678/0001-90',
    cidade: 'Belo Horizonte', estado: 'MG', responsavel: 'Roberto Silveira', cargo: 'Diretor Jurídico',
    email: 'juridico@techsol.com.br', telefone: '(31) 3456-7890', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 8, honorarios_mensais: 12000, sla_horas: 24, certificado_digital: false,
    status: 'ativo', data_inicio: '2023-06-20', area_principal: 'Civil'
  },
  {
    id: 'C004', tipo: 'secretaria', nome: 'Secretaria de Saúde do Estado de MG', cnpj_cpf: '18.715.059/0001-03',
    cidade: 'Belo Horizonte', estado: 'MG', responsavel: 'Dr. Marcos Lima', cargo: 'Coordenador Jurídico',
    email: 'cj@saude.mg.gov.br', telefone: '(31) 3915-5600', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 31, honorarios_mensais: 28000, sla_horas: 48, certificado_digital: true,
    status: 'ativo', data_inicio: '2021-09-01', area_principal: 'Administrativo'
  },
  {
    id: 'C005', tipo: 'fundacao', nome: 'Fundação Educacional de Campinas', cnpj_cpf: '56.789.012/0001-23',
    cidade: 'Campinas', estado: 'SP', responsavel: 'Dra. Maria Costa', cargo: 'Presidente',
    email: 'presidencia@funeduc.org.br', telefone: '(19) 3210-4000', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 5, honorarios_mensais: 8000, sla_horas: 96, certificado_digital: false,
    status: 'ativo', data_inicio: '2024-02-10', area_principal: 'Trabalhista'
  },
  {
    id: 'C006', tipo: 'agencia', nome: 'Agência Reguladora Nacional de Energia', cnpj_cpf: '02.270.485/0001-45',
    cidade: 'Brasília', estado: 'DF', responsavel: 'Dr. Paulo Rodrigues', cargo: 'Gerente Jurídico',
    email: 'gjur@aneel.gov.br', telefone: '(61) 2192-8600', advogado_responsavel: 'Mauro Monção',
    processos_ativos: 19, honorarios_mensais: 18500, sla_horas: 48, certificado_digital: true,
    status: 'ativo', data_inicio: '2022-11-15', area_principal: 'Administrativo'
  },
];

export default function Cadastros() {
  const [cadastros, setCadastros] = useState<Cadastro[]>(mockCadastros);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoEntidade | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo' | 'prospecto'>('todos');
  const [selecionado, setSelecionado] = useState<Cadastro | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const filtrados = cadastros.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cnpj_cpf.includes(busca) || c.cidade.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    return matchBusca && matchTipo && matchStatus;
  });

  const totalHonorarios = filtrados.reduce((s, c) => s + c.honorarios_mensais, 0);
  const totalProcessos = filtrados.reduce((s, c) => s + c.processos_ativos, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-blue-400" />
            Cadastros Institucionais
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Municípios, câmaras, secretarias, empresas e entidades</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Novo Cadastro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Clientes', value: cadastros.length, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Processos Ativos', value: totalProcessos, icon: FileText, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Honorários/Mês', value: `R$ ${(totalHonorarios / 1000).toFixed(0)}K`, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Com Cert. Digital', value: cadastros.filter(c => c.certificado_digital).length, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
            placeholder="Buscar por nome, CNPJ, cidade..." />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)}
          className="bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="todos">Todos os tipos</option>
          {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)}
          className="bg-[#0f1623] border border-blue-900/40 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="prospecto">Prospectos</option>
        </select>
        <div className="flex gap-1">
          <button onClick={() => setView('grid')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-[#0f1623] text-gray-400 border border-blue-900/40 hover:text-gray-200'}`}>Grade</button>
          <button onClick={() => setView('table')} className={`px-3 py-2 rounded-lg text-sm transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-[#0f1623] text-gray-400 border border-blue-900/40 hover:text-gray-200'}`}>Tabela</button>
        </div>
      </div>

      {/* Content */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(c => {
            const tipo = TIPOS[c.tipo];
            return (
              <div key={c.id} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                onClick={() => setSelecionado(c)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tipo.icon}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipo.color}`}>{tipo.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {c.certificado_digital && <span title="Certificado Digital"><Shield size={14} className="text-green-400" /></span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'ativo' ? 'bg-green-500/20 text-green-400' : c.status === 'inativo' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-100 text-sm leading-tight mb-1">{c.nome}</h3>
                <p className="text-xs text-gray-500 mb-3">{c.cnpj_cpf} • {c.cidade}/{c.estado}</p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <User size={12} /><span>{c.responsavel} — {c.cargo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Mail size={12} /><span>{c.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-blue-900/20">
                  <div className="text-center">
                    <div className="text-sm font-bold text-white">{c.processos_ativos}</div>
                    <div className="text-xs text-gray-500">Processos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-green-400">R${(c.honorarios_mensais / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">Honorários</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-400">{c.sla_horas}h</div>
                    <div className="text-xs text-gray-500">SLA</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg py-1.5 hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-1">
                    <Eye size={12} />Ver Detalhes
                  </button>
                  <button className="text-xs bg-blue-900/20 text-gray-400 border border-blue-900/30 rounded-lg px-3 py-1.5 hover:text-gray-200 transition-colors">
                    <Edit size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {['Entidade', 'Tipo', 'Cidade/UF', 'Responsável', 'Processos', 'Honorários', 'SLA', 'Status', 'Ações'].map(h => (
                  <th key={h} className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => {
                const tipo = TIPOS[c.tipo];
                return (
                  <tr key={c.id} className="border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors cursor-pointer" onClick={() => setSelecionado(c)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm text-gray-200">{c.nome}</div>
                      <div className="text-xs text-gray-500">{c.cnpj_cpf}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipo.color}`}>{tipo.icon} {tipo.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.cidade}/{c.estado}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.responsavel}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white">{c.processos_ativos}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-400">R$ {c.honorarios_mensais.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-sm text-blue-400">{c.sla_horas}h</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === 'ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors"><Eye size={14} /></button>
                        <button className="text-gray-400 hover:text-gray-200 transition-colors"><Edit size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelecionado(null)}>
          <div className="bg-[#1a2744] border border-blue-900/50 rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TIPOS[selecionado.tipo].icon}</span>
                <div>
                  <h2 className="font-bold text-gray-100 text-base">{selecionado.nome}</h2>
                  <p className="text-xs text-gray-500">{selecionado.cnpj_cpf}</p>
                </div>
              </div>
              <button onClick={() => setSelecionado(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Tipo', value: TIPOS[selecionado.tipo].label },
                { label: 'Cidade/Estado', value: `${selecionado.cidade}/${selecionado.estado}` },
                { label: 'Responsável', value: selecionado.responsavel },
                { label: 'Cargo', value: selecionado.cargo },
                { label: 'E-mail', value: selecionado.email },
                { label: 'Telefone', value: selecionado.telefone },
                { label: 'Advogado Responsável', value: selecionado.advogado_responsavel },
                { label: 'Área Principal', value: selecionado.area_principal },
                { label: 'Processos Ativos', value: String(selecionado.processos_ativos) },
                { label: 'Honorários/Mês', value: `R$ ${selecionado.honorarios_mensais.toLocaleString('pt-BR')}` },
                { label: 'SLA', value: `${selecionado.sla_horas} horas` },
                { label: 'Início do Contrato', value: new Date(selecionado.data_inicio).toLocaleDateString('pt-BR') },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">{f.label}</div>
                  <div className="text-sm text-gray-200">{f.value}</div>
                </div>
              ))}
              {selecionado.observacoes && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Observações</div>
                  <div className="text-sm text-gray-300 bg-[#0f1623] rounded-lg p-3 border border-blue-900/30">{selecionado.observacoes}</div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-blue-900/30">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Edit size={14} />Editar Cadastro
              </button>
              <button className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                <FileText size={14} />Ver Processos
              </button>
              <button className="flex items-center gap-2 bg-green-600/20 text-green-400 border border-green-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-600/30 transition-colors">
                <Shield size={14} />Histórico de Demandas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
