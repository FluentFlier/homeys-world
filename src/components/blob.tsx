interface BlobProps {
  className?: string
  color?: 'primary' | 'secondary'
}

export function Blob({ className = '', color = 'primary' }: BlobProps) {
  const bg = color === 'primary' ? 'bg-primary' : 'bg-secondary'

  return (
    <div
      aria-hidden
      className={`absolute rounded-blob blur-3xl opacity-[0.12] z-0 pointer-events-none ${bg} ${className}`}
    />
  )
}
