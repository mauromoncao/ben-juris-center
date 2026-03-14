// src/screens/ChatScreen.tsx
// Tema idêntico ao BEN Ecosystem IA:
//   fundo geral #F2F4F8 | cards #FFFFFF | sidebar #0d1f3c
//   mensagem usuário: fundo #0d1f3c texto branco
//   mensagem bot: fundo #FFFFFF texto #1A1A1A
//   dourado: #E4B71E
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, Clipboard, StatusBar, ScrollView, Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AGENTS, DEFAULT_AGENT, CATEGORIES, JURIS_API, THEME, Agent } from '../data/agents'
import { useAuth } from '../context/AuthContext'

// Falcon logo — logo real BEN (zsDQqxh9.png recortado)
const FALCON_LOGO = require('../../assets/falcon-logo.png')

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  model?: string
  elapsed?: number
  loading?: boolean
}

const CONV_PREFIX = 'ben_ia_conv_'
const MAX_MSGS = 60
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function fmtMs(ms?: number) {
  if (!ms) return ''
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

export default function ChatScreen() {
  const navigation = useNavigation<any>()
  const { user } = useAuth()

  // Agente ativo — padrão: BEN Copilot
  const [agent, setAgent] = useState<Agent>(DEFAULT_AGENT)
  const [showAgentPicker, setShowAgentPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<FlatList>(null)

  // Carrega histórico do agente ativo
  useEffect(() => {
    AsyncStorage.getItem(CONV_PREFIX + agent.id).then(raw => {
      try { setMessages(raw ? JSON.parse(raw) : []) } catch { setMessages([]) }
    })
  }, [agent.id])

  const saveHistory = async (msgs: Message[]) => {
    try { await AsyncStorage.setItem(CONV_PREFIX + agent.id, JSON.stringify(msgs.slice(-MAX_MSGS))) } catch {}
  }

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages.length])

  // ── Envia mensagem ──────────────────────────────────────────
  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: Message = {
      id: uid(), role: 'user', content: text,
      timestamp: new Date().toISOString(),
    }
    const loadingMsg: Message = {
      id: 'loading', role: 'assistant', content: '',
      timestamp: '', loading: true,
    }
    const withUser = [...messages, userMsg]
    setMessages([...withUser, loadingMsg])
    setLoading(true)

    const t0 = Date.now()
    try {
      // Contexto das últimas 6 mensagens
      const ctx = messages.slice(-6)
        .map(m => `${m.role === 'user' ? 'Usuário' : 'BEN'}: ${m.content}`)
        .join('\n')

      // ── Chamada API com fallback automático ────────────────────
      const tryAgent = async (agentIdToTry: string) => {
        return fetch(`${JURIS_API}/api/agents/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId:  agentIdToTry,
            input:    text,
            clientId: user?.email || 'ben-ia-app',
            context:  ctx,
          }),
        })
      }

      // Fallbacks: se o agente retornar 404, tenta alternativa
      const AGENT_FALLBACKS: Record<string, string> = {
        'ben-assistente-geral': 'ben-agente-operacional-premium',
        'ben-assistente-voz':   'ben-agente-operacional-standard',
      }

      let res = await tryAgent(agent.id)
      if (res.status === 404 && AGENT_FALLBACKS[agent.id]) {
        res = await tryAgent(AGENT_FALLBACKS[agent.id])
      }

      if (!res.ok) throw new Error(`Servidor retornou ${res.status}`)
      const data = await res.json()
      const content = data.output ?? data.response ?? data.text ?? '(sem resposta)'
      const elapsed = Date.now() - t0

      const botMsg: Message = {
        id: uid(), role: 'assistant', content,
        timestamp: new Date().toISOString(),
        elapsed,
      }
      const final = [...withUser, botMsg]
      setMessages(final)
      await saveHistory(final)
    } catch (e: any) {
      const errMsg: Message = {
        id: uid(), role: 'assistant',
        content: `Não foi possível conectar ao servidor.\n\n${e.message}\n\nVerifique sua conexão e tente novamente.`,
        timestamp: new Date().toISOString(),
      }
      const final = [...withUser, errMsg]
      setMessages(final)
      await saveHistory(final)
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    Alert.alert('Limpar conversa', 'Apagar o histórico desta conversa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: async () => {
        setMessages([])
        await AsyncStorage.removeItem(CONV_PREFIX + agent.id)
      }},
    ])
  }

  const copyMsg = (txt: string) => {
    Clipboard.setString(txt)
  }

  // ── Picker de agente ─────────────────────────────────────────
  const filteredAgents = pickerSearch.trim()
    ? AGENTS.filter(a =>
        a.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        a.shortName.toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : AGENTS

  const pickerSections = CATEGORIES.map(cat => ({
    ...cat,
    data: filteredAgents.filter(a => a.category === cat.key),
  })).filter(s => s.data.length > 0)

  const selectAgent = (a: Agent) => {
    setAgent(a)
    setShowAgentPicker(false)
    setPickerSearch('')
  }

  // ── Render mensagem ──────────────────────────────────────────
  const renderMessage = ({ item }: { item: Message }) => {
    if (item.loading) {
      return (
        <View style={styles.bubbleRow}>
          <View style={[styles.botAvatar, { backgroundColor: agent.color + '22' }]}>
            <Image source={FALCON_LOGO} style={styles.falconAvatar} />
          </View>
          <View style={styles.loadingBubble}>
            <View style={styles.dotRow}>
              {[0,1,2].map(i => (
                <View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
              ))}
            </View>
          </View>
        </View>
      )
    }

    const isUser = item.role === 'user'
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => copyMsg(item.content)}
        style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}
      >
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: agent.color + '22' }]}>
            <Image source={FALCON_LOGO} style={styles.falconAvatar} />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleBot,
          { maxWidth: '78%' },
        ]}>
          <Text style={isUser ? styles.textUser : styles.textBot}>
            {item.content}
          </Text>
          {!isUser && !!item.elapsed && (
            <View style={styles.metaRow}>
              <Text style={styles.metaTxt}>{agent.shortName}</Text>
              {item.elapsed > 0 && <Text style={styles.metaTxt}>⏱ {fmtMs(item.elapsed)}</Text>}
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.sidebarBg} />

      {/* ════ HEADER — tema sidebar azul marinho ═══════════════ */}
      <View style={styles.header}>
        {/* Agente ativo — toca para trocar */}
        <TouchableOpacity
          style={styles.agentBtn}
          onPress={() => setShowAgentPicker(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.agentIconSmall, { backgroundColor: '#0d1f3c' }]}>
            <Image source={FALCON_LOGO} style={styles.falconSmall} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.agentBtnName} numberOfLines={1}>{agent.name}</Text>
            <Text style={styles.agentBtnModel}>▾ trocar agente</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* ════ CHAT ════════════════════════════════════════════= */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: '#0d1f3c' }]}>
              <Image source={FALCON_LOGO} style={styles.falconEmpty} />
            </View>
            <Text style={styles.emptyName}>{agent.shortName}</Text>
            <Text style={styles.emptyDesc}>{agent.description}</Text>
            <View style={styles.emptyHintBox}>
              <Text style={styles.emptyHint}>💬 Envie uma mensagem para começar</Text>
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.msgList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ── Input ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`Mensagem para ${agent.shortName}...`}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnOff]}
            onPress={send}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendIcon}>↑</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ════ AGENT PICKER MODAL ════════════════════════════════ */}
      {showAgentPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            {/* Header picker */}
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Escolher Agente</Text>
              <TouchableOpacity onPress={() => { setShowAgentPicker(false); setPickerSearch('') }}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Busca */}
            <View style={styles.pickerSearch}>
              <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Buscar agente..."
                placeholderTextColor="#9CA3AF"
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoFocus
              />
            </View>
            {/* Lista por categoria */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {pickerSections.map(section => (
                <View key={section.key}>
                  <View style={styles.pickerSectionHeader}>
                    <Image source={FALCON_LOGO} style={styles.falconCatIcon} />
                    <Text style={[styles.pickerSectionLabel, { color: section.color }]}>
                      {section.label}
                    </Text>
                    <Text style={styles.pickerSectionCount}>{section.data.length}</Text>
                  </View>
                  {section.data.map(a => (
                    <TouchableOpacity
                      key={a.id}
                      style={[
                        styles.pickerItem,
                        a.id === agent.id && styles.pickerItemActive,
                      ]}
                      onPress={() => selectAgent(a)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.pickerItemIcon, { backgroundColor: '#0d1f3c', borderColor: a.color + '44' }]}>
                        <Image source={FALCON_LOGO} style={styles.falconPickerItem} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.pickerItemName} numberOfLines={1}>{a.name}</Text>
                          {a.badge && (
                            <View style={[styles.pickerBadge, { backgroundColor: (a.badgeColor || '#374151') + '22', borderColor: a.badgeColor || '#374151' }]}>
                              <Text style={[styles.pickerBadgeTxt, { color: a.badgeColor || '#374151' }]}>{a.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.pickerItemModel} numberOfLines={2}>{a.description}</Text>
                      </View>
                      {a.id === agent.id && <Text style={{ color: THEME.gold, fontSize: 18 }}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bgPage },

  // ── Header (sidebar azul marinho, igual Ecosystem) ──────────
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 12, paddingHorizontal: 14,
    backgroundColor: THEME.sidebarBg,
    borderBottomWidth: 1, borderBottomColor: '#1e3a60',
  },
  agentBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  agentIconSmall:{ width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  agentBtnName:  { fontSize: 13, fontWeight: '700', color: '#D0E4FF' },
  agentBtnModel: { fontSize: 11, color: THEME.sidebarText, marginTop: 1 },
  clearBtn:      { padding: 8, marginLeft: 6 },

  // ── Chat área ────────────────────────────────────────────────
  msgList: { padding: 16, paddingBottom: 10 },

  bubbleRow:     { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  bubbleRowUser: { justifyContent: 'flex-end' },

  botAvatar:   { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 },
  avatarEmoji: { fontSize: 16 },

  bubble:     { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: THEME.userBubble, borderBottomRightRadius: 4 },
  bubbleBot:  { backgroundColor: THEME.bgCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: THEME.borderSub,
    // sombra leve
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  textUser: { color: THEME.userText, fontSize: 14, lineHeight: 21 },
  textBot:  { color: THEME.textMain, fontSize: 14, lineHeight: 21 },
  metaRow:  { flexDirection: 'row', gap: 8, marginTop: 6, opacity: 0.5 },
  metaTxt:  { fontSize: 10, color: THEME.textMuted },

  loadingBubble: {
    backgroundColor: THEME.bgCard, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1, borderColor: THEME.borderSub,
  },
  dotRow: { flexDirection: 'row', gap: 5 },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.goldDark },

  // ── Input bar ────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: THEME.bgCard,
    borderTopWidth: 1, borderTopColor: THEME.border,
    gap: 8,
  },
  textInput: {
    flex: 1, backgroundColor: THEME.bgPage, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    color: THEME.textMain, fontSize: 15, maxHeight: 120,
    borderWidth: 1.5, borderColor: THEME.border,
  },
  sendBtn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.sidebarBg, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff: { backgroundColor: '#D1D5DB' },
  sendIcon:   { fontSize: 22, color: '#fff', fontWeight: '700', lineHeight: 28 },

  // ── Empty state ───────────────────────────────────────────────
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: THEME.bgPage },
  emptyIcon:   { width: 110, height: 110, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyName:   { fontSize: 20, fontWeight: '700', color: THEME.textMain, marginBottom: 8 },
  emptyDesc:   { fontSize: 13, color: THEME.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyHintBox:{ backgroundColor: THEME.blueBg, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: THEME.blueBorder },
  emptyHint:   { fontSize: 13, color: THEME.blue },

  // ── Agent picker ─────────────────────────────────────────────
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  pickerSheet: {
    backgroundColor: THEME.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: THEME.border,
  },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: THEME.textMain },
  pickerClose: { fontSize: 18, color: THEME.textMuted, padding: 4 },

  pickerSearch: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 14,
    backgroundColor: THEME.bgPage, borderRadius: 12,
    borderWidth: 1, borderColor: THEME.border, height: 44,
  },
  pickerSearchInput: { flex: 1, color: THEME.textMain, fontSize: 14 },

  pickerSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 4,
    backgroundColor: '#F8FAFC',
  },
  pickerSectionEmoji: { fontSize: 14, marginRight: 6 },
  pickerSectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  pickerSectionCount: { fontSize: 10, color: THEME.textMuted, backgroundColor: THEME.border, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },

  pickerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  pickerItemActive: { backgroundColor: '#F0F7FF' },
  pickerItemIcon:   { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pickerItemName:   { fontSize: 13, fontWeight: '600', color: THEME.textMain, flex: 1 },
  pickerItemModel:  { fontSize: 11, color: THEME.textMuted, marginTop: 2 },
  pickerBadge:      { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1 },
  pickerBadgeTxt:   { fontSize: 8, fontWeight: '700' },

  // ── Falcon logo real (zsDQqxh9.png) ─────────────────────────
  falconAvatar:     { width: 26, height: 26, borderRadius: 6, resizeMode: 'contain' },
  falconSmall:      { width: 30, height: 30, borderRadius: 7, resizeMode: 'contain' },
  falconEmpty:      { width: 86, height: 86, borderRadius: 20, resizeMode: 'contain' },
  falconCatIcon:    { width: 16, height: 16, borderRadius: 3, resizeMode: 'contain', marginRight: 6 },
  falconPickerItem: { width: 34, height: 34, borderRadius: 8, resizeMode: 'contain' },
})
