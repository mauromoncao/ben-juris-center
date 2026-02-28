import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  Scale, Building2, FileText, Gavel, Clock, Calendar, BookOpen,
  PenTool, DollarSign, Link2, Users, BarChart3, Shield, Bell,
  Settings, ChevronDown, ChevronRight, Menu, X, Home, Search,
  LogOut, User, Zap, AlertTriangle, CheckCircle, Activity, Brain,
  Target, Map, BookMarked, Wand2, Layers
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
      { path: '/nucleo-ia',       icon: Brain,  label: 'Agentes Dr. Ben IA',       badge: '10' },
      { path: '/nucleo-projetos', icon: Activity,label: 'Projetos & Produtividade' },
      { path: '/eng-prompts',     icon: Wand2,  label: 'Engenheiro de Prompts',    badge: 'NEW' },
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
      className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ background: '#fff', borderRight: '1px solid #e2e8f0', boxShadow: '2px 0 16px rgba(30,58,138,0.06)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
          style={{ background: 'linear-gradient(135deg, #0f2340, #19385C)' }}>
          <Scale size={18} style={{ color: '#D4A017' }} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight font-serif" style={{ color: '#0f2340', letterSpacing: '-0.01em' }}>Ben Juris Center</div>
            <div className="text-xs font-semibold font-sans" style={{ color: '#D4A017', letterSpacing: '0.06em' }}>Plataforma Jurídica IA</div>
          </div>
        )}
        <button onClick={onToggle}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          style={{ marginLeft: collapsed ? 'auto' : undefined }}>
          {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-bold uppercase hover:text-slate-600 transition-colors font-sans" style={{ letterSpacing: '0.14em' }}>
                <span style={{ color: group.color || undefined }}>{group.label}</span>
                {openGroups.includes(group.label) ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
            )}
            {(collapsed || openGroups.includes(group.label)) && (
              <div className="mt-0.5 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                  return (
                    <NavLink key={`${item.path}-${item.label}`} to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold font-sans transition-all duration-150 ${isActive
                        ? 'shadow-md'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      } ${collapsed ? 'justify-center' : ''}`}
                      style={isActive ? { background: '#0f2340', color: '#D4A017' } : undefined}
                      title={collapsed ? item.label : undefined}>
                      <Icon size={15} className="flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}
                      {!collapsed && 'badge' in item && item.badge && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 font-sans ${isActive ? 'bg-white/20' : item.badge === 'NEW' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`} style={isActive ? { color: '#D4A017' } : undefined}>
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

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
            <span className="text-xs text-slate-500 font-medium">Sistema Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm font-sans"
              style={{ background: 'linear-gradient(135deg, #0f2340, #19385C)', color: '#D4A017' }}>MM</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate font-sans" style={{ color: '#0f2340' }}>Mauro Monção</div>
              <div className="text-xs font-medium font-sans" style={{ color: '#D4A017', letterSpacing: '0.04em' }}>Sócio-Diretor</div>
            </div>
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
      className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 py-3 border-b border-slate-200"
      style={{
        left: collapsed ? '64px' : '256px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        transition: 'left 0.3s',
        boxShadow: '0 1px 8px rgba(30,58,138,0.06)'
      }}>

      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm font-serif" style={{ color: '#0f2340', letterSpacing: '-0.01em' }}>{current?.label || 'Ben Juris Center'}</span>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            placeholder="Buscar processo, cliente, prazo..." />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Alert indicators */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200 font-semibold">
            <AlertTriangle size={11} />3
          </span>
          <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full border border-yellow-200 font-semibold">
            <Clock size={11} />2
          </span>
        </div>

        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-black">5</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: 'linear-gradient(135deg, #0f2340, #19385C)', color: '#D4A017' }}>MM</div>
          <span className="text-xs font-semibold font-sans" style={{ color: '#0f2340' }}>Mauro Monção</span>
        </div>
      </div>
    </header>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────
function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopBar collapsed={collapsed} />
      <main className="transition-all duration-300 pt-14"
        style={{ marginLeft: collapsed ? '64px' : '256px' }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"                    element={<Dashboard />} />
          <Route path="/cadastros"           element={<Cadastros />} />
          <Route path="/protocolo"           element={<Protocolo />} />
          <Route path="/processos"           element={<Processos />} />
          <Route path="/cnj"                 element={<IntegracaoCNJ />} />
          <Route path="/prazos"              element={<Prazos />} />
          <Route path="/agenda"              element={<Agenda />} />
          <Route path="/documentos"          element={<Documentos />} />
          <Route path="/assinaturas"         element={<Assinaturas />} />
          <Route path="/financeiro"          element={<Financeiro />} />
          <Route path="/integracao-comercial"element={<IntegracaoComercial />} />
          <Route path="/portal-cliente"      element={<PortalCliente />} />
          <Route path="/bi"                  element={<BIDashboard />} />
          <Route path="/seguranca"           element={<Seguranca />} />
          <Route path="/configuracoes"       element={<Configuracoes />} />
          <Route path="/nucleo-ia"           element={<NucleoIA />} />
          <Route path="/nucleo-projetos"     element={<NucleoProjetos />} />
          <Route path="/estrategia"          element={<GestaoEstrategica />} />
          <Route path="/eng-prompts"         element={<EngenheiroPrompts />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
