// ══════════════════════════════════════════════════════════════
// BEN ASSISTENTE GERAL — Chat Fixo Universal
// Copiloto do Dr. Ben | GPT-4o | Tema Claro Ecosystem IA
// ══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, X, Minimize2, Maximize2,
  Trash2, User, Loader2, ChevronDown,
  Copy, Check, Sparkles
} from 'lucide-react';

// ── Paleta — mesma do Ecosystem IA ──────────────────────────
const C = {
  bgApp:        '#F2F4F8',      // fundo principal cinza claro
  bgPanel:      '#FFFFFF',      // painel branco
  bgHeader:     '#0d1f3c',      // header azul escuro elegante
  gold:         '#C9A84C',      // dourado marca
  goldLight:    '#F0D080',      // dourado claro
  borderLight:  '#E8ECF0',      // borda suave
  textPrimary:  '#1A2332',      // texto principal escuro
  textSecond:   '#64748B',      // texto secundário
  textMuted:    '#94A3B8',      // texto apagado
  userBubble:   '#0d1f3c',      // balão usuário — azul escuro
  userText:     '#FFFFFF',      // texto balão usuário
  botBubble:    '#F8FAFC',      // balão bot — branco suave
  botBorder:    '#E2E8F0',      // borda balão bot
  botText:      '#1A2332',      // texto balão bot
  inputBg:      '#F8FAFC',      // fundo input
  inputBorder:  '#E2E8F0',      // borda input
  btnSend:      '#C9A84C',      // botão enviar dourado
  btnSendText:  '#0d1f3c',      // texto botão enviar
  scrollBar:    '#CBD5E1',
  green:        '#22C55E',
};

// ── Tipos ────────────────────────────────────────────────────
interface Mensagem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;
  elapsed?: number;
}

// ── Constantes ───────────────────────────────────────────────
const STORAGE_KEY   = 'ben_assistente_geral_msgs';
const MAX_MSGS      = 100;
const JURIS_API     = (import.meta as any).env?.VITE_JURIS_API_URL || 'https://juris.mauromoncao.adv.br';
const DR_BEN_AVATAR = '/dr-ben-avatar.jpg';

// ── Hook: persistência ────────────────────────────────────────
function useMensagens() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
    catch { return []; }
  });

  const salvar = useCallback((msgs: Mensagem[]) => {
    setMensagens(msgs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_MSGS))); } catch { /**/ }
  }, []);

  const addMensagem = useCallback((msg: Mensagem) => {
    setMensagens(prev => {
      const nova = [...prev, msg];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nova.slice(-MAX_MSGS))); } catch { /**/ }
      return nova;
    });
  }, []);

  const limpar = useCallback(() => {
    salvar([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [salvar]);

  return { mensagens, addMensagem, salvar, limpar };
}

// ── Renderizador markdown simples ─────────────────────────────
function renderInline(text: string, baseColor: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} style={{ color: baseColor, fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`'))
      return (
        <code key={i} style={{
          background: '#F1F5F9', color: '#0d1f3c',
          fontSize: '11px', padding: '1px 5px', borderRadius: 4,
          fontFamily: 'monospace', border: '1px solid #E2E8F0',
        }}>{p.slice(1, -1)}</code>
      );
    return p;
  });
}

function renderContent(text: string, isUser: boolean) {
  const color = isUser ? C.userText : C.botText;
  const goldColor = isUser ? '#F0D080' : C.gold;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontWeight: 700, fontSize: 12, color: goldColor, marginTop: 8, marginBottom: 4 }}>{line.slice(4)}</h3>;
    if (line.startsWith('## '))  return <h2 key={i} style={{ fontWeight: 700, fontSize: 13, color: goldColor, marginTop: 10, marginBottom: 4 }}>{line.slice(3)}</h2>;
    if (line.startsWith('# '))   return <h1 key={i} style={{ fontWeight: 700, fontSize: 14, color: goldColor, marginTop: 10, marginBottom: 4 }}>{line.slice(2)}</h1>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return <li key={i} style={{ marginLeft: 16, listStyleType: 'disc', fontSize: 11, color, lineHeight: 1.6 }}>{renderInline(line.slice(2), color)}</li>;
    if (/^\d+\. /.test(line))
      return <li key={i} style={{ marginLeft: 16, listStyleType: 'decimal', fontSize: 11, color, lineHeight: 1.6 }}>{renderInline(line.replace(/^\d+\. /, ''), color)}</li>;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} style={{ fontSize: 11, lineHeight: 1.65, color }}>{renderInline(line, color)}</p>;
  });
}

// ── Avatar Dr. Ben ────────────────────────────────────────────
function DrBenAvatar({ size = 32, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <img
        src={DR_BEN_AVATAR}
        alt="Dr. Ben"
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${C.gold}`,
          boxShadow: '0 2px 8px rgba(201,168,76,0.35)',
        }}
      />
      {pulse && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 9, height: 9,
          background: C.green,
          borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
          animation: 'pulse 2s infinite',
        }} />
      )}
    </div>
  );
}

