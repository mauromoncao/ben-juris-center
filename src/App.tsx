import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import {
  Scale, Building2, FileText, Gavel, Clock, Calendar, BookOpen,
  PenTool, DollarSign, Link2, Users, BarChart3, Shield, Bell,
  Settings, ChevronDown, ChevronRight, Menu, X, Home, Search,
  LogOut, User, Zap, AlertTriangle, CheckCircle, Activity, Brain,
  Target, Map, BookMarked, Wand2, Layers, Calculator, Microscope
} from 'lucide-react';

// Pages
import Dashboard from './pages/Dashboard';
import Cadastros from './pages/Cadastros';
import Protocolo from './pages/Protocolo';
import Processos from './pages/Processos';
import IntegracaoCNJ from './pages/IntegracaoCNJ';
import Prazos from './pages/Prazos';
import Agenda from './pages/Agenda';
import Documentos from './pages/Documentos';
import Assinaturas from './pages/Assinaturas';
import Financeiro from './pages/Financeiro';
import IntegracaoComercial from './pages/IntegracaoComercial';
import PortalCliente from './pages/PortalCliente';
import BIDashboard from './pages/BIDashboard';
import Seguranca from './pages/Seguranca';
import Configuracoes from './pages/Configuracoes';
import NucleoIA from './pages/NucleoIA';
import NucleoProjetos from './pages/NucleoProjetos';
import GestaoEstrategica from './pages/GestaoEstrategica';
import EngenheiroPrompts from './pages/EngenheiroPrompts';
import ContadorIA from './pages/ContadorIA';
import PeritoIA from './pages/PeritoIA';
import SuperAgenteJuridico from './pages/SuperAgenteJuridico';
import AgenteOperacionalPremium from './pages/AgenteOperacionalPremium';
import AgenteOperacionalStandard from './pages/AgenteOperacionalStandard';
import AgenteTributaristaEstrategista from './pages/AgenteTributaristaEstrategista';
import AgentProcessualistaEstrategico from './pages/AgentProcessualistaEstrategico';
import MonitorCustos from './pages/MonitorCustos';
import PortalClientePublico from './pages/PortalClientePublico';
import LoginClientePage, { type ClienteAuth } from './pages/LoginClientePage';

