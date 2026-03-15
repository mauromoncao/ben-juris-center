import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, Plus, Download, CreditCard,
  Banknote, AlertTriangle, BarChart3, RefreshCw, CheckCircle,
  Clock, XCircle, Search, User, FileText, Zap, ChevronDown, ChevronUp,
  Copy, ExternalLink,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Helper: chama api/asaas.js ─────────────────────────────
async function callAsaas(action: string, params: Record<string, any> = {}) {
  const res = await fetch((import.meta.env.VITE_FILE_PARSER_URL?.replace('/upload','') || 'https://api.mauromoncao.adv.br') + '/asaas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error || 'Erro Asaas');
  return data.data;
}

// ─── Formatadores ────────────────────────────────────────────
const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

// ─── Mapeamentos ─────────────────────────────────────────────
const statusLabel: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <Clock size={11} /> },
  RECEIVED:  { label: 'Recebido', color: 'bg-green-100 text-green-700 border-green-300',   icon: <CheckCircle size={11} /> },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle size={11} /> },
  OVERDUE:   { label: 'Vencido',  color: 'bg-red-100 text-red-700 border-red-300',         icon: <AlertTriangle size={11} /> },
  REFUNDED:  { label: 'Estornado', color: 'bg-gray-100 text-gray-600 border-gray-300',     icon: <XCircle size={11} /> },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-300',     icon: <XCircle size={11} /> },
};

const tipoLabel: Record<string, string> = {
  PIX: '💚 PIX', BOLETO: '📄 Boleto', CREDIT_CARD: '💳 Cartão', UNDEFINED: '—',
};

