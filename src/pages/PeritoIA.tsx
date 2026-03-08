import React, { useState } from 'react';
import {
  FlaskConical, FileSearch, Monitor, FileText, AlertTriangle,
  BarChart3, Send, Copy, Download, RefreshCw, CheckCircle,
  Microscope, Shield, Search, ChevronRight, Clock, Layers,
  Brain, Activity, Lightbulb, Eye, Fingerprint, Scale,
  XCircle, BookOpen, Camera,
} from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────
interface PeritoResult {
  id: number;
  agentId: string;
  agentLabel: string;
  input: string;
  output: string;
  model: string;
  elapsed: string;
  timestamp: string;
}

// ─── Sub-agentes do Perito IA ───────────────────────────────
const PERITO_AGENTS = [
  {
    id: 'ben-perito-forense',
    label: 'Análise de Documentos',
    icon: FileSearch,
    color: '#1a2a5e',
    accent: '#c9a84c',
    desc: 'Analisa documentos jurídicos em 7 camadas: autenticidade, coerência, adulteração, validade, conteúdo, prova e síntese.',
    placeholder: 'Descreva o documento a analisar: tipo, partes envolvidas, data, valores, finalidade, suspeitas ou inconsistências identificadas...',
    exemplos: [
      'Contrato de compra e venda de imóvel. Suspeito de data adulterada: consta 2019 mas referência ao CONTRAN 2021 no texto. Analisar autenticidade.',
      'Extrato bancário apresentado pelo réu mostra depósito de R$ 380k em data controversa. Verificar consistência com demais documentos do processo.',
      'Certidão de nascimento apresentada em ação de herança. Avaliar requisitos legais, autenticidade formal e valor probatório.',
    ],
  },
  {
    id: 'ben-perito-forense-digital',
    label: 'Evidência Digital',
    icon: Monitor,
    color: '#6f42c1',
    accent: '#a78bfa',
    desc: 'Analisa capturas de tela, e-mails, mensagens, fotos e documentos digitais — autenticidade, metadados e valor probatório.',
    placeholder: 'Descreva a evidência digital: tipo (print, e-mail, WhatsApp, foto), contexto, data alegada, o que representa, suspeitas de adulteração...',
    exemplos: [
      'Print de conversa WhatsApp mostrando suposta confissão. Data exibida 15/03/2023 mas o layout do app parece ser de versão anterior a essa data.',
      'E-mail apresentado como prova de rescisão contratual. Verificar autenticidade do cabeçalho, validade como prova e como assegurar cadeia de custódia.',
      'Foto tirada em suposto acidente de trabalho. Verificar EXIF, geolocalização, data e hora para confirmar ou contestar autenticidade.',
    ],
  },
  {
    id: 'ben-perito-forense-laudo',
    label: 'Elaborar Laudo',
    icon: FileText,
    color: '#0f5132',
    accent: '#20c997',
    desc: 'Estrutura laudos periciais completos: contábil, avaliação patrimonial, danos materiais, médico-pericial e laudo para contestação.',
    placeholder: 'Informe: tipo de laudo, objeto da perícia, fatos do caso, documentos disponíveis, quesitos do juízo/partes, dados para quantificação...',
    exemplos: [
      'Laudo de danos materiais em ação de responsabilidade civil. Contrato rescindido unilateralmente. Calcular dano emergente R$ 85k e lucros cessantes 18 meses.',
      'Laudo pericial contábil em ação de apuração de haveres. Empresa avaliada: serviços, faturamento R$ 2,4M. Calcular participação do sócio excluído (25%).',
      'Laudo de avaliação patrimonial de imóvel residencial em Teresina para ação de partilha. Área 280m², bairro Jóquei, benfeitorias piscina e edícula.',
    ],
  },
  {
    id: 'ben-perito-forense-contestar',
    label: 'Contestar Laudo',
    icon: XCircle,
    color: '#dc3545',
    accent: '#ff6b6b',
    desc: 'Analisa o laudo adverso em 8 frentes: metodologia, cálculos, omissões, contradições, excesso de poder e vícios formais.',
    placeholder: 'Cole ou descreva o laudo pericial a contestar: conclusões principais, valores apurados, metodologia utilizada, quesitos respondidos...',
    exemplos: [
      'Laudo apurou lucros cessantes de R$ 1,2M usando faturamento dos últimos 12 meses como base sem ajuste sazonal. Questionar metodologia e propor recálculo.',
      'Perito calculou atualização monetária pelo IGP-M (índice de aluguel) em rescisão contratual de serviços. Contrato não prevê índice. Contestar escolha do índice.',
      'Laudo de avaliação de empresa usou apenas método patrimonial ignorando método de fluxo de caixa descontado. Empresa lucrativa com goodwill relevante.',
    ],
  },
  {
    id: 'ben-perito-forense-relatorio',
    label: 'Relatório Pericial',
    icon: BarChart3,
    color: '#0d6efd',
    accent: '#60a5fa',
    desc: 'Gera relatórios periciais consolidados: executivo para audiência, técnico para petição, síntese para sustentação oral.',
    placeholder: 'Informe o tipo de relatório e os dados: objetivo (audiência/petição/cliente), fatos, achados da perícia, valor em disputa, tese a sustentar...',
    exemplos: [
      'Relatório executivo para audiência de instrução: síntese dos 3 pontos técnicos favoráveis ao autor e 2 perguntas para o perito oficial.',
      'Relatório de danos quantificados para incluir em petição inicial. Acidente de veículo: dano material veículo R$ 42k, dano moral, lucros cessantes 3 meses.',
      'Nota técnica para o cliente explicando o laudo do perito oficial em linguagem simples e o que isso significa para o resultado da ação.',
    ],
  },
];