// ── Balão de mensagem ─────────────────────────────────────────
function Balao({ msg }: { msg: Mensagem }) {
  const [copiado, setCopiado] = useState(false);
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>

      {/* Avatar */}
      {isUser ? (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #CBD5E1',
        }}>
          <User size={14} color={C.textSecond} />
        </div>
      ) : (
        <DrBenAvatar size={28} />
      )}

      {/* Bolha */}
      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 3 }}>
        <div
          className="group"
          style={{
            position: 'relative',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: '9px 13px',
            background: isUser ? C.userBubble : C.botBubble,
            border: isUser ? 'none' : `1px solid ${C.botBorder}`,
            color: isUser ? C.userText : C.botText,
            boxShadow: isUser
              ? '0 2px 8px rgba(13,31,60,0.20)'
              : '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderContent(msg.content, isUser)}
          </div>

          {/* Copiar */}
          <button
            onClick={handleCopy}
            title="Copiar"
            style={{
              position: 'absolute', top: 6, right: 6,
              opacity: 0, transition: 'opacity 0.15s',
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              color: isUser ? 'rgba(255,255,255,0.5)' : C.textMuted,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            {copiado ? <Check size={10} color={C.green} /> : <Copy size={10} />}
          </button>
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.textMuted }}>
            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {msg.model && <span style={{ fontSize: 10, color: C.textMuted }}>{msg.model}</span>}
          {msg.elapsed && <span style={{ fontSize: 10, color: C.textMuted }}>{(msg.elapsed / 1000).toFixed(1)}s</span>}
        </div>
      </div>
    </div>
  );
}

