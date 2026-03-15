// ============================================================
// BEN MONITOR JURÍDICO — Dashboard
// Orquestra: Escavador DJe + DataJud CNJ + IA Jurídica
// ============================================================

import { useState, useCallback } from 'react'
import {
  Radio, RefreshCw, Search, FileText, AlertTriangle,
  CheckCircle, Clock, Activity, Database, Wifi, WifiOff,
  ChevronDown, ChevronUp, Zap, BarChart2, Scale, Info
} from 'lucide-react'

// ── Tipos ─────────────────────────────────────────────────────
interface ItemDJe {
  id?: string
  titulo?: string
  data?: string
  conteudo?: string
  tribunal?: string
  _termo?: string
  [key: string]: unknown
}

interface ItemProcesso {
  id?: string
  titulo?: string
  numero?: string
  tribunal?: string
  data?: string
  [key: string]: unknown
}

interface ProcessoDetalhe {
  processo?: {
    numero: string
    classe?: string
    tribunal?: string
    orgao?: string
    dataAjuizamento?: string
    assuntos?: string[]
  }
  movimentos?: Array<{
    data: string
    tipo: string
    complemento?: string
  }>
  analise?: string
  modelo_ia?: string
  erro?: string
}

interface MonitorResult {
  success: boolean
  elapsed_ms?: number
  dje?: { total: number; itens: ItemDJe[]; erros?: string[] }
  processos?: { total: number; itens: ItemProcesso[]; erros?: string[] }
  analise?: string
  modelo_ia?: string
  fontes?: {
    escavador: boolean
    datajud: boolean
    identificadores: string[]
  }
  error?: string
}

interface StatusResult {
  ok: boolean
  escavador: boolean
  datajud: boolean
  escritorio: string[]
  timestamp: string
}

// ── Helpers ───────────────────────────────────────────────────
function urgencyBadge(texto?: string) {
  if (!texto) return null
  const t = texto.toUpperCase()
  if (t.includes('CRÍTICO') || t.includes('CRITICO'))
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">CRÍTICO</span>
  if (t.includes('URGENTE'))
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">URGENTE</span>
  return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40">NORMAL</span>
}

function formatDate(dt?: string) {
  if (!dt) return '—'
  try { return new Date(dt).toLocaleDateString('pt-BR') } catch { return dt }
}

