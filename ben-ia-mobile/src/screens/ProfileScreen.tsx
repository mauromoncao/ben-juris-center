// src/screens/ProfileScreen.tsx — tema claro Ecosystem IA
import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Image, Alert, ScrollView, StatusBar,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { AGENTS, CATEGORIES, THEME } from '../data/agents'
const ICON = require('../../assets/icon.png')
const FALCON_LOGO = require('../../assets/falcon-logo.png')

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  const countByCategory = CATEGORIES.map(cat => ({
    ...cat,
    count: AGENTS.filter(a => a.category === cat.key).length,
  }))

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.sidebarBg} />

      {/* ── Header azul marinho ── */}
      <View style={styles.topBar}>
        <Image source={ICON} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>BEN IA</Text>
        <Text style={styles.appSub}>v1.0 • Acesso Restrito</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Usuário ── */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarTxt}>
                {user?.nome?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activeDot}>●</Text>
              <Text style={styles.activeTxt}>Ativo</Text>
            </View>
          </View>
        </View>

        {/* ── Stats por categoria ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Agentes Disponíveis</Text>
          <View style={styles.statsGrid}>
            {countByCategory.map(cat => (
              <View key={cat.key} style={styles.statCard}>
                <View style={[styles.statEmojiWrap, { backgroundColor: cat.color + '22', borderRadius: 8 }]}><Image source={FALCON_LOGO} style={styles.falconStatIcon} /></View>
                <Text style={[styles.statNum, { color: cat.color }]}>{cat.count}</Text>
                <Text style={styles.statLabel}>{cat.label}</Text>
              </View>
            ))}
            <View style={[styles.statCard, { borderColor: THEME.gold + '66' }]}>
              <View style={[styles.statEmojiWrap, { backgroundColor: THEME.gold + '22', borderRadius: 8 }]}><Image source={FALCON_LOGO} style={styles.falconStatIcon} /></View>
              <Text style={[styles.statNum, { color: THEME.goldDark }]}>{AGENTS.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* ── Informações ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sobre o App</Text>
          <View style={styles.infoCard}>
            {[
              { k: 'Versão', v: '1.0.0' },
              { k: 'API', v: 'juris.mauromoncao.adv.br' },
              { k: 'Motor', v: 'BEN Ecosystem IA' },
              { k: 'Acesso', v: 'Equipe autorizada' },
            ].map((r, i, arr) => (
              <View key={r.k} style={[styles.infoRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.infoKey}>{r.k}</Text>
                <Text style={styles.infoVal}>{r.v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Módulos bloqueados ── */}
        <View style={styles.section}>
          <View style={styles.restrictBox}>
            <Text style={styles.restrictTitle}>🔒 Módulos não disponíveis neste app</Text>
            <Text style={styles.restrictTxt}>
              Growth Center, Juris Center e HUB Estratégico são acessíveis apenas via navegador web.
            </Text>
          </View>
        </View>

        {/* ── Logout ── */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutTxt}>🚪  Encerrar Sessão</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: THEME.bgPage },

  topBar: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 24,
    backgroundColor: THEME.sidebarBg,
  },
  logo:    { width: 72, height: 72, borderRadius: 16, marginBottom: 10, borderWidth: 2, borderColor: 'rgba(228,183,30,0.5)' },
  appName: { fontSize: 26, fontWeight: '800', color: THEME.gold, letterSpacing: 1 },
  appSub:  { fontSize: 12, color: THEME.sidebarText, marginTop: 3 },

  scroll:  { flex: 1 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionLabel: { fontSize: 11, color: THEME.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  userCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: THEME.border, gap: 12 },
  userAvatar:  { width: 48, height: 48, borderRadius: 12, backgroundColor: THEME.sidebarBg, alignItems: 'center', justifyContent: 'center' },
  userAvatarTxt:{ fontSize: 22, fontWeight: '800', color: THEME.gold },
  userName:    { fontSize: 15, fontWeight: '700', color: THEME.textMain, marginBottom: 2 },
  userEmail:   { fontSize: 12, color: THEME.textMuted },
  activePill:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeDot:   { color: '#059669', fontSize: 8 },
  activeTxt:   { color: '#059669', fontSize: 11, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard:  { backgroundColor: THEME.bgCard, borderRadius: 12, padding: 14, alignItems: 'center', minWidth: '30%', flex: 1, borderWidth: 1, borderColor: THEME.border },
  statEmoji:     { fontSize: 20, marginBottom: 4 },
  statEmojiWrap: { marginBottom: 6, padding: 4 },
  falconStatIcon:{ width: 28, height: 28, borderRadius: 6, resizeMode: 'contain' },
  statNum:   { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, color: THEME.textMuted, textAlign: 'center' },

  infoCard: { backgroundColor: THEME.bgCard, borderRadius: 14, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden' },
  infoRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: THEME.border },
  infoKey:  { fontSize: 13, color: THEME.textMuted },
  infoVal:  { fontSize: 13, color: THEME.textMain, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },

  restrictBox:  { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FECACA' },
  restrictTitle:{ fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 6 },
  restrictTxt:  { fontSize: 12, color: '#B91C1C', lineHeight: 18 },

  logoutBtn: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutTxt: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
})
