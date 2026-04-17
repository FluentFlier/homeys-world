'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sofa,
  MapPin,
  Calendar,
  Users,
  Mail,
  Eye,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { formatDate } from '@/lib/types'
import { Blob } from '@/components/blob'

interface Couch {
  id: string
  user_id: string
  city_id: string
  title: string
  description: string
  neighborhood: string | null
  available_from: string | null
  available_to: string | null
  max_guests: number
  house_rules: string | null
  contact_email: string
  poster_name: string
  is_active: boolean
  created_at: string
  cities?: City
}

export default function StaysPage() {
  const [couches, setCouches] = useState<Couch[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('all')
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const [couchRes, cityRes] = await Promise.all([
        insforge.database
          .from('couches')
          .select('*, cities(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        insforge.database
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }),
      ])
      setCouches((couchRes.data as Couch[]) ?? [])
      setCities((cityRes.data as City[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = cityFilter === 'all'
    ? couches
    : couches.filter((c) => c.city_id === cityFilter)

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-60" color="secondary" />
        <Blob className="w-[400px] h-[400px] -top-20 right-0 opacity-40" color="primary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
            <Sofa className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            Crash Pads
          </h1>
          <p className="mt-6 font-body text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Locals offering their couch or spare room to travelers. Find a place to crash
            while you explore a new city.
          </p>
          <p className="mt-3 font-body text-sm text-muted-foreground">
            Want to host travelers in your city?{' '}
            <Link href="/" className="text-primary font-medium hover:text-primary/80 transition-colors">
              Pick a city
            </Link>{' '}
            and offer your couch.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              aria-label="Filter by city"
              className="appearance-none rounded-full bg-white/60 border border-border pl-4 pr-10 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value="all">All cities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <p className="font-body text-sm text-muted-foreground">
            {filtered.length} crash pad{filtered.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="font-body text-muted-foreground">Loading crash pads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/60 mb-5">
                <Sofa className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                No crash pads yet
              </h3>
              <p className="font-body text-muted-foreground max-w-sm mb-4">
                Be the first to offer your couch to travelers!
              </p>
              {cityFilter !== 'all' && (
                <button
                  onClick={() => setCityFilter('all')}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-5 py-2.5 rounded-full transition-transform hover:scale-105"
                >
                  Show all cities
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((couch) => {
                const city = couch.cities
                const isRevealed = revealedIds.has(couch.id)

                return (
                  <div
                    key={couch.id}
                    className="bg-white/60 backdrop-blur-sm border border-border rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(193,140,93,0.08)] hover:shadow-[0_8px_30px_rgba(193,140,93,0.15)] transition-all duration-300"
                  >
                    {/* City badge */}
                    {city && (
                      <Link
                        href={`/${city.slug}/couches`}
                        className="inline-flex items-center gap-1 text-xs font-body font-medium bg-secondary/10 text-secondary px-2.5 py-1 rounded-full mb-3 hover:bg-secondary/20 transition-colors"
                      >
                        <MapPin className="w-3 h-3" />
                        {city.name}
                        {couch.neighborhood && <span className="text-secondary/60">/ {couch.neighborhood}</span>}
                      </Link>
                    )}

                    {/* Host info */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                        <span className="font-heading text-sm font-bold text-secondary">
                          {couch.poster_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-foreground leading-tight">
                          {couch.poster_name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">Host</p>
                      </div>
                    </div>

                    {/* Title & description */}
                    <h3 className="font-heading text-base font-semibold text-foreground mb-1.5 leading-tight">
                      {couch.title}
                    </h3>
                    <p className="font-body text-sm text-foreground/70 leading-relaxed line-clamp-3 mb-4">
                      {couch.description}
                    </p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-2 mb-4 text-xs font-body text-muted-foreground">
                      {(couch.available_from || couch.available_to) && (
                        <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full">
                          <Calendar className="w-3 h-3" />
                          {couch.available_from && couch.available_to
                            ? `${formatDate(couch.available_from)} - ${formatDate(couch.available_to)}`
                            : couch.available_from
                              ? `From ${formatDate(couch.available_from)}`
                              : `Until ${formatDate(couch.available_to)}`}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-full">
                        <Users className="w-3 h-3" />
                        {couch.max_guests} guest{couch.max_guests !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Contact */}
                    {isRevealed ? (
                      <a
                        href={`mailto:${couch.contact_email}`}
                        className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {couch.contact_email}
                      </a>
                    ) : (
                      <button
                        onClick={() => toggleReveal(couch.id)}
                        aria-label={`Reveal contact for ${couch.poster_name}`}
                        className="inline-flex items-center gap-2 text-sm font-body font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-full hover:bg-secondary/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Reveal contact
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
