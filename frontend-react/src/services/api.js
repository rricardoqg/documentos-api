import axios from 'axios'

// Base da API (lida do .env; cai no localhost por padrão)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const TOKEN_KEY = 'docmgr_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
  baseURL: API_URL,
})

// --- Interceptor de REQUISIÇÃO: injeta o token JWT em todo request ---
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Interceptor de RESPOSTA: normaliza erros e trata 401 ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sem resposta = servidor fora do ar / CORS / rede
    if (!error.response) {
      return Promise.reject(
        new Error(
          `Não foi possível conectar ao servidor. Verifique se a API está rodando em ${API_URL}.`
        )
      )
    }

    const { status, data } = error.response

    // Token expirado/inválido → limpa sessão e avisa o app para redirecionar
    if (status === 401) {
      clearToken()
      // O AuthContext escuta este evento para deslogar e mandar pro /login
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'))
    }

    if (status === 403) {
      return Promise.reject(
        new Error('Você não tem permissão para realizar esta ação.')
      )
    }

    // FastAPI manda erros em `detail` (string) ou lista de validação
    let msg = `Erro ${status}.`
    if (data?.detail) {
      msg = Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg).join(' · ')
        : data.detail
    }
    return Promise.reject(new Error(msg))
  }
)

// ============================================================
// ENDPOINTS
// ============================================================

export const authAPI = {
  register: (nome, email, senha) =>
    api.post('/auth/register', { nome, email, senha }).then((r) => r.data),
  login: (email, senha) =>
    api.post('/auth/login', { email, senha }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const docsAPI = {
  upload: (formData) =>
    api.post('/documentos/upload', formData).then((r) => r.data),
  list: () => api.get('/documentos/').then((r) => r.data),
  get: (id) => api.get(`/documentos/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/documentos/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/documentos/${id}`).then((r) => r.data),
  listAll: () => api.get('/documentos/admin/todos').then((r) => r.data),
}

export const usersAPI = {
  list: () => api.get('/usuarios/').then((r) => r.data),
  deactivate: (id) =>
    api.put(`/usuarios/${id}/desativar`).then((r) => r.data),
}

export default api
