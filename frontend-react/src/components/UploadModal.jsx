import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'
import { useToast } from './Toast.jsx'
import { docsAPI } from '../services/api'

const TIPOS_OK = ['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg']
const MAX_MB = 10

export default function UploadModal({ onClose, onSuccess }) {
  const toast = useToast()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [nome, setNome] = useState('')
  const [prioridade, setPrioridade] = useState('media')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function pickFile(f) {
    if (!f) return
    setFile(f)
    // preenche o nome automaticamente se estiver vazio
    if (!nome.trim()) {
      setNome(f.name.replace(/\.[^/.]+$/, ''))
    }
  }

  function validate() {
    if (!file) return 'Selecione um arquivo antes de continuar.'
    if (nome.trim().length < 3)
      return 'O nome do documento deve ter pelo menos 3 caracteres.'
    const ext = file.name.split('.').pop().toLowerCase()
    if (!TIPOS_OK.includes(ext))
      return `Tipo ".${ext}" não permitido. Use PDF, DOCX, XLSX, PNG ou JPG.`
    if (file.size > MAX_MB * 1024 * 1024)
      return `O arquivo excede o limite de ${MAX_MB} MB.`
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
    setSaving(true)

    const fd = new FormData()
    fd.append('arquivo', file)
    fd.append('nome', nome.trim())
    fd.append('prioridade', prioridade)

    try {
      await docsAPI.upload(fd)
      toast.success('Documento enviado com sucesso!')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Novo documento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div
          className={`drop-zone${dragOver ? ' drag-over' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            pickFile(e.dataTransfer.files?.[0])
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <div className="drop-icon">📎</div>
          <div className="drop-text">Clique ou arraste o arquivo aqui</div>
          <div className="drop-hint">PDF · DOCX · XLSX · PNG · JPG — máx. {MAX_MB} MB</div>
          {file && (
            <div className="drop-selected">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="up-nome">Nome do documento</label>
          <input
            id="up-nome"
            className="field-input"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Contrato de prestação de serviços"
            maxLength={255}
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="up-prio">Prioridade</label>
          <select
            id="up-prio"
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
            Fazer upload
          </Button>
        </div>
      </form>
    </Modal>
  )
}
