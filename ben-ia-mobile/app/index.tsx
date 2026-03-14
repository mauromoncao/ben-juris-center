import React, { useState } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform, Animated, Image } from 'react-native'
import { useAuth } from '../src/components/AuthContext'
import LoginScreen from '../src/components/LoginScreen'
import AgentList from '../src/components/AgentList'
import ChatScreen from '../src/components/ChatScreen'
import { Agent, COLORS } from '../src/constants/agents'

const FALCON = require('../assets/falcon-logo.png')

const { width } = Dimensions.get('window')
const SIDEBAR_WIDTH = Math.min(width * 0.78, 300)
const IS_TABLET = width >= 768

export default function Index() {
  const { isAuthenticated } = useAuth()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Não autenticado → Tela de login ──
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => {}} />
  }

  // ── Tablet: layout split (sidebar fixo + chat) ──
  if (IS_TABLET) {
    return (
      <View style={styles.tabletRoot}>
        <View style={[styles.tabletSidebar, { width: SIDEBAR_WIDTH }]}>
          <AgentList onSelectAgent={agent => setSelectedAgent(agent)} />
        </View>
        <View style={styles.tabletMain}>
          {selectedAgent
            ? <ChatScreen agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
            : <WelcomeScreen onOpenSidebar={() => {}} isTablet />
          }
        </View>
      </View>
    )
  }

  // ── Mobile: drawer sidebar overlay ──
  return (
    <View style={styles.root}>
      {/* Chat principal ou welcome */}
      {selectedAgent
        ? (
          <ChatScreen
            agent={selectedAgent}
            onBack={() => setSelectedAgent(null)}
          />
        )
        : (
          <WelcomeScreen onOpenSidebar={() => setSidebarOpen(true)} isTablet={false} />
        )
      }

      {/* Botão hamburger flutuante quando há agente selecionado */}
      {selectedAgent && (
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => setSidebarOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Overlay escuro */}
      {sidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setSidebarOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Sidebar drawer */}
      {sidebarOpen && (
        <View style={[styles.drawer, { width: SIDEBAR_WIDTH }]}>
          <AgentList
            onSelectAgent={agent => {
              setSelectedAgent(agent)
              setSidebarOpen(false)
            }}
          />
        </View>
      )}
    </View>
  )
}

function WelcomeScreen({ onOpenSidebar, isTablet }: { onOpenSidebar: () => void; isTablet: boolean }) {
  return (
    <View style={welcomeStyles.root}>
      {/* Header com botão menu */}
      <View style={welcomeStyles.header}>
        {!isTablet && (
          <TouchableOpacity onPress={onOpenSidebar} style={welcomeStyles.menuBtn} activeOpacity={0.7}>
            <Text style={welcomeStyles.menuText}>☰</Text>
          </TouchableOpacity>
        )}
        <Text style={welcomeStyles.headerTitle}>BEN IA</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Conteúdo central */}
      <View style={welcomeStyles.content}>
        <Image source={FALCON} style={welcomeStyles.welcomeIcon} resizeMode="contain" />
        <Text style={welcomeStyles.welcomeTitle}>Bem-vindo ao BEN IA</Text>
        <Text style={welcomeStyles.welcomeText}>
          {isTablet
            ? 'Selecione um agente na barra lateral para iniciar.'
            : 'Toque em ☰ para abrir o menu e selecionar um agente.'
          }
        </Text>

        {!isTablet && (
          <TouchableOpacity onPress={onOpenSidebar} style={welcomeStyles.openBtn} activeOpacity={0.8}>
            <Text style={welcomeStyles.openBtnText}>Ver Agentes</Text>
          </TouchableOpacity>
        )}

        {/* Cards de categoria */}
        <View style={welcomeStyles.catGrid}>
          {[
            { emoji: '⚖️', label: 'Jurídico',        color: '#93C5FD', count: 21 },
            { emoji: '🧮', label: 'Contador',         color: '#FCD34D', count: 6  },
            { emoji: '🔬', label: 'Perito Forense',   color: '#C4B5FD', count: 7  },
            { emoji: '📣', label: 'Growth',           color: '#6EE7B7', count: 6  },
            { emoji: '🤖', label: 'Sistema',          color: '#A5B4FC', count: 5  },
          ].map(c => (
            <TouchableOpacity
              key={c.label}
              style={[welcomeStyles.catCard, { borderColor: c.color + '44' }]}
              onPress={onOpenSidebar}
              activeOpacity={0.8}
            >
              <Text style={welcomeStyles.catEmoji}>{c.emoji}</Text>
              <Text style={[welcomeStyles.catLabel, { color: c.color }]}>{c.label}</Text>
              <Text style={welcomeStyles.catCount}>{c.count} agentes</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  tabletRoot: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.bg },
  tabletSidebar: { borderRightWidth: 1, borderRightColor: COLORS.border },
  tabletMain: { flex: 1 },
  hamburger: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 18,
    left: 14,
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(13,31,60,0.9)',
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 99,
  },
  hamburgerText: { fontSize: 18, color: COLORS.textPrimary },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
  },
})

const welcomeStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  menuBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { fontSize: 20, color: COLORS.textPrimary },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gold, letterSpacing: 1.5 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  welcomeIcon: { width: 100, height: 100, marginBottom: 16, borderRadius: 22 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
  welcomeText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  openBtn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  openBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 400,
  },
  catCard: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minWidth: 110,
    gap: 4,
  },
  catEmoji: { fontSize: 24, marginBottom: 2 },
  catLabel: { fontSize: 12, fontWeight: '700' },
  catCount: { fontSize: 11, color: COLORS.textMuted },
})
