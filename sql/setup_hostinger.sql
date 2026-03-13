-- BEN JURIS CENTER — PostgreSQL Hostinger VPS
-- Execute: psql $DATABASE_URL -f setup_hostinger.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE IF NOT EXISTS agent_outputs (
  id            BIGSERIAL PRIMARY KEY,
  agent_id      VARCHAR(80)   NOT NULL,
  client_id     VARCHAR(120),
  processo_num  VARCHAR(40),
  input         TEXT,
  output        TEXT,
  model_used    VARCHAR(60),
  input_tokens  INTEGER       DEFAULT 0,
  output_tokens INTEGER       DEFAULT 0,
  cost_usd      NUMERIC(10,6) DEFAULT 0,
  elapsed_ms    INTEGER       DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ao_client   ON agent_outputs (client_id);
CREATE INDEX IF NOT EXISTS idx_ao_agent    ON agent_outputs (agent_id);
CREATE INDEX IF NOT EXISTS idx_ao_processo ON agent_outputs (processo_num);
CREATE INDEX IF NOT EXISTS idx_ao_created  ON agent_outputs (created_at DESC);

CREATE TABLE IF NOT EXISTS processos_contexto (
  id                  BIGSERIAL PRIMARY KEY,
  numero_cnj          VARCHAR(40)  NOT NULL UNIQUE,
  partes              TEXT,
  area                VARCHAR(60),
  resumo              TEXT,
  ultima_movimentacao TEXT,
  status              VARCHAR(30)  DEFAULT 'ativo',
  prazo_proximo       DATE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pc_cnj    ON processos_contexto (numero_cnj);
CREATE INDEX IF NOT EXISTS idx_pc_status ON processos_contexto (status);
CREATE INDEX IF NOT EXISTS idx_pc_prazo  ON processos_contexto (prazo_proximo);

CREATE TABLE IF NOT EXISTS clientes (
  id            BIGSERIAL PRIMARY KEY,
  client_id     VARCHAR(120) NOT NULL UNIQUE,
  nome          VARCHAR(200),
  cpf_cnpj      VARCHAR(20),
  telefone      VARCHAR(20),
  email         VARCHAR(120),
  area_juridica VARCHAR(60),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cli_client_id ON clientes (client_id);

CREATE OR REPLACE VIEW vw_uso_agentes AS
SELECT agent_id, COUNT(*) AS total_chamadas,
  SUM(input_tokens + output_tokens) AS total_tokens,
  ROUND(SUM(cost_usd)::NUMERIC, 4)  AS custo_total_usd,
  ROUND(AVG(elapsed_ms))            AS tempo_medio_ms,
  MAX(created_at)                   AS ultima_chamada
FROM agent_outputs GROUP BY agent_id ORDER BY total_chamadas DESC;

CREATE OR REPLACE VIEW vw_prazos_urgentes AS
SELECT numero_cnj, partes, area, resumo, prazo_proximo, status
FROM processos_contexto
WHERE prazo_proximo BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND status = 'ativo'
ORDER BY prazo_proximo ASC;
