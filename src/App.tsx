import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  Scale, Building2, FileText, Gavel, Clock, Calendar, BookOpen,
  PenTool, DollarSign, Link2, Users, BarChart3, Shield, Bell,
  Settings, ChevronDown, ChevronRight, Menu, X, Home, Search,
  LogOut, User, Zap, AlertTriangle, CheckCircle, Activity
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

// Navigation groups
const NAV_GROUPS = [
  {
    label: 'VISÃO GERAL',
    items: [
      { path: '/', icon: Home, label: 'Dashboard Executivo' },
    ]
  },
  {
    label: 'GESTÃO JURÍDICA',
    items: [
      { path: '/cadastros', icon: Building2, label: 'Cadastros Institucionais' },
      { path: '/protocolo', icon: FileText, label: 'Protocolo Digital' },
      { path: '/processos', icon: Gavel, label: 'Gestão Processual' },
      { path: '/cnj', icon: Scale, label: 'Integração CNJ' },
    ]
  },
  {
    label: 'CONTROLE & PRAZOS',
    items: [
      { path: '/prazos', icon: Clock, label: 'Prazos & Alertas' },
      { path: '/agenda', icon: Calendar, label: 'Agenda & Audiências' },
    ]
  },
  {
    label: 'DOCUMENTOS',
    items: [
      { path: '/documentos', icon: BookOpen, label: 'Docs & Pareceres' },
      { path: '/assinaturas', icon: PenTool, label: 'Assinatura Digital' },
    ]
  },
  {
    label: 'FINANCEIRO & CRM',
    items: [
      { path: '/financeiro', icon: DollarSign, label: 'Financeiro Corporativo' },
      { path: '/integracao-comercial', icon: Link2, label: 'Integração Comercial' },
    ]
  },
  {
    label: 'PORTAL & BI',
    items: [
      { path: '/portal-cliente', icon: Users, label: 'Portal do Cliente' },
      { path: '/bi', icon: BarChart3, label: 'BI & Dashboards' },
    ]
  },
  {
    label: 'SISTEMA',
    items: [
      { path: '/seguranca', icon: Shield, label: 'Segurança & LGPD' },
      { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    ]
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(['VISÃO GERAL', 'GESTÃO JURÍDICA', 'CONTROLE & PRAZOS', 'DOCUMENTOS', 'FINANCEIRO & CRM', 'PORTAL & BI', 'SISTEMA']);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]);
  };

  return (
    <aside className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ background: 'linear-gradient(180deg, #0f1623 0%, #1a2744 100%)', borderRight: '1px solid rgba(30,58,138,0.3)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-900/30">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
          <Scale size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">Lex Jurídico</div>
            <div className="text-blue-400 text-xs">Plataforma Corporativa</div>
          </div>
        )}
        <button onClick={onToggle} className="ml-auto text-gray-500 hover:text-gray-300 transition-colors">
          {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-400 transition-colors"
              >
                {group.label}
                {openGroups.includes(group.label) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
            {(collapsed || openGroups.includes(group.label)) && (
              <div className="mt-1 space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink key={item.path} to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-blue-900/30'
                        } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
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
        <div className="px-4 py-3 border-t border-blue-900/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-gray-500">Sistema Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              MM
            </div>
            <div>
              <div className="text-xs font-medium text-gray-300">Mauro Monção</div>
              <div className="text-xs text-gray-500">Sócio-Diretor</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function TopBar({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const current = allItems.find(i => i.path === location.pathname);

  const alerts = [
    { type: 'danger', msg: '3 prazos vencendo hoje' },
    { type: 'warning', msg: '2 audiências amanhã' },
    { type: 'info', msg: 'Novo processo recebido CNJ' },
  ];

  return (
    <header className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 py-3 border-b border-blue-900/30"
      style={{ left: collapsed ? '64px' : '256px', background: 'rgba(15,22,35,0.95)', backdropFilter: 'blur(12px)', transition: 'left 0.3s' }}>

      <div className="flex items-center gap-2">
        <span className="text-gray-100 font-semibold text-sm">{current?.label || 'Lex Jurídico'}</span>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="w-full bg-blue-900/20 border border-blue-900/30 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Buscar processo, cliente, prazo..." />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Alert indicators */}
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/30">
            <AlertTriangle size={11} />3
          </span>
          <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
            <Clock size={11} />2
          </span>
        </div>

        <button className="relative text-gray-400 hover:text-gray-200 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">5</span>
        </button>

        <div className="flex items-center gap-2 bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-900/30">
          <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">MM</div>
          <span className="text-xs text-gray-300 font-medium">Mauro Monção</span>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#0f1623' }}>
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

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastros" element={<Cadastros />} />
          <Route path="/protocolo" element={<Protocolo />} />
          <Route path="/processos" element={<Processos />} />
          <Route path="/cnj" element={<IntegracaoCNJ />} />
          <Route path="/prazos" element={<Prazos />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/assinaturas" element={<Assinaturas />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/integracao-comercial" element={<IntegracaoComercial />} />
          <Route path="/portal-cliente" element={<PortalCliente />} />
          <Route path="/bi" element={<BIDashboard />} />
          <Route path="/seguranca" element={<Seguranca />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
