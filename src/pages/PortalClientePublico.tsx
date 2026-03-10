import React, { useState } from 'react';
import {
  FileText, Download, MessageSquare, CreditCard,
  Clock, Bell, LogOut, Eye, Send,
  ChevronRight, AlertTriangle, CheckCircle,
  Gavel, BarChart3, Menu, X,
  Phone, Mail, MapPin, Calendar,
} from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────
type TabCliente = 'inicio' | 'processos' | 'documentos' | 'financeiro' | 'mensagens';

// ── Dados do cliente logado (mock: Prefeitura de Teresina) ──────
const CLIENTE = {
  nome: 'Prefeitura Municipal de Teresina',
  responsavel: 'Dr. Carlos Sousa',
  tipo: '🏛️',
  cidade: 'Teresina/PI',
  email: 'juridico@teresina.pi.gov.br',
  telefone: '(86) 3215-7000',
  plano: 'Premium',
  cliente_desde: 'Janeiro/2024',
  advogado: 'Dr. Mauro Monção',
  oab: 'OAB/PI 12.345',
};

const PROCESSOS = [
  { numero: '0001234-55.2024.8.18.0001', titulo: 'Ação de Improbidade Administrativa', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '08/03/2026', proximo_prazo: '15/03/2026', risco: 'alto', resumo: 'Processo em fase de instrução. Aguardando designação de audiência de instrução e julgamento. Últimos movimentos: juntada de documentos e despacho judicial.' },
  { numero: '0007891-22.2023.4.01.4100', titulo: 'Mandado de Segurança Tributário', status: 'ativo', area: 'Tributário', tribunal: 'TRF1', ultimo_movimento: '01/03/2026', proximo_prazo: '20/03/2026', risco: 'medio', resumo: 'MS em julgamento no TRF1. Liminar deferida suspendendo exigibilidade do crédito fiscal. Aguardando mérito.' },
  { numero: '0000456-89.2025.8.18.0001', titulo: 'Ação Ordinária — Contrato Administrativo', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '05/03/2026', proximo_prazo: undefined, risco: 'baixo', resumo: 'Ação de cobrança por rescisão contratual. Citação realizada, aguardando contestação do réu.' },
  { numero: '0002345-01.2022.5.22.0001', titulo: 'Reclamação Trabalhista Coletiva', status: 'suspenso', area: 'Trabalhista', tribunal: 'TRT 22', ultimo_movimento: '15/02/2026', proximo_prazo: undefined, risco: 'alto', resumo: 'Processo suspenso por acordo de parcelamento. Monitoramento ativo dos prazos de pagamento.' },
  { numero: '0003456-77.2023.8.18.0050', titulo: 'Ação de Responsabilidade Civil', status: 'ativo', area: 'Civil', tribunal: 'TJPI', ultimo_movimento: '07/03/2026', proximo_prazo: '17/03/2026', risco: 'medio', resumo: 'Perícia técnica realizada. Laudo pericial favorável. Aguardando inclusão em pauta para julgamento.' },
];

const DOCUMENTOS = [
  { id: 'd1', titulo: 'Parecer Jurídico — Licitação Modal Pregão 012/2026', tipo: 'parecer', data: '08/03/2026', tamanho: '248 KB', lido: false, descricao: 'Análise da legalidade do edital e das propostas apresentadas.' },
  { id: 'd2', titulo: 'Petição Inicial — MS Tributário 0007891', tipo: 'peticao', data: '05/03/2026', tamanho: '182 KB', lido: true, descricao: 'Petição inicial do Mandado de Segurança com pedido liminar.' },
  { id: 'd3', titulo: 'Relatório Mensal Fevereiro/2026', tipo: 'relatorio', data: '01/03/2026', tamanho: '512 KB', lido: false, descricao: 'Relatório completo de todos os processos com movimentações de fevereiro.' },
  { id: 'd4', titulo: 'Procuração Ad Judicia et Extra', tipo: 'procuracao', data: '15/01/2026', tamanho: '95 KB', lido: true, descricao: 'Procuração geral para representação em todos os processos.' },
  { id: 'd5', titulo: 'Contrato de Honorários 2026', tipo: 'contrato', data: '02/01/2026', tamanho: '134 KB', lido: true, descricao: 'Contrato de prestação de serviços advocatícios para o exercício 2026.' },
];

const COBRANCAS = [
  { id: 'cb1', descricao: 'Honorários Março/2026 — Acompanhamento Processual', valor: 4500, vencimento: '15/03/2026', status: 'pendente' },
  { id: 'cb2', descricao: 'Elaboração de Parecer Jurídico — Pregão 012/2026', valor: 1200, vencimento: '10/03/2026', status: 'atrasado' },
  { id: 'cb3', descricao: 'Honorários Fevereiro/2026', valor: 4500, vencimento: '15/02/2026', status: 'pago' },
  { id: 'cb4', descricao: 'Honorários Janeiro/2026', valor: 4500, vencimento: '15/01/2026', status: 'pago' },
];

