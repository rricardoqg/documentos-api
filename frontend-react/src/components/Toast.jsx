import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

// Hook usado pelas páginas/componentes: const toast = useToast()
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}

let idSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    // marca como "leaving" para animar a saída, depois remove
    setToasts((cur) =>
      cur.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    )
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id))
    }, 200)
  }, [])

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++idSeq
      setToasts((cur) => [...cur, { id, message, type, leaving: false }])
      if (duration > 0) setTimeout(() => remove(id), duration)
      return id
    },
    [remove]
  )

  // Atalhos: toast.success(...), toast.error(...), toast.info(...)
  const toast = useCallback(
    (message, type, duration) => push(message, type, duration),
    [push]
  )
  toast.success = (m, d) => push(m, 'success', d)
  toast.error = (m, d) => push(m, 'error', d)
  toast.info = (m, d) => push(m, 'info', d)

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-area">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}${t.leaving ? ' leaving' : ''}`}
            onClick={() => remove(t.id)}
          >
            <span className="toast-dot" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
