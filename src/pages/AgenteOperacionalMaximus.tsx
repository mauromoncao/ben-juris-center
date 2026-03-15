import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { downloadDocx } from '../lib/generateDocx';
let _sessionTimbreFile: File | null = null

import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Scale, Shield,
  FileText, Clock, Star, Target, Brain, Sparkles,
  Download, Search, Gavel, Upload, X, ChevronRight,
  Database, Wifi, Calendar, DollarSign, MessageSquare, Bot,
  FileSearch, BarChart3, Info, AlertTriangle,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  elapsed?: number;
  thinkingAtivo?: boolean;
  risco?: string;
  confianca?: number;
}

interface DocumentoAnexo {
  nome: string;
  tipo: string;
  tamanho: number;
  texto: string;
}

const CONSULTAS_EXEMPLO = [
  { label: '⭐ Estratégia multi-instância', prompt: 'Elabore estratégia multi-instância para crédito de ICMS negado no CARF. Empresa: Indústria ABC Ltda. Valor: R$ 2,4 milhões. Argumentos disponíveis: não-cumulatividade e vício de intimação no processo administrativo.' },
  { label: '🔱 Análise constitucional', prompt: 'Analise a constitucionalidade da cobrança do DIFAL nas operações interestaduais com consumidores finais, considerando a LC 190/2022 e as ADIs 7066 e 7070 no STF.' },
  { label: '💼 Due diligence M&A', prompt: 'Realize due diligence jurídica preliminar para aquisição de empresa do setor de saúde com passivo trabalhista estimado em R$ 800k e 3 ações fiscais em andamento no CARF.' },
  { label: '📜 Parecer high stakes', prompt: 'Elabore parecer jurídico definitivo sobre a possibilidade de creditamento de ICMS na aquisição de energia elétrica usada no processo industrial, considerando os precedentes do STJ e STF.' },
  { label: '🔱 Repercussão geral STF', prompt: 'Analise o impacto do Tema 69 do STF (tese do século — exclusão do ICMS da base do PIS/COFINS) nos processos tributários do escritório e elabore estratégia de execução dos créditos.' },
  { label: '🔍 Jurisprudência conflitante', prompt: 'Mapeie a divergência entre STJ e STF sobre a incidência de IR sobre juros Selic em repetição de indébito tributário (Tema 962 STF × posição do STJ) e defina a melhor estratégia processual.' },
];

function formatarTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarTempo(ms?: number) {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AgenteOperacionalMaximus() {
  const { user } = useAuth();
  const clientId = user?.email || null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [documento, setDocumento] = useState<DocumentoAnexo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showExemplos, setShowExemplos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timbreInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch((import.meta.env.VITE_FILE_PARSER_URL || 'https://api.mauromoncao.adv.br/upload') + '/pdf', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setDocumento({ nome: file.name, tipo: file.type, tamanho: file.size, texto: data.text || '' });
      }
    } catch {
      setDocumento({ nome: file.name, tipo: file.type, tamanho: file.size, texto: '' });
    } finally {
      setUploading(false);
    }
  }, []);

  const sendMessage = useCallback(async (msgInput?: string) => {
    const text = (msgInput ?? input).trim();
    if (!text || loading) return;
    setInput('');
    setShowExemplos(false);

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const contextPayload: Record<string, unknown> = { nivel: 'maximus', thinking: 'always_active' };
      if (documento?.texto) contextPayload.documento = documento.texto.slice(0, 8000);

      const payload: Record<string, unknown> = {
        agentId: 'ben-agente-operacional-maximus',
        input: text,
        context: contextPayload,
        useSearch: true,
        useMemory: true,
        clientId,
      };

      const startTime = Date.now();
      const res = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const elapsed = Date.now() - startTime;
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.output || data.error || 'Sem resposta do agente.',
        timestamp: new Date(),
        model: data.modelUsed || 'claude-opus',
        elapsed,
        thinkingAtivo: true,
        risco: data.risco,
        confianca: data.confianca,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Erro: ${errorMsg}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, documento, clientId]);

  const copyLast = useCallback(() => {
    const last = [...messages].reverse().find(m => m.role === 'assistant');
    if (last) {
      navigator.clipboard.writeText(last.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [messages]);

  const downloadLast = useCallback(async () => {
    const last = [...messages].reverse().find(m => m.role === 'assistant');
    if (last) await downloadDocx(last.content, 'Análise MAXIMUS — Mauro Monção Advogados', 'AGENTE OPERACIONAL MAXIMUS', _sessionTimbreFile ?? undefined);
  }, [messages]);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', border: '1px solid rgba(217,119,6,0.5)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-lg flex-shrink-0">⭐</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">AGENTE OPERACIONAL MAXIMUS</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">⭐ Máxima Complexidade</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-300/30 text-amber-100 border border-amber-300/40">⚡ Thinking Sempre Ativo</span>
            </div>
            <p className="text-amber-100/80 text-sm max-w-2xl">
              Nível máximo de raciocínio jurídico. Exclusivo para casos de alta complexidade: valor &gt; R$ 500k,
              teses inovadoras, múltiplas instâncias, jurisprudência conflitante, risco muito alto.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Thinking sempre ativo', 'Raciocínio 7 camadas', 'Estratégia CARF→STF', 'Due diligence M&A', 'Constitucional'].map(tag => (
                <span key={tag} className="text-xs bg-white/15 text-white px-2 py-1 rounded-lg border border-white/20">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center rounded-xl px-3 py-2 bg-white/10 border border-white/20">
              <div className="text-lg font-bold text-white">312</div>
              <div className="text-xs text-amber-100/70">Casos</div>
            </div>
            <div className="text-center rounded-xl px-3 py-2 bg-white/10 border border-white/20">
              <div className="text-lg font-bold text-white">99.1%</div>
              <div className="text-xs text-amber-100/70">Precisão</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aviso de uso ── */}
      <div className="rounded-xl p-3 flex items-start gap-3 border border-amber-500/30" style={{ background: 'rgba(245,158,11,0.08)' }}>
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>MAXIMUS é reservado para máxima complexidade.</strong> Para casos comuns, utilize o Agente Operacional Premium.
          Este agente usa Claude Opus com thinking sempre ativo — pode levar 20–45 segundos por resposta.
        </p>
      </div>

      {/* ── Chat ── */}
      <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-200" style={{ background: '#fff', minHeight: 0 }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100" style={{ background: '#FAFAFA' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-600">MAXIMUS Online · Thinking Ativo</span>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLast} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50 text-slate-600">
              {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button onClick={downloadLast} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50 text-slate-600">
              <Download size={12} /> .docx
            </button>
            <button onClick={() => { setMessages([]); setShowExemplos(true); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50 text-slate-600">
              <RefreshCw size={12} /> Nova sessão
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '300px' }}>
          {messages.length === 0 && showExemplos && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="font-bold text-lg" style={{ color: '#19385C' }}>AGENTE OPERACIONAL MAXIMUS</h3>
                <p className="text-sm text-slate-500 mt-1">Raciocínio jurídico de máxima profundidade</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CONSULTAS_EXEMPLO.map((ex, i) => (
                  <button key={i} onClick={() => sendMessage(ex.prompt)}
                    className="text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400/50 transition-all text-xs"
                    style={{ background: '#FAFAFA' }}>
                    <div className="font-semibold mb-1" style={{ color: '#19385C' }}>{ex.label}</div>
                    <div className="text-slate-500 line-clamp-2">{ex.prompt.substring(0, 80)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={msg.role === 'assistant'
                  ? { background: 'linear-gradient(135deg, #78350f, #d97706)', color: '#fff' }
                  : { background: '#19385C', color: '#DEC078' }}>
                {msg.role === 'assistant' ? '⭐' : 'EU'}
              </div>
              <div className="max-w-3xl">
                <div className="rounded-2xl p-4"
                  style={msg.role === 'assistant'
                    ? { background: '#F9F5F0', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '18px 18px 18px 4px' }
                    : { background: '#E9F2FF', borderRadius: '18px 18px 4px 18px' }}>
                  <div className="text-sm whitespace-pre-line leading-relaxed" style={{ color: '#222' }}>{msg.content}</div>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-xs text-slate-400">{msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {msg.model && <span className="text-xs text-amber-600 font-medium">{msg.model}</span>}
                  {msg.elapsed && <span className="text-xs text-slate-400">{formatarTempo(msg.elapsed)}</span>}
                  {msg.thinkingAtivo && <span className="text-xs text-amber-500">⚡ Thinking ativo</span>}
                  {msg.role === 'assistant' && (
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} className="text-xs text-slate-400 hover:text-slate-600">
                      <Copy size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #78350f, #d97706)' }}>⭐</div>
              <div className="rounded-2xl p-4 border border-amber-200" style={{ background: '#F9F5F0' }}>
                <div className="flex items-center gap-2 text-xs text-amber-700 mb-2">
                  <Brain size={12} className="animate-pulse" /> Thinking ativo — raciocínio profundo em andamento...
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#d97706', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Documento anexado */}
        {documento && (
          <div className="mx-4 mb-2 flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 text-xs" style={{ background: 'rgba(245,158,11,0.06)' }}>
            <FileText size={12} className="text-amber-600" />
            <span className="text-amber-700 font-medium">{documento.nome}</span>
            <span className="text-slate-400">({formatarTamanho(documento.tamanho)})</span>
            <button onClick={() => setDocumento(null)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={12} /></button>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 border-t border-slate-100">
          <div
            className={`rounded-xl border transition-all ${dragOver ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Descreva o caso de alta complexidade para análise MAXIMUS... (Enter para enviar, Shift+Enter para nova linha)"
              rows={3}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50 text-slate-500">
                  {uploading ? <RefreshCw size={11} className="animate-spin" /> : <Upload size={11} />}
                  {uploading ? 'Processando...' : 'Anexar PDF'}
                </button>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #78350f, #d97706)' }}>
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? 'Processando...' : 'Enviar'}
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2 text-center">
            MAXIMUS · Thinking Sempre Ativo · Máxima Complexidade · Dados criptografados
          </div>
        </div>
      </div>
    </div>
  );
}
