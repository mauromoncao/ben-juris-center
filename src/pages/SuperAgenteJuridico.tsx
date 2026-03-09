import React, { useState, useRef, useEffect } from 'react';
import {
  Zap, Send, RefreshCw, Copy, CheckCircle, Scale, Shield, BookOpen,
  FileText, Clock, Star, ChevronDown, ChevronRight, AlertTriangle,
  Target, Brain, Sparkles, ArrowRight, Activity, MessageSquare,
  Download, BarChart3, Search, Gavel, TrendingUp, Eye
} from 'lucide-react';
import { DR_BEN_AGENTS } from '../lib/aiAgents';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; model?: string; elapsed?: number; }
interface CasoPreset { id: string; titulo: string; categoria: string; descricao: string; prompt: string; area: string; complexidade: 'alta' | 'maxima'; }

// ─── Casos pré-configurados ────────────────────────────────────────────────────
const CASOS_PRESET: CasoPreset[] = [
  {
    id: 'ms-tributario',
    titulo: 'Mandado de Segurança Tributário',
    categoria: 'Direito Tributário',
    descricao: 'MS contra cobrança de ICMS em operações interestaduais — Reforma Tributária',
    area: '⚖️ Tributário',
    complexidade: 'maxima',
    prompt: `Elabore uma petição completa de Mandado de Segurança contra ato coator do Secretário da Fazenda Estadual que exige o recolhimento de ICMS-Difal em operações de venda interestadual a consumidor final não contribuinte do imposto.

DADOS:
- Impetrante: Empresa XYZ Ltda (e-commerce, regime Lucro Presumido)
- Impetrado: Secretário de Fazenda do Estado do Piauí
- Valor em disputa: R$ 1.200.000,00 (últimos 5 anos)
- Fundamento: ADC 49 (STF), EC 87/2015, inconstitucionalidade da cobrança
- Requerer: tutela de urgência suspendendo a cobrança, mérito: anulação dos créditos

Incluir todos os elementos: endereçamento, qualificação, fatos, direito (constitucional + tributário + jurisprudência STF), pedidos, valor da causa.`,
  },
  {
    id: 'revisao-vida-toda',
    titulo: 'Revisão da Vida Toda — Previdenciário',
    categoria: 'Direito Previdenciário',
    descricao: 'Ação de revisão de aposentadoria — Tema 1.102 STJ',
    area: '🏥 Previdenciário',
    complexidade: 'alta',
    prompt: `Elabore petição inicial de ação previdenciária para revisão de aposentadoria por tempo de contribuição com base no Tema 1.102 do STJ (Revisão da Vida Toda).

DADOS DO CLIENTE:
- Segurado: João da Silva, nascido em 15/03/1952, CPF: XXX.XXX.XXX-XX
- Data da aposentadoria: outubro de 1998 (antes da Lei 9.876/99)
- Contribuições anteriores a julho/1994: 18 anos de altas contribuições como profissional liberal
- RMI atual: R$ 1.500,00 (salário mínimo)
- Benefício correto estimado: R$ 4.200,00 (com inclusão de salários de contribuição anteriores)
- Réu: INSS (Instituto Nacional do Seguro Social)

Incluir: análise do Tema 1.102, divergência entre tese fixada e caso concreto, pedidos de revisão + diferenças em atraso + juros e correção.`,
  },
  {
    id: 'reclamacao-trabalhista',
    titulo: 'Reclamatória Trabalhista Complexa',
    categoria: 'Direito do Trabalho',
    descricao: 'Reconhecimento de vínculo + verbas rescisórias pós-Reforma',
    area: '👷 Trabalhista',
    complexidade: 'alta',
    prompt: `Elabore reclamatória trabalhista para reconhecimento de vínculo empregatício de motorista de aplicativo (Uber) e condenação nas verbas rescisórias.

DADOS:
- Reclamante: Carlos Pereira, CPF: XXX, prestou serviços para Uber de jan/2019 a dez/2023 (5 anos)
- Reclamada: Uber do Brasil Tecnologia Ltda
- Jornada: 8-12h diárias, 6 dias/semana
- Remuneração média: R$ 4.500/mês
- Pedidos: reconhecimento de vínculo, FGTS+40%, 13º salário, férias+1/3, horas extras, adicional noturno
- Aplicar corretamente a Reforma Trabalhista (Lei 13.467/17) e jurisprudência TST/STJ sobre economia de plataforma

Analisar a questão da subordinação tecnológica vs. autônomo e construir tese robusta.`,
  },
  {
    id: 'impugnacao-licitacao',
    titulo: 'Impugnação a Edital de Licitação',
    categoria: 'Direito Administrativo',
    descricao: 'Impugnação com base na Lei 14.133/2021',
    area: '🏛️ Administrativo',
    complexidade: 'alta',
    prompt: `Elabore impugnação ao edital de licitação Pregão Eletrônico nº 001/2026 da Prefeitura Municipal de Parnaíba/PI.

IRREGULARIDADES IDENTIFICADAS:
1. Especificação técnica de marca específica (art. 40, § 1º, Lei 14.133/21)
2. Prazo mínimo de experiência anterior (5 anos) que restringe competitividade (art. 67, §§ 1º-3º)
3. Capital social mínimo de R$ 500.000 desproporcional ao objeto (R$ 150.000)
4. Habilitação técnica exigindo certidão de órgão de classe sem previsão legal

Fundamentar em: Lei 14.133/2021, Lei 12.846/2013 (anticorrupção), CF/88 art. 37, jurisprudência TCU.
Requerer anulação das cláusulas ilegais ou anulação total com nova publicação.`,
  },
  {
    id: 'compliance-lgpd',
    titulo: 'Defesa em Processo Administrativo ANPD',
    categoria: 'Compliance & LGPD',
    descricao: 'Defesa administrativa em processo sancionador LGPD',
    area: '🔒 Compliance',
    complexidade: 'maxima',
    prompt: `Elabore defesa administrativa no processo sancionador instaurado pela ANPD contra empresa de saúde por suposto vazamento de dados sensíveis (prontuários médicos de 50.000 pacientes).

FATOS:
- Incidente ocorrido em novembro/2025: acesso não autorizado por ransomware
- Empresa notificou ANPD em 72h (art. 48 LGPD)
- Dados vazados: nome, CPF e diagnósticos médicos (dados sensíveis art. 11 LGPD)
- Empresa possui DPO nomeado e programa de compliance LGPD implementado
- ANPD autuou por violação dos arts. 6º, 46 e 48 da LGPD
- Multa pretendida: R$ 2.000.000 (2% faturamento)

Argumentar: diligência da empresa, notificação tempestiva, medidas corretivas, proporcionalidade da sanção, mitigação conforme art. 52 LGPD.`,
  },
  {
    id: 'direito-medico',
    titulo: 'Ação de Responsabilidade Médica',
    categoria: 'Direito Médico',
    descricao: 'Indenização por erro médico — dano estético e moral',
    area: '🏥 Médico',
    complexidade: 'alta',
    prompt: `Elabore petição inicial de ação indenizatória por erro médico em cirurgia plástica.

FATOS:
- Autora: Maria Santos, 35 anos
- Réus: Dr. Carlos Médico (CRM/PI 12345) e Clínica Beleza Total Ltda
- Procedimento: rinoplastia em março/2025
- Complicações: infecção hospitalar grave, necessidade de 3 cirurgias corretivas, resultado estético desfavorável
- Período de afastamento: 8 meses
- Danos: estético (deformação nasal visível), moral (depressão diagnosticada), material (custos médicos R$ 85.000 + lucros cessantes R$ 120.000)
- Laudo pericial médico: nexo causal confirmado — erro técnico na técnica cirúrgica

Fundamentar: CC art. 927, CDC (responsabilidade objetiva da clínica), responsabilidade subjetiva do médico, jurisprudência STJ sobre dano estético autônomo (Súmula 387 STJ), parâmetros de quantum indenizatório.`,
  },
];

