import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import DocCard from '../components/DocCard.jsx'
import EditDocModal from '../components/EditDocModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import Button from '../components/Button.jsx'
import Spinner from '../components/Spinner.jsx'
import { useToast } from '../components/Toast.jsx'
import { docsAPI, usersAPI } from '../services/api'

function AdminInner() {
  const toast = useToast()

  const [docs, setDocs] = useState([])
  const [users, setUsers] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)

  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deactivating, setDeactivating] = useState(null)

  const loadDocs = useCallback(async () => {
    setLoadingDocs(true)
    try {
      setDocs(await docsAPI.listAll())
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingDocs(false)
    }
  }, [toast])

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      setUsers(await usersAPI.list())
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingUsers(false)
    }
  }, [toast])

  useEffect(() => {
    loadDocs()
    loadUsers()
  }, [loadDocs, loadUsers])

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Painel administrativo</h1>
          <p className="page-sub">Gerencie todos os documentos e usuários.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            loadDocs()
            loadUsers()
          }}
        >
          Atualizar
        </Button>
      </div>

      {/* ---- Todos os documentos ---- */}
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 14px' }}>
        Todos os documentos
      </h2>
      {loadingDocs ? (
        <Spinner center />
      ) : docs.length === 0 ? (
        <div className="empty">
          <div className="empty-title">Nenhum documento cadastrado</div>
        </div>
      ) : (
        <div className="doc-grid">
          {docs.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              showOwner
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {/* ---- Usuários ---- */}
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: '32px 0 14px' }}>
        Usuários
      </h2>
      {loadingUsers ? (
        <Spinner center />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Admin</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.is_admin ? <span className="tag tag-admin">Admin</span> : '—'}
                  </td>
                  <td>
                    <span className={`tag ${u.ativo ? 'tag-active' : 'tag-inactive'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.ativo ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeactivating(u)}
                      >
                        Desativar
                      </Button>
                    ) : (
                      <span style={{ color: 'var(--text-light)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Modais ---- */}
      {editing && (
        <EditDocModal
          doc={editing}
          onClose={() => setEditing(null)}
          onSaved={loadDocs}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Excluir documento"
          message={`Excluir "${deleting.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          danger
          onConfirm={async () => {
            await docsAPI.remove(deleting.id)
            toast.success('Documento excluído.')
            loadDocs()
          }}
          onClose={() => setDeleting(null)}
        />
      )}

      {deactivating && (
        <ConfirmModal
          title="Desativar usuário"
          message={`Desativar o usuário "${deactivating.nome}"? Ele não poderá mais acessar o sistema.`}
          confirmLabel="Desativar"
          danger
          onConfirm={async () => {
            await usersAPI.deactivate(deactivating.id)
            toast.success('Usuário desativado.')
            loadUsers()
          }}
          onClose={() => setDeactivating(null)}
        />
      )}
    </>
  )
}

export default function Admin() {
  return (
    <Layout title="Administração">
      <AdminInner />
    </Layout>
  )
}
