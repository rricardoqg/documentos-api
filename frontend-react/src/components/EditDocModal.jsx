import { useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import { useToast } from './Toast.jsx'
import { docsAPI } from '../services/api'

// Edita nome e prioridade de um documento.
export default function EditDocModal({ doc, onClose, onSaved }) {
  const toast = useToast()
  const [nome, setNome] = useState(doc.nome)
  const [prioridade, setPrioridade] = useState(doc.prioridade || 'media')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (nome.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.')
      return
    }
    setError('')
    setSaving(true)
    try {
      await docsAPI.update(doc.id, { nome: nome.trim(), prioridade })
      toast.success('Documento atualizado!')
      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Editar documento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="ed-nome">Nome do documento</label>
          <input
            id="ed-nome"
            className="field-input"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={255}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ed-prio">Prioridade</label>
          <select
            id="ed-prio"
            className="field-input"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          >
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        {error && <div className="modal-msg">{error}</div>}

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
