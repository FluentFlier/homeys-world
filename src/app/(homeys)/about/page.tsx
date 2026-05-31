'use client'

import { useState } from 'react'
import { Heart, Github, Globe, Code2 } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import { Blob } from '@/components/blob'

export default function AboutPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestCity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const city_name = formData.get('city_name') as string
    const country = formData.get('country') as string
    const email = formData.get('email') as string
    const note = formData.get('note') as string

    if (!city_name?.trim()) {
      setSubmitting(false)
      return
    }

    try {
      const { error: insertError } = await insforge.database.from('city_requests').insert([{
        city_name: city_name.trim(),
        country: country?.trim() || null,
        requester_email: email?.trim() || null,
        note: note?.trim() || null,
      }])

      if (insertError) {
        setError('Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -right-40 opacity-40" color="primary" />
        <Blob className="w-[350px] h-[350px] top-20 -left-20 opacity-30" color="secondary" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h1 className="font-heading text-5xl sm:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            About Homeys World
          </h1>
          <p className="mt-6 font-body text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Finding housing in a new city should be simple, transparent, and free.
            We are making that happen.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="relative overflow-hidden py-16 px-4">
        <div className="relative max-w-2xl mx-auto">
          <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4 font-body text-foreground/80 leading-relaxed">
              <p>
                <strong className="text-foreground">Homeys World</strong> is a free, open-source housing board
                built for people who are moving to a new city and need a place to live. No fees,
                no subscriptions, no data selling.
              </p>
              <p>
                Every city gets its own board where you can browse rooms, apartments, and roommate
                requests or post your own listing. Contact is direct -- no middleman taking a cut.
              </p>
              <p>
                We built this because every time we moved to a new city, the same story repeated:
                shady Facebook groups, overpriced agents, and ghost listings. There had to be a
                better way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built by */}
      <section className="relative overflow-hidden py-16 px-4 bg-muted/30">
        <Blob className="w-[300px] h-[300px] -bottom-20 left-0 opacity-20" color="primary" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Built by
          </h2>

          <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8 inline-block text-left max-w-sm mx-auto w-full">
            <p className="font-heading text-xl font-semibold text-foreground mb-1">
              Anirudh
            </p>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Also the maker of{' '}
              <a
                href="https://tryada.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              >
                Ada
              </a>{' '}
              -- an AI secretary for your phone.
            </p>
            <p className="font-body text-sm text-foreground/70 leading-relaxed mb-4">
              I believe in building tools that are free, simple, and actually useful. If Homeys
              World helps even one person find a great place to live, it was worth it.
            </p>
            <a
              href="https://linkedin.com/in/amanjesh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Open source + contribute */}
      <section className="relative overflow-hidden py-16 px-4">
        <Blob className="w-[350px] h-[350px] top-0 right-0 opacity-20" color="secondary" />

        <div className="relative max-w-3xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
            Open source
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">GitHub</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                View the source, report bugs, or star the repo.
              </p>
              <a
                href="https://github.com/FluentFlier/homeys-world"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View on GitHub &rarr;
              </a>
            </div>

            <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                <Code2 className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">MIT License</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Use it, fork it, make it your own. Free forever.
              </p>
              <span className="font-body text-sm text-muted-foreground">
                100% open source
              </span>
            </div>

            <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Contribute</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Add a city, fix a bug, or improve the design.
              </p>
              <a
                href="https://github.com/FluentFlier/homeys-world/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Open an issue &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Request a city form */}
      <section id="request-city" className="relative overflow-hidden py-20 px-4 bg-muted/30">
        <Blob className="w-[350px] h-[350px] -bottom-20 left-10 opacity-20" color="primary" />

        <div className="relative max-w-lg mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground text-center mb-3">
            Request a city
          </h2>
          <p className="font-body text-muted-foreground text-center mb-10">
            We are growing one city at a time. Tell us where you need us next.
          </p>

          {submitted ? (
            <div className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8 text-center">
              <p className="font-body text-foreground font-medium">
                Thank you! Your request has been submitted.
              </p>
            </div>
          ) : (
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

              {error && (
                <div className="font-body text-sm text-destructive bg-destructive/5 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
