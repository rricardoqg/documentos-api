// Formata data ISO para pt-BR (ex: 18 jun 2026)
export function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export const PRIORIDADES = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}
