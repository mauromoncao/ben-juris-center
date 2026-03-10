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
    <div className="min-h-screen" style={{ background: '#FFFFFF', color: '#222222' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-200" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
              style={{ border: '2px solid rgba(222,192,120,0.50)', boxShadow: '0 0 18px rgba(222,192,120,0.30)' }}>
              <img src="/ben-logo.png" alt="BEN Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#19385C' }}>
                BEN SUPER AGENTE JURÍDICO
                <span className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(25,56,92,0.08)', color: '#19385C', borderColor: 'rgba(25,56,92,0.25)' }}>
                  Claude Opus 4.6
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(222,192,120,0.15)', color: '#b8860b', borderColor: 'rgba(222,192,120,0.45)' }}>
                  PREMIUM
                </span>
              </h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Super Agente Jurídico de Alta Performance — Todas as Áreas do Direito
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold" style={{ color: '#19385C' }}>{stats.totalPecas}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>Peças geradas</div>
            </div>
            <div className="text-center">
              <div className="font-bold" style={{ color: '#00b37e' }}>{stats.tempoMedio ? `${(stats.tempoMedio/1000).toFixed(0)}s` : '—'}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>Tempo médio</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xs" style={{ color: '#19385C' }}>{stats.modeloUsado}</div>
              <div className="text-xs" style={{ color: '#6B7280' }}>Modelo ativo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Arquitetura */}
          <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#19385C' }}>
              <Brain className="w-4 h-4" style={{ color: '#19385C' }} /> Arquitetura
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ background: 'rgba(25,56,92,0.06)', borderColor: 'rgba(25,56,92,0.18)' }}>
                <Zap className="w-3 h-3" style={{ color: '#19385C' }} />
                <div>
                  <div className="font-medium" style={{ color: '#19385C' }}>Claude Opus 4.6</div>
                  <div style={{ color: '#6B7280' }}>Raciocínio Adaptativo</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ background: 'rgba(8,145,178,0.06)', borderColor: 'rgba(8,145,178,0.20)' }}>
                <Shield className="w-3 h-3" style={{ color: '#0891b2' }} />
                <div>
                  <div className="font-medium" style={{ color: '#0e5c7a' }}>Claude Sonnet 4.6</div>
                  <div style={{ color: '#6B7280' }}>Fallback automático</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg border"
                style={{ background: 'rgba(0,179,126,0.06)', borderColor: 'rgba(0,179,126,0.20)' }}>
                <Search className="w-3 h-3" style={{ color: '#00b37e' }} />
                <div>
                  <div className="font-medium" style={{ color: '#00664a' }}>Perplexity</div>
                  <div style={{ color: '#6B7280' }}>Jurisprudência em tempo real</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metodologia */}
          <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#DEC078' }}>
              <Target className="w-4 h-4" style={{ color: '#DEC078' }} /> Metodologia (5 Etapas)
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { n: '1', t: 'Problema Jurídico', d: 'Identificação e questões acessórias' },
                { n: '2', t: 'Enquadramento', d: 'CF/88, legislação, normativa infralegal' },
                { n: '3', t: 'Tese Jurídica', d: 'Principal + subsidiárias + distinguishing' },
                { n: '4', t: 'Jurisprudência', d: 'STF/STJ — NUNCA inventada' },
                { n: '5', t: 'Peça Estruturada', d: 'Pronta para protocolo após revisão' },
              ].map(e => (
                <div key={e.n} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold"
                    style={{ background: 'rgba(222,192,120,0.18)', color: '#b8860b', border: '1px solid rgba(222,192,120,0.40)' }}>{e.n}</span>
                  <div>
                    <div className="font-medium" style={{ color: '#222222' }}>{e.t}</div>
                    <div style={{ color: '#6B7280' }}>{e.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Áreas */}
          <div className="rounded-xl p-4 border border-slate-200" style={{ background: '#FFFFFF' }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#00b37e' }}>
              <Scale className="w-4 h-4" style={{ color: '#00b37e' }} /> Áreas de Atuação
            </h3>
            <div className="flex flex-wrap gap-1 text-xs">
              {['Tributário', 'Previdenciário', 'Trabalhista', 'Administrativo', 'Médico', 'Constitucional', 'Civil', 'Empresarial', 'Compliance', 'Penal', 'Ambiental', 'Qualquer área'].map(a => (
                <span key={a} className="px-2 py-0.5 rounded-md border"
                  style={{ background: 'rgba(25,56,92,0.06)', color: '#19385C', borderColor: 'rgba(25,56,92,0.18)' }}>{a}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Chat ─────────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Casos Preset */}
          {showPresets && messages.length === 0 && (
            <div className="rounded-xl p-5 border border-slate-200" style={{ background: '#FFFFFF' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#19385C' }}>
                  <BookOpen className="w-4 h-4" style={{ color: '#DEC078' }} />
                  Casos de Exemplo — Clique para usar
                </h3>
                <button
                  onClick={() => setShowPresets(false)}
                  className="text-xs" style={{ color: '#6B7280' }}
                >
                  Ocultar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CASOS_PRESET.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePreset(preset)}
                    className="text-left p-3 rounded-lg border transition-all hover:shadow-sm"
                    style={selectedPreset === preset.id
                      ? { background: 'rgba(25,56,92,0.08)', borderColor: 'rgba(25,56,92,0.35)' }
                      : { background: '#F9FAFB', borderColor: '#E5E7EB' }
                    }
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-medium" style={{ color: '#222222' }}>{preset.titulo}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={preset.complexidade === 'maxima'
                          ? { background: 'rgba(220,38,38,0.10)', color: '#b91c1c' }
                          : { background: 'rgba(222,192,120,0.18)', color: '#b8860b' }
                        }>
                        {preset.complexidade === 'maxima' ? '🔴 Máxima' : '🟡 Alta'}
                      </span>
                    </div>
                    <div className="text-xs mb-2" style={{ color: '#6B7280' }}>{preset.descricao}</div>
                    <div className="text-xs font-medium" style={{ color: '#19385C' }}>{preset.area}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="rounded-xl border border-slate-200 flex flex-col" style={{ minHeight: '400px', maxHeight: '600px', background: '#FFFFFF' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                <MessageSquare className="w-4 h-4" style={{ color: '#19385C' }} />
                <span>{messages.length === 0 ? 'Aguardando solicitação...' : `${Math.ceil(messages.length / 2)} interação(ões)`}</span>
              </div>
              {messages.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
                      if (lastAssistant) handleCopy(lastAssistant.content);
                    }}
                    className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}
                  >
                    {copied ? <CheckCircle className="w-3 h-3" style={{ color: '#00b37e' }} /> : <Copy className="w-3 h-3" />}
                    Copiar última
                  </button>
                  <button onClick={handleClear} className="text-xs flex items-center gap-1"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
                    <RefreshCw className="w-3 h-3" /> Nova sessão
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <div className="text-sm mb-1 font-semibold" style={{ color: '#19385C' }}>BEN SUPER AGENTE JURÍDICO pronto</div>
                  <div className="text-xs max-w-sm" style={{ color: '#6B7280' }}>
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
                          className="text-xs flex items-center gap-1" style={{ color: '#6B7280' }}
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
                        {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#DEC078', animationDelay: `${i*150}ms` }} />)}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>Opus 4.6 analisando o caso...</span>
                    </div>
                    <div className="mt-2 text-xs space-y-1" style={{ color: '#9CA3AF' }}>
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
            <div className="p-4 border-t border-slate-200">
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
                    className="w-full rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
                    style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', color: '#222222' }}
                    disabled={loading}
                  />
                  <div className="absolute bottom-2 right-2 text-xs" style={{ color: '#9CA3AF' }}>{input.length} chars</div>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 self-stretch font-medium text-white disabled:opacity-50"
                  style={{ background: '#19385C' }}
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="text-xs">Enviar</span>
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#9CA3AF' }}>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: '#DEC078' }} />
                  Claude Opus 4.6 com raciocínio adaptativo
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" style={{ color: '#f59e0b' }} />
                  Peças são minutas — revisão obrigatória pelo Dr. Mauro Monção
                </span>
              </div>
            </div>
          </div>

          {/* Compliance notice */}
          <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(222,192,120,0.08)', border: '1px solid rgba(222,192,120,0.35)', color: '#8a6800' }}>
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
