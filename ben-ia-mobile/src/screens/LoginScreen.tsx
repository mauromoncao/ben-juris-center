// src/screens/LoginScreen.tsx — tema claro idêntico ao Ecosystem IA
import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { THEME } from '../data/agents'

const ICON = require('../../assets/icon.png')

export default function LoginScreen() {
  const { loginWithPassword, loginWithGoogle } = useAuth()
  const [tab, setTab]         = useState<'senha' | 'email'>('senha')
  const [senha, setSenha]     = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const handleSenha = async () => {
    if (!senha) { setError('Digite a senha de acesso'); return }
    setLoading(true); setError('')
    const ok = await loginWithPassword(senha)
    setLoading(false)
    if (!ok) setError('Senha incorreta.')
  }

  const handleEmail = async () => {
    if (!email) { setError('Digite o e-mail autorizado'); return }
    setLoading(true); setError('')
    const ok = await loginWithGoogle(email.trim().toLowerCase())
    setLoading(false)
    if (!ok) setError('E-mail não autorizado. Contate o administrador.')
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Cabeçalho azul marinho (como o sidebar do Ecosystem) ── */}
        <View style={styles.topBar}>
          <Image source={ICON} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>BEN IA</Text>
          <Text style={styles.appSub}>Assistentes Jurídicos & Contábeis</Text>
        </View>

        {/* ── Card de login (fundo branco, como os cards do Ecosystem) ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso</Text>
          <Text style={styles.cardSub}>Área restrita — equipe autorizada</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'senha' && styles.tabActive]}
              onPress={() => { setTab('senha'); setError('') }}
            >
              <Text style={[styles.tabTxt, tab === 'senha' && styles.tabTxtActive]}>🔑 Senha</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'email' && styles.tabActive]}
              onPress={() => { setTab('email'); setError('') }}
            >
              <Text style={[styles.tabTxt, tab === 'email' && styles.tabTxtActive]}>📧 E-mail</Text>
            </TouchableOpacity>
          </View>

          {/* Senha */}
          {tab === 'senha' && (
            <View>
              <Text style={styles.label}>Senha de acesso</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPwd}
                  value={senha}
                  onChangeText={v => { setSenha(v); setError('') }}
                  onSubmitEditing={handleSenha}
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPwd(p => !p)}>
                  <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Senha compartilhada com a equipe para testes</Text>
            </View>
          )}

          {/* E-mail */}
          {tab === 'email' && (
            <View>
              <Text style={styles.label}>E-mail autorizado (Gmail)</Text>
              <TextInput
                style={[styles.input, { paddingRight: 14 }]}
                placeholder="seu@gmail.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={v => { setEmail(v); setError('') }}
                onSubmitEditing={handleEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
              />
              <Text style={styles.hint}>
                Autorizado: mauromoncaoestudos@gmail.com{'\n'}
                mauromoncaoadv.escritorio@gmail.com
              </Text>
            </View>
          )}

          {/* Erro */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTxt}>⚠️  {error}</Text>
            </View>
          )}

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={tab === 'senha' ? handleSenha : handleEmail}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnTxt}>{tab === 'senha' ? 'Entrar' : 'Verificar e Entrar'}</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>BEN IA v1.0 • Acesso restrito</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: THEME.bgPage },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },

  // Cabeçalho azul marinho
  topBar: {
    width: '100%', alignItems: 'center',
    paddingTop: 64, paddingBottom: 32,
    backgroundColor: THEME.sidebarBg,
  },
  logo:    { width: 90, height: 90, borderRadius: 20, marginBottom: 14,
    borderWidth: 2, borderColor: 'rgba(228,183,30,0.5)' },
  appName: { fontSize: 34, fontWeight: '800', color: THEME.gold, letterSpacing: 2 },
  appSub:  { fontSize: 13, color: THEME.sidebarText, marginTop: 4 },

  // Card branco
  card: {
    backgroundColor: THEME.bgCard, width: '100%', padding: 24,
    borderTopWidth: 1, borderTopColor: THEME.border,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: THEME.textMain, marginBottom: 4 },
  cardSub:   { fontSize: 12, color: THEME.textMuted, marginBottom: 20 },

  tabs:       { flexDirection: 'row', backgroundColor: THEME.bgPage, borderRadius: 10, padding: 3, marginBottom: 20 },
  tab:        { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive:  { backgroundColor: THEME.sidebarBg },
  tabTxt:     { fontSize: 13, color: THEME.textMuted, fontWeight: '600' },
  tabTxtActive:{ color: '#fff', fontWeight: '700' },

  label:    { fontSize: 12, color: THEME.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: THEME.border, borderRadius: 10, backgroundColor: THEME.bgPage, marginBottom: 8 },
  input:    { flex: 1, height: 48, paddingHorizontal: 14, color: THEME.textMain, fontSize: 15 },
  eyeBtn:   { paddingHorizontal: 12 },
  eyeIcon:  { fontSize: 18 },
  hint:     { fontSize: 11, color: THEME.textMuted, marginBottom: 12, lineHeight: 16 },

  errorBox: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' },
  errorTxt: { color: '#DC2626', fontSize: 13 },

  btn:    { backgroundColor: THEME.sidebarBg, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  btnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },

  footer: { padding: 24, fontSize: 11, color: THEME.textMuted },
})
