// FloatingAssistants.tsx — Mara IA + Dr. Ben botões flutuantes
// Portal do Cliente — Mauro Monção Advogados Associados
// Mara IA (esquerda): Secretária Executiva Digital
// Dr. Ben (direita):  Assistente Jurídico IA

import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Send, X, Minimize2, Maximize2, Sparkles, Scale, RotateCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Tipos ───────────────────────────────────────────────────────
interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string
}

// ── API base (portal VPS) ────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'https://portal-api.mauromoncao.adv.br'

// ── Utilitários ─────────────────────────────────────────────────
const fmtHora = (s: string) => {
  try { return new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

const STORAGE_MARA = 'portal_mara_msgs'
const STORAGE_BEN  = 'portal_ben_msgs'
const MAX_MSGS     = 60

function loadMsgs(key: string): ChatMsg[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
function saveMsgs(key: string, msgs: ChatMsg[]) {
  try { localStorage.setItem(key, JSON.stringify(msgs.slice(-MAX_MSGS))) } catch { /* */ }
}

// ── Mensagens iniciais ───────────────────────────────────────────
const MARA_BOAS_VINDAS: ChatMsg = {
  id: 'mara-bv',
  role: 'assistant',
  content: 'Olá! 😊 Sou a **Mara**, Secretária Executiva Digital do escritório Mauro Monção.\n\nPosso te ajudar com:\n• Status de processos e prazos\n• Documentos e procedimentos internos\n• Contato com o escritório\n• Informações gerais do seu caso\n\nComo posso te ajudar hoje?',
  ts: new Date().toISOString(),
}

const BEN_BOAS_VINDAS: ChatMsg = {
  id: 'ben-bv',
  role: 'assistant',
  content: 'Olá! Sou o **Dr. Ben**, seu Assistente Jurídico IA. ⚖️\n\nEstou aqui para:\n• Esclarecer dúvidas jurídicas\n• Explicar termos e procedimentos legais\n• Orientar sobre direitos e recursos\n• Apoio em questões tributárias, cíveis e administrativas\n\n*Lembre-se: minhas orientações são informativas. Para decisões jurídicas, consulte sempre seu advogado responsável.*\n\nQual é a sua dúvida?',
  ts: new Date().toISOString(),
}

// ── Componente de chat individual ────────────────────────────────
interface ChatPanelProps {
  who: 'mara' | 'ben'
  open: boolean
  onClose: () => void
  token: string | null
  userName?: string
}

function ChatPanel({ who, open, onClose, token, userName }: ChatPanelProps) {
  const isMara   = who === 'mara'
  const storageK = isMara ? STORAGE_MARA : STORAGE_BEN
  const bv       = isMara ? MARA_BOAS_VINDAS : BEN_BOAS_VINDAS

  const [msgs, setMsgs]       = useState<ChatMsg[]>(() => {
    const stored = loadMsgs(storageK)
    return stored.length > 0 ? stored : [bv]
  })
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [maxi, setMaxi]       = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [msgs])

  useEffect(() => {
    saveMsgs(storageK, msgs)
  }, [msgs, storageK])

  const addMsg = (msg: ChatMsg) => setMsgs(prev => [...prev, msg])

  const clearHistory = () => {
    setMsgs([bv])
    localStorage.removeItem(storageK)
  }

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      ts: new Date().toISOString(),
    }
    addMsg(userMsg)
    setInput('')
    setLoading(true)

    try {
      // Call portal API chat endpoint
      const endpoint = isMara
        ? `${API_URL}/chat/mara`
        : `${API_URL}/chat/ben`

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          history: msgs.slice(-10).map(m => ({ role: m.role, content: m.content })),
          user_name: userName || 'Cliente',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        addMsg({
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || data.message || data.content || 'Desculpe, não consegui processar sua mensagem.',
          ts: new Date().toISOString(),
        })
      } else {
        // Fallback inteligente sem API
        addMsg({
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: isMara
            ? getFallbackMara(text, userName)
            : getFallbackBen(text),
          ts: new Date().toISOString(),
        })
      }
    } catch {
      addMsg({
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: isMara
          ? getFallbackMara(text, userName)
          : getFallbackBen(text),
        ts: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  if (!open) return null

  // ── Cores do tema ────────────────────────────────────────────
  const headerBg   = isMara ? '#92400E' : '#0d1f3c'
  const headerGrad = isMara
    ? 'linear-gradient(135deg, #92400E 0%, #b45309 100%)'
    : 'linear-gradient(135deg, #0d1f3c 0%, #1e3a5f 100%)'
  const accentColor = isMara ? '#F59E0B' : '#C9A84C'
  const bubbleUser  = isMara ? '#92400E' : '#0d1f3c'

  // ── Posição ─────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: maxi ? '0' : '88px',
    ...(isMara ? { left: maxi ? '0' : '16px' } : { right: maxi ? '0' : '16px' }),
    width:  maxi ? '100vw' : '360px',
    height: maxi ? '100vh' : '520px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: maxi ? '0' : '20px',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
    background: '#FFFFFF',
    transition: 'all 0.25s ease',
  }

  return (
    <div style={panelStyle}>

      {/* Header */}
      <div style={{ background: headerGrad, padding: '12px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          {/* Avatar */}
          <div style={{
            width: 42, height: 42,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${accentColor}`,
            flexShrink: 0,
          }}>
            <img
              src={isMara ? '/mara-ia-foto.jpg' : '/dr-ben-avatar.jpg'}
              alt={isMara ? 'Mara IA' : 'Dr. Ben'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.2 }}>
              {isMara ? 'Mara' : 'Dr. Ben'}
            </p>
            <p style={{ color: accentColor, fontSize: 10, margin: 0, marginTop: 2 }}>
              {isMara ? 'Secretária Executiva Digital' : 'Assistente Jurídico IA'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#22C55E', display: 'inline-block',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Online agora</span>
            </div>
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={clearHistory}
              title="Limpar histórico"
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 8, padding: '5px 6px', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center',
              }}
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => setMaxi(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 8, padding: '5px 6px', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center',
              }}
            >
              {maxi ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)', border: 'none',
                borderRadius: 8, padding: '5px 6px', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 12px',
        background: 'linear-gradient(180deg, #F8FAFF 0%, #F2F4F8 100%)',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {msgs.map(msg => {
          const isAssistant = msg.role === 'assistant'
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: isAssistant ? 'row' : 'row-reverse',
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              {/* Avatar pequeno */}
              {isAssistant && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  overflow: 'hidden', flexShrink: 0,
                  border: `1.5px solid ${accentColor}`,
                }}>
                  <img
                    src={isMara ? '/mara-ia-foto.jpg' : '/dr-ben-avatar.jpg'}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
              )}

              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  background: isAssistant ? '#FFFFFF' : bubbleUser,
                  color: isAssistant ? '#1A1A2E' : '#FFFFFF',
                  borderRadius: isAssistant ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                  padding: '9px 13px',
                  fontSize: 13,
                  lineHeight: 1.55,
                  boxShadow: isAssistant ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  border: isAssistant ? '1px solid #EEEEEE' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {renderMdSimple(msg.content)}
                </div>
                <p style={{
                  fontSize: 10, color: '#9CA3AF', margin: '3px 4px 0',
                  textAlign: isAssistant ? 'left' : 'right',
                }}>
                  {fmtHora(msg.ts)}
                </p>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0,
              border: `1.5px solid ${accentColor}`,
            }}>
              <img
                src={isMara ? '/mara-ia-foto.jpg' : '/dr-ben-avatar.jpg'}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            </div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px 16px 16px 4px',
              padding: '10px 14px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid #EEEEEE',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: accentColor,
                  display: 'inline-block',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          borderTop: '1px solid #EEEEEE',
          padding: '10px 12px',
          background: '#FFFFFF',
          display: 'flex', gap: 8, alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as FormEvent)
            }
          }}
          placeholder={isMara ? 'Fale com a Mara...' : 'Tire sua dúvida jurídica...'}
          disabled={loading}
          rows={1}
          style={{
            flex: 1, border: '1px solid #E5E7EB', borderRadius: 12,
            padding: '8px 12px', fontSize: 13, resize: 'none',
            outline: 'none', fontFamily: 'inherit',
            background: '#F9FAFB', color: '#1A1A1A',
            lineHeight: 1.4, maxHeight: 80, overflowY: 'auto',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 38, height: 38,
            borderRadius: 12, border: 'none',
            background: loading || !input.trim() ? '#E5E7EB' : (isMara ? '#92400E' : '#0d1f3c'),
            color: loading || !input.trim() ? '#9CA3AF' : '#FFFFFF',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

// ── Markdown simples ─────────────────────────────────────────────
function renderMdSimple(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parsed = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    return (
      <span
        key={i}
        style={{ display: 'block', lineHeight: 1.55 }}
        dangerouslySetInnerHTML={{ __html: parsed }}
      />
    )
  })
}

// ── Respostas fallback inteligentes ─────────────────────────────
function getFallbackMara(msg: string, userName?: string): string {
  const nome = userName?.split(' ')[0] || 'Cliente'
  const lc   = msg.toLowerCase()

  if (lc.includes('prazo') || lc.includes('data') || lc.includes('venc'))
    return `${nome}, para verificar prazos e datas específicas do seu caso, acesse a aba **Meus Processos** no painel ou envie uma mensagem formal ao escritório pela aba **Procedimento Interno**. O Dr. Mauro responde em até 24h úteis. 📅`

  if (lc.includes('documento') || lc.includes('certidão') || lc.includes('procura'))
    return `Para solicitar ou acompanhar documentos, use a aba **Procedimento Interno** e selecione o tipo "Certidão" ou "Documentos Diversos". O escritório processará sua solicitação em breve. 📋`

  if (lc.includes('processo') || lc.includes('ação') || lc.includes('processo'))
    return `Para acompanhar seus processos em detalhes, acesse a aba **Meus Processos** no menu lateral. Se precisar de informações específicas, entre em contato pelo **Procedimento Interno**. ⚖️`

  if (lc.includes('honorário') || lc.includes('pagamento') || lc.includes('valor') || lc.includes('boleto'))
    return `Questões financeiras são tratadas diretamente pelo escritório. Envie uma mensagem pelo **Procedimento Interno** ou entre em contato pelo WhatsApp: **(86) 99948-4761**. 💰`

  if (lc.includes('obrigad') || lc.includes('agradeço'))
    return `Fico feliz em ajudar, ${nome}! 😊 Estou sempre aqui quando precisar. Qualquer dúvida, é só falar!`

  if (lc.includes('olá') || lc.includes('oi') || lc.includes('bom dia') || lc.includes('boa tarde'))
    return `Olá, ${nome}! 😊 Seja bem-vindo(a)! Como posso te ajudar hoje? Você pode me perguntar sobre processos, documentos, prazos ou procedimentos do escritório.`

  return `Entendi, ${nome}! Para resolver isso da melhor forma, recomendo enviar uma mensagem formal pelo **Procedimento Interno** selecionando o tipo adequado. O escritório responderá em até **24h úteis**. Posso te ajudar com mais alguma coisa? 😊`
}

function getFallbackBen(msg: string): string {
  const lc = msg.toLowerCase()

  if (lc.includes('habeas corpus') || lc.includes('hc'))
    return `O **Habeas Corpus** é um remédio constitucional (art. 5º, LXVIII, CF/88) que protege a liberdade de locomoção. Pode ser preventivo (salvo-conduto) ou liberatório. É impetrado quando há constrangimento ilegal por abuso de autoridade ou ilegalidade. Deseja saber mais sobre algum aspecto específico?`

  if (lc.includes('mandado de segurança') || lc.includes('ms'))
    return `O **Mandado de Segurança** (Lei 12.016/09) protege direito líquido e certo não amparado por HC ou HD. Prazo: 120 dias do ato coator. Individual ou Coletivo. Suspende o ato impugnado mediante liminar quando presentes fumus boni iuris e periculum in mora. Quer mais detalhes?`

  if (lc.includes('prazo') || lc.includes('recurso') || lc.includes('apelação'))
    return `Os principais **prazos recursais** no CPC: Apelação (15 dias), Agravo de Instrumento (15 dias), Embargos de Declaração (5 dias), Recurso Especial/Extraordinário (15 dias). Sempre verifique o prazo específico com seu advogado, pois há exceções. Que recurso você precisa entender melhor?`

  if (lc.includes('tributár') || lc.includes('imposto') || lc.includes('icms') || lc.includes('iss') || lc.includes('irpf') || lc.includes('irpj'))
    return `Em matéria **tributária**, os pontos mais relevantes envolvem: lançamento, decadência (5 anos para constituir o crédito), prescrição (5 anos para cobrar), recursos administrativos no CARF, e ações anulatórias/mandamentais no judiciário. Qual aspecto tributário você gostaria de aprofundar?`

  if (lc.includes('contrato') || lc.includes('inadimpl') || lc.includes('rescisão'))
    return `Em **Direito Contratual** (CC/2002), a inadimplência pode gerar: resolução do contrato (art. 475), perdas e danos, cláusula penal, e juros de mora. A rescisão unilateral injustificada gera obrigação de indenizar. Quer saber sobre um tipo específico de contrato?`

  if (lc.includes('trabalhista') || lc.includes('rescisão') || lc.includes('fgts') || lc.includes('clt'))
    return `No **Direito do Trabalho** (CLT), os principais direitos incluem: FGTS (8% do salário), aviso prévio (mínimo 30 dias), férias (30 dias + 1/3), 13º salário, e horas extras (50% adicional). A prescrição trabalhista é de 2 anos para propor a ação e 5 anos retroativos. Qual é sua dúvida específica?`

  if (lc.includes('herança') || lc.includes('inventário') || lc.includes('partilha') || lc.includes('testamento'))
    return `Em **Direito Sucessório** (CC/2002, arts. 1.784 ss.), a herança se abre com a morte. Herdeiros necessários (descendentes, ascendentes, cônjuge) têm direito à legítima (50% da herança). O inventário deve ser aberto em 60 dias do óbito. Pode ser judicial ou extrajudicial (se não houver herdeiros menores/incapazes e sem litígio). Quer saber mais?`

  if (lc.includes('obrigad') || lc.includes('agradeço'))
    return `Fico à disposição! ⚖️ Lembre-se: minhas orientações são informativas. Para decisões jurídicas concretas, consulte sempre o Dr. Mauro Monção diretamente. Mais alguma dúvida?`

  if (lc.includes('olá') || lc.includes('oi') || lc.includes('bom dia') || lc.includes('boa tarde'))
    return `Olá! Sou o Dr. Ben, Assistente Jurídico IA. ⚖️ Estou aqui para esclarecer dúvidas sobre direito civil, tributário, administrativo, trabalhista e mais. Qual é a sua questão jurídica?`

  return `Boa pergunta! Para orientar você corretamente sobre **"${msg.slice(0, 50)}${msg.length > 50 ? '...' : ''}"**, seria importante conhecer mais detalhes do caso. De forma geral, recomendo:\n\n1. Consultar o **Procedimento Interno** para formalizar a solicitação\n2. Agendar consulta com o **Dr. Mauro Monção**\n3. Reunir todos os documentos relacionados\n\nPosso esclarecer algum conceito jurídico específico?`
}

// ── Botão flutuante ──────────────────────────────────────────────
interface FloatBtnProps {
  who: 'mara' | 'ben'
  onClick: () => void
  unread?: number
  isOpen: boolean
}

function FloatBtn({ who, onClick, unread = 0, isOpen }: FloatBtnProps) {
  const isMara = who === 'mara'

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    ...(isMara ? { left: 20 } : { right: 20 }),
    zIndex: 9998,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    userSelect: 'none',
  }

  const ringColor = isMara ? '#F59E0B' : '#C9A84C'
  const bgColor   = isMara ? '#92400E' : '#0d1f3c'

  return (
    <button style={btnStyle} onClick={onClick} title={isMara ? 'Falar com Mara' : 'Assistente Jurídico Dr. Ben'}>
      {/* Rótulo */}
      <span style={{
        background: bgColor,
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        letterSpacing: 0.3,
      }}>
        {isMara ? 'MARA IA' : 'DR. BEN'}
      </span>

      {/* Avatar com ring animado */}
      <div style={{ position: 'relative' }}>
        {/* Pulse ring */}
        {!isOpen && (
          <span style={{
            position: 'absolute', inset: -4,
            borderRadius: '50%',
            border: `2px solid ${ringColor}`,
            animation: 'pulseRing 2s infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Badge não lido */}
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#EF4444', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff', zIndex: 1,
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}

        {/* Photo */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `3px solid ${ringColor}`,
          boxShadow: isOpen
            ? `0 0 0 3px ${bgColor}, 0 8px 24px rgba(0,0,0,0.3)`
            : '0 6px 20px rgba(0,0,0,0.25)',
          transform: isOpen ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.2s ease',
        }}>
          <img
            src={isMara ? '/mara-ia-foto.jpg' : '/dr-ben-avatar.jpg'}
            alt={isMara ? 'Mara IA' : 'Dr. Ben'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          />
        </div>
      </div>

      {/* Ícone de chat */}
      <span style={{
        background: bgColor,
        color: ringColor,
        borderRadius: '50%',
        width: 20, height: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        fontSize: 10,
      }}>
        {isOpen ? <X size={10} /> : (isMara ? <Sparkles size={10} /> : <Scale size={10} />)}
      </span>
    </button>
  )
}

// ── Componente principal exportado ────────────────────────────────
export default function FloatingAssistants() {
  const auth = useAuth()
  // juris-center auth has `user` but no `token` in context — use localStorage if needed
  const token = (auth as unknown as { token?: string | null }).token ?? null
  const user = auth.user
  const [maraOpen, setMaraOpen] = useState(false)
  const [benOpen,  setBenOpen]  = useState(false)

  // Fechar o outro ao abrir um
  const toggleMara = () => {
    setMaraOpen(v => !v)
    if (!maraOpen) setBenOpen(false)
  }
  const toggleBen = () => {
    setBenOpen(v => !v)
    if (!benOpen) setMaraOpen(false)
  }

  return (
    <>
      {/* CSS animations */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.8; }
          50%  { transform: scale(1.18); opacity: 0.3; }
          100% { transform: scale(1);   opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
      `}</style>

      {/* Botão Mara — esquerda */}
      <FloatBtn who="mara" onClick={toggleMara} isOpen={maraOpen} />

      {/* Chat Mara */}
      <ChatPanel
        who="mara"
        open={maraOpen}
        onClose={() => setMaraOpen(false)}
        token={token}
        userName={user?.nome}
      />

      {/* Botão Dr. Ben — direita */}
      <FloatBtn who="ben" onClick={toggleBen} isOpen={benOpen} />

      {/* Chat Dr. Ben */}
      <ChatPanel
        who="ben"
        open={benOpen}
        onClose={() => setBenOpen(false)}
        token={token}
        userName={user?.nome}
      />
    </>
  )
}
