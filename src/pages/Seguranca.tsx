import React, { useState } from 'react';
import { Shield, Users, Lock, Eye, Activity, AlertTriangle, CheckCircle, Key, FileText, Clock, Database } from 'lucide-react';

const perfis = [
  { nome: 'Sócio-Diretor', usuario: 'Mauro Monção', email: 'mauro@moncao.adv.br', permissoes: ['total'], ultimo_acesso: '28/02/2024 14:30', ativo: true },
  { nome: 'Advogado', usuario: 'Dr. Carlos Andrade', email: 'carlos@moncao.adv.br', permissoes: ['processos', 'documentos', 'agenda'], ultimo_acesso: '28/02/2024 09:00', ativo: true },
  { nome: 'Estagiário', usuario: 'Lucas Mendes', email: 'lucas.estagiario@moncao.adv.br', permissoes: ['processos_leitura', 'documentos_leitura'], ultimo_acesso: '27/02/2024 17:00', ativo: true },
  { nome: 'Controladoria', usuario: 'Marina Costa', email: 'financeiro@moncao.adv.br', permissoes: ['financeiro', 'relatorios'], ultimo_acesso: '28/02/2024 10:00', ativo: true },
  { nome: 'Cliente Institucional', usuario: 'Portal Prefeitura SP', email: 'juridico@sp.gov.br', permissoes: ['portal_cliente'], ultimo_acesso: '28/02/2024 10:30', ativo: true },
];

const logs = [
  { id: 'L001', usuario: 'Mauro Monção', acao: 'Acesso ao processo 0001234-55.2024', modulo: 'Processos', ip: '192.168.1.1', data: '28/02/2024 14:30', tipo: 'leitura' },
  { id: 'L002', usuario: 'Marina Costa', acao: 'Gerou relatório financeiro Fev/2024', modulo: 'Financeiro', ip: '192.168.1.5', data: '28/02/2024 13:00', tipo: 'exportacao' },
  { id: 'L003', usuario: 'Portal Prefeitura SP', acao: 'Login no portal do cliente', modulo: 'Portal', ip: '177.82.45.12', data: '28/02/2024 10:30', tipo: 'autenticacao' },
  { id: 'L004', usuario: 'Lucas Mendes', acao: 'Tentativa de acesso negada — módulo Financeiro', modulo: 'Financeiro', ip: '192.168.1.10', data: '27/02/2024 16:00', tipo: 'negado' },
  { id: 'L005', usuario: 'Mauro Monção', acao: 'Documento DC001 aprovado e publicado', modulo: 'Documentos', ip: '192.168.1.1', data: '27/02/2024 12:00', tipo: 'escrita' },
];

const lgpdItems = [
  { desc: 'Base legal documentada para todos os dados pessoais', status: true },
  { desc: 'Política de retenção de dados definida (5 anos)', status: true },
  { desc: 'Dados sensíveis classificados e criptografados', status: true },
  { desc: 'DPO (Encarregado de Proteção) designado', status: false },
  { desc: 'Mapeamento de fluxos de dados (ROPA) atualizado', status: true },
  { desc: 'Procedimento de resposta a incidentes documentado', status: false },
  { desc: 'Backup automático criptografado habilitado', status: true },
  { desc: 'Auditoria trimestral de acessos realizada', status: true },
];

const tipoLogCor: Record<string, string> = {
  leitura: 'bg-blue-500/20 text-blue-400',
  escrita: 'bg-green-500/20 text-green-400',
  exportacao: 'bg-purple-500/20 text-purple-400',
  autenticacao: 'bg-yellow-500/20 text-yellow-400',
  negado: 'bg-red-500/20 text-red-400',
};

export default function Seguranca() {
  const lgpdScore = Math.round((lgpdItems.filter(i => i.status).length / lgpdItems.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield size={24} className="text-green-400" />Segurança & LGPD</h1>
        <p className="text-gray-500 text-sm mt-0.5">RBAC, auditoria completa, criptografia e conformidade LGPD</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Usuários Ativos', v: perfis.filter(p => p.ativo).length, c: 'text-blue-400', icon: Users },
          { l: 'Logs Hoje', v: '247', c: 'text-green-400', icon: Activity },
          { l: 'Conformidade LGPD', v: `${lgpdScore}%`, c: lgpdScore >= 80 ? 'text-green-400' : 'text-yellow-400', icon: Shield },
          { l: 'Acessos Negados', v: '1', c: 'text-red-400', icon: AlertTriangle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="bg-[#1a2744] border border-blue-900/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center">
                <Icon size={20} className={s.c} />
              </div>
              <div>
                <div className={`text-xl font-bold ${s.c}`}>{s.v}</div>
                <div className="text-xs text-gray-500">{s.l}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfis e RBAC */}
        <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
            <Key size={16} className="text-yellow-400" />
            <span className="font-semibold text-gray-200 text-sm">Perfis de Acesso — RBAC</span>
          </div>
          <div className="divide-y divide-blue-900/20">
            {perfis.map(p => (
              <div key={p.usuario} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {p.usuario.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-200">{p.usuario}</div>
                  <div className="text-xs text-gray-500">{p.nome} • {p.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.ativo ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-500">Último: {p.ultimo_acesso.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LGPD Checklist */}
        <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-400" />
              <span className="font-semibold text-gray-200 text-sm">Conformidade LGPD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 rounded-full bg-gray-700 overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${lgpdScore}%` }}></div>
              </div>
              <span className={`text-sm font-bold ${lgpdScore >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>{lgpdScore}%</span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {lgpdItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.status ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                  {item.status ? <CheckCircle size={10} className="text-green-400" /> : <AlertTriangle size={10} className="text-red-400" />}
                </div>
                <span className={`text-xs ${item.status ? 'text-gray-300' : 'text-gray-500'}`}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-[#1a2744] border border-blue-900/30 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
          <Database size={16} className="text-blue-400" />
          <span className="font-semibold text-gray-200 text-sm">Log de Auditoria — Últimas Atividades</span>
          <span className="ml-auto text-xs text-gray-500">Armazenado por 5 anos (LGPD)</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              {['Usuário', 'Ação', 'Módulo', 'IP', 'Data/Hora', 'Tipo'].map(h => (
                <th key={h} className="bg-[#0f1623]/60 text-blue-300 text-xs font-semibold uppercase tracking-wider px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className={`border-t border-blue-900/20 hover:bg-blue-900/10 transition-colors ${l.tipo === 'negado' ? 'bg-red-900/10' : ''}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-200">{l.usuario}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{l.acao}</td>
                <td className="px-4 py-3 text-sm text-blue-400">{l.modulo}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{l.ip}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{l.data}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoLogCor[l.tipo]}`}>
                    {l.tipo.charAt(0).toUpperCase() + l.tipo.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
