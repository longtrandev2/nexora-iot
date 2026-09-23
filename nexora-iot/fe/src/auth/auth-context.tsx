import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useIotApi } from '@/services/iot-api-context'
import type { User } from '@/types/iot'
import { clearToken, readToken, saveToken } from './token-store'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  /** True while restoring the session from a persisted token (guard waits). */
  initializing: boolean
  login(usernameOrEmail: string, password: string, remember: boolean): Promise<void>
  logout(): Promise<void>
  /** E-4: replace the cached user after a successful profile update. */
  updateUser(user: User): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = useIotApi()
  const [user, setUser] = useState<User | null>(null)
  // Only "initializing" when a token exists — otherwise the app is ready now.
  const [initializing, setInitializing] = useState<boolean>(() => readToken() !== null)

  // Refresh flow: token present → API-02 /auth/me; invalid → drop token.
  useEffect(() => {
    const token = readToken()
    if (!token) return
    api
      .getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setInitializing(false))
  }, [api])

  const login = useCallback(
    async (usernameOrEmail: string, password: string, remember: boolean) => {
      const res = await api.login(usernameOrEmail, password)
      saveToken(res.token, remember)
      setUser(res.user)
    },
    [api],
  )

  const logout = useCallback(async () => {
    try {
      await api.logout() // API-03: BE success is trivial; clearing is what matters
    } finally {
      clearToken()
      setUser(null)
    }
  }, [api])

  const updateUser = useCallback((next: User) => setUser(next), [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, initializing, login, logout, updateUser }),
    [user, initializing, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
