// Spinner discreto. `size="sm"` para botões; `center` para áreas de loading.
export default function Spinner({ size, center, onAccent }) {
  const cls = [
    'spinner',
    size === 'sm' ? 'spinner-sm' : '',
    onAccent ? 'on-accent' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (center) {
    return (
      <div className="spinner-center">
        <span className={cls} />
      </div>
    )
  }
  return <span className={cls} />
}
