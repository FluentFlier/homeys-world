'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Bed,
  Bath,
  Eye,
  Clock,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { Listing, City } from '@/lib/types'
import { formatPrice, formatDate, LISTING_TYPES } from '@/lib/types'
import { RevealContact } from './reveal-contact'
import { ReportDialog } from './report-dialog'

const AMENITY_LABELS: Record<string, string> = {
  furnished: 'Furnished',
  laundry_in_unit: 'In-unit Laundry',
  pets_okay: 'Pets OK',
  parking: 'Parking',
  gym: 'Gym',
  rooftop: 'Rooftop',
  utilities_included: 'Utilities Included',
}

const PLACEHOLDER_GRADIENTS = [
  'from-primary/20 to-accent',
  'from-secondary/20 to-muted',
  'from-accent to-primary/10',
  'from-muted to-secondary/10',
]

export default function ListingDetailPage() {
  return (
    <Suspense fallback={
      <div className="pt-28 pb-16 px-4 max-w-4xl mx-auto flex justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ListingDetailContent />
    </Suspense>
  )
}

function ListingDetailContent() {
  const { city: slug, id } = useParams<{ city: string; id: string }>()
  const searchParams = useSearchParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [notFoundState, setNotFoundState] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Show success toast when redirected from post form
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const { data } = await insforge.database
        .from('listings')
        .select('*, cities(*)')
        .eq('id', id)
        .single()

      if (!data) {
        setNotFoundState(true)
        return
      }

      const cityData = (data as any).cities as City
      if (!cityData || cityData.slug !== slug) {
        setNotFoundState(true)
        return
      }

      setListing(data as unknown as Listing)
      setCity(cityData)

      // Fire-and-forget view count increment
      insforge.database.rpc('increment_view_count', { listing_id: id }).then(({ error }) => {
        if (error) {
          // Fallback: direct update
          insforge.database
            .from('listings')
            .select('view_count')
            .eq('id', id)
            .single()
            .then(({ data: viewData }) => {
              insforge.database
                .from('listings')
                .update({ view_count: (viewData?.view_count || 0) + 1 })
                .eq('id', id)
            })
        }
      })
    }

    load()
  }, [slug, id])

  if (notFoundState) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground">Listing not found</h1>
        <Link
          href={`/${slug}/listings`}
          className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
      </div>
    )
  }

  if (!listing || !city) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const typeLabel = LISTING_TYPES[listing.type]
  const isLooking = listing.type.startsWith('looking_for')

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Success toast */}
      {showSuccess && (
        <div className="mb-6 flex items-center gap-2 font-body text-sm text-primary bg-primary/10 border border-primary/20 rounded-2xl px-5 py-3 animate-fade-in">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your listing is live! People can now find it when browsing {city.name}.
        </div>
      )}

      {/* Back link */}
      <Link
        href={`/${city.slug}/listings`}
        className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      {/* Photos */}
      {listing.photo_urls && listing.photo_urls.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {listing.photo_urls.map((url, i) => (
            <div
              key={i}
              className="shrink-0 w-[80vw] sm:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-[0_4px_20px_rgba(93,112,82,0.08)]"
            >
              <img
                src={url}
                alt={`${listing.title} - Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`w-full aspect-[16/7] rounded-2xl overflow-hidden border border-border mb-8 bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[0]} flex items-center justify-center`}
        >
          <span className="font-heading text-5xl text-foreground/10">
            {listing.title.charAt(0)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & type */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex text-xs font-body font-semibold px-3 py-1 rounded-full ${
                  isLooking
                    ? 'bg-secondary/15 text-secondary'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {typeLabel}
              </span>
              {listing.neighborhood && (
                <span className="inline-flex items-center gap-1 text-xs font-body text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {listing.neighborhood}
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {listing.title}
            </h1>
          </div>

          {/* Price */}
          <div className="font-heading text-3xl sm:text-4xl font-bold text-primary">
            {formatPrice(listing.monthly_rent, city.currency)}
          </div>

          {/* Details row */}
          <div className="flex flex-wrap gap-4 text-sm font-body text-foreground/70">
            {listing.bedrooms != null && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Bed className="w-4 h-4 text-primary/60" />
                {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Bath className="w-4 h-4 text-primary/60" />
                {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
              </span>
            )}
            {listing.move_in_date && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-primary/60" />
                Move in: {formatDate(listing.move_in_date)}
              </span>
            )}
            {listing.move_out_date && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-primary/60" />
                Until: {formatDate(listing.move_out_date)}
              </span>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">About</h2>
              <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex px-3 py-1.5 rounded-full bg-accent/60 text-xs font-body font-medium text-foreground/70 border border-border/50"
                  >
                    {AMENITY_LABELS[a] ?? a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact card */}
          <RevealContact
            contactEmail={listing.contact_email}
            contactPhone={listing.contact_phone ?? undefined}
            contactSocial={listing.contact_social ?? undefined}
            posterName={listing.poster_first_name}
          />

          {/* Meta info */}
          <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-3 shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              {listing.view_count} view{listing.view_count !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Posted {formatDate(listing.created_at)}
            </div>
            <div className="pt-2 border-t border-border/50">
              <ReportDialog listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
