import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { downloadDocx } from '../lib/generateDocx';
// timbreFile salvo na sessão para não precisar reanexar a cada download
let _sessionTimbreFile: File | null = null

import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Scale, Shield, BookOpen,
  FileText, Clock, Star, Target, Brain, Sparkles,
  Download, Search, Gavel, Upload, X, ChevronRight,
  Database, Wifi, Calendar, DollarSign, MessageSquare, Bot,
  FileSearch, PenTool, BarChart3, Info, AlertTriangle,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
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

// ─── Exemplos de consultas ─────────────────────────────────────────────────────
const CONSULTAS_EXEMPLO = [
  { label: '🔱 Petição inicial', prompt: 'Elabore uma petição inicial de ação de cobrança por inadimplemento contratual. Credor: João Silva. Devedor: Empresa XYZ Ltda. Valor: R$ 45.000. Comarca: Teresina/PI.' },
  { label: '📋 Parecer contratual', prompt: 'Analise as seguintes cláusulas contratuais e aponte os riscos jurídicos, com fundamento no Código Civil e jurisprudência do STJ.' },
  { label: '🔱 Pesquisa STJ', prompt: 'Pesquise os entendimentos mais recentes do STJ sobre prazo prescricional para ações de responsabilidade civil contratual.' },
  { label: '📄 Checklist previdenciário', prompt: 'Elabore um checklist completo de documentos necessários para ingressar com ação de aposentadoria por tempo de contribuição.' },
  { label: '🔍 Análise de risco', prompt: 'Analise o risco jurídico de uma ação de rescisão contratual com pedido de devolução de valores pagos em contrato de prestação de serviços.' },
  { label: '📝 Contestação trabalhista', prompt: 'Elabore uma contestação em reclamação trabalhista com pedido de horas extras e adicional noturno. Reclamante: funcionário de empresa de comércio varejista.' },
  { label: '💰 Cálculo de honorários', prompt: 'Qual é a metodologia correta para fixação de honorários advocatícios sucumbenciais nos termos do art. 85 do CPC? Explique os critérios e parâmetros.' },
  { label: '🔎 Nulidade processual', prompt: 'Quais são os requisitos para declaração de nulidade de citação por edital? Fundamente com base no CPC e jurisprudência do STJ.' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function corRisco(risco?: string) {
  if (!risco) return '#6B7280';
  const r = risco.toLowerCase();
  if (r.includes('alto')) return '#dc2626';
  if (r.includes('médio') || r.includes('medio')) return '#d97706';
  return '#16a34a';
}

// ─── Extração de texto de arquivo ─────────────────────────────────────────────
async function extrairTextoArquivo(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsText(file);
      return;
    }
    reader.onload = (e) => {
      const result = e.target?.result as string;
      try {
        const binary = atob(result.split(',')[1] || result);
        const matches = binary.match(/[\x20-\x7E]{4,}/g) || [];
        const texto = matches
          .filter(s => s.trim().length > 3)
          .filter(s => !/^\s*$/.test(s))
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        resolve(texto || `[Arquivo ${file.name} - ${formatarTamanho(file.size)} - texto não extraível automaticamente]`);
      } catch {
        resolve(`[Arquivo ${file.name} - ${formatarTamanho(file.size)} - enviado para análise]`);
      }
    };
    reader.readAsDataURL(file);
  });
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function AgenteOperacionalPremium() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [documento, setDocumento] = useState<DocumentoAnexo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stats, setStats] = useState({ total: 0, tempoMedio: 0, modeloAtual: 'BEN IA Plus' });
  const [showExemplos, setShowExemplos] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // ── Timbre modal ────────────────────────────────────────────
  type TimbreChoice = 'com' | 'sem' | 'cancel'
  const [timbreModal, setTimbreModal] = useState<null | 'pending'>(null)
  const [timbreResolve, setTimbreResolve] = useState<null | ((v: TimbreChoice) => void)>(null)
  const [savedTimbreFile, setSavedTimbreFile] = useState<File | null>(_sessionTimbreFile)
  const timbreFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Upload de arquivo ──────────────────────────────────────
  const processarArquivo = useCallback(async (file: File) => {
    const tiposAceitos = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    const extensoesAceitas = ['.pdf', '.docx', '.doc', '.txt'];
    const extOk = extensoesAceitas.some(e => file.name.toLowerCase().endsWith(e));
    if (!tiposAceitos.includes(file.type) && !extOk) {
      alert('Formato não suportado. Use PDF, DOCX, DOC ou TXT.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10 MB.');
      return;
    }
    setUploading(true);
    try {
      const texto = await extrairTextoArquivo(file);
      setDocumento({ nome: file.name, tipo: file.type, tamanho: file.size, texto });
      setInput(prev => prev || `Analise o documento "${file.name}" e extraia as informações jurídicas relevantes: partes, pedidos, fundamentos, prazos e sugestões de ação.`);
      textareaRef.current?.focus();
    } catch {
      alert('Erro ao processar arquivo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarArquivo(file);
  };

  // ── Envio de mensagem ──────────────────────────────────────
  const handleSend = async (customInput?: string) => {
    const msg = customInput || input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: msg + (documento ? `\n📎 Documento: ${documento.nome}` : ''),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowExemplos(false);

    const start = Date.now();

    try {
      const historico = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const payload: Record<string, unknown> = {
        agentId: 'ben-agente-operacional-premium',
        input: msg,
        clientId: user?.email || null,
        context: {},
        useSearch: true,
        historico,
      };
      if (documento) {
        payload.documentoTexto = documento.texto;
        payload.documentoNome = documento.nome;
      }

      const response = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(115000),
      });

      const data = await response.json();
      const elapsed = Date.now() - start;

      if (data.success) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.output || data.resposta || '',
          timestamp: new Date(),
          model: data.model,
          elapsed,
          thinkingAtivo: data.thinkingAtivo,
          risco: data.risco,
          confianca: data.confianca,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setStats(prev => ({
          total: prev.total + 1,
          tempoMedio: Math.round((prev.tempoMedio * prev.total + elapsed) / (prev.total + 1)),
          modeloAtual: data.model || prev.modeloAtual,
        }));
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Erro: ${data.error || 'Falha no processamento'}`,
          timestamp: new Date(),
        }]);
      }
      setDocumento(null);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro de conexão. Verifique as configurações e tente novamente.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };


  // ── Timbre: pergunta ao usuário (com / sem / cancelar) ──────
  const askTimbre = (): Promise<TimbreChoice> =>
    new Promise(resolve => {
      setTimbreModal('pending')
      setTimbreResolve(() => resolve)
    })

  const handleTimbreChoice = (choice: TimbreChoice) => {
    setTimbreModal(null)
    timbreResolve?.(choice)
    setTimbreResolve(null)
  }

  const handleTimbreFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    _sessionTimbreFile = file
    setSavedTimbreFile(file)
    e.target.value = ''
    handleTimbreChoice('com')
  }

  const handleDownload = async (content: string, _filename: string) => {
    const choice = await askTimbre()
    if (choice === 'cancel') return
    const timbreFile = choice === 'com' ? (savedTimbreFile || _sessionTimbreFile) : null
    try {
      await downloadDocx(content, 'Documento Jurídico — Mauro Monção Advogados', 'AGENTE OPERACIONAL PREMIUM', timbreFile ?? undefined)
    } catch (err) {
      console.error('Docx error:', err)
    }
  };

  const handleClear = () => {
    setMessages([]);
    setShowExemplos(true);
    setDocumento(null);
    setInput('');
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: '#F8FAFC', color: '#222222' }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(25,56,92,0.85)' }}>
          <div className="text-center text-white">
            <Upload className="w-16 h-16 mx-auto mb-4" />
            <p className="text-2xl font-bold">Solte o arquivo aqui</p>
            <p className="text-sm mt-2 opacity-80">PDF, DOCX ou TXT — máx. 10 MB</p>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow"
              style={{ border: '2px solid rgba(59,130,246,0.45)' }}>
              <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#19385C' }}>
                AGENTE OPERACIONAL PREMIUM
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#1d4ed8', border: '1px solid rgba(59,130,246,0.35)' }}>
                  PREMIUM
                </span>
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Thinking adaptativo · Complexidade moderada · Todas as áreas do direito
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>Thinking Auto</span>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00b37e' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" style={{ color: '#19385C' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>IA Avançada</span>
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-sm font-bold" style={{ color: '#19385C' }}>{stats.total}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>Consultas</div>
            </div>
            {stats.tempoMedio > 0 && (
              <div className="text-center hidden sm:block">
                <div className="text-sm font-bold" style={{ color: '#19385C' }}>
                  {formatarTempo(stats.tempoMedio)}
                </div>
                <div className="text-xs" style={{ color: '#6B7280' }}>T. médio</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Layout principal ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Fluxo do Agente */}
          <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#19385C' }}>
              <Brain className="w-3.5 h-3.5" /> FLUXO DO AGENTE
            </h3>
            <div className="space-y-2">
              {[
                { n: '1', icon: <MessageSquare className="w-3 h-3" />, t: 'Recebe Demanda', d: 'Lê com precisão e contexto' },
                { n: '2', icon: <Target className="w-3 h-3" />, t: 'Avalia Escopo', d: 'Verifica se está no escopo moderado' },
                { n: '3', icon: <Brain className="w-3 h-3" />, t: 'Thinking Adaptativo', d: 'Liga se complexo, desliga se FAQ' },
                { n: '4', icon: <Bot className="w-3 h-3" />, t: 'Processa com IA', d: 'Análise e redação jurídica' },
                { n: '5', icon: <Sparkles className="w-3 h-3" />, t: 'Entrega + Risco', d: 'Resultado com nível de confiança' },
              ].map(e => (
                <div key={e.n} className="flex items-start gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.10)', color: '#1d4ed8', border: '1px solid rgba(59,130,246,0.25)' }}>
                    {e.n}
                  </span>
                  <div>
                    <div className="font-medium flex items-center gap-1" style={{ color: '#222222' }}>
                      {e.icon} {e.t}
                    </div>
                    <div style={{ color: '#6B7280' }}>{e.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capacidades */}
          <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#1d4ed8' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} /> CAPACIDADES
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                { i: <Scale className="w-3 h-3" />, t: 'Análise jurídica moderada a profunda' },
                { i: <Search className="w-3 h-3" />, t: 'Pesquisa STJ, TJ, CARF' },
                { i: <PenTool className="w-3 h-3" />, t: 'Petições padrão e moderadas' },
                { i: <FileText className="w-3 h-3" />, t: 'Pareceres jurídicos estruturados' },
                { i: <FileSearch className="w-3 h-3" />, t: 'Síntese de documentos (até 30 pág.)' },
                { i: <BarChart3 className="w-3 h-3" />, t: 'Detecção de risco baixo a médio' },
                { i: <Gavel className="w-3 h-3" />, t: 'Estratégia tática (não estratégica)' },
                { i: <BookOpen className="w-3 h-3" />, t: 'Checklist de procedimentos' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: '#444' }}>
                  <span style={{ color: '#1d4ed8' }}>{c.i}</span>
                  {c.t}
                </div>
              ))}
            </div>
          </div>

          {/* Restrições */}
          <div className="rounded-xl p-4 border border-orange-200"
            style={{ background: 'rgba(251,146,60,0.05)' }}>
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: '#c2410c' }}>
              <AlertTriangle className="w-3.5 h-3.5" /> ESCALADA AUTOMÁTICA
            </h3>
            <div className="space-y-1 text-xs" style={{ color: '#9a3412' }}>
              {[
                'Teses inovadoras ou criativas',
                'STF recente diverge (< 6 meses)',
                'Casos com 3+ temas jurídicos',
                'Valor de causa > R$ 500 mil',
                'Risco jurídico muito alto',
                'Estratégia multiinstância',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">→</span>
                  <span>{r}</span>
                </div>
              ))}
              <p className="mt-2 pt-2 border-t border-orange-200 font-medium" style={{ color: '#c2410c' }}>
                Sinaliza e recomenda o AGENTE OPERACIONAL MAXIMUS.
              </p>
            </div>
          </div>

          {/* Upload rápido */}
          <div className="rounded-xl p-4 border border-dashed border-slate-300 cursor-pointer hover:border-blue-400 transition-colors"
            style={{ background: '#FAFBFF' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="text-center">
              <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: '#1d4ed8', opacity: 0.6 }} />
              <p className="text-xs font-medium" style={{ color: '#19385C' }}>Carregar Documento</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>PDF, DOCX, TXT · máx. 10 MB</p>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>ou arraste para a tela</p>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
              onChange={handleFileChange} />
          </div>

        </div>

        {/* ── Área principal ───────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Exemplos de consulta */}
          {showExemplos && messages.length === 0 && (
            <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold flex items-center gap-2" style={{ color: '#19385C' }}>
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} />
                  Exemplos de consultas jurídicas
                </h3>
                <button onClick={() => setShowExemplos(false)}
                  className="text-xs" style={{ color: '#9CA3AF' }}>Ocultar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONSULTAS_EXEMPLO.map((e, i) => (
                  <button key={i} onClick={() => handleSend(e.prompt)}
                    disabled={loading}
                    className="text-left p-2.5 rounded-lg border text-xs transition-all hover:border-blue-300 hover:shadow-sm disabled:opacity-50"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#444' }}>
                    <span className="font-medium">{e.label}</span>
                    <p className="mt-0.5 line-clamp-1" style={{ color: '#9CA3AF' }}>{e.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="rounded-xl border border-slate-200 flex flex-col"
            style={{ minHeight: '450px', maxHeight: '65vh', background: '#FFFFFF' }}>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                <MessageSquare className="w-3.5 h-3.5" style={{ color: '#1d4ed8' }} />
                {messages.length === 0
                  ? 'Aguardando consulta...'
                  : `${Math.ceil(messages.length / 2)} consulta(s)`}
              </div>
              {messages.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const last = [...messages].reverse().find(m => m.role === 'assistant');
                      if (last) handleCopy(last.content, 'toolbar');
                    }}
                    className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                    {copied === 'toolbar'
                      ? <CheckCircle className="w-3 h-3" style={{ color: '#00b37e' }} />
                      : <Copy className="w-3 h-3" />}
                    Copiar
                  </button>
                  <button onClick={handleClear}
                    className="text-xs flex items-center gap-1"
                    style={{ color: '#6B7280' }}>
                    <RefreshCw className="w-3 h-3" /> Nova sessão
                  </button>
                </div>
              )}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-52 text-center">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-3 shadow"
                    style={{ border: '2px solid rgba(59,130,246,0.40)' }}>
                    <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#19385C' }}>
                    AGENTE OPERACIONAL PREMIUM pronto
                  </div>
                  <div className="text-xs max-w-sm" style={{ color: '#6B7280' }}>
                    Envie uma consulta jurídica de complexidade moderada. O thinking adaptativo ativa automaticamente quando necessário.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[92%]"
                    style={msg.role === 'user'
                      ? { background: '#EFF6FF', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', color: '#1A1A1A' }
                      : { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', color: '#222' }}>

                    {/* Header da resposta */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>{msg.model || 'BEN IA Plus'}</span>
                          {msg.elapsed && (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{formatarTempo(msg.elapsed)}</span>
                            </>
                          )}
                          {msg.thinkingAtivo && (
                            <span className="px-1.5 py-0.5 rounded text-xs"
                              style={{ background: 'rgba(59,130,246,0.10)', color: '#1d4ed8' }}>
                              thinking ON
                            </span>
                          )}
                        </div>
                        {msg.risco && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${corRisco(msg.risco)}15`,
                              color: corRisco(msg.risco),
                              border: `1px solid ${corRisco(msg.risco)}30`,
                            }}>
                            Risco {msg.risco}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div className="text-sm whitespace-pre-wrap" style={{ lineHeight: '1.65' }}>
                      {msg.content}
                    </div>

                    {/* Ações da mensagem */}
                    {msg.role === 'assistant' && msg.content.length > 200 && (
                      <div className="mt-3 pt-2 flex items-center gap-3 flex-wrap"
                        style={{ borderTop: '1px solid #E5E7EB' }}>
                        <button onClick={() => handleCopy(msg.content, `msg-${i}`)}
                          className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                          {copied === `msg-${i}`
                            ? <CheckCircle className="w-3 h-3" style={{ color: '#00b37e' }} />
                            : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                        <button onClick={() => handleDownload(msg.content, `agente-premium-${Date.now()}.txt`)}
                          className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                          <Download className="w-3 h-3" /> Baixar Word
                        </button>
                        {msg.confianca !== undefined && (
                          <span className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                            Confiança: {Math.round(msg.confianca * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl p-4" style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[0,1,2].map(j => (
                          <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: '#3b82f6', animationDelay: `${j*150}ms` }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>Processando consulta...</span>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: '#9CA3AF' }}>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Avaliando escopo e complexidade...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Ativando thinking adaptativo se necessário...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Gerando análise jurídica...
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">

              {/* Documento anexado */}
              {documento && (
                <div className="mb-2 flex items-center gap-2 p-2 rounded-lg"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.20)' }}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#1d4ed8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#19385C' }}>{documento.nome}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {formatarTamanho(documento.tamanho)} · {documento.texto.length > 100 ? 'Texto extraído ✓' : 'Arquivo pronto'}
                    </p>
                  </div>
                  <button onClick={() => setDocumento(null)} className="flex-shrink-0">
                    <X className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
                    }}
                    placeholder='Descreva a questão jurídica... Ex: "elabore contestação em ação de cobrança" ou "analise o risco deste contrato"'
                    rows={3}
                    className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
                    style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#222', lineHeight: '1.5' }}
                    disabled={loading || uploading}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={loading || uploading}
                      className="p-1 rounded hover:bg-slate-100 transition-colors" title="Anexar documento">
                      {uploading
                        ? <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#6B7280' }} />
                        : <Upload className="w-4 h-4" style={{ color: '#6B7280' }} />}
                    </button>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{input.length}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !documento) || loading}
                  className="px-4 py-2 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 font-medium text-white disabled:opacity-50 self-stretch"
                  style={{ background: '#1d4ed8', minWidth: '64px' }}>
                  {loading
                    ? <RefreshCw className="w-5 h-5 animate-spin" />
                    : <Send className="w-5 h-5" />}
                  <span className="text-xs">Enviar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: '#9CA3AF' }}>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: '#3b82f6' }} />
                  Ctrl+Enter para enviar
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Thinking ativa automaticamente
                </span>
                <span className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Arraste PDF/DOCX na tela
                </span>
              </div>
            </div>
          </div>

          {/* Aviso legal */}
          <div className="rounded-xl p-3 text-xs"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.25)', color: '#1e40af' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Legal:</strong> Peças e pareceres são <strong>minutas técnicas</strong> que requerem revisão e assinatura pelo{' '}
                <strong>Dr. Mauro Monção</strong> (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037).
                Quando o caso exceder o escopo moderado, o agente sinalizará e recomendará o AGENTE OPERACIONAL MAXIMUS.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Com timbre ou Sem timbre? ─────────────────── */}
      {timbreModal === 'pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)' }}>
          <div className="rounded-2xl shadow-2xl p-7 flex flex-col items-center gap-4 w-full mx-4"
            style={{ background: '#0d1f3c', border: '1px solid #1e3a60', maxWidth: 420 }}>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(228,183,30,0.18)' }}>
                <FileText className="w-6 h-6" style={{ color: '#E4B71E' }} />
              </div>
              <p className="text-white font-bold text-base text-center">Gerar documento Word (.docx)</p>
            </div>
            <div className="w-full rounded-xl p-3 text-xs leading-relaxed"
              style={{ background: 'rgba(228,183,30,0.08)', border: '1px solid rgba(228,183,30,0.25)', color: '#CBD5E1' }}>
              <p className="font-semibold mb-1" style={{ color: '#E4B71E' }}>ℹ️ Como funciona o timbre</p>
              <p>O <strong style={{ color: '#fff' }}>timbre do escritório é um arquivo Word separado</strong> (.docx). O sistema extrai o cabeçalho do arquivo de timbre e o aplica ao documento gerado.</p>
              <p className="mt-1">Para usar o timbre, selecione <strong style={{ color: '#4ade80' }}>"Com Timbre"</strong> e anexe o arquivo <strong style={{ color: '#fff' }}>NOVO TIMBRE DO ESCRITÓRIO.docx</strong>. Uma vez carregado, fica salvo na sessão.</p>
            </div>
            {savedTimbreFile && (
              <div className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                <span>✓</span>
                <span>Timbre em uso: <strong>{savedTimbreFile.name.slice(0, 35)}{savedTimbreFile.name.length > 35 ? '…' : ''}</strong></span>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full">
              {savedTimbreFile ? (
                <button
                  onClick={() => handleTimbreChoice('com')}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: '#E4B71E', color: '#0d1f3c' }}>
                  📋 Com Timbre — usar {savedTimbreFile.name.slice(0, 22)}{savedTimbreFile.name.length > 22 ? '…' : ''}
                </button>
              ) : null}
              <button
                onClick={() => timbreFileRef.current?.click()}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{
                  background: savedTimbreFile ? 'rgba(228,183,30,0.12)' : '#E4B71E',
                  color: savedTimbreFile ? '#E4B71E' : '#0d1f3c',
                  border: savedTimbreFile ? '1px solid rgba(228,183,30,0.4)' : 'none',
                }}>
                📂 {savedTimbreFile ? 'Trocar arquivo de timbre (.docx)' : 'Anexar timbre (.docx) e gerar'}
              </button>
              <button
                onClick={() => handleTimbreChoice('sem')}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.12)' }}>
                📄 Sem Timbre — gerar apenas o conteúdo
              </button>
            </div>
            <button
              onClick={() => handleTimbreChoice('cancel')}
              className="text-xs transition-colors hover:text-white"
              style={{ color: '#64748B' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* Input oculto para o .docx do timbre */}
      <input
        ref={timbreFileRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleTimbreFileUpload}
      />
    </div>
  );
}
