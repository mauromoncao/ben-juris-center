import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AUTH_PASSWORD, ALLOWED_EMAILS } from '../constants/agents'

const STORAGE_KEY = 'ben_ia_auth'

interface AuthContextType {
  isAuthenticated: boolean
  login: (credential: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => ({ ok: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val === 'true') setIsAuthenticated(true)
    })
  }, [])

  async function login(credential: string): Promise<{ ok: boolean; error?: string }> {
    const trimmed = credential.trim().toLowerCase()

    // Aceita senha provisória
    if (credential.trim() === AUTH_PASSWORD) {
      setIsAuthenticated(true)
      await AsyncStorage.setItem(STORAGE_KEY, 'true')
      return { ok: true }
    }

    // Aceita e-mails autorizados (Gmail)
    if (ALLOWED_EMAILS.includes(trimmed)) {
      setIsAuthenticated(true)
      await AsyncStorage.setItem(STORAGE_KEY, 'true')
      return { ok: true }
    }

    return { ok: false, error: 'Credencial não autorizada.' }
  }

  function logout() {
    setIsAuthenticated(false)
    AsyncStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
