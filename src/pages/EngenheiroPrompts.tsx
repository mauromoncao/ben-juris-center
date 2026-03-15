import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Brain, Zap, Code2, Copy, RefreshCw, Send, Star, BookOpen, ChevronRight,
  Plus, Trash2, Edit, Download, CheckCircle, Sparkles, Target, Lightbulb,
  BarChart3, Clock, ThumbsUp, ThumbsDown, Save, Eye, Play, Settings,
  FileText, Shield, Scale, DollarSign, Building2, Search, Filter,
  ArrowRight, Cpu, Globe, Lock, Activity, MessageSquare, Layers,
  PenTool, FlaskConical, Wand2, Hash, AlignLeft, List, ToggleLeft
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface PromptTemplate {
  id: number; nome: string; categoria: string; descricao: string;
  prompt: string; variaveis: string[]; modelo: string; tokens: number;
  avaliacao: number; usos: number; autor: string; tag: string[];
}

interface PromptResult { id: number; prompt: string; resultado: string; tempo: string; tokens: number; avaliacao: number | null; }

// ─── Biblioteca de Prompts ─────────────────────────────────────────────────────
const TEMPLATES: PromptTemplate[] = [
  {
    id: 1, nome: 'Petição Inicial Completa', categoria: 'Peças Processuais',
    descricao: 'Gera uma petição inicial completa com todos os elementos obrigatórios (qualificação, fatos, direito, pedidos).',
    prompt: `Você é Dr. Ben, especialista jurídico de alta performance. Elabore uma petição inicial completa para:

**DADOS DO CASO:**
- Tipo de ação: {{tipo_acao}}
- Autor(es): {{autor}}
- Réu(s): {{reu}}
- Comarca: {{comarca}}
- Valor da causa: {{valor_causa}}
- Fatos principais: {{fatos}}
- Tese jurídica: {{tese}}
- Pedidos: {{pedidos}}

**REQUISITOS:**
- Seguir rigorosamente o CPC/2015
- Incluir fundamentação legal com artigos específicos
- Citar jurisprudência dos tribunais superiores relevante
- Incluir pedido de tutela de urgência se aplicável
- Linguagem formal e técnica de alto nível
- Estrutura: Endereçamento → Qualificação → Dos Fatos → Do Direito → Dos Pedidos → Valor da Causa → Provas → Requerimentos Finais`,
    variaveis: ['tipo_acao','autor','reu','comarca','valor_causa','fatos','tese','pedidos'],
    modelo: 'Genspark Legal LLM', tokens: 2800, avaliacao: 4.9, usos: 847, autor: 'Dr. Mauro Monção',
    tag: ['petição','judicial','CPC','automação']
  },
  {
    id: 2, nome: 'Análise de Risco Processual', categoria: 'Análise Jurídica',
    descricao: 'Analisa um processo e retorna avaliação completa de riscos, chances de êxito e estratégia recomendada.',
    prompt: `Você é Dr. Ben, especialista em análise processual com acesso à jurisprudência atualizada. Realize análise completa do processo:

**DADOS DO PROCESSO:**
- Número: {{numero_processo}}
- Tipo: {{tipo_processo}}
- Partes: {{partes}}
- Objeto: {{objeto}}
- Fase atual: {{fase_atual}}
- Última movimentação: {{ultima_movimentacao}}

**EXECUTE A ANÁLISE:**
1. **Resumo executivo** (3 linhas)
2. **Análise fática** – pontos fortes e fracos
3. **Análise jurídica** – legislação, doutrina, jurisprudência aplicável
4. **Matriz de riscos** (probabilidade × impacto)
5. **Probabilidade de êxito** (%) com justificativa
6. **Estratégia recomendada** – próximas 3 ações prioritárias
7. **Alertas críticos** – prazos, nulidades, preclusões`,
    variaveis: ['numero_processo','tipo_processo','partes','objeto','fase_atual','ultima_movimentacao'],
    modelo: 'Genspark Legal LLM', tokens: 3200, avaliacao: 4.8, usos: 634, autor: 'Dra. Ana Carla',
    tag: ['análise','risco','estratégia','processo']
  },
  {
    id: 3, nome: 'Contrato de Prestação de Serviços', categoria: 'Contratos',
    descricao: 'Gera minuta completa de contrato de prestação de serviços advocatícios com todas as cláusulas necessárias.',
    prompt: `Você é Dr. Ben, especialista em contratos empresariais. Elabore contrato completo de prestação de serviços:

**DADOS CONTRATUAIS:**
- Contratante: {{contratante}} ({{qualificacao_contratante}})
- Advogado/Escritório: {{advogado}} ({{oab}})
- Objeto do serviço: {{objeto_servico}}
- Honorários: {{honorarios}} ({{forma_pagamento}})
- Prazo: {{prazo}}
- Foro: {{foro}}

**INCLUA OBRIGATORIAMENTE:**
- Qualificação completa das partes
- Objeto detalhado
- Honorários, forma e prazo de pagamento
- Cláusula de êxito (se aplicável): {{clausula_exito}}
- Deveres e obrigações de cada parte
- Sigilo e confidencialidade
- Proteção de dados (LGPD)
- Rescisão contratual e multas
- Solução de controvérsias
- Foro de eleição`,
    variaveis: ['contratante','qualificacao_contratante','advogado','oab','objeto_servico','honorarios','forma_pagamento','prazo','foro','clausula_exito'],
    modelo: 'Genspark Legal LLM', tokens: 2400, avaliacao: 4.9, usos: 412, autor: 'Dr. Mauro Monção',
    tag: ['contrato','honorários','advocatício','OAB']
  },
  {
    id: 4, nome: 'Parecer Jurídico Fundamentado', categoria: 'Pareceres',
    descricao: 'Elabora parecer jurídico completo com análise doutrinária e jurisprudencial sobre questão específica.',
    prompt: `Você é Dr. Ben, especialista em pareceres jurídicos de alto nível. Elabore parecer completo sobre:

**CONSULTA:**
- Consulente: {{consulente}}
- Questão jurídica: {{questao}}
- Contexto fático: {{contexto}}
- Legislação primária aplicável: {{legislacao}}

**ESTRUTURA DO PARECER:**
1. EMENTA (síntese em até 5 linhas)
2. RELATÓRIO (exposição do caso)
3. FUNDAMENTAÇÃO JURÍDICA
   a. Análise da legislação aplicável
   b. Doutrina majoritária e minoritária
   c. Jurisprudência dos tribunais superiores (STF, STJ, TRF, TCU se cabível)
   d. Posição do parecerista com justificativa
4. CONCLUSÃO E RECOMENDAÇÕES
5. RESSALVAS (limitações do parecer)

**QUALIDADE:** Nível de excelência de escritório tier 1. Cite fontes específicas.`,
    variaveis: ['consulente','questao','contexto','legislacao'],
    modelo: 'Genspark Legal LLM', tokens: 3800, avaliacao: 4.8, usos: 298, autor: 'Dr. Mauro Monção',
    tag: ['parecer','opinion','doutrina','jurisprudência']
  },
  {
    id: 5, nome: 'Defesa Administrativa Tributária', categoria: 'Tributário',
    descricao: 'Elabora defesa completa em processo administrativo fiscal, identificando vícios e teses de defesa.',
    prompt: `Você é Dr. Ben, especialista em direito tributário e processo administrativo fiscal. Elabore defesa administrativa:

**AUTO DE INFRAÇÃO:**
- Número: {{numero_ai}}
- Contribuinte: {{contribuinte}}
- CNPJ/CPF: {{documento}}
- Tributo autuado: {{tributo}}
- Período: {{periodo}}
- Valor: {{valor}}
- Fundamento da autuação: {{fundamento_autuacao}}
- Infração imputada: {{infracao}}

**ELABORE:**
1. Preliminares processuais (decadência, prescrição, cerceamento, nulidade)
2. Mérito – teses de defesa com fundamentação legal e jurisprudencial
3. Análise de jurisprudência do CARF e tribunais superiores
4. Pedidos (cancelamento total/parcial, redução de multa, parcelamento)
5. Requerimento de produção de provas
6. Conclusão com estratégia recomendada`,
    variaveis: ['numero_ai','contribuinte','documento','tributo','periodo','valor','fundamento_autuacao','infracao'],
    modelo: 'Genspark Legal LLM', tokens: 3000, avaliacao: 4.7, usos: 234, autor: 'Dr. Felipe Torres',
    tag: ['tributário','CARF','defesa','auto de infração']
  },
  {
    id: 6, nome: 'Prompt para Setor Público (Municípios)', categoria: 'Setor Público',
    descricao: 'Template especializado em demandas de municípios, câmaras e secretarias com referências à legislação municipal.',
    prompt: `Você é Dr. Ben, especialista em direito público e assessoria jurídica municipal. Para a consulta abaixo:

**ENTE PÚBLICO:**
- Município/Entidade: {{entidade}}
- Estado: {{estado}}
- Tipo de demanda: {{tipo_demanda}}
- Setor solicitante: {{setor}}
- Contexto: {{contexto}}

**PARÂMETROS:**
- Considerar autonomia municipal (CF/88 art. 29 e ss.)
- Observar LRF, Lei 8.666/93 e Nova Lei de Licitações (14.133/2021)
- Observar legislação específica estadual se mencionada
- Considerar precedentes TCU e TCE
- Linguagem acessível para gestores públicos não juristas

**ENTREGUE:**
1. Análise jurídica objetiva
2. Riscos e responsabilidades do gestor
3. Recomendação prática com fundamento
4. Modelo de ato/documento se necessário (decreto, portaria, parecer)`,
    variaveis: ['entidade','estado','tipo_demanda','setor','contexto'],
    modelo: 'Genspark Legal LLM', tokens: 2600, avaliacao: 4.8, usos: 189, autor: 'Dr. Mauro Monção',
    tag: ['município','câmara','secretaria','setor público']
  },
  {
    id: 7, nome: 'Engenharia de Prompts Jurídicos', categoria: 'Meta-Prompts',
    descricao: 'Cria e otimiza prompts especializados para qualquer área jurídica, com técnicas avançadas de prompt engineering.',
    prompt: `Você é um Engenheiro de Prompts especializado em IA jurídica. Crie um prompt de alta performance para:

**OBJETIVO DO PROMPT:**
- Tarefa jurídica: {{tarefa}}
- Área do direito: {{area_direito}}
- Nível de especialização: {{nivel}} (júnior/sênior/especialista)
- Saída desejada: {{saida_desejada}}
- Restrições: {{restricoes}}

**APLIQUE AS TÉCNICAS:**
1. **Role prompting**: Defina a persona jurídica especialista ideal
2. **Chain-of-thought**: Estruture o raciocínio passo a passo
3. **Few-shot examples**: Inclua 2-3 exemplos de alta qualidade
4. **Structured output**: Defina formato de saída preciso
5. **Constraint injection**: Inclua guardrails jurídicos obrigatórios
6. **Context enrichment**: Adicione contexto do direito brasileiro

**ENTREGUE:**
- Prompt otimizado pronto para uso
- Explicação das técnicas aplicadas
- Variáveis parametrizáveis ({{variável}})
- Instruções de uso e customização
- Score estimado de qualidade (1-10)`,
    variaveis: ['tarefa','area_direito','nivel','saida_desejada','restricoes'],
    modelo: 'Genspark Meta LLM', tokens: 2200, avaliacao: 5.0, usos: 156, autor: 'Dr. Ben IA',
    tag: ['meta-prompt','engenharia','otimização','IA']
  },
  {
    id: 8, nome: 'Relatório de Due Diligence Legal', categoria: 'M&A / Due Diligence',
    descricao: 'Estrutura completa de relatório de due diligence jurídica para operações societárias e M&A.',
    prompt: `Você é Dr. Ben, especialista em M&A e due diligence jurídica de alto nível. Elabore relatório completo:

**OPERAÇÃO:**
- Target (empresa alvo): {{target}}
- Adquirente: {{adquirente}}
- Tipo de operação: {{tipo_operacao}}
- Valor estimado: {{valor}}
- Setor: {{setor}}

**ESTRUTURA DO RELATÓRIO:**
## SUMÁRIO EXECUTIVO
## 1. ANÁLISE SOCIETÁRIA
   - Estrutura corporativa, quotas/ações, histórico
## 2. CONTENCIOSO JUDICIAL E ADMINISTRATIVO
   - Processos ativos, provisões, riscos fiscais
## 3. ANÁLISE TRABALHISTA
   - Passivos, acordos, CLT compliance
## 4. ANÁLISE TRIBUTÁRIA
   - Débitos, CND, recuperação de créditos
## 5. ANÁLISE IMOBILIÁRIA (se aplicável)
## 6. PROPRIEDADE INTELECTUAL E TI
## 7. CONTRATOS RELEVANTES
   - Change of control, non-compete
## 8. LGPD E COMPLIANCE
## 9. MATRIZ DE RISCOS CONSOLIDADA
## 10. CONDIÇÕES PRECEDENTES RECOMENDADAS
## 11. RECOMENDAÇÃO FINAL (Prosseguir/Ajustar/Não prosseguir)`,
    variaveis: ['target','adquirente','tipo_operacao','valor','setor'],
    modelo: 'Genspark Legal LLM', tokens: 4200, avaliacao: 4.9, usos: 87, autor: 'Dr. Mauro Monção',
    tag: ['M&A','due diligence','societário','relatório']
  },
];

