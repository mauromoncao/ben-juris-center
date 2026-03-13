// ============================================================
// BEN JURIS CENTER — PostgreSQL Hostinger VPS
// Módulo compartilhado de banco de dados
// Variável de ambiente: DATABASE_URL  (postgres://user:pass@host:5432/db)
// ============================================================

export const config = { maxDuration: 10 }

// ─── Utilitário: executa uma query via REST no VPS ───────────
// O VPS Hostinger expõe um endpoint /db/query para consultas SQL
// autenticado por DB_TOKEN. Alternativa: usar postgres driver via
// DATABASE_URL direto (pg / postgres.js).
//
// Usamos chamada HTTP ao VPS para compatibilidade com Vercel Edge.
// ─────────────────────────────────────────────────────────────

const VPS = () => (process.env.VPS_LEADS_URL || 'http://181.215.135.202:3001').trim()
const DB_TOKEN = () => process.env.DB_TOKEN || ''

export async function dbQuery(sql, params = []) {
  const res = await fetch(`${VPS()}/db/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DB_TOKEN()}`,
    },
    body: JSON.stringify({ sql, params }),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`DB query error ${res.status}: ${await res.text()}`)
  return res.json()
}

// ─── Salvar output do agente ──────────────────────────────────
export async function saveAgentOutput({ agentId, clientId, processoNum, input, output, modelUsed, inputTokens, outputTokens, costUsd, elapsedMs }) {
  try {
    await dbQuery(
      `INSERT INTO agent_outputs
        (agent_id, client_id, processo_num, input, output, model_used,
         input_tokens, output_tokens, cost_usd, elapsed_ms, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
      [
        agentId,
        clientId || null,
        processoNum || null,
        (input  || '').slice(0, 2000),
        (output || '').slice(0, 4000),
        modelUsed,
        inputTokens  || 0,
        outputTokens || 0,
        costUsd      || 0,
        elapsedMs    || 0,
      ]
    )
    console.log(`[DB] Output salvo: agentId=${agentId} client=${clientId}`)
  } catch (e) {
    console.warn('[DB] saveAgentOutput falhou (não crítico):', e.message)
  }
}

// ─── Buscar histórico do cliente ──────────────────────────────
export async function getClientHistory(clientId, limit = 10) {
  try {
    const rows = await dbQuery(
      `SELECT agent_id, input, output, model_used, created_at
         FROM agent_outputs
        WHERE client_id = $1
        ORDER BY created_at DESC
        LIMIT $2`,
      [clientId, limit]
    )
    return rows || []
  } catch (e) {
    console.warn('[DB] getClientHistory falhou:', e.message)
    return []
  }
}

// ─── Salvar/atualizar contexto de processo ────────────────────
export async function upsertProcesso({ numeroCnj, partes, area, resumo, ultimaMovimentacao }) {
  try {
    await dbQuery(
      `INSERT INTO processos_contexto
         (numero_cnj, partes, area, resumo, ultima_movimentacao, updated_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT (numero_cnj)
       DO UPDATE SET
         partes = EXCLUDED.partes,
         area   = EXCLUDED.area,
         resumo = EXCLUDED.resumo,
         ultima_movimentacao = EXCLUDED.ultima_movimentacao,
         updated_at = NOW()`,
      [numeroCnj, partes || null, area || null, (resumo || '').slice(0, 1000), ultimaMovimentacao || null]
    )
    console.log(`[DB] Processo upsert: ${numeroCnj}`)
  } catch (e) {
    console.warn('[DB] upsertProcesso falhou:', e.message)
  }
}

// ─── Buscar contexto de processo por número CNJ ───────────────
export async function getProcesso(numeroCnj) {
  try {
    const rows = await dbQuery(
      `SELECT * FROM processos_contexto WHERE numero_cnj = $1 LIMIT 1`,
      [numeroCnj]
    )
    return rows?.[0] || null
  } catch (e) {
    console.warn('[DB] getProcesso falhou:', e.message)
    return null
  }
}

// ─── Handler HTTP para uso via API REST (/api/db) ─────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { action } = req.query

  try {
    // ── GET /api/db?action=history&clientId=X ─────────────────
    if (req.method === 'GET' && action === 'history') {
      const { clientId, limit } = req.query
      if (!clientId) return res.status(400).json({ error: 'clientId obrigatório' })
      const rows = await getClientHistory(clientId, Number(limit) || 10)
      return res.status(200).json({ success: true, history: rows })
    }

    // ── GET /api/db?action=processo&cnj=X ─────────────────────
    if (req.method === 'GET' && action === 'processo') {
      const { cnj } = req.query
      if (!cnj) return res.status(400).json({ error: 'cnj obrigatório' })
      const proc = await getProcesso(cnj)
      return res.status(200).json({ success: true, processo: proc })
    }

    // ── POST /api/db?action=upsert-processo ───────────────────
    if (req.method === 'POST' && action === 'upsert-processo') {
      const { numeroCnj, partes, area, resumo, ultimaMovimentacao } = req.body
      if (!numeroCnj) return res.status(400).json({ error: 'numeroCnj obrigatório' })
      await upsertProcesso({ numeroCnj, partes, area, resumo, ultimaMovimentacao })
      return res.status(200).json({ success: true, action: 'upserted', numeroCnj })
    }

    return res.status(400).json({ error: `Ação desconhecida: ${action}` })

  } catch (error) {
    console.error('[DB API] Erro:', error)
    return res.status(500).json({ success: false, error: error.message })
  }
}
