import React, { useState } from 'react';
import { Settings, Bell, Database, Link2, Globe, Key, Save, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Configuracoes() {
  const [aba, setAba] = useState<'geral' | 'integracoes' | 'notificacoes' | 'sistema'>('geral');
  const [saved, setSaved] = useState(false);

  const salvar = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}><Settings size={24} className="text-blue-400" />Configurações do Sistema</h1>
        <p className="text-slate-500 text-sm mt-0.5">Lex Jurídico — Configurações gerais, integrações e APIs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit flex-wrap">
        {[
          { id: 'geral', label: '⚙️ Geral' },
          { id: 'integracoes', label: '🔗 Integrações' },
          { id: 'notificacoes', label: '🔔 Notificações' },
          { id: 'sistema', label: '🗄️ Sistema' },
        ].map(t => (
          <button key={t.id} onClick={() => setAba(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aba === t.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {aba === 'geral' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Informações do Escritório</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nome do Escritório', placeholder: 'Mauro Monção Advogados', type: 'text' },
                { label: 'OAB', placeholder: 'OAB/SP 123.456', type: 'text' },
                { label: 'E-mail', placeholder: 'contato@mauromoncao.adv.br', type: 'email' },
                { label: 'Telefone', placeholder: '(11) 99999-9999', type: 'tel' },
                { label: 'CNPJ', placeholder: '12.345.678/0001-90', type: 'text' },
                { label: 'SLA Padrão (horas)', placeholder: '48', type: 'number' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-400" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Módulo SaaS — Multi-tenant</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Plano Atual', value: 'Enterprise', color: '#7c3aed' },
                { label: 'Usuários Ativos', value: '5/50', color: '#19385C' },
                { label: 'Armazenamento', value: '12 GB / 500 GB', color: '#00b37e' },
                { label: 'Instâncias Ativas', value: '1', color: '#DEC078' },
                { label: 'Licença Válida até', value: '31/12/2024', color: 'text-slate-700' },
                { label: 'Módulos Ativos', value: '13/14', color: '#00b37e' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-lg p-3 border border-slate-100">
                  <div className="text-xs text-slate-500 mb-0.5">{s.label}</div>
                  <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === 'integracoes' && (
        <div className="space-y-4">
          {[
            { nome: 'ZapSign', desc: 'Assinatura digital de documentos', status: 'conectado', icon: '✍️' },
            { nome: 'ClickSign', desc: 'Assinatura digital ICP-Brasil', status: 'conectado', icon: '🔏' },
            { nome: 'CNJ/DJEN', desc: 'Domicílio Eletrônico Judicial', status: 'conectado', icon: '⚖️' },
            { nome: 'DataJud', desc: 'Base de dados judiciário', status: 'conectado', icon: '📊' },
            { nome: 'Asaas', desc: 'Gateway de pagamento PIX/Boleto', status: 'conectado', icon: '💳' },
            { nome: 'Google Calendar', desc: 'Sync de agenda e audiências', status: 'conectado', icon: '📅' },
            { nome: 'Ben Growth Center', desc: 'CRM Comercial — sincronização de leads', status: 'conectado', icon: '🚀' },
            { nome: 'WhatsApp Business', desc: 'Notificações e comunicação', status: 'pendente', icon: '💬' },
          ].map(int => (
            <div key={int.nome} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <span className="text-2xl">{int.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{int.nome}</div>
                <div className="text-xs text-slate-500">{int.desc}</div>
              </div>
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium ${int.status === 'conectado' ? 'bg-emerald/10 text-emerald border border-green-500/30' : 'bg-amber/10 text-amber-700 border border-yellow-500/30'}`}>
                {int.status === 'conectado' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                {int.status === 'conectado' ? 'Conectado' : 'Configurar'}
              </div>
              <button className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                Configurar
              </button>
            </div>
          ))}
        </div>
      )}

      {aba === 'notificacoes' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Alertas & Notificações</h3>
          {[
            { desc: 'Alertas D-5 (5 dias antes do prazo)', ativo: true },
            { desc: 'Alertas D-3 (3 dias antes do prazo)', ativo: true },
            { desc: 'Alertas D-1 (1 dia antes do prazo)', ativo: true },
            { desc: 'Alertas D-0 (prazos do dia)', ativo: true },
            { desc: 'Novas intimações via CNJ/DJEN', ativo: true },
            { desc: 'Novos leads sincronizados do BGC', ativo: true },
            { desc: 'Pagamento recebido (Asaas)', ativo: true },
            { desc: 'Assinatura concluída (ClickSign/ZapSign)', ativo: true },
            { desc: 'Relatório semanal automático', ativo: false },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-slate-700">{n.desc}</span>
              <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${n.ativo ? 'bg-blue-600' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.ativo ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'sistema' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><Database size={16} className="text-blue-400" />Status do Banco de Dados</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Banco de Dados', value: 'PostgreSQL 15', status: 'online' },
                { label: 'Último Backup', value: '28/02/2024 02:00', status: 'ok' },
                { label: 'Tamanho DB', value: '2.4 GB', status: 'ok' },
                { label: 'Registros', value: '4.7M', status: 'ok' },
                { label: 'Criptografia', value: 'AES-256', status: 'ativo' },
                { label: 'Multi-tenant', value: 'Ativo — 1 instância', status: 'ativo' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-lg p-3 border border-slate-100">
                  <div className="text-xs text-slate-500 mb-0.5">{s.label}</div>
                  <div className="text-sm font-medium text-slate-800">{s.value}</div>
                  <div className={`text-xs mt-0.5 ${['online', 'ativo'].includes(s.status) ? '#00b37e' : '#19385C'}`}>{s.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={salvar} className={`flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'btn-primary'}`}>
          {saved ? <><CheckCircle size={16} />Salvo!</> : <><Save size={16} />Salvar Configurações</>}
        </button>
      </div>
    </div>
  );
}
