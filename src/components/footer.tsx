import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 text-center font-body text-sm text-muted-foreground">
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <p>
          Open source. Built by{' '}
          <span className="text-foreground/80 font-medium">Anirudh</span>, maker of{' '}
          <a
            href="https://tryada.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
          >
            Ada
          </a>
          .
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/70">
          <a
            href="https://github.com/anirudhmanjesh/homeys-world"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span className="text-border">|</span>
          <a
            href="https://tryada.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            tryada.app
          </a>
          <span className="text-border">|</span>
          <span className="inline-flex items-center gap-1">
            MIT License <Heart className="w-3 h-3 text-secondary" />
          </span>
        </div>
      </div>
    </footer>
  )
}
