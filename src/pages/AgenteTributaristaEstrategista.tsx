import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { downloadDocx } from '../lib/generateDocx';
// timbreFile salvo na sessão para não precisar reanexar a cada download
let _sessionTimbreFile: File | null = null

import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Scale, Shield, BookOpen,
  FileText, Clock, Star, Target, Brain, Sparkles,
  Download, Search, Gavel, Upload, X, ChevronRight,
  Wifi, MessageSquare, Bot,
  FileSearch, PenTool, BarChart3, AlertTriangle,
  Calculator, Database,
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

// ─── Exemplos de consultas tributárias ────────────────────────────────────────
const CONSULTAS_EXEMPLO = [
  { label: '🔱 Impugnação CARF', prompt: 'Elabore impugnação ao auto de infração por cobrança de IRPJ exercício 2022, valor R$ 180.000. A Receita negou dedução de despesas com educação especial. Sujeito passivo: Empresa XYZ Ltda, CNPJ 00.000.000/0001-00, Teresina/PI.' },
  { label: '🏛️ Nulidade de autuação', prompt: 'Analise as hipóteses de nulidade (processual e material) de auto de infração por ICMS onde a intimação fiscal não indicou a base de cálculo utilizada e o prazo de defesa foi inferior a 30 dias.' },
  { label: '📋 Estratégia CARF → STJ', prompt: 'O CARF negou crédito de PIS/COFINS sobre insumos industriais. Quais são as chances no TJ? E no STJ? Há Tema Repetitivo favorável? Elabore estratégia de escalação multi-instância.' },
  { label: '🔍 Reforma Tributária EC 132', prompt: 'Quais são os impactos da EC 132/2023 para empresas de serviços no regime do ISS municipal? Há direito adquirido sobre benefícios fiscais concedidos antes da reforma?' },
  { label: '📄 Parecer dedutibilidade', prompt: 'Elabore parecer jurídico sobre a dedutibilidade de despesas com educação especial no IRPF. Fundamente com CTN, Lei 12.764/2012 e jurisprudência do STJ e CARF.' },
  { label: '🔎 Prescrição tributária', prompt: 'Empresa recebeu notificação fiscal referente a débitos de ICMS de 2017. Analise prescrição (art. 174 CTN) e decadência (art. 173 CTN). Há prazo para defesa ainda?' },
  { label: '💰 Planejamento tributário', prompt: 'Empresa de tecnologia, faturamento anual R$ 12 milhões, regime Lucro Presumido. Elabore análise de planejamento tributário para migração para Lucro Real, considerando PIS, COFINS, IRPJ e CSLL.' },
  { label: '📑 Mandado de segurança', prompt: 'Elabore mandado de segurança para suspender exigibilidade de débito fiscal de ISS municipal lançado com base em lei municipal declarada inconstitucional pelo TJ local.' },
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
export default function AgenteTributaristaEstrategista() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [documento, setDocumento] = useState<DocumentoAnexo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stats, setStats] = useState({ total: 0, tempoMedio: 0, modeloAtual: 'claude-opus-4-5' });
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
      setInput(prev => prev || `Analise o documento tributário "${file.name}" e identifique: tributo envolvido, base de cálculo, fundamento legal da autuação, vícios processuais e materiais, e estratégia de defesa recomendada.`);
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
        agentId: 'ben-tributarista-estrategista',
        clientId: user?.email || null,
          input: msg,
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
          thinkingAtivo: data.thinkingAtivo ?? true,
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
      await downloadDocx(content, 'Parecer Tributário — Mauro Monção Advogados', 'AGENTE TRIBUTARISTA ESTRATEGISTA', timbreFile ?? undefined)
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
  // Paleta âmbar/ouro para identidade TRIBUTARISTA
  const COR_PRIMARIA = '#b45309';      // amber-700
  const COR_ACENTO   = '#d97706';      // amber-500
  const COR_BG_BADGE = 'rgba(180,83,9,0.10)';
  const COR_BORDER   = 'rgba(180,83,9,0.35)';
  const COR_GLOW     = 'rgba(217,119,6,0.40)';

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
            <p className="text-2xl font-bold">Solte o documento aqui</p>
            <p className="text-sm mt-2 opacity-80">PDF, DOCX ou TXT — máx. 10 MB</p>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow"
              style={{ border: `2px solid ${COR_GLOW}` }}>
              <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#19385C' }}>
                TRIBUTARISTA ESTRATEGISTA
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: COR_BG_BADGE, color: COR_PRIMARIA, border: `1px solid ${COR_BORDER}` }}>
                  🔱 TRIBUTÁRIO
                </span>
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Thinking sempre ativo · Direito Tributário Puro · CARF · TJ · STJ · STF
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>Thinking ON</span>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00b37e' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" style={{ color: '#19385C' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>Opus 4</span>
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
              <Brain className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} /> FLUXO TRIBUTÁRIO
            </h3>
            <div className="space-y-2">
              {[
                { n: '1', icon: <MessageSquare className="w-3 h-3" />, t: 'Recebe Demanda', d: 'Lê contexto tributário completo' },
                { n: '2', icon: <Brain className="w-3 h-3" />, t: 'Thinking SEMPRE ON', d: '8–12s · 4k–10k tokens' },
                { n: '3', icon: <Database className="w-3 h-3" />, t: '7 Camadas', d: 'Fato → Enquadramento → Jurisprud. → Vício Processual → Vício Material → Defesa → Estratégia' },
                { n: '4', icon: <Bot className="w-3 h-3" />, t: 'Processa (Opus 4)', d: 'Análise tributária máxima' },
                { n: '5', icon: <Sparkles className="w-3 h-3" />, t: 'Entrega Completa', d: 'Peça pronta + risco + cenários' },
              ].map(e => (
                <div key={e.n} className="flex items-start gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5"
                    style={{ background: COR_BG_BADGE, color: COR_PRIMARIA, border: `1px solid ${COR_BORDER}` }}>
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
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: COR_PRIMARIA }}>
              <Star className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} /> COMPETÊNCIAS TRIBUTÁRIAS
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                { i: <Scale className="w-3 h-3" />, t: 'Nulidade tributária (processual + material)' },
                { i: <Gavel className="w-3 h-3" />, t: 'Defesa administrativa — CARF' },
                { i: <Search className="w-3 h-3" />, t: 'Defesa judicial — TJ, STJ, STF' },
                { i: <Calculator className="w-3 h-3" />, t: 'Planejamento tributário estratégico' },
                { i: <FileSearch className="w-3 h-3" />, t: 'Contestação de autuações fiscais' },
                { i: <BarChart3 className="w-3 h-3" />, t: 'Análise CARF, STJ, STF' },
                { i: <PenTool className="w-3 h-3" />, t: 'Impugnação, Parecer, MS, Apelação' },
                { i: <FileText className="w-3 h-3" />, t: 'EC 132/2023 — Reforma Tributária' },
                { i: <BookOpen className="w-3 h-3" />, t: 'IRPF, IRPJ, IPI, ICMS, ISS, Contribuições' },
                { i: <Target className="w-3 h-3" />, t: 'Transação tributária' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: '#444' }}>
                  <span style={{ color: COR_ACENTO }}>{c.i}</span>
                  {c.t}
                </div>
              ))}
            </div>
          </div>

          {/* 7 Camadas */}
          <div className="rounded-xl p-4 border"
            style={{ background: 'rgba(180,83,9,0.04)', borderColor: COR_BORDER }}>
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: COR_PRIMARIA }}>
              <AlertTriangle className="w-3.5 h-3.5" /> 7 CAMADAS TRIBUTÁRIAS
            </h3>
            <div className="space-y-1 text-xs" style={{ color: '#92400e' }}>
              {[
                '1. Fato Econômico',
                '2. Enquadramento Legal',
                '3. Interpretação Jurisprudencial',
                '4. Vício Processual',
                '5. Vício Material',
                '6. Defesa Material Substancial',
                '7. Estratégia Multi-Instância',
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: COR_ACENTO }}>→</span>
                  <span>{c}</span>
                </div>
              ))}
              <p className="mt-2 pt-2 font-medium" style={{ color: COR_PRIMARIA, borderTop: `1px solid ${COR_BORDER}` }}>
                Hierarquia: CARF → TJ → STJ → STF
              </p>
            </div>
          </div>

          {/* Upload rápido */}
          <div className="rounded-xl p-4 border border-dashed cursor-pointer transition-colors"
            style={{ background: '#FAFBFF', borderColor: '#CBD5E1' }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => (e.currentTarget.style.borderColor = COR_ACENTO)}
            onMouseOut={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="text-center">
              <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: COR_ACENTO, opacity: 0.7 }} />
              <p className="text-xs font-medium" style={{ color: '#19385C' }}>Carregar Documento</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Auto de infração, parecer, contrato</p>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>PDF, DOCX, TXT · máx. 10 MB</p>
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
                  <BookOpen className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} />
                  Exemplos de consultas tributárias
                </h3>
                <button onClick={() => setShowExemplos(false)}
                  className="text-xs" style={{ color: '#9CA3AF' }}>Ocultar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONSULTAS_EXEMPLO.map((e, i) => (
                  <button key={i} onClick={() => handleSend(e.prompt)}
                    disabled={loading}
                    className="text-left p-2.5 rounded-lg border text-xs transition-all disabled:opacity-50"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#444' }}
                    onMouseOver={ev => { (ev.currentTarget as HTMLButtonElement).style.borderColor = COR_ACENTO; }}
                    onMouseOut={ev => { (ev.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB'; }}
                  >
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
                <MessageSquare className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} />
                {messages.length === 0
                  ? 'Aguardando consulta tributária...'
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
                    style={{ border: `2px solid ${COR_GLOW}` }}>
                    <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#19385C' }}>
                    TRIBUTARISTA ESTRATEGISTA pronto
                  </div>
                  <div className="text-xs max-w-sm" style={{ color: '#6B7280' }}>
                    Especialista exclusivo em Direito Tributário Puro. Thinking sempre ativo.
                    Envie uma demanda tributária — CARF, TJ, STJ ou STF.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[92%]"
                    style={msg.role === 'user'
                      ? { background: 'rgba(180,83,9,0.07)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', color: '#1A1A1A' }
                      : { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', color: '#222' }}>

                    {/* Header da resposta */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                          <Sparkles className="w-3 h-3" style={{ color: COR_ACENTO }} />
                          <span>{msg.model || 'claude-opus-4-5'}</span>
                          {msg.elapsed && (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{formatarTempo(msg.elapsed)}</span>
                            </>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-xs"
                            style={{ background: COR_BG_BADGE, color: COR_PRIMARIA }}>
                            thinking ON
                          </span>
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
                        <button onClick={() => handleDownload(msg.content, `tributarista-${Date.now()}.txt`)}
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
                            style={{ background: COR_ACENTO, animationDelay: `${j*150}ms` }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>Analisando demanda tributária...</span>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: '#9CA3AF' }}>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Ativando thinking tributário profundo...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Estruturando 7 camadas de análise...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Pesquisando jurisprudência CARF · STJ · STF...
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
                  style={{ background: COR_BG_BADGE, border: `1px solid ${COR_BORDER}` }}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: COR_PRIMARIA }} />
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
                    placeholder='Descreva a questão tributária... Ex: "elabore impugnação ao auto de infração IRPJ 2022" ou "analise nulidade de autuação por ICMS sem intimação válida"'
                    rows={3}
                    className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
                    style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#222', lineHeight: '1.5' }}
                    disabled={loading || uploading}
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={loading || uploading}
                      className="p-1 rounded hover:bg-slate-100 transition-colors" title="Anexar documento tributário">
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
                  style={{ background: COR_PRIMARIA, minWidth: '64px' }}>
                  {loading
                    ? <RefreshCw className="w-5 h-5 animate-spin" />
                    : <Send className="w-5 h-5" />}
                  <span className="text-xs">Enviar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: '#9CA3AF' }}>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: COR_ACENTO }} />
                  Ctrl+Enter para enviar
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Thinking sempre ativo (Opus 4)
                </span>
                <span className="flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Arraste auto de infração ou parecer
                </span>
              </div>
            </div>
          </div>

          {/* Aviso legal */}
          <div className="rounded-xl p-3 text-xs"
            style={{ background: COR_BG_BADGE, border: `1px solid ${COR_BORDER}`, color: '#92400e' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Legal:</strong> Peças e pareceres tributários são <strong>minutas técnicas</strong> que requerem revisão e assinatura pelo{' '}
                <strong>Dr. Mauro Monção</strong> (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037).
                Este agente é especializado exclusivamente em Direito Tributário Puro. Para demandas de outras áreas, utilize os Agentes Operacionais MAXIMUS ou PREMIUM.
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
