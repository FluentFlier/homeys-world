'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sofa, ArrowLeft, Loader2 } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { Blob } from '@/components/blob'

export default function PostCouchPage() {
  const params = useParams<{ city: string }>()
  const router = useRouter()
  const slug = params.city

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await insforge.auth.getCurrentUser()

      if (!user) {
        router.push(`/sign-in?next=/${slug}/couches/post`)
        return
      }

      setUser(user)

      const { data: cityData } = await insforge.database
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!cityData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCity(cityData as City)
      setLoading(false)
    }

    init()
  }, [slug, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || !city) return

    setSubmitting(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const title = (fd.get('title') as string)?.trim()
    const description = (fd.get('description') as string)?.trim()
    const neighborhood = (fd.get('neighborhood') as string)?.trim() || null
    const available_from = (fd.get('available_from') as string) || null
    const available_to = (fd.get('available_to') as string) || null
    const max_guests = parseInt(fd.get('max_guests') as string, 10) || 1
    const house_rules = (fd.get('house_rules') as string)?.trim() || null
    const poster_name = (fd.get('poster_name') as string)?.trim()
    const contact_email = (fd.get('contact_email') as string)?.trim()

    if (!title || !description || !poster_name || !contact_email) {
      setError('Please fill in all required fields.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await insforge.database.from('couches').insert([
      {
        user_id: user.id,
        city_id: city.id,
        title,
        description,
        neighborhood,
        available_from,
        available_to,
        max_guests,
        house_rules,
        poster_name,
        contact_email,
        is_active: true,
      },
    ])

    if (insertError) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/${slug}/couches`)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !city || !user) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">City not found.</p>
      </div>
    )
  }

  const neighborhoods = city.neighborhoods ?? []

  return (
    <div className="min-h-screen relative overflow-hidden pt-28 pb-20 px-4">
      <Blob className="w-[450px] h-[450px] -top-32 -left-24 opacity-40" color="secondary" />
      <Blob className="w-[300px] h-[300px] bottom-0 right-0 opacity-25" color="primary" />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-4">
            <Sofa className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Offer your couch
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Open your home to travelers visiting{' '}
            <span className="font-medium text-foreground">{city.name}</span>
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8"
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Comfy couch in downtown loft"
              className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Tell travelers about your space, neighborhood, what to expect"
              className="w-full rounded-2xl bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>

          {/* Neighborhood */}
          {neighborhoods.length > 0 && (
            <div>
              <label htmlFor="neighborhood" className="block font-body text-sm font-medium text-foreground mb-1.5">
                Neighborhood
              </label>
              <select
                id="neighborhood"
                name="neighborhood"
                className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition appearance-none"
              >
                <option value="">Select a neighborhood</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="available_from" className="block font-body text-sm font-medium text-foreground mb-1.5">
                Available from
              </label>
              <input
                id="available_from"
                name="available_from"
                type="date"
                className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label htmlFor="available_to" className="block font-body text-sm font-medium text-foreground mb-1.5">
                Available to
              </label>
              <input
                id="available_to"
                name="available_to"
                type="date"
                className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          </div>

          {/* Max guests */}
          <div>
            <label htmlFor="max_guests" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Max guests
            </label>
            <input
              id="max_guests"
              name="max_guests"
              type="number"
              min={1}
              max={10}
              defaultValue={1}
              className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* House rules */}
          <div>
            <label htmlFor="house_rules" className="block font-body text-sm font-medium text-foreground mb-1.5">
              House rules
            </label>
            <textarea
              id="house_rules"
              name="house_rules"
              rows={3}
              placeholder="Any rules travelers should know?"
              className="w-full rounded-2xl bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>

          <hr className="border-border" />

          {/* Your name */}
          <div>
            <label htmlFor="poster_name" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Your name <span className="text-destructive">*</span>
            </label>
            <input
              id="poster_name"
              name="poster_name"
              type="text"
              required
              placeholder="First name or nickname"
              className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Contact email */}
          <div>
            <label htmlFor="contact_email" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Contact email <span className="text-destructive">*</span>
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              required
              defaultValue={user.email ?? ''}
              placeholder="your@email.com"
              className="w-full rounded-full bg-white/50 border border-border px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="font-body text-sm text-destructive text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sofa className="w-4 h-4" />
            )}
            {submitting ? 'Posting...' : 'Share your couch'}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${slug}/couches`}
            className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to crash pads
          </Link>
        </div>
      </div>
    </div>
  )
}
