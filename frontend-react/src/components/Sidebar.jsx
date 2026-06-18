import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useUpload } from './Layout.jsx'
import { IconDoc, IconUpload, IconAdmin, IconLogout } from './Icons.jsx'

// Inicial do usuário para o avatar
function initials(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth()
  const { openUpload } = useUpload()

  const navClass = ({ isActive }) =>
    `nav-item${isActive ? ' active' : ''}`

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">D</span>
          <span className="sidebar-brand-text">Documentos</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={navClass} onClick={onClose}>
            <span className="nav-icon"><IconDoc /></span>
            Documentos
          </NavLink>

          <button
            className="nav-item"
            onClick={() => {
              onClose?.()
              openUpload()
            }}
          >
            <span className="nav-icon"><IconUpload /></span>
            Enviar documento
          </button>

          {isAdmin && (
            <>
              <div className="sidebar-section-label">Administração</div>
              <NavLink to="/admin" className={navClass} onClick={onClose}>
                <span className="nav-icon"><IconAdmin /></span>
                Painel admin
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <span className="user-avatar">{initials(user?.nome)}</span>
            <div className="user-meta">
              <div className="user-name">{user?.nome}</div>
              <div className="user-role">{isAdmin ? 'Administrador' : 'Usuário'}</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{ marginTop: 4 }}>
            <span className="nav-icon"><IconLogout /></span>
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
