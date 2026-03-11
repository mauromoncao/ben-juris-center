// ============================================================
// BEN JURIS CENTER — Página de Login (Admin)
// Suporta: email/senha + Google OAuth
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = '9749981324-sv27al0lv1t7ikb2i1fpdq05k65hjaoe.apps.googleusercontent.com';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail]             = useState('');
  const [senha, setSenha]             = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando]   = useState(false);
  const [googleCarregando, setGoogleCarregando] = useState(false);
  const [erro, setErro]               = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);

  // ── Inicializa Google GSI ────────────────────────────────
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setGoogleCarregando(true);
          setErro('');
          const result = await loginWithGoogle(response.credential);
          setGoogleCarregando(false);
          if (!result.ok) setErro(result.erro || 'Erro ao autenticar com Google.');
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGoogleReady(true);
    };

    // Aguarda o script GSI carregar
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle]);

  // ── Renderiza botão Google nativo ───────────────────────
  useEffect(() => {
    if (googleReady && googleBtnRef.current && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_blue',
        size: 'large',
        width: '100%',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }
  }, [googleReady]);

  // ── Login email/senha ────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return; }
    setErro('');
    setCarregando(true);
    const result = await login(email, senha);
    setCarregando(false);
    if (!result.ok) setErro(result.erro || 'Erro ao autenticar.');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #050d1a 100%)' }}
    >
      {/* Brilho central azul */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-md relative">

        {/* Logo + Cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl"
            style={{ border: '1px solid rgba(222,192,120,0.45)', boxShadow: '0 0 32px rgba(222,192,120,0.25)' }}>
            <img src="/ben-logo.png" alt="BEN Logo" className="w-full h-full object-cover" />
          </div>
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: 'Inter, Georgia, serif', letterSpacing: '-0.01em' }}
          >
            Ben Juris Center
          </h1>
          <p className="text-sm" style={{ color: 'rgba(222,192,120,0.85)' }}>
            Módulo 02 — Gestão Jurídica
          </p>
        </div>

        {/* Card de login */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p className="text-white/60 text-sm text-center mb-6">
            Acesso restrito ao painel administrativo
          </p>

          {/* ── Botão Google ── */}
          <div className="mb-5">
            {googleCarregando ? (
              <div className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)' }}>
                <Loader2 size={16} className="animate-spin text-blue-400" />
                <span className="text-sm text-blue-400">Autenticando com Google...</span>
              </div>
            ) : (
              <div
                ref={googleBtnRef}
                className="w-full flex justify-center"
                style={{ minHeight: '44px' }}
              />
            )}
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>ou entre com e-mail</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.55)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.55)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2.5">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: carregando
                  ? 'rgba(59,130,246,0.4)'
                  : 'linear-gradient(135deg, #2563eb, #3b82f6, #1d4ed8)',
                color: '#ffffff',
                boxShadow: carregando ? 'none' : '0 0 20px rgba(59,130,246,0.30)',
              }}
            >
              {carregando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Autenticando...
                </>
              ) : (
                'Entrar no Ben Juris Center'
              )}
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.22)' }}>
          © 2026 Mauro Monção Advogados · BEN Ecosystem
        </p>
      </div>
    </div>
  );
}
