import React, { useState, useRef, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Clipboard, Image,
} from 'react-native'
import { COLORS, JURIS_API, Agent } from '../constants/agents'

const FALCON = require('../../assets/falcon-logo.png')

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  elapsed?: number
  model?: string
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  function copyText() {
    Clipboard.setString(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Image source={FALCON} style={styles.avatarImg} resizeMode="cover" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={styles.bubbleText} selectable>
          {msg.content}
        </Text>
        {!isUser && (
          <View style={styles.bubbleMeta}>
            {msg.elapsed != null && (
              <Text style={styles.metaText}>{msg.elapsed}s</Text>
            )}
            <TouchableOpacity onPress={copyText} style={styles.copyBtn}>
              <Text style={styles.copyText}>{copied ? '✓' : '⧉'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

function TypingIndicator() {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
      <View style={styles.avatar}>
        <Image source={FALCON} style={styles.avatarImg} resizeMode="cover" />
      </View>
      <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
        <Text style={styles.typingText}>Processando...</Text>
        <ActivityIndicator size="small" color={COLORS.gold} style={{ marginLeft: 8 }} />
      </View>
    </View>
  )
}

interface ChatScreenProps {
  agent: Agent
  onBack: () => void
}

export default function ChatScreen({ agent, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    scrollToBottom()

    const t0 = Date.now()
    try {
      const res = await fetch(`${JURIS_API}/api/agents/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          input: text,
          clientId: 'dr-mauro-moncao',
          context: '',
          useSearch: false,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const elapsed = Math.round((Date.now() - t0) / 1000)

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.content || 'Sem resposta.',
        elapsed,
        model: data.model || agent.model,
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠ Erro ao conectar: ${err.message}`,
        },
      ])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerIconWrap}>
            <Image source={FALCON} style={styles.headerIcon} resizeMode="cover" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerName} numberOfLines={1}>{agent.shortName}</Text>
          </View>
          {agent.badge && (
            <View style={[styles.badge, { backgroundColor: agent.badgeColor || '#1d4ed8' }]}>
              <Text style={styles.badgeText}>{agent.badge}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
          <Text style={styles.clearText}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* ── Mensagens ── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{agent.emoji}</Text>
            <Text style={styles.emptyName}>{agent.name}</Text>
            <Text style={styles.emptyHint}>
              Olá! Sou {agent.shortName}.{'\n'}Como posso ajudar você hoje?
            </Text>
          </View>
        }
        onContentSizeChange={scrollToBottom}
      />

      {loading && <TypingIndicator />}

      {/* ── Input ── */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder={`Perguntar ao ${agent.shortName}...`}
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={4000}
          returnKeyType="default"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendIcon}>➤</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  backText: { fontSize: 24, color: COLORS.textPrimary, lineHeight: 28 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerEmoji: { fontSize: 22 },
  headerTexts: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  headerModel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  clearBtn: {
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  clearText: { fontSize: 16 },

  // List
  list: { padding: 12, paddingBottom: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  emptyHint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },

  // Bubbles
  bubbleRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot: { justifyContent: 'flex-start' },
  avatar: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#0d1f3c',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8, flexShrink: 0,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(228,168,38,0.25)',
  },
  avatarImg: { width: 32, height: 32 },
  headerIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0d1f3c',
    borderWidth: 1, borderColor: 'rgba(228,168,38,0.25)',
  },
  headerIcon: { width: 30, height: 30 },
  bubble: {
    maxWidth: '80%', borderRadius: 14, padding: 12,
  },
  bubbleUser: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.botBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  bubbleText: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  metaText: { fontSize: 11, color: COLORS.textMuted },
  copyBtn: { marginLeft: 4, padding: 2 },
  copyText: { fontSize: 13, color: COLORS.textMuted },
  typingBubble: { flexDirection: 'row', alignItems: 'center' },
  typingText: { fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic' },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44,
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: '#fff' },
})
