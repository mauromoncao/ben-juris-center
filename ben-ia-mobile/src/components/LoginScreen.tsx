import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView, Dimensions,
} from 'react-native'
import { useAuth } from '../components/AuthContext'
import { COLORS } from '../constants/agents'

const { width } = Dimensions.get('window')

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const { login } = useAuth()
  const [credential, setCredential] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHint, setShowHint] = useState(false)

  async function handleLogin() {
    if (!credential.trim()) {
      setError('Digite a senha ou e-mail autorizado.')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(credential)
    setLoading(false)
    if (result.ok) {
      onLogin()
    } else {
      setError(result.error || 'Acesso negado.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo ── */}
        <View style={styles.logoWrap}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>BEN IA</Text>
          <Text style={styles.appSub}>Workspace Jurídico Inteligente</Text>
        </View>

        {/* ── Card de login ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesso Restrito</Text>
          <Text style={styles.cardSub}>
            Use a senha ou o e-mail autorizado
          </Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Senha ou e-mail Gmail"
            placeholderTextColor={COLORS.textMuted}
            value={credential}
            onChangeText={t => { setCredential(t); setError('') }}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!credential.includes('@')}
            keyboardType={credential.includes('@') ? 'email-address' : 'default'}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />

          {error ? (
            <Text style={styles.errorText}>⚠ {error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Entrar</Text>
            }
          </TouchableOpacity>

          {/* Dica */}
          <TouchableOpacity onPress={() => setShowHint(h => !h)} style={styles.hintToggle}>
            <Text style={styles.hintToggleText}>
              {showHint ? '▲ Ocultar dica' : '▼ Como acessar?'}
            </Text>
          </TouchableOpacity>

          {showHint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                <Text style={styles.hintBold}>Senha provisória: </Text>
                12345678{'\n'}
                <Text style={styles.hintBold}>Ou e-mail: </Text>
                mauromoncaoestudos@gmail.com{'\n'}
                mauromoncaoadv.escritorio@gmail.com
              </Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <Text style={styles.footer}>
          BEN IA v1.0 · Acesso exclusivo · 2026
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 36,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(228,168,38,0.3)',
  },
  icon: {
    width: '130%',
    height: '130%',
    marginLeft: '-15%',
    marginTop: '-15%',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 3,
  },
  appSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginBottom: 12,
    paddingLeft: 4,
  },
  btn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  hintToggle: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  hintToggleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  hintBox: {
    backgroundColor: 'rgba(228,168,38,0.07)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(228,168,38,0.2)',
    padding: 12,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  hintBold: {
    fontWeight: '700',
    color: COLORS.gold,
  },
  footer: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 32,
    textAlign: 'center',
  },
})