// ── Digitando ─────────────────────────────────────────────────
function Digitando() {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
      <DrBenAvatar size={28} />
      <div style={{
        borderRadius: '4px 16px 16px 16px',
        padding: '10px 14px',
        background: C.botBubble,
        border: `1px solid ${C.botBorder}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 150, 300].map(d => (
          <div key={d} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: C.gold, animationDelay: `${d}ms`,
            animation: 'bounce 1.2s infinite',
          }} className="animate-bounce" />
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function AssistenteGeral() {
  const [aberto, setAberto]       = useState(false);
  const [maximizado, setMaximizado] = useState(false);
  const [input, setInput]         = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [scrollAuto, setScrollAuto] = useState(true);
  const { mensagens, addMensagem, limpar } = useMensagens();

  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const fimRef    = useRef<HTMLDivElement>(null);
  const listaRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAuto && fimRef.current) fimRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, carregando, scrollAuto]);

  useEffect(() => {
    if (aberto && inputRef.current) setTimeout(() => inputRef.current?.focus(), 150);
  }, [aberto]);

  const handleScroll = () => {
    if (!listaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listaRef.current;
    setScrollAuto(scrollHeight - scrollTop - clientHeight < 60);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || carregando) return;

    setInput('');
    setErro(null);
    setScrollAuto(true);

    const msgUser: Mensagem = { id: `u-${Date.now()}`, role: 'user', content: texto, timestamp: Date.now() };
    addMensagem(msgUser);
    setCarregando(true);

    try {
      const res = await fetch(`${JURIS_API}/api/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-assistente-geral',
          input: texto,
          clientId: 'dr-mauro-moncao',
          context: { clientId: 'dr-mauro-moncao', fonte: 'assistente-geral-fixo' },
          useSearch: true,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      addMensagem({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.output || 'Sem resposta.',
        timestamp: Date.now(),
        model: data.modelUsed || data.model,
        elapsed: data.elapsed_ms,
      });
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setCarregando(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleLimpar = () => { if (confirm('Limpar todo o histórico de conversa?')) limpar(); };

  const largura = maximizado ? 'w-[680px]' : 'w-[360px]';
  const altura  = maximizado ? 'h-[82vh]'  : 'h-[530px]';

  // ── Botão flutuante fechado ───────────────────────────────
  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        title="Falar com Dr. Ben"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 18px 10px 12px',
          borderRadius: 40,
          background: '#0d1f3c',
          border: `1.5px solid ${C.gold}`,
          boxShadow: '0 8px 30px rgba(13,31,60,0.45), 0 0 0 3px rgba(201,168,76,0.12)',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(13,31,60,0.55), 0 0 0 4px rgba(201,168,76,0.20)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 8px 30px rgba(13,31,60,0.45), 0 0 0 3px rgba(201,168,76,0.12)'; }}
      >
        {/* Rosto Dr. Ben */}
        <DrBenAvatar size={34} pulse />

        {/* Label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ color: C.gold, fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Dr. Ben</span>
          <span style={{ color: 'rgba(159,176,215,0.80)', fontSize: 10, lineHeight: 1.2 }}>Assistente 24h</span>
        </div>

        {/* Badge de mensagens */}
        {mensagens.length > 0 && (
          <span style={{
            background: C.gold, color: '#0d1f3c',
            fontSize: 10, fontWeight: 800,
            padding: '1px 6px', borderRadius: 20,
            marginLeft: 2,
          }}>
            {mensagens.length}
          </span>
        )}
      </button>
    );
  }

  // ── Painel aberto ─────────────────────────────────────────
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-200 ${largura} ${altura}`}
      style={{
        background: C.bgApp,
        border: `1px solid ${C.borderLight}`,
        boxShadow: '0 20px 60px rgba(13,31,60,0.20), 0 4px 16px rgba(0,0,0,0.08)',
      }}
    >

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: C.bgHeader,
        borderBottom: `1px solid rgba(201,168,76,0.25)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DrBenAvatar size={36} pulse />
          <div>
            <p style={{ color: C.gold, fontWeight: 700, fontSize: 14, margin: 0, letterSpacing: '-0.01em' }}>
              Dr. Ben
            </p>
            <p style={{ color: 'rgba(159,176,215,0.80)', fontSize: 10, margin: 0 }}>
              {carregando ? '⏳ Pensando...' : '● Assistente 24h · GPT-4o'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {mensagens.length > 0 && (
            <button onClick={handleLimpar} title="Limpar histórico"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(159,176,215,0.45)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(159,176,215,0.45)')}
            ><Trash2 size={13} /></button>
          )}
          <button onClick={() => setMaximizado(!maximizado)} title={maximizado ? 'Minimizar' : 'Maximizar'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(159,176,215,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(159,176,215,0.45)')}
          >{maximizado ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
          <button onClick={() => setAberto(false)} title="Fechar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(159,176,215,0.45)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(159,176,215,0.45)')}
          ><X size={13} /></button>
        </div>
      </div>

      {/* ── Área de mensagens ─────────────────────────────── */}
      <div
        ref={listaRef}
        onScroll={handleScroll}
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 14px',
          background: C.bgPanel,
          scrollbarWidth: 'thin', scrollbarColor: `${C.scrollBar} transparent`,
        }}
      >
        {/* Empty state */}
        {mensagens.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '20px 0' }}>
            <DrBenAvatar size={60} pulse />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, margin: '0 0 4px', fontFamily: 'Georgia, serif' }}>
                Olá! Sou o Dr. Ben 👋
              </p>
              <p style={{ fontSize: 12, color: C.textSecond, margin: 0, lineHeight: 1.6 }}>
                Copiloto jurídico do Dr. Mauro Monção.<br />
                Pergunte sobre direito, negócios ou qualquer tema.
              </p>
            </div>

            {/* Sugestões rápidas */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 290 }}>
              {[
                'Como estruturar uma holding?',
                'Quais são meus processos urgentes?',
                'Explica rescisão indireta',
                'Dicas de produtividade jurídica',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                  style={{
                    fontSize: 10, padding: '6px 10px', borderRadius: 20,
                    background: '#F1F5F9', border: `1px solid ${C.borderLight}`,
                    color: C.textSecond, cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0d1f3c'; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = C.textSecond; e.currentTarget.style.borderColor = C.borderLight; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensagens */}
        {mensagens.map(msg => <Balao key={msg.id} msg={msg} />)}

        {/* Digitando */}
        {carregando && <Digitando />}

        {/* Erro */}
        {erro && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12,
            padding: '10px 12px', borderRadius: 10,
            background: '#FEF2F2', border: '1px solid #FECACA',
          }}>
            <span style={{ color: '#DC2626', fontSize: 11, flex: 1 }}>{erro}</span>
            <button onClick={() => setErro(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
              <X size={12} />
            </button>
          </div>
        )}

        <div ref={fimRef} />
      </div>

      {/* Scroll para baixo */}
      {!scrollAuto && (
        <button
          onClick={() => { setScrollAuto(true); fimRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
          style={{
            position: 'absolute', bottom: 72, right: 14,
            background: C.bgHeader, border: `1px solid ${C.gold}`,
            color: C.gold, borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <ChevronDown size={14} />
        </button>
      )}

      {/* ── Input ────────────────────────────────────────── */}
      <div style={{
        padding: '10px 12px 12px',
        borderTop: `1px solid ${C.borderLight}`,
        background: C.bgPanel,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte qualquer coisa..."
            rows={1}
            disabled={carregando}
            style={{
              flex: 1, resize: 'none', borderRadius: 12,
              padding: '9px 12px', fontSize: 12, fontFamily: 'inherit',
              outline: 'none', transition: 'border-color 0.15s',
              background: C.inputBg,
              border: `1.5px solid ${C.inputBorder}`,
              color: C.textPrimary,
              maxHeight: 96, lineHeight: 1.5,
              scrollbarWidth: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
            onBlur={e => (e.currentTarget.style.borderColor = C.inputBorder)}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 96) + 'px';
            }}
          />
          <button
            onClick={enviar}
            disabled={!input.trim() || carregando}
            style={{
              flexShrink: 0, width: 36, height: 36,
              borderRadius: 10, border: 'none', cursor: input.trim() && !carregando ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: input.trim() && !carregando ? C.btnSend : '#E2E8F0',
              color: input.trim() && !carregando ? C.btnSendText : C.textMuted,
              transition: 'all 0.15s',
              boxShadow: input.trim() && !carregando ? '0 2px 8px rgba(201,168,76,0.35)' : 'none',
            }}
            onMouseEnter={e => { if (input.trim() && !carregando) e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            title="Enviar (Enter)"
          >
            {carregando ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p style={{ fontSize: 10, marginTop: 6, textAlign: 'center', color: C.textMuted }}>
          Enter para enviar · Shift+Enter nova linha · Memória ativa
        </p>
      </div>
    </div>
  );
}
