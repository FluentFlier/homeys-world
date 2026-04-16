import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Globe, Search, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { City, Listing } from '@/lib/types'
import { Blob } from '@/components/blob'
import { ListingCard } from '@/components/listing-card'

async function requestCity(formData: FormData) {
  'use server'
  const city_name = formData.get('city_name') as string
  const country = formData.get('country') as string
  const email = formData.get('email') as string
  const note = formData.get('note') as string

  if (!city_name?.trim()) return

  const supabase = await createClient()
  await supabase.from('city_requests').insert({
    city_name: city_name.trim(),
    country: country?.trim() || null,
    requester_email: email?.trim() || null,
    note: note?.trim() || null,
  })
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city: slug } = await params
  const supabase = await createClient()

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!city) {
    return <CityNotFound slug={slug} requestCity={requestCity} />
  }

  const typedCity = city as City

  const { data: listings } = await supabase
    .from('listings')
    .select('*, cities(*)')
    .eq('city_id', typedCity.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const typedListings = (listings ?? []) as (Listing & { cities: City })[]

  // Collect unique neighborhoods from the city
  const neighborhoods = typedCity.neighborhoods ?? []

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-32 opacity-50" color="primary" />
        <Blob className="w-[400px] h-[400px] top-0 right-0 opacity-30" color="secondary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <p className="font-body text-sm font-medium text-secondary mb-3 tracking-wide uppercase">
            {typedCity.country}
          </p>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            {typedCity.name}
          </h1>
          <p className="mt-4 font-body text-lg text-muted-foreground">
            {typedCity.listing_count} {typedCity.listing_count === 1 ? 'listing' : 'listings'} available
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${slug}/listings`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <Search className="w-4 h-4" />
              Browse listings
            </Link>
            <Link
              href={`/${slug}/post`}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <PenLine className="w-4 h-4" />
              Post a listing
            </Link>
          </div>
        </div>
      </section>

      {/* Recent listings */}
      {typedListings.length > 0 && (
        <section className="relative overflow-hidden py-16 px-4">
          <Blob className="w-[300px] h-[300px] -bottom-20 left-10 opacity-20" color="primary" />

          <div className="relative max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                  Recent listings
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  The latest posts in {typedCity.name}
                </p>
              </div>
              <Link
                href={`/${slug}/listings`}
                className="hidden sm:inline-flex font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {typedListings.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  city={typedCity}
                  index={i}
                />
              ))}
            </div>

            <div className="sm:hidden mt-6 text-center">
              <Link
                href={`/${slug}/listings`}
                className="inline-flex font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all listings &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Neighborhoods */}
      {neighborhoods.length > 0 && (
        <section className="relative overflow-hidden py-16 px-4 bg-muted/30">
          <Blob className="w-[350px] h-[350px] top-0 right-0 opacity-15" color="secondary" />

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Neighborhoods
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Explore by area
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              {neighborhoods.map((n) => (
                <Link
                  key={n}
                  href={`/${slug}/listings?neighborhood=${encodeURIComponent(n)}`}
                  className="font-body text-sm font-medium px-4 py-2 rounded-full border border-border bg-white/60 text-foreground/80 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105"
                >
                  {n}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state if no listings */}
      {typedListings.length === 0 && (
        <section className="py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-6">
              <Search className="w-7 h-7 text-secondary" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
              No listings yet
            </h2>
            <p className="font-body text-muted-foreground mb-6">
              Be the first to post in {typedCity.name}!
            </p>
            <Link
              href={`/${slug}/post`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <PenLine className="w-4 h-4" />
              Post a listing
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

/* ── City-not-found fallback ──────────────────────────────── */

function CityNotFound({
  slug,
  requestCity,
}: {
  slug: string
  requestCity: (formData: FormData) => Promise<void>
}) {
  const prettyName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-4">
      <Blob className="w-[400px] h-[400px] -top-32 -left-20 opacity-40" color="secondary" />
      <Blob className="w-[300px] h-[300px] bottom-0 right-0 opacity-30" color="primary" />

      <div className="relative max-w-lg mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent mb-6">
          <Globe className="w-7 h-7 text-secondary" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
          We are not in {prettyName} yet
        </h1>
        <p className="font-body text-muted-foreground mb-10">
          But you can help us get there! Request this city and we will notify you when it launches.
        </p>

        <form
          action={requestCity}
          className="text-left space-y-5 rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8"
        >
          <input type="hidden" name="city_name" value={prettyName} />

          <div>
            <label htmlFor="country" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="e.g. Germany"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Your email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="so we can notify you"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div>
            <label htmlFor="note" className="block font-body text-sm font-medium text-foreground mb-1.5">
              Note
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Why this city? Anything else?"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Request {prettyName}
          </button>
        </form>

        <Link
          href="/"
          className="inline-flex font-body text-sm text-primary hover:text-primary/80 mt-6 transition-colors"
        >
          &larr; Back to all cities
        </Link>
      </div>
    </section>
  )
}
