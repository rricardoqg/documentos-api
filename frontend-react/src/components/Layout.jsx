import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import UploadModal from './UploadModal.jsx'
import { IconMenu } from './Icons.jsx'

// Evento global para avisar as páginas que a lista de documentos mudou
export const DOCS_CHANGED = 'docs:changed'
export const notifyDocsChanged = () =>
  window.dispatchEvent(new CustomEvent(DOCS_CHANGED))

// Contexto para abrir o modal de upload de qualquer lugar (sidebar, páginas)
const UploadContext = createContext(null)
export const useUpload = () => useContext(UploadContext)

export default function Layout({ title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const navigate = useNavigate()

  const openUpload = () => setUploadOpen(true)

  return (
    <UploadContext.Provider value={{ openUpload }}>
      <div className="layout">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="main">
          <header className="topbar">
            <button
              className="hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <IconMenu />
            </button>
            <span className="topbar-title">{title}</span>
            <div className="topbar-spacer" />
          </header>

          <main className="content">{children}</main>
        </div>

        {uploadOpen && (
          <UploadModal
            onClose={() => setUploadOpen(false)}
            onSuccess={() => {
              // garante que o usuário veja o novo documento na lista
              navigate('/')
              notifyDocsChanged()
            }}
          />
        )}
      </div>
    </UploadContext.Provider>
  )
}
