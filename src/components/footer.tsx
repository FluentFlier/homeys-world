import { Heart, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 text-center font-body text-sm text-muted-foreground">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        {/* WhatsApp community CTA */}
        <a
          href="https://chat.whatsapp.com/HkfzSnMZ1Rd0AqAvj8kwyO?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-medium px-5 py-2.5 rounded-full transition-colors text-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Join our WhatsApp community
        </a>

        <p>
          Open source. Built by{' '}
          <span className="text-foreground/80 font-medium">Anirudh</span>
          {' '}&mdash;{' '}also check out{' '}
          <a
            href="https://tryada.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
          >
            Ada
          </a>
          , an AI secretary for your phone.
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground/70">
          <a
            href="https://github.com/FluentFlier/homeys-world"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span className="text-border">|</span>
          <a
            href="https://chat.whatsapp.com/HkfzSnMZ1Rd0AqAvj8kwyO?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            WhatsApp
          </a>
          <span className="text-border">|</span>
          <a
            href="https://linkedin.com/in/amanjesh"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-border">|</span>
          <a
            href="https://tryada.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Try Ada
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
