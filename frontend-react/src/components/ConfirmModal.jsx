import { useState } from 'react'
import Modal from './Modal.jsx'
import Button from './Button.jsx'

// Diálogo genérico de confirmação. `onConfirm` deve ser uma função async.
export default function ConfirmModal({
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  danger = false,
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {message}
      </p>

      {error && <div className="modal-msg">{error}</div>}

      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
