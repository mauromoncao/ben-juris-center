import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, AlertCircle, Loader2, FileText,
  BookOpen, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Info, Scale, Newspaper,
} from 'lucide-react';
import {
  monitorarDJe,
  monitorarProcessos,
  ADVOGADO,
  getToken,
  type MonitorResult,
  type ResultadoMonitor,
  type EscavadorItem,
} from '../services/escavadorService';

// ─────────────────────────────────────────────────────────────
// Helpers visuais
// ─────────────────────────────────────────────────────────────

function BadgeOAB({ sigla, termo }: { sigla?: string; termo: string }) {
  const oab = ADVOGADO.oabs.find(o => o.sigla === sigla);
  if (oab) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
        style={{ background: '#FEF3C7', color: '#D97706' }}>
        {oab.sigla} {oab.numero}
      </span>
    );
  }
  // nome
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: '#DBEAFE', color: '#1d4ed8' }}>
      {termo}
    </span>
  );
}

function CardItem({ item }: { item: EscavadorItem }) {
  const [expandido, setExpandido] = useState(false);

  const titulo = String(
    item.titulo ?? item.nome ?? item.numero ?? item.id ?? '—'
  );
  const descricao = String(item.descricao ?? item.texto ?? '');
  const data = String(item.data ?? '');
  const url = String(item.url ?? '');
  const tribunal = String(item.tribunal ?? item.orgao ?? '');
  const numero = String(item.numero ?? '');

  const descCurta = descricao.length > 200 ? descricao.slice(0, 200) + '…' : descricao;

  return (
    <div className="bg-white border rounded-2xl p-4 transition-all hover:shadow-md"
      style={{ borderColor: '#E5E7EB' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Linha de meta */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {data && (
              <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>{data}</span>
            )}
            {tribunal && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#F0F4FF', color: '#0f2044' }}>
                {tribunal}
              </span>
            )}
            {numero && numero !== titulo && (
              <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{numero}</span>
            )}
          </div>

          {/* Título */}
          <p className="text-sm font-semibold" style={{ color: '#0f2044' }}>{titulo}</p>

          {/* Descrição */}
          {descricao && (
            <div className="mt-1.5">
              <p className="text-xs leading-relaxed" style={{ color: '#374151' }}>
                {expandido ? descricao : descCurta}
              </p>
              {descricao.length > 200 && (
                <button
                  onClick={() => setExpandido(e => !e)}
                  className="flex items-center gap-1 text-xs mt-1 font-medium transition-colors hover:opacity-70"
                  style={{ color: '#D4A017' }}>
                  {expandido
                    ? <><ChevronUp className="w-3 h-3" /> Ver menos</>
                    : <><ChevronDown className="w-3 h-3" /> Ver mais</>}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botão externo */}
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border flex-shrink-0 transition-all hover:opacity-80"
            style={{ color: '#0f2044', borderColor: '#CBD5E1', background: '#F8FAFC' }}>
            <ExternalLink className="w-3 h-3" /> Abrir
          </a>
        )}
      </div>
    </div>
  );
}

// Grupo de resultados por termo buscado
function GrupoResultados({ grupo }: { grupo: ResultadoMonitor }) {
  const [aberto, setAberto] = useState(true);
  const total = grupo.resultado.paginacao.total;
  const itens = grupo.resultado.itens;

  if (itens.length === 0) return null;

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
      {/* Header do grupo */}
      <button
        onClick={() => setAberto(a => !a)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
        style={{ background: '#F8FAFC' }}>
        <div className="flex items-center gap-2">
          <BadgeOAB sigla={grupo.sigla} termo={grupo.termo} />
          <span className="text-xs font-semibold" style={{ color: '#0f2044' }}>
            {total.toLocaleString('pt-BR')} resultado{total !== 1 ? 's' : ''}
          </span>
        </div>
        {aberto
          ? <ChevronUp className="w-4 h-4" style={{ color: '#9CA3AF' }} />
          : <ChevronDown className="w-4 h-4" style={{ color: '#9CA3AF' }} />}
      </button>

      {/* Itens */}
      {aberto && (
        <div className="p-3 space-y-2" style={{ background: '#FAFBFC' }}>
          {itens.map((item, idx) => (
            <CardItem key={`${item.id ?? idx}`} item={item} />
          ))}
          {total > itens.length && (
            <p className="text-xs text-center py-1" style={{ color: '#9CA3AF' }}>
              Exibindo {itens.length} de {total.toLocaleString('pt-BR')} resultados
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────

type AbaMonitor = 'dje' | 'processos';

export default function EscavadorPage() {
  const [aba, setAba] = useState<AbaMonitor>('dje');
  const [loading, setLoading] = useState(false);
  const [ultimaAtual, setUltimaAtual] = useState<Date | null>(null);
  const [dados, setDados] = useState<MonitorResult | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const tokenOk = Boolean(getToken());

  // ── Executar monitoramento ──────────────────────────────────
  const executar = useCallback(async (fonte: AbaMonitor) => {
    if (!tokenOk) {
      setErro('Token Escavador não configurado. Adicione VITE_ESCAVADOR_TOKEN no .env do projeto.');
      return;
    }
    setLoading(true);
    setErro(null);
    setDados(null);
    try {
      const resultado = fonte === 'dje'
        ? await monitorarDJe()
        : await monitorarProcessos();
      setDados(resultado);
      setUltimaAtual(new Date());
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [tokenOk]);

  // Busca automática ao montar e ao trocar de aba
  useEffect(() => {
    executar(aba);
  }, [aba]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Calcular totais ─────────────────────────────────────────
  const totalPublicacoes = dados?.total_itens ?? 0;
  const temResultados = dados && dados.resultados.some(r => r.resultado.itens.length > 0);
  const gruposComItens = dados?.resultados.filter(r => r.resultado.itens.length > 0) ?? [];
  const gruposSemItens = dados?.resultados.filter(r => r.resultado.itens.length === 0) ?? [];

  return (
    <div className="space-y-5 max-w-4xl">

      {/* ── Cabeçalho ──────────────────────────────────────── */}
      <div className="bg-white border rounded-2xl p-5" style={{ borderColor: '#EEEEEE' }}>
        {/* Título + botão atualizar */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#0f2044' }}>
              <img src="/brasao-moncao.png" alt="Brasão" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#0f2044' }}>
                Monitor Escavador
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                Mauro Monção da Silva · OAB/CE 22.502 · OAB/MA 29037-A · OAB/PI 7304-A
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {ultimaAtual && !loading && (
              <span className="text-xs" style={{ color: '#9CA3AF' }}>
                {ultimaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => executar(aba)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40"
              style={{ background: '#0f2044', color: '#D4A017' }}>
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />}
              Atualizar
            </button>
          </div>
        </div>

        {/* Identificadores monitorados */}
        <div className="flex flex-wrap gap-2">
          {ADVOGADO.nomes.map(n => (
            <span key={n} className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: '#DBEAFE', color: '#1d4ed8' }}>
              👤 {n}
            </span>
          ))}
          {ADVOGADO.oabs.map(o => (
            <span key={o.sigla} className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: '#FEF3C7', color: '#D97706' }}>
              🔱 {o.sigla} {o.numero}
            </span>
          ))}
        </div>
      </div>

      {/* ── Abas ───────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={() => setAba('dje')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={aba === 'dje'
            ? { background: '#0f2044', color: '#D4A017' }
            : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #EEEEEE' }}>
          <Newspaper className="w-4 h-4" />
          Diário de Justiça
          {aba === 'dje' && totalPublicacoes > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#D4A017', color: '#0f2044' }}>
              {totalPublicacoes > 99 ? '99+' : totalPublicacoes}
            </span>
          )}
        </button>
        <button
          onClick={() => setAba('processos')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={aba === 'processos'
            ? { background: '#0f2044', color: '#D4A017' }
            : { background: '#F9FAFB', color: '#6B7280', border: '1px solid #EEEEEE' }}>
          <Scale className="w-4 h-4" />
          Processos
          {aba === 'processos' && totalPublicacoes > 0 && (
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#D4A017', color: '#0f2044' }}>
              {totalPublicacoes > 99 ? '99+' : totalPublicacoes}
            </span>
          )}
        </button>
      </div>

      {/* ── Loading ─────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#0f2044' }} />
            <p className="text-sm font-medium" style={{ color: '#374151' }}>
              Consultando {aba === 'dje' ? 'Diário de Justiça' : 'Processos'}…
            </p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              Buscando por {ADVOGADO.nomes.length + ADVOGADO.oabs.length} identificadores
            </p>
          </div>
        </div>
      )}

      {/* ── Sem token ──────────────────────────────────────── */}
      {!tokenOk && !loading && (
        <div className="border rounded-2xl p-5 flex items-start gap-3"
          style={{ background: '#FFF7ED', borderColor: '#FED7AA' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#EA580C' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#EA580C' }}>Token não configurado</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              Adicione <code className="bg-orange-100 px-1 rounded">VITE_ESCAVADOR_TOKEN=sua_chave</code> no
              arquivo <code className="bg-orange-100 px-1 rounded">.env</code> e no painel Vercel (Environment Variables).
            </p>
          </div>
        </div>
      )}

      {/* ── Erro ────────────────────────────────────────────── */}
      {erro && !loading && (
        <div className="border rounded-2xl p-4 flex items-start gap-3"
          style={{ background: '#FEF2F2', borderColor: '#FECACA' }}>
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#DC2626' }}>Erro na consulta</p>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{erro}</p>
          </div>
        </div>
      )}

      {/* ── Erros parciais (alguns termos falharam) ─────────── */}
      {!loading && dados && dados.erros.length > 0 && (
        <div className="border rounded-2xl p-4 flex items-start gap-3"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#D97706' }}>
              {dados.erros.length} busca(s) com falha
            </p>
            <ul className="mt-1 space-y-0.5">
              {dados.erros.map((e, i) => (
                <li key={i} className="text-xs" style={{ color: '#6B7280' }}>
                  • {e.sigla ?? e.termo}: {e.erro}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Resumo de resultados ────────────────────────────── */}
      {!loading && dados && !erro && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border rounded-2xl p-4 text-center" style={{ borderColor: '#EEEEEE' }}>
            <p className="text-2xl font-bold" style={{ color: '#0f2044' }}>
              {totalPublicacoes.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {aba === 'dje' ? 'Publicações encontradas' : 'Processos encontrados'}
            </p>
          </div>
          <div className="bg-white border rounded-2xl p-4 text-center" style={{ borderColor: '#EEEEEE' }}>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>
              {gruposComItens.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Fontes com resultados</p>
          </div>
          <div className="bg-white border rounded-2xl p-4 text-center" style={{ borderColor: '#EEEEEE' }}>
            <p className="text-2xl font-bold" style={{ color: '#D97706' }}>
              {dados.total_creditos}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Créditos utilizados</p>
          </div>
        </div>
      )}

      {/* ── Sem resultados ──────────────────────────────────── */}
      {!loading && dados && !erro && totalPublicacoes === 0 && (
        <div className="bg-white border rounded-2xl p-8 text-center" style={{ borderColor: '#EEEEEE' }}>
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
          <p className="text-sm font-semibold" style={{ color: '#374151' }}>
            Nenhuma publicação encontrada
          </p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
            Não foram encontradas {aba === 'dje' ? 'publicações no DJe' : 'processos'} para os identificadores monitorados.
          </p>
          {gruposSemItens.length > 0 && (
            <p className="text-xs mt-2" style={{ color: '#D1D5DB' }}>
              Buscados: {gruposSemItens.map(g => g.sigla ?? g.termo).join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* ── Resultados agrupados ─────────────────────────────── */}
      {!loading && temResultados && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
              {aba === 'dje' ? 'Publicações encontradas' : 'Processos encontrados'}
            </h3>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              Agrupado por identificador
            </span>
          </div>
          {gruposComItens.map((grupo, idx) => (
            <GrupoResultados key={`${grupo.fonte}-${grupo.termo}-${idx}`} grupo={grupo} />
          ))}
        </div>
      )}

      {/* ── Rodapé ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs pt-1" style={{ color: '#D1D5DB' }}>
        <span>
          Powered by{' '}
          <a href="https://www.escavador.com" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-gray-400">Escavador</a>
          {' '}· Dados públicos oficiais
        </span>
        <span>Limite: 500 req/min</span>
      </div>
    </div>
  );
}
