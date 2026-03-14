// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface AuthUser {
  email: string
  nome: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  loginWithPassword: (senha: string) => Promise<boolean>
  loginWithGoogle: (email: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// ── Credenciais ──────────────────────────────────────────────
const MASTER_PASSWORD = '12345678'

const ALLOWED_EMAILS = [
  'mauromoncaoestudos@gmail.com',
  'mauromoncaoadv.escritorio@gmail.com',
]

const USER_MAP: Record<string, string> = {
  'mauromoncaoestudos@gmail.com':       'Mauro Monção (Estudos)',
  'mauromoncaoadv.escritorio@gmail.com':'Mauro Monção (Escritório)',
}

const STORAGE_KEY = 'ben_ia_app_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carrega sessão salva
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setUser(JSON.parse(raw)) } catch {}
      }
      setIsLoading(false)
    })
  }, [])

  const _save = async (u: AuthUser) => {
    setUser(u)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  // Login por senha provisória (qualquer e-mail + senha mestre)
  const loginWithPassword = async (senha: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500))
    if (senha === MASTER_PASSWORD) {
      await _save({ email: 'equipe@benai.app', nome: 'Equipe BEN IA' })
      return true
    }
    return false
  }

  // Login Google — valida se o e-mail está na whitelist
  const loginWithGoogle = async (email: string): Promise<boolean> => {
    if (ALLOWED_EMAILS.includes(email.toLowerCase())) {
      await _save({ email, nome: USER_MAP[email.toLowerCase()] || email })
      return true
    }
    return false
  }

  const logout = async () => {
    setUser(null)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginWithPassword, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
