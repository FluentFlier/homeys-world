'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Sofa, MapPin, Calendar, Users, ArrowLeft, Eye, Mail } from 'lucide-react'
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
  poster_name: string
  contact_email: string
  is_active: boolean
  created_at: string
}

export default function CouchesPage() {
  const { city: slug } = useParams<{ city: string }>()
  const [city, setCity] = useState<City | null>(null)
  const [couches, setCouches] = useState<Couch[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [errorState, setErrorState] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErrorState(false)

      try {
        const { data: cityData } = await insforge.database
          .from('cities')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single()

        if (!cityData) {
          setNotFoundState(true)
          setLoading(false)
          return
        }

        const c = cityData as City
        setCity(c)

        const { data: couchData } = await insforge.database
          .from('couches')
          .select('*')
          .eq('city_id', c.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        setCouches((couchData ?? []) as Couch[])
      } catch {
        setErrorState(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  if (loading) {
    return (
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="relative max-w-3xl mx-auto flex justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  if (errorState) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Sofa className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">
          We could not load crash pads. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-5 py-2.5 rounded-full transition-transform hover:scale-105"
        >
          Try again
        </button>
      </div>
    )
  }

  if (notFoundState || !city) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Sofa className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">City not found</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">
          We don&apos;t have this city yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse all cities
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-32 opacity-50" color="secondary" />
        <Blob className="w-[350px] h-[350px] top-0 right-0 opacity-30" color="primary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-5">
            <Sofa className="w-7 h-7 text-secondary" />
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight">
            Crash pads in {city.name}
          </h1>
          <p className="mt-3 font-body text-lg text-muted-foreground">
            Locals offering their couch or spare room to travelers
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${slug}/couches/post`}
              className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <Sofa className="w-4 h-4" />
              Offer your couch
            </Link>
          </div>
        </div>
      </section>

      {/* Couch grid */}
      {couches.length > 0 ? (
        <section className="relative overflow-hidden py-12 px-4">
          <Blob className="w-[300px] h-[300px] -bottom-20 left-10 opacity-15" color="primary" />

          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {couches.map((couch) => (
                <CouchCard key={couch.id} couch={couch} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-6">
              <Sofa className="w-7 h-7 text-secondary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
              No crash pads yet
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Be the first to offer a couch in {city.name}!
            </p>
            <Link
              href={`/${slug}/couches/post`}
              className="inline-flex items-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <Sofa className="w-4 h-4" />
              Offer your couch
            </Link>
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="pb-16 px-4 text-center">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {city.name}
        </Link>
      </div>
    </>
  )
}

/* -- Couch card component ---- */

function CouchCard({ couch }: { couch: Couch }) {
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all hover:shadow-md hover:shadow-secondary/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs font-medium text-secondary tracking-wide uppercase">
            {couch.poster_name}
          </p>
          <h3 className="font-heading text-lg font-semibold text-foreground mt-1 leading-snug">
            {couch.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0 rounded-full bg-accent px-2.5 py-1">
          <Users className="w-3.5 h-3.5 text-secondary" />
          <span className="font-body text-xs font-medium text-foreground">
            {couch.max_guests} {couch.max_guests === 1 ? 'guest' : 'guests'}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
        {couch.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-4">
        {couch.neighborhood && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
            <MapPin className="w-3 h-3" />
            {couch.neighborhood}
          </span>
        )}
        {(couch.available_from || couch.available_to) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 font-body text-xs font-medium text-foreground/70">
            <Calendar className="w-3 h-3" />
            {formatDate(couch.available_from) ?? 'Now'} &ndash; {formatDate(couch.available_to) ?? 'Open'}
          </span>
        )}
      </div>

      {/* Contact reveal */}
      {showContact ? (
        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-2.5">
          <Mail className="w-4 h-4 text-secondary shrink-0" />
          <a
            href={`mailto:${couch.contact_email}`}
            className="font-body text-sm text-primary hover:underline truncate"
          >
            {couch.contact_email}
          </a>
        </div>
      ) : (
        <button
          onClick={() => setShowContact(true)}
          aria-label={`Reveal contact info for ${couch.poster_name}`}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-border bg-white/50 px-4 py-2.5 font-body text-sm font-medium text-foreground/70 transition-all hover:bg-primary hover:text-white hover:border-primary hover:scale-[1.02] active:scale-[0.98]"
        >
          <Eye className="w-4 h-4" />
          Reveal contact
        </button>
      )}
    </div>
  )
}
