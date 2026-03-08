import React, { useState } from 'react';
import {
  Calculator, FileText, TrendingUp, AlertTriangle, BarChart3,
  Search, Send, Copy, Download, RefreshCw, CheckCircle, Zap,
  DollarSign, PieChart, Shield, BookOpen, Clock, ArrowRight,
  Target, Activity, Brain, Layers, Star, ChevronRight,
  Building2, Receipt, CreditCard, FileSearch, Lightbulb,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────
interface AnalysisResult {
  id: number;
  agentId: string;
  agentLabel: string;
  input: string;
  output: string;
  model: string;
  elapsed: string;
  timestamp: string;
}

// ─── Sub-agentes do Contador IA ────────────────────────────
const CONTADOR_AGENTS = [
  {
    id: 'ben-contador-tributarista',
    label: 'Análise Fiscal',
    icon: FileSearch,
    color: '#1a2a5e',
    accent: '#c9a84c',
    desc: 'Analisa obrigações tributárias, riscos fiscais e alertas por regime.',
    placeholder: 'Descreva o cenário fiscal do cliente: regime tributário, tributos envolvidos, valores, período, situação atual...',
    exemplos: [
      'Empresa no Lucro Presumido, faturamento R$ 2,3M/ano, setor de serviços. Verificar obrigações acessórias pendentes e risco de autuação.',
      'Contribuinte com DCTF divergente da NF-e emitida no SPED. Período Jan-Jun/2024. Analisar risco e penalidades potenciais.',
      'Microempresa no Simples Nacional, faturamento acumulado R$ 4,5M. Verificar proximidade do limite e impactos da exclusão.',
    ],
  },
  {
    id: 'ben-contador-tributarista-planejamento',
    label: 'Planejamento Tributário',
    icon: Target,
    color: '#0f5132',
    accent: '#20c997',
    desc: 'Simula cenários e estratégias de otimização tributária lícita.',
    placeholder: 'Informe dados da empresa para planejamento: faturamento, margem, atividade, regime atual, folha de pagamento, distribuição de lucros prevista...',
    exemplos: [
      'Empresa de advocacia, faturamento R$ 1,8M, sócios 2, pró-labore R$ 8k/mês cada, Simples Nacional. Comparar com Lucro Presumido.',
      'Grupo empresarial familiar, 3 empresas, faturamento total R$ 12M. Avaliar viabilidade de holding patrimonial para sucessão.',
      'Empresa de TI, faturamento R$ 4M, 60% exportação. Verificar benefícios SUDENE + Lei do Bem + regime tributário mais vantajoso.',
    ],
  },
  {
    id: 'ben-contador-tributarista-creditos',
    label: 'Recuperação de Créditos',
    icon: CreditCard,
    color: '#6610f2',
    accent: '#a78bfa',
    desc: 'Identifica e quantifica créditos tributários a recuperar (PER/DCOMP, judicial).',
    placeholder: 'Informe tributos pagos, período de análise e contexto (ICMS-ST, PIS/COFINS, contribuições previdenciárias, etc.)...',
    exemplos: [
      'Indústria, período 2019-2024, apurou PIS/COFINS sobre receita total incluindo ICMS. Calcular impacto da Tese do Século (Tema 69 STF).',
      'Empresa de serviços pagou ISS sobre base de cálculo com deduções não aproveitadas. Verificar possibilidade de restituição dos últimos 5 anos.',
      'Transportadora recolheu INSS sobre verbas indenizatórias (aviso prévio, férias). Calcular crédito a recuperar via PER/DCOMP.',
    ],
  },
  {
    id: 'ben-contador-tributarista-auditoria',
    label: 'Inconsistências Contábeis',
    icon: AlertTriangle,
    color: '#dc3545',
    accent: '#ff6b6b',
    desc: 'Audita dados contábeis e detecta irregularidades, riscos de autuação e divergências.',
    placeholder: 'Descreva os dados contábeis ou fiscais suspeitos: valores, períodos, declarações, divergências identificadas...',
    exemplos: [
      'Balanço apresenta saldo credor em caixa de R$ 180k. DRE mostra prejuízo por 3 anos consecutivos mas sócios receberam distribuição. Analisar.',
      'SPED Fiscal aponta receita de R$ 3,2M mas IRPJ foi declarado com base em R$ 2,1M. Empresa tem pagamentos a fornecedor com CNPJ inapto.',
      'Folha eSocial com total de R$ 95k/mês mas DCTF previdenciária recolheu apenas R$ 62k. Investigar divergência e risco de notificação.',
    ],
  },
  {
    id: 'ben-contador-tributarista-relatorio',
    label: 'Relatório Contábil',
    icon: BarChart3,
    color: '#0d6efd',
    accent: '#60a5fa',
    desc: 'Gera relatórios executivos, fiscais e técnicos para diferentes públicos.',
    placeholder: 'Informe o tipo de relatório desejado e os dados: DRE, balanço, indicadores, período, destinatário (diretor/advogado/juiz/contador)...',
    exemplos: [
      'Relatório executivo mensal: receita R$ 380k, despesas R$ 310k, impostos R$ 48k, carga tributária efetiva 12,6%. Para apresentação aos sócios.',
      'Relatório para processo judicial: quantificar lucros cessantes de empresa que teve contrato rescindido indevidamente. Período 18 meses.',
      'Nota técnica simplificada explicando para o cliente o que significa o auto de infração recebido da Receita Federal e os próximos passos.',
    ],
  },
];

// ─── Componente Principal ───────────────────────────────────
export default function ContadorIA() {
  const [activeTab, setActiveTab] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [loadings, setLoadings] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [activeResult, setActiveResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const agent = CONTADOR_AGENTS[activeTab];
  const currentInput = inputs[activeTab] || '';
  const isLoading = loadings[activeTab] || false;
  const tabResults = results.filter(r => r.agentId === agent.id);

  const handleRun = async () => {
    if (!currentInput.trim()) return;
    setLoadings(prev => ({ ...prev, [activeTab]: true }));
    const t0 = Date.now();
    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          input: currentInput,
          context: { modulo: 'contador-ia', subagente: agent.label },
          useSearch: [0, 1, 2].includes(activeTab),
        }),
      });
      const data = await res.json();
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const result: AnalysisResult = {
        id: Date.now(),
        agentId: agent.id,
        agentLabel: agent.label,
        input: currentInput.substring(0, 120) + (currentInput.length > 120 ? '...' : ''),
        output: data.success ? data.output : `⚠️ Erro: ${data.error || 'Falha na API'}`,
        model: data.modelUsed || data.model || 'desconhecido',
        elapsed: `${elapsed}s`,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      setResults(prev => [result, ...prev]);
      setActiveResult(result);
    } catch (err: any) {
      const result: AnalysisResult = {
        id: Date.now(),
        agentId: agent.id,
        agentLabel: agent.label,
        input: currentInput.substring(0, 120),
        output: `⚠️ Erro de conexão: ${err.message}`,
        model: '—',
        elapsed: `${((Date.now() - t0) / 1000).toFixed(1)}s`,
        timestamp: new Date().toLocaleString('pt-BR'),
      };
      setResults(prev => [result, ...prev]);
      setActiveResult(result);
    } finally {
      setLoadings(prev => ({ ...prev, [activeTab]: false }));
    }
  };

  const copyResult = () => {
    if (activeResult) {
      navigator.clipboard.writeText(activeResult.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a2a5e 45%, #0f5132 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 70%, #c9a84c 0%, transparent 35%), radial-gradient(circle at 85% 15%, #20c997 0%, transparent 35%)' }} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg, #c9a84c, #0f5132)', boxShadow: '0 0 40px rgba(201,168,76,0.4)' }}>
              <Calculator size={30} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">Dr. Ben Contador IA</h1>
                <span className="text-xs bg-yellow-400/20 text-yellow-200 border border-yellow-400/30 px-2 py-0.5 rounded-full font-bold">NOVO</span>
              </div>
              <p className="text-green-200 text-sm max-w-2xl">
                Inteligência Contábil e Fiscal de alta performance — análise tributária, planejamento, recuperação de créditos e relatórios técnicos integrados ao ecossistema jurídico.
              </p>
              <div className="flex items-center gap-5 mt-3">
                {[
                  { icon: Calculator, label: '5 módulos contábeis' },
                  { icon: Shield, label: 'Stack GPT-4o + Claude' },
                  { icon: Brain, label: 'Perplexity integrado' },
                  { icon: Activity, label: 'Real-time analysis' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-green-200">
                    <s.icon size={11} className="text-yellow-400" />{s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-1.5 bg-green-400/20 border border-green-400/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 text-xs font-bold">Online · Operacional</span>
            </div>
            <div className="text-xs text-slate-400">25 agentes · Ben Juris Center v5.0</div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-2">
        {CONTADOR_AGENTS.map((a, i) => {
          const Icon = a.icon;
          const isActive = activeTab === i;
          const count = results.filter(r => r.agentId === a.id).length;
          return (
            <button key={a.id} onClick={() => setActiveTab(i)}
              className={`rounded-xl p-3.5 text-left transition-all border ${isActive
                ? 'text-white shadow-lg scale-[1.02]'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-600'}`}
              style={isActive ? { background: `linear-gradient(135deg, ${a.color}, ${a.color}dd)`, borderColor: a.accent } : {}}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isActive ? 'rgba(255,255,255,0.2)' : `${a.color}15` }}>
                  <Icon size={16} style={{ color: isActive ? '#fff' : a.color }} />
                </div>
                {count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                )}
              </div>
              <div className={`text-xs font-black leading-tight ${isActive ? 'text-white' : 'text-slate-700'}`}>{a.label}</div>
              <div className={`text-xs mt-0.5 leading-tight line-clamp-2 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{a.desc}</div>
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* LEFT — Input Panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Agent info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}10)`, border: `1px solid ${agent.color}30` }}>
                <agent.icon size={18} style={{ color: agent.color }} />
              </div>
              <div>
                <div className="font-black text-slate-800 text-sm">{agent.label}</div>
                <div className="text-xs text-slate-500">{agent.desc}</div>
              </div>
            </div>

            {/* Input */}
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
              Dados para Análise
            </label>
            <textarea
              value={currentInput}
              onChange={e => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
              placeholder={agent.placeholder}
              rows={7}
              className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-400 focus:bg-white resize-none transition-all"
            />

            <button
              onClick={handleRun}
              disabled={isLoading || !currentInput.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` }}>
              {isLoading
                ? <><RefreshCw size={15} className="animate-spin" /> Analisando com IA...</>
                : <><Send size={15} /> Analisar com Dr. Ben Contador</>
              }
            </button>
          </div>

          {/* Exemplos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={13} style={{ color: agent.accent }} />
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Exemplos Rápidos</span>
            </div>
            <div className="space-y-2">
              {agent.exemplos.map((ex, i) => (
                <button key={i}
                  onClick={() => setInputs(prev => ({ ...prev, [activeTab]: ex }))}
                  className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition-all group">
                  <div className="flex items-start gap-2">
                    <ChevronRight size={11} className="mt-0.5 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                    <span className="line-clamp-2">{ex}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Análises', value: tabResults.length, icon: BarChart3 },
              { label: 'Módulo', value: agent.label.split(' ')[0], icon: Calculator },
              { label: 'Modelo', value: tabResults[0]?.model?.split('-')[0] || 'GPT-4o', icon: Brain },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                <s.icon size={14} className="mx-auto mb-1" style={{ color: agent.color }} />
                <div className="font-black text-slate-800 text-sm">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Results Panel */}
        <div className="xl:col-span-3 space-y-4">

          {/* Active result */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${agent.color}08, white)` }}>
              <div className="flex items-center gap-2">
                <agent.icon size={15} style={{ color: agent.color }} />
                <span className="font-black text-slate-700 text-sm">Resultado — {agent.label}</span>
                {activeResult && (
                  <span className="text-xs text-slate-400 ml-2">
                    {activeResult.model} · {activeResult.elapsed}
                  </span>
                )}
              </div>
              {activeResult && (
                <div className="flex items-center gap-2">
                  <button onClick={copyResult}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-all">
                    {copied ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([activeResult.output], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `contador-ia-${agent.id}-${Date.now()}.txt`;
                      a.click();
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition-all">
                    <Download size={12} />Download
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 min-h-80 max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
                    style={{ background: `${agent.color}20` }}>
                    <Calculator size={24} style={{ color: agent.color }} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-700 text-sm mb-1">Dr. Ben Contador IA analisando...</div>
                    <div className="text-xs text-slate-400">Consultando base fiscal, tributária e jurisprudência</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: agent.color, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              ) : activeResult ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                    {activeResult.output}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${agent.color}12`, border: `1px solid ${agent.color}25` }}>
                    <Calculator size={26} style={{ color: agent.color }} />
                  </div>
                  <div>
                    <div className="font-black text-slate-700">Aguardando análise</div>
                    <div className="text-sm text-slate-400 mt-1">Preencha os dados e clique em Analisar</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          {tabResults.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={12} className="text-slate-400" />Histórico de Análises — {agent.label}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tabResults.slice(1).map(r => (
                  <button key={r.id} onClick={() => setActiveResult(r)}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${activeResult?.id === r.id
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs text-slate-600 line-clamp-1 flex-1">{r.input}</div>
                      <div className="text-xs text-slate-400 flex-shrink-0">{r.timestamp.split(' ')[1]}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.model} · {r.elapsed}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CAPABILITIES GRID ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Layers size={14} className="text-yellow-600" />
          Capacidades do Dr. Ben Contador IA
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { icon: '📊', title: 'Análise Fiscal', items: ['SPED, ECD, ECF', 'DCTF, DIRF, DEFIS', 'IRPJ, CSLL, PIS/COFINS', 'ICMS, ISS, INSS'] },
            { icon: '🎯', title: 'Planejamento', items: ['Comparativo de regimes', 'Holding patrimonial', 'Split de receitas', 'Incentivos fiscais'] },
            { icon: '💰', title: 'Créditos', items: ['Tese do Século (STF)', 'PER/DCOMP', 'ICMS-ST indevido', 'INSS verbas'] },
            { icon: '🔍', title: 'Auditoria', items: ['Inconsistências SPED', 'Fornecedores inaptos', 'Caixa credor', 'Variação patrimonial'] },
            { icon: '📋', title: 'Relatórios', items: ['Executivo (DRE)', 'Para processo judicial', 'Laudo contábil', 'Nota técnica cliente'] },
          ].map(cap => (
            <div key={cap.title} className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <div className="text-2xl mb-2">{cap.icon}</div>
              <div className="font-black text-slate-700 text-xs mb-2">{cap.title}</div>
              <ul className="space-y-1">
                {cap.items.map(item => (
                  <li key={item} className="text-xs text-slate-500 flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
