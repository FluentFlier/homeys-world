'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  Frown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { ListingCard } from '@/components/listing-card'
import type { City, Listing } from '@/lib/types'
import { LISTING_TYPES, AMENITIES } from '@/lib/types'

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'move_in'

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  move_in: 'Move-in Soonest',
}

const BEDROOM_OPTIONS = ['1', '2', '3', '4+'] as const

const AMENITY_LABELS: Record<string, string> = {
  furnished: 'Furnished',
  laundry_in_unit: 'In-unit Laundry',
  pets_okay: 'Pets OK',
  parking: 'Parking',
  gym: 'Gym',
  rooftop: 'Rooftop',
  utilities_included: 'Utilities Incl.',
}

interface BrowseClientProps {
  city: City
}

export function BrowseClient({ city }: BrowseClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  // Parse initial filters from URL
  const initialTypes = searchParams.get('types')?.split(',').filter(Boolean) ?? []
  const initialNeighborhoods = searchParams.get('neighborhoods')?.split(',').filter(Boolean) ?? []
  const initialBedrooms = searchParams.get('bedrooms')?.split(',').filter(Boolean) ?? []
  const initialAmenities = searchParams.get('amenities')?.split(',').filter(Boolean) ?? []
  const initialMinPrice = searchParams.get('min_price') ?? ''
  const initialMaxPrice = searchParams.get('max_price') ?? ''
  const initialSort = (searchParams.get('sort') as SortOption) ?? 'newest'

  const [types, setTypes] = useState<string[]>(initialTypes)
  const [neighborhoods, setNeighborhoods] = useState<string[]>(initialNeighborhoods)
  const [bedrooms, setBedrooms] = useState<string[]>(initialBedrooms)
  const [amenities, setAmenities] = useState<string[]>(initialAmenities)
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState<SortOption>(initialSort)

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Sync filters to URL
  const syncUrl = useCallback(
    (overrides?: Partial<{
      types: string[]
      neighborhoods: string[]
      bedrooms: string[]
      amenities: string[]
      minPrice: string
      maxPrice: string
      sort: SortOption
    }>) => {
      const t = overrides?.types ?? types
      const n = overrides?.neighborhoods ?? neighborhoods
      const b = overrides?.bedrooms ?? bedrooms
      const a = overrides?.amenities ?? amenities
      const mn = overrides?.minPrice ?? minPrice
      const mx = overrides?.maxPrice ?? maxPrice
      const s = overrides?.sort ?? sort

      const params = new URLSearchParams()
      if (t.length) params.set('types', t.join(','))
      if (n.length) params.set('neighborhoods', n.join(','))
      if (b.length) params.set('bedrooms', b.join(','))
      if (a.length) params.set('amenities', a.join(','))
      if (mn) params.set('min_price', mn)
      if (mx) params.set('max_price', mx)
      if (s !== 'newest') params.set('sort', s)

      const qs = params.toString()
      startTransition(() => {
        router.replace(`/${city.slug}/listings${qs ? `?${qs}` : ''}`, { scroll: false })
      })
    },
    [types, neighborhoods, bedrooms, amenities, minPrice, maxPrice, sort, city.slug, router],
  )

  // Fetch listings when filters change
  useEffect(() => {
    let cancelled = false

    async function fetchListings() {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('listings')
        .select('*, cities(*)')
        .eq('city_id', city.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())

      if (types.length) {
        query = query.in('type', types)
      }
      if (neighborhoods.length) {
        query = query.in('neighborhood', neighborhoods)
      }
      if (bedrooms.length) {
        const nums = bedrooms.map((b) => (b === '4+' ? 4 : parseInt(b)))
        if (bedrooms.includes('4+')) {
          query = query.or(
            nums
              .filter((n) => n < 4)
              .map((n) => `bedrooms.eq.${n}`)
              .concat(['bedrooms.gte.4'])
              .join(','),
          )
        } else {
          query = query.in('bedrooms', nums)
        }
      }
      if (amenities.length) {
        query = query.contains('amenities', amenities)
      }
      if (minPrice) {
        query = query.gte('monthly_rent', parseInt(minPrice))
      }
      if (maxPrice) {
        query = query.lte('monthly_rent', parseInt(maxPrice))
      }

      switch (sort) {
        case 'price_asc':
          query = query.order('monthly_rent', { ascending: true, nullsFirst: false })
          break
        case 'price_desc':
          query = query.order('monthly_rent', { ascending: false, nullsFirst: false })
          break
        case 'move_in':
          query = query.order('move_in_date', { ascending: true, nullsFirst: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data } = await query.limit(60)

      if (!cancelled) {
        setListings((data as Listing[]) ?? [])
        setLoading(false)
      }
    }

    fetchListings()
    return () => {
      cancelled = true
    }
  }, [city.id, types, neighborhoods, bedrooms, amenities, minPrice, maxPrice, sort])

  function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
  }

  function clearAllFilters() {
    setTypes([])
    setNeighborhoods([])
    setBedrooms([])
    setAmenities([])
    setMinPrice('')
    setMaxPrice('')
    setSort('newest')
    syncUrl({
      types: [],
      neighborhoods: [],
      bedrooms: [],
      amenities: [],
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    })
  }

  const hasFilters =
    types.length > 0 ||
    neighborhoods.length > 0 ||
    bedrooms.length > 0 ||
    amenities.length > 0 ||
    minPrice !== '' ||
    maxPrice !== ''

  const filterContent = (
    <div className="space-y-6">
      {/* Listing Type */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Listing Type</h3>
        <div className="space-y-1.5">
          {Object.entries(LISTING_TYPES).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={types.includes(key)}
                onChange={() => {
                  const next = toggle(types, key)
                  setTypes(next)
                  syncUrl({ types: next })
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
              />
              <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value)
              syncUrl({ minPrice: e.target.value })
            }}
            className="w-full rounded-full bg-white/50 border border-border px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value)
              syncUrl({ maxPrice: e.target.value })
            }}
            className="w-full rounded-full bg-white/50 border border-border px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Neighborhoods */}
      {city.neighborhoods && city.neighborhoods.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Neighborhood</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {city.neighborhoods.map((n) => (
              <label key={n} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={neighborhoods.includes(n)}
                  onChange={() => {
                    const next = toggle(neighborhoods, n)
                    setNeighborhoods(next)
                    syncUrl({ neighborhoods: next })
                  }}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary"
                />
                <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                  {n}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Bedrooms */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Bedrooms</h3>
        <div className="flex flex-wrap gap-1.5">
          {BEDROOM_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => {
                const next = toggle(bedrooms, b)
                setBedrooms(next)
                syncUrl({ bedrooms: next })
              }}
              className={`px-3 py-1 rounded-full text-sm font-body border transition-all duration-200 ${
                bedrooms.includes(b)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-white/50 text-foreground/70 border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {b === '4+' ? '4+' : b} {b !== '4+' ? 'BR' : 'BR'}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-heading text-sm font-semibold text-foreground mb-2">Amenities</h3>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => {
                const next = toggle(amenities, a)
                setAmenities(next)
                syncUrl({ amenities: next })
              }}
              className={`px-3 py-1 rounded-full text-xs font-body border transition-all duration-200 ${
                amenities.includes(a)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-white/50 text-foreground/70 border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {AMENITY_LABELS[a] ?? a}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full text-center text-sm font-body text-destructive hover:text-destructive/80 transition-colors py-2"
        >
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Listings in {city.name}
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          {loading ? 'Loading...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28 bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span className="font-heading text-sm font-semibold text-foreground">Filters</span>
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-white/60 text-sm font-body text-foreground/80 hover:border-primary/40 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {types.length + neighborhoods.length + bedrooms.length + amenities.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative ml-auto">
              <div className="inline-flex items-center gap-1.5">
                <label className="font-body text-xs text-muted-foreground hidden sm:inline">Sort by</label>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => {
                      const next = e.target.value as SortOption
                      setSort(next)
                      syncUrl({ sort: next })
                    }}
                    className="appearance-none rounded-full bg-white/60 border border-border pl-3 pr-8 py-1.5 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {Object.entries(SORT_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 border border-border rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-1/2" />
                    <div className="h-3 bg-muted rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Frown className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                No listings found
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
                Try adjusting your filters or check back later. New listings are posted every day.
              </p>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-body font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} city={city} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute top-0 left-0 right-0 max-h-[85vh] bg-background border-b border-border rounded-b-3xl shadow-xl overflow-y-auto animate-slide-down">
            <div className="sticky top-0 bg-background/90 backdrop-blur-sm border-b border-border/50 px-5 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="font-heading text-base font-semibold text-foreground">Filters</span>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <X className="w-4 h-4 text-foreground/60" />
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
            <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50 px-5 py-4">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Show {listings.length} listing{listings.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
