import { notFound } from 'next/navigation'
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
import { createClient } from '@/lib/supabase-server'
import type { Listing, City } from '@/lib/types'
import { formatPrice, formatDate, LISTING_TYPES, AMENITIES } from '@/lib/types'
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

interface Props {
  params: Promise<{ city: string; id: string }>
}

async function incrementViewCount(listingId: string) {
  'use server'
  const supabase = await createClient()
  // Attempt RPC first, fall back to direct update
  const { error } = await supabase.rpc('increment_view_count', { listing_id: listingId })
  if (error) {
    await supabase
      .from('listings')
      .update({ view_count: (await supabase.from('listings').select('view_count').eq('id', listingId).single()).data?.view_count + 1 || 1 })
      .eq('id', listingId)
  }
}

export async function generateMetadata({ params }: Props) {
  const { city: slug, id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, cities(name)')
    .eq('id', id)
    .single()

  if (!listing) return { title: 'Listing not found' }

  const cityName = (listing.cities as unknown as City)?.name ?? slug
  return {
    title: `${listing.title} - ${cityName} - Homeys World`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { city: slug, id } = await params
  const supabase = await createClient()

  // Fetch listing with city
  const { data: listing } = await supabase
    .from('listings')
    .select('*, cities(*)')
    .eq('id', id)
    .single()

  if (!listing) notFound()

  const city = listing.cities as unknown as City
  if (!city || city.slug !== slug) notFound()

  const typedListing = listing as unknown as Listing
  const typeLabel = LISTING_TYPES[typedListing.type]
  const isLooking = typedListing.type.startsWith('looking_for')

  // Fire-and-forget view count increment
  incrementViewCount(typedListing.id)

  const PLACEHOLDER_GRADIENTS = [
    'from-primary/20 to-accent',
    'from-secondary/20 to-muted',
    'from-accent to-primary/10',
    'from-muted to-secondary/10',
  ]

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href={`/${city.slug}/listings`}
        className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </Link>

      {/* Photos */}
      {typedListing.photo_urls && typedListing.photo_urls.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-hide">
          {typedListing.photo_urls.map((url, i) => (
            <div
              key={i}
              className="shrink-0 w-[80vw] sm:w-[400px] aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-[0_4px_20px_rgba(93,112,82,0.08)]"
            >
              <img
                src={url}
                alt={`${typedListing.title} - Photo ${i + 1}`}
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
            {typedListing.title.charAt(0)}
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
              {typedListing.neighborhood && (
                <span className="inline-flex items-center gap-1 text-xs font-body text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {typedListing.neighborhood}
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {typedListing.title}
            </h1>
          </div>

          {/* Price */}
          <div className="font-heading text-3xl sm:text-4xl font-bold text-primary">
            {formatPrice(typedListing.monthly_rent, city.currency)}
          </div>

          {/* Details row */}
          <div className="flex flex-wrap gap-4 text-sm font-body text-foreground/70">
            {typedListing.bedrooms != null && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Bed className="w-4 h-4 text-primary/60" />
                {typedListing.bedrooms} bed{typedListing.bedrooms !== 1 ? 's' : ''}
              </span>
            )}
            {typedListing.bathrooms != null && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Bath className="w-4 h-4 text-primary/60" />
                {typedListing.bathrooms} bath{typedListing.bathrooms !== 1 ? 's' : ''}
              </span>
            )}
            {typedListing.move_in_date && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-primary/60" />
                Move in: {formatDate(typedListing.move_in_date)}
              </span>
            )}
            {typedListing.move_out_date && (
              <span className="inline-flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-primary/60" />
                Until: {formatDate(typedListing.move_out_date)}
              </span>
            )}
          </div>

          {/* Description */}
          {typedListing.description && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">About</h2>
              <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {typedListing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {typedListing.amenities && typedListing.amenities.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {typedListing.amenities.map((a) => (
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
            contactEmail={typedListing.contact_email}
            contactPhone={typedListing.contact_phone ?? undefined}
            contactSocial={typedListing.contact_social ?? undefined}
            posterName={typedListing.poster_first_name}
          />

          {/* Meta info */}
          <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-3 shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              {typedListing.view_count} view{typedListing.view_count !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Posted {formatDate(typedListing.created_at)}
            </div>
            <div className="pt-2 border-t border-border/50">
              <ReportDialog listingId={typedListing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
