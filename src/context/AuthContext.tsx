// ============================================================
// BEN JURIS CENTER — Auth Context
// Credencial: BenHub@Center2026
// E-mails: mauromoncaoestudos@gmail.com | mauromoncaoadv.escritorio@gmail.com
// ============================================================
import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthUser {
  email: string
  nome: string
  modulo: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ ok: boolean; erro?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'ben_juris_auth'

// Credenciais — lidas de env vars Vercel com fallback hardcoded
// VITE_AUTH_EMAIL_1 / VITE_AUTH_SENHA_1 / VITE_AUTH_EMAIL_2 / VITE_AUTH_SENHA_2
const CREDENCIAIS = [
  {
    email: (import.meta.env.VITE_AUTH_EMAIL_1 as string) || 'mauromoncaoestudos@gmail.com',
    senha: (import.meta.env.VITE_AUTH_SENHA_1 as string) || 'BenHub@Center2026',
    nome: 'Mauro Monção',
    modulo: 'Ben Juris Center',
  },
  {
    email: (import.meta.env.VITE_AUTH_EMAIL_2 as string) || 'mauromoncaoadv.escritorio@gmail.com',
    senha: (import.meta.env.VITE_AUTH_SENHA_2 as string) || 'BenHub@Center2026',
    nome: 'Mauro Monção',
    modulo: 'Ben Juris Center',
  },
].filter(c => c.email && c.senha)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = async (email: string, password: string): Promise<{ ok: boolean; erro?: string }> => {
    await new Promise(r => setTimeout(r, 800))

    const cred = CREDENCIAIS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.senha === password
    )

    if (!cred) return { ok: false, erro: 'E-mail ou senha incorretos.' }

    const authUser: AuthUser = { email: cred.email, nome: cred.nome, modulo: cred.modulo }
    setUser(authUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    return { ok: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
