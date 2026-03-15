import React, { useState, useCallback, useRef } from 'react';
import {
  Search, Upload, BookOpen, FileText, Scale, FolderOpen,
  Database, Zap, CheckCircle, AlertCircle, Clock, X,
  ChevronRight, BarChart2, RefreshCw, Eye, Trash2,
  Film, Music, Image as ImageIcon, File, Plus,
  Loader2, CloudUpload, HardDrive, Globe, Star
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
type Category = 'processos' | 'biblioteca' | 'contratos' | 'jurisprudencias' | 'geral' | 'clientes';
type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
type SearchStatus = 'idle' | 'searching' | 'done';

interface SearchResult {
  filename:   string;
  namespace:  string;
  category:   Category;
  client_id?: string;
  process_id?: string;
  source?:    string;
  created_at?: string;
  score:      number;
  excerpts:   { text: string; score: number }[];
}

interface KBStats {
  total_vectors:  number;
  total_docs_est: number;
  namespaces:     number;
  categories: Record<string, number>;
  pinecone_ok:    boolean;
}

interface UploadedFile {
  id:       string;
  filename: string;
  category: Category;
  status:   UploadStatus;
  chunks?:  number;
  indexed?: number;
  error?:   string;
  size_kb:  number;
}

// ── Constants ────────────────────────────────────────────────
const CATEGORIES: Record<Category, { label: string; icon: React.ElementType; color: string; desc: string }> = {
  processos:       { label: 'Processos',       icon: Scale,      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',    desc: 'Peças, audiências, documentos processuais' },
  biblioteca:      { label: 'Biblioteca',      icon: BookOpen,   color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',       desc: 'Livros, doutrinas, pareceres, artigos' },
  contratos:       { label: 'Contratos',       icon: FileText,   color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'Contratos, NDAs, acordos, termos' },
  jurisprudencias: { label: 'Jurisprudências', icon: Scale,      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',          desc: 'Decisões STF, STJ, TRF, TJ, TST' },
  clientes:        { label: 'Clientes',        icon: FolderOpen, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',          desc: 'Documentos de clientes específicos' },
  geral:           { label: 'Geral',           icon: File,       color: 'text-slate-400 bg-slate-500/10 border-slate-500/30',       desc: 'Outros documentos e arquivos' },
};

const MAX_FILE_MB = 200;
const KB_API_URL  = '/api/knowledge';

// ── File type detection ──────────────────────────────────────
function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext))                          return <FileText className="w-4 h-4 text-red-400" />;
  if (['docx','doc'].includes(ext))                   return <FileText className="w-4 h-4 text-blue-400" />;
  if (['xlsx','xls','csv'].includes(ext))             return <BarChart2 className="w-4 h-4 text-green-400" />;
  if (['jpg','jpeg','png','webp','gif'].includes(ext))return <ImageIcon className="w-4 h-4 text-purple-400" />;
  if (['mp4','mov','mpeg','avi'].includes(ext))        return <Film className="w-4 h-4 text-orange-400" />;
  if (['mp3','m4a','wav','ogg'].includes(ext))         return <Music className="w-4 h-4 text-pink-400" />;
  return <File className="w-4 h-4 text-slate-400" />;
}

function formatBytes(kb: number) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ════════════════════════════════════════════════════════════
// COMPONENT: Upload Zone
// ════════════════════════════════════════════════════════════
function UploadZone({
  onFiles,
  category,
  setCategory,
  clientId,
  setClientId,
  processId,
  setProcessId,
  uploading,
}: {
  onFiles:      (files: File[]) => void;
  category:     Category;
  setCategory:  (c: Category) => void;
  clientId:     string;
  setClientId:  (v: string) => void;
  processId:    string;
  setProcessId: (v: string) => void;
  uploading:    boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFiles(files);
  }, [onFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Category selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const active = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                ${active
                  ? `${cfg.color} ring-1 ring-current`
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Optional metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Cliente (opcional)</label>
          <input
            type="text"
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            placeholder="Ex: joao_silva"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Nº Processo (opcional)</label>
          <input
            type="text"
            value={processId}
            onChange={e => setProcessId(e.target.value)}
            placeholder="Ex: 1234-56.2024.8.22.0001"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragging
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-white/20 hover:border-white/30 hover:bg-white/5'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.jpg,.jpeg,.png,.webp,.mp4,.mp3,.m4a,.wav"
          disabled={uploading}
        />
        <CloudUpload className="w-10 h-10 text-violet-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-white mb-1">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-slate-500">
          PDF, DOCX, XLSX, TXT, imagens, MP4, MP3 — até {MAX_FILE_MB}MB cada
        </p>
        <p className="text-xs text-slate-600 mt-2">
          Enviando para: <span className="text-violet-400 font-medium">
            {CATEGORIES[category].label}
          </span>
          {clientId && <> · Cliente: <span className="text-rose-400">{clientId}</span></>}
          {processId && <> · Processo: <span className="text-blue-400">{processId}</span></>}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: Search Panel
// ════════════════════════════════════════════════════════════
function SearchPanel() {
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [status, setStatus]     = useState<SearchStatus>('idle');
  const [results, setResults]   = useState<SearchResult[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [total, setTotal]       = useState(0);

  const doSearch = async () => {
    if (!query.trim()) return;
    setStatus('searching');
    setResults([]);

    try {
      const res = await fetch(`${KB_API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          category: category || undefined,
          topK: 12,
        }),
      });

      if (!res.ok) throw new Error('Falha na busca');
      const data = await res.json();

      setResults(data.results || []);
      setTotal(data.total || 0);
      setStatus('done');
    } catch (e: any) {
      setStatus('done');
      setResults([]);
    }
  };

  const scoreColor = (score: number) => {
    if (score > 0.75) return 'text-emerald-400';
    if (score > 0.55) return 'text-amber-400';
    return 'text-slate-500';
  };

  const scoreLabel = (score: number) => {
    if (score > 0.75) return 'Alta relevância';
    if (score > 0.55) return 'Relevante';
    return 'Relevância baixa';
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Ex: rescisão indireta transporte; FGTS multa 40%; contrato de honorários..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <button
          onClick={doSearch}
          disabled={!query.trim() || status === 'searching'}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {status === 'searching'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Zap className="w-4 h-4" />
          }
          Buscar
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1 rounded-full text-xs border transition-all ${
            !category ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'border-white/10 text-slate-500 hover:border-white/20'
          }`}
        >
          Todos
        </button>
        {(Object.entries(CATEGORIES) as [Category, typeof CATEGORIES[Category]][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setCategory(category === key ? '' : key)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              category === key ? `${cfg.color}` : 'border-white/10 text-slate-500 hover:border-white/20'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Suggested searches */}
      {status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'rescisão indireta do contrato de trabalho',
              'dano moral por assédio moral',
              'multa FGTS 40% demissão sem justa causa',
              'recurso cabimento prazo STJ',
              'responsabilidade civil do estado',
              'usucapião requisitos prazo posse',
            ].map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'done' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {total > 0
                ? <><span className="text-white font-medium">{total}</span> documento(s) encontrado(s)</>
                : <span className="text-slate-500">Nenhum resultado. Tente indexar documentos primeiro.</span>
              }
            </p>
            {total > 0 && (
              <button
                onClick={() => { setResults([]); setStatus('idle'); setQuery(''); }}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {results.map((r, i) => {
            const catCfg = CATEGORIES[r.category] || CATEGORIES.geral;
            const CatIcon = catCfg.icon;
            const isOpen = expanded === r.filename;
            return (
              <div key={i} className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.filename)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="mt-0.5">{getFileIcon(r.filename)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white truncate">{r.filename}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${catCfg.color}`}>
                        {catCfg.label}
                      </span>
                      {r.process_id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          Proc. {r.process_id}
                        </span>
                      )}
                      {r.client_id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          {r.client_id}
                        </span>
                      )}
                    </div>
                    {r.excerpts[0] && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {r.excerpts[0].text}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-medium ${scoreColor(r.score)}`}>
                      {Math.round(r.score * 100)}%
                    </span>
                    <span className={`text-xs ${scoreColor(r.score)}`}>
                      {scoreLabel(r.score)}
                    </span>
                    <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isOpen && r.excerpts.length > 0 && (
                  <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
                    <p className="text-xs text-slate-500 mb-2">Trechos relevantes encontrados:</p>
                    {r.excerpts.slice(0, 4).map((ex, j) => (
                      <div key={j} className="bg-white/5 rounded-lg p-3 border-l-2 border-violet-500/40">
                        <p className="text-xs text-slate-300 leading-relaxed">{ex.text}</p>
                        <span className={`text-xs mt-1 block ${scoreColor(ex.score)}`}>
                          Similaridade: {Math.round(ex.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: Stats Panel
// ════════════════════════════════════════════════════════════
function StatsPanel({ stats, loading, onRefresh }: {
  stats: KBStats | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Não foi possível carregar as estatísticas</p>
        <button onClick={onRefresh} className="text-xs text-violet-400 hover:text-violet-300 mt-2">
          Tentar novamente
        </button>
      </div>
    );
  }

  const catEntries = Object.entries(stats.categories || {}).filter(([, v]) => v > 0);

  return (
    <div className="space-y-5">
      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Documentos',  value: stats.total_docs_est.toLocaleString('pt-BR'), icon: FileText,  color: 'text-violet-400' },
          { label: 'Vetores',     value: stats.total_vectors.toLocaleString('pt-BR'),  icon: Database,  color: 'text-blue-400' },
          { label: 'Namespaces',  value: stats.namespaces.toString(),                  icon: FolderOpen, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pinecone status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
        stats.pinecone_ok
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      }`}>
        {stats.pinecone_ok
          ? <CheckCircle className="w-3.5 h-3.5" />
          : <AlertCircle className="w-3.5 h-3.5" />
        }
        {stats.pinecone_ok ? 'Pinecone conectado — busca semântica ativa' : 'Pinecone não configurado — configure PINECONE_API_KEY'}
      </div>

      {/* By category */}
      {catEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Por Categoria</p>
          {catEntries.map(([cat, count]) => {
            const cfg = CATEGORIES[cat as Category] || CATEGORIES.geral;
            const Icon = cfg.icon;
            const pct = Math.round((count / stats.total_vectors) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">{cfg.label}</span>
                  </div>
                  <span className="text-slate-500">{count.toLocaleString('pt-BR')} vetores ({pct}%)</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onRefresh}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-xs text-slate-500 hover:text-white hover:border-white/20 transition-all"
      >
        <RefreshCw className="w-3 h-3" />
        Atualizar estatísticas
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPONENT: Drive Sync Panel
// ════════════════════════════════════════════════════════════
function DriveSyncPanel() {
  const [folderId, setFolderId] = useState('');
  const [syncing, setSyncing]   = useState(false);
  const [result, setResult]     = useState<any>(null);

  const doSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch(`${KB_API_URL}/drive-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId || undefined }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Globe className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-400 space-y-1">
          <p className="text-blue-300 font-medium">Google Drive Sync Automático</p>
          <p>Detecta arquivos novos ou alterados e indexa automaticamente no Knowledge Base.</p>
          <p>Requer configuração de <span className="text-blue-300 font-mono">GOOGLE_SA_EMAIL</span> e <span className="text-blue-300 font-mono">GOOGLE_SA_KEY</span> no painel Cloudflare Pages.</p>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">ID da Pasta do Drive (opcional)</label>
        <input
          type="text"
          value={folderId}
          onChange={e => setFolderId(e.target.value)}
          placeholder="Ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs (da URL do Drive)"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
        />
        <p className="text-xs text-slate-600 mt-1">
          Deixe em branco para usar a pasta raiz configurada (<span className="font-mono text-slate-500">GOOGLE_DRIVE_ROOT</span>)
        </p>
      </div>

      <button
        onClick={doSync}
        disabled={syncing}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {syncing ? 'Sincronizando Drive...' : 'Sincronizar Google Drive'}
      </button>

      {result && (
        <div className={`p-3 rounded-lg border text-xs space-y-1 ${
          result.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {result.success ? (
            <>
              <p className="font-medium">✅ {result.message}</p>
              {result.synced !== undefined && (
                <p>Arquivos indexados: {result.synced} / {result.found || 0} encontrados</p>
              )}
              {result.failed > 0 && <p className="text-amber-300">Falhas: {result.failed}</p>}
              {result.elapsed_ms && <p className="text-slate-400">Tempo: {(result.elapsed_ms / 1000).toFixed(1)}s</p>}
            </>
          ) : (
            <p>❌ {result.error || result.message}</p>
          )}
          {result.instructions && (
            <ul className="mt-2 space-y-0.5 text-slate-400">
              {result.instructions.map((i: string, idx: number) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════
type Tab = 'search' | 'upload' | 'drive' | 'stats';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab]   = useState<Tab>('search');
  const [category, setCategory]     = useState<Category>('geral');
  const [clientId, setClientId]     = useState('');
  const [processId, setProcessId]   = useState('');
  const [uploadQueue, setUploadQueue] = useState<UploadedFile[]>([]);
  const [uploading, setUploading]   = useState(false);
  const [stats, setStats]           = useState<KBStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Load stats on mount
  React.useEffect(() => {
    if (activeTab === 'stats') loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${KB_API_URL}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {}
    setStatsLoading(false);
  };

  // Upload handler
  const handleFiles = useCallback(async (files: File[]) => {
    if (uploading) return;

    // Build queue entries
    const entries: UploadedFile[] = files.map(f => ({
      id:       `${Date.now()}-${f.name}`,
      filename: f.name,
      category,
      status:   'idle' as UploadStatus,
      size_kb:  Math.round(f.size / 1024),
    }));

    setUploadQueue(prev => [...entries, ...prev]);
    setUploading(true);

    for (const entry of entries) {
      const file = files.find(f => f.name === entry.filename)!;

      // Check size
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setUploadQueue(prev => prev.map(e =>
          e.id === entry.id
            ? { ...e, status: 'error', error: `Arquivo > ${MAX_FILE_MB}MB` }
            : e
        ));
        continue;
      }

      // Update status
      setUploadQueue(prev => prev.map(e =>
        e.id === entry.id ? { ...e, status: 'uploading' } : e
      ));

      try {
        // Read as base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // remove data:...;base64,
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to KB API
        const res = await fetch(`${KB_API_URL}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename:   file.name,
            mimetype:   file.type,
            category,
            client_id:  clientId  || undefined,
            process_id: processId || undefined,
            source:     'upload',
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUploadQueue(prev => prev.map(e =>
            e.id === entry.id
              ? { ...e, status: 'success', chunks: data.chunks, indexed: data.indexed }
              : e
          ));
        } else {
          setUploadQueue(prev => prev.map(e =>
            e.id === entry.id
              ? { ...e, status: 'error', error: data.error || 'Erro no upload' }
              : e
          ));
        }

      } catch (err: any) {
        setUploadQueue(prev => prev.map(e =>
          e.id === entry.id
            ? { ...e, status: 'error', error: err.message }
            : e
        ));
      }

      // Small delay between files
      await new Promise(r => setTimeout(r, 200));
    }

    setUploading(false);
  }, [uploading, category, clientId, processId]);

  const clearDone = () => {
    setUploadQueue(prev => prev.filter(e => e.status === 'uploading' || e.status === 'idle'));
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'search', label: 'Busca Semântica',    icon: Search },
    { id: 'upload', label: 'Indexar Documentos', icon: Upload },
    { id: 'drive',  label: 'Google Drive',        icon: Globe },
    { id: 'stats',  label: 'Estatísticas',        icon: BarChart2 },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800">
              <Database className="w-6 h-6 text-white" />
            </div>
            Ben Knowledge Base
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acervo inteligente do escritório — PDF, DOCX, imagens, vídeos, áudios indexados com IA
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <Zap className="w-3.5 h-3.5" />
          Busca Semântica Ativa
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'PDF, DOCX, XLSX',  sub: 'documentos',    icon: FileText,  color: 'text-blue-400' },
          { label: 'Imagens escaneadas', sub: 'OCR via IA',  icon: ImageIcon,  color: 'text-purple-400' },
          { label: 'Vídeo & Áudio',    sub: 'Whisper IA',    icon: Film,       color: 'text-orange-400' },
          { label: 'Google Drive',     sub: 'sync automático', icon: Globe,    color: 'text-green-400' },
        ].map(c => (
          <div key={c.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <c.icon className={`w-5 h-5 ${c.color} flex-shrink-0`} />
            <div>
              <p className="text-xs font-medium text-white">{c.label}</p>
              <p className="text-xs text-slate-500">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                active
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-5">

        {activeTab === 'search' && <SearchPanel />}

        {activeTab === 'upload' && (
          <div className="space-y-5">
            <UploadZone
              onFiles={handleFiles}
              category={category}
              setCategory={setCategory}
              clientId={clientId}
              setClientId={setClientId}
              processId={processId}
              setProcessId={setProcessId}
              uploading={uploading}
            />

            {/* Upload queue */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Fila de indexação ({uploadQueue.length})
                  </p>
                  <button
                    onClick={clearDone}
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Limpar concluídos
                  </button>
                </div>

                {uploadQueue.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-shrink-0">{getFileIcon(item.filename)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white truncate">{item.filename}</span>
                        <span className="text-xs text-slate-600">{formatBytes(item.size_kb)}</span>
                      </div>
                      {item.status === 'success' && item.chunks && (
                        <p className="text-xs text-emerald-400 mt-0.5">
                          ✅ {item.chunks} chunks indexados
                          {item.indexed ? ` (${item.indexed} no Pinecone)` : ''}
                        </p>
                      )}
                      {item.status === 'error' && (
                        <p className="text-xs text-red-400 mt-0.5">❌ {item.error}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {item.status === 'idle'      && <Clock className="w-4 h-4 text-slate-500" />}
                      {item.status === 'uploading' && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
                      {item.status === 'success'   && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {item.status === 'error'     && <AlertCircle className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bulk import tip */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <HardDrive className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-400 space-y-1">
                <p className="text-amber-300 font-medium">Migração em Lote do HD Local</p>
                <p>Para migrar centenas de arquivos de uma vez, use o <span className="font-mono text-amber-300">rclone</span> para copiar para o servidor e depois acione o endpoint <span className="font-mono text-amber-300">POST /api/bulk-index</span> no VPS.</p>
                <p>O indexador suporta até 200MB por arquivo e processa em paralelo com pausas automáticas.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'drive' && <DriveSyncPanel />}

        {activeTab === 'stats' && (
          <StatsPanel stats={stats} loading={statsLoading} onRefresh={loadStats} />
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-600 text-center">
        Ben Knowledge Base v1.0 · Dados indexados com OpenAI text-embedding-3-small (1536 dims) · Pinecone Vector DB · Isolamento por namespace/cliente
      </p>
    </div>
  );
}
