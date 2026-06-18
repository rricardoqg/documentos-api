import { useCallback, useEffect, useState } from 'react'
import Layout, { DOCS_CHANGED, useUpload } from '../components/Layout.jsx'
import DocCard from '../components/DocCard.jsx'
import EditDocModal from '../components/EditDocModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Button from '../components/Button.jsx'
import Spinner from '../components/Spinner.jsx'
import { useToast } from '../components/Toast.jsx'
import { docsAPI } from '../services/api'

function DashboardInner() {
  const toast = useToast()
  const { openUpload } = useUpload()

  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await docsAPI.list()
      setDocs(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Carrega ao montar + recarrega quando um upload acontece (evento global)
  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener(DOCS_CHANGED, handler)
    return () => window.removeEventListener(DOCS_CHANGED, handler)
  }, [load])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Meus documentos</h1>
          <p className="page-sub">
            {loading
              ? 'Carregando…'
              : `${docs.length} documento${docs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="primary" onClick={openUpload}>
          + Novo documento
        </Button>
      </div>

      {loading ? (
        <Spinner center />
      ) : docs.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📄</div>
          <div className="empty-title">Nenhum documento ainda</div>
          <div className="empty-sub">
            Envie seu primeiro documento para começar.
          </div>
          <Button variant="primary" onClick={openUpload}>
            + Enviar documento
          </Button>
        </div>
      ) : (
        <div className="doc-grid">
          {docs.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditDocModal
          doc={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir documento"
          message={`Tem certeza que deseja excluir "${deleting.nome}"? Esta ação não pode ser desfeita e o arquivo será removido.`}
          confirmLabel="Excluir"
          danger
          onConfirm={async () => {
            await docsAPI.remove(deleting.id)
            toast.success('Documento excluído.')
            load()
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  )
}

export default function Dashboard() {
  return (
    <Layout title="Documentos">
      <DashboardInner />
    </Layout>
  )
}
