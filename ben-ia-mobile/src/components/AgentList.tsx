import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Platform,
} from 'react-native'
import { COLORS, AGENT_CATEGORIES, Agent } from '../constants/agents'
import { useAuth } from './AuthContext'

interface AgentListProps {
  onSelectAgent: (agent: Agent) => void
}

export default function AgentList({ onSelectAgent }: AgentListProps) {
  const { logout } = useAuth()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ juridico: true })

  function toggle(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.iconWrap}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.logoTitle}>BEN IA</Text>
            <Text style={styles.logoSub}>Workspace</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* ── Lista de categorias ── */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>AGENTES</Text>

        {AGENT_CATEGORIES.map(cat => (
          <View key={cat.key} style={styles.category}>
            {/* Cabeçalho da categoria */}
            <TouchableOpacity
              style={styles.catHeader}
              onPress={() => toggle(cat.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
              <Text style={styles.catCount}>{cat.agents.length}</Text>
              <Text style={styles.catChevron}>
                {expanded[cat.key] ? '▾' : '▸'}
              </Text>
            </TouchableOpacity>

            {/* Agentes da categoria */}
            {expanded[cat.key] && cat.agents.map(agent => (
              <TouchableOpacity
                key={agent.id}
                style={styles.agentItem}
                onPress={() => onSelectAgent(agent)}
                activeOpacity={0.75}
              >
                <Text style={styles.agentEmoji}>{agent.emoji}</Text>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentShortName} numberOfLines={1}>
                    {agent.shortName}
                  </Text>
                  <Text style={styles.agentModel} numberOfLines={1}>
                    {agent.model}
                  </Text>
                </View>
                {agent.badge && (
                  <View style={[styles.badge, { backgroundColor: agent.badgeColor || '#1d4ed8' }]}>
                    <Text style={styles.badgeText}>{agent.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Rodapé ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>BEN IA v1.0 · Acesso restrito</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(228,168,38,0.4)',
  },
  icon: { width: '130%', height: '130%', marginLeft: '-15%', marginTop: '-15%' },
  logoTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gold, letterSpacing: 1.5 },
  logoSub: { fontSize: 11, color: COLORS.textSecondary },
  logoutBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  logoutText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },

  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },

  category: { marginBottom: 2 },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 7,
  },
  catDot: { width: 7, height: 7, borderRadius: 3.5 },
  catLabel: { flex: 1, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  catCount: { fontSize: 11, color: COLORS.textMuted, marginRight: 2 },
  catChevron: { fontSize: 13, color: COLORS.textMuted },

  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    gap: 8,
  },
  agentEmoji: { fontSize: 17, width: 24, textAlign: 'center' },
  agentInfo: { flex: 1 },
  agentShortName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  agentModel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  badge: {
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
  },
  badgeText: { fontSize: 8, fontWeight: '700', color: '#fff', letterSpacing: 0.4 },

  bottomPad: { height: 24 },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: { fontSize: 10, color: COLORS.textMuted },
})
