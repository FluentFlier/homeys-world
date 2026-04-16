'use client'

import { useState } from 'react'
import { Mail, Phone, Globe, User, Eye } from 'lucide-react'

interface RevealContactProps {
  contactEmail: string
  contactPhone?: string
  contactSocial?: string
  posterName: string
}

export function RevealContact({
  contactEmail,
  contactPhone,
  contactSocial,
  posterName,
}: RevealContactProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="font-heading text-sm font-semibold text-foreground">{posterName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {!revealed ? (
          <div className="relative">
            {/* Blurred fake content */}
            <div className="select-none pointer-events-none blur-sm opacity-60 space-y-2.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary/40" />
                <span className="font-body text-sm text-foreground/50">
                  example@email.com
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary/40" />
                <span className="font-body text-sm text-foreground/50">
                  +1 (555) 123-4567
                </span>
              </div>
            </div>

            {/* Overlay button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setRevealed(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 active:scale-95"
              >
                <Eye className="w-4 h-4" />
                Reveal contact info
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors break-all">
                {contactEmail}
              </span>
            </a>

            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                  {contactPhone}
                </span>
              </a>
            )}

            {contactSocial && (
              <a
                href={contactSocial.startsWith('http') ? contactSocial : `https://${contactSocial}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors break-all">
                  {contactSocial}
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
