// ============================================================
// LEX JURÍDICO — AI SERVICE LAYER
// Integração Genspark + Gemini + Claude
// ============================================================

import type { AgentConfig } from './aiAgents';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  tokens_used?: number;
  latency_ms?: number;
  error?: string;
}

export interface TaskRecord {
  id: string;
  agent_id: string;
  agent_nome: string;
  usuario: string;
  tipo: string;
  input_resumo: string;
  output_preview: string;
  tokens: number;
  latencia_ms: number;
  status: 'concluido' | 'erro' | 'processando';
  timestamp: string;
  modelo: string;
}

// ─── Enterprise API Stack ─────────────────────────────────────
// Todos os agentes usam o endpoint serverless /api/agents/run
// que roteia para: Claude Haiku · Gemini Pro · GPT-4o · Perplexity
const AGENTS_API = '/api/agents/run';

function getEndpointConfig(model: string): { base: string; key: string; modelName: string } {
  // Mantido para compatibilidade — roteamento real feito no serverless
  return { base: AGENTS_API, key: 'serverless', modelName: model };
}

export async function callAIAgent(
  agent: AgentConfig,
  messages: AIMessage[],
  onStream?: (chunk: string) => void
): Promise<AIResponse> {
  const start = Date.now();
  const lastMsg = messages[messages.length - 1]?.content || '';

  try {
    // Chamar endpoint serverless Enterprise
    const response = await fetch('/api/agents/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agent.id,
        input: lastMsg,
        context: {},
        useSearch: ['ben-peticionista-juridico', 'ben-tributarista', 'ben-previdenciarista',
          'ben-analista-processual', 'ben-trabalhista'].includes(agent.id),
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) throw new Error(data.error || 'Erro do agente');

    return {
      content: data.output,
      model: data.modelUsed || agent.modelo,
      tokens_used: Math.floor(data.output.length / 4),
      latency_ms: Date.now() - start,
    };

  } catch (err) {
    console.error('AI Service error:', err);
    // Fallback para modo demo
    return simulateAgentResponse(agent, messages);
  }
}