// ─── Componente Principal ───────────────────────────────────
export default function PeritoIA() {
  const [activeTab, setActiveTab] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [loadings, setLoadings] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<PeritoResult[]>([]);
  const [activeResult, setActiveResult] = useState<PeritoResult | null>(null);
  const [copied, setCopied] = useState(false);

  const agent = PERITO_AGENTS[activeTab];
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
          context: { modulo: 'perito-ia', subagente: agent.label },
          useSearch: [1, 3].includes(activeTab),
        }),
      });
      const data = await res.json();
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const result: PeritoResult = {
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
      const result: PeritoResult = {
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
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1250 45%, #4a0010 100%)' }}>
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 80%, #c9a84c 0%, transparent 30%), radial-gradient(circle at 90% 10%, #7c3aed 0%, transparent 30%), radial-gradient(circle at 50% 50%, #dc3545 0%, transparent 20%)' }} />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl relative"
              style={{ background: 'linear-gradient(135deg, #dc3545, #6f42c1)', boxShadow: '0 0 40px rgba(220,53,69,0.4)' }}>
              <Microscope size={30} className="text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                <Fingerprint size={11} className="text-yellow-900" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">Dr. Ben Perito IA</h1>
                <span className="text-xs bg-red-400/20 text-red-200 border border-red-400/30 px-2 py-0.5 rounded-full font-bold">NOVO</span>
                <span className="text-xs bg-purple-400/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full">LAB. FORENSE</span>
              </div>
              <p className="text-purple-200 text-sm max-w-2xl">
                Laboratório Pericial Digital de alta performance — análise forense de documentos e evidências digitais, elaboração de laudos, contestação técnica e relatórios periciais.
              </p>
              <div className="flex items-center gap-5 mt-3">
                {[
                  { icon: Microscope, label: '5 módulos periciais' },
                  { icon: Shield, label: 'CPC arts. 156-184' },
                  { icon: Eye, label: 'Análise em 7 camadas' },
                  { icon: Brain, label: 'GPT-4o + Claude' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-xs text-purple-200">
                    <s.icon size={11} className="text-red-400" />{s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-1.5 bg-red-400/20 border border-red-400/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-300 text-xs font-bold">Laboratório Online</span>
            </div>
            <div className="text-xs text-slate-400">25 agentes · Ben Juris Center v5.0</div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-2">
        {PERITO_AGENTS.map((a, i) => {
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

            {/* Mode badge for digital evidence */}
            {activeTab === 1 && (
              <div className="mb-3 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                <Camera size={13} className="text-purple-600 flex-shrink-0" />
                <p className="text-xs text-purple-700">
                  <strong>Dica:</strong> Para análise de imagens reais, obtenha ata notarial (art. 7º Lei 8.935/94) para garantir cadeia de custódia válida judicialmente.
                </p>
              </div>
            )}

            {activeTab === 3 && (
              <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  <strong>Contestação:</strong> Cole as conclusões e metodologia do laudo adverso para análise em 8 frentes técnicas.
                </p>
              </div>
            )}

            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5 block">
              Dados para Análise Pericial
            </label>
            <textarea
              value={currentInput}
              onChange={e => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))}
              placeholder={agent.placeholder}
              rows={7}
              className="w-full text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-400 focus:bg-white resize-none transition-all"
            />

            <button
              onClick={handleRun}
              disabled={isLoading || !currentInput.trim()}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` }}>
              {isLoading
                ? <><RefreshCw size={15} className="animate-spin" /> Analisando no Laboratório...</>
                : <><Send size={15} /> Analisar com Dr. Ben Perito</>
              }
            </button>
          </div>

          {/* Exemplos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={13} style={{ color: agent.accent }} />
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Casos Práticos</span>
            </div>
            <div className="space-y-2">
              {agent.exemplos.map((ex, i) => (
                <button key={i}
                  onClick={() => setInputs(prev => ({ ...prev, [activeTab]: ex }))}
                  className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 transition-all group">
                  <div className="flex items-start gap-2">
                    <ChevronRight size={11} className="mt-0.5 text-slate-400 group-hover:text-purple-500 flex-shrink-0 transition-colors" />
                    <span className="line-clamp-2">{ex}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Análises', value: tabResults.length, icon: Microscope },
              { label: 'Módulo', value: agent.label.split(' ')[0], icon: FlaskConical },
              { label: 'Modelo', value: tabResults[0]?.model?.split('-')[0] || 'Claude', icon: Brain },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                <s.icon size={14} className="mx-auto mb-1" style={{ color: agent.color }} />
                <div className="font-black text-slate-800 text-sm">{s.value}</div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Results */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${agent.color}08, white)` }}>
              <div className="flex items-center gap-2">
                <agent.icon size={15} style={{ color: agent.color }} />
                <span className="font-black text-slate-700 text-sm">Análise Pericial — {agent.label}</span>
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
                      a.download = `perito-ia-${agent.id}-${Date.now()}.txt`;
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
                    <Microscope size={24} style={{ color: agent.color }} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-700 text-sm mb-1">Laboratório Pericial Digital ativo...</div>
                    <div className="text-xs text-slate-400">Aplicando protocolo de análise em múltiplas camadas</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: agent.color, animationDelay: `${i * 120}ms` }} />
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
                    <Microscope size={26} style={{ color: agent.color }} />
                  </div>
                  <div>
                    <div className="font-black text-slate-700">Laboratório Pronto</div>
                    <div className="text-sm text-slate-400 mt-1">Descreva o material para análise pericial</div>
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
                      ? 'border-purple-300 bg-purple-50'
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
          <Layers size={14} className="text-red-600" />
          Capacidades do Dr. Ben Perito IA — Laboratório Forense Digital
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {[
            { icon: '🔬', title: 'Análise Documental', items: ['7 camadas de análise', 'Contratos, certidões', 'Extratos bancários', 'Prontuários médicos'] },
            { icon: '💻', title: 'Forense Digital', items: ['Metadados EXIF', 'WhatsApp/e-mail', 'Ata notarial', 'Cadeia de custódia'] },
            { icon: '📝', title: 'Laudos Periciais', items: ['Contábil (apuração)', 'Patrimonial/avaliac.', 'Danos materiais', 'Médico-pericial'] },
            { icon: '⚔️', title: 'Contestação', items: ['8 frentes técnicas', 'Erros de cálculo', 'Falhas metodológicas', 'Quesitos suplementares'] },
            { icon: '📊', title: 'Relatórios', items: ['Executivo audiência', 'Técnico petição', 'Sustentação oral', 'Nota ao cliente'] },
          ].map(cap => (
            <div key={cap.title} className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <div className="text-2xl mb-2">{cap.icon}</div>
              <div className="font-black text-slate-700 text-xs mb-2">{cap.title}</div>
              <ul className="space-y-1">
                {cap.items.map(item => (
                  <li key={item} className="text-xs text-slate-500 flex items-start gap-1">
                    <span className="text-red-500 mt-0.5">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── DISCLAIMER ─────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <strong className="font-black">Aviso Legal — Laboratório Pericial Digital:</strong> As análises geradas pelo Dr. Ben Perito IA são instrumentos de apoio técnico ao advogado. Não substituem laudo pericial oficial subscrito por perito judicial habilitado (CPC/2015 arts. 156-158), nem laudo de assistente técnico com registro profissional (CRC, CREA, CRM, CFP). Para uso processual, submeta ao perito responsável para validação, adaptação e assinatura. Produzido por: Mauro Monção Advogados Associados — Teresina, PI.
        </div>
      </div>
    </div>
  );
}
