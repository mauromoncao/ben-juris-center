import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Download, MessageSquare, CreditCard,
  Clock, Bell, LogOut, Eye, Send,
  ChevronRight, AlertTriangle, CheckCircle,
  Gavel, BarChart3, Menu, X,
  Phone, Mail, MapPin, Calendar,
  Paperclip, Building2, ChevronDown,
  FolderOpen, Tag, Plus, Loader2,
} from 'lucide-react';
import type { ClienteAuth, Departamento } from './LoginClientePage';

// ── Tipos ──────────────────────────────────────────────────────
type TabCliente = 'inicio' | 'processos' | 'documentos' | 'financeiro' | 'procedimentos';

interface MensagemProc {
  id: string;
  de: 'cliente' | 'escritorio';
  texto: string;
  hora: string;
  lida: boolean;
  anexo?: { nome: string; tipo: string; tamanho: string };
}

interface Procedimento {
  id: string;
  titulo: string;
  tipo_documento: string;
  status: 'aberto' | 'em_andamento' | 'concluido';
  criado_em: string;
  atualizado_em: string;
  mensagens: MensagemProc[];
  departamento_id: string;
}

// ── Tipos de documentos (editável pelo escritório) ─────────────
const TIPOS_DOCUMENTO = [
  'Requerimento', 'Parecer Jurídico', 'Petição', 'Ofício',
  'Contrato', 'Certidão', 'Relatório', 'Procuração',
  'Memorando', 'Laudo Pericial', 'Recurso', 'Notificação',
  'Consulta Jurídica', 'Outro',
];

// ── Dados mock ─────────────────────────────────────────────────
const PROCESSOS_BASE = [
  { numero: '0001234-55.2024.8.18.0001', titulo: 'Ação de Improbidade Administrativa', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '08/03/2026', proximo_prazo: '15/03/2026', risco: 'alto', resumo: 'Processo em fase de instrução. Aguardando designação de audiência de instrução e julgamento. Últimos movimentos: juntada de documentos e despacho judicial.' },
  { numero: '0007891-22.2023.4.01.4100', titulo: 'Mandado de Segurança Tributário', status: 'ativo', area: 'Tributário', tribunal: 'TRF1', ultimo_movimento: '01/03/2026', proximo_prazo: '20/03/2026', risco: 'medio', resumo: 'MS em julgamento no TRF1. Liminar deferida suspendendo exigibilidade do crédito fiscal. Aguardando mérito.' },
  { numero: '0000456-89.2025.8.18.0001', titulo: 'Ação Ordinária — Contrato Administrativo', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '05/03/2026', proximo_prazo: undefined, risco: 'baixo', resumo: 'Ação de cobrança por rescisão contratual. Citação realizada, aguardando contestação do réu.' },
  { numero: '0002345-01.2022.5.22.0001', titulo: 'Reclamação Trabalhista Coletiva', status: 'suspenso', area: 'Trabalhista', tribunal: 'TRT 22', ultimo_movimento: '15/02/2026', proximo_prazo: undefined, risco: 'alto', resumo: 'Processo suspenso por acordo de parcelamento. Monitoramento ativo dos prazos de pagamento.' },
  { numero: '0003456-77.2023.8.18.0050', titulo: 'Ação de Responsabilidade Civil', status: 'ativo', area: 'Civil', tribunal: 'TJPI', ultimo_movimento: '07/03/2026', proximo_prazo: '17/03/2026', risco: 'medio', resumo: 'Perícia técnica realizada. Laudo pericial favorável. Aguardando inclusão em pauta para julgamento.' },
];

const DOCUMENTOS_BASE = [
  { id: 'd1', titulo: 'Parecer Jurídico — Licitação Modal Pregão 012/2026', tipo: 'parecer', data: '08/03/2026', tamanho: '248 KB', lido: false, descricao: 'Análise da legalidade do edital e das propostas apresentadas.' },
  { id: 'd2', titulo: 'Petição Inicial — MS Tributário 0007891', tipo: 'peticao', data: '05/03/2026', tamanho: '182 KB', lido: true, descricao: 'Petição inicial do Mandado de Segurança com pedido liminar.' },
  { id: 'd3', titulo: 'Relatório Mensal Fevereiro/2026', tipo: 'relatorio', data: '01/03/2026', tamanho: '512 KB', lido: false, descricao: 'Relatório completo de todos os processos com movimentações de fevereiro.' },
  { id: 'd4', titulo: 'Procuração Ad Judicia et Extra', tipo: 'procuracao', data: '15/01/2026', tamanho: '95 KB', lido: true, descricao: 'Procuração geral para representação em todos os processos.' },
  { id: 'd5', titulo: 'Contrato de Honorários 2026', tipo: 'contrato', data: '02/01/2026', tamanho: '134 KB', lido: true, descricao: 'Contrato de prestação de serviços advocatícios para o exercício 2026.' },
];

