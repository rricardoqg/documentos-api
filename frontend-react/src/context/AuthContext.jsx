import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authAPI, getToken, setToken, clearToken } from '../services/api'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(getToken())
  // loading inicial: estamos validando o token existente?
  const [loading, setLoading] = useState(Boolean(getToken()))

  // Limpa toda a sessão (local + estado)
  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  // Busca os dados do usuário logado a partir do token salvo
  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    try {
      const me = await authAPI.me()
      setUser(me)
    } catch {
      // token inválido/expirado
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  // Ao montar: tenta restaurar a sessão
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // O interceptor do axios dispara este evento quando recebe 401
  useEffect(() => {
    const handler = () => logout()
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [logout])

  // Faz login e carrega o usuário; lança erro (string amigável) em falha
  const login = useCallback(async (email, senha) => {
    const { access_token } = await authAPI.login(email, senha)
    setToken(access_token)
    setTokenState(access_token)
    const me = await authAPI.me()
    setUser(me)
    return me
  }, [])

  // Cadastra e já faz login automático
  const register = useCallback(
    async (nome, email, senha) => {
      await authAPI.register(nome, email, senha)
      return login(email, senha)
    },
    [login]
  )

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user?.is_admin),
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
