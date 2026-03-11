// ── DataJud CNJ — Serviço de Jurisprudência ───────────────────
// API Pública gratuita do CNJ
// Docs: https://datajud-wiki.cnj.jus.br/api-publica
// Chave pública (pode ser atualizada pelo CNJ a qualquer momento)

const DATAJUD_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const BASE = 'https://api-publica.datajud.cnj.jus.br';

// ── Mapa de tribunais ─────────────────────────────────────────

export interface Tribunal {
  alias: string;
  nome: string;
  sigla: string;
  grupo: string;
}

export const TRIBUNAIS: Tribunal[] = [
  // Superiores
  { alias: 'api_publica_stf',   sigla: 'STF',   nome: 'Supremo Tribunal Federal',              grupo: 'Superiores' },
  { alias: 'api_publica_stj',   sigla: 'STJ',   nome: 'Superior Tribunal de Justiça',          grupo: 'Superiores' },
  { alias: 'api_publica_tst',   sigla: 'TST',   nome: 'Tribunal Superior do Trabalho',         grupo: 'Superiores' },
  { alias: 'api_publica_tse',   sigla: 'TSE',   nome: 'Tribunal Superior Eleitoral',           grupo: 'Superiores' },
  { alias: 'api_publica_stm',   sigla: 'STM',   nome: 'Superior Tribunal Militar',             grupo: 'Superiores' },
  // OABs do Dr. Mauro — Tribunais prioritários
  { alias: 'api_publica_tjpi',  sigla: 'TJPI',  nome: 'Tribunal de Justiça do Piauí',          grupo: 'Prioritários' },
  { alias: 'api_publica_tjce',  sigla: 'TJCE',  nome: 'Tribunal de Justiça do Ceará',          grupo: 'Prioritários' },
  { alias: 'api_publica_tjma',  sigla: 'TJMA',  nome: 'Tribunal de Justiça do Maranhão',       grupo: 'Prioritários' },
  // Federais
  { alias: 'api_publica_trf1',  sigla: 'TRF1',  nome: 'Tribunal Regional Federal 1ª Região',  grupo: 'Federal' },
  { alias: 'api_publica_trf2',  sigla: 'TRF2',  nome: 'Tribunal Regional Federal 2ª Região',  grupo: 'Federal' },
  { alias: 'api_publica_trf3',  sigla: 'TRF3',  nome: 'Tribunal Regional Federal 3ª Região',  grupo: 'Federal' },
  { alias: 'api_publica_trf4',  sigla: 'TRF4',  nome: 'Tribunal Regional Federal 4ª Região',  grupo: 'Federal' },
  { alias: 'api_publica_trf5',  sigla: 'TRF5',  nome: 'Tribunal Regional Federal 5ª Região',  grupo: 'Federal' },
  { alias: 'api_publica_trf6',  sigla: 'TRF6',  nome: 'Tribunal Regional Federal 6ª Região',  grupo: 'Federal' },
  // Estaduais
  { alias: 'api_publica_tjac',  sigla: 'TJAC',  nome: 'TJAC — Acre',             grupo: 'Estaduais' },
  { alias: 'api_publica_tjal',  sigla: 'TJAL',  nome: 'TJAL — Alagoas',          grupo: 'Estaduais' },
  { alias: 'api_publica_tjam',  sigla: 'TJAM',  nome: 'TJAM — Amazonas',         grupo: 'Estaduais' },
  { alias: 'api_publica_tjap',  sigla: 'TJAP',  nome: 'TJAP — Amapá',            grupo: 'Estaduais' },
  { alias: 'api_publica_tjba',  sigla: 'TJBA',  nome: 'TJBA — Bahia',            grupo: 'Estaduais' },
  { alias: 'api_publica_tjdft', sigla: 'TJDFT', nome: 'TJDFT — Distrito Federal',grupo: 'Estaduais' },
  { alias: 'api_publica_tjes',  sigla: 'TJES',  nome: 'TJES — Espírito Santo',   grupo: 'Estaduais' },
  { alias: 'api_publica_tjgo',  sigla: 'TJGO',  nome: 'TJGO — Goiás',            grupo: 'Estaduais' },
  { alias: 'api_publica_tjmg',  sigla: 'TJMG',  nome: 'TJMG — Minas Gerais',     grupo: 'Estaduais' },
  { alias: 'api_publica_tjms',  sigla: 'TJMS',  nome: 'TJMS — Mato Grosso do Sul',grupo: 'Estaduais' },
  { alias: 'api_publica_tjmt',  sigla: 'TJMT',  nome: 'TJMT — Mato Grosso',      grupo: 'Estaduais' },
  { alias: 'api_publica_tjpa',  sigla: 'TJPA',  nome: 'TJPA — Pará',             grupo: 'Estaduais' },
  { alias: 'api_publica_tjpb',  sigla: 'TJPB',  nome: 'TJPB — Paraíba',          grupo: 'Estaduais' },
  { alias: 'api_publica_tjpe',  sigla: 'TJPE',  nome: 'TJPE — Pernambuco',       grupo: 'Estaduais' },
  { alias: 'api_publica_tjpr',  sigla: 'TJPR',  nome: 'TJPR — Paraná',           grupo: 'Estaduais' },
  { alias: 'api_publica_tjrj',  sigla: 'TJRJ',  nome: 'TJRJ — Rio de Janeiro',   grupo: 'Estaduais' },
  { alias: 'api_publica_tjrn',  sigla: 'TJRN',  nome: 'TJRN — Rio Grande do Norte',grupo: 'Estaduais' },
  { alias: 'api_publica_tjro',  sigla: 'TJRO',  nome: 'TJRO — Rondônia',         grupo: 'Estaduais' },
  { alias: 'api_publica_tjrr',  sigla: 'TJRR',  nome: 'TJRR — Roraima',          grupo: 'Estaduais' },
  { alias: 'api_publica_tjrs',  sigla: 'TJRS',  nome: 'TJRS — Rio Grande do Sul', grupo: 'Estaduais' },
  { alias: 'api_publica_tjsc',  sigla: 'TJSC',  nome: 'TJSC — Santa Catarina',   grupo: 'Estaduais' },
  { alias: 'api_publica_tjse',  sigla: 'TJSE',  nome: 'TJSE — Sergipe',          grupo: 'Estaduais' },
  { alias: 'api_publica_tjsp',  sigla: 'TJSP',  nome: 'TJSP — São Paulo',        grupo: 'Estaduais' },
  { alias: 'api_publica_tjto',  sigla: 'TJTO',  nome: 'TJTO — Tocantins',        grupo: 'Estaduais' },
];

