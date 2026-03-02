import React, { useState, useEffect } from 'react';
import {
  Link2, ArrowRight, ArrowLeft, TrendingUp, DollarSign,
  Users, CheckCircle, Zap, Activity, Scale, RefreshCw,
  ExternalLink, Bell, ArrowLeftRight, FileText, AlertCircle, Send
} from 'lucide-react';
import {
  MOCK_CROSS_EVENTS, MOCK_LEADS_PIPELINE, MOCK_SINAIS_JURIS,
  BEN_MODULES, getCorEventType, getLabelEventType,
  calcularTaxaConversaoJuris, getEventosPendentes,
  listarEventosBridge, sincronizarComGrowth,
  notificarContratoAssinado, notificarAlertaPrazo,
  type CrossModuleEvent
} from '../lib/crossModuleIntegration';

// ─── Card de evento cruzado ──────────────────────────────────
function EventoCard({ evento }: { evento: CrossModuleEvent }) {
  const isGrowthOrigem = evento.origem === 'growth';
  const corClasse = getCorEventType(evento.tipo);
  const label = getLabelEventType(evento.tipo);
  return (
    <div className={`rounded-xl border p-4 ${corClasse} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">{label}</span>
            {evento.status === 'pendente' && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">Pendente</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs opacity-70 mb-2">
            <span className={`font-semibold ${isGrowthOrigem ? 'text-green-400' : 'text-blue-400'}`}>
              {isGrowthOrigem ? '🟢 Growth Center' : '🔵 Juris Center'}
            </span>
            <ArrowRight className="w-3 h-3" />
            <span className={`font-semibold ${!isGrowthOrigem ? 'text-green-400' : 'text-blue-400'}`}>
              {!isGrowthOrigem ? '🟢 Growth Center' : '🔵 Juris Center'}
            </span>
          </div>
          {evento.agenteOrigem && (
            <p className="text-xs opacity-60 mb-2">
              Agente: <span className="font-medium">{evento.agenteOrigem}</span>
            </p>
          )}
          <div className="bg-black/20 rounded-lg p-2 text-xs opacity-80 space-y-0.5">
            {Object.entries(evento.payload).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="opacity-60 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right text-xs opacity-50 whitespace-nowrap">{evento.timestamp}</div>
      </div>
    </div>
  );
}

export default function IntegracaoComercial() {
  const [abaAtiva, setAbaAtiva] = useState<'fluxo' | 'leads' | 'processos'>('fluxo');
  const [sincronizando, setSincronizando] = useState(false);
  const [eventos, setEventos] = useState<CrossModuleEvent[]>(MOCK_CROSS_EVENTS);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const pendentes = eventos.filter(e => e.status === 'pendente');
  const taxaConversao = calcularTaxaConversaoJuris();

  useEffect(() => {
    listarEventosBridge().then(evts => { if (evts?.length) setEventos(evts); });
  }, []);

  const handleSync = async () => {
    setSincronizando(true);
    setMensagemStatus('');
    try {
      const result = await sincronizarComGrowth();
      setMensagemStatus(result.mensagem);
      const evts = await listarEventosBridge();
      if (evts?.length) setEventos(evts);
    } catch {
      setMensagemStatus('Erro ao sincronizar');
    } finally {
      setSincronizando(false);
      setTimeout(() => setMensagemStatus(''), 4000);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#0f2044' }}>
            <ArrowLeftRight size={24} className="text-blue-400" />
            Integração Comercial — Ben Growth Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Sincronização bidirecional: Módulo 01 (Comercial) ↔ Módulo 02 (Jurídico)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendentes.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
              <Bell size={14} className="text-red-500" />
              <span className="text-red-600 text-xs font-semibold">{pendentes.length} pendente(s)</span>
            </div>
          )}
          <button
            onClick={handleSync}
            disabled={sincronizando}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#0f2044' }}
          >
            <RefreshCw size={15} className={sincronizando ? 'animate-spin' : ''} />
            {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <a
            href={BEN_MODULES.GROWTH.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-green-500/40 text-green-600 bg-green-50 hover:bg-green-100 transition-all"
          >
            <ExternalLink size={15} />
            Abrir Growth Center
          </a>
        </div>
      </div>

      {/* Status da integração */}
      <div className="bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-blue-500/30 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp size={18} className="text-green-400" />
              <span className="text-base font-bold text-white">Ben Growth Center</span>
            </div>
            <div className="text-xs text-slate-400">Módulo 01 — Inteligência Comercial</div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-green-500 to-blue-500" />
            <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30 font-medium">
              <Activity size={12} className="animate-pulse" /> API Ativa
            </div>
            <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Scale size={18} className="text-blue-400" />
              <span className="text-base font-bold text-white">Ben Juris Center</span>
            </div>
            <div className="text-xs text-slate-400">Módulo 02 — Gestão Jurídica</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Leads Sincronizados', value: '48', icon: Users, cor: 'text-emerald-400' },
            { label: 'Taxa Growth→Juris', value: `${taxaConversao}%`, icon: CheckCircle, cor: 'text-blue-400' },
            { label: 'Receita via CRM', value: 'R$ 156K', icon: DollarSign, cor: 'text-amber-400' },
            { label: 'Eventos Pendentes', value: String(pendentes.length), icon: AlertCircle, cor: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
              <s.icon size={18} className={`${s.cor} mx-auto mb-1`} />
              <div className={`text-xl font-bold ${s.cor}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-slate-200">
        {([
          { id: 'fluxo',     label: '⚡ Fluxo de Eventos',  count: MOCK_CROSS_EVENTS.length },
          { id: 'leads',     label: '🎯 Leads do Growth',    count: MOCK_LEADS_PIPELINE.length },
          { id: 'processos', label: '⚖️ Processos Ativos',   count: MOCK_SINAIS_JURIS.length },
        ] as const).map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              abaAtiva === aba.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {aba.label}
            <span className="ml-2 text-xs bg-slate-100 rounded-full px-2 py-0.5 text-slate-500">{aba.count}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {abaAtiva === 'fluxo' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">Eventos trocados em tempo real entre Growth Center e Juris Center</p>
          {MOCK_CROSS_EVENTS.map(evt => (
            <EventoCard key={evt.id} evento={evt} />
          ))}
        </div>
      )}

      {abaAtiva === 'leads' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">Leads capturados pelo Dr. Ben Atendimento (Growth) e seu status jurídico</p>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" />
              <span className="font-semibold text-slate-800 text-sm">Pipeline de Leads — Ben Growth Center</span>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  {['Cliente/Lead', 'Área', 'Score IA', 'Valor', 'Origem', 'Status Juris', 'Agente'].map(h => (
                    <th key={h} className="px-4 py-2 text-xs font-semibold text-slate-500 text-left bg-slate-50 border-b border-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LEADS_PIPELINE.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{l.nome}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{l.areaJuridica}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${l.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{l.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-amber-600">
                      R$ {l.valorEstimado.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{l.origem}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs rounded-full px-2.5 py-1 font-medium border ${
                        l.statusJuris === 'cliente_ativo'   ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        l.statusJuris === 'processo_aberto' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        l.statusJuris === 'triagem'         ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {l.statusJuris === 'cliente_ativo'   ? '✅ Cliente Ativo' :
                         l.statusJuris === 'processo_aberto' ? '⚖️ Processo Aberto' :
                         l.statusJuris === 'triagem'         ? '🔍 Triagem' : '⏳ Aguardando'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{l.agenteCaptou}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {abaAtiva === 'processos' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">Processos ativos no Juris Center com indicadores para o Growth</p>
          {MOCK_SINAIS_JURIS.map(sinal => (
            <div key={sinal.processoNumero} className="bg-white border border-blue-100 rounded-xl p-4 hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={16} className="text-blue-500 flex-shrink-0" />
                    <p className="font-bold text-slate-800">{sinal.cliente}</p>
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5">{sinal.area}</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">Processo: {sinal.processoNumero}</p>
                  <p className="text-slate-600 text-sm mb-2">📌 {sinal.fase}</p>
                  {sinal.campanhaRelacionada && (
                    <div className="flex items-center gap-1.5 text-xs text-purple-600">
                      <Zap size={12} />
                      Campanha Growth: <span className="font-semibold">{sinal.campanhaRelacionada}</span>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-slate-400 text-xs">Honorário Total</p>
                    <p className="font-bold text-amber-600">R$ {sinal.honorarioTotal.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Pago</p>
                    <p className="font-semibold text-emerald-600">R$ {sinal.honorarioPago.toLocaleString('pt-BR')}</p>
                  </div>
                  {sinal.proximoPrazo && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                      <p className="text-red-600 text-xs font-semibold">⏰ Prazo: {sinal.proximoPrazo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
