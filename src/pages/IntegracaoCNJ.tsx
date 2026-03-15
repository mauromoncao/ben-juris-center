import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale, RefreshCw, CheckCircle, AlertTriangle, Clock, Activity,
  Download, Bell, Zap, FileText, Search, Wifi, WifiOff, ChevronDown,
  ChevronUp, ExternalLink, Info, AlertCircle, Plus, Trash2,
  BookOpen, Gavel,
} from 'lucide-react';

// ─── Tipo: Processo Monitorado ────────────────────────────────
interface ProcessoMonitorado {
  id: string;
  numero: string;
  tribunal: string;
  descricao: string;
  ultimoMovimento: string | null;
  resultado: any | null;
  verificando: boolean;
}
const PROCESSOS_INICIAIS: ProcessoMonitorado[] = [];

// ─── Tipos ────────────────────────────────────────────────────
interface SistemaStatus {
  id: string;
  nome: string;
  tribunal: string;
  status: 'online' | 'degradado' | 'offline' | 'nao_configurado' | 'verificando';
  ultima_sync: string;
  latency_ms?: number;
  configurado?: boolean;
}

interface Comunicacao {
  id: string;
  tipo: string;
  processo: string;
  tribunal: string;
  descricao: string;
  dataEnvio: string;
  prazo: string | null;
  situacao: string;
  urgencia: 'urgente' | 'alta' | 'media' | 'baixa';
}

interface BuscaProcesso {
  modo: 'numero' | 'nome';
  numero: string;
  nome: string;
  tribunal: string;
  resultado: any | null;
  buscando: boolean;
  erro: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────
const urgCor: Record<string, string> = {
  urgente: 'bg-red-50 text-red-700 border-red-200',
  alta:    'bg-amber-50 text-amber-800 border-amber-200',
  media:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  baixa:   'bg-green-50 text-green-700 border-green-200',
};
const tipoIcone: Record<string, string> = {
  intimacao: '📬', citacao: '🔱', pauta: '📅', despacho: '📄',
  sentenca: '🏛️', comunicacao: '📩', decisao: '🔱',
};
function formatarData(iso: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return iso; }
}