// ── Tipos ──────────────────────────────────────────────────────

export interface DataJudAssunto {
  codigo: number;
  nome: string;
}

export interface DataJudClasse {
  codigo: number;
  nome: string;
}

export interface DataJudMovimento {
  codigo: number;
  nome: string;
  dataHora: string;
  complementosTabelados?: { codigo: number; nome: string; valor: string }[];
}

export interface DataJudProcesso {
  numeroProcesso: string;
  classe: DataJudClasse;
  sistema?: { codigo: number; nome: string };
  formato?: { codigo: number; nome: string };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  dataAjuizamento?: string;
  movimentos?: DataJudMovimento[];
  assuntos?: DataJudAssunto[];
  orgaoJulgador?: { codigo: number; nome: string; codigoMunicipioIBGE?: number };
  nivelSigilo?: number;
}

export interface DataJudHit {
  _id: string;
  _score: number;
  _source: DataJudProcesso;
}

export interface DataJudResultado {
  hits: DataJudHit[];
  total: number;
  tribunal: string;
  tribunalNome: string;
  termoBuscado: string;
}

// ── Query builders ────────────────────────────────────────────

function queryTermoLivre(termo: string, from = 0, size = 10) {
  return {
    from,
    size,
    sort: [{ dataAjuizamento: { order: 'desc' } }],
    _source: [
      'numeroProcesso', 'classe', 'tribunal', 'dataAjuizamento',
      'dataHoraUltimaAtualizacao', 'assuntos', 'grau', 'orgaoJulgador',
      'movimentos',
    ],
    query: {
      bool: {
        should: [
          { match: { 'classe.nome':   { query: termo, boost: 3 } } },
          { match: { 'assuntos.nome': { query: termo, boost: 2 } } },
          { multi_match: {
              query: termo,
              fields: ['classe.nome', 'assuntos.nome', 'movimentos.nome', 'orgaoJulgador.nome'],
              type: 'best_fields',
            },
          },
        ],
        minimum_should_match: 1,
      },
    },
  };
}

