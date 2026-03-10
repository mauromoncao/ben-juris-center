import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Scale, Shield, BookOpen,
  FileText, Clock, Star, AlertTriangle, Target, Brain, Sparkles,
  Download, Search, Gavel, Eye, Upload, X, ChevronRight,
  Database, Wifi, Calendar, DollarSign, MessageSquare, Bot,
  FileSearch, PenTool, BarChart3, ArrowRight, Info,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  elapsed?: number;
  intencao?: string;
  sugestoes?: Sugestao[];
  temContexto?: boolean;
}

interface Sugestao {
  acao: string;
  rota?: string;
  icone: string;
  acao_tipo?: string;
  payload?: Record<string, unknown>;
}

interface DocumentoAnexo {
  nome: string;
  tipo: string;
  tamanho: number;
  texto: string;
}

// ─── Exemplos de consultas ─────────────────────────────────────────────────────
const CONSULTAS_EXEMPLO = [
  { label: '📅 Prazos de hoje/amanhã', prompt: 'Quais são meus processos com prazo para hoje ou amanhã? Mostre com urgência.' },
  { label: '📋 Listar processos', prompt: 'Liste todos os processos ativos no meu banco de dados com status e tribunal.' },
  { label: '🔍 Resumir processo', prompt: 'Resuma o processo 0001234-55.2024.8.18.0001 do TJPI com últimas movimentações.' },
  { label: '⚖️ Gerar petição', prompt: 'Elabore uma petição de agravo de instrumento contra decisão que indeferiu tutela de urgência em ação de cobrança. Cliente: Maria Silva. Valor: R$ 50.000. TJPI.' },
  { label: '💰 Cobranças em aberto', prompt: 'Quais clientes têm cobranças em aberto ou atrasadas no sistema?' },
  { label: '📄 Estratégia recursal', prompt: 'Elabore estratégia recursal para processo trabalhista com sentença desfavorável em pedido de horas extras. Fundamente com jurisprudência TST.' },
  { label: '🏛️ Consulta STJ', prompt: 'Quais são os entendimentos mais recentes do STJ sobre revisão de contratos bancários por onerosidade excessiva?' },
  { label: '📝 Cláusulas contratuais', prompt: 'Revise essas cláusulas contratuais e aponte riscos jurídicos e sugestões de melhoria.' },
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

const INTENCAO_LABEL: Record<string, { label: string; cor: string; icone: string }> = {
  prazo:     { label: 'Consulta de Prazos',    cor: '#f59e0b', icone: '📅' },
  processo:  { label: 'Consulta de Processo',  cor: '#19385C', icone: '⚖️' },
  cobranca:  { label: 'Financeiro/Cobrança',   cor: '#00b37e', icone: '💰' },
  peticao:   { label: 'Geração de Peça',       cor: '#7c3aed', icone: '📝' },
  resumo:    { label: 'Resumo Jurídico',       cor: '#0891b2', icone: '📋' },
  documento: { label: 'Análise de Documento',  cor: '#dc2626', icone: '📄' },
  geral:     { label: 'Consultoria Jurídica',  cor: '#6B7280', icone: '🏛️' },
};

// ─── Extração de texto de PDF/DOCX (simplificada, no browser) ─────────────────
async function extrairTextoArquivo(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    // Para arquivos de texto simples
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsText(file);
      return;
    }

    // Para PDF e DOCX: lê como base64 e extrai texto básico
    reader.onload = (e) => {
      const result = e.target?.result as string;
      try {
        // Tenta extrair texto legível do binário (heurística)
        const binary = atob(result.split(',')[1] || result);
        // Extrai strings ASCII legíveis (mínimo 4 chars)
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
export default function SuperAgenteJuridico() {
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
    } catch (e) {
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
      // Histórico para contexto
      const historico = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const payload: Record<string, unknown> = {
        pergunta: msg,
        historico,
      };
      if (documento) {
        payload.documentoTexto = documento.texto;
        payload.documentoNome = documento.nome;
      }

      const response = await fetch('/api/super-agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const elapsed = Date.now() - start;

      if (data.success) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.resposta,
          timestamp: new Date(),
          model: data.modelo,
          elapsed,
          intencao: data.intencao,
          sugestoes: data.sugestoes,
          temContexto: data.temContexto,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setStats(prev => ({
          total: prev.total + 1,
          tempoMedio: Math.round((prev.tempoMedio * prev.total + elapsed) / (prev.total + 1)),
          modeloAtual: data.modelo || prev.modeloAtual,
        }));
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ Erro: ${data.error || 'Falha no processamento'}`,
          timestamp: new Date(),
        }]);
      }

      // Limpa documento após envio
      setDocumento(null);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erro de conexão. Verifique as configurações e tente novamente.',
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

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([]);
    setShowExemplos(true);
    setDocumento(null);
    setInput('');
  };

  const handleSugestao = (s: Sugestao) => {
    if (s.acao_tipo === 'copiar') {
      const last = [...messages].reverse().find(m => m.role === 'assistant');
      if (last) handleCopy(last.content, 'sugestao');
    } else if (s.acao_tipo === 'baixar') {
      const last = [...messages].reverse().find(m => m.role === 'assistant');
      if (last) handleDownload(last.content, `peca-juridica-${Date.now()}.txt`);
    } else if (s.acao_tipo === 'refinar') {
      setInput('Refine a peça processual anterior, tornando-a mais completa e detalhada, com mais fundamentos jurídicos e jurisprudência.');
      textareaRef.current?.focus();
    } else if (s.acao_tipo === 'resumo') {
      setInput('Faça um resumo executivo do documento, destacando: partes envolvidas, pedidos principais, fundamentos jurídicos e prazos identificados.');
      textareaRef.current?.focus();
    } else if (s.acao_tipo === 'peticao_doc') {
      setInput('Com base no documento analisado, elabore uma petição processual completa para o caso descrito.');
      textareaRef.current?.focus();
    } else if (s.acao_tipo === 'prazos_doc') {
      setInput('Identifique todos os prazos processuais mencionados no documento e os ordene por urgência.');
      textareaRef.current?.focus();
    } else if (s.acao_tipo === 'nova') {
      handleClear();
    } else if (s.rota) {
      window.location.hash = s.rota;
    }
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
              style={{ border: '2px solid rgba(222,192,120,0.50)' }}>
              <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#19385C' }}>
                BEN SUPER AGENTE JURÍDICO
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(222,192,120,0.18)', color: '#b8860b', border: '1px solid rgba(222,192,120,0.45)' }}>
                  PREMIUM
                </span>
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Linguagem natural · VPS + DataJud + LLM · Upload PDF/DOCX
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" style={{ color: '#00b37e' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>VPS</span>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00b37e' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" style={{ color: '#19385C' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>DataJud</span>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00b37e' }} />
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
                { n: '1', icon: <MessageSquare className="w-3 h-3" />, t: 'Linguagem Natural', d: 'Entende a intenção' },
                { n: '2', icon: <Database className="w-3 h-3" />, t: 'Banco VPS', d: 'Processos, clientes, prazos' },
                { n: '3', icon: <Search className="w-3 h-3" />, t: 'DataJud CNJ', d: 'Dados atualizados' },
                { n: '4', icon: <Bot className="w-3 h-3" />, t: 'LLM (Claude/GPT)', d: 'Raciocínio jurídico' },
                { n: '5', icon: <Sparkles className="w-3 h-3" />, t: 'Resposta + Ações', d: 'Resultado + próximos passos' },
              ].map(e => (
                <div key={e.n} className="flex items-start gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold mt-0.5"
                    style={{ background: 'rgba(25,56,92,0.10)', color: '#19385C', border: '1px solid rgba(25,56,92,0.25)' }}>
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
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#DEC078' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#DEC078' }} /> CAPACIDADES
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                { i: <Calendar className="w-3 h-3" />, t: 'Consulta de prazos urgentes' },
                { i: <Scale className="w-3 h-3" />, t: 'Busca e resumo de processos' },
                { i: <FileSearch className="w-3 h-3" />, t: 'DataJud em tempo real' },
                { i: <PenTool className="w-3 h-3" />, t: 'Geração de peças processuais' },
                { i: <Upload className="w-3 h-3" />, t: 'Análise de PDF/DOCX' },
                { i: <DollarSign className="w-3 h-3" />, t: 'Cobranças e honorários' },
                { i: <Gavel className="w-3 h-3" />, t: 'Estratégia recursal' },
                { i: <BookOpen className="w-3 h-3" />, t: 'Pesquisa jurisprudencial' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-2" style={{ color: '#444' }}>
                  <span style={{ color: '#19385C' }}>{c.i}</span>
                  {c.t}
                </div>
              ))}
            </div>
          </div>

          {/* Upload rápido */}
          <div className="rounded-xl p-4 border border-dashed border-slate-300 cursor-pointer hover:border-blue-400 transition-colors"
            style={{ background: '#FAFBFF' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="text-center">
              <Upload className="w-7 h-7 mx-auto mb-2" style={{ color: '#19385C', opacity: 0.6 }} />
              <p className="text-xs font-medium" style={{ color: '#19385C' }}>Carregar Peça Processual</p>
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
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#DEC078' }} />
                  Exemplos de consultas em linguagem natural
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
                <MessageSquare className="w-3.5 h-3.5" style={{ color: '#19385C' }} />
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
                    style={{ border: '2px solid rgba(222,192,120,0.50)' }}>
                    <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: '#19385C' }}>
                    DR. BEN pronto para atender
                  </div>
                  <div className="text-xs max-w-sm" style={{ color: '#6B7280' }}>
                    Faça uma pergunta em linguagem natural sobre processos, prazos, peças ou documentos. Consulto o banco VPS e o DataJud automaticamente.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[92%]"
                    style={msg.role === 'user'
                      ? { background: '#E9F2FF', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', color: '#1A1A1A' }
                      : { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', color: '#222' }}>

                    {/* Header da resposta */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{msg.model || 'claude-opus-4-5'}</span>
                          {msg.elapsed && (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>{formatarTempo(msg.elapsed)}</span>
                            </>
                          )}
                        </div>
                        {msg.intencao && INTENCAO_LABEL[msg.intencao] && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${INTENCAO_LABEL[msg.intencao].cor}15`,
                              color: INTENCAO_LABEL[msg.intencao].cor,
                              border: `1px solid ${INTENCAO_LABEL[msg.intencao].cor}30`,
                            }}>
                            {INTENCAO_LABEL[msg.intencao].icone} {INTENCAO_LABEL[msg.intencao].label}
                            {msg.temContexto && ' · 🗄️ DB'}
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
                        <button onClick={() => handleDownload(msg.content, `ben-juridico-${Date.now()}.txt`)}
                          className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}>
                          <Download className="w-3 h-3" /> Baixar .txt
                        </button>
                      </div>
                    )}

                    {/* Sugestões de ação */}
                    {msg.role === 'assistant' && msg.sugestoes && msg.sugestoes.length > 0 && (
                      <div className="mt-3 pt-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                        <p className="text-xs mb-2 font-medium" style={{ color: '#9CA3AF' }}>🔔 Sugestões de ação:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.sugestoes.filter(s => s.acao_tipo !== 'nova').map((s, si) => (
                            <button key={si} onClick={() => handleSugestao(s)}
                              className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm"
                              style={{ background: 'rgba(25,56,92,0.06)', borderColor: 'rgba(25,56,92,0.20)', color: '#19385C' }}>
                              {s.icone} {s.acao}
                            </button>
                          ))}
                        </div>
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
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: '#DEC078', animationDelay: `${i*150}ms` }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>DR. BEN processando...</span>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: '#9CA3AF' }}>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Detectando intenção...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Consultando VPS + DataJud...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3" />
                        Gerando resposta jurídica...
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
                  style={{ background: 'rgba(25,56,92,0.06)', border: '1px solid rgba(25,56,92,0.20)' }}>
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#19385C' }} />
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
                    placeholder='Pergunte em linguagem natural... Ex: "quais processos têm prazo amanhã?" ou "resuma o processo 0001234-55.2024.8.18.0001"'
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
                  style={{ background: '#19385C', minWidth: '64px' }}>
                  {loading
                    ? <RefreshCw className="w-5 h-5 animate-spin" />
                    : <Send className="w-5 h-5" />}
                  <span className="text-xs">Enviar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs flex-wrap" style={{ color: '#9CA3AF' }}>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: '#DEC078' }} />
                  Ctrl+Enter para enviar
                </span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Consulta VPS + DataJud automaticamente
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
            style={{ background: 'rgba(222,192,120,0.08)', border: '1px solid rgba(222,192,120,0.35)', color: '#8a6800' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Legal:</strong> Peças e pareceres são <strong>minutas técnicas</strong> que requerem revisão e assinatura pelo{' '}
                <strong>Dr. Mauro Monção</strong> (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037).
                O agente nunca inventa jurisprudência — quando incerto, indica [VERIFICAR].
                Dados do banco VPS são atualizados em tempo real.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