const CATEGORIAS = ['Todos', ...Array.from(new Set(TEMPLATES.map(t => t.categoria)))];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EngenheiroPrompts() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'biblioteca' | 'editor' | 'playground' | 'oficina'>('biblioteca');
  const [catFilter, setCatFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [editorPrompt, setEditorPrompt] = useState('');
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<PromptResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [playgroundInput, setPlaygroundInput] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Oficina state
  const [oficinaInput, setOficinaInput] = useState('');
  const [oficinaResult, setOficinaResult] = useState('');
  const [oficinaLoading, setOficinaLoading] = useState(false);
  const [oficinaModo, setOficinaModo] = useState<'OTIMIZAR' | 'AUDITAR' | 'METAPROMPT'>('OTIMIZAR');

  // Variável values for template filling
  const [varValues, setVarValues] = useState<Record<string, string>>({});

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchCat = catFilter === 'Todos' || t.categoria === catFilter;
    const matchSearch = !search || t.nome.toLowerCase().includes(search.toLowerCase()) ||
      t.descricao.toLowerCase().includes(search.toLowerCase()) ||
      t.tag.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const loadTemplate = (t: PromptTemplate) => {
    setSelectedTemplate(t);
    setEditorPrompt(t.prompt);
    const initialVars: Record<string, string> = {};
    t.variaveis.forEach(v => initialVars[v] = '');
    setVarValues(initialVars);
    setTab('editor');
  };

  const fillAndRun = async () => {
    let filled = editorPrompt;
    Object.entries(varValues).forEach(([k, v]) => {
      filled = filled.replaceAll(`{{${k}}}`, v || `[${k}]`);
    });
    setLoading(true);
    const t0 = Date.now();
    try {
      const res = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-engenheiro-prompt',
          input: filled,
          clientId: user?.email,
          context: { modo: 'editor', template: selectedTemplate?.nome || 'custom' },
        }),
      });
      const data = await res.json();
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const result: PromptResult = {
        id: Date.now(),
        prompt: filled.substring(0, 200) + '...',
        resultado: data.success ? data.output : `⚠️ Erro: ${data.error || 'Falha na API'}`,
        tempo: `${elapsed}s`,
        tokens: data.tokens_used || Math.floor(Math.random() * 800 + 400),
        avaliacao: null,
      };
      setResults(prev => [result, ...prev]);
    } catch (err: any) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      setResults(prev => [{
        id: Date.now(),
        prompt: filled.substring(0, 200) + '...',
        resultado: `⚠️ Erro de conexão: ${err.message}`,
        tempo: `${elapsed}s`,
        tokens: 0,
        avaliacao: null,
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const runPlayground = async () => {
    if (!playgroundInput.trim()) return;
    setPlaygroundLoading(true);
    setPlaygroundResult('');
    try {
      const res = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-engenheiro-prompt',
          input: playgroundInput,
          clientId: user?.email,
          context: { modo: 'playground' },
        }),
      });
      const data = await res.json();
      setPlaygroundResult(
        data.success
          ? data.output
          : `⚠️ Erro: ${data.error || 'Falha na API'}`
      );
    } catch (err: any) {
      setPlaygroundResult(`⚠️ Erro de conexão: ${err.message}`);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const runOficina = async () => {
    if (!oficinaInput.trim()) return;
    setOficinaLoading(true);
    setOficinaResult('');
    try {
      const modeInstruction = {
        OTIMIZAR: `MODO: OTIMIZAR\nReceba o prompt abaixo e devolva uma versão significativamente melhorada, aplicando Role Prompting, Chain-of-Thought, Structured Output e Constraint Injection. Mantenha a intenção original mas aumente a precisão, clareza e qualidade jurídica.`,
        AUDITAR: `MODO: AUDITAR\nAnalise o prompt abaixo e identifique: (1) pontos fortes, (2) pontos fracos e ambiguidades, (3) riscos jurídicos/éticos, (4) sugestões específicas de melhoria com exemplos. Dê um score de qualidade 1-10.`,
        METAPROMPT: `MODO: METAPROMPT\nCrie um template parametrizado a partir do prompt abaixo. Substitua valores específicos por variáveis {{variavel}} reutilizáveis. Entregue o template pronto com lista de variáveis e instruções de preenchimento.`,
      }[oficinaModo];
      const res = await fetch((import.meta.env.VITE_AGENT_API_URL || 'https://ben-agents-worker.mauromoncaoestudos.workers.dev/agents/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-engenheiro-prompt',
          input: `${modeInstruction}\n\nPROMPT ORIGINAL:\n${oficinaInput}`,
          clientId: user?.email,
          context: { modo: oficinaModo.toLowerCase() },
        }),
      });
      const data = await res.json();
      setOficinaResult(data.success ? data.output : `⚠️ Erro: ${data.error || 'Falha na API'}`);
    } catch (err: any) {
      setOficinaResult(`⚠️ Erro de conexão: ${err.message}`);
    } finally {
      setOficinaLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #19385C 0%, #19385C 40%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #a78bfa 0%, transparent 40%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 40%)' }} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
              <Wand2 size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">Dr. Ben – Engenheiro de Prompts</h1>
                <span className="text-xs bg-purple-400/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full">IA Especialista</span>
              </div>
              <p className="text-purple-200 text-sm max-w-2xl">Agente de alta performance para criação, otimização e gestão de prompts jurídicos. Biblioteca completa + Playground + Oficina de criação.</p>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { icon: BookOpen,  label: `${TEMPLATES.length} templates` },
                  { icon: Star,      label: `4.9 avaliação média` },
                  { icon: Activity,  label: `${TEMPLATES.reduce((a,t) => a+t.usos,0).toLocaleString()} usos` },
                  { icon: Cpu,       label: 'Genspark Meta LLM' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-purple-200">
                    <s.icon size={12} className="text-[#9f7aea]" />{s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-400/20 border border-green-400/30 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
            <span className="text-green-300 text-xs font-semibold">Online · Alta Performance</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1 shadow-sm w-fit">
        {[
          { id: 'biblioteca', label: 'Biblioteca',    icon: BookOpen },
          { id: 'editor',     label: 'Editor de Prompt', icon: Edit },
          { id: 'playground', label: 'Playground',    icon: FlaskConical },
          { id: 'oficina',    label: 'Oficina IA',    icon: Wand2 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.id
              ? 'bg-[#19385C] text-white shadow-md'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          BIBLIOTECA DE PROMPTS
      ════════════════════════════════════════════ */}
      {tab === 'biblioteca' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar prompt..."
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-sm w-56"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border ${catFilter === cat
                    ? 'bg-[#19385C] text-white border-[#DEC078] shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-300 transition-all group cursor-pointer"
                onClick={() => loadTemplate(t)}>
                <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500"/>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full mb-1.5 inline-block">{t.categoria}</div>
                      <h3 className="font-black text-slate-800 text-sm group-hover:text-purple-700 transition-colors">{t.nome}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #f5f3ff, #eff6ff)', border: '1px solid #e0e7ff' }}>
                      <Code2 size={18} className="text-purple-600"/>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{t.descricao}</p>

                  {/* Vars */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.variaveis.slice(0,4).map(v => (
                      <span key={v} className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded font-mono">{`{{${v}}}`}</span>
                    ))}
                    {t.variaveis.length > 4 && <span className="text-xs text-slate-400">+{t.variaveis.length-4}</span>}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.tag.slice(0,3).map(tag => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-0.5 text-yellow-600 font-bold"><Star size={11} fill="currentColor"/>{t.avaliacao}</span>
                      <span>{t.usos.toLocaleString()} usos</span>
                      <span>{t.tokens} tokens</span>
                    </div>
                    <button className="text-xs text-purple-600 font-bold flex items-center gap-1 hover:text-purple-800 transition-colors group-hover:gap-2">
                      Usar <ArrowRight size={11}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New template */}
            <button onClick={() => { setEditorPrompt(''); setSelectedTemplate(null); setVarValues({}); setTab('editor'); }}
              className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all flex flex-col items-center justify-center gap-3 p-8 text-slate-400 hover:text-purple-600 group min-h-64">
              <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 group-hover:border-purple-400 flex items-center justify-center transition-colors">
                <Plus size={26}/>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold">Criar Novo Prompt</div>
                <div className="text-xs text-slate-400 mt-0.5">Templates customizados</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          EDITOR DE PROMPT
      ════════════════════════════════════════════ */}
      {tab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: editor */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-700 text-sm flex items-center gap-2">
                  <Code2 size={15} className="text-purple-500"/>
                  {selectedTemplate ? `Editando: ${selectedTemplate.nome}` : 'Novo Prompt'}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditorPrompt('')} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"><Trash2 size={11}/>Limpar</button>
                  <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Download size={11}/>Exportar</button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={editorPrompt}
                  onChange={e => setEditorPrompt(e.target.value)}
                  placeholder="Cole ou escreva seu prompt aqui. Use {{variavel}} para criar campos dinâmicos..."
                  className="w-full h-72 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-purple-500 resize-none font-mono leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>{editorPrompt.length} caracteres · {Math.ceil(editorPrompt.length/4)} tokens est.</span>
                  <span className="text-purple-500 font-medium">{(editorPrompt.match(/\{\{[^}]+\}\}/g) || []).length} variáveis detectadas</span>
                </div>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-black text-slate-700 text-sm flex items-center gap-2"><Sparkles size={14} className="text-yellow-500"/>Resultados Gerados</h4>
                {results.slice(0, 3).map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11}/>{r.tempo}</span>
                      <span>{r.tokens} tokens</span>
                      <div className="flex gap-1">
                        <button onClick={() => navigator.clipboard?.writeText(r.resultado)} className="flex items-center gap-1 text-blue-500 hover:text-blue-700"><Copy size={11}/>Copiar</button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-48 overflow-y-auto font-mono text-xs">
                      {r.resultado}
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <span className="text-slate-400">Avaliar:</span>
                      <button className="text-green-500 hover:text-green-700 flex items-center gap-1 border border-green-200 bg-green-50 px-2 py-0.5 rounded"><ThumbsUp size={11}/>Ótimo</button>
                      <button className="text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 bg-red-50 px-2 py-0.5 rounded"><ThumbsDown size={11}/>Ruim</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: variables panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Variables */}
            {Object.keys(varValues).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-purple-50">
                  <h4 className="font-black text-slate-700 text-sm flex items-center gap-2"><Hash size={14} className="text-purple-500"/>Variáveis do Prompt</h4>
                </div>
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {Object.keys(varValues).map(key => (
                    <div key={key}>
                      <label className="text-xs font-bold text-slate-600 mb-1 block font-mono">{`{{${key}}}`}</label>
                      <input
                        value={varValues[key]}
                        onChange={e => setVarValues(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={`Valor para ${key}...`}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Run button */}
            <button onClick={fillAndRun} disabled={loading || !editorPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black text-sm disabled:opacity-50 transition-all hover:opacity-90 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
              {loading ? <><RefreshCw size={16} className="animate-spin"/>Processando...</> : <><Zap size={16}/>Executar Prompt</>}
            </button>

            {/* Modelo info */}
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
              <h5 className="text-xs font-black text-purple-700 mb-2 flex items-center gap-1"><Cpu size={12}/>Modelo Ativo</h5>
              <div className="text-xs text-slate-600 space-y-1.5">
                {[
                  { label: 'Modelo',  value: 'Genspark Legal LLM' },
                  { label: 'Base',    value: 'Direito Brasileiro' },
                  { label: 'Contexto',value: 'CNJ + Tribunais' },
                  { label: 'Versão',  value: 'v3.1 (Fev/2026)' },
                ].map(i => (
                  <div key={i.label} className="flex justify-between">
                    <span className="text-slate-400">{i.label}:</span>
                    <span className="font-semibold text-purple-700">{i.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <h5 className="text-xs font-black text-blue-700 mb-2 flex items-center gap-1"><Lightbulb size={12}/>Dicas de Prompt Engineering</h5>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {[
                  'Use {{variavel}} para campos dinâmicos',
                  'Defina a persona com "Você é..." no início',
                  'Estruture a saída com numeração ou markdown',
                  'Inclua exemplos (few-shot) para maior precisão',
                  'Adicione "passo a passo" para chain-of-thought',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5"><span className="text-[#19385C] mt-0.5">•</span>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PLAYGROUND
      ════════════════════════════════════════════ */}
      {tab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <FlaskConical size={15} className="text-purple-500"/>
              <h3 className="font-black text-slate-700 text-sm">Playground Livre</h3>
              <span className="ml-auto text-xs text-slate-400">Teste qualquer prompt em tempo real</span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3">
              <textarea
                value={playgroundInput}
                onChange={e => setPlaygroundInput(e.target.value)}
                placeholder="Digite qualquer prompt jurídico aqui... Pode ser uma pergunta, solicitação de peça, análise, contrato, parecer ou qualquer outra demanda jurídica."
                className="flex-1 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-purple-500 resize-none font-mono min-h-64"
              />
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Analise os riscos processuais do caso descrito',
                  'Elabore um parecer sobre constitucionalidade',
                  'Crie um prompt otimizado para petições de mandado de segurança',
                  'Qual a melhor estratégia de defesa neste caso?',
                ].map(qp => (
                  <button key={qp} onClick={() => setPlaygroundInput(qp)}
                    className="text-xs bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-lg px-2.5 py-1.5 transition-all">
                    ⚡ {qp.substring(0, 40)}...
                  </button>
                ))}
              </div>
              <button onClick={runPlayground} disabled={playgroundLoading || !playgroundInput.trim()}
                className="w-full py-3 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90 shadow-md"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                {playgroundLoading ? <><RefreshCw size={14} className="animate-spin"/>Processando...</> : <><Send size={14}/>Executar com Dr. Ben IA</>}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-yellow-500"/>
                <h3 className="font-black text-slate-700 text-sm">Resultado</h3>
              </div>
              {playgroundResult && (
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard?.writeText(playgroundResult)}
                    className="text-xs text-blue-600 flex items-center gap-1 hover:text-blue-800"><Copy size={11}/>Copiar</button>
                  <button className="text-xs text-green-600 flex items-center gap-1 hover:text-green-800"><Download size={11}/>Exportar</button>
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              {playgroundLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto animate-pulse"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                      <Brain size={28} className="text-white"/>
                    </div>
                    <div className="text-sm text-slate-500 font-semibold">Dr. Ben IA processando...</div>
                    <div className="flex justify-center gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i*0.15}s`}}/>)}
                    </div>
                  </div>
                </div>
              ) : playgroundResult ? (
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{playgroundResult}</div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: '#f5f3ff' }}>
                      <Wand2 size={26} className="text-[#7c3aed]"/>
                    </div>
                    <div className="text-sm text-slate-400">Digite um prompt e clique em Executar</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          OFICINA IA – Otimização automática
      ════════════════════════════════════════════ */}
      {tab === 'oficina' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                <Wand2 size={22} className="text-white"/>
              </div>
              <div>
                <h3 className="font-black text-slate-800">Oficina de Otimização de Prompts</h3>
                <p className="text-sm text-slate-500">Cole um prompt existente e o Dr. Ben IA o processará com IA real aplicando técnicas avançadas.</p>
              </div>
            </div>

            {/* Modo selector */}
            <div className="flex gap-2 mb-4">
              {(['OTIMIZAR', 'AUDITAR', 'METAPROMPT'] as const).map(m => (
                <button key={m} onClick={() => setOficinaModo(m)}
                  className={`text-xs px-4 py-2 rounded-xl font-black transition-all border ${oficinaModo === m
                    ? 'bg-[#19385C] text-white border-[#DEC078]'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'}`}>
                  {m === 'OTIMIZAR' ? '✨ Otimizar' : m === 'AUDITAR' ? '🔍 Auditar' : '🔧 Meta-Prompt'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Prompt Original</label>
                <textarea
                  value={oficinaInput}
                  onChange={e => setOficinaInput(e.target.value)}
                  placeholder="Cole aqui o prompt que deseja otimizar/auditar/transformar..."
                  className="w-full h-48 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 resize-none shadow-sm"/>
              </div>
              <div>
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">
                  Resultado Dr. Ben IA {oficinaModo === 'OTIMIZAR' ? '(Otimizado)' : oficinaModo === 'AUDITAR' ? '(Auditoria)' : '(Meta-Prompt)'}
                </label>
                <div className="w-full h-48 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl p-3 overflow-y-auto shadow-sm whitespace-pre-wrap">
                  {oficinaLoading
                    ? <span className="text-purple-500 animate-pulse">⏳ Dr. Ben IA processando...</span>
                    : oficinaResult
                      ? <span>{oficinaResult}</span>
                      : <span className="text-slate-400 italic">O resultado aparecerá aqui...</span>
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={runOficina}
                disabled={oficinaLoading || !oficinaInput.trim()}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-white font-black text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                <Wand2 size={15}/>{oficinaModo === 'OTIMIZAR' ? 'Otimizar com IA' : oficinaModo === 'AUDITAR' ? 'Auditar com IA' : 'Gerar Meta-Prompt'}
              </button>
              {oficinaResult && (
                <button
                  onClick={() => navigator.clipboard.writeText(oficinaResult)}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-purple-600 font-black text-sm bg-white border border-purple-200 shadow-sm hover:bg-purple-50 transition-colors">
                  <Copy size={15}/>Copiar Resultado
                </button>
              )}
            </div>
          </div>

          {/* Técnicas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2"><Layers size={15} className="text-purple-500"/>Técnicas de Prompt Engineering Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { nome: 'Role Prompting', desc: 'Define a persona especialista (ex: "Você é Dr. Ben, especialista em...")', icon: '🎭', cor: '#7c3aed' },
                { nome: 'Chain-of-Thought', desc: 'Instrui o modelo a raciocinar passo a passo para maior precisão', icon: '🔗', cor: '#2563eb' },
                { nome: 'Few-Shot Learning', desc: 'Fornece exemplos de alta qualidade para calibrar a resposta', icon: '📚', cor: '#059669' },
                { nome: 'Structured Output', desc: 'Define formato de saída preciso com markdown, seções e campos', icon: '📐', cor: '#d97706' },
                { nome: 'Constraint Injection', desc: 'Adiciona guardrails jurídicos obrigatórios (LGPD, OAB, etc.)', icon: '🛡️', cor: '#dc2626' },
                { nome: 'Context Enrichment', desc: 'Enriquece com contexto legal brasileiro (CNJ, STF, STJ)', icon: '🌐', cor: '#0891b2' },
                { nome: 'Self-Consistency', desc: 'Gera múltiplas respostas e seleciona a mais consistente', icon: '🔄', cor: '#7c3aed' },
                { nome: 'Tree-of-Thought', desc: 'Explora múltiplos caminhos jurídicos para escolher o melhor', icon: '🌳', cor: '#059669' },
                { nome: 'Prompt Chaining', desc: 'Encadeia múltiplos prompts para tarefas complexas multi-etapa', icon: '⛓️', cor: '#2563eb' },
              ].map(t => (
                <div key={t.nome} className="rounded-xl border border-slate-200 p-3.5 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-sm font-black text-slate-700 group-hover:text-purple-700">{t.nome}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