// ── Fetch helper ──────────────────────────────────────────────

async function datajudFetch(alias: string, body: object): Promise<{ hits: DataJudHit[]; total: number }> {
  const res = await fetch(`${BASE}/${alias}/_search`, {
    method: 'POST',
    headers: {
      Authorization: `ApiKey ${DATAJUD_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) throw new Error('Chave DataJud inválida. Verifique datajud-wiki.cnj.jus.br/api-publica/acesso');
  if (res.status === 404) throw new Error(`Tribunal não encontrado: ${alias}`);
  if (!res.ok) throw new Error(`DataJud HTTP ${res.status}`);

  const json = await res.json() as {
    hits?: { hits?: DataJudHit[]; total?: { value?: number } | number };
    error?: { reason?: string };
  };

  if (json.error) throw new Error(json.error.reason ?? 'Erro DataJud');

  const hits = json.hits?.hits ?? [];
  const totalRaw = json.hits?.total;
  const total = typeof totalRaw === 'number' ? totalRaw : (totalRaw?.value ?? 0);

  return { hits, total };
}

// ── Busca principal ───────────────────────────────────────────

export async function buscarJurisprudencia(
  termo: string,
  tribunalAlias: string,
  pagina = 1,
  porPagina = 10
): Promise<DataJudResultado> {
  const tribunal = TRIBUNAIS.find(t => t.alias === tribunalAlias);
  if (!tribunal) throw new Error(`Tribunal desconhecido: ${tribunalAlias}`);

  const from = (pagina - 1) * porPagina;
  const body = queryTermoLivre(termo, from, porPagina);

  const { hits, total } = await datajudFetch(tribunal.alias, body);

  return {
    hits,
    total,
    tribunal: tribunal.sigla,
    tribunalNome: tribunal.nome,
    termoBuscado: termo,
  };
}

// ── Busca por número CNJ ──────────────────────────────────────

export async function buscarPorNumero(
  numero: string,
  tribunalAlias: string
): Promise<DataJudResultado> {
  // Remove formatação: 0000001-00.2023.8.18.0001 → 00000010020238180001
  const limpo = numero.replace(/[.\-]/g, '');
  const tribunal = TRIBUNAIS.find(t => t.alias === tribunalAlias);
  if (!tribunal) throw new Error(`Tribunal desconhecido: ${tribunalAlias}`);

  const body = {
    size: 5,
    query: {
      match: { numeroProcesso: { query: limpo } },
    },
    _source: [
      'numeroProcesso', 'classe', 'tribunal', 'dataAjuizamento',
      'dataHoraUltimaAtualizacao', 'assuntos', 'grau', 'orgaoJulgador', 'movimentos',
    ],
  };

  const { hits, total } = await datajudFetch(tribunal.alias, body);

  return {
    hits,
    total,
    tribunal: tribunal.sigla,
    tribunalNome: tribunal.nome,
    termoBuscado: numero,
  };
}

// ── Helpers de formatação ─────────────────────────────────────

export function fmtData(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return iso.slice(0, 10); }
}

export function fmtNumeroProcesso(n: string): string {
  // 00000010020238180001 → 0000001-00.2023.8.18.0001
  const s = n.replace(/\D/g, '').padStart(20, '0');
  if (s.length !== 20) return n;
  return `${s.slice(0,7)}-${s.slice(7,9)}.${s.slice(9,13)}.${s.slice(13,14)}.${s.slice(14,16)}.${s.slice(16,20)}`;
}
