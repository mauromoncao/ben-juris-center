// src/screens/AgentsScreen.tsx — lista de agentes por categoria
import React, { useState, useMemo } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SectionList, StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AGENTS, CATEGORIES, Agent } from '../data/agents'

export default function AgentsScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch]         = useState('')
  const [activeCategory, setActiveCat] = useState<string | null>(null)

  // Filtra por busca e categoria
  const filtered = useMemo(() => {
    let list = AGENTS
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.shortName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      )
    }
    if (activeCategory) list = list.filter(a => a.category === activeCategory)
    return list
  }, [search, activeCategory])

  // Agrupa por categoria para SectionList
  const sections = useMemo(() => {
    return CATEGORIES
      .map(cat => ({
        title: cat.label,
        emoji: cat.emoji,
        color: cat.color,
        data: filtered.filter(a => a.category === cat.key),
      }))
      .filter(s => s.data.length > 0)
  }, [filtered])

  const openAgent = (agent: Agent) => {
    navigation.navigate('Chat', { agent })
  }

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentCard}
      onPress={() => openAgent(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.agentIcon, { backgroundColor: item.color + '22', borderColor: item.color + '55' }]}>
        <Text style={styles.agentEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.agentInfo}>
        <View style={styles.agentNameRow}>
          <Text style={styles.agentName} numberOfLines={1}>{item.name}</Text>
          {item.badge && (
            <View style={[styles.badge, { backgroundColor: (item.badgeColor || '#374151') + '33', borderColor: item.badgeColor || '#374151' }]}>
              <Text style={[styles.badgeText, { color: item.badgeColor || '#9ca3af' }]}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.agentDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.agentModel}>🤖 {item.model}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{section.emoji}</Text>
      <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  )

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BEN IA</Text>
          <Text style={styles.headerSub}>
            {AGENTS.length} agentes especializados
          </Text>
        </View>
      </View>

      {/* ── Busca ── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar agente..."
          placeholderTextColor="#4a5568"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtros de categoria ── */}
      <FlatList
        data={[{ key: 'all', label: 'Todos', emoji: '🌐', color: '#94a3b8' }, ...CATEGORIES.map(c => ({ key: c.key, label: c.label, emoji: c.emoji, color: c.color }))]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catBar}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              (activeCategory === item.key || (item.key === 'all' && !activeCategory)) && { backgroundColor: item.color + '33', borderColor: item.color },
            ]}
            onPress={() => setActiveCat(item.key === 'all' ? null : item.key)}
          >
            <Text style={styles.catChipText}>{item.emoji} {item.label}</Text>
          </TouchableOpacity>
        )}
      />

      {/* ── Lista ── */}
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Nenhum agente encontrado</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderAgent}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1628' },

  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, backgroundColor: '#0d1520', borderBottomWidth: 1, borderBottomColor: '#1e2d45' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#E4A826', letterSpacing: 1 },
  headerSub:   { fontSize: 12, color: '#64748b', marginTop: 2 },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', margin: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1e2d45', paddingHorizontal: 12 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: '#e2e8f0', fontSize: 14 },
  clearBtn:    { padding: 6 },
  clearIcon:   { color: '#64748b', fontSize: 14 },

  catBar:  { paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1e2d45' },
  catChipText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  list: { paddingHorizontal: 12, paddingBottom: 30 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  sectionEmoji:  { fontSize: 16, marginRight: 6 },
  sectionTitle:  { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  sectionCount:  { fontSize: 11, color: '#475569', backgroundColor: '#1e2d45', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },

  agentCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1e2d45' },
  agentIcon:   { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1 },
  agentEmoji:  { fontSize: 22 },
  agentInfo:   { flex: 1 },
  agentNameRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  agentName:   { fontSize: 13, fontWeight: '700', color: '#e2e8f0', flex: 1 },
  badge:       { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1 },
  badgeText:   { fontSize: 8, fontWeight: '700' },
  agentDesc:   { fontSize: 11, color: '#64748b', lineHeight: 15, marginBottom: 4 },
  agentModel:  { fontSize: 10, color: '#475569' },
  chevron:     { fontSize: 22, color: '#334155', marginLeft: 8 },

  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#475569', fontSize: 15 },
})
