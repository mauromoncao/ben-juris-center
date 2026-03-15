import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, Video, MapPin, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const eventos = [
  { id: 'E001', tipo: 'audiencia', titulo: 'Audiência de Instrução — Proc. 0004321', data: '2024-02-29', hora: '14:00', local: 'Fórum Central SP — Sala 5', processo: '0004321-66.2024.5.15.0001', cliente: 'Fundação Campinas', responsavel: 'Mauro Monção', checklist: ['Preparar testemunhas', 'Revisar documentos', 'Chegar 30min antes'], docs: ['contestacao.pdf', 'documentos_testemunhas.pdf'], cor: 'bg-red-500' },
  { id: 'E002', tipo: 'reuniao_virtual', titulo: 'Reunião Cliente — Câmara RJ (Meet)', data: '2024-03-01', hora: '10:00', local: 'Google Meet', processo: '0009876-44.2023.8.19.0001', cliente: 'Câmara Municipal RJ', responsavel: 'Mauro Monção', checklist: ['Preparar relatório', 'Enviar pauta', 'Confirmar participantes'], docs: ['relatorio_situacao.pdf'], cor: 'bg-blue-500' },
  { id: 'E003', tipo: 'prazo', titulo: 'Prazo Fatal — Contestação', data: '2024-03-03', hora: '23:59', local: 'PJe', processo: '0004321-66.2024.5.15.0001', cliente: 'Fundação Campinas', responsavel: 'Mauro Monção', checklist: ['Minutar contestação', 'Revisar', 'Protocolar'], docs: [], cor: 'bg-orange-500' },
  { id: 'E004', tipo: 'julgamento', titulo: 'Julgamento — TJRJ Câmara Cível', data: '2024-03-12', hora: '14:00', local: 'TJRJ — Plenário Virtual', processo: '0009876-44.2023.8.19.0001', cliente: 'Câmara Municipal RJ', responsavel: 'Mauro Monção', checklist: ['Acompanhar pauta', 'Preparar sustentação oral'], docs: ['razoes_recurso.pdf'], cor: 'bg-purple-500' },
  { id: 'E005', tipo: 'pericia', titulo: 'Perícia Contábil — TechSol', data: '2024-03-15', hora: '09:00', local: 'Sede TechSol BH', processo: '0003456-22.2024.8.13.0024', cliente: 'TechSol', responsavel: 'Mauro Monção', checklist: ['Indicar assistente técnico', 'Preparar quesitos', 'Revisar laudos'], docs: [], cor: 'bg-teal-500' },
];

const tipoLabel: Record<string, string> = {
  audiencia: '🔱 Audiência', reuniao_virtual: '💻 Reunião Virtual', prazo: '⏰ Prazo', julgamento: '🔱 Julgamento', pericia: '🔬 Perícia'
};

export default function Agenda() {
  const [selecionado, setSelecionado] = useState<typeof eventos[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif flex items-center gap-2" style={{ color: '#19385C' }}><Calendar size={24} className="text-blue-400" />Agenda & Audiências</h1>
          <p className="text-slate-500 text-sm mt-0.5">Calendário integrado com Google Calendar, audiências e prazos</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} />Novo Evento
        </button>
      </div>

      {/* Cards dos próximos eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {eventos.map(e => (
          <div key={e.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => setSelecionado(e)}>
            <div className={`h-1.5 ${e.cor}`}></div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-slate-500">{tipoLabel[e.tipo]}</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{new Date(e.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</div>
                  <div className="text-xs text-blue-400">{e.hora}</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-100 text-sm mb-2 leading-tight">{e.titulo}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={11} />{e.local}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={11} />{e.cliente}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <div className="flex-1 text-xs text-slate-400">{e.checklist.length} itens no checklist</div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${e.docs.length > 0 ? '#19385C' : 'text-slate-400'}`}>
                  {e.docs.length} docs
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detalhe do evento */}
      {selecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelecionado(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={`h-2 ${selecionado.cor} rounded-t-2xl`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{tipoLabel[selecionado.tipo]}</div>
                  <h2 className="font-bold text-gray-100 text-lg">{selecionado.titulo}</h2>
                </div>
                <button onClick={() => setSelecionado(null)} className="text-slate-500 hover:text-slate-700 ml-4">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Data', value: new Date(selecionado.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Hora', value: selecionado.hora },
                  { label: 'Local', value: selecionado.local },
                  { label: 'Cliente', value: selecionado.cliente },
                  { label: 'Processo', value: selecionado.processo },
                  { label: 'Responsável', value: selecionado.responsavel },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-0.5">{f.label}</div>
                    <div className="text-sm text-slate-800">{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Checklist de Preparação</div>
                <div className="space-y-2">
                  {selecionado.checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-blue-500/50 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-blue-500/20">
                        <CheckCircle size={12} className="text-blue-500 opacity-0 hover:opacity-100" />
                      </div>
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selecionado.docs.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Documentos</div>
                  <div className="flex flex-wrap gap-2">
                    {selecionado.docs.map(d => (
                      <span key={d} className="flex items-center gap-1.5 text-xs bg-slate-100 text-blue-400 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                        <FileText size={12} />{d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                {selecionado.tipo === 'reuniao_virtual' && (
                  <button className="btn-primary">
                    <Video size={14} />Entrar no Meet
                  </button>
                )}
                <button className="flex items-center gap-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                  <Calendar size={14} />Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