const COBRANCAS_BASE = [
  { id: 'cb1', descricao: 'Honorários Março/2026 — Acompanhamento Processual', valor: 4500, vencimento: '15/03/2026', status: 'pendente' },
  { id: 'cb2', descricao: 'Elaboração de Parecer Jurídico — Pregão 012/2026', valor: 1200, vencimento: '10/03/2026', status: 'atrasado' },
  { id: 'cb3', descricao: 'Honorários Fevereiro/2026', valor: 4500, vencimento: '15/02/2026', status: 'pago' },
  { id: 'cb4', descricao: 'Honorários Janeiro/2026', valor: 4500, vencimento: '15/01/2026', status: 'pago' },
];

const PROCEDIMENTOS_BASE: Procedimento[] = [
  {
    id: 'proc001', titulo: 'Solicitação de Parecer — Licitação Pregão 012/2026',
    tipo_documento: 'Parecer Jurídico', status: 'concluido',
    criado_em: '01/03/2026', atualizado_em: '08/03/2026',
    departamento_id: 'D001',
    mensagens: [
      { id: 'm1', de: 'cliente', texto: 'Dr. Mauro, precisamos de um parecer sobre o Pregão 012/2026. Segue o edital em anexo.', hora: '01/03/2026 09:00', lida: true, anexo: { nome: 'Edital_Pregao_012_2026.pdf', tipo: 'PDF', tamanho: '1.2 MB' } },
      { id: 'm2', de: 'escritorio', texto: 'Recebi o edital. Vou analisar e retornar em 48h úteis. Já identifiquei algumas cláusulas que merecem atenção.', hora: '01/03/2026 10:30', lida: true },
      { id: 'm3', de: 'escritorio', texto: 'Parecer concluído e disponibilizado na aba Documentos. Em resumo: edital está em conformidade, com ressalva em 3 cláusulas que recomendamos ajuste.', hora: '08/03/2026 14:00', lida: true, anexo: { nome: 'Parecer_Pregao_012_2026.pdf', tipo: 'PDF', tamanho: '248 KB' } },
    ],
  },
  {
    id: 'proc002', titulo: 'Requerimento — Certidão de Objeto e Pé',
    tipo_documento: 'Requerimento', status: 'em_andamento',
    criado_em: '09/03/2026', atualizado_em: '10/03/2026',
    departamento_id: 'D001',
    mensagens: [
      { id: 'm4', de: 'cliente', texto: 'Precisamos da certidão de objeto e pé do processo 0001234. Urgente para reunião na segunda.', hora: '09/03/2026 16:45', lida: true },
      { id: 'm5', de: 'escritorio', texto: 'Entendido. Já solicitei ao TJPI. Prazo de emissão é de 24-48h. Assim que disponível, encaminharemos aqui.', hora: '10/03/2026 08:30', lida: true },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────
const TIPO_ICON: Record<string, string> = {
  parecer: '📋', peticao: '⚖️', contrato: '📝',
  relatorio: '📊', certidao: '🔏', procuracao: '📜',
};

function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function RiscoBadge({ risco }: { risco: string }) {
  const m: Record<string, { label: string; bg: string; color: string }> = {
    baixo: { label: 'Baixo Risco', bg: '#D1FAE5', color: '#065F46' },
    medio: { label: 'Risco Médio', bg: '#FEF3C7', color: '#92400E' },
    alto:  { label: 'Alto Risco',  bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = m[risco] || m.baixo;
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { label: string; bg: string; color: string }> = {
    ativo:     { label: 'Em andamento', bg: '#DBEAFE', color: '#1E40AF' },
    suspenso:  { label: 'Suspenso',     bg: '#FEF3C7', color: '#92400E' },
    encerrado: { label: 'Encerrado',    bg: '#F3F4F6', color: '#6B7280' },
  };
  const s = m[status] || m.ativo;
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

function ProcStatusBadge({ status }: { status: Procedimento['status'] }) {
  const m = {
    aberto:       { label: 'Aberto',       bg: '#EFF6FF', color: '#1D4ED8' },
    em_andamento: { label: 'Em andamento', bg: '#FEF3C7', color: '#92400E' },
    concluido:    { label: 'Concluído',    bg: '#D1FAE5', color: '#065F46' },
  };
  const s = m[status];
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
interface Props {
  cliente: ClienteAuth;
  onLogout: () => void;
}

export default function PortalClientePublico({ cliente, onLogout }: Props) {
  const [tab, setTab] = useState<TabCliente>('inicio');
  const [processoAberto, setProcessoAberto] = useState<string | null>(null);
  const [procedimentoAberto, setProcedimentoAberto] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes] = useState(3);
  const [departamentoAtivo, setDepartamentoAtivo] = useState<Departamento>(cliente.departamentoAtivo);
  const [showDepMenu, setShowDepMenu] = useState(false);

  // Procedimento Interno — estados
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>(PROCEDIMENTOS_BASE);
  const [novaMensagemProc, setNovaMensagemProc] = useState('');
  const [anexoSelecionado, setAnexoSelecionado] = useState<File | null>(null);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [showNovoProc, setShowNovoProc] = useState(false);
  const [novoProc, setNovoProc] = useState({ titulo: '', tipo_documento: 'Requerimento', mensagem: '' });
  const [criandoProc, setCriandoProc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Rolar para o final do chat ao abrir procedimento
  useEffect(() => {
    if (procedimentoAberto) {
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [procedimentoAberto, procedimentos]);

  const docNaoLidos = DOCUMENTOS_BASE.filter(d => !d.lido).length;
  const valorPendente = COBRANCAS_BASE.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const processoAtivo = PROCESSOS_BASE.find(p => p.numero === processoAberto);
  const procAberto = procedimentos.find(p => p.id === procedimentoAberto);
  const procsPorDep = procedimentos.filter(p => p.departamento_id === departamentoAtivo.id);
  const procsNaoLidos = procsPorDep.reduce((sum, p) =>
    sum + p.mensagens.filter(m => m.de === 'escritorio' && !m.lida).length, 0);

  // ── Enviar mensagem no procedimento ───────────────────────
  const enviarMensagemProc = async () => {
    if (!novaMensagemProc.trim() && !anexoSelecionado) return;
    if (!procedimentoAberto) return;
    setEnviandoMensagem(true);
    await new Promise(r => setTimeout(r, 600));

    const nova: MensagemProc = {
      id: `m-${Date.now()}`,
      de: 'cliente',
      texto: novaMensagemProc.trim(),
      hora: new Date().toLocaleString('pt-BR'),
      lida: true,
      ...(anexoSelecionado ? {
        anexo: {
          nome: anexoSelecionado.name,
          tipo: anexoSelecionado.name.split('.').pop()?.toUpperCase() || 'DOC',
          tamanho: `${(anexoSelecionado.size / 1024).toFixed(0)} KB`,
        }
      } : {}),
    };

    setProcedimentos(prev => prev.map(p =>
      p.id === procedimentoAberto
        ? { ...p, mensagens: [...p.mensagens, nova], atualizado_em: nova.hora, status: 'em_andamento' as const }
        : p
    ));
    setNovaMensagemProc('');
    setAnexoSelecionado(null);
    setEnviandoMensagem(false);
  };

  // ── Criar novo procedimento ────────────────────────────────
  const criarProcedimento = async () => {
    if (!novoProc.titulo.trim() || !novoProc.mensagem.trim()) return;
    setCriandoProc(true);
    await new Promise(r => setTimeout(r, 700));

    const novo: Procedimento = {
      id: `proc-${Date.now()}`,
      titulo: novoProc.titulo.trim(),
      tipo_documento: novoProc.tipo_documento,
      status: 'aberto',
      criado_em: new Date().toLocaleDateString('pt-BR'),
      atualizado_em: new Date().toLocaleString('pt-BR'),
      departamento_id: departamentoAtivo.id,
      mensagens: [{
        id: `m-${Date.now()}`,
        de: 'cliente',
        texto: novoProc.mensagem.trim(),
        hora: new Date().toLocaleString('pt-BR'),
        lida: true,
      }],
    };

    setProcedimentos(prev => [novo, ...prev]);
    setNovoProc({ titulo: '', tipo_documento: 'Requerimento', mensagem: '' });
    setShowNovoProc(false);
    setCriandoProc(false);
    setProcedimentoAberto(novo.id);
  };

  const TABS: { id: TabCliente; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inicio',        label: 'Início',               icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'processos',     label: 'Processos',            icon: <Gavel className="w-4 h-4" />,          badge: PROCESSOS_BASE.length },
    { id: 'documentos',    label: 'Documentos',           icon: <FileText className="w-4 h-4" />,       badge: docNaoLidos || undefined },
    { id: 'financeiro',    label: 'Financeiro',           icon: <CreditCard className="w-4 h-4" /> },
    { id: 'procedimentos', label: 'Procedimento Interno', icon: <FolderOpen className="w-4 h-4" />,     badge: procsNaoLidos || undefined },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F6FA', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b shadow-sm" style={{ background: '#0f2044', borderColor: '#1a3060' }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo + cliente */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: '#D4A017', color: '#0f2044' }}>M</div>
            <div>
              <p className="text-xs font-bold leading-none" style={{ color: '#D4A017' }}>Monção Advogados</p>
              <p className="text-xs leading-none mt-0.5 truncate max-w-[160px] sm:max-w-[280px]" style={{ color: '#6b7aaa' }}>
                {cliente.nome}
              </p>
            </div>
          </div>

          {/* Centro: seletor de departamento */}
          {cliente.departamentos.length > 1 && (
            <div className="hidden sm:block relative">
              <button
                onClick={() => setShowDepMenu(p => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Building2 className="w-3.5 h-3.5" style={{ color: '#D4A017' }} />
                <span className="text-xs font-medium max-w-[160px] truncate">{departamentoAtivo.nome}</span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: '#6b7aaa' }} />
              </button>
              {showDepMenu && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl shadow-xl z-50 overflow-hidden"
                  style={{ background: '#0f2044', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="p-2 space-y-1">
                    {cliente.departamentos.map(dep => (
                      <button key={dep.id}
                        onClick={() => { setDepartamentoAtivo(dep); setShowDepMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs transition-all"
                        style={dep.id === departamentoAtivo.id
                          ? { background: 'rgba(212,160,23,0.2)', color: '#D4A017' }
                          : { color: '#e2e8f0' }}
                        onMouseEnter={e => { if (dep.id !== departamentoAtivo.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                        onMouseLeave={e => { if (dep.id !== departamentoAtivo.id) e.currentTarget.style.background = 'transparent' }}>
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: dep.id === departamentoAtivo.id ? '#D4A017' : '#6b7aaa' }} />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{dep.nome}</p>
                          {dep.descricao && <p className="truncate mt-0.5" style={{ color: '#6b7aaa' }}>{dep.descricao}</p>}
                        </div>
                        {dep.id === departamentoAtivo.id && <div className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ background: '#D4A017' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" style={{ color: '#9ca3af' }} />
              {notificacoes > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#EF4444', color: '#fff', fontSize: '9px' }}>{notificacoes}</span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1.5px solid rgba(212,160,23,0.4)' }}>
                {cliente.tipo === 'municipio' ? '🏛️' : cliente.tipo === 'empresa' ? '🏢' : '⚖️'}
              </div>
              <span className="text-xs font-medium max-w-[100px] truncate" style={{ color: '#e2e8f0' }}>
                {cliente.responsavel}
              </span>
            </div>
            <button onClick={() => setMenuAberto(!menuAberto)}
              className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              {menuAberto ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: '#9ca3af' }}>
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t overflow-x-auto" style={{ borderColor: '#1a3060' }}>
          <div className="max-w-5xl mx-auto px-4 flex gap-0">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setProcessoAberto(null); setProcedimentoAberto(null); }}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all relative"
                style={tab === t.id
                  ? { color: '#D4A017', borderBottom: '2px solid #D4A017' }
                  : { color: '#6b7aaa', borderBottom: '2px solid transparent' }}>
                {t.icon}
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#EF4444', color: '#fff', fontSize: '9px' }}>
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Conteúdo ───────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {/* ═══ INÍCIO ═══ */}
        {tab === 'inicio' && (
          <div className="space-y-6">

            {/* Boas-vindas */}
            <div className="rounded-2xl p-6 flex items-start gap-4"
              style={{ background: 'linear-gradient(135deg, #0f2044 0%, #19385C 100%)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(212,160,23,0.2)', border: '1.5px solid rgba(212,160,23,0.3)' }}>
                {cliente.tipo === 'municipio' ? '🏛️' : cliente.tipo === 'empresa' ? '🏢' : '⚖️'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white mb-0.5">Olá, {cliente.responsavel}</h1>
                <p className="text-sm mb-1" style={{ color: '#9ca3af' }}>{cliente.nome}</p>
                {cliente.departamentos.length > 1 && (
                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: '#D4A017' }}>
                    <Building2 className="w-3 h-3" /> {departamentoAtivo.nome}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#6b7aaa' }}>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{cliente.email}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Teresina/PI</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Cliente desde Janeiro/2024</span>
                </div>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <div className="text-xs px-3 py-1.5 rounded-full font-bold mb-1"
                  style={{ background: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                  Plano {cliente.plano === 'premium' ? 'Premium' : cliente.plano === 'profissional' ? 'Profissional' : 'Básico'}
                </div>
                <p className="text-xs" style={{ color: '#6b7aaa' }}>Dr. Mauro Monção</p>
                <p className="text-xs" style={{ color: '#4a5580' }}>OAB/PI 12.345</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Processos Ativos', value: PROCESSOS_BASE.filter(p => p.status === 'ativo').length, icon: <Gavel className="w-5 h-5" />, color: '#1d4ed8', bg: '#EFF6FF', onClick: () => setTab('processos') },
                { label: 'Docs. Não Lidos',  value: docNaoLidos, icon: <FileText className="w-5 h-5" />, color: docNaoLidos > 0 ? '#7c3aed' : '#9CA3AF', bg: docNaoLidos > 0 ? '#F5F3FF' : '#F9FAFB', onClick: () => setTab('documentos') },
                { label: 'Valor Pendente',   value: fmtCurrency(valorPendente), icon: <CreditCard className="w-5 h-5" />, color: valorPendente > 0 ? '#d97706' : '#9CA3AF', bg: valorPendente > 0 ? '#FFFBEB' : '#F9FAFB', onClick: () => setTab('financeiro') },
                { label: 'Procedimentos',    value: procsPorDep.filter(p => p.status !== 'concluido').length, icon: <FolderOpen className="w-5 h-5" />, color: '#059669', bg: '#F0FDF4', onClick: () => setTab('procedimentos') },
              ].map(k => (
                <button key={k.label} onClick={k.onClick}
                  className="rounded-2xl p-4 text-left border hover:shadow-md transition-all group"
                  style={{ background: k.bg, borderColor: '#EEEEEE' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ color: k.color }}>{k.icon}</div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: k.color }} />
                  </div>
                  <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{k.label}</p>
                </button>
              ))}
            </div>

            {/* Prazos críticos */}
            {PROCESSOS_BASE.filter(p => p.proximo_prazo).length > 0 && (
              <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: '#F0F0F0', background: '#FFFBF0' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#D4A017' }} />
                  <span className="text-sm font-bold" style={{ color: '#92400E' }}>Prazos Próximos</span>
                </div>
                <div className="divide-y">
                  {PROCESSOS_BASE.filter(p => p.proximo_prazo).map((p, i) => (
                    <button key={i} onClick={() => { setTab('processos'); setProcessoAberto(p.numero); }}
                      className="w-full flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: p.risco === 'alto' ? '#FEE2E2' : '#FEF3C7' }}>
                        <Clock className="w-5 h-5" style={{ color: p.risco === 'alto' ? '#dc2626' : '#d97706' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{p.titulo}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                          {p.tribunal} · Prazo: <strong style={{ color: '#dc2626' }}>{p.proximo_prazo}</strong>
                        </p>
                      </div>
                      <RiscoBadge risco={p.risco} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Últimos documentos */}
            <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  <span className="text-sm font-bold" style={{ color: '#0f2044' }}>Documentos Recentes</span>
                </div>
                <button onClick={() => setTab('documentos')} className="text-xs" style={{ color: '#1d4ed8' }}>Ver todos →</button>
              </div>
              <div className="divide-y">
                {DOCUMENTOS_BASE.slice(0, 3).map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    {!d.lido && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />}
                    <span className="text-xl flex-shrink-0">{TIPO_ICON[d.tipo]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: !d.lido ? '#1A1A1A' : '#6B7280' }}>{d.titulo}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{d.data} · {d.tamanho}</p>
                    </div>
                    {!d.lido && <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: '#EDE9FE', color: '#7c3aed' }}>Novo</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div className="rounded-2xl p-5 border" style={{ background: '#F0F4FF', borderColor: '#DBEAFE' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0f2044' }}>
                  <span className="text-lg">⚖️</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0f2044' }}>Dr. Mauro Monção</p>
                  <p className="text-xs mb-2" style={{ color: '#6B7280' }}>OAB/PI 12.345 · Monção Advogados Associados</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setTab('procedimentos')}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      <FolderOpen className="w-3.5 h-3.5" /> Abrir Procedimento
                    </button>
                    <a href="tel:+5586999484761"
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium hover:bg-white transition-colors"
                      style={{ color: '#1d4ed8', borderColor: '#DBEAFE' }}>
                      <Phone className="w-3.5 h-3.5" /> Ligar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROCESSOS ═══ */}
        {tab === 'processos' && (
          <div className="space-y-4">
            {processoAtivo ? (
              <div className="space-y-4">
                <button onClick={() => setProcessoAberto(null)}
                  className="flex items-center gap-1.5 text-xs font-medium hover:underline"
                  style={{ color: '#1d4ed8' }}>← Voltar a todos os processos</button>
                <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                  <div className="px-6 py-5 border-b" style={{ borderColor: '#F0F0F0' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold mb-1" style={{ color: '#0f2044' }}>{processoAtivo.titulo}</h2>
                        <p className="text-xs font-mono mb-2" style={{ color: '#6B7280' }}>{processoAtivo.numero}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={processoAtivo.status} />
                          <RiscoBadge risco={processoAtivo.risco} />
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{processoAtivo.area}</span>
                          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>{processoAtivo.tribunal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Resumo</h3>
                      <p className="text-sm" style={{ color: '#374151', lineHeight: '1.75' }}>{processoAtivo.resumo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #EEEEEE' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>ÚLTIMO MOVIMENTO</p>
                        <p className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{processoAtivo.ultimo_movimento}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: processoAtivo.proximo_prazo ? '#FFF7ED' : '#F9FAFB', border: `1px solid ${processoAtivo.proximo_prazo ? '#FDE68A' : '#EEEEEE'}` }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>PRÓXIMO PRAZO</p>
                        <p className="text-sm font-bold" style={{ color: processoAtivo.proximo_prazo ? '#dc2626' : '#9CA3AF' }}>
                          {processoAtivo.proximo_prazo || 'Sem prazo imediato'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => { setTab('procedimentos'); setShowNovoProc(true); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      <FolderOpen className="w-4 h-4" /> Abrir Procedimento sobre este processo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                    <Gavel className="w-4 h-4" /> Meus Processos
                  </h2>
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{PROCESSOS_BASE.length} processos</span>
                </div>
                <div className="space-y-3">
                  {PROCESSOS_BASE.map((p, i) => (
                    <button key={i} onClick={() => setProcessoAberto(p.numero)}
                      className="w-full bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all group"
                      style={{ borderColor: p.risco === 'alto' && p.status === 'ativo' ? '#FECACA' : '#EEEEEE' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ background: p.status === 'ativo' ? '#EFF6FF' : '#F9FAFB', border: `1px solid ${p.status === 'ativo' ? '#DBEAFE' : '#EEEEEE'}` }}>
                          ⚖️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold mb-1 truncate" style={{ color: '#1A1A1A' }}>{p.titulo}</p>
                          <p className="text-xs font-mono mb-2" style={{ color: '#9CA3AF' }}>{p.numero}</p>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={p.status} />
                            <RiscoBadge risco={p.risco} />
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{p.area}</span>
                            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{p.tribunal}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {p.proximo_prazo && (
                            <div className="text-xs px-2 py-1 rounded-lg mb-1" style={{ background: '#FEF2F2', color: '#dc2626' }}>
                              Prazo: {p.proximo_prazo}
                            </div>
                          )}
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>Últ. mov.: {p.ultimo_movimento}</p>
                          <ChevronRight className="w-4 h-4 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#9CA3AF' }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══ DOCUMENTOS ═══ */}
        {tab === 'documentos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                <FileText className="w-4 h-4" /> Documentos
              </h2>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>{docNaoLidos} não lido(s)</span>
            </div>
            <div className="space-y-3">
              {DOCUMENTOS_BASE.map(d => (
                <div key={d.id} className="bg-white border rounded-2xl p-4" style={{ borderColor: !d.lido ? '#DDD6FE' : '#EEEEEE' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: !d.lido ? '#F5F3FF' : '#F9FAFB', border: `1px solid ${!d.lido ? '#DDD6FE' : '#EEEEEE'}` }}>
                      {TIPO_ICON[d.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{d.titulo}</p>
                        {!d.lido && <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: '#7c3aed', color: '#fff' }}>NOVO</span>}
                      </div>
                      <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>{d.descricao}</p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: '#9CA3AF' }}>
                        <span className="capitalize">{d.tipo}</span>
                        <span>{d.data}</span>
                        <span>{d.tamanho}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border hover:bg-gray-50 transition-colors" style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80" style={{ background: '#0f2044', color: '#D4A017' }}>
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ FINANCEIRO ═══ */}
        {tab === 'financeiro' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
              <CreditCard className="w-4 h-4" /> Financeiro
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pendente',  v: COBRANCAS_BASE.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0),  color: '#d97706', bg: '#FFFBEB', border: '#FDE68A' },
                { label: 'Em Atraso', v: COBRANCAS_BASE.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0),  color: '#dc2626', bg: '#FEF2F2', border: '#FECACA' },
                { label: 'Pago',      v: COBRANCAS_BASE.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0),       color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
              ].map(k => (
                <div key={k.label} className="rounded-2xl p-4 border" style={{ background: k.bg, borderColor: k.border }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: k.color }}>{k.label}</p>
                  <p className="text-lg font-bold" style={{ color: k.color }}>{fmtCurrency(k.v)}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
              <div className="divide-y">
                {COBRANCAS_BASE.map((cb, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cb.status === 'pago' ? '#F0FDF4' : cb.status === 'atrasado' ? '#FEF2F2' : '#FFFBEB' }}>
                      {cb.status === 'pago'
                        ? <CheckCircle className="w-5 h-5" style={{ color: '#059669' }} />
                        : cb.status === 'atrasado'
                        ? <AlertTriangle className="w-5 h-5" style={{ color: '#dc2626' }} />
                        : <Clock className="w-5 h-5" style={{ color: '#d97706' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>{cb.descricao}</p>
                      <p className="text-xs mt-0.5" style={{ color: cb.status === 'atrasado' ? '#dc2626' : '#9CA3AF' }}>
                        {cb.status === 'atrasado' ? '⚠ Vencimento: ' : 'Vencimento: '}{cb.vencimento}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: '#0f2044' }}>{fmtCurrency(cb.valor)}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={cb.status === 'pago' ? { background: '#D1FAE5', color: '#065F46' } : cb.status === 'atrasado' ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#FEF3C7', color: '#92400E' }}>
                        {cb.status === 'pago' ? '✓ Pago' : cb.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
              Dúvidas sobre cobranças?{' '}
              <button onClick={() => { setTab('procedimentos'); setShowNovoProc(true); }} className="underline" style={{ color: '#1d4ed8' }}>Abrir procedimento</button>
            </p>
          </div>
        )}

        {/* ═══ PROCEDIMENTO INTERNO ═══ */}
        {tab === 'procedimentos' && (
          <div className="space-y-4">

            {/* Detalhe de um procedimento */}
            {procAberto ? (
              <div className="space-y-4">
                <button onClick={() => setProcedimentoAberto(null)}
                  className="flex items-center gap-1.5 text-xs font-medium hover:underline"
                  style={{ color: '#1d4ed8' }}>← Voltar aos procedimentos</button>

                <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                  {/* Header procedimento */}
                  <div className="px-5 py-4 border-b" style={{ borderColor: '#F0F0F0', background: '#FAFBFC' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: '#0f2044' }}>{procAberto.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <ProcStatusBadge status={procAberto.status} />
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                            <Tag className="w-3 h-3" /> {procAberto.tipo_documento}
                          </span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>Atualizado: {procAberto.atualizado_em}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: '#0f2044' }}>⚖️</div>
                        <div className="hidden sm:block text-xs">
                          <p className="font-bold" style={{ color: '#0f2044' }}>Dr. Mauro Monção</p>
                          <p style={{ color: '#9CA3AF' }}>OAB/PI 12.345</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: '#059669' }} />
                          <span className="text-xs hidden sm:block" style={{ color: '#059669' }}>Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="p-4 space-y-4 min-h-[300px] max-h-[440px] overflow-y-auto"
                    style={{ background: '#FAFBFC' }}>
                    {procAberto.mensagens.map(m => (
                      <div key={m.id} className={`flex items-end gap-2 ${m.de === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                        {m.de === 'escritorio' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: '#0f2044' }}>⚖️</div>
                        )}
                        <div className="max-w-[78%] space-y-1.5">
                          {/* Anexo */}
                          {m.anexo && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                              style={{
                                background: m.de === 'cliente' ? 'rgba(15,32,68,0.08)' : '#EFF6FF',
                                borderColor: m.de === 'cliente' ? 'rgba(15,32,68,0.15)' : '#DBEAFE',
                              }}>
                              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: m.de === 'cliente' ? '#0f2044' : '#1d4ed8' }} />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: '#1A1A1A' }}>{m.anexo.nome}</p>
                                <p className="text-xs" style={{ color: '#9CA3AF' }}>{m.anexo.tipo} · {m.anexo.tamanho}</p>
                              </div>
                              <button className="flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors">
                                <Download className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                              </button>
                            </div>
                          )}
                          {/* Texto */}
                          {m.texto && (
                            <div className="px-4 py-3 rounded-2xl text-sm"
                              style={m.de === 'cliente'
                                ? { background: '#0f2044', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                                : { background: '#fff', color: '#1A1A1A', border: '1px solid #EEEEEE', borderRadius: '18px 18px 18px 4px' }}>
                              {m.texto}
                            </div>
                          )}
                          <p className="text-xs px-1" style={{ color: '#9CA3AF', textAlign: m.de === 'cliente' ? 'right' : 'left' }}>
                            {m.hora}
                          </p>
                        </div>
                        {m.de === 'cliente' && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                            style={{ background: '#EFF6FF', border: '1.5px solid #DBEAFE' }}>
                            {cliente.tipo === 'municipio' ? '🏛️' : '🏢'}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t" style={{ borderColor: '#F0F0F0', background: '#fff' }}>
                    {/* Anexo selecionado */}
                    {anexoSelecionado && (
                      <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl"
                        style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#1d4ed8' }} />
                        <span className="text-xs font-medium flex-1 truncate" style={{ color: '#1d4ed8' }}>{anexoSelecionado.name}</span>
                        <button onClick={() => setAnexoSelecionado(null)}
                          className="flex-shrink-0 p-0.5 rounded hover:bg-blue-100 transition-colors">
                          <X className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl border hover:bg-gray-50 transition-colors flex-shrink-0"
                        style={{ color: '#6B7280', borderColor: '#E5E7EB' }}
                        title="Anexar documento">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <textarea
                        value={novaMensagemProc}
                        onChange={e => setNovaMensagemProc(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagemProc(); } }}
                        placeholder="Escreva sua mensagem ou anexe um documento..."
                        rows={2}
                        className="flex-1 px-4 py-3 text-sm border rounded-xl resize-none focus:outline-none transition-colors"
                        style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#222' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#93C5FD'}
                        onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                      />
                      <button
                        onClick={enviarMensagemProc}
                        disabled={(!novaMensagemProc.trim() && !anexoSelecionado) || enviandoMensagem}
                        className="px-4 rounded-xl font-medium disabled:opacity-40 transition-all hover:opacity-80 flex items-center gap-1.5 flex-shrink-0"
                        style={{ background: '#0f2044', color: '#D4A017' }}>
                        {enviandoMensagem
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Enter envia · Shift+Enter nova linha · 📎 para anexar documento</p>
                    <input ref={fileInputRef} type="file" className="hidden"
                      onChange={e => e.target.files?.[0] && setAnexoSelecionado(e.target.files[0])} />
                  </div>
                </div>
              </div>

            ) : (
              /* ── Lista de procedimentos ───────────────────────── */
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                      <FolderOpen className="w-4 h-4" /> Procedimento Interno
                    </h2>
                    {cliente.departamentos.length > 1 && (
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#6B7280' }}>
                        <Building2 className="w-3 h-3" /> {departamentoAtivo.nome}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNovoProc(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
                    style={{ background: '#0f2044', color: '#D4A017' }}>
                    <Plus className="w-3.5 h-3.5" /> Novo Procedimento
                  </button>
                </div>

                {/* Modal novo procedimento */}
                {showNovoProc && (
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-lg" style={{ borderColor: '#DBEAFE' }}>
                    <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#EFF6FF', background: '#F0F7FF' }}>
                      <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                        <Plus className="w-4 h-4" style={{ color: '#1d4ed8' }} /> Novo Procedimento
                      </h3>
                      <button onClick={() => setShowNovoProc(false)} className="p-1 rounded hover:bg-blue-100 transition-colors">
                        <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Título */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Assunto / Título</label>
                        <input
                          value={novoProc.titulo}
                          onChange={e => setNovoProc(p => ({ ...p, titulo: e.target.value }))}
                          placeholder="Ex: Solicitação de Parecer sobre Contrato nº 045/2026"
                          className="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors"
                          style={{ borderColor: '#E5E7EB', color: '#222' }}
                          onFocus={e => e.currentTarget.style.borderColor = '#93C5FD'}
                          onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                      {/* Tipo de documento */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>
                          Tipo de Documento <span className="font-normal text-xs" style={{ color: '#9CA3AF' }}>(o escritório definirá a resposta)</span>
                        </label>
                        <select
                          value={novoProc.tipo_documento}
                          onChange={e => setNovoProc(p => ({ ...p, tipo_documento: e.target.value }))}
                          className="w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors appearance-none"
                          style={{ borderColor: '#E5E7EB', color: '#222', background: '#fff' }}>
                          {TIPOS_DOCUMENTO.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      {/* Mensagem inicial */}
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Mensagem inicial</label>
                        <textarea
                          value={novoProc.mensagem}
                          onChange={e => setNovoProc(p => ({ ...p, mensagem: e.target.value }))}
                          placeholder="Descreva o que precisa. Seja específico para agilizar o atendimento..."
                          rows={4}
                          className="w-full px-4 py-3 text-sm border rounded-xl focus:outline-none resize-none transition-colors"
                          style={{ borderColor: '#E5E7EB', color: '#222' }}
                          onFocus={e => e.currentTarget.style.borderColor = '#93C5FD'}
                          onBlur={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowNovoProc(false)}
                          className="text-xs px-4 py-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
                          style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                          Cancelar
                        </button>
                        <button
                          onClick={criarProcedimento}
                          disabled={!novoProc.titulo.trim() || !novoProc.mensagem.trim() || criandoProc}
                          className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-all hover:opacity-80"
                          style={{ background: '#0f2044', color: '#D4A017' }}>
                          {criandoProc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {criandoProc ? 'Enviando...' : 'Abrir Procedimento'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista */}
                {procsPorDep.length === 0 && !showNovoProc ? (
                  <div className="text-center py-12 rounded-2xl border" style={{ background: '#FAFBFC', borderColor: '#EEEEEE' }}>
                    <FolderOpen className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: '#6B7280' }}>Nenhum procedimento</p>
                    <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Abra um procedimento para se comunicar com o escritório</p>
                    <button onClick={() => setShowNovoProc(true)}
                      className="text-xs px-4 py-2 rounded-xl font-medium transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      + Novo Procedimento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {procsPorDep.map(proc => {
                      const naoLidas = proc.mensagens.filter(m => m.de === 'escritorio' && !m.lida).length;
                      const ultimaMsg = proc.mensagens[proc.mensagens.length - 1];
                      return (
                        <button key={proc.id}
                          onClick={() => setProcedimentoAberto(proc.id)}
                          className="w-full bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all group"
                          style={{ borderColor: naoLidas > 0 ? '#DBEAFE' : '#EEEEEE' }}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: naoLidas > 0 ? '#EFF6FF' : '#F9FAFB', border: `1px solid ${naoLidas > 0 ? '#DBEAFE' : '#EEEEEE'}` }}>
                              <FolderOpen className="w-5 h-5" style={{ color: naoLidas > 0 ? '#1d4ed8' : '#9CA3AF' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{proc.titulo}</p>
                                {naoLidas > 0 && (
                                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ background: '#EF4444', color: '#fff', fontSize: '10px' }}>{naoLidas}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <ProcStatusBadge status={proc.status} />
                                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                                  style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                                  <Tag className="w-3 h-3" /> {proc.tipo_documento}
                                </span>
                              </div>
                              {ultimaMsg && (
                                <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                                  {ultimaMsg.de === 'escritorio' ? '⚖️ ' : ''}
                                  {ultimaMsg.texto || (ultimaMsg.anexo ? `📎 ${ultimaMsg.anexo.nome}` : '')}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>{proc.atualizado_em}</p>
                              <ChevronRight className="w-4 h-4 mt-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#9CA3AF' }} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </main>

      {/* ── Rodapé ─────────────────────────────────────────────── */}
      <footer className="border-t py-4" style={{ borderColor: '#E5E7EB', background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: '#9CA3AF' }}>© 2026 Monção Advogados Associados · OAB/PI 12.345</p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Portal seguro · Dados protegidos pela LGPD</p>
        </div>
      </footer>
    </div>
  );
}
