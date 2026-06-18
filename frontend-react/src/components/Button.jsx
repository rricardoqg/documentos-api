import Spinner from './Spinner.jsx'

// Botão padrão. variant: primary | ghost | danger | subtle
export default function Button({
  variant = 'ghost',
  loading = false,
  block = false,
  size,
  children,
  className = '',
  disabled,
  ...props
}) {
  const cls = [
    'btn',
    `btn-${variant}`,
    block ? 'btn-block' : '',
    size === 'sm' ? 'btn-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading && <Spinner size="sm" onAccent={variant === 'primary' || variant === 'danger'} />}
      {children}
    </button>
  )
}
