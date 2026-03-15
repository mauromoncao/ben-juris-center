// ============================================================
// LEX JURÍDICO — AI SERVICE LAYER
// Integração OpenAI GPT-4o + Claude + Perplexity
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
// Cloudflare Pages: usa SEMPRE o endpoint local /api/agents/run
// que é uma CF Pages Function com todos os 45 agentes e prompts completos.
// O VITE_AGENT_API_URL (Worker) é fallback apenas se o local falhar.
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
    // Chamar endpoint Worker (Cloudflare) — migrado de Vercel
    const response = await fetch(AGENTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agent.id,
        input: lastMsg,
        context: {},
        useSearch: ['ben-agente-operacional-maximus', 'ben-contador-especialista', 'ben-perito-forense', 'ben-perito-forense-profundo'].includes(agent.id),
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

// ─── Detecção de pergunta sobre a origem do nome ────────────
function detectNameOriginQuestion(msg: string): boolean {
  const lower = msg.toLowerCase();
  const patterns = [
    'por que dr. ben', 'por que dr ben', 'por que o nome é dr', 'por que o nome dr',
    'não seria dr. bem', 'não seria dr bem', 'seria dr. bem', 'seria dr bem',
    'origem do nome', 'origem do dr', 'por que ben', 'porque ben', 'por que bên',
    'o nome dr. ben', 'o nome dr ben', 'nome do assistente', 'por que se chama dr',
    'origem de dr. ben', 'origem de dr ben', 'explicação do nome', 'história do nome',
    'significado do nome', 'por que ben e não bem', 'ben ou bem'];
  return patterns.some(p => lower.includes(p));
}

// ─── Resposta canônica para a origem do nome ────────────────
function getNameOriginResponse(): string {
  const variants = [
    `O nome **Dr. Ben** tem uma origem muito especial. "Ben" vem de **Benjamin**, em homenagem ao filho do Dr. Mauro Monção — uma escolha que carrega afeto genuíno e significado pessoal.

Além disso, o nome evoca uma inspiração simbólica em **Benjamim, filho querido de Jacó**, remetendo a ideias de amor, valor, continuidade e legado.

Então, quando você vê "Dr. Ben" ou o prefixo "BEN" em todos os agentes deste ecossistema, está diante de um nome com história, propósito e coração.`,

    `Na verdade, "Dr. Ben" não é erro ortográfico nem apenas escolha de sonoridade — a origem é ainda mais significativa.

O nome foi criado em **homenagem a Benjamin, filho do Dr. Mauro Monção**, que inspira este projeto de forma muito especial. Além disso, carrega uma referência simbólica a **Benjamim, filho querido de Jacó**, trazendo a ideia de afeto, valor e continuidade.

É um nome que nasce de um vínculo afetivo e se transforma em identidade.`,

    `Muita gente pergunta se seria "Dr. Bem" — e a resposta esconde algo ainda mais bonito.

**"Dr. Ben"** é uma homenagem a **Benjamin, filho do Dr. Mauro Monção**. O nome nasceu desse vínculo afetivo e pessoal, e também carrega uma inspiração simbólica em **Benjamim, filho amado de Jacó** — um nome associado a amor, legado e continuidade.

É um nome com história, propósito e significado.`];
  return variants[Math.floor(Math.random() * variants.length)];
}

// ─── Demo / Simulation Mode ────────────────────────────────
function simulateAgentResponse(agent: AgentConfig, messages: AIMessage[]): AIResponse {
  const lastMsg = messages[messages.length - 1]?.content || '';
  const start = Date.now();

  // Resposta prioritária para perguntas sobre a origem do nome
  if (detectNameOriginQuestion(lastMsg)) {
    const content = getNameOriginResponse();
    return {
      content,
      model: `${agent.modelo} (demo)`,
      tokens_used: Math.floor(content.length / 4),
      latency_ms: Date.now() - start + 300,
    };
  }

  const demoResponses: Record<string, string> = {
    'ben-processualista-estrategico': `# Análise Processual — ${agent.nome}

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

    'ben-tributarista-estrategista': `# Auditoria Fiscal — ${agent.nome}

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