// ─── Navigation Structure ─────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'VISÃO GERAL',
    items: [
      { path: '/', icon: Home, label: 'Dashboard Executivo' },
    ]
  },
  {
    label: 'NÚCLEO IA – DR. BEN',
    color: '#7c3aed',
    items: [
      { path: '/super-agente',    icon: Zap,    label: 'AGENTE OPERACIONAL MAXIMUS', badge: '⚡' },
      { path: '/agente-premium',   icon: Zap,    label: 'AGENTE OPERACIONAL PREMIUM',  badge: '🔷' },
      { path: '/agente-standard',   icon: Zap,    label: 'AGENTE OPERACIONAL STANDARD', badge: '🟢' },
      { path: '/tributarista-estrategista', icon: Zap, label: 'TRIBUTARISTA ESTRATEGISTA', badge: '⚖️' },
      { path: '/processualista-estrategico', icon: Scale, label: 'PROCESSUALISTA ESTRATÉGICO', badge: '📋' },
      { path: '/nucleo-ia',       icon: Brain,  label: 'Agentes Dr. Ben IA',       badge: '14' },
      { path: '/nucleo-projetos', icon: Activity,label: 'Projetos & Produtividade' },
      { path: '/eng-prompts',     icon: Wand2,       label: 'Engenheiro de Prompts',    badge: 'NEW' },
      { path: '/contador-ia',     icon: Calculator,  label: 'Contador IA',              badge: 'NOVO' },
      { path: '/perito-ia',       icon: Microscope,  label: 'Perito IA – Lab. Forense', badge: 'NOVO' },
    ]
  },
  {
    label: 'GESTÃO ESTRATÉGICA',
    color: '#0891b2',
    items: [
      { path: '/estrategia', icon: Target,    label: 'Metas & Estratégia'       },
      { path: '/estrategia', icon: Map,       label: 'Planejamento & Roadmap'   },
      { path: '/estrategia', icon: BookMarked,label: 'POPs – Proc. Operacionais' },
    ]
  },
  {
    label: 'GESTÃO JURÍDICA',
    color: '#2563eb',
    items: [
      { path: '/cadastros', icon: Building2, label: 'Cadastros Institucionais' },
      { path: '/protocolo', icon: FileText,  label: 'Protocolo Digital'        },
      { path: '/processos', icon: Gavel,     label: 'Gestão Processual'        },
      { path: '/cnj',       icon: Scale,     label: 'Integração CNJ'           },
    ]
  },
  {
    label: 'OPERAÇÕES',
    color: '#059669',
    items: [
      { path: '/prazos',  icon: Clock,    label: 'Prazos & Alertas'  },
      { path: '/agenda',  icon: Calendar, label: 'Agenda & Audiências' },
    ]
  },
  {
    label: 'SETOR PÚBLICO & DOCUMENTOS',
    color: '#d97706',
    items: [
      { path: '/documentos',  icon: BookOpen, label: 'Docs & Pareceres'    },
      { path: '/assinaturas', icon: PenTool,  label: 'Assinatura Digital'  },
    ]
  },
  {
    label: 'FINANCEIRO & CRM',
    color: '#dc2626',
    items: [
      { path: '/financeiro',          icon: DollarSign, label: 'Financeiro Corporativo' },
      { path: '/integracao-comercial',icon: Link2,       label: 'Integração Comercial'  },
    ]
  },
  {
    label: 'PORTAL & BI',
    color: '#7c3aed',
    items: [
      { path: '/portal-cliente', icon: Users,    label: 'Portal do Cliente' },
      { path: '/bi',             icon: BarChart3, label: 'BI & Dashboards'   },
    ]
  },
  {
    label: 'SISTEMA',
    items: [
      { path: '/seguranca',     icon: Shield,   label: 'Segurança & LGPD' },
      { path: '/configuracoes', icon: Settings, label: 'Configurações'    },
    ]
  },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(NAV_GROUPS.map(g => g.label));

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 overflow-y-auto ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ background: '#19385C', borderRight: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Logo – BEN personalizado */}
      <div className={`flex items-center gap-3 p-5 border-b flex-shrink-0 ${collapsed ? 'justify-center px-3' : ''}`}
        style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
          style={{ border: '1px solid rgba(222,192,120,0.40)' }}>
          <img src="/ben-logo.png" alt="BEN Logo" className="w-full h-full object-cover" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight font-serif text-white" style={{ letterSpacing: '-0.01em' }}>Ben Juris Center</div>
            <div className="text-xs font-semibold font-sans" style={{ color: '#DEC078', letterSpacing: '0.06em' }}>Plataforma Jurídica IA</div>
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="transition-colors flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.4)')}>
            <Menu size={15} />
          </button>
        )}
        {collapsed && (
          <button onClick={onToggle} className="transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color='rgba(255,255,255,0.9)')}
            onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.4)')}>
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Nav – padrão Ben Growth */}
      <nav className="flex-1 p-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 mb-1 font-sans font-semibold uppercase transition-colors"
                style={{ color: 'rgba(159,176,215,0.70)', fontSize: '0.68rem', letterSpacing: '0.13em' }}>
                <span>{group.label}</span>
                {openGroups.includes(group.label) ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
              </button>
            )}
            {(collapsed || openGroups.includes(group.label)) && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  return (
                    <NavLink key={`${item.path}-${item.label}`} to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                      style={isActive
                        ? { background: '#DEC078', color: '#19385C', fontWeight: 700 }
                        : { color: '#9fb0d7' }
                      }
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#ffffff'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9fb0d7'; }}}
                      title={collapsed ? item.label : undefined}>
                      <Icon size={16} className="flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && isActive && <ChevronRight size={12} className="flex-shrink-0" />}
                      {!collapsed && !isActive && 'badge' in item && item.badge && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 font-sans ${item.badge === 'NEW' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white/60'}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer – padrão Ben Growth */}
      {!collapsed && (
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 mb-3"
            style={{ background: 'rgba(212,160,23,0.10)', border: '1px solid rgba(212,160,23,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium font-sans" style={{ color: '#DEC078' }}>Sistema Ativo</span>
          </div>
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#DEC078', color: '#19385C' }}>MM</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate font-sans">Mauro Monção</p>
              <p className="text-xs font-sans" style={{ color: 'rgba(159,176,215,0.70)' }}>Sócio-Diretor · OAB/PI</p>
            </div>
            <button className="transition-colors" style={{ color: 'rgba(159,176,215,0.50)' }}
              onMouseEnter={e => (e.currentTarget.style.color='#ffffff')}
              onMouseLeave={e => (e.currentTarget.style.color='rgba(159,176,215,0.50)')}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const current = allItems.find(i =>
    i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)
  );

  return (
    <header
      className="h-14 bg-white border-b border-slate-200 fixed top-0 right-0 z-30 flex items-center justify-between px-6"
      style={{ left: collapsed ? '64px' : '256px', transition: 'left 0.3s' }}>

      {/* Título da página */}
      <div className="flex items-center gap-3">
        <div>
          <p className="font-semibold text-sm font-serif" style={{ color: '#19385C', letterSpacing: '-0.01em' }}>
            {current?.label || 'Ben Juris Center'}
          </p>
          <p className="text-slate-400 text-xs font-sans">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="flex-1 max-w-sm mx-6">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm font-sans text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary-700 focus:bg-white transition-colors"
            placeholder="Buscar processo, cliente, prazo..." />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3">
        {/* Agentes ativos */}
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-700 text-xs font-medium font-sans">14 Agentes Ativos</span>
        </div>
        {/* Prazos críticos */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1.5">
          <AlertTriangle size={11} className="text-amber-500" />
          <span className="text-amber-700 text-xs font-medium font-sans">3 prazos críticos</span>
        </div>
        {/* Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {/* Avatar + Logout */}
        <LogoutButtonJuris />
      </div>
    </header>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? 64 : 256;
  return (
    <div className="min-h-screen" style={{ background: '#FFFFFF', overflowX: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar collapsed={collapsed} />
      <main className="pt-14 min-h-screen transition-all duration-300 min-w-0"
        style={{ background: '#FFFFFF', marginLeft: `${sidebarW}px` }}>
        <div className="p-6 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Logout Button ──────────────────────────────────────────────────────────
function LogoutButtonJuris() {
  const { user, logout } = useAuth();
  const initials = user?.nome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'MM';
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ background: '#19385C', color: '#DEC078' }}>{initials}</div>
      <button
        onClick={logout}
        title="Sair"
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Rota Privada ─────────────────────────────────────────────────────────────
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ─── Portal Cliente Wrapper (login próprio) ───────────────────────────────────
function PortalClienteWrapper() {
  const [clienteLogado, setClienteLogado] = React.useState<ClienteAuth | null>(() => {
    try {
      const s = localStorage.getItem('ben_portal_cliente_auth');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const handleLogin = (c: ClienteAuth) => {
    setClienteLogado(c);
    localStorage.setItem('ben_portal_cliente_auth', JSON.stringify(c));
  };

  const handleLogout = () => {
    setClienteLogado(null);
    localStorage.removeItem('ben_portal_cliente_auth');
  };

  if (!clienteLogado) {
    return <LoginClientePage onLogin={handleLogin} />;
  }
  return <PortalClientePublico cliente={clienteLogado} onLogout={handleLogout} />;
}

// ─── Rotas da Aplicação ───────────────────────────────────────────────────────
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  // Se o hostname é portaldocliente.*, renderiza SEMPRE o portal do cliente
  const isPortalCliente = window.location.hostname.startsWith('portaldocliente.');
  if (isPortalCliente) {
    return (
      <Routes>
        <Route path="/*" element={<PortalClienteWrapper />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Rota pública — Portal do Cliente com login próprio */}
      <Route path="/cliente/*" element={<PortalClienteWrapper />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/"                     element={<Dashboard />} />
              <Route path="/cadastros"            element={<Cadastros />} />
              <Route path="/protocolo"            element={<Protocolo />} />
              <Route path="/processos"            element={<Processos />} />
              <Route path="/cnj"                  element={<IntegracaoCNJ />} />
              <Route path="/prazos"               element={<Prazos />} />
              <Route path="/agenda"               element={<Agenda />} />
              <Route path="/documentos"           element={<Documentos />} />
              <Route path="/assinaturas"          element={<Assinaturas />} />
              <Route path="/financeiro"           element={<Financeiro />} />
              <Route path="/integracao-comercial" element={<IntegracaoComercial />} />
              <Route path="/portal-cliente"       element={<PortalCliente />} />
              <Route path="/bi"                   element={<BIDashboard />} />
              <Route path="/seguranca"            element={<Seguranca />} />
              <Route path="/configuracoes"        element={<Configuracoes />} />
              <Route path="/nucleo-ia"            element={<NucleoIA />} />
              <Route path="/nucleo-projetos"      element={<NucleoProjetos />} />
              <Route path="/estrategia"           element={<GestaoEstrategica />} />
              <Route path="/super-agente"        element={<SuperAgenteJuridico />} />
              <Route path="/agente-premium"      element={<AgenteOperacionalPremium />} />
              <Route path="/agente-standard"     element={<AgenteOperacionalStandard />} />
              <Route path="/tributarista-estrategista" element={<AgenteTributaristaEstrategista />} />
              <Route path="/processualista-estrategico" element={<AgentProcessualistaEstrategico />} />
              <Route path="/eng-prompts"          element={<EngenheiroPrompts />} />
              <Route path="/contador-ia"         element={<ContadorIA />} />
              <Route path="/perito-ia"           element={<PeritoIA />} />
              {/* Rota oculta — monitor admin privado, não aparece no menu */}
              <Route path="/monitor-admin"       element={<MonitorCustos />} />
              <Route path="*"                     element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
