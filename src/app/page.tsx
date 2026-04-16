import Link from 'next/link'
import { MapPin, Search, MessageCircle, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase-server'
import { City } from '@/lib/types'
import { Blob } from '@/components/blob'

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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('listing_count', { ascending: false })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-60" color="primary" />
        <Blob className="w-[400px] h-[400px] -top-20 right-0 opacity-40" color="secondary" />
        <Blob className="w-[300px] h-[300px] bottom-0 left-1/3 opacity-30" color="primary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Find your next place.{' '}
            <span className="text-primary">Skip the scams.</span>
          </h1>
          <p className="mt-6 font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A free, open-source housing board for roommates, subleases, and apartments
            across the world.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#cities"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <Search className="w-4 h-4" />
              Browse cities
            </a>
            <a
              href="#request-city"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <Globe className="w-4 h-4" />
              Request a city
            </a>
          </div>
        </div>
      </section>

      {/* City picker */}
      <section id="cities" className="relative overflow-hidden py-20 px-4">
        <Blob className="w-[350px] h-[350px] -top-20 right-10 opacity-20" color="secondary" />

        <div className="relative max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-4">
            Pick a city
          </h2>
          <p className="font-body text-muted-foreground text-center mb-12 max-w-md mx-auto">
            We are growing one city at a time. Jump in and find your people.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(cities as City[] | null)?.map((city) => (
              <Link
                key={city.id}
                href={`/${city.slug}`}
                className="group relative rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {city.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">
                      {city.country}
                    </p>
                  </div>
                  <MapPin className="w-5 h-5 text-secondary shrink-0 mt-1" />
                </div>
                <p className="font-body text-sm font-medium text-primary">
                  {city.listing_count} {city.listing_count === 1 ? 'listing' : 'listings'}
                </p>
              </Link>
            ))}

            {/* Request a city card */}
            <a
              href="#request-city"
              className="group relative rounded-[2rem] border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center text-center min-h-[140px]"
            >
              <Globe className="w-8 h-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-heading text-lg font-semibold text-foreground">
                Your city?
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Request it below
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden py-20 px-4 bg-muted/30">
        <Blob className="w-[400px] h-[400px] top-10 -left-32 opacity-20" color="primary" />

        <div className="relative max-w-4xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-14">
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Pick a city',
                desc: 'Choose from the cities we cover or request your own.',
              },
              {
                icon: Search,
                title: 'Browse or post',
                desc: 'Find rooms, apartments, or roommates. Posting is free.',
              },
              {
                icon: MessageCircle,
                title: 'Reach out',
                desc: 'Contact the poster directly. No middleman, no fees.',
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-[2rem] bg-white/80 backdrop-blur-sm border border-border p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="absolute top-6 right-6 font-heading text-4xl font-bold text-border/50">
                  {i + 1}
                </span>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request a city form */}
      <section id="request-city" className="relative overflow-hidden py-20 px-4">
        <Blob className="w-[350px] h-[350px] -bottom-20 right-0 opacity-20" color="secondary" />

        <div className="relative max-w-lg mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-3">
            Request a city
          </h2>
          <p className="font-body text-muted-foreground text-center mb-10">
            Tell us where you need a housing board and we will add it.
          </p>

          <form
            action={requestCity}
            className="space-y-5 rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8"
          >
            <div>
              <label htmlFor="city_name" className="block font-body text-sm font-medium text-foreground mb-1.5">
                City name <span className="text-destructive">*</span>
              </label>
              <input
                id="city_name"
                name="city_name"
                type="text"
                required
                placeholder="e.g. Berlin"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>

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
                placeholder="Anything else you want us to know?"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit request
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
