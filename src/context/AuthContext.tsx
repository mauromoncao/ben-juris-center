// ============================================================
// BEN JURIS CENTER — Auth Context
// Suporta: email/senha + Google OAuth (GSI)
// Client ID: 9749981324-sv27al0lv1t7ikb2i1fpdq05k65hjaoe.apps.googleusercontent.com
// ============================================================
import { createContext, useContext, useState, type ReactNode } from 'react'

// Declaração global do Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
          prompt: () => void
          disableAutoSelect: () => void
          revoke: (hint: string, callback: () => void) => void
        }
      }
    }
  }
}

// ── Tipo de usuário autenticado ────────────────────────────
interface AuthUser {
  email: string
  nome: string
  modulo: string
  picture?: string
  loginMethod?: 'email' | 'google'
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ ok: boolean; erro?: string }>
  loginWithGoogle: (credential: string) => Promise<{ ok: boolean; erro?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'ben_juris_auth'

// ── Credenciais email/senha ────────────────────────────────
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

// ── E-mails autorizados para Google login ─────────────────
const EMAILS_AUTORIZADOS_ADMIN = CREDENCIAIS.map(c => c.email.toLowerCase())

// ── Decodifica JWT do Google (sem lib externa) ─────────────
function decodeGoogleJwt(credential: string): {
  email?: string
  name?: string
  picture?: string
  sub?: string
} | null {
  try {
    const parts = credential.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const padded = payload + '==='.slice((payload.length + 3) % 4)
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // ── Login email/senha ────────────────────────────────────
  const login = async (email: string, password: string): Promise<{ ok: boolean; erro?: string }> => {
    await new Promise(r => setTimeout(r, 800))

    const cred = CREDENCIAIS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.senha === password
    )

    if (!cred) return { ok: false, erro: 'E-mail ou senha incorretos.' }

    const authUser: AuthUser = {
      email: cred.email,
      nome: cred.nome,
      modulo: cred.modulo,
      loginMethod: 'email',
    }
    setUser(authUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    return { ok: true }
  }

  // ── Login Google OAuth ───────────────────────────────────
  const loginWithGoogle = async (credential: string): Promise<{ ok: boolean; erro?: string }> => {
    const payload = decodeGoogleJwt(credential)
    if (!payload?.email) return { ok: false, erro: 'Credencial Google inválida.' }

    const emailNorm = payload.email.toLowerCase()

    // Verifica se o email está autorizado (admin panel)
    if (!EMAILS_AUTORIZADOS_ADMIN.includes(emailNorm)) {
      return {
        ok: false,
        erro: `Conta Google "${payload.email}" não está autorizada para este painel.`,
      }
    }

    const authUser: AuthUser = {
      email: payload.email,
      nome: payload.name || 'Mauro Monção',
      modulo: 'Ben Juris Center',
      picture: payload.picture,
      loginMethod: 'google',
    }
    setUser(authUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    return { ok: true }
  }

  // ── Logout ───────────────────────────────────────────────
  const logout = () => {
    // Revoga sessão Google se disponível
    if (user?.loginMethod === 'google' && user.email && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.revoke(user.email, () => {})
      } catch {}
    }
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