// ── Componente Card de Item DJe ───────────────────────────────
function CardDJe({ item }: { item: ItemDJe }) {
  const [open, setOpen] = useState(false)
  const titulo = item.titulo || item.id || 'Publicação sem título'
  const conteudo = String(item.conteudo || item['texto'] || '')

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 hover:border-cyan-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <FileText className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item._termo && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                {item._termo}
              </span>
            )}
            {item.tribunal && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 border border-slate-600">
                {item.tribunal}
              </span>
            )}
            <span className="text-[11px] text-slate-500">{formatDate(item.data)}</span>
          </div>
          <p className="text-sm text-slate-200 font-medium truncate">{titulo}</p>
          {conteudo && (
            <>
              <p className={`text-xs text-slate-400 mt-1 ${open ? '' : 'line-clamp-2'}`}>
                {conteudo}
              </p>
              {conteudo.length > 120 && (
                <button
                  onClick={() => setOpen(!open)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 mt-1 flex items-center gap-1"
                >
                  {open ? <><ChevronUp className="w-3 h-3" /> Recolher</> : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente Card Processo CNJ ──────────────────────────────
function CardProcesso({ item }: { item: ItemProcesso }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 hover:border-blue-500/30 transition-colors">
      <div className="flex items-start gap-3">
        <Scale className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item.tribunal && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {item.tribunal}
              </span>
            )}
            <span className="text-[11px] text-slate-500">{formatDate(item.data)}</span>
          </div>
          <p className="text-sm text-slate-200 font-medium truncate">{item.titulo || item.numero || 'Processo'}</p>
          {item.numero && item.numero !== item.titulo && (
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.numero}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Painel de Análise IA ──────────────────────────────────────
function PainelIA({ analise, modelo }: { analise?: string; modelo?: string }) {
  if (!analise) return null
  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-semibold text-cyan-400">Análise IA</span>
        {modelo && (
          <span className="text-[11px] text-slate-500 ml-auto font-mono">{modelo}</span>
        )}
      </div>
      <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{analise}</div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function MonitorJuridico() {
  const [loading, setLoading] = useState(false)
  const [loadingProcesso, setLoadingProcesso] = useState(false)
  const [resultado, setResultado] = useState<MonitorResult | null>(null)
  const [processoDetalhe, setProcessoDetalhe] = useState<ProcessoDetalhe | null>(null)
  const [status, setStatus] = useState<StatusResult | null>(null)
  const [activeTab, setActiveTab] = useState<'dje' | 'processos' | 'consultar'>('dje')
  const [numProcesso, setNumProcesso] = useState('')
  const [tribunal, setTribunal] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const API_BASE = '/api/monitor-juridico'

  // ── Verificar status ────────────────────────────────────────
  const verificarStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}?action=status`)
      if (res.ok) setStatus(await res.json())
    } catch { /* ignora */ }
  }, [])

  // ── Monitorar tudo ─────────────────────────────────────────
  const monitorarTudo = useCallback(async (action: 'monitorar_tudo' | 'monitorar_dje' = 'monitorar_tudo') => {
    setLoading(true)
    setErro(null)
    setResultado(null)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comIA: true, clientId: 'escritorio-moncao' }),
      })
      const data: MonitorResult = await res.json()
      if (!data.success) throw new Error(data.error || 'Erro desconhecido')
      setResultado(data)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao consultar')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Consultar processo CNJ ──────────────────────────────────
  const consultarProcesso = useCallback(async () => {
    if (!numProcesso.trim()) return
    setLoadingProcesso(true)
    setErro(null)
    setProcessoDetalhe(null)
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'consultar_processo',
          numero: numProcesso.trim(),
          tribunal: tribunal.trim() || undefined,
          comIA: true,
          clientId: 'escritorio-moncao',
        }),
      })
      const data: ProcessoDetalhe = await res.json()
      setProcessoDetalhe(data)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao consultar processo')
    } finally {
      setLoadingProcesso(false)
    }
  }, [numProcesso, tribunal])

  // ── Inicializa status ao montar ────────────────────────────
  useState(() => { verificarStatus() })

  const totalItens = (resultado?.dje?.total ?? 0) + (resultado?.processos?.total ?? 0)
  const errosTotal = [...(resultado?.dje?.erros ?? []), ...(resultado?.processos?.erros ?? [])]

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Monitor Jurídico</h1>
            <p className="text-sm text-slate-400">DJe · DataJud CNJ · IA Jurídica</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {status && (
            <>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${status.escavador ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {status.escavador ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                Escavador
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs border ${status.datajud ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                {status.datajud ? <Database className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                DataJud CNJ
              </div>
            </>
          )}
          <button
            onClick={verificarStatus}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            title="Verificar status"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Cards de estatísticas ─────────────────────────── */}
      {resultado && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">{resultado.dje?.total ?? 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">Publicações DJe</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{resultado.processos?.total ?? 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">Processos</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{totalItens}</div>
            <div className="text-xs text-slate-400 mt-0.5">Total Encontrado</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-slate-300">
              {resultado.elapsed_ms ? `${(resultado.elapsed_ms / 1000).toFixed(1)}s` : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Tempo</div>
          </div>
        </div>
      )}

      {/* ── Botões de ação principal ──────────────────────── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => monitorarTudo('monitorar_tudo')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-cyan-500/20"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          {loading ? 'Monitorando...' : 'Monitorar Tudo (DJe + Processos)'}
        </button>
        <button
          onClick={() => monitorarTudo('monitorar_dje')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-slate-200 rounded-xl text-sm font-medium transition-colors border border-slate-600"
        >
          <FileText className="w-4 h-4" />
          Só DJe
        </button>
        <button
          onClick={() => setActiveTab('consultar')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors border border-slate-600"
        >
          <Search className="w-4 h-4" />
          Consultar Processo
        </button>
      </div>

      {/* ── Erro global ───────────────────────────────────── */}
      {erro && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{erro}</p>
        </div>
      )}

      {/* ── Análise IA ────────────────────────────────────── */}
      {resultado?.analise && (
        <div className="mb-5">
          <PainelIA analise={resultado.analise} modelo={resultado.modelo_ia} />
        </div>
      )}

      {/* ── Aviso de fontes ───────────────────────────────── */}
      {resultado?.fontes && (
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 bg-slate-800/40 border border-slate-700/40 rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            Identificadores monitorados: {resultado.fontes.identificadores.join(' · ')}
            {errosTotal.length > 0 && <span className="text-amber-400 ml-2">({errosTotal.length} aviso(s))</span>}
          </span>
        </div>
      )}

      {/* ── Abas de conteúdo ──────────────────────────────── */}
      {(resultado || activeTab === 'consultar') && (
        <div>
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 w-fit">
            {resultado && (
              <>
                <button
                  onClick={() => setActiveTab('dje')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'dje' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  DJe ({resultado?.dje?.total ?? 0})
                </button>
                <button
                  onClick={() => setActiveTab('processos')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'processos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  Processos ({resultado?.processos?.total ?? 0})
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('consultar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'consultar' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Search className="w-3.5 h-3.5" />
              Consultar
            </button>
          </div>

          {/* ── Aba DJe ──────────────────────────────────────── */}
          {activeTab === 'dje' && resultado && (
            <div className="space-y-2">
              {resultado.dje?.itens.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                  <p>Nenhuma publicação no DJe para os identificadores do escritório.</p>
                </div>
              ) : (
                resultado.dje?.itens.map((item, i) => <CardDJe key={item.id ?? i} item={item} />)
              )}
              {(resultado.dje?.erros?.length ?? 0) > 0 && (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
                  ⚠ {resultado.dje?.erros?.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* ── Aba Processos ────────────────────────────────── */}
          {activeTab === 'processos' && resultado && (
            <div className="space-y-2">
              {resultado.processos?.itens.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2 text-blue-500/50" />
                  <p>Nenhum processo encontrado para os identificadores do escritório.</p>
                </div>
              ) : (
                resultado.processos?.itens.map((item, i) => <CardProcesso key={item.id ?? i} item={item} />)
              )}
              {(resultado.processos?.erros?.length ?? 0) > 0 && (
                <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-2">
                  ⚠ {resultado.processos?.erros?.join(' · ')}
                </div>
              )}
            </div>
          )}

          {/* ── Aba Consultar Processo ────────────────────────── */}
          {activeTab === 'consultar' && (
            <div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  Consultar Processo via DataJud CNJ
                </h3>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={numProcesso}
                    onChange={e => setNumProcesso(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && consultarProcesso()}
                    placeholder="Número CNJ: 0001234-56.2024.8.18.0001"
                    className="flex-1 bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <input
                    type="text"
                    value={tribunal}
                    onChange={e => setTribunal(e.target.value)}
                    placeholder="Tribunal (opcional: TJPI, STJ...)"
                    className="sm:w-52 bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={consultarProcesso}
                    disabled={loadingProcesso || !numProcesso.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {loadingProcesso ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {loadingProcesso ? 'Consultando...' : 'Consultar'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Detecta automaticamente o tribunal pelo número CNJ (TJPI, TJCE, TJMA, STJ, TRF1–5...)
                </p>
              </div>

              {/* Resultado da consulta */}
              {processoDetalhe && (
                <div className="space-y-4">
                  {processoDetalhe.erro ? (
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                      <p className="text-sm text-red-300">{processoDetalhe.erro}</p>
                    </div>
                  ) : (
                    <>
                      {/* Dados do processo */}
                      {processoDetalhe.processo && (
                        <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Processo {processoDetalhe.processo.numero}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { label: 'Classe', value: processoDetalhe.processo.classe },
                              { label: 'Tribunal', value: processoDetalhe.processo.tribunal },
                              { label: 'Órgão Julgador', value: processoDetalhe.processo.orgao },
                              { label: 'Ajuizamento', value: formatDate(processoDetalhe.processo.dataAjuizamento) },
                            ].map(({ label, value }) => value && (
                              <div key={label} className="bg-slate-900/40 rounded-lg p-2">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
                                <div className="text-sm text-slate-200 mt-0.5">{value}</div>
                              </div>
                            ))}
                          </div>
                          {processoDetalhe.processo.assuntos && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {processoDetalhe.processo.assuntos.slice(0, 5).map(a => (
                                <span key={a} className="px-2 py-0.5 text-[11px] bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Movimentações */}
                      {processoDetalhe.movimentos && processoDetalhe.movimentos.length > 0 && (
                        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Movimentações ({processoDetalhe.movimentos.length})
                          </h4>
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {processoDetalhe.movimentos.map((mov, i) => (
                              <div key={i} className="flex gap-3 text-sm">
                                <span className="text-slate-500 text-[11px] font-mono shrink-0 mt-0.5 w-24">
                                  {formatDate(mov.data)}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {urgencyBadge(mov.tipo)}
                                    <span className="text-slate-200 text-xs font-medium">{mov.tipo}</span>
                                  </div>
                                  {mov.complemento && (
                                    <p className="text-xs text-slate-500 mt-0.5">{mov.complemento}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Análise IA */}
                      <PainelIA analise={processoDetalhe.analise} modelo={processoDetalhe.modelo_ia} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Estado inicial ────────────────────────────────── */}
      {!resultado && !erro && activeTab !== 'consultar' && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Radio className="w-8 h-8 text-cyan-400/60" />
          </div>
          <h3 className="text-slate-300 font-medium mb-2">Monitor Jurídico Ativo</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Clique em <strong className="text-cyan-400">Monitorar Tudo</strong> para varrer publicações no DJe
            e processos via Escavador + DataJud CNJ com análise automática por IA.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-600">
            {['OAB/PI 7304-A', 'OAB/CE 22.502', 'OAB/MA 29037-A', 'Mauro Monção'].map(id => (
              <span key={id} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg">{id}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