// ─── Demo / Simulation Mode ────────────────────────────────
function simulateAgentResponse(agent: AgentConfig, messages: AIMessage[]): AIResponse {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const start = Date.now();

  const demoResponses: Record<string, string> = {
    'ben-peticionista-juridico': `# Petição Elaborada — ${agent.nome}

---

**EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE SÃO PAULO**

**[CLIENTE]**, pessoa jurídica de direito público, inscrita no CNPJ nº XX.XXX.XXX/0001-XX, com sede na [endereço], neste ato representada por seu Procurador, Dr. **Mauro Monção** (OAB/SP nº XXX.XXX), vem, respeitosamente, à presença de Vossa Excelência, com fulcro nos artigos **319 e seguintes do Código de Processo Civil**, propor a presente:

## AÇÃO [TIPO] COM PEDIDO DE TUTELA DE URGÊNCIA

em face de **[PARTE CONTRÁRIA]**, pelos fatos e fundamentos a seguir expostos.

---

### I — DOS FATOS
> *(Insira os fatos relevantes do caso)*

### II — DO DIREITO

Com base no art. XXX do CTN/CLT/CC, e na jurisprudência do **STJ** (REsp X.XXX.XXX, Rel. Min. XXX, j. XX/XX/XXXX):

> *"Ementa do precedente relevante aqui..."*

**⚠️ Nota de Dr. Ben:** Configure as chaves de API nas Configurações para gerar petições completas com jurisprudência real e dados do processo automaticamente. Esta é uma prévia demonstrativa do formato.

### III — DOS PEDIDOS

Ante o exposto, requer-se:

a) O recebimento e processamento da presente ação;
b) A concessão de tutela de urgência, nos termos do art. 300 do CPC;
c) A procedência total dos pedidos;
d) A condenação da parte contrária em custas e honorários (art. 85 CPC, § 2º, mínimo de 10%).

Dá-se à causa o valor de R$ [VALOR].

Termos em que, pede deferimento.

São Paulo, ${new Date().toLocaleDateString('pt-BR')}.

**Dr. Mauro Monção**
OAB/SP nº XXX.XXX`,

    'ben-analista-processual': `# Análise Processual — ${agent.nome}

---

## 📋 SUMÁRIO EXECUTIVO

Análise do processo identificado com base nos dados fornecidos. Abaixo os principais pontos estratégicos identificados.

---

## 🎯 SCORE DE RISCO: **72/100** — ⚠️ ALTO

| Dimensão | Score | Observação |
|----------|-------|------------|
| Mérito jurídico | 65/100 | Tese defensável com precedentes favoráveis |
| Provas disponíveis | 70/100 | Documentação parcial — complementar |
| Prazo processual | 85/100 | Dentro do prazo — monitorar |
| Jurisprudência | 60/100 | Divergência entre TJSP e STJ |

---

## ✅ PONTOS FORTES
- Existência de precedente favorável no STJ (Tema X)
- Documentação formalizada e completa
- Prazo decadencial não alcançado

## ❌ PONTOS FRACOS  
- Jurisprudência local (TJSP) desfavorável em 60% dos casos
- Ausência de perícia técnica
- Valor da causa pode inviabilizar recursos

---

## ⚡ PRÓXIMOS PASSOS RECOMENDADOS

1. **URGENTE**: Verificar prazo de contestação/recurso
2. Pesquisar últimas decisões do STJ sobre o tema
3. Requerer produção de prova documental/pericial
4. Avaliar proposta de acordo se valor < R$ 50K

---

> **⚠️ Modo Demonstração** — Configure a API Genspark para análises completas com dados reais do processo, jurisprudência atualizada e estratégia personalizada.`,

    'ben-tributarista': `# Auditoria Fiscal — ${agent.nome}

---

## 📊 RELATÓRIO DE AUDITORIA TRIBUTÁRIA

**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

## 🔴 PONTOS CRÍTICOS IDENTIFICADOS

### 1. Decadência Tributária
**Status:** ⚠️ VERIFICAR IMEDIATAMENTE
- Prazo decadencial de 5 anos (art. 173, I, CTN)
- Lançamentos de 2019 podem estar prescritos
- **Potencial de extinção:** 30-40% do débito

### 2. Base de Cálculo — ICMS x PIS/COFINS
**Status:** 🟢 TESE FORTE
- RE 574.706 STF — Tema 69 — JULGADO FAVORÁVEL
- Exclusão do ICMS da base de cálculo PIS/COFINS
- **Potencial de recuperação:** calcular sobre 5 anos

### 3. Multa Confiscatória
**Status:** 🟡 VERIFICAR
- Multas acima de 100% são inconstitucionais (STF)
- Multa de 150% aplicada = passível de redução

---

## 💰 ESTIMATIVA DE RECUPERAÇÃO

| Tese | Probabilidade | Valor Estimado |
|------|--------------|----------------|
| Decadência | 60% | R$ XXX.XXX |
| Exclusão ICMS (Tema 69) | 85% | R$ XXX.XXX |
| Redução multa | 70% | R$ XXX.XXX |

> **⚠️ Modo Demonstração** — Configure a API para análise com dados reais do auto de infração.`,

    default: `# ${agent.nome} — Resposta

Olá! Sou **${agent.nome}**, ${agent.titulo}.

Recebi sua solicitação: *"${lastMsg.slice(0, 100)}..."*

Estou pronto para auxiliar com:
${agent.especialidades.slice(0, 4).map(e => `- ${e}`).join('\n')}

**Para ativar minha capacidade completa**, configure a chave de API Genspark nas Configurações do sistema. Em modo demonstrativo, posso mostrar a estrutura e formato das respostas.

Posso ajudá-lo com mais alguma informação sobre minhas capacidades?`,
  };

  const content = demoResponses[agent.id] || demoResponses['default'];

  return {
    content,
    model: `${agent.modelo} (demo)`,
    tokens_used: Math.floor(content.length / 4),
    latency_ms: Date.now() - start + 800,
  };
}

// ─── Task Logger (in-memory for demo) ─────────────────────
const taskLog: TaskRecord[] = [];

export function logTask(record: Omit<TaskRecord, 'id' | 'timestamp'>): TaskRecord {
  const task: TaskRecord = {
    ...record,
    id: `T${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  taskLog.unshift(task);
  if (taskLog.length > 500) taskLog.pop();
  return task;
}

export function getTaskLog(): TaskRecord[] {
  return [...taskLog];
}

export function getTasksByAgent(agentId: string): TaskRecord[] {
  return taskLog.filter(t => t.agent_id === agentId);
}

export function getTasksByUser(usuario: string): TaskRecord[] {
  return taskLog.filter(t => t.usuario === usuario);
}
