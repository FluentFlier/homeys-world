'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, LogIn, LogOut, User, Menu, X } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { InsForgeUser } from '@/lib/types'

const CITY_PATTERN = /^\/([a-z0-9-]+)\//

export function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState<InsForgeUser | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await insforge.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const citySlug = pathname.match(CITY_PATTERN)?.[1] ?? null
  const cityLabel = citySlug
    ? citySlug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : null

  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      setUser(data?.user as InsForgeUser ?? null)
    })
  }, [])

  const links = [
    { label: 'Browse', href: '/cities' },
    { label: 'Roommates', href: '/profiles' },
    { label: 'Messages', href: '/messages' },
    { label: 'Stays', href: '/stays' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center mt-4 px-4">
      <div className="backdrop-blur-xl bg-white/70 border border-border rounded-full px-6 py-3 shadow-sm max-w-3xl w-full flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-foreground shrink-0 flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-primary" />
          homeys.world
        </Link>

        {cityLabel && (
          <span className="hidden sm:inline-flex text-xs font-body font-medium bg-accent text-accent-foreground px-3 py-1 rounded-full">
            {cityLabel}
          </span>
        )}

        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm text-foreground/70 hover:text-foreground px-3 py-1.5 rounded-full transition-colors hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/me"
                className="ml-1 inline-flex items-center gap-1.5 font-body text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-full transition-colors hover:bg-primary/90"
              >
                <User className="w-3.5 h-3.5" />
                My Listings
              </Link>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-full transition-colors hover:bg-muted"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="ml-1 inline-flex items-center gap-1.5 font-body text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-full transition-colors hover:bg-primary/90"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden fixed top-[72px] left-4 right-4 backdrop-blur-xl bg-white/90 border border-border rounded-2xl shadow-lg p-4 z-50 flex flex-col gap-2">
          {cityLabel && (
            <span className="text-xs font-body font-medium bg-accent text-accent-foreground px-3 py-1 rounded-full self-start mb-1">
              {cityLabel}
            </span>
          )}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="font-body text-sm text-foreground/70 hover:text-foreground px-3 py-2 rounded-xl transition-colors hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/me"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 font-body text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full transition-colors hover:bg-primary/90 self-start"
              >
                <User className="w-3.5 h-3.5" />
                My Listings
              </Link>
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl transition-colors hover:bg-muted self-start"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1.5 font-body text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full transition-colors hover:bg-primary/90 self-start"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
