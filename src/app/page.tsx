'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MessageCircle, Users, Sofa } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import { Blob } from '@/components/blob'

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)

  async function handleRequestCity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const city_name = (formData.get('city_name') as string)?.trim()
    if (!city_name) return

    await insforge.database.from('city_requests').insert([{
      city_name,
      country: (formData.get('country') as string)?.trim() || null,
      requester_email: (formData.get('email') as string)?.trim() || null,
      note: (formData.get('note') as string)?.trim() || null,
    }])
    setSubmitted(true)
    form.reset()
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-60" color="primary" />
        <Blob className="w-[400px] h-[400px] -top-20 right-0 opacity-40" color="secondary" />
        <Blob className="w-[300px] h-[300px] bottom-0 left-1/3 opacity-30" color="primary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Homeys World 2.0.{' '}
            <span className="text-primary">Find your people.</span>
          </h1>
          <p className="mt-6 font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A free housing board for listings, roommates, and crash pads
            in cities around the world. No fees, no middleman.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105 shadow-lg shadow-primary/20"
            >
              <Search className="w-4 h-4" />
              Explore All Available Cities
            </Link>
            <Link
              href="/profiles"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105 shadow-lg shadow-secondary/10"
            >
              <Users className="w-4 h-4" />
              Find roommates
            </Link>
            <a
              href="https://chat.whatsapp.com/HkfzSnMZ1Rd0AqAvj8kwyO?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              Join community
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Search,
                title: 'Browse or post',
                desc: 'Find rooms, apartments, or post your own listing. Free, takes under a minute.',
              },
              {
                icon: Users,
                title: 'Find your people',
                desc: 'Browse roommate profiles and connect with someone whose vibe matches yours.',
              },
              {
                icon: Sofa,
                title: 'Crash somewhere',
                desc: 'Need a couch for a few nights? Browse crash pads from locals in your city.',
              },
              {
                icon: MessageCircle,
                title: 'Reach out',
                desc: 'Contact anyone directly. No middleman, no fees, no catch.',
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

          {submitted && (
            <div className="mb-6 text-center font-body text-sm text-primary bg-primary/10 rounded-xl px-4 py-3">
              Request submitted! We will let you know when it launches.
            </div>
          )}

          <form
            onSubmit={handleRequestCity}
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
