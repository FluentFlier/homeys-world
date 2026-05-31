'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { BrowseClient } from './browse-client'

export default function BrowseListingsPage() {
  const { city: slug } = useParams<{ city: string }>()
  const [city, setCity] = useState<City | null>(null)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: cityData } = await insforge.database
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!cityData) {
        setNotFoundState(true)
        return
      }

      setCity(cityData as City)
    }

    load()
  }, [slug])

  if (notFoundState) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">City not found</h1>
        <p className="font-body text-sm text-muted-foreground mb-6">
          We don&apos;t have listings for this city yet.
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

  if (!city) {
    return (
      <div className="pt-28 pb-16 px-4 max-w-7xl mx-auto flex justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return <BrowseClient city={city} />
}
