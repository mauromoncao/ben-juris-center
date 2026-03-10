// ============================================================
// BEN JURIS CENTER — Asaas Financial Integration
// api/asaas.js — Produção: https://api.asaas.com
// Ações: clientes, cobranças, PIX, boleto, extrato, saldo
// ============================================================

export const config = { maxDuration: 30 };

const ASAAS_BASE = 'https://api.asaas.com/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

// ─── Helper: chamada à API Asaas ────────────────────────────
async function asaas(method, path, body = null) {
  if (!ASAAS_API_KEY) throw new Error('ASAAS_API_KEY não configurada no Vercel.');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${ASAAS_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errors?.[0]?.description || data?.message || `Asaas error ${res.status}`);
  return data;
}

// ─── Handler principal ───────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, params = {} } = req.body || {};

  try {
    switch (action) {

      // ══════════════════════════════════════════════════
      // CLIENTES
      // ══════════════════════════════════════════════════

      // Listar clientes
      case 'listar_clientes': {
        const qs = new URLSearchParams({
          limit: params.limit || 20,
          offset: params.offset || 0,
          ...(params.nome && { name: params.nome }),
          ...(params.cpfCnpj && { cpfCnpj: params.cpfCnpj }),
          ...(params.email && { email: params.email }),
        });
        const data = await asaas('GET', `/customers?${qs}`);
        return res.json({ ok: true, data });
      }

      // Criar cliente
      case 'criar_cliente': {
        if (!params.nome) return res.status(400).json({ error: 'nome obrigatório' });
        if (!params.cpfCnpj) return res.status(400).json({ error: 'cpfCnpj obrigatório' });
        const data = await asaas('POST', '/customers', {
          name: params.nome,
          cpfCnpj: params.cpfCnpj.replace(/\D/g, ''),
          email: params.email || undefined,
          phone: params.telefone || undefined,
          mobilePhone: params.celular || undefined,
          address: params.endereco || undefined,
          addressNumber: params.numero || undefined,
          complement: params.complemento || undefined,
          province: params.bairro || undefined,
          postalCode: params.cep?.replace(/\D/g, '') || undefined,
          notificationDisabled: params.notificacaoDesativada || false,
          observations: params.observacoes || undefined,
        });
        return res.json({ ok: true, data });
      }

      // Buscar cliente por ID
      case 'buscar_cliente': {
        if (!params.id) return res.status(400).json({ error: 'id obrigatório' });
        const data = await asaas('GET', `/customers/${params.id}`);
        return res.json({ ok: true, data });
      }

      // Atualizar cliente
      case 'atualizar_cliente': {
        if (!params.id) return res.status(400).json({ error: 'id obrigatório' });
        const { id, ...body } = params;
        const data = await asaas('PUT', `/customers/${id}`, body);
        return res.json({ ok: true, data });
      }

      // ══════════════════════════════════════════════════
      // COBRANÇAS
      // ══════════════════════════════════════════════════

      // Listar cobranças
      case 'listar_cobrancas': {
        const qs = new URLSearchParams({
          limit: params.limit || 20,
          offset: params.offset || 0,
          ...(params.status && { status: params.status }),
          ...(params.clienteId && { customer: params.clienteId }),
          ...(params.dataInicio && { dateCreated: params.dataInicio }),
          ...(params.dataFim && { dueDateDue: params.dataFim }),
          ...(params.tipo && { billingType: params.tipo }),
        });
        const data = await asaas('GET', `/payments?${qs}`);
        return res.json({ ok: true, data });
      }

      // Criar cobrança PIX
      case 'criar_cobranca_pix': {
        if (!params.clienteId) return res.status(400).json({ error: 'clienteId obrigatório' });
        if (!params.valor) return res.status(400).json({ error: 'valor obrigatório' });
        if (!params.vencimento) return res.status(400).json({ error: 'vencimento obrigatório (YYYY-MM-DD)' });
        const data = await asaas('POST', '/payments', {
          customer: params.clienteId,
          billingType: 'PIX',
          value: parseFloat(params.valor),
          dueDate: params.vencimento,
          description: params.descricao || 'Honorários advocatícios',
          externalReference: params.referencia || undefined,
          postalService: false,
        });
        return res.json({ ok: true, data });
      }

      // Criar cobrança Boleto
      case 'criar_cobranca_boleto': {
        if (!params.clienteId) return res.status(400).json({ error: 'clienteId obrigatório' });
        if (!params.valor) return res.status(400).json({ error: 'valor obrigatório' });
        if (!params.vencimento) return res.status(400).json({ error: 'vencimento obrigatório (YYYY-MM-DD)' });
        const data = await asaas('POST', '/payments', {
          customer: params.clienteId,
          billingType: 'BOLETO',
          value: parseFloat(params.valor),
          dueDate: params.vencimento,
          description: params.descricao || 'Honorários advocatícios',
          externalReference: params.referencia || undefined,
          fine: { value: params.multa || 2 },
          interest: { value: params.juros || 1 },
          postalService: false,
        });
        return res.json({ ok: true, data });
      }

      // Criar cobrança Cartão de Crédito
      case 'criar_cobranca_cartao': {
        if (!params.clienteId) return res.status(400).json({ error: 'clienteId obrigatório' });
        if (!params.valor) return res.status(400).json({ error: 'valor obrigatório' });
        if (!params.vencimento) return res.status(400).json({ error: 'vencimento obrigatório' });
        const data = await asaas('POST', '/payments', {
          customer: params.clienteId,
          billingType: 'CREDIT_CARD',
          value: parseFloat(params.valor),
          dueDate: params.vencimento,
          description: params.descricao || 'Honorários advocatícios',
          installmentCount: params.parcelas || 1,
          installmentValue: params.parcelas ? (parseFloat(params.valor) / params.parcelas) : undefined,
        });
        return res.json({ ok: true, data });
      }

      // Buscar cobrança por ID
      case 'buscar_cobranca': {
        if (!params.id) return res.status(400).json({ error: 'id obrigatório' });
        const data = await asaas('GET', `/payments/${params.id}`);
        return res.json({ ok: true, data });
      }

      // Cancelar cobrança
      case 'cancelar_cobranca': {
        if (!params.id) return res.status(400).json({ error: 'id obrigatório' });
        const data = await asaas('DELETE', `/payments/${params.id}`);
        return res.json({ ok: true, data });
      }

      // Obter QR Code PIX de uma cobrança
      case 'pix_qrcode': {
        if (!params.id) return res.status(400).json({ error: 'id da cobrança obrigatório' });
        const data = await asaas('GET', `/payments/${params.id}/pixQrCode`);
        return res.json({ ok: true, data });
      }

      // Obter linha digitável do boleto
      case 'boleto_linha': {
        if (!params.id) return res.status(400).json({ error: 'id da cobrança obrigatório' });
        const data = await asaas('GET', `/payments/${params.id}/identificationField`);
        return res.json({ ok: true, data });
      }

      // ══════════════════════════════════════════════════
      // COBRANÇAS RECORRENTES (ASSINATURAS)
      // ══════════════════════════════════════════════════

      // Criar assinatura/contrato recorrente
      case 'criar_assinatura': {
        if (!params.clienteId) return res.status(400).json({ error: 'clienteId obrigatório' });
        if (!params.valor) return res.status(400).json({ error: 'valor obrigatório' });
        if (!params.ciclo) return res.status(400).json({ error: 'ciclo obrigatório (MONTHLY, WEEKLY, YEARLY)' });
        if (!params.vencimento) return res.status(400).json({ error: 'vencimento obrigatório (YYYY-MM-DD)' });
        const data = await asaas('POST', '/subscriptions', {
          customer: params.clienteId,
          billingType: params.tipo || 'PIX',
          value: parseFloat(params.valor),
          nextDueDate: params.vencimento,
          cycle: params.ciclo,
          description: params.descricao || 'Contrato de honorários mensais',
          externalReference: params.referencia || undefined,
          endDate: params.dataFim || undefined,
        });
        return res.json({ ok: true, data });
      }

      // Listar assinaturas
      case 'listar_assinaturas': {
        const qs = new URLSearchParams({
          limit: params.limit || 20,
          offset: params.offset || 0,
          ...(params.clienteId && { customer: params.clienteId }),
          ...(params.status && { status: params.status }),
        });
        const data = await asaas('GET', `/subscriptions?${qs}`);
        return res.json({ ok: true, data });
      }

      // ══════════════════════════════════════════════════
      // FINANCEIRO — SALDO E EXTRATO
      // ══════════════════════════════════════════════════

      // Saldo da conta
      case 'saldo': {
        const data = await asaas('GET', '/finance/balance');
        return res.json({ ok: true, data });
      }

      // Extrato financeiro
      case 'extrato': {
        const qs = new URLSearchParams({
          limit: params.limit || 50,
          offset: params.offset || 0,
          ...(params.dataInicio && { startDate: params.dataInicio }),
          ...(params.dataFim && { finishDate: params.dataFim }),
        });
        const data = await asaas('GET', `/financialTransactions?${qs}`);
        return res.json({ ok: true, data });
      }

      // Resumo financeiro (receitas, despesas, saldo)
      case 'resumo_financeiro': {
        const [saldo, cobrancas] = await Promise.all([
          asaas('GET', '/finance/balance'),
          asaas('GET', '/payments?limit=100&status=RECEIVED'),
        ]);
        const totalRecebido = cobrancas.data?.reduce((s, c) => s + (c.value || 0), 0) || 0;
        const pendentes = await asaas('GET', '/payments?limit=100&status=PENDING');
        const totalPendente = pendentes.data?.reduce((s, c) => s + (c.value || 0), 0) || 0;
        const vencidas = await asaas('GET', '/payments?limit=100&status=OVERDUE');
        const totalVencido = vencidas.data?.reduce((s, c) => s + (c.value || 0), 0) || 0;
        return res.json({
          ok: true,
          data: {
            saldo: saldo.balance || 0,
            totalRecebido,
            totalPendente,
            totalVencido,
            qtdRecebidas: cobrancas.totalCount || 0,
            qtdPendentes: pendentes.totalCount || 0,
            qtdVencidas: vencidas.totalCount || 0,
          }
        });
      }

      // ══════════════════════════════════════════════════
      // TRANSFERÊNCIAS E PIX
      // ══════════════════════════════════════════════════

      // Transferir para conta bancária
      case 'transferir': {
        if (!params.valor) return res.status(400).json({ error: 'valor obrigatório' });
        if (!params.contaBancariaId && !params.pixEnderecoId) {
          return res.status(400).json({ error: 'contaBancariaId ou pixEnderecoId obrigatório' });
        }
        const body = { value: parseFloat(params.valor) };
        if (params.contaBancariaId) body.bankAccount = { id: params.contaBancariaId };
        if (params.pixEnderecoId) body.pixAddressKey = params.pixEnderecoId;
        const data = await asaas('POST', '/transfers', body);
        return res.json({ ok: true, data });
      }

      // ══════════════════════════════════════════════════
      // STATUS DA INTEGRAÇÃO
      // ══════════════════════════════════════════════════

      case 'status': {
        if (!ASAAS_API_KEY) {
          return res.json({
            ok: true,
            configurado: false,
            mensagem: 'ASAAS_API_KEY não configurada. Adicione no Vercel → Settings → Environment Variables.',
          });
        }
        try {
          const data = await asaas('GET', '/finance/balance');
          return res.json({
            ok: true,
            configurado: true,
            ambiente: 'producao',
            saldo: data.balance,
            mensagem: 'Asaas conectado com sucesso ✅',
          });
        } catch (err) {
          return res.json({
            ok: false,
            configurado: true,
            erro: err.message,
            mensagem: 'API Key inválida ou sem permissão.',
          });
        }
      }

      default:
        return res.status(400).json({
          error: `Ação desconhecida: ${action}`,
          acoes_disponiveis: [
            'listar_clientes', 'criar_cliente', 'buscar_cliente', 'atualizar_cliente',
            'listar_cobrancas', 'criar_cobranca_pix', 'criar_cobranca_boleto',
            'criar_cobranca_cartao', 'buscar_cobranca', 'cancelar_cobranca',
            'pix_qrcode', 'boleto_linha',
            'criar_assinatura', 'listar_assinaturas',
            'saldo', 'extrato', 'resumo_financeiro',
            'transferir', 'status',
          ],
        });
    }
  } catch (err) {
    console.error('[Asaas Error]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
