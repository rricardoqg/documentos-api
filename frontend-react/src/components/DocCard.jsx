import Button from './Button.jsx'
import { formatDate, PRIORIDADES } from '../utils/format'

// Card de um documento. `showOwner` exibe o dono (usado no painel admin).
export default function DocCard({ doc, showOwner = false, onEdit, onDelete }) {
  const prio = doc.prioridade || 'media'

  return (
    <div className="doc-card">
      <div className="doc-card-top">
        <span className="file-badge">
          {(doc.tipo_documento || 'arquivo').toUpperCase()}
        </span>
        <span className={`prio prio-${prio}`}>
          <span className="prio-dot" />
          {PRIORIDADES[prio] || prio}
        </span>
      </div>

      <div className="doc-name" title={doc.nome}>{doc.nome}</div>

      <div className="doc-meta">
        {showOwner && (
          <div className="doc-meta-row">👤 Usuário #{doc.usuario_id}</div>
        )}
        <div className="doc-meta-row">📅 Criado em {formatDate(doc.criado_em)}</div>
        {doc.atualizado_em && (
          <div className="doc-meta-row">✏️ Editado em {formatDate(doc.atualizado_em)}</div>
        )}
      </div>

      <div className="doc-actions">
        <Button size="sm" variant="ghost" onClick={() => onEdit(doc)}>
          Editar
        </Button>
        <Button size="sm" variant="subtle" onClick={() => onDelete(doc)}>
          Deletar
        </Button>
      </div>
    </div>
  )
}
