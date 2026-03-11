import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Eye, Download, FileText, MessageSquare, CheckCircle,
  Clock, Building2, Bell, Lock, Search, Filter, Plus,
  Gavel, CreditCard, AlertTriangle, ChevronRight, Star,
  BarChart3, Shield, Globe, Phone, Mail, Calendar,
  Briefcase, X, Check, ExternalLink, TrendingUp,
  Hash, MapPin, UserCheck, Key, RefreshCw, Send,
  Smartphone, AtSign, Wifi, WifiOff, Loader2, BookOpen,
} from 'lucide-react';
import EscavadorPage from './EscavadorPage';
import JurisprudenciaPage from './JurisprudenciaPage';

// ── VPS Portal API ─────────────────────────────────────────────
const VPS_PORTAL = 'https://portal-api.mauromoncao.adv.br';

async function portalAPI(path: string, options?: RequestInit, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${VPS_PORTAL}${path}`, { ...options, headers: { ...headers, ...(options?.headers as Record<string, string> || {}) } });
  if (!r.ok) throw new Error(`API ${path}: ${r.status}`);
  return r.json();
}

interface WAMensagem {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  whatsapp: string;
  email: string;
  texto: string;
  de: 'cliente' | 'escritorio';
  canal: string;
  procedimento_id: string | null;
  procedimento_titulo: string | null;
  enviado_em: string;
  lida: boolean;
  enviado_whatsapp?: boolean;
  enviado_email?: boolean;
}

// ── Tipos ─────────────────────────────────────────────────────
type TabPortal = 'overview' | 'processos' | 'documentos' | 'financeiro' | 'mensagens' | 'acessos' | 'escavador' | 'jurisprudencia';

interface ClientePortal {
  id: string;
  nome: string;
  tipo: 'municipio' | 'camara' | 'empresa' | 'secretaria' | 'pessoa_fisica';
  cnpj_cpf: string;
  email: string;
  telefone: string;
  responsavel: string;
  cidade: string;
  uf: string;
  ultimo_acesso: string;
  status_acesso: 'ativo' | 'inativo' | 'bloqueado';
  processos: number;
  documentos_novos: number;
  mensagens: number;
  financeiro_pendente: number;
  plano: 'basico' | 'profissional' | 'premium';
  data_ingresso: string;
}

interface ProcessoCliente {
  numero: string;
  titulo: string;
  status: 'ativo' | 'suspenso' | 'encerrado';
  area: string;
  tribunal: string;
  ultimo_movimento: string;
  proximo_prazo?: string;
  risco: 'baixo' | 'medio' | 'alto';
}

interface DocumentoPortal {
  id: string;
  titulo: string;
  tipo: 'parecer' | 'peticao' | 'contrato' | 'relatorio' | 'certidao' | 'procuracao';
  data: string;
  tamanho: string;
  lido: boolean;
  cliente_id: string;
}

interface MensagemPortal {
  id: string;
  remetente: 'cliente' | 'escritorio';
  texto: string;
  hora: string;
  lida: boolean;
  cliente_id: string;
}

interface CobrancaPortal {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  cliente_id: string;
}

// ── Dados mock ─────────────────────────────────────────────────
const CLIENTES: ClientePortal[] = [
  { id: 'PC001', nome: 'Prefeitura Municipal de Teresina', tipo: 'municipio', cnpj_cpf: '06.554.729/0001-31', email: 'juridico@teresina.pi.gov.br', telefone: '(86) 3215-7000', responsavel: 'Dr. Carlos Sousa', cidade: 'Teresina', uf: 'PI', ultimo_acesso: '10/03/2026 10:30', status_acesso: 'ativo', processos: 47, documentos_novos: 3, mensagens: 1, financeiro_pendente: 2, plano: 'premium', data_ingresso: '15/01/2024' },
  { id: 'PC002', nome: 'Câmara Municipal de Parnaíba', tipo: 'camara', cnpj_cpf: '03.477.561/0001-00', email: 'presidente@camara.parnaiba.pi.leg.br', telefone: '(86) 3322-1800', responsavel: 'Vereador João Lima', cidade: 'Parnaíba', uf: 'PI', ultimo_acesso: '09/03/2026 16:00', status_acesso: 'ativo', processos: 23, documentos_novos: 0, mensagens: 2, financeiro_pendente: 0, plano: 'profissional', data_ingresso: '03/04/2024' },
  { id: 'PC003', nome: 'TechSol Soluções Digitais Ltda', tipo: 'empresa', cnpj_cpf: '31.876.543/0001-12', email: 'legal@techsol.com.br', telefone: '(86) 3344-5600', responsavel: 'Ana Paula Martins', cidade: 'Teresina', uf: 'PI', ultimo_acesso: '08/03/2026 09:00', status_acesso: 'ativo', processos: 8, documentos_novos: 1, mensagens: 0, financeiro_pendente: 1, plano: 'basico', data_ingresso: '22/06/2024' },
  { id: 'PC004', nome: 'Secretaria de Saúde do Piauí', tipo: 'secretaria', cnpj_cpf: '06.554.729/0006-82', email: 'juridico@saude.pi.gov.br', telefone: '(86) 3216-3600', responsavel: 'Dra. Fernanda Costa', cidade: 'Teresina', uf: 'PI', ultimo_acesso: '10/03/2026 08:00', status_acesso: 'ativo', processos: 31, documentos_novos: 5, mensagens: 3, financeiro_pendente: 0, plano: 'premium', data_ingresso: '10/09/2023' },
  { id: 'PC005', nome: 'Construbase Engenharia S.A.', tipo: 'empresa', cnpj_cpf: '22.334.556/0001-77', email: 'dir.juridico@construbase.com.br', telefone: '(86) 3321-9900', responsavel: 'Eng. Roberto Pinheiro', cidade: 'Picos', uf: 'PI', ultimo_acesso: '05/03/2026 14:00', status_acesso: 'inativo', processos: 12, documentos_novos: 0, mensagens: 1, financeiro_pendente: 3, plano: 'profissional', data_ingresso: '14/03/2025' },
];

const PROCESSOS_MOCK: ProcessoCliente[] = [
  { numero: '0001234-55.2024.8.18.0001', titulo: 'Ação de Improbidade Administrativa', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '08/03/2026', proximo_prazo: '15/03/2026', risco: 'alto' },
  { numero: '0007891-22.2023.4.01.4100', titulo: 'Mandado de Segurança Tributário', status: 'ativo', area: 'Tributário', tribunal: 'TRF1', ultimo_movimento: '01/03/2026', proximo_prazo: '20/03/2026', risco: 'medio' },
  { numero: '0000456-89.2025.8.18.0001', titulo: 'Ação Ordinária — Contrato Administrativo', status: 'ativo', area: 'Administrativo', tribunal: 'TJPI', ultimo_movimento: '05/03/2026', risco: 'baixo' },
  { numero: '0002345-01.2022.5.22.0001', titulo: 'Reclamação Trabalhista Coletiva', status: 'suspenso', area: 'Trabalhista', tribunal: 'TRT 22', ultimo_movimento: '15/02/2026', risco: 'alto' },
  { numero: '0003456-77.2023.8.18.0050', titulo: 'Ação de Responsabilidade Civil', status: 'ativo', area: 'Civil', tribunal: 'TJPI', ultimo_movimento: '07/03/2026', proximo_prazo: '17/03/2026', risco: 'medio' },
];

const DOCUMENTOS_MOCK: DocumentoPortal[] = [
  { id: 'd1', titulo: 'Parecer Jurídico — Licitação Modal Pregão 012/2026', tipo: 'parecer', data: '08/03/2026', tamanho: '248 KB', lido: false, cliente_id: 'PC001' },
  { id: 'd2', titulo: 'Petição Inicial — MS Tributário 0007891', tipo: 'peticao', data: '05/03/2026', tamanho: '182 KB', lido: true, cliente_id: 'PC001' },
  { id: 'd3', titulo: 'Relatório Mensal Fev/2026', tipo: 'relatorio', data: '01/03/2026', tamanho: '512 KB', lido: false, cliente_id: 'PC004' },
  { id: 'd4', titulo: 'Procuração Ad Judicia et Extra', tipo: 'procuracao', data: '28/02/2026', tamanho: '95 KB', lido: true, cliente_id: 'PC002' },
  { id: 'd5', titulo: 'Contrato de Honorários 2026', tipo: 'contrato', data: '15/01/2026', tamanho: '134 KB', lido: true, cliente_id: 'PC003' },
];

const MENSAGENS_MOCK: MensagemPortal[] = [
  { id: 'm1', remetente: 'cliente', texto: 'Dr. Mauro, quando sai a sentença do processo 0001234?', hora: '10/03/2026 09:15', lida: false, cliente_id: 'PC001' },
  { id: 'm2', remetente: 'escritorio', texto: 'O processo está em fase de julgamento. Previsão para 2ª quinzena de março.', hora: '10/03/2026 10:00', lida: true, cliente_id: 'PC001' },
  { id: 'm3', remetente: 'cliente', texto: 'Preciso do relatório mensal do Fevereiro com urgência.', hora: '09/03/2026 16:45', lida: false, cliente_id: 'PC002' },
  { id: 'm4', remetente: 'cliente', texto: 'Recebemos a intimação. O que fazemos?', hora: '09/03/2026 08:20', lida: false, cliente_id: 'PC004' },
];

const COBRANCAS_MOCK: CobrancaPortal[] = [
  { id: 'cb1', descricao: 'Honorários março/2026 — Acompanhamento processual', valor: 4500, vencimento: '15/03/2026', status: 'pendente', cliente_id: 'PC001' },
  { id: 'cb2', descricao: 'Elaboração de Parecer Jurídico — Licitação', valor: 1200, vencimento: '10/03/2026', status: 'atrasado', cliente_id: 'PC001' },
  { id: 'cb3', descricao: 'Honorários março/2026', valor: 2800, vencimento: '15/03/2026', status: 'pendente', cliente_id: 'PC003' },
  { id: 'cb4', descricao: 'Honorários fev/2026', valor: 2800, vencimento: '15/02/2026', status: 'pago', cliente_id: 'PC003' },
  { id: 'cb5', descricao: 'Sucesso em MS Tributário', valor: 8000, vencimento: '20/03/2026', status: 'pendente', cliente_id: 'PC005' },
];

// ── Helpers ─────────────────────────────────────────────────────
function tipoIcon(tipo: ClientePortal['tipo']) {
  const m: Record<ClientePortal['tipo'], string> = { municipio: '🏛️', camara: '⚖️', empresa: '🏢', secretaria: '📋', pessoa_fisica: '👤' };
  return m[tipo];
}
function planoBadge(plano: ClientePortal['plano']) {
  const m: Record<ClientePortal['plano'], { label: string; bg: string; color: string }> = {
    basico: { label: 'Básico', bg: '#F3F4F6', color: '#6B7280' },
    profissional: { label: 'Profissional', bg: '#DBEAFE', color: '#1D4ED8' },
    premium: { label: 'Premium', bg: '#FEF3C7', color: '#92400E' },
  };
  const s = m[plano];
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}
function statusBadge(status: 'ativo' | 'inativo' | 'bloqueado') {
  const m = { ativo: { label: 'Ativo', bg: '#D1FAE5', color: '#065F46' }, inativo: { label: 'Inativo', bg: '#F3F4F6', color: '#6B7280' }, bloqueado: { label: 'Bloqueado', bg: '#FEE2E2', color: '#991B1B' } };
  const s = m[status];
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}
function riscoBadge(risco: ProcessoCliente['risco']) {
  const m = { baixo: { label: 'Baixo', bg: '#D1FAE5', color: '#065F46' }, medio: { label: 'Médio', bg: '#FEF3C7', color: '#92400E' }, alto: { label: 'Alto', bg: '#FEE2E2', color: '#991B1B' } };
  const s = m[risco];
  return <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}
function docIcon(tipo: DocumentoPortal['tipo']) {
  const m: Record<DocumentoPortal['tipo'], string> = { parecer: '📋', peticao: '⚖️', contrato: '📝', relatorio: '📊', certidao: '🔏', procuracao: '📜' };
  return m[tipo];
}
function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function PortalCliente() {
  const [tab, setTab] = useState<TabPortal>('overview');
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientePortal | null>(null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [novaMensagem, setNovaMensagem] = useState('');
  const [showConvidarModal, setShowConvidarModal] = useState(false);

  // ── VPS / WhatsApp state ──────────────────────────────────────
  const [adminToken, setAdminToken]         = useState<string | null>(() => localStorage.getItem('ben_portal_admin_token'));
  const [vpsOnline, setVpsOnline]           = useState(false);
  const [waHistorico, setWaHistorico]       = useState<WAMensagem[]>([]);
  const [waCarregando, setWaCarregando]     = useState(false);
  const [enviandoMsg, setEnviandoMsg]       = useState(false);
  const [enviarWA, setEnviarWA]             = useState(true);
  const [enviarEmail, setEnviarEmail]       = useState(false);
  const [msgEnviada, setMsgEnviada]         = useState<string | null>(null);
  const [vpsClientes, setVpsClientes]       = useState<ClientePortal[]>([]);
  const [naolidas, setNaolidas]             = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── VPS login automático ──────────────────────────────────────
  useEffect(() => {
    async function loginVPS() {
      try {
        const r = await fetch(`${VPS_PORTAL}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'mauromoncaoadv.escritorio@gmail.com', senha: 'BenHub@Center2026' }),
        });
        if (r.ok) {
          const d = await r.json();
          setAdminToken(d.token);
          localStorage.setItem('ben_portal_admin_token', d.token);
          setVpsOnline(true);
        }
      } catch { setVpsOnline(false); }
    }

    async function healthCheck() {
      try {
        const r = await fetch(`${VPS_PORTAL}/health`);
        if (r.ok) {
          setVpsOnline(true);
          if (!adminToken) loginVPS();
        } else setVpsOnline(false);
      } catch { setVpsOnline(false); }
    }

    healthCheck();
    const iv = setInterval(healthCheck, 30000);
    return () => clearInterval(iv);
  }, []);

  // ── Carregar histórico WA do cliente selecionado ──────────────
  useEffect(() => {
    if (!clienteSelecionado || !adminToken || tab !== 'mensagens') return;
    async function carregarHistorico() {
      setWaCarregando(true);
      try {
        const d = await portalAPI(`/mensagens/historico/${clienteSelecionado!.id}`, {}, adminToken ?? undefined);
        setWaHistorico(d.mensagens || []);
      } catch { setWaHistorico([]); }
      setWaCarregando(false);
    }
    carregarHistorico();
    const iv = setInterval(carregarHistorico, 5000);
    return () => clearInterval(iv);
  }, [clienteSelecionado, adminToken, tab]);

  // ── Carregar não lidas ────────────────────────────────────────
  useEffect(() => {
    if (!adminToken) return;
    async function carregarNaoLidas() {
      try {
        const d = await portalAPI('/mensagens/nao-lidas', {}, adminToken ?? undefined);
        setNaolidas(d.total || 0);
      } catch { /* silent */ }
    }
    carregarNaoLidas();
    const iv = setInterval(carregarNaoLidas, 10000);
    return () => clearInterval(iv);
  }, [adminToken]);

  // ── Scroll para o fim do chat ─────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [waHistorico]);

  // ── Enviar resposta ao cliente ────────────────────────────────
  async function handleEnviarResposta() {
    if (!novaMensagem.trim() || !clienteSelecionado || !adminToken) return;
    setEnviandoMsg(true);
    setMsgEnviada(null);
    try {
      const d = await portalAPI('/mensagens/enviar', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: clienteSelecionado.id,
          texto: novaMensagem.trim(),
          enviar_whatsapp: enviarWA,
          enviar_email: enviarEmail,
        }),
      }, adminToken ?? undefined);
      setNovaMensagem('');
      const canais = [enviarWA && '📱 WhatsApp', enviarEmail && '📧 E-mail'].filter(Boolean).join(' + ');
      setMsgEnviada(`✅ Enviado${canais ? ' via ' + canais : ''}`);
      // Recarregar histórico
      const h = await portalAPI(`/mensagens/historico/${clienteSelecionado!.id}`, {}, adminToken ?? undefined);
      setWaHistorico(h.mensagens || []);
      setTimeout(() => setMsgEnviada(null), 3000);
    } catch (e: any) {
      setMsgEnviada('❌ Erro ao enviar. Verifique a conexão com o VPS.');
      setTimeout(() => setMsgEnviada(null), 5000);
    }
    setEnviandoMsg(false);
  }

  const totalProcessos = CLIENTES.reduce((s, c) => s + c.processos, 0);
  const totalPendentes = COBRANCAS_MOCK.filter(c => c.status === 'pendente' || c.status === 'atrasado').reduce((s, c) => s + c.valor, 0);
  const msgNaoLidas = naolidas || MENSAGENS_MOCK.filter(m => !m.lida && m.remetente === 'cliente').length;
  const docNaoLidos = DOCUMENTOS_MOCK.filter(d => !d.lido).length;

  const clientesFiltrados = CLIENTES.filter(c =>
    !buscaCliente ||
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.responsavel.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  const processosDoCLiente = clienteSelecionado
    ? PROCESSOS_MOCK.slice(0, clienteSelecionado.processos > 3 ? 5 : clienteSelecionado.processos)
    : PROCESSOS_MOCK;

  const docsDoCLiente = clienteSelecionado
    ? DOCUMENTOS_MOCK.filter(d => d.cliente_id === clienteSelecionado.id)
    : DOCUMENTOS_MOCK;

  const msgsDoCLiente = clienteSelecionado
    ? MENSAGENS_MOCK.filter(m => m.cliente_id === clienteSelecionado.id)
    : MENSAGENS_MOCK;

  const cobrancasDoCLiente = clienteSelecionado
    ? COBRANCAS_MOCK.filter(c => c.cliente_id === clienteSelecionado.id)
    : COBRANCAS_MOCK;

  // ── Tabs config ──────────────────────────────────────────────
  const TABS: { id: TabPortal; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'processos', label: 'Processos', icon: <Gavel className="w-4 h-4" />, badge: clienteSelecionado?.processos },
    { id: 'documentos', label: 'Documentos', icon: <FileText className="w-4 h-4" />, badge: docNaoLidos > 0 ? docNaoLidos : undefined },
    { id: 'financeiro', label: 'Financeiro', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'mensagens', label: 'Mensagens & WA', icon: <MessageSquare className="w-4 h-4" />, badge: msgNaoLidas > 0 ? msgNaoLidas : undefined },
    { id: 'acessos', label: 'Acessos', icon: <Key className="w-4 h-4" /> },
    { id: 'escavador', label: 'Monitor Escavador', icon: <Search className="w-4 h-4" /> },
    { id: 'jurisprudencia', label: 'Jurisprudência', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#FAFBFC' }}>

      {/* ── Sidebar de clientes ─────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ background: '#FFFFFF', borderColor: '#EEEEEE' }}>

        {/* Header sidebar */}
        <div className="border-b" style={{ borderColor: '#F0F0F0', background: '#0f2044' }}>
          {/* Logo strip */}
          <div className="px-4 py-3 flex items-center justify-center border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <img
              src="/logo-moncao.png"
              alt="Mauro Monção Advogados Associados"
              className="h-8 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold" style={{ color: '#D4A017' }}>Portal do Cliente</h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{CLIENTES.length} clientes · {CLIENTES.filter(c => c.status_acesso === 'ativo').length} ativos</p>
            </div>
            <button
              onClick={() => setShowConvidarModal(true)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}>
              <Plus className="w-3.5 h-3.5" /> Convidar
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
            <input
              value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
          </div>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Opção "Todos" */}
          <button
            onClick={() => setClienteSelecionado(null)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 ${!clienteSelecionado ? 'ring-1' : 'hover:bg-gray-50'}`}
            style={!clienteSelecionado ? { background: 'rgba(15,32,68,0.08)', color: '#0f2044' } : { color: '#374151' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: '#F0F4FF' }}>👥</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">Todos os Clientes</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{CLIENTES.length} clientes</p>
            </div>
          </button>

          {clientesFiltrados.map(c => (
            <button
              key={c.id}
              onClick={() => setClienteSelecionado(c)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 group ${clienteSelecionado?.id === c.id ? 'ring-1' : 'hover:bg-gray-50'}`}
              style={clienteSelecionado?.id === c.id ? { background: 'rgba(15,32,68,0.08)', color: '#0f2044' } : { color: '#374151' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: '#F9FAFB', border: '1px solid #EEEEEE' }}>
                {tipoIcon(c.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.nome}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {statusBadge(c.status_acesso)}
                  {(c.mensagens > 0 || c.documentos_novos > 0) && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#EF4444' }} />
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold" style={{ color: '#0f2044' }}>{c.processos}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>proc.</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Painel principal ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header principal */}
        <div className="px-6 py-4 border-b" style={{ background: '#FFFFFF', borderColor: '#EEEEEE' }}>
          {clienteSelecionado ? (
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#F0F4FF', border: '1px solid #DBEAFE' }}>
                  {tipoIcon(clienteSelecionado.tipo)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="text-base font-bold" style={{ color: '#0f2044' }}>{clienteSelecionado.nome}</h1>
                    {planoBadge(clienteSelecionado.plano)}
                    {statusBadge(clienteSelecionado.status_acesso)}
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: '#6B7280' }}>
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{clienteSelecionado.cnpj_cpf}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{clienteSelecionado.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{clienteSelecionado.telefone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{clienteSelecionado.cidade}/{clienteSelecionado.uf}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
                  style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                  <Shield className="w-3.5 h-3.5" /> Gerenciar Acesso
                </button>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#0f2044', color: '#D4A017' }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Ver Portal Público
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <Users className="w-5 h-5" /> Portal do Cliente
                </h1>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Gerencie o acesso institucional dos clientes aos processos e documentos</p>
              </div>
              <div className="flex items-center gap-3">
                {/* KPIs rápidos */}
                {[
                  { label: 'Clientes', value: CLIENTES.length, icon: '👥', color: '#0f2044' },
                  { label: 'Processos', value: totalProcessos, icon: '⚖️', color: '#1d4ed8' },
                  { label: 'Mensagens', value: msgNaoLidas, icon: '💬', color: '#dc2626' },
                  { label: 'Pendentes', value: fmtCurrency(totalPendentes), icon: '💰', color: '#d97706' },
                ].map(k => (
                  <div key={k.label} className="text-center px-4 py-2.5 rounded-2xl border" style={{ background: '#F9FAFB', borderColor: '#EEEEEE' }}>
                    <div className="text-base font-bold" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap relative"
                style={tab === t.id
                  ? { background: '#0f2044', color: '#D4A017' }
                  : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #EEEEEE' }}>
                {t.icon}
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '10px' }}>
                    {t.badge > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conteúdo das tabs ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* TAB: OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6 max-w-5xl">
              {/* Grid de clientes */}
              <div>
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <Users className="w-4 h-4" /> {clienteSelecionado ? 'Perfil do Cliente' : 'Todos os Clientes'}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {(clienteSelecionado ? [clienteSelecionado] : CLIENTES).map(c => (
                    <div key={c.id}
                      className="bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all"
                      style={{ borderColor: '#EEEEEE' }}
                      onClick={() => { if (!clienteSelecionado) setClienteSelecionado(c) }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: '#F9FAFB', border: '1px solid #EEEEEE' }}>
                          {tipoIcon(c.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>{c.nome}</span>
                            {planoBadge(c.plano)}
                            {statusBadge(c.status_acesso)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: '#9CA3AF' }}>
                            <span>{c.responsavel}</span>
                            <span>{c.cidade}/{c.uf}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Último acesso: {c.ultimo_acesso}</span>
                            <span>Cliente desde: {c.data_ingresso}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {[
                            { label: 'Processos', v: c.processos, color: '#1d4ed8' },
                            { label: 'Docs novos', v: c.documentos_novos, color: c.documentos_novos > 0 ? '#7c3aed' : '#9CA3AF' },
                            { label: 'Mensagens', v: c.mensagens, color: c.mensagens > 0 ? '#dc2626' : '#9CA3AF' },
                            { label: 'Financ. pend.', v: c.financeiro_pendente, color: c.financeiro_pendente > 0 ? '#d97706' : '#9CA3AF' },
                          ].map(k => (
                            <div key={k.label} className="text-center">
                              <div className="text-base font-bold" style={{ color: k.color }}>{k.v}</div>
                              <div className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</div>
                            </div>
                          ))}
                          {!clienteSelecionado && (
                            <ChevronRight className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Atividades recentes */}
              <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                <div className="px-5 py-3.5 border-b flex items-center gap-2" style={{ borderColor: '#F0F0F0' }}>
                  <Bell className="w-4 h-4" style={{ color: '#D4A017' }} />
                  <span className="text-sm font-bold" style={{ color: '#0f2044' }}>Atividades Recentes</span>
                </div>
                <div className="divide-y">
                  {[
                    { icon: '⚖️', desc: 'Novo movimento — Processo 0001234-55.2024', cliente: 'Prefeitura Teresina', hora: '14:30', tipo: 'processo' },
                    { icon: '📄', desc: 'Parecer Jurídico disponível para download', cliente: 'Câmara Parnaíba', hora: '12:00', tipo: 'documento' },
                    { icon: '💬', desc: 'Nova mensagem: "Quando sai a sentença?"', cliente: 'Secretaria de Saúde', hora: '09:15', tipo: 'mensagem' },
                    { icon: '💰', desc: 'Cobrança em atraso — Honorários Fev/2026', cliente: 'Construbase S.A.', hora: '08:30', tipo: 'financeiro' },
                    { icon: '🔑', desc: 'Novo acesso ao portal realizado', cliente: 'TechSol Ltda', hora: '07:00', tipo: 'acesso' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <span className="text-xl flex-shrink-0">{a.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{a.desc}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>{a.hora}</span>
                          <span className="text-xs" style={{ color: '#1d4ed8' }}>{a.cliente}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROCESSOS */}
          {tab === 'processos' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <Gavel className="w-4 h-4" /> Processos {clienteSelecionado ? `— ${clienteSelecionado.nome}` : 'Todos os Clientes'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{processosDoCLiente.length} processo(s)</span>
                  <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border hover:bg-gray-50 transition-colors"
                    style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                    <Filter className="w-3.5 h-3.5" /> Filtrar
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EEEEEE' }}>
                        {['Nº CNJ', 'Título', 'Área', 'Tribunal', 'Status', 'Risco', 'Próx. Prazo', ''].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {processosDoCLiente.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono" style={{ color: '#0f2044' }}>{p.numero}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium max-w-[200px] truncate" style={{ color: '#1A1A1A' }}>{p.titulo}</p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>Últ. mov.: {p.ultimo_movimento}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{p.area}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>{p.tribunal}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={p.status === 'ativo' ? { background: '#D1FAE5', color: '#065F46' } : p.status === 'suspenso' ? { background: '#FEF3C7', color: '#92400E' } : { background: '#F3F4F6', color: '#6B7280' }}>
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">{riscoBadge(p.risco)}</td>
                          <td className="px-4 py-3">
                            {p.proximo_prazo ? (
                              <span className="flex items-center gap-1 text-xs font-medium"
                                style={{ color: '#dc2626' }}>
                                <Clock className="w-3 h-3" /> {p.proximo_prazo}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                              style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                              <Eye className="w-3 h-3" /> Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTOS */}
          {tab === 'documentos' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <FileText className="w-4 h-4" /> Documentos {clienteSelecionado ? `— ${clienteSelecionado.nome}` : 'Publicados'}
                </h2>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#0f2044', color: '#D4A017' }}>
                  <Plus className="w-3.5 h-3.5" /> Publicar Documento
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(docsDoCLiente.length > 0 ? docsDoCLiente : DOCUMENTOS_MOCK).map(d => (
                  <div key={d.id} className="bg-white border rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-all"
                    style={{ borderColor: d.lido ? '#EEEEEE' : '#DBEAFE' }}>
                    {!d.lido && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#3B82F6' }} />}
                    <span className="text-2xl flex-shrink-0">{docIcon(d.tipo)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>{d.titulo}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: '#9CA3AF' }}>
                        <span className="capitalize">{d.tipo}</span>
                        <span>{d.data}</span>
                        <span>{d.tamanho}</span>
                        {!d.lido && <span className="font-semibold" style={{ color: '#1d4ed8' }}>Não lido</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50 transition-colors"
                        style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                        style={{ background: '#0f2044', color: '#D4A017' }}>
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </button>
                    </div>
                  </div>
                ))}

                {docsDoCLiente.length === 0 && clienteSelecionado && (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhum documento publicado para este cliente.</p>
                    <button className="mt-4 flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl mx-auto transition-all hover:opacity-80"
                      style={{ background: '#0f2044', color: '#D4A017' }}>
                      <Plus className="w-3.5 h-3.5" /> Publicar agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FINANCEIRO */}
          {tab === 'financeiro' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <CreditCard className="w-4 h-4" /> Financeiro {clienteSelecionado ? `— ${clienteSelecionado.nome}` : 'Geral'}
                </h2>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#0f2044', color: '#D4A017' }}>
                  <Plus className="w-3.5 h-3.5" /> Nova Cobrança
                </button>
              </div>

              {/* Resumo financeiro */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pendente', v: cobrancasDoCLiente.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0), color: '#d97706', bg: '#FEF3C7' },
                  { label: 'Em Atraso', v: cobrancasDoCLiente.filter(c => c.status === 'atrasado').reduce((s, c) => s + c.valor, 0), color: '#dc2626', bg: '#FEE2E2' },
                  { label: 'Pago (histórico)', v: cobrancasDoCLiente.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0), color: '#059669', bg: '#D1FAE5' },
                ].map(k => (
                  <div key={k.label} className="rounded-2xl p-4 border" style={{ background: k.bg, borderColor: k.color + '33' }}>
                    <p className="text-xs font-medium" style={{ color: k.color }}>{k.label}</p>
                    <p className="text-xl font-bold mt-1" style={{ color: k.color }}>{fmtCurrency(k.v)}</p>
                  </div>
                ))}
              </div>

              {/* Lista de cobranças */}
              <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EEEEEE' }}>
                        {['Descrição', 'Vencimento', 'Valor', 'Status', ''].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(cobrancasDoCLiente.length > 0 ? cobrancasDoCLiente : COBRANCAS_MOCK).map((cb, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{cb.descricao}</p>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: cb.status === 'atrasado' ? '#dc2626' : '#6B7280' }}>
                            <span className="flex items-center gap-1">
                              {cb.status === 'atrasado' && <AlertTriangle className="w-3 h-3" />}
                              {cb.vencimento}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold" style={{ color: '#0f2044' }}>
                            {fmtCurrency(cb.valor)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={
                                cb.status === 'pago' ? { background: '#D1FAE5', color: '#065F46' } :
                                cb.status === 'atrasado' ? { background: '#FEE2E2', color: '#991B1B' } :
                                cb.status === 'cancelado' ? { background: '#F3F4F6', color: '#6B7280' } :
                                { background: '#FEF3C7', color: '#92400E' }
                              }>
                              {cb.status === 'pago' ? '✓ Pago' : cb.status === 'atrasado' ? '⚠ Atrasado' : cb.status === 'cancelado' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {cb.status !== 'pago' && (
                              <button className="text-xs px-2.5 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-1"
                                style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                                <CreditCard className="w-3 h-3" /> Cobrar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MENSAGENS & WHATSAPP */}
          {tab === 'mensagens' && (
            <div className="max-w-2xl space-y-4">

              {/* Header + status VPS */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <MessageSquare className="w-4 h-4" />
                  {clienteSelecionado ? `Mensagens — ${clienteSelecionado.nome}` : 'Mensagens & WhatsApp'}
                </h2>
                <div className="flex items-center gap-2">
                  {vpsOnline
                    ? <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#D1FAE5', color: '#065F46' }}><Wifi className="w-3 h-3" /> VPS Online</span>
                    : <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: '#FEE2E2', color: '#991B1B' }}><WifiOff className="w-3 h-3" /> VPS Offline</span>
                  }
                  {naolidas > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#FEE2E2', color: '#991B1B' }}>
                      {naolidas} não lida{naolidas > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Selecionar cliente prompt */}
              {!clienteSelecionado && (
                <div className="bg-white border rounded-2xl p-8 text-center" style={{ borderColor: '#EEEEEE' }}>
                  <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Selecione um cliente para ver o histórico de mensagens</p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>As mensagens recebidas via WhatsApp aparecem automaticamente aqui</p>
                </div>
              )}

              {/* Histórico de mensagens */}
              {clienteSelecionado && (
                <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#EEEEEE' }}>

                  {/* Info do cliente */}
                  <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: '#F0F0F0', background: '#F9FAFB' }}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                      {clienteSelecionado.telefone && (
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3" style={{ color: '#22c55e' }} />
                          <span style={{ color: '#374151', fontWeight: 600 }}>WA: {clienteSelecionado.telefone}</span>
                        </span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <AtSign className="w-3 h-3" style={{ color: '#3b82f6' }} />
                        {clienteSelecionado.email}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!adminToken) return;
                        setWaCarregando(true);
                        try {
                          const d = await portalAPI(`/mensagens/historico/${clienteSelecionado!.id}`, {}, adminToken ?? undefined);
                          setWaHistorico(d.mensagens || []);
                        } catch { /* */ }
                        setWaCarregando(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <RefreshCw className={`w-3.5 h-3.5 ${waCarregando ? 'animate-spin' : ''}`} style={{ color: '#6B7280' }} />
                    </button>
                  </div>

                  {/* Lista de mensagens */}
                  <div className="max-h-[380px] overflow-y-auto px-5 py-3 space-y-3">
                    {waCarregando && waHistorico.length === 0 && (
                      <div className="text-center py-8">
                        <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: '#D1D5DB' }} />
                        <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>Carregando mensagens...</p>
                      </div>
                    )}
                    {!waCarregando && waHistorico.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: '#D1D5DB' }} />
                        <p className="text-sm" style={{ color: '#9CA3AF' }}>Nenhuma mensagem ainda.</p>
                        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Mensagens recebidas via WhatsApp aparecem aqui automaticamente.</p>
                      </div>
                    )}
                    {waHistorico.map(m => (
                      <div
                        key={m.id}
                        className={`flex ${m.de === 'escritorio' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                          style={{
                            background: m.de === 'escritorio' ? '#0f2044' : '#F3F4F6',
                            color: m.de === 'escritorio' ? '#ffffff' : '#1A1A1A',
                          }}>
                          {/* Canal indicador */}
                          <div className="flex items-center gap-1.5 mb-1 text-xs" style={{ opacity: 0.75 }}>
                            {m.canal === 'whatsapp'
                              ? <Smartphone className="w-3 h-3" />
                              : <AtSign className="w-3 h-3" />}
                            <span>{m.de === 'escritorio' ? 'Dr. Mauro Monção' : (clienteSelecionado?.responsavel || m.cliente_nome)}</span>
                            {m.procedimento_titulo && <span>· {m.procedimento_titulo}</span>}
                          </div>
                          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{m.texto}</p>
                          {/* Indicadores de envio */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ opacity: 0.65 }}>
                            <span>{new Date(m.enviado_em).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
                            {m.enviado_whatsapp && <span>📱</span>}
                            {m.enviado_email && <span>📧</span>}
                            {!m.lida && m.de === 'cliente' && (
                              <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FEE2E2', color: '#991B1B' }}>Novo</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input de resposta + toggles */}
                  <div className="p-4 border-t" style={{ borderColor: '#F0F0F0' }}>
                    {/* Toggles de canal */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold" style={{ color: '#374151' }}>Enviar via:</span>
                      <button
                        onClick={() => setEnviarWA(v => !v)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all`}
                        style={enviarWA
                          ? { background: '#dcfce7', borderColor: '#22c55e', color: '#15803d' }
                          : { background: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
                        <Smartphone className="w-3.5 h-3.5" />
                        WhatsApp {enviarWA ? '✓' : ''}
                      </button>
                      <button
                        onClick={() => setEnviarEmail(v => !v)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all`}
                        style={enviarEmail
                          ? { background: '#dbeafe', borderColor: '#3b82f6', color: '#1d4ed8' }
                          : { background: '#F9FAFB', borderColor: '#E5E7EB', color: '#6B7280' }}>
                        <AtSign className="w-3.5 h-3.5" />
                        E-mail {enviarEmail ? '✓' : ''}
                      </button>
                      {!vpsOnline && (
                        <span className="text-xs" style={{ color: '#f97316' }}>⚠️ VPS offline — mensagem pode não ser enviada</span>
                      )}
                    </div>

                    {/* Feedback de envio */}
                    {msgEnviada && (
                      <div className="mb-2 text-xs px-3 py-2 rounded-lg" style={{
                        background: msgEnviada.startsWith('✅') ? '#D1FAE5' : '#FEE2E2',
                        color: msgEnviada.startsWith('✅') ? '#065F46' : '#991B1B',
                      }}>{msgEnviada}</div>
                    )}

                    <div className="flex gap-3">
                      <textarea
                        value={novaMensagem}
                        onChange={e => setNovaMensagem(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleEnviarResposta(); }}
                        placeholder={`Escrever mensagem para ${clienteSelecionado.nome}... (Ctrl+Enter para enviar)`}
                        rows={2}
                        className="flex-1 px-4 py-3 text-sm border rounded-xl resize-none focus:outline-none focus:border-blue-400 transition-colors"
                        style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#222' }}
                      />
                      <button
                        onClick={handleEnviarResposta}
                        disabled={!novaMensagem.trim() || enviandoMsg || !adminToken}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-40 transition-all hover:opacity-80"
                        style={{ background: '#0f2044', color: '#D4A017' }}>
                        {enviandoMsg
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Send className="w-4 h-4" />}
                        Enviar
                      </button>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>Ctrl+Enter para enviar rápido</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ACESSOS */}
          {tab === 'acessos' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
                  <Key className="w-4 h-4" /> Gestão de Acessos
                </h2>
                <button
                  onClick={() => setShowConvidarModal(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#0f2044', color: '#D4A017' }}>
                  <Plus className="w-3.5 h-3.5" /> Convidar Cliente
                </button>
              </div>

              {/* Info sobre o portal */}
              <div className="bg-white border rounded-2xl p-5" style={{ borderColor: '#EEEEEE' }}>
                <div className="flex items-start gap-3 mb-4">
                  <Globe className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1d4ed8' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#0f2044' }}>Portal Público do Cliente</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      Cada cliente recebe acesso ao portal <strong>juris.mauromoncao.adv.br/cliente</strong> com login exclusivo para acompanhar seus processos, documentos e cobranças.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Ativos', v: CLIENTES.filter(c => c.status_acesso === 'ativo').length, color: '#059669', bg: '#D1FAE5' },
                    { label: 'Inativos', v: CLIENTES.filter(c => c.status_acesso === 'inativo').length, color: '#6B7280', bg: '#F3F4F6' },
                    { label: 'Bloqueados', v: CLIENTES.filter(c => c.status_acesso === 'bloqueado').length, color: '#dc2626', bg: '#FEE2E2' },
                  ].map(k => (
                    <div key={k.label} className="rounded-xl p-3 text-center" style={{ background: k.bg }}>
                      <p className="text-lg font-bold" style={{ color: k.color }}>{k.v}</p>
                      <p className="text-xs" style={{ color: k.color }}>{k.label}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #EEEEEE' }}>
                        {['Cliente', 'E-mail de Acesso', 'Último Acesso', 'Plano', 'Status', 'Ações'].map(h => (
                          <th key={h} className="text-left pb-2 text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {CLIENTES.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{tipoIcon(c.tipo)}</span>
                              <div>
                                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>{c.nome}</p>
                                <p className="text-xs" style={{ color: '#9CA3AF' }}>{c.responsavel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-xs" style={{ color: '#6B7280' }}>{c.email}</td>
                          <td className="py-3 text-xs" style={{ color: '#6B7280' }}>{c.ultimo_acesso}</td>
                          <td className="py-3">{planoBadge(c.plano)}</td>
                          <td className="py-3">{statusBadge(c.status_acesso)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <button className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 transition-colors"
                                style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                                <RefreshCw className="w-3 h-3" />
                              </button>
                              <button className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 transition-colors"
                                style={{ color: c.status_acesso === 'bloqueado' ? '#059669' : '#dc2626', borderColor: '#E5E7EB' }}>
                                {c.status_acesso === 'bloqueado' ? <UserCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                              </button>
                              <button className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 transition-colors"
                                style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Funcionalidades do portal */}
              <div>
                <h3 className="text-xs font-bold mb-3" style={{ color: '#9CA3AF' }}>FUNCIONALIDADES DO PORTAL PÚBLICO</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '⚖️', title: 'Acompanhamento de Processos', desc: 'Visualização em tempo real com movimentos, prazos e status por processo.' },
                    { icon: '📄', title: 'Download de Documentos', desc: 'Acesso a pareceres, petições, contratos e relatórios publicados pelo escritório.' },
                    { icon: '📊', title: 'Relatórios Mensais', desc: 'Dashboard com resumo processual, financeiro e indicadores de performance.' },
                    { icon: '💬', title: 'Chat Direto Seguro', desc: 'Comunicação direta com o escritório, rastreada e com histórico completo.' },
                    { icon: '💳', title: 'Gestão Financeira', desc: 'Visualização de honorários, cobranças pendentes e histórico de pagamentos.' },
                    { icon: '🔔', title: 'Notificações', desc: 'Alertas automáticos de novos movimentos, prazos críticos e documentos publicados.' },
                  ].map(f => (
                    <div key={f.title} className="bg-white border rounded-2xl p-4" style={{ borderColor: '#EEEEEE' }}>
                      <span className="text-2xl block mb-2">{f.icon}</span>
                      <h4 className="text-xs font-bold mb-1" style={{ color: '#1A1A1A' }}>{f.title}</h4>
                      <p className="text-xs" style={{ color: '#9CA3AF', lineHeight: '1.5' }}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ESCAVADOR */}
          {tab === 'escavador' && (
            <EscavadorPage />
          )}

          {/* TAB: JURISPRUDÊNCIA */}
          {tab === 'jurisprudencia' && (
            <JurisprudenciaPage />
          )}
        </div>
      </div>

      {/* ── Modal convidar cliente ──────────────────────────── */}
      {showConvidarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: '#0f2044' }}>Convidar Novo Cliente</h3>
              <button onClick={() => setShowConvidarModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" style={{ color: '#6B7280' }} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nome / Razão Social', placeholder: 'Prefeitura Municipal de...', type: 'text' },
                { label: 'E-mail de Acesso', placeholder: 'juridico@cliente.gov.br', type: 'email' },
                { label: 'CNPJ / CPF', placeholder: '00.000.000/0001-00', type: 'text' },
                { label: 'Responsável pelo Acesso', placeholder: 'Dr. Nome Sobrenome', type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#374151' }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                    style={{ borderColor: '#E5E7EB', color: '#222', background: '#F9FAFB' }}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: '#374151' }}>Plano</label>
                <select className="w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none transition-colors"
                  style={{ borderColor: '#E5E7EB', color: '#222', background: '#F9FAFB' }}>
                  <option value="basico">Básico</option>
                  <option value="profissional">Profissional</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConvidarModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm border font-medium hover:bg-gray-50 transition-colors"
                style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>
                Cancelar
              </button>
              <button onClick={() => setShowConvidarModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: '#0f2044', color: '#D4A017' }}>
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
