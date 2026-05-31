'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Globe, ArrowLeft } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { Blob } from '@/components/blob'

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(true)

  useEffect(() => {
    insforge.database
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('listing_count', { ascending: false })
      .then(({ data }) => {
        setCities((data as City[]) ?? [])
        setCitiesLoading(false)
      }, () => {
        setCitiesLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden pt-32 pb-20 px-4">
      <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-60" color="primary" />
      <Blob className="w-[400px] h-[400px] top-20 right-0 opacity-40" color="secondary" />

      <div className="relative max-w-5xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Pick a city
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-md mx-auto">
            We are growing one city at a time. Jump in and find your people.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {citiesLoading && cities.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8 animate-pulse"
            >
              <div className="h-6 bg-muted rounded-full w-2/3 mb-3" />
              <div className="h-4 bg-muted rounded-full w-1/3 mb-4" />
              <div className="h-4 bg-muted rounded-full w-1/4" />
            </div>
          ))}
          
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/${city.slug}`}
              className="group relative rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  <p className="font-body text-base text-muted-foreground mt-1">
                    {city.country}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
                </div>
              </div>
              <p className="font-body text-sm font-bold text-primary bg-primary/5 inline-block px-3 py-1 rounded-full">
                {city.listing_count} {city.listing_count === 1 ? 'listing' : 'listings'}
              </p>
            </Link>
          ))}

          <Link
            href="/#request-city"
            className="group relative rounded-[2rem] border-2 border-dashed border-border bg-muted/20 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center justify-center text-center min-h-[200px]"
          >
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Globe className="w-8 h-8 text-secondary" />
            </div>
            <p className="font-heading text-xl font-bold text-foreground">
              Your city?
            </p>
            <p className="font-body text-sm text-muted-foreground mt-2">
              Tell us where to go next
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