// ─── Componente Principal ────────────────────────────────────────────────────
export default function SuperAgenteJuridico() {
  const agent = DR_BEN_AGENTS['ben-super-agente-juridico'];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(true);
  const [stats, setStats] = useState({ totalPecas: 0, tempoMedio: 0, modeloUsado: 'claude-opus-4-5' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customInput?: string) => {
    const msg = customInput || input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowPresets(false);

    const start = Date.now();
    try {
      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'ben-super-agente-juridico',
          input: msg,
          context: { urgente: false },
          useSearch: true,
        }),
      });

      const data = await response.json();
      const elapsed = Date.now() - start;

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.success ? data.output : `❌ Erro: ${data.error || 'Falha no processamento'}`,
        timestamp: new Date(),
        model: data.modelUsed || 'claude-opus-4-5',
        elapsed,
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (data.success) {
        setStats(prev => ({
          totalPecas: prev.totalPecas + 1,
          tempoMedio: Math.round((prev.tempoMedio * prev.totalPecas + elapsed) / (prev.totalPecas + 1)),
          modeloUsado: data.modelUsed || prev.modeloUsado,
        }));
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Erro de conexão. Verifique as configurações da API.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (preset: CasoPreset) => {
    setSelectedPreset(preset.id);
    setInput(preset.prompt);
    textareaRef.current?.focus();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setShowPresets(true);
    setSelectedPreset(null);
  };

  const formatTime = (ms?: number) => ms ? `${(ms / 1000).toFixed(1)}s` : '';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-purple-500/20 bg-gray-900/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                BEN SUPER AGENTE JURÍDICO
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Claude Opus 4.6
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  PREMIUM
                </span>
              </h1>
              <p className="text-sm text-gray-400">
                Super Agente Jurídico de Alta Performance — Todas as Áreas do Direito
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-purple-400 font-bold">{stats.totalPecas}</div>
              <div className="text-gray-500 text-xs">Peças geradas</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold">{stats.tempoMedio ? `${(stats.tempoMedio/1000).toFixed(0)}s` : '—'}</div>
              <div className="text-gray-500 text-xs">Tempo médio</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-xs">{stats.modeloUsado}</div>
              <div className="text-gray-500 text-xs">Modelo ativo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Arquitetura */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> Arquitetura
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Zap className="w-3 h-3 text-purple-400" />
                <div>
                  <div className="text-purple-300 font-medium">Claude Opus 4.6</div>
                  <div className="text-gray-500">Raciocínio Adaptativo</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Shield className="w-3 h-3 text-blue-400" />
                <div>
                  <div className="text-blue-300 font-medium">Claude Sonnet 4.6</div>
                  <div className="text-gray-500">Fallback automático</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                <Search className="w-3 h-3 text-green-400" />
                <div>
                  <div className="text-green-300 font-medium">Perplexity</div>
                  <div className="text-gray-500">Jurisprudência em tempo real</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metodologia */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Metodologia (5 Etapas)
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              {[
                { n: '1', t: 'Problema Jurídico', d: 'Identificação e questões acessórias' },
                { n: '2', t: 'Enquadramento', d: 'CF/88, legislação, normativa infralegal' },
                { n: '3', t: 'Tese Jurídica', d: 'Principal + subsidiárias + distinguishing' },
                { n: '4', t: 'Jurisprudência', d: 'STF/STJ — NUNCA inventada' },
                { n: '5', t: 'Peça Estruturada', d: 'Pronta para protocolo após revisão' },
              ].map(e => (
                <div key={e.n} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center flex-shrink-0">{e.n}</span>
                  <div>
                    <div className="text-white font-medium">{e.t}</div>
                    <div className="text-gray-600">{e.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Áreas */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4" /> Áreas de Atuação
            </h3>
            <div className="flex flex-wrap gap-1 text-xs">
              {['Tributário', 'Previdenciário', 'Trabalhista', 'Administrativo', 'Médico', 'Constitucional', 'Civil', 'Empresarial', 'Compliance', 'Penal', 'Ambiental', 'Qualquer área'].map(a => (
                <span key={a} className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded-md border border-gray-700">{a}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Chat ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Casos Preset */}
          {showPresets && messages.length === 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Casos de Exemplo — Clique para usar
                </h3>
                <button
                  onClick={() => setShowPresets(false)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Ocultar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CASOS_PRESET.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePreset(preset)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedPreset === preset.id
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-800 hover:border-purple-500/30 hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-white">{preset.titulo}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        preset.complexidade === 'maxima'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {preset.complexidade === 'maxima' ? '🔴 Máxima' : '🟡 Alta'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">{preset.descricao}</div>
                    <div className="text-xs text-purple-400">{preset.area}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col" style={{ minHeight: '400px', maxHeight: '600px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>{messages.length === 0 ? 'Aguardando solicitação...' : `${Math.ceil(messages.length / 2)} interação(ões)`}</span>
              </div>
              {messages.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
                      if (lastAssistant) handleCopy(lastAssistant.content);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    Copiar última
                  </button>
                  <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Nova sessão
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <div className="text-gray-400 text-sm mb-1">BEN SUPER AGENTE JURÍDICO pronto</div>
                  <div className="text-gray-600 text-xs max-w-sm">
                    Descreva o caso, a peça necessária ou cole os dados do processo. O agente aplicará raciocínio jurídico profundo em 5 etapas.
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[90%] rounded-xl p-4"
                    style={msg.role === 'user'
                      ? { background: '#E9F2FF', color: '#1A1A1A', borderRadius: '18px 18px 4px 18px', lineHeight: '1.6' }
                      : { background: '#F5F5F5', color: '#222222', border: '1px solid #E5E7EB', borderRadius: '18px 18px 18px 4px', lineHeight: '1.6' }
                    }>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-2 text-xs" style={{ color: '#6B7280' }}>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          {msg.model || 'claude-opus-4-5'}
                        </span>
                        {msg.elapsed && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(msg.elapsed)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>{msg.content}</div>
                    {msg.role === 'assistant' && msg.content.length > 500 && (
                      <div className="mt-3 pt-2 flex gap-2" style={{ borderTop: '1px solid #E5E7EB' }}>
                        <button
                          onClick={() => handleCopy(msg.content)}
                          className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}
                        >
                          <Copy className="w-3 h-3" /> Copiar
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([msg.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `peca-juridica-${Date.now()}.txt`;
                            a.click();
                          }}
                          className="text-xs text-gray-500 hover:text-white flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Baixar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl p-4 max-w-sm" style={{ background: '#F5F5F5', border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-400">Opus 4.6 analisando o caso...</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Identificando problema jurídico...</div>
                      <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Construindo fundamentação...</div>
                      <div className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Verificando jurisprudência...</div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend();
                    }}
                    placeholder="Descreva o caso, a peça jurídica necessária ou faça uma pergunta... (Ctrl+Enter para enviar)"
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    disabled={loading}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-600">{input.length} chars</div>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex flex-col items-center justify-center gap-1 self-stretch"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="text-xs">Enviar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  Claude Opus 4.6 com raciocínio adaptativo
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Peças são minutas — revisão obrigatória pelo Dr. Mauro Monção
                </span>
              </div>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400/80">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-400">Aviso Legal Obrigatório:</strong> Todas as peças geradas pelo BEN Super Agente Jurídico são <strong>minutas técnicas</strong> que requerem revisão, adaptação ao caso concreto e assinatura obrigatória pelo <strong>Dr. Mauro Monção</strong> (OAB/PI 7304-A | OAB/CE 22502 | OAB/MA 29037). A IA nunca inventa jurisprudência: quando não há certeza sobre número de processo, indica [CONFERIR]. Não use peças sem revisão advocatícia.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
