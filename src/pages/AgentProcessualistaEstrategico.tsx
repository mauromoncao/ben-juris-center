import { useAuth } from '../context/AuthContext';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { downloadDocx } from '../lib/generateDocx';
// timbreFile salvo na sessão para não precisar reanexar a cada download
let _sessionTimbreFile: File | null = null

import {
  Send, RefreshCw, Copy, CheckCircle, Scale, Shield, BookOpen,
  FileText, Clock, Brain, Sparkles,
  Download, Upload, X, ChevronRight,
  Wifi, Layers, Gavel, AlertTriangle, Search,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  elapsed?: number;
  thinkingAtivo?: boolean;
  isLoading?: boolean;
  risco?: string;
  confianca?: number;
}

interface DocumentoAnexo {
  nome: string;
  tipo: string;
  tamanho: number;
  texto: string;
}

// ─── Exemplos de consultas processuais ───────────────────────────────────────
const CONSULTAS_EXEMPLO = [
  { label: '🔱 Nulidade de citação', prompt: 'Analise hipóteses de nulidade de citação no processo civil. O réu não foi citado pessoalmente e a sentença foi proferida à revelia. Processo n. 0001234-56.2023.8.18.0001, 3ª Vara Cível de Teresina/PI. Quais são os fundamentos para anulação da sentença e como proceder?' },
  { label: '🔒 Habeas Corpus — prisão preventiva', prompt: 'Elabore habeas corpus para revogar prisão preventiva decretada há 90 dias por tráfico de drogas, sem renovação fundamentada. Acusado é primário, tem residência fixa e emprego lícito comprovado. Fundamente com art. 316 do CPP e jurisprudência do STJ.' },
  { label: '📋 Recurso de Apelação', prompt: 'A sentença julgou improcedente ação de indenização por danos morais decorrentes de inscrição indevida em cadastro restritivo. O juiz afastou o dano in re ipsa. Elabore apelação com error in judicando, fundamentada na jurisprudência do STJ (Súmula 385 e Tema 710).' },
  { label: '🔱 Mandado de Segurança', prompt: 'Elabore mandado de segurança contra ato do Diretor de Licitações que indeferiu recurso administrativo sem fundamentação, violando o contraditório e ampla defesa. Lei 9.784/1999, art. 50. Empresa ABC Ltda, CNPJ 00.000.000/0001-00.' },
  { label: '🔍 Mapeamento de nulidades', prompt: 'Analise o processo em anexo e mapeie todas as nulidades processuais e materiais presentes nos autos. Classifique cada nulidade (absoluta, relativa, sanável) e indique o prejuízo concreto e o fundamento jurídico para arguição.' },
  { label: '📄 Agravo de Instrumento', prompt: 'A decisão interlocutória indeferiu a tutela antecipada em ação de obrigação de fazer para fornecimento de medicamento de alto custo. Elabore agravo de instrumento com pedido de efeito ativo, fundamentado no fumus boni iuris e periculum in mora.' },
  { label: '⚡ Recurso de Revista (TST)', prompt: 'O TRT negou equiparação salarial por entender que havia diferença de produtividade, sem fundamentação em prova documental. Há violação do art. 461 da CLT e contrariedade à Súmula 6 do TST. Elabore recurso de revista com demonstração de pressupostos de admissibilidade.' },
  { label: '🛡️ Contestação — preliminares', prompt: 'Elabore contestação com arguição das seguintes preliminares: ilegitimidade passiva ad causam, inépcia da petição inicial por ausência de causa de pedir remota, e prescrição. Em seguida, defesa de mérito com negativa geral dos fatos. Processo de indenização por responsabilidade civil.' },
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

// ─── Extração de texto ────────────────────────────────────────────────────────
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

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function AgentProcessualistaEstrategico() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [documento, setDocumento] = useState<DocumentoAnexo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showExemplos, setShowExemplos] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Timbre modal ─────────────────────────────────────────────
  type TimbreChoice = 'com' | 'sem' | 'cancel'
  const [timbreModal, setTimbreModal] = useState<null | 'pending'>(null)
  const [timbreResolve, setTimbreResolve] = useState<null | ((v: TimbreChoice) => void)>(null)
  const [savedTimbreFile, setSavedTimbreFile] = useState<File | null>(_sessionTimbreFile)
  const timbreFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Upload de arquivo ─────────────────────────────────────────
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
      setInput(prev => prev || `Analise o documento processual "${file.name}" e: 1) mapeie todas as nulidades processuais e materiais; 2) identifique a instância atual e estado do processo; 3) sugira a estratégia de defesa mais adequada com fundamento em jurisprudência do STF e STJ.`);
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  }, [processarArquivo]);

  // ── Timbre: pergunta ao usuário ───────────────────────────────
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

  // ── Download Word ─────────────────────────────────────────────
  const handleDownload = async (content: string, _filename: string) => {
    const choice = await askTimbre()
    if (choice === 'cancel') return
    const timbreFile = choice === 'com' ? (savedTimbreFile || _sessionTimbreFile) : null
    try {
      await downloadDocx(content, 'Peça Processual — Mauro Monção Advogados', 'PROCESSUALISTA ESTRATÉGICO', timbreFile ?? undefined)
    } catch (err) {
      console.error('Docx error:', err)
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setShowExemplos(true);
    setDocumento(null);
    setInput('');
  };

  // ── Enviar mensagem ───────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    let conteudo = trimmed;
    if (documento) {
      conteudo = `[DOCUMENTO PROCESSUAL ANEXO: ${documento.nome} — ${formatarTamanho(documento.tamanho)}]\n\n${documento.texto.slice(0, 8000)}\n\n---\n\nCONSULTA DO ADVOGADO:\n${trimmed}`;
    }

    const userMsg: Message = { role: 'user', content: trimmed, timestamp: new Date() };
    const loadingMsg: Message = { role: 'assistant', content: '', timestamp: new Date(), thinkingAtivo: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setShowExemplos(false);
    setLoading(true);

    const start = Date.now();
    try {
      const res = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-processualista-estrategico',
          input: conteudo,
          clientId: user?.email || null,
          context: { urgente: false },
        }),
      });
      const data = await res.json();
      const elapsed = Date.now() - start;
      const resposta = data.output || data.response || data.result || 'Sem resposta.';

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: resposta,
          timestamp: new Date(),
          model: data.modelUsed || 'claude-opus',
          elapsed,
          thinkingAtivo: true,
          risco: data.risco,
          confianca: data.confianca,
        };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '❌ Erro de conexão. Verifique a API e tente novamente.',
          timestamp: new Date(),
        };
        return updated;
      });
    } finally {
      setLoading(false);
      setDocumento(null);
    }
  };

  // ── Paleta: azul profundo (processualista) ────────────────────
  const COR_PRIMARIA  = '#1e3a5f';   // azul profundo
  const COR_ACENTO    = '#2563eb';   // blue-600
  const COR_BG_BADGE  = 'rgba(30,58,95,0.10)';
  const COR_BORDER    = 'rgba(30,58,95,0.35)';
  const COR_GLOW      = 'rgba(37,99,235,0.40)';

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
            <p className="text-2xl font-bold">Solte o processo aqui</p>
            <p className="text-sm mt-2 opacity-80">PDF, DOCX ou TXT — máx. 10 MB</p>
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-slate-200" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow"
              style={{ border: `2px solid ${COR_GLOW}` }}>
              <img src="/ben-logo.png" alt="BEN" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: '#19385C' }}>
                PROCESSUALISTA ESTRATÉGICO
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: COR_BG_BADGE, color: COR_PRIMARIA, border: `1px solid ${COR_BORDER}` }}>
                  🔱 PROCESSUAL
                </span>
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Thinking sempre ativo · Processo Civil, Penal, Constitucional, Trabalhista, Administrativo · STF · STJ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>Thinking ON</span>
              <span className="w-2 h-2 rounded-full" style={{ background: '#00b37e' }} />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" style={{ color: '#19385C' }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>IA Processual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" style={{ color: COR_ACENTO }} />
              <span className="text-xs font-medium" style={{ color: '#19385C' }}>6 Camadas</span>
            </div>
            {messages.length > 0 && (
              <button onClick={handleClear}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-red-50"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                <RefreshCw className="w-3 h-3" /> Nova análise
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Layout principal ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* ── Sidebar: capacidades ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">

          {/* Capacidades processuais */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: COR_PRIMARIA }}>
              <Scale className="w-3.5 h-3.5" /> RAMOS PROCESSUAIS
            </p>
            {[
              { icon: '🔱', label: 'Processo Civil', sub: 'CPC · Nulidades · Recursos' },
              { icon: '🔒', label: 'Processo Penal', sub: 'CPP · HC · Nulidades' },
              { icon: '🔱', label: 'Proc. Constitucional', sub: 'STF · MS · ADI · ADPF' },
              { icon: '👷', label: 'Proc. Trabalhista', sub: 'CLT · TST · Recursos' },
              { icon: '📋', label: 'Proc. Administrativo', sub: 'Lei 9.784 · PAD · MS' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-2 border-b last:border-0" style={{ borderColor: '#F3F4F6' }}>
                <span className="text-base">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#111827' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Capacidades técnicas */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: COR_PRIMARIA }}>
              <Sparkles className="w-3.5 h-3.5" /> CAPACIDADES
            </p>
            {[
              { i: <AlertTriangle className="w-3 h-3" />, t: 'Mapeamento de nulidades' },
              { i: <Search className="w-3 h-3" />, t: 'Pesquisa STF/STJ/TST' },
              { i: <Gavel className="w-3 h-3" />, t: 'Redação de peças completas' },
              { i: <Layers className="w-3 h-3" />, t: 'Estratégia multi-instância' },
              { i: <BookOpen className="w-3 h-3" />, t: 'Doutrina Didier/Marinoni' },
              { i: <Shield className="w-3 h-3" />, t: 'Pipeline RAG — PDFs' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: '#F3F4F6', color: '#6B7280' }}>
                {item.i}
                <span className="text-xs">{item.t}</span>
              </div>
            ))}
          </div>

          {/* Exemplos */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: COR_PRIMARIA }}>
              <Clock className="w-3.5 h-3.5" /> CONSULTAS RÁPIDAS
            </p>
            <div className="flex flex-col gap-1.5">
              {CONSULTAS_EXEMPLO.slice(0, 5).map((ex, i) => (
                <button key={i}
                  onClick={() => { setInput(ex.prompt); setShowExemplos(false); textareaRef.current?.focus(); }}
                  className="text-left text-xs px-2.5 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ background: COR_BG_BADGE, color: COR_PRIMARIA, border: `1px solid ${COR_BORDER}` }}>
                  {ex.label} <ChevronRight className="w-3 h-3 inline ml-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat principal ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Exemplos de abertura */}
          {showExemplos && messages.length === 0 && (
            <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: COR_BG_BADGE }}>
                  <Scale className="w-5 h-5" style={{ color: COR_PRIMARIA }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#111827' }}>Processualista Estratégico</p>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Análise processual de máxima profundidade · 6 camadas · STF/STJ · Thinking sempre ativo</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONSULTAS_EXEMPLO.map((ex, i) => (
                  <button key={i}
                    onClick={() => { setInput(ex.prompt); setShowExemplos(false); textareaRef.current?.focus(); }}
                    className="text-left text-xs px-3 py-2.5 rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
                    style={{ background: COR_BG_BADGE, color: COR_PRIMARIA, border: `1px solid ${COR_BORDER}` }}>
                    <span>{ex.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mensagens */}
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'text-white' : ''}`}
                  style={msg.role === 'user'
                    ? { background: COR_PRIMARIA }
                    : { background: '#FFFFFF', border: '1px solid #E5E7EB' }}>

                  {/* Header da resposta */}
                  {msg.role === 'assistant' && !msg.isLoading && (
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: COR_PRIMARIA }}>🔱 PROCESSUALISTA</span>
                      {msg.thinkingAtivo && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: COR_BG_BADGE, color: COR_PRIMARIA }}>
                          <Brain className="w-2.5 h-2.5 inline mr-1" />Thinking
                        </span>
                      )}
                      {msg.elapsed && (
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          <Clock className="w-2.5 h-2.5 inline mr-1" />{formatarTempo(msg.elapsed)}
                        </span>
                      )}
                      {msg.risco && (
                        <span className="text-xs font-semibold" style={{ color: corRisco(msg.risco) }}>
                          Risco: {msg.risco}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Loading */}
                  {msg.role === 'assistant' && msg.thinkingAtivo && !msg.content && (
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(j => (
                          <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: COR_ACENTO, animationDelay: `${j * 0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        Analisando processo em 6 camadas...
                      </span>
                    </div>
                  )}

                  {/* Conteúdo */}
                  {msg.content && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: msg.role === 'user' ? '#fff' : '#374151' }}>
                      {msg.content}
                    </div>
                  )}

                  {/* Ações */}
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
                      <button onClick={() => handleDownload(msg.content, `processualista-${Date.now()}.docx`)}
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
            <div ref={messagesEndRef} />
          </div>

          {/* Documento anexado */}
          {documento && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: COR_BG_BADGE, border: `1px solid ${COR_BORDER}` }}>
              <FileText className="w-4 h-4 flex-shrink-0" style={{ color: COR_PRIMARIA }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: COR_PRIMARIA }}>{documento.nome}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{formatarTamanho(documento.tamanho)}</p>
              </div>
              <button onClick={() => setDocumento(null)} style={{ color: '#9CA3AF' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                  }}
                  placeholder="Descreva o caso processual, cole trechos do processo ou faça perguntas sobre nulidades, recursos, estratégia..."
                  rows={3}
                  className="w-full resize-none text-sm outline-none border rounded-xl p-3 pr-24"
                  style={{ borderColor: '#E5E7EB', color: '#374151', background: '#FAFAFA' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                  style={{ color: COR_PRIMARIA, borderColor: COR_BORDER, background: COR_BG_BADGE }}>
                  {uploading
                    ? <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Processando...</>
                    : <><Upload className="w-3 h-3" /> Anexar processo</>}
                </button>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>PDF · DOCX · TXT · máx 10MB</span>
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: COR_PRIMARIA }}>
                {loading
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analisando...</>
                  : <><Send className="w-3.5 h-3.5" />Analisar</>}
              </button>
            </div>
          </div>

          {/* Aviso legal */}
          <div className="rounded-xl p-3 text-xs"
            style={{ background: COR_BG_BADGE, border: `1px solid ${COR_BORDER}`, color: '#1e3a5f' }}>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso Legal:</strong> Peças processuais e pareceres são <strong>minutas técnicas</strong> que requerem revisão e assinatura pelo{' '}
                <strong>Dr. Mauro Monção</strong> (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037).
                Este agente atua em todos os ramos do Direito Processual com análise em 6 camadas e pipeline RAG para documentos extensos.
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

      {/* Input oculto para processo */}
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
        onChange={handleFileChange} />
    </div>
  );
}
