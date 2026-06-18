import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'

export default function Login() {
  const { login, register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Já logado? Não faz sentido ver o login.
  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function switchTab(next) {
    setTab(next)
    setError('')
  }

  function validate() {
    if (!email.trim() || !senha) return 'Preencha e-mail e senha.'
    if (tab === 'register') {
      if (nome.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.'
      if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.'
    }
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      if (tab === 'login') {
        await login(email.trim(), senha)
      } else {
        await register(nome.trim(), email.trim(), senha)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">D</span>
          <span className="auth-logo-text">Documentos</span>
        </div>

        <h1 className="auth-title">
          {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h1>
        <p className="auth-sub">
          {tab === 'login'
            ? 'Entre para acessar seus documentos.'
            : 'Leva menos de um minuto.'}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Entrar
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="field">
              <label className="field-label" htmlFor="nome">Nome</label>
              <input
                id="nome"
                className="field-input"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="senha">Senha</label>
            <input
              id="senha"
              className="field-input"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="modal-msg">{error}</div>}

          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting}
            style={{ marginTop: 8 }}
          >
            {tab === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="auth-foot">
          {tab === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <button
            type="button"
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontWeight: 500,
              padding: 0,
            }}
          >
            {tab === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
