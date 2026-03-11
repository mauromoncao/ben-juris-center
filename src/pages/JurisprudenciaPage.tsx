import React, { useState, useRef } from 'react';
import {
  Search, X, ChevronLeft, ChevronRight, Loader2,
  AlertCircle, BookOpen, Calendar, Building2,
  Hash, ChevronDown, ChevronUp, Scale, FileSearch,
  Filter,
} from 'lucide-react';
import {
  buscarJurisprudencia,
  buscarPorNumero,
  TRIBUNAIS,
  fmtData,
  fmtNumeroProcesso,
  type DataJudHit,
  type DataJudResultado,
} from '../services/datajudService';

// ─────────────────────────────────────────────────────────────
// Helpers visuais
// ─────────────────────────────────────────────────────────────

function grauBadge(grau: string) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    G1:  { label: '1º Grau',    bg: '#DBEAFE', color: '#1d4ed8' },
    G2:  { label: '2º Grau',    bg: '#D1FAE5', color: '#059669' },
    GR:  { label: 'Recursal',   bg: '#FEF3C7', color: '#D97706' },
    SUP: { label: 'Superior',   bg: '#EDE9FE', color: '#7C3AED' },
    JE:  { label: 'Juiz. Esp.', bg: '#FCE7F3', color: '#DB2777' },
  };
  const s = map[grau] ?? { label: grau || '—', bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Card de processo
// ─────────────────────────────────────────────────────────────

function CardProcesso({ hit, tribunal }: { hit: DataJudHit; tribunal: string }) {
  const [expandido, setExpandido] = useState(false);
  const p = hit._source;

  const numFormatado = fmtNumeroProcesso(p.numeroProcesso);
  const ultimoMov = p.movimentos?.[0];
  const assuntos = p.assuntos?.slice(0, 3) ?? [];

  return (
    <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ borderColor: '#E5E7EB' }}>

      {/* Linha 1: número + badges */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-bold" style={{ color: '#0f2044' }}>
              {numFormatado}
            </span>
            {grauBadge(p.grau)}
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: '#F0F4FF', color: '#0f2044' }}>
              {tribunal}
            </span>
          </div>

          {/* Classe */}
          <p className="text-sm font-semibold" style={{ color: '#111827' }}>
            {p.classe?.nome ?? '—'}
          </p>

          {/* Órgão julgador */}
          {p.orgaoJulgador?.nome && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#6B7280' }}>
              <Building2 className="w-3 h-3 flex-shrink-0" />
              {p.orgaoJulgador.nome}
            </p>
          )}
        </div>

        {/* Datas */}
        <div className="text-right flex-shrink-0 space-y-0.5">
          {p.dataAjuizamento && (
            <p className="text-xs flex items-center gap-1 justify-end" style={{ color: '#9CA3AF' }}>
              <Calendar className="w-3 h-3" />
              {fmtData(p.dataAjuizamento)}
            </p>
          )}
          {p.dataHoraUltimaAtualizacao && (
            <p className="text-xs" style={{ color: '#D1D5DB' }}>
              Atualizado: {fmtData(p.dataHoraUltimaAtualizacao)}
            </p>
          )}
        </div>
      </div>

      {/* Assuntos */}
      {assuntos.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {assuntos.map(a => (
            <span key={a.codigo}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              {a.nome}
            </span>
          ))}
          {(p.assuntos?.length ?? 0) > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
              +{(p.assuntos?.length ?? 0) - 3}
            </span>
          )}
        </div>
      )}

      {/* Último movimento */}
      {ultimoMov && (
        <div className="border-t pt-2 mt-2" style={{ borderColor: '#F3F4F6' }}>
          <button
            onClick={() => setExpandido(e => !e)}
            className="w-full flex items-center justify-between text-left">
            <p className="text-xs font-semibold flex items-center gap-1" style={{ color: '#374151' }}>
              <Scale className="w-3 h-3" style={{ color: '#D4A017' }} />
              Último movimento: {ultimoMov.nome}
              <span className="font-normal ml-1" style={{ color: '#9CA3AF' }}>
                {fmtData(ultimoMov.dataHora)}
              </span>
            </p>
            {(p.movimentos?.length ?? 0) > 1 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                {(p.movimentos?.length ?? 0) - 1} anterior{(p.movimentos?.length ?? 0) > 2 ? 'es' : ''}
                {expandido
                  ? <ChevronUp className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />}
              </span>
            )}
          </button>

          {/* Histórico de movimentos */}
          {expandido && p.movimentos && p.movimentos.length > 1 && (
            <div className="mt-2 space-y-1 pl-4 border-l-2" style={{ borderColor: '#E5E7EB' }}>
              {p.movimentos.slice(1, 6).map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#9CA3AF' }}>
                    {fmtData(m.dataHora)}
                  </span>
                  <span className="text-xs" style={{ color: '#374151' }}>{m.nome}</span>
                </div>
              ))}
              {(p.movimentos?.length ?? 0) > 6 && (
                <p className="text-xs" style={{ color: '#D1D5DB' }}>
                  + {(p.movimentos?.length ?? 0) - 6} movimentos anteriores
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────

type ModoBusca = 'termo' | 'numero';

const SUGESTOES = [
  'improbidade administrativa',
  'licitação fracionamento',
  'responsabilidade civil do Estado',
  'mandado de segurança',
  'ato administrativo nulo',
  'dano moral servidor público',
  'precatório',
  'desapropriação',
];

// Tribunais prioritários do Dr. Mauro
const TRIBUNAL_PADRAO = 'api_publica_tjpi';

export default function JurisprudenciaPage() {
  const [modo, setModo] = useState<ModoBusca>('termo');
  const [query, setQuery] = useState('');
  const [tribunalSel, setTribunalSel] = useState(TRIBUNAL_PADRAO);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<DataJudResultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const POR_PAGINA = 10;

  // ── Executar busca ────────────────────────────────────────

  async function executar(q: string, trib: string, pg: number) {
    if (!q.trim()) return;
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      let res: DataJudResultado;
      if (modo === 'numero') {
        res = await buscarPorNumero(q, trib);
      } else {
        res = await buscarJurisprudencia(q, trib, pg, POR_PAGINA);
      }
      setResultado(res);
      const tp = Math.max(1, Math.ceil(res.total / POR_PAGINA));
      setTotalPaginas(tp);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPagina(1);
    executar(query, tribunalSel, 1);
  }

  function handlePagina(nova: number) {
    setPagina(nova);
    executar(query, tribunalSel, nova);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpar() {
    setQuery('');
    setResultado(null);
    setErro(null);
    setPagina(1);
    inputRef.current?.focus();
  }

  // Agrupa tribunais por grupo
  const grupos = Array.from(new Set(TRIBUNAIS.map(t => t.grupo)));

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#0f2044' }}>
            <BookOpen className="w-4 h-4" /> Jurisprudência — DataJud CNJ
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            Base nacional gratuita · +70 milhões de decisões · 92 tribunais · Atualização diária
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: '#D1FAE5', color: '#059669' }}>
          🟢 Gratuito
        </div>
      </div>

      {/* ── Modo de busca ──────────────────────────────────── */}
      <div className="flex gap-2">
        <button onClick={() => setModo('termo')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={modo === 'termo'
            ? { background: '#0f2044', color: '#D4A017' }
            : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #EEEEEE' }}>
          <Search className="w-3.5 h-3.5" /> Buscar por tema/assunto
        </button>
        <button onClick={() => setModo('numero')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          style={modo === 'numero'
            ? { background: '#0f2044', color: '#D4A017' }
            : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #EEEEEE' }}>
          <Hash className="w-3.5 h-3.5" /> Buscar por número CNJ
        </button>
      </div>

      {/* ── Formulário de busca ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Campo de busca */}
        <div className="relative">
          <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#9CA3AF' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={modo === 'numero'
              ? 'Digite o número CNJ: 0000001-00.2023.8.18.0001'
              : 'Digite o tema: improbidade administrativa, mandado de segurança...'}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border text-sm focus:outline-none transition-all"
            style={{
              borderColor: '#E5E7EB', color: '#111827', background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          />
          {query && (
            <button type="button" onClick={limpar}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100">
              <X className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
            </button>
          )}
        </div>

        {/* Seletor de tribunal */}
        <div className="flex gap-2 items-center">
          <Filter className="w-4 h-4 flex-shrink-0" style={{ color: '#9CA3AF' }} />
          <select
            value={tribunalSel}
            onChange={e => setTribunalSel(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl border text-xs focus:outline-none transition-all"
            style={{ borderColor: '#E5E7EB', color: '#374151', background: '#FFFFFF' }}>
            {grupos.map(grupo => (
              <optgroup key={grupo} label={grupo === 'Prioritários' ? '⭐ ' + grupo : grupo}>
                {TRIBUNAIS.filter(t => t.grupo === grupo).map(t => (
                  <option key={t.alias} value={t.alias}>
                    {t.sigla} — {t.nome}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 flex-shrink-0"
            style={{ background: '#0f2044', color: '#D4A017' }}>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
      </form>

      {/* ── Sugestões (estado inicial) ──────────────────────── */}
      {!resultado && !loading && !erro && modo === 'termo' && (
        <div className="bg-white border rounded-2xl p-5" style={{ borderColor: '#EEEEEE' }}>
          <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: '#0f2044' }}>
            <BookOpen className="w-3.5 h-3.5" /> Temas frequentes na advocacia pública
          </h3>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map(s => (
              <button key={s}
                onClick={() => { setQuery(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:border-blue-300 hover:bg-blue-50"
                style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#F0F4FF' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#0f2044' }}>
              ⭐ Tribunais prioritários (seus estados de atuação)
            </p>
            <div className="flex gap-2">
              {['api_publica_tjpi', 'api_publica_tjce', 'api_publica_tjma'].map(alias => {
                const t = TRIBUNAIS.find(x => x.alias === alias)!;
                return (
                  <button key={alias}
                    onClick={() => setTribunalSel(alias)}
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                    style={tribunalSel === alias
                      ? { background: '#0f2044', color: '#D4A017' }
                      : { background: '#DBEAFE', color: '#1d4ed8' }}>
                    {t.sigla}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#0f2044' }} />
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              Consultando DataJud CNJ…
            </p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              {TRIBUNAIS.find(t => t.alias === tribunalSel)?.nome}
            </p>
          </div>
        </div>
      )}

      {/* ── Erro ────────────────────────────────────────────── */}
      {erro && !loading && (
        <div className="border rounded-2xl p-4 flex items-start gap-3"
          style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>Erro na consulta</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{erro}</p>
          </div>
        </div>
      )}

      {/* ── Resultados ──────────────────────────────────────── */}
      {resultado && !loading && (
        <>
          {/* Resumo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: '#0f2044' }}>
                {resultado.total.toLocaleString('pt-BR')} processo{resultado.total !== 1 ? 's' : ''}
              </span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                em <strong>{resultado.tribunalNome}</strong> para "{resultado.termoBuscado}"
              </span>
            </div>
            {totalPaginas > 1 && (
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                Página {pagina}/{totalPaginas}
              </span>
            )}
          </div>

          {/* Lista de processos */}
          {resultado.hits.length === 0 ? (
            <div className="bg-white border rounded-2xl p-8 text-center" style={{ borderColor: '#EEEEEE' }}>
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>
                Nenhum resultado encontrado
              </p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                Tente outros termos ou selecione um tribunal diferente.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {resultado.hits.map((hit) => (
                <CardProcesso
                  key={hit._id}
                  hit={hit}
                  tribunal={resultado.tribunal}
                />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handlePagina(pagina - 1)}
                disabled={pagina <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs border transition-all hover:bg-gray-50 disabled:opacity-40"
                style={{ color: '#374151', borderColor: '#E5E7EB' }}>
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>

              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPaginas - 4, pagina - 2)) + i;
                return (
                  <button key={p} onClick={() => handlePagina(p)}
                    className="w-8 h-8 rounded-xl text-xs font-medium transition-all"
                    style={p === pagina
                      ? { background: '#0f2044', color: '#D4A017' }
                      : { background: '#F9FAFB', color: '#374151', border: '1px solid #EEEEEE' }}>
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => handlePagina(pagina + 1)}
                disabled={pagina >= totalPaginas}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs border transition-all hover:bg-gray-50 disabled:opacity-40"
                style={{ color: '#374151', borderColor: '#E5E7EB' }}>
                Próxima <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Rodapé ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs pt-1" style={{ color: '#D1D5DB' }}>
        <span>
          Dados:{' '}
          <a href="https://datajud-wiki.cnj.jus.br" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-gray-400">
            DataJud CNJ
          </a>
          {' '}· Fonte oficial · Gratuito · Portaria CNJ nº 160/2020
        </span>
        <span>R$ 0,00/mês</span>
      </div>
    </div>
  );
}
