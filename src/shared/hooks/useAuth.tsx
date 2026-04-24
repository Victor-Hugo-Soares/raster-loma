import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isMockMode } from '@/infra/supabase/client'
import type { PerfilUsuario } from '@/types/domain.types'

// ─── App user shape (compatible with previous user.id usage) ─────────────────
export interface AppUser {
  id: string
  email: string | null
}

// ─── Mock session ─────────────────────────────────────────────────────────────
const MOCK_SESSION_KEY = 'loma_mock_session'

const MOCK_USER: AppUser = { id: 'mock-user-id', email: 'demo@loma.local' }

const MOCK_PERFIL: PerfilUsuario = {
  id: 'mock-user-id',
  nome: 'Admin Demo',
  role: 'admin',
  tecnico_id: null,
  ativo: true,
  criado_em: new Date().toISOString(),
}
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  session: AppUser | null
  user: AppUser | null
  perfil: PerfilUsuario | null
  loading: boolean
  isMock: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      const stored = localStorage.getItem(MOCK_SESSION_KEY)
      if (stored === 'true') {
        setUser(MOCK_USER)
        setPerfil(MOCK_PERFIL)
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AppUser = { id: firebaseUser.uid, email: firebaseUser.email }
        setUser(appUser)
        await fetchPerfil(firebaseUser.uid)
      } else {
        setUser(null)
        setPerfil(null)
      }
      setLoading(false)
    })

    return unsub
  }, [])

  async function fetchPerfil(userId: string) {
    try {
      const snap = await getDoc(doc(db, 'perfisUsuario', userId))
      if (snap.exists()) setPerfil(snap.data() as PerfilUsuario)
    } catch {
      // perfil não encontrado — continua sem perfil
    }
  }

  async function signIn(email: string, password: string) {
    if (isMockMode) {
      localStorage.setItem(MOCK_SESSION_KEY, 'true')
      setUser(MOCK_USER)
      setPerfil(MOCK_PERFIL)
      return
    }
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password)
    const appUser: AppUser = { id: fbUser.uid, email: fbUser.email }
    setUser(appUser)
    await fetchPerfil(fbUser.uid)
  }

  async function signInWithGoogle() {
    if (isMockMode) {
      localStorage.setItem(MOCK_SESSION_KEY, 'true')
      setUser(MOCK_USER)
      setPerfil(MOCK_PERFIL)
      return
    }
    const provider = new GoogleAuthProvider()
    const { user: fbUser } = await signInWithPopup(auth, provider)
    const appUser: AppUser = { id: fbUser.uid, email: fbUser.email }
    setUser(appUser)
    await fetchPerfil(fbUser.uid)
  }

  async function signOut() {
    if (isMockMode) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      setUser(null)
      setPerfil(null)
      return
    }
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        session: user,
        user,
        perfil,
        loading,
        isMock: isMockMode,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
