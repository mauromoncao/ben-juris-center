// ── Escavador API Service ─────────────────────────────────────
// Docs: https://api.escavador.com/v1/docs/
// Foco: Monitoramento DJe + Processos do Dr. Mauro Monção

const BASE_URL = 'https://api.escavador.com/api/v1';

export function getToken(): string {
  return (import.meta.env.VITE_ESCAVADOR_TOKEN as string) ?? '';
}

function getHeaders(token?: string): HeadersInit {
  return {
    Authorization: `Bearer ${token ?? getToken()}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ── Identificadores do escritório ─────────────────────────────

export const ADVOGADO = {
  nomes: ['Mauro Monção da Silva', 'Mauro Moncao da Silva'],
  oabs: [
    { sigla: 'OAB/CE', numero: '22.502',  query: 'OAB CE 22502'  },
    { sigla: 'OAB/MA', numero: '29037-A', query: 'OAB MA 29037'  },
    { sigla: 'OAB/PI', numero: '7304-A',  query: 'OAB PI 7304'   },
  ],
} as const;

// ── Tipos ──────────────────────────────────────────────────────

export interface EscavadorItem {
  id?: number | string;
  tipo?: string;
  nome?: string;
  titulo?: string;
  descricao?: string;
  data?: string;
  url?: string;
  numero?: string;
  tribunal?: string;
  orgao?: string;
  texto?: string;
  // campos extras variáveis
  [key: string]: unknown;
}

export interface EscavadorPaginacao {
  pagina: number;
  total: number;
  por_pagina: number;
  ultima_pagina: number;
}

export interface EscavadorResultado {
  itens: EscavadorItem[];
  paginacao: EscavadorPaginacao;
  creditos_utilizados: number;
  termo_buscado: string;
}

// ── Helper de fetch ────────────────────────────────────────────

async function efetch(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<{ data: unknown; creditos: number; status: number }> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), { headers: getHeaders() });
  const creditos = Number(res.headers.get('Creditos-Utilizados') ?? 0);

  let data: unknown;
  try { data = await res.json(); } catch { data = {}; }

  return { data, creditos, status: res.status };
}

function normalizeResultado(
  data: unknown,
  creditos: number,
  status: number,
  termo: string,
  pagina: number
): EscavadorResultado {
  if (status === 401) throw new Error('Token Escavador inválido ou expirado. Verifique VITE_ESCAVADOR_TOKEN.');
  if (status === 402) throw new Error('Créditos Escavador insuficientes.');
  if (status === 429) throw new Error('Limite de requisições atingido (500/min). Aguarde e tente novamente.');
  if (status !== 200) throw new Error(`Erro Escavador HTTP ${status}.`);

  const raw = data as {
    items?: EscavadorItem[];
    data?: EscavadorItem[];
    results?: EscavadorItem[];
    pagination?: {
      current_page?: number;
      total?: number;
      per_page?: number;
      last_page?: number;
    };
    meta?: {
      current_page?: number;
      total?: number;
      per_page?: number;
      last_page?: number;
    };
  };

  const itens: EscavadorItem[] = raw.items ?? raw.data ?? raw.results ?? [];
  const pag = raw.pagination ?? raw.meta ?? {};

  return {
    itens,
    paginacao: {
      pagina: pag.current_page ?? pagina,
      total: pag.total ?? itens.length,
      por_pagina: pag.per_page ?? 10,
      ultima_pagina: pag.last_page ?? 1,
    },
    creditos_utilizados: creditos,
    termo_buscado: termo,
  };
}

// ── Busca no Diário de Justiça (DJe) ──────────────────────────

export async function buscarDJe(
  termo: string,
  pagina = 1
): Promise<EscavadorResultado> {
  const { data, creditos, status } = await efetch('/busca', {
    q: termo,
    qo: 'diario',
    limit: 10,
    page: pagina,
  });
  return normalizeResultado(data, creditos, status, termo, pagina);
}

// ── Busca de Processos ─────────────────────────────────────────

export async function buscarProcessos(
  termo: string,
  pagina = 1
): Promise<EscavadorResultado> {
  const { data, creditos, status } = await efetch('/busca', {
    q: termo,
    qo: 'processo',
    limit: 10,
    page: pagina,
  });
  return normalizeResultado(data, creditos, status, termo, pagina);
}

// ── Busca combinada: todos os identificadores do Dr. Mauro ─────

export type FonteMonitor = 'dje' | 'processos';

export interface ResultadoMonitor {
  fonte: FonteMonitor;
  termo: string;
  sigla?: string;
  resultado: EscavadorResultado;
}

export interface ErroMonitor {
  fonte: FonteMonitor;
  termo: string;
  sigla?: string;
  erro: string;
}

export interface MonitorResult {
  resultados: ResultadoMonitor[];
  erros: ErroMonitor[];
  total_itens: number;
  total_creditos: number;
}

async function tentarBusca(
  fonte: FonteMonitor,
  termo: string,
  sigla: string | undefined,
  pagina: number
): Promise<ResultadoMonitor | ErroMonitor> {
  try {
    const fn = fonte === 'dje' ? buscarDJe : buscarProcessos;
    const resultado = await fn(termo, pagina);
    return { fonte, termo, sigla, resultado };
  } catch (e: unknown) {
    return {
      fonte,
      termo,
      sigla,
      erro: e instanceof Error ? e.message : 'Erro desconhecido',
    };
  }
}

// Busca DJe por todos os identificadores do escritório
export async function monitorarDJe(pagina = 1): Promise<MonitorResult> {
  const buscas = [
    ...ADVOGADO.nomes.map(n => tentarBusca('dje', n, undefined, pagina)),
    ...ADVOGADO.oabs.map(o => tentarBusca('dje', o.query, o.sigla, pagina)),
  ];

  const respostas = await Promise.allSettled(buscas);
  const resultados: ResultadoMonitor[] = [];
  const erros: ErroMonitor[] = [];

  for (const r of respostas) {
    if (r.status === 'fulfilled') {
      const v = r.value;
      if ('resultado' in v) resultados.push(v);
      else erros.push(v);
    }
  }

  const total_itens = resultados.reduce((s, r) => s + r.resultado.itens.length, 0);
  const total_creditos = resultados.reduce((s, r) => s + r.resultado.creditos_utilizados, 0);

  return { resultados, erros, total_itens, total_creditos };
}

// Busca Processos por todos os identificadores do escritório
export async function monitorarProcessos(pagina = 1): Promise<MonitorResult> {
  const buscas = [
    ...ADVOGADO.nomes.map(n => tentarBusca('processos', n, undefined, pagina)),
    ...ADVOGADO.oabs.map(o => tentarBusca('processos', o.query, o.sigla, pagina)),
  ];

  const respostas = await Promise.allSettled(buscas);
  const resultados: ResultadoMonitor[] = [];
  const erros: ErroMonitor[] = [];

  for (const r of respostas) {
    if (r.status === 'fulfilled') {
      const v = r.value;
      if ('resultado' in v) resultados.push(v);
      else erros.push(v);
    }
  }

  const total_itens = resultados.reduce((s, r) => s + r.resultado.itens.length, 0);
  const total_creditos = resultados.reduce((s, r) => s + r.resultado.creditos_utilizados, 0);

  return { resultados, erros, total_itens, total_creditos };
}
