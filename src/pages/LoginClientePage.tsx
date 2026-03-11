import React, { useState } from 'react';
import { Scale, Eye, EyeOff, LogIn, Building2, AlertCircle, ChevronRight } from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────
export interface ClienteAuth {
  id: string;
  nome: string;
  email: string;
  tipo: 'municipio' | 'camara' | 'empresa' | 'secretaria' | 'pessoa_fisica';
  responsavel: string;
  plano: 'basico' | 'profissional' | 'premium';
  departamentos: Departamento[];
  departamentoAtivo: Departamento;
}

export interface Departamento {
  id: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
}

// ── Credenciais (substituir por VPS futuramente) ───────────────
// Acesso do escritório para demonstração e testes
const CLIENTES_AUTH = [
  {
    id: 'ADMIN001',
    email: 'mauromoncaoestudos@gmail.com',
    senha: 'BenHub@Center2026',
    nome: 'Mauro Monção Advogados Associados',
    tipo: 'empresa' as const,
    responsavel: 'Dr. Mauro Monção',
    plano: 'premium' as const,
    departamentos: [
      { id: 'D001', nome: 'Jurídico Geral', descricao: 'Acompanhamento processual geral', responsavel: 'Dr. Mauro Monção' },
      { id: 'D002', nome: 'Contencioso', descricao: 'Processos em andamento', responsavel: 'Dr. Mauro Monção' },
      { id: 'D003', nome: 'Consultivo', descricao: 'Pareceres e consultas jurídicas', responsavel: 'Dr. Mauro Monção' },
    ],
  },
  {
    id: 'ADMIN002',
    email: 'mauromoncaoadv.escritorio@gmail.com',
    senha: 'BenHub@Center2026',
    nome: 'Mauro Monção Advogados Associados',
    tipo: 'empresa' as const,
    responsavel: 'Dr. Mauro Monção',
    plano: 'premium' as const,
    departamentos: [
      { id: 'D004', nome: 'Jurídico Geral', descricao: 'Acompanhamento processual geral', responsavel: 'Dr. Mauro Monção' },
      { id: 'D005', nome: 'Contencioso', descricao: 'Processos em andamento', responsavel: 'Dr. Mauro Monção' },
      { id: 'D006', nome: 'Consultivo', descricao: 'Pareceres e consultas jurídicas', responsavel: 'Dr. Mauro Monção' },
    ],
  },
];

const TIPO_ICON: Record<string, string> = {
  municipio: '🏛️', camara: '⚖️', empresa: '🏢',
  secretaria: '📋', pessoa_fisica: '👤',
};

interface Props {
  onLogin: (cliente: ClienteAuth) => void;
}

export default function LoginClientePage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Estado de seleção de departamento
  const [clienteEncontrado, setClienteEncontrado] = useState<typeof CLIENTES_AUTH[0] | null>(null);
  const [etapa, setEtapa] = useState<'login' | 'departamento'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    await new Promise(r => setTimeout(r, 700));

    const found = CLIENTES_AUTH.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.senha === senha
    );

    setCarregando(false);

    if (!found) {
      setErro('E-mail ou senha inválidos. Verifique suas credenciais de acesso.');
      return;
    }

    // Se tem só 1 departamento, já entra direto
    if (found.departamentos.length === 1) {
      onLogin({
        ...found,
        departamentoAtivo: found.departamentos[0],
      });
      return;
    }

    // Sempre entra direto com o primeiro departamento (sem tela de seleção)
    onLogin({
      ...found,
      departamentoAtivo: found.departamentos[0],
    });
  };

  const handleSelecionarDepartamento = (dep: Departamento) => {
    if (!clienteEncontrado) return;
    onLogin({
      ...clienteEncontrado,
      departamentoAtivo: dep,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f2044 50%, #162d5c 100%)' }}>

      {/* Card principal */}
      <div className="w-full max-w-md">

        {/* Logo + título */}
        <div className="text-center mb-8">
          <img
            src="/logo-moncao.png"
            alt="Mauro Monção Advogados Associados"
            className="h-20 mx-auto mb-4 object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h1 className="text-xl font-bold text-white mb-1">Portal do Cliente</h1>
          <p className="text-sm" style={{ color: '#6b7aaa' }}>
            Mauro Monção Advogados Associados
          </p>
        </div>

        {/* ── ETAPA 1: Login ──────────────────────────────── */}
        {etapa === 'login' && (
          <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-base font-semibold text-white mb-6">Acesso Institucional</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                  E-mail institucional
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juridico@instituicao.gov.br"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,160,23,0.6)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                  Senha de acesso
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="••••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#ffffff',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,160,23,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors hover:text-white"
                    style={{ color: '#6b7aaa' }}>
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="flex items-start gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <p className="text-xs" style={{ color: '#fca5a5' }}>{erro}</p>
                </div>
              )}

              {/* Botão entrar */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #D4A017, #b8860b)', color: '#0f2044' }}>
                {carregando ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {carregando ? 'Verificando...' : 'Acessar Portal'}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-center" style={{ color: '#4a5580' }}>
                Acesso restrito a clientes autorizados pelo escritório.<br />
                Credenciais fornecidas por Monção Advogados.
              </p>
            </div>
          </div>
        )}

        {/* ── ETAPA 2: Selecionar Departamento ───────────── */}
        {etapa === 'departamento' && clienteEncontrado && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>

            {/* Cabeçalho cliente */}
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)' }}>
                  {TIPO_ICON[clienteEncontrado.tipo]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{clienteEncontrado.nome}</p>
                  <p className="text-xs" style={{ color: '#6b7aaa' }}>
                    Selecione o departamento para continuar
                  </p>
                </div>
              </div>
            </div>

            {/* Lista departamentos */}
            <div className="p-3 space-y-2">
              {clienteEncontrado.departamentos.map(dep => (
                <button
                  key={dep.id}
                  onClick={() => handleSelecionarDepartamento(dep)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-left group"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(212,160,23,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(212,160,23,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(15,32,68,0.5)' }}>
                    <Building2 className="w-4 h-4" style={{ color: '#D4A017' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{dep.nome}</p>
                    {dep.descricao && (
                      <p className="text-xs truncate mt-0.5" style={{ color: '#6b7aaa' }}>{dep.descricao}</p>
                    )}
                    {dep.responsavel && (
                      <p className="text-xs mt-0.5" style={{ color: '#4a5580' }}>Resp: {dep.responsavel}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#D4A017' }} />
                </button>
              ))}
            </div>

            {/* Voltar */}
            <div className="px-6 pb-5">
              <button
                onClick={() => { setEtapa('login'); setClienteEncontrado(null); setErro(''); }}
                className="text-xs hover:underline"
                style={{ color: '#6b7aaa' }}>
                ← Voltar ao login
              </button>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <p className="text-center text-xs mt-6" style={{ color: '#2d3a5c' }}>
          © 2026 Mauro Monção Advogados Associados · OAB/PI 12.345
        </p>
      </div>
    </div>
  );
}
