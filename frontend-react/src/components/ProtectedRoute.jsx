import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

// Protege rotas. Com requireAdmin, exige is_admin.
export default function ProtectedRoute({ requireAdmin = false, children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Ainda validando o token salvo → evita "piscar" a tela de login
  if (loading) {
    return <Spinner center />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin && !isAdmin) {
    // logado mas sem permissão → manda pro dashboard
    return <Navigate to="/" replace />
  }

  return children
}