// ─── Chamada centralizada à api/cnj ──────────────────────────
async function callCNJ(action: string, params: Record<string, any> = {}) {
  const res = await fetch((import.meta.env.VITE_FILE_PARSER_URL?.replace('/upload','') || 'https://api.mauromoncao.adv.br') + '/cnj', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// ─── Componente principal ─────────────────────────────────────
export default function IntegracaoCNJ() {
  // ── Estado global ───────────────────────────────────────────
  const [sistemas, setSistemas]             = useState<SistemaStatus[]>([]);
  const [comunicacoes, setComunicacoes]     = useState<Comunicacao[]>([]);
  const [totalComun, setTotalComun]         = useState(0);
  const [paginaComun, setPaginaComun]       = useState(0);
  const [loadingStatus, setLoadingStatus]   = useState(true);
  const [loadingComun, setLoadingComun]     = useState(true);
  const [syncing, setSyncing]               = useState<string | null>(null);
  const [cienciando, setCienciando]         = useState<string | null>(null);
  const [expandido, setExpandido]           = useState<string | null>(null);
  const [mensagem, setMensagem]             = useState('');
  const [aba, setAba]                       = useState<'notificacoes' | 'monitoramento' | 'busca'>('monitoramento');
  const [djenConfigurado, setDjenConfigurado] = useState<boolean | null>(null);

  // ── Monitoramento por número de processo ────────────────────────────
  const [processos, setProcessos] = useState<ProcessoMonitorado[]>(() => {
    try { const s = localStorage.getItem('ben_processos_monitorados'); return s ? JSON.parse(s) : PROCESSOS_INICIAIS; }
    catch { return PROCESSOS_INICIAIS; }
  });
  const [novoNumero, setNovoNumero]         = useState('');
  const [novoTribunal, setNovoTribunal]     = useState('TJPI');
  const [novaDesc, setNovaDesc]             = useState('');
  const [verificandoTodos, setVerificandoTodos] = useState(false);

  useEffect(() => {
    localStorage.setItem('ben_processos_monitorados', JSON.stringify(processos));
  }, [processos]);

  const verificarProcesso = useCallback(async (id: string) => {
    const proc = processos.find(p => p.id === id);
    if (!proc) return;
    setProcessos(prev => prev.map(p => p.id === id ? { ...p, verificando: true } : p));
    try {
      const data = await callCNJ('datajud_monitorar_lista', {
        processos: [{ numero: proc.numero, tribunal: proc.tribunal, ultimoMovimento: proc.ultimoMovimento }],
      });
      const res = data?.processos?.[0];
      setProcessos(prev => prev.map(p => p.id === id
        ? { ...p, verificando: false, resultado: res || null, ultimoMovimento: res?.ultimoMovimento || p.ultimoMovimento }
        : p));
    } catch { setProcessos(prev => prev.map(p => p.id === id ? { ...p, verificando: false } : p)); }
  }, [processos]);

  const verificarTodos = useCallback(async () => {
    if (!processos.length) return;
    setVerificandoTodos(true);
    try {
      const data = await callCNJ('datajud_monitorar_lista', {
        processos: processos.map(p => ({ numero: p.numero, tribunal: p.tribunal, ultimoMovimento: p.ultimoMovimento })),
      });
      const resArr: any[] = data?.processos || [];
      setProcessos(prev => prev.map(p => {
        const res = resArr.find((r: any) => r.numero?.replace(/\D/g,'') === p.numero.replace(/\D/g,''));
        return res ? { ...p, resultado: res, ultimoMovimento: res.ultimoMovimento || p.ultimoMovimento } : p;
      }));
    } finally { setVerificandoTodos(false); }
  }, [processos]);

  const adicionarProcesso = () => {
    if (!novoNumero.trim()) return;
    setProcessos(prev => [...prev, {
      id: Date.now().toString(), numero: novoNumero.trim(),
      tribunal: novoTribunal, descricao: novaDesc.trim() || '—',
      ultimoMovimento: null, resultado: null, verificando: false,
    }]);
    setNovoNumero(''); setNovaDesc('');
  };

  const removerProcesso = (id: string) => setProcessos(prev => prev.filter(p => p.id !== id));

  const marcarLido = (id: string) => setProcessos(prev => prev.map(p => p.id !== id ? p : {
    ...p,
    ultimoMovimento: p.resultado?.movimentosRecentes?.[0]?.dataHora || p.ultimoMovimento,
    resultado: p.resultado ? { ...p.resultado, novosMovimentos: 0 } : null,
  }));

  // ── Estado de busca DataJud ─────────────────────────────────
  const [busca, setBusca] = useState<BuscaProcesso>({
    modo: 'nome', numero: '', nome: 'MAURO MONCAO', tribunal: 'TJPI',
    resultado: null, buscando: false, erro: null,
  });

  // ── Carregar status dos sistemas ────────────────────────────
  const carregarStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch((import.meta.env.VITE_FILE_PARSER_URL?.replace('/upload','') || 'https://api.mauromoncao.adv.br') + '/cnj');
      const data = await res.json();

      const datajudTribunais = data?.datajud?.tribunais_testados || [];
      const djenInfo = data?.djen || {};

      setDjenConfigurado(djenInfo.configurado ?? false);

      const novos: SistemaStatus[] = [
        // DataJud — sempre disponível (chave pública)
        {
          id: 'datajud',
          nome: 'DataJud — Base Nacional do Judiciário',
          tribunal: 'CNJ',
          status: data?.datajud?.datajud === 'online' ? 'online'
                : data?.datajud?.datajud === 'offline' ? 'offline' : 'degradado',
          ultima_sync: formatarData(data?.datajud?.timestamp),
          latency_ms: datajudTribunais[0]?.latency_ms,
          configurado: true,
        },
        // DJEN — requer credencial
        {
          id: 'djen',
          nome: 'DJEN — Domicílio Judicial Eletrônico',
          tribunal: 'CNJ',
          status: !djenInfo.configurado ? 'nao_configurado'
                : djenInfo.djen === 'online' ? 'online'
                : djenInfo.djen === 'offline' ? 'offline' : 'degradado',
          ultima_sync: formatarData(djenInfo.timestamp || data?.timestamp),
          latency_ms: djenInfo.latency_ms,
          configurado: djenInfo.configurado ?? false,
        },
        // Tribunais individuais (DataJud)
        ...datajudTribunais.map((t: any) => ({
          id:        t.alias,
          nome:      `${t.tribunal} — via DataJud`,
          tribunal:  t.tribunal,
          status:    t.status as SistemaStatus['status'],
          ultima_sync: formatarData(data?.datajud?.timestamp),
          latency_ms: t.latency_ms,
          configurado: true,
        })),
      ];

      setSistemas(novos);
    } catch (e: any) {
      setMensagem(`Erro ao verificar status: ${e.message}`);
      setTimeout(() => setMensagem(''), 5000);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  // ── Carregar comunicações DJEN ───────────────────────────────
  const carregarComunicacoes = useCallback(async (pagina = 0) => {
    setLoadingComun(true);
    try {
      const data = await callCNJ('djen_listar', { pagina, tamanho: 20, status: 'NAO_LIDA' });
      setComunicacoes(data.comunicacoes || []);
      setTotalComun(data.total || 0);
      setPaginaComun(pagina);
      if (!data.configurado) {
        setDjenConfigurado(false);
      }
    } catch (e: any) {
      // silencioso — status já indicado pelos sistemas
    } finally {
      setLoadingComun(false);
    }
  }, []);

  // ── Inicialização ───────────────────────────────────────────
  useEffect(() => {
    carregarStatus();
    carregarComunicacoes(0);
  }, [carregarStatus, carregarComunicacoes]);

  // ── Sincronizar sistema específico ──────────────────────────
  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      if (id === 'djen' || id === 'all') {
        await carregarComunicacoes(0);
      }
      if (id === 'datajud' || id === 'all') {
        await carregarStatus();
      }
    } finally {
      setSyncing(null);
    }
  };

  // ── Registrar ciência ────────────────────────────────────────
  const handleCiencia = async (idComunicacao: string) => {
    if (!djenConfigurado) {
      setMensagem('Configure DJEN_TOKEN no Cloudflare Pages para registrar ciências.');
      setTimeout(() => setMensagem(''), 5000);
      return;
    }
    setCienciando(idComunicacao);
    try {
      await callCNJ('djen_marcar_ciencia', { idComunicacao });
      setComunicacoes(prev => prev.map(c =>
        c.id === idComunicacao ? { ...c, situacao: 'LIDA' } : c
      ));
      setMensagem('✅ Ciência registrada no DJEN com sucesso.');
    } catch (e: any) {
      setMensagem(`Erro ao registrar ciência: ${e.message}`);
    } finally {
      setCienciando(null);
      setTimeout(() => setMensagem(''), 5000);
    }
  };

  // ── Busca DataJud ────────────────────────────────────────────
  const handleBusca = async () => {
    const termoBusca = busca.modo === 'numero' ? busca.numero.trim() : busca.nome.trim();
    if (!termoBusca) return;
    setBusca(prev => ({ ...prev, buscando: true, erro: null, resultado: null }));
    try {
      let data;
      if (busca.modo === 'numero') {
        data = await callCNJ('datajud_busca_numero', {
          numero:   busca.numero.trim(),
          tribunal: busca.tribunal || undefined,
        });
      } else {
        data = await callCNJ('datajud_busca_parte', {
          nome:     busca.nome.trim(),
          tribunal: busca.tribunal || undefined,
        });
      }
      setBusca(prev => ({ ...prev, resultado: data, buscando: false }));
    } catch (e: any) {
      setBusca(prev => ({ ...prev, erro: e.message, buscando: false }));
    }
  };

  // ── Badge de status ──────────────────────────────────────────
  const statusBadge = (s: SistemaStatus['status']) => {
    const map = {
      online:           { cls: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500',  label: 'Online' },
      degradado:        { cls: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-yellow-400', label: 'Degradado' },
      offline:          { cls: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-500',    label: 'Offline' },
      nao_configurado:  { cls: 'bg-slate-50 text-slate-500 border-slate-200',  dot: 'bg-slate-300',  label: 'Não config.' },
      verificando:      { cls: 'bg-blue-50 text-blue-600 border-blue-200',     dot: 'bg-blue-400',   label: 'Verificando' },
    };
    const info = map[s] || map.verificando;
    return (
      <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium border ${info.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${info.dot} animate-pulse`} />
        {info.label}
      </span>
    );
  };

  const novas = comunicacoes.filter(c => c.situacao !== 'LIDA').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}>
            <Scale size={24} className="text-blue-400" />Integração CNJ
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            DataJud (API Pública) + DJEN — Recepção automática de intimações e citações
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {novas > 0 && (
            <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Bell size={13} />{novas} nova(s)
            </span>
          )}
          <button
            onClick={() => handleSync('all')}
            disabled={!!syncing}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <RefreshCw size={14} className={syncing === 'all' ? 'animate-spin' : ''} />
            Sincronizar Todos
          </button>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
          mensagem.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <AlertCircle size={16} />{mensagem}
        </div>
      )}

      {/* Banner DJEN não configurado */}
      {djenConfigurado === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 mb-1">DJEN não configurado — intimações indisponíveis</p>
            <p className="text-xs text-amber-700 mb-2">
              Para receber intimações e citações automaticamente, gere uma credencial API no portal do DJEN
              e configure a variável de ambiente DJEN_TOKEN no Cloudflare Pages.
            </p>
            <ol className="text-xs text-amber-700 space-y-0.5 list-decimal ml-4">
              <li>Acesse <a href="https://domicilio-eletronico.pdpj.jus.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">domicilio-eletronico.pdpj.jus.br</a> com o certificado digital do escritório</li>
              <li>Menu lateral → <strong>Gerenciar credenciais API</strong> → <strong>Solicitar</strong></li>
              <li>Aceite os termos e gere o Bearer token</li>
              <li>Configure <code className="bg-amber-100 px-1 rounded">DJEN_TOKEN=&lt;token&gt;</code> e <code className="bg-amber-100 px-1 rounded">DJEN_CNPJ=&lt;cnpj&gt;</code> no Cloudflare Pages</li>
            </ol>
          </div>
          <a
            href="https://domicilio-eletronico.pdpj.jus.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={12} />Abrir DJEN
          </a>
        </div>
      )}

      {/* Cards de status dos sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loadingStatus
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse h-28" />
            ))
          : sistemas.map(s => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-semibold text-slate-800 leading-tight truncate">{s.nome}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.tribunal}</div>
                  </div>
                  {statusBadge(s.status)}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <div className="text-xs text-slate-400">Última Sync</div>
                    <div className="text-xs text-slate-700 font-medium mt-0.5 truncate">{s.ultima_sync}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <div className="text-xs text-slate-400">Latência</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: '#19385C' }}>
                      {s.latency_ms != null ? `${s.latency_ms} ms` : '—'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleSync(s.id)}
                  disabled={syncing === s.id}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-medium py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={syncing === s.id ? 'animate-spin' : ''} />
                  {syncing === s.id ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              </div>
            ))
        }
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit flex-wrap">
        {([
          { id: 'monitoramento', label: '📋 Meus Processos',     count: processos.filter(p => (p.resultado?.novosMovimentos || 0) > 0).length || null },
          { id: 'notificacoes',  label: `🔔 Comunicações DJEN`, count: novas },
          { id: 'busca',         label: '🔍 Busca DataJud',     count: null },
        ] as const).map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              aba === a.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {a.label}
            {a.count != null && a.count > 0 && (
              <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${aba === a.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                {a.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ABA: Monitoramento — Meus Processos */}
      {aba === 'monitoramento' && (
        <div className="space-y-4">

          {/* Banner de aviso sobre limitação DataJud */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 space-y-1">
              <p className="font-semibold">Como funciona o monitoramento</p>
              <p>A API Pública do DataJud <strong>não permite busca por nome ou OAB</strong> — o campo "partes" não é indexado.
                 Cadastre abaixo os números dos seus processos (copiados dos portais dos tribunais) e o sistema monitora
                 automaticamente as movimentações.</p>
              <p className="font-medium">Para encontrar seus números de processo:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { label: 'TJPI — OAB/PI 7304-A', url: 'https://pje.tjpi.jus.br/1g/ConsultaPublica/listView.seam' },
                  { label: 'TJCE — OAB/CE 22502',  url: 'https://eproc.tjce.jus.br/eproc/externo_controlador.php?acao=processo_consulta_publica' },
                  { label: 'TJMA — OAB/MA 29037',  url: 'https://pje.tjma.jus.br/pje/ConsultaPublica/listView.seam' },
                  { label: 'TRF1',                  url: 'https://pje1g.trf1.jus.br/consultapublica/ConsultaPublica/listView.seam' },
                  { label: 'TRT22 — OAB/PI 7304-A', url: 'https://pje.trt22.jus.br/consultaprocessual/pages/consultas/ConsultaProcessual.seam' },
                ].map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg font-medium transition-colors">
                    <ExternalLink size={10} />{s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Perfil do advogado */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gavel size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-800">Perfil Monitorado — Dr. Mauro Monção</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Nome nos autos', value: 'MAURO MONÇÃO DA SILVA / MAURO MONCAO DA SILVA / MAURO MONCAO' },
                { label: 'OAB/PI', value: '7304-A' },
                { label: 'OAB/CE', value: '22502' },
                { label: 'OAB/MA', value: '29037' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <div className="text-xs font-semibold text-slate-800 whitespace-pre-line leading-relaxed">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar processo */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Plus size={15} className="text-blue-400" />Cadastrar Número de Processo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Número CNJ</label>
                <input
                  type="text"
                  value={novoNumero}
                  onChange={e => setNovoNumero(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionarProcesso()}
                  placeholder="0000000-00.0000.8.22.0001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Tribunal</label>
                <select value={novoTribunal} onChange={e => setNovoTribunal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="TJPI">TJPI</option>
                  <option value="TJCE">TJCE</option>
                  <option value="TJMA">TJMA</option>
                  <option value="TRT22">TRT22</option>
                  <option value="TRF1">TRF1</option>
                  <option value="TRF5">TRF5</option>
                  <option value="STJ">STJ</option>
                  <option value="TST">TST</option>
                  <option value="TJSP">TJSP</option>
                  <option value="TJRJ">TJRJ</option>
                  <option value="TJMG">TJMG</option>
                  <option value="TJBA">TJBA</option>
                  <option value="TJPE">TJPE</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Descrição (opcional)</label>
                <input
                  type="text"
                  value={novaDesc}
                  onChange={e => setNovaDesc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionarProcesso()}
                  placeholder="Ex: Tributário SEFAZ-PI"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button onClick={adicionarProcesso} disabled={!novoNumero.trim()}
              className="mt-3 btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <Plus size={14} />Cadastrar Processo
            </button>
          </div>

          {/* Lista de processos monitorados */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <BookOpen size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-800">Processos Cadastrados</span>
              <span className="ml-auto text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200 px-2 py-0.5 rounded-full">
                {processos.length} processo(s)
              </span>
              <button onClick={verificarTodos} disabled={verificandoTodos || !processos.length}
                className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                <RefreshCw size={12} className={verificandoTodos ? 'animate-spin' : ''} />
                {verificandoTodos ? 'Verificando...' : 'Verificar Todos'}
              </button>
            </div>

            {processos.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Nenhum processo cadastrado</p>
                <p className="text-slate-400 text-xs mt-1">
                  Copie os números dos seus processos nos portais acima e cadastre aqui para monitoramento automático.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {processos.map(proc => {
                  const novos = proc.resultado?.novosMovimentos || 0;
                  const encontrado = proc.resultado?.encontrado;
                  return (
                    <div key={proc.id} className={`px-4 py-4 hover:bg-slate-50 transition-colors ${novos > 0 ? 'border-l-2 border-l-green-500' : ''}`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono font-bold text-blue-600">{proc.numero}</span>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{proc.tribunal}</span>
                            {proc.descricao !== '—' && (
                              <span className="text-xs text-slate-400">{proc.descricao}</span>
                            )}
                            {novos > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                                {novos} novo(s)
                              </span>
                            )}
                            {encontrado === false && (
                              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                Não encontrado
                              </span>
                            )}
                          </div>

                          {/* Resultado */}
                          {proc.resultado?.encontrado && (
                            <div className="mt-1.5 space-y-1">
                              <p className="text-xs text-slate-500">
                                <span className="font-medium">Classe:</span> {proc.resultado.classe} &nbsp;|&nbsp;
                                <span className="font-medium">Órgão:</span> {proc.resultado.orgao}
                              </p>
                              {proc.resultado.movimentosRecentes?.length > 0 && (
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-1">
                                  {proc.resultado.movimentosRecentes.slice(0, 3).map((m: any, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-xs">
                                      <span className="text-slate-400 whitespace-nowrap flex-shrink-0">{formatarData(m.dataHora)}</span>
                                      <span className={`${novos > 0 && i === 0 ? 'text-green-700 font-semibold' : 'text-slate-600'}`}>
                                        {m.nome || m.codigo}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {proc.resultado?.erro && (
                            <p className="text-xs text-red-500 mt-1">{proc.resultado.erro}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button onClick={() => verificarProcesso(proc.id)} disabled={proc.verificando}
                            className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                            <RefreshCw size={11} className={proc.verificando ? 'animate-spin' : ''} />
                            {proc.verificando ? 'Verificando...' : 'Verificar'}
                          </button>
                          {novos > 0 && (
                            <button onClick={() => marcarLido(proc.id)}
                              className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                              <CheckCircle size={11} />Marcar lido
                            </button>
                          )}
                          <button onClick={() => removerProcesso(proc.id)}
                            className="text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                            <Trash2 size={11} />Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA: Comunicações DJEN */}
      {aba === 'notificacoes' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
            <Bell size={16} className="text-blue-400" />
            <span className="font-semibold text-slate-800 text-sm">Comunicações Recebidas — DJEN</span>
            <span className="ml-auto text-xs bg-blue-50 text-blue-700 font-semibold border border-blue-200 px-2 py-0.5 rounded-full">
              {totalComun} total
            </span>
            <button
              onClick={() => carregarComunicacoes(paginaComun)}
              disabled={loadingComun}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <RefreshCw size={12} className={loadingComun ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingComun ? (
            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Carregando comunicações...</div>
          ) : !djenConfigurado ? (
            <div className="p-8 text-center">
              <WifiOff size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">DJEN não configurado</p>
              <p className="text-slate-400 text-xs mt-1">Configure o token conforme as instruções acima.</p>
            </div>
          ) : comunicacoes.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-green-700 text-sm font-medium">Nenhuma comunicação pendente</p>
              <p className="text-slate-400 text-xs mt-1">Todas as intimações estão em dia.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {comunicacoes.map(c => (
                <div
                  key={c.id}
                  className={`px-4 py-4 hover:bg-slate-50 transition-colors ${c.situacao !== 'LIDA' ? 'border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0">{tipoIcone[c.tipo?.toLowerCase()] || '📩'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs text-blue-500 font-mono">{c.processo || '—'}</span>
                        {c.tribunal && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{c.tribunal}</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${urgCor[c.urgencia] || urgCor.media}`}>
                          {c.urgencia?.charAt(0).toUpperCase() + c.urgencia?.slice(1)}
                        </span>
                        {c.situacao !== 'LIDA' && (
                          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">NOVO</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-snug">
                        {c.descricao ? c.descricao.slice(0, 200) + (c.descricao.length > 200 ? '…' : '') : 'Sem descrição.'}
                      </p>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-400">{formatarData(c.dataEnvio)}</span>
                        {c.prazo && (
                          <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                            <Clock size={10} />Prazo: {formatarData(c.prazo)}
                          </span>
                        )}
                      </div>
                      {/* Detalhe expandido */}
                      {expandido === c.id && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                          <div><span className="font-medium">ID:</span> {c.id}</div>
                          <div><span className="font-medium">Situação:</span> {c.situacao}</div>
                          <div><span className="font-medium">Tipo:</span> {c.tipo}</div>
                          {c.descricao && <div><span className="font-medium">Texto completo:</span> {c.descricao}</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {c.situacao !== 'LIDA' && (
                        <button
                          onClick={() => handleCiencia(c.id)}
                          disabled={cienciando === c.id}
                          className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle size={12} />
                          {cienciando === c.id ? 'Registrando...' : 'Registrar Ciência'}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandido(prev => prev === c.id ? null : c.id)}
                        className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
                      >
                        <FileText size={12} />
                        {expandido === c.id ? 'Fechar' : 'Detalhes'}
                        {expandido === c.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalComun > 20 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Mostrando {paginaComun * 20 + 1}–{Math.min((paginaComun + 1) * 20, totalComun)} de {totalComun}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => carregarComunicacoes(paginaComun - 1)}
                  disabled={paginaComun === 0 || loadingComun}
                  className="text-xs border border-slate-200 px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >Anterior</button>
                <button
                  onClick={() => carregarComunicacoes(paginaComun + 1)}
                  disabled={(paginaComun + 1) * 20 >= totalComun || loadingComun}
                  className="text-xs border border-slate-200 px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >Próxima</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: Busca DataJud */}
      {aba === 'busca' && (
        <div className="space-y-4">
          {/* Formulário de busca */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Search size={16} className="text-blue-400" />Buscar Processo no DataJud (CNJ)
            </h3>

            {/* Seletor de modo */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-4">
              {(['nome', 'numero'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setBusca(prev => ({ ...prev, modo: m, resultado: null, erro: null }))}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    busca.modo === m ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'nome' ? '👤 Por Nome da Parte' : '🔢 Por Número CNJ'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                {busca.modo === 'nome' ? (
                  <>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Nome da Parte <span className="text-slate-400 font-normal">(advogado, cliente ou parte contrária)</span>
                    </label>
                    <input
                      type="text"
                      value={busca.nome}
                      onChange={e => setBusca(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
                      onKeyDown={e => e.key === 'Enter' && handleBusca()}
                      placeholder="Ex: MAURO MONCAO"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
                    <p className="text-xs text-slate-400 mt-1">💡 Use nome parcial. Sem tribunal selecionado: busca em TJPI, TJCE, TJMA, TRT22 e TRF1 simultaneamente.</p>
                  </>
                ) : (
                  <>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">
                      Número CNJ <span className="text-slate-400 font-normal">(ex: 0001234-55.2024.8.17.0001)</span>
                    </label>
                    <input
                      type="text"
                      value={busca.numero}
                      onChange={e => setBusca(prev => ({ ...prev, numero: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleBusca()}
                      placeholder="0000000-00.0000.0.00.0000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Tribunal</label>
                <select
                  value={busca.tribunal}
                  onChange={e => setBusca(prev => ({ ...prev, tribunal: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <optgroup label="Prioritários (PI/CE/MA)">
                    <option value="TJPI">TJPI — Tribunal de Justiça do Piauí</option>
                    <option value="TJCE">TJCE — Tribunal de Justiça do Ceará</option>
                    <option value="TJMA">TJMA — Tribunal de Justiça do Maranhão</option>
                    <option value="TRT22">TRT22 — Trabalho / Piauí</option>
                    <option value="TRT7">TRT7 — Trabalho / Ceará</option>
                  </optgroup>
                  <optgroup label="Federal / Superiores">
                    <option value="TRF1">TRF1 — Tribunal Regional Federal 1ª Região</option>
                    <option value="TRF5">TRF5 — Tribunal Regional Federal 5ª Região</option>
                    <option value="STJ">STJ — Superior Tribunal de Justiça</option>
                    <option value="TST">TST — Tribunal Superior do Trabalho</option>
                    <option value="STM">STM — Superior Tribunal Militar</option>
                  </optgroup>
                  <optgroup label="Outros estados">
                    <option value="TJSP">TJSP — São Paulo</option>
                    <option value="TJRJ">TJRJ — Rio de Janeiro</option>
                    <option value="TJMG">TJMG — Minas Gerais</option>
                    <option value="TJBA">TJBA — Bahia</option>
                    <option value="TJPE">TJPE — Pernambuco</option>
                    <option value="TJRS">TJRS — Rio Grande do Sul</option>
                    <option value="TJPR">TJPR — Paraná</option>
                    <option value="TJSC">TJSC — Santa Catarina</option>
                    <option value="TJGO">TJGO — Goiás</option>
                    <option value="TJDFT">TJDFT — Distrito Federal</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleBusca}
                disabled={busca.buscando || !(busca.modo === 'numero' ? busca.numero.trim() : busca.nome.trim())}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {busca.buscando
                  ? <><RefreshCw size={14} className="animate-spin" />Buscando no DataJud...</>
                  : <><Search size={14} />{busca.modo === 'nome' ? 'Buscar por Nome' : 'Buscar por Número'}</>
                }
              </button>
              {busca.resultado && (
                <span className="text-xs text-slate-500">
                  {busca.resultado.total} resultado(s) encontrado(s)
                </span>
              )}
            </div>

            {/* Erro */}
            {busca.erro && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle size={14} />{busca.erro}
              </div>
            )}
          </div>

          {/* Resultado da busca */}
          {busca.resultado?.processos?.length > 0 && (
            <div className="space-y-3">
              {busca.resultado.processos.map((p: any) => (
                <div key={p.id || p.numeroProcesso} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-blue-600">{p.numeroProcesso}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.classeProcessual?.nome || p.classeProcessual}
                        {p.orgaoJulgador?.nome && ` — ${p.orgaoJulgador.nome}`}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-400 whitespace-nowrap">
                      <div>Ajuizamento: {formatarData(p.dataAjuizamento)}</div>
                      <div>Atualização: {formatarData(p.dataUltimaAtualizacao)}</div>
                    </div>
                  </div>

                  {/* Assuntos */}
                  {p.assuntos?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.assuntos.slice(0, 4).map((a: any, i: number) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5">
                          {a.descricao || a}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Partes */}
                  {p.partes?.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Partes</p>
                      <div className="space-y-1">
                        {p.partes.slice(0, 6).map((parte: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 w-20 flex-shrink-0">{parte.tipo || parte.tipoParte}</span>
                            <span className="text-slate-700 font-medium">{parte.nome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Últimos movimentos */}
                  {p.movimentos?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">
                        Últimas movimentações ({p.movimentos.length} total)
                      </p>
                      <div className="space-y-1.5">
                        {[...p.movimentos]
                          .sort((a: any, b: any) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                          .slice(0, 5)
                          .map((m: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-slate-400 whitespace-nowrap flex-shrink-0">{formatarData(m.dataHora)}</span>
                            <span className="text-slate-700">{m.nome || m.descricao || m.codigo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {busca.resultado?.total === 0 && !busca.buscando && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <Search size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhum processo encontrado com esse número no {busca.tribunal}.</p>
              <p className="text-slate-400 text-xs mt-1">Verifique se o número e o tribunal estão corretos.</p>
            </div>
          )}

          {/* Info DataJud */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Activity size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p className="font-semibold">DataJud — API Pública do CNJ</p>
              <p>Base: <code className="bg-blue-100 px-1 rounded">api-publica.datajud.cnj.jus.br</code> — Chave pública, sem necessidade de cadastro.</p>
              <p>Cobertura: STF, STJ, TST, todos os TRFs, TRTs, TJs estaduais e TREs. Limite: 120 req/min por IP.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