// ─── Modal: Nova Cobrança ────────────────────────────────────
function ModalCobranca({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    clienteNome: '', clienteCpfCnpj: '', valor: '', vencimento: '',
    tipo: 'PIX', descricao: 'Honorários advocatícios',
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState<any>(null);
  const [pixCode, setPixCode] = useState('');

  const handleSubmit = async () => {
    setErro(''); setLoading(true);
    try {
      // 1. Cria ou busca cliente
      let clienteId = '';
      const clientes = await callAsaas('listar_clientes', { cpfCnpj: form.clienteCpfCnpj });
      if (clientes?.data?.length) {
        clienteId = clientes.data[0].id;
      } else {
        const novo = await callAsaas('criar_cliente', {
          nome: form.clienteNome,
          cpfCnpj: form.clienteCpfCnpj,
        });
        clienteId = novo.id;
      }
      // 2. Cria cobrança
      const actionMap: Record<string, string> = {
        PIX: 'criar_cobranca_pix',
        BOLETO: 'criar_cobranca_boleto',
        CREDIT_CARD: 'criar_cobranca_cartao',
      };
      const cobranca = await callAsaas(actionMap[form.tipo] || 'criar_cobranca_pix', {
        clienteId,
        valor: form.valor,
        vencimento: form.vencimento,
        descricao: form.descricao,
      });
      setSucesso(cobranca);
      // 3. Se PIX, busca QR Code
      if (form.tipo === 'PIX' && cobranca?.id) {
        const qr = await callAsaas('pix_qrcode', { id: cobranca.id });
        setPixCode(qr?.payload || '');
      }
      onSaved();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg" style={{ color: '#19385C' }}>➕ Nova Cobrança</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><XCircle size={20} /></button>
        </div>
        {sucesso ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle size={20} />Cobrança criada com sucesso!
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm space-y-1">
              <div><b>ID:</b> {sucesso.id}</div>
              <div><b>Valor:</b> {brl(sucesso.value)}</div>
              <div><b>Vencimento:</b> {fmtDate(sucesso.dueDate)}</div>
              <div><b>Status:</b> {sucesso.status}</div>
              {sucesso.invoiceUrl && (
                <a href={sucesso.invoiceUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline">
                  <ExternalLink size={12} />Ver fatura
                </a>
              )}
            </div>
            {pixCode && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Código PIX (Copia e Cola):</p>
                <div className="flex gap-2">
                  <input readOnly value={pixCode} className="flex-1 text-xs border rounded p-2 bg-gray-50 font-mono" />
                  <button onClick={() => navigator.clipboard.writeText(pixCode)}
                    className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
            <button onClick={onClose} className="w-full bg-navy-mid text-white py-2 rounded-lg font-medium" style={{ background: '#19385C' }}>Fechar</button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {erro && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">{erro}</div>}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Nome do Cliente *</label>
              <input value={form.clienteNome} onChange={e => setForm(f => ({ ...f, clienteNome: e.target.value }))}
                placeholder="Nome completo" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">CPF / CNPJ *</label>
              <input value={form.clienteCpfCnpj} onChange={e => setForm(f => ({ ...f, clienteCpfCnpj: e.target.value }))}
                placeholder="000.000.000-00" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Valor (R$) *</label>
                <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                  placeholder="0,00" className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Vencimento *</label>
                <input type="date" value={form.vencimento} onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Forma de Pagamento</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="PIX">💚 PIX</option>
                <option value="BOLETO">📄 Boleto</option>
                <option value="CREDIT_CARD">💳 Cartão de Crédito</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Descrição</label>
              <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                style={{ background: '#19385C' }}>
                {loading ? 'Criando...' : 'Gerar Cobrança'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────
export default function Financeiro() {
  const [aba, setAba] = useState<'dashboard' | 'cobrancas' | 'clientes' | 'extrato'>('dashboard');
  const [resumo, setResumo] = useState<any>(null);
  const [cobrancas, setCobrancas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [extrato, setExtrato] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [configurado, setConfigurado] = useState<boolean | null>(null);
  const [modal, setModal] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [buscaCliente, setBuscaCliente] = useState('');
  const [expandido, setExpandido] = useState<string | null>(null);

  // Verifica configuração e carrega dados iniciais
  const init = useCallback(async () => {
    setLoading(true); setErro('');
    try {
      const st = await callAsaas('status');
      setConfigurado(st.configurado);
      if (st.configurado) {
        const [res, cobr] = await Promise.all([
          callAsaas('resumo_financeiro'),
          callAsaas('listar_cobrancas', { limit: 20 }),
        ]);
        setResumo(res);
        setCobrancas(cobr?.data || []);
      }
    } catch (e: any) {
      setErro(e.message);
      setConfigurado(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { init(); }, [init]);

  const carregarCobrancas = async () => {
    setLoading(true);
    try {
      const data = await callAsaas('listar_cobrancas', { limit: 50, status: filtroStatus || undefined });
      setCobrancas(data?.data || []);
    } catch (e: any) { setErro(e.message); }
    finally { setLoading(false); }
  };

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const data = await callAsaas('listar_clientes', { limit: 50, nome: buscaCliente || undefined });
      setClientes(data?.data || []);
    } catch (e: any) { setErro(e.message); }
    finally { setLoading(false); }
  };

  const carregarExtrato = async () => {
    setLoading(true);
    try {
      const data = await callAsaas('extrato', { limit: 50 });
      setExtrato(data?.data || []);
    } catch (e: any) { setErro(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (aba === 'cobrancas') carregarCobrancas();
    if (aba === 'clientes') carregarClientes();
    if (aba === 'extrato') carregarExtrato();
  }, [aba]);

  // ── Banner não configurado ───────────────────────────────
  if (configurado === false) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}>
        <DollarSign size={24} className="text-green-500" />Financeiro — Asaas
      </h1>
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-yellow-700">
          <AlertTriangle size={18} />ASAAS_API_KEY não configurada
        </div>
        <p className="text-sm text-yellow-800">Para ativar o módulo financeiro real:</p>
        <ol className="text-sm text-yellow-800 list-decimal ml-5 space-y-1">
          <li>Acesse <b>app.asaas.com</b> → Conta → Integrações → Copie a API Key</li>
          <li>Vá em <b>vercel.com</b> → projeto ben-juris-center → Settings → Environment Variables</li>
          <li>Adicione: <code className="bg-yellow-100 px-1 rounded">ASAAS_API_KEY</code> = sua chave</li>
          <li>Faça <b>Redeploy</b></li>
        </ol>
        <button onClick={init} className="flex items-center gap-2 text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
          <RefreshCw size={14} />Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}>
            <DollarSign size={24} className="text-green-500" />Financeiro — Asaas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Cobranças, clientes, PIX/Boleto e extrato em tempo real</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: '#19385C' }}>
            <Plus size={14} />Gerar Cobrança
          </button>
          <button onClick={init} disabled={loading}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {erro && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{erro}</div>}

      {/* KPIs */}
      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Saldo Atual', value: brl(resumo.saldo), icon: DollarSign, color: '#19385C', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Recebido', value: brl(resumo.totalRecebido), icon: CheckCircle, color: '#16a34a', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'A Receber', value: brl(resumo.totalPendente), icon: Clock, color: '#d97706', bg: 'bg-yellow-50', border: 'border-yellow-200' },
            { label: 'Vencido', value: brl(resumo.totalVencido), icon: AlertTriangle, color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200' },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className={`${k.bg} border ${k.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: k.color }} />
                  <span className="text-xs text-slate-500">{k.label}</span>
                </div>
                <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {([['dashboard','📊 Dashboard'],['cobrancas','💰 Cobranças'],['clientes','👥 Clientes'],['extrato','📋 Extrato']] as [string,string][]).map(([id, label]) => (
          <button key={id} onClick={() => setAba(id as any)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${aba === id ? 'bg-white shadow text-navy font-semibold' : 'text-slate-500 hover:text-slate-800'}`}
            style={aba === id ? { color: '#19385C' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {aba === 'dashboard' && resumo && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Cobranças Recebidas', value: resumo.qtdRecebidas, color: '#16a34a' },
              { label: 'Cobranças Pendentes', value: resumo.qtdPendentes, color: '#d97706' },
              { label: 'Cobranças Vencidas', value: resumo.qtdVencidas, color: '#dc2626' },
            ].map(k => (
              <div key={k.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs text-slate-500 mt-1">{k.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#19385C' }}>
              <BarChart3 size={16} />Resumo Financeiro
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { label: 'Recebido', valor: resumo.totalRecebido },
                { label: 'Pendente', valor: resumo.totalPendente },
                { label: 'Vencido', valor: resumo.totalVencido },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [brl(v), 'Valor']} />
                <Bar dataKey="valor" fill="#19385C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Cobranças ── */}
      {aba === 'cobrancas' && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['', 'PENDING', 'RECEIVED', 'OVERDUE', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => { setFiltroStatus(s); }}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filtroStatus === s ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                style={filtroStatus === s ? { background: '#19385C' } : {}}>
                {s || 'Todas'} {s && statusLabel[s] ? `— ${statusLabel[s].label}` : ''}
              </button>
            ))}
            <button onClick={carregarCobrancas} className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Atualizar
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Carregando cobranças...</div>
            ) : cobrancas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma cobrança encontrada.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cobrancas.map(c => {
                  const st = statusLabel[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-600 border-gray-200', icon: null };
                  return (
                    <div key={c.id}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setExpandido(expandido === c.id ? null : c.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{c.customer?.name || c.description || 'Cobrança'}</div>
                          <div className="text-xs text-slate-400">{tipoLabel[c.billingType]} · Venc: {fmtDate(c.dueDate)}</div>
                        </div>
                        <div className="text-sm font-bold text-green-600">{brl(c.value)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                        {expandido === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                      {expandido === c.id && (
                        <div className="px-4 pb-3 bg-slate-50 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                          <div><b>ID:</b> {c.id}</div>
                          <div><b>Descrição:</b> {c.description}</div>
                          {c.invoiceUrl && (
                            <a href={c.invoiceUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline w-fit">
                              <ExternalLink size={11} />Ver fatura completa
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Clientes ── */}
      {aba === 'clientes' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && carregarClientes()}
                placeholder="Buscar por nome..." className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm" />
            </div>
            <button onClick={carregarClientes}
              className="px-4 py-2 text-white text-sm rounded-lg font-medium" style={{ background: '#19385C' }}>
              Buscar
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Carregando clientes...</div>
            ) : clientes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum cliente encontrado.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {clientes.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: '#19385C' }}>
                      {c.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.cpfCnpj} · {c.email || 'sem e-mail'}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${c.deleted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      {c.deleted ? 'Inativo' : 'Ativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Extrato ── */}
      {aba === 'extrato' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{extrato.length} transações</span>
            <button onClick={carregarExtrato}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />Atualizar
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Carregando extrato...</div>
            ) : extrato.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma transação encontrada.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {extrato.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.value >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-700 truncate">{t.description || t.type}</div>
                      <div className="text-xs text-slate-400">{fmtDate(t.date || t.dateCreated)}</div>
                    </div>
                    <div className={`text-sm font-bold ${t.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {t.value >= 0 ? '+' : ''}{brl(t.value)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova Cobrança */}
      {modal && <ModalCobranca onClose={() => setModal(false)} onSaved={() => { setModal(false); init(); }} />}
    </div>
  );
}