const MENSAGENS = [
  { id: 'm1', de: 'cliente', texto: 'Dr. Mauro, quando sai a sentença do processo 0001234?', hora: '10/03/2026 09:15', lida: true },
  { id: 'm2', de: 'escritorio', texto: 'Bom dia! O processo está em fase de julgamento. A previsão é para a 2ª quinzena de março, assim que for incluído em pauta pelo TJPI. Fique tranquilo que monitoramos diariamente.', hora: '10/03/2026 10:00', lida: true },
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

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — VISÃO DO CLIENTE
// ══════════════════════════════════════════════════════════════
export default function PortalClientePublico() {
  const [tab, setTab] = useState<TabCliente>('inicio');
  const [processoAberto, setProcessoAberto] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [mensagens, setMensagens] = useState(MENSAGENS);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoes] = useState(3);

  const docNaoLidos = DOCUMENTOS.filter(d => !d.lido).length;
  const msgNaoLidas = mensagens.filter(m => m.de === 'escritorio' && !m.lida).length;
  const valorPendente = COBRANCAS.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const processoAtivo = PROCESSOS.find(p => p.numero === processoAberto);

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    setMensagens(prev => [...prev, {
      id: `m-${Date.now()}`,
      de: 'cliente',
      texto: mensagem.trim(),
      hora: new Date().toLocaleString('pt-BR'),
      lida: true,
    }]);
    setMensagem('');
  };

  const TABS: { id: TabCliente; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inicio',     label: 'Início',     icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'processos',  label: 'Processos',  icon: <Gavel className="w-4 h-4" />,       badge: PROCESSOS.length },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" />,    badge: docNaoLidos || undefined },
    { id: 'financeiro', label: 'Financeiro', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'mensagens',  label: 'Mensagens',  icon: <MessageSquare className="w-4 h-4" />, badge: msgNaoLidas || undefined },
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
              <p className="text-xs leading-none mt-0.5 truncate max-w-[180px] sm:max-w-none" style={{ color: '#6b7aaa' }}>
                {CLIENTE.nome}
              </p>
            </div>
          </div>

          {/* Ações header */}
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" style={{ color: '#9ca3af' }} />
              {notificacoes > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: '#EF4444', color: '#fff', fontSize: '9px' }}>{notificacoes}</span>
              )}
            </button>

            {/* Avatar + nome */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1.5px solid rgba(212,160,23,0.4)' }}>
                {CLIENTE.tipo}
              </div>
              <span className="text-xs font-medium max-w-[120px] truncate" style={{ color: '#e2e8f0' }}>
                {CLIENTE.responsavel}
              </span>
            </div>

            {/* Menu mobile */}
            <button onClick={() => setMenuAberto(!menuAberto)}
              className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              {menuAberto ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>

            {/* Sair */}
            <button className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: '#9ca3af' }}>
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>

        {/* Tabs navegação */}
        <div className="border-t overflow-x-auto" style={{ borderColor: '#1a3060' }}>
          <div className="max-w-5xl mx-auto px-4 flex gap-0">
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setProcessoAberto(null); }}
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
                {CLIENTE.tipo}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white mb-0.5">
                  Olá, {CLIENTE.responsavel}
                </h1>
                <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{CLIENTE.nome}</p>
                <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#6b7aaa' }}>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{CLIENTE.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{CLIENTE.telefone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{CLIENTE.cidade}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Cliente desde {CLIENTE.cliente_desde}</span>
                </div>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <div className="text-xs px-3 py-1.5 rounded-full font-bold mb-1"
                  style={{ background: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
                  Plano {CLIENTE.plano}
                </div>
                <p className="text-xs" style={{ color: '#6b7aaa' }}>{CLIENTE.advogado}</p>
                <p className="text-xs" style={{ color: '#4a5580' }}>{CLIENTE.oab}</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Processos Ativos',  value: PROCESSOS.filter(p => p.status === 'ativo').length, icon: <Gavel className="w-5 h-5" />,         color: '#1d4ed8', bg: '#EFF6FF', onClick: () => setTab('processos') },
                { label: 'Docs. Não Lidos',   value: docNaoLidos,                                        icon: <FileText className="w-5 h-5" />,       color: docNaoLidos > 0 ? '#7c3aed' : '#9CA3AF', bg: docNaoLidos > 0 ? '#F5F3FF' : '#F9FAFB', onClick: () => setTab('documentos') },
                { label: 'Valor Pendente',    value: fmtCurrency(valorPendente),                         icon: <CreditCard className="w-5 h-5" />,     color: valorPendente > 0 ? '#d97706' : '#9CA3AF', bg: valorPendente > 0 ? '#FFFBEB' : '#F9FAFB', onClick: () => setTab('financeiro') },
                { label: 'Mensagens',         value: mensagens.length,                                   icon: <MessageSquare className="w-5 h-5" />,  color: '#059669', bg: '#F0FDF4', onClick: () => setTab('mensagens') },
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
            {PROCESSOS.filter(p => p.proximo_prazo).length > 0 && (
              <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: '#F0F0F0', background: '#FFFBF0' }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: '#D4A017' }} />
                  <span className="text-sm font-bold" style={{ color: '#92400E' }}>Prazos Próximos</span>
                </div>
                <div className="divide-y">
                  {PROCESSOS.filter(p => p.proximo_prazo).map((p, i) => (
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

            {/* Documentos recentes */}
            <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  <span className="text-sm font-bold" style={{ color: '#0f2044' }}>Documentos Recentes</span>
                </div>
                <button onClick={() => setTab('documentos')} className="text-xs" style={{ color: '#1d4ed8' }}>
                  Ver todos →
                </button>
              </div>
              <div className="divide-y">
                {DOCUMENTOS.slice(0, 3).map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                    {!d.lido && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#7c3aed' }} />}
                    <span className="text-xl flex-shrink-0">{TIPO_ICON[d.tipo]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: !d.lido ? '#1A1A1A' : '#6B7280' }}>{d.titulo}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{d.data} · {d.tamanho}</p>
                    </div>
                    {!d.lido && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ background: '#EDE9FE', color: '#7c3aed' }}>Novo</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div className="rounded-2xl p-5 border" style={{ background: '#F0F4FF', borderColor: '#DBEAFE' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#0f2044' }}>
                  <span className="text-lg">⚖️</span>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0f2044' }}>{CLIENTE.advogado}</p>
                  <p className="text-xs mb-2" style={{ color: '#6B7280' }}>{CLIENTE.oab} · Monção Advogados Associados</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setTab('mensagens')}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      <MessageSquare className="w-3.5 h-3.5" /> Enviar mensagem
                    </button>
                    <a href="tel:+558632157000"
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

            {/* Detalhe de processo aberto */}
            {processoAtivo ? (
              <div className="space-y-4">
                <button onClick={() => setProcessoAberto(null)}
                  className="flex items-center gap-1.5 text-xs font-medium hover:underline"
                  style={{ color: '#1d4ed8' }}>
                  ← Voltar a todos os processos
                </button>

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
                    <button onClick={() => setTab('mensagens')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      <MessageSquare className="w-4 h-4" /> Perguntar ao Dr. Mauro sobre este processo
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
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{PROCESSOS.length} processos</span>
                </div>

                <div className="space-y-3">
                  {PROCESSOS.map((p, i) => (
                    <button key={i} onClick={() => setProcessoAberto(p.numero)}
                      className="w-full bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all group"
                      style={{ borderColor: p.proximo_prazo ? '#FDE68A' : '#EEEEEE' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: p.status === 'ativo' ? '#EFF6FF' : '#F9FAFB' }}>
                          <Gavel className="w-5 h-5" style={{ color: p.status === 'ativo' ? '#1d4ed8' : '#9CA3AF' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold mb-1 truncate" style={{ color: '#1A1A1A' }}>{p.titulo}</p>
                          <p className="text-xs font-mono mb-2" style={{ color: '#9CA3AF' }}>{p.numero}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={p.status} />
                            <RiscoBadge risco={p.risco} />
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{p.area}</span>
                            <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>{p.tribunal}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          {p.proximo_prazo && (
                            <div className="flex items-center gap-1 text-xs font-bold mb-1" style={{ color: '#dc2626' }}>
                              <Clock className="w-3 h-3" /> {p.proximo_prazo}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#9CA3AF' }} />
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
                <FileText className="w-4 h-4" /> Meus Documentos
              </h2>
              {docNaoLidos > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: '#EDE9FE', color: '#7c3aed' }}>
                  {docNaoLidos} novo{docNaoLidos > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {DOCUMENTOS.map(d => (
                <div key={d.id} className="bg-white border rounded-2xl p-4"
                  style={{ borderColor: !d.lido ? '#DDD6FE' : '#EEEEEE' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: !d.lido ? '#F5F3FF' : '#F9FAFB', border: `1px solid ${!d.lido ? '#DDD6FE' : '#EEEEEE'}` }}>
                      {TIPO_ICON[d.tipo]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>{d.titulo}</p>
                        {!d.lido && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                            style={{ background: '#7c3aed', color: '#fff' }}>NOVO</span>
                        )}
                      </div>
                      <p className="text-xs mb-1" style={{ color: '#9CA3AF' }}>{d.descricao}</p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: '#9CA3AF' }}>
                        <span className="capitalize">{d.tipo}</span>
                        <span>{d.data}</span>
                        <span>{d.tamanho}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
                        style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
                        style={{ background: '#0f2044', color: '#D4A017' }}>
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

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pendente',  v: COBRANCAS.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0),  color: '#d97706', bg: '#FFFBEB', border: '#FDE68A' },
                { label: 'Em Atraso', v: COBRANCAS.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0),  color: '#dc2626', bg: '#FEF2F2', border: '#FECACA' },
                { label: 'Pago',      v: COBRANCAS.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0),       color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
              ].map(k => (
                <div key={k.label} className="rounded-2xl p-4 border" style={{ background: k.bg, borderColor: k.border }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: k.color }}>{k.label}</p>
                  <p className="text-lg font-bold" style={{ color: k.color }}>{fmtCurrency(k.v)}</p>
                </div>
              ))}
            </div>

            {/* Lista */}
            <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
              <div className="divide-y">
                {COBRANCAS.map((cb, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: cb.status === 'pago' ? '#F0FDF4' : cb.status === 'atrasado' ? '#FEF2F2' : '#FFFBEB',
                      }}>
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
                        style={
                          cb.status === 'pago'     ? { background: '#D1FAE5', color: '#065F46' } :
                          cb.status === 'atrasado' ? { background: '#FEE2E2', color: '#991B1B' } :
                                                     { background: '#FEF3C7', color: '#92400E' }
                        }>
                        {cb.status === 'pago' ? '✓ Pago' : cb.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
              Dúvidas sobre cobranças? <button onClick={() => setTab('mensagens')} className="underline" style={{ color: '#1d4ed8' }}>Fale conosco</button>
            </p>
          </div>
        )}

        {/* ═══ MENSAGENS ═══ */}
        {tab === 'mensagens' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
              <MessageSquare className="w-4 h-4" /> Mensagens — Dr. Mauro Monção
            </h2>

            {/* Chat */}
            <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
              <div className="px-5 py-3.5 border-b flex items-center gap-3" style={{ borderColor: '#F0F0F0', background: '#FAFBFC' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{ background: '#0f2044' }}>⚖️</div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#0f2044' }}>{CLIENTE.advogado}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{CLIENTE.oab}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#059669' }} />
                  <span className="text-xs" style={{ color: '#059669' }}>Online</span>
                </div>
              </div>

              {/* Mensagens */}
              <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                {mensagens.map(m => (
                  <div key={m.id} className={`flex items-end gap-2 ${m.de === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                    {m.de === 'escritorio' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: '#0f2044' }}>⚖️</div>
                    )}
                    <div className="max-w-[80%]">
                      <div className="px-4 py-3 rounded-2xl text-sm"
                        style={m.de === 'cliente'
                          ? { background: '#0f2044', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                          : { background: '#F4F6FA', color: '#1A1A1A', border: '1px solid #EEEEEE', borderRadius: '18px 18px 18px 4px' }}>
                        {m.texto}
                      </div>
                      <p className="text-xs mt-1 px-1" style={{ color: '#9CA3AF', textAlign: m.de === 'cliente' ? 'right' : 'left' }}>
                        {m.hora}
                      </p>
                    </div>
                    {m.de === 'cliente' && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: '#EFF6FF', border: '1.5px solid #DBEAFE' }}>
                        {CLIENTE.tipo}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex gap-2">
                  <textarea
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensagem(); } }}
                    placeholder="Escreva sua mensagem para o Dr. Mauro..."
                    rows={2}
                    className="flex-1 px-4 py-3 text-sm border rounded-xl resize-none focus:outline-none focus:border-blue-400 transition-colors"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#222' }}
                  />
                  <button
                    onClick={enviarMensagem}
                    disabled={!mensagem.trim()}
                    className="px-4 rounded-xl font-medium disabled:opacity-40 transition-all hover:opacity-80 flex items-center gap-1.5"
                    style={{ background: '#0f2044', color: '#D4A017' }}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Enter envia · Shift+Enter nova linha</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Rodapé ─────────────────────────────────────────────── */}
      <footer className="border-t py-4" style={{ borderColor: '#E5E7EB', background: '#fff' }}>
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            © 2026 Monção Advogados Associados · {CLIENTE.oab}
          </p>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Portal seguro · Dados protegidos pela LGPD
          </p>
        </div>
      </footer>
    </div>
  );
}
