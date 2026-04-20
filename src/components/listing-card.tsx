import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import type { Listing, City } from '@/lib/types'
import { formatPrice, formatDate, LISTING_TYPES } from '@/lib/types'
import { FavoriteButton } from './favorite-button'

const RADIUS_PATTERNS = [
  'rounded-[24px_8px_24px_8px]',
  'rounded-[8px_24px_8px_24px]',
  'rounded-[20px_12px_20px_4px]',
  'rounded-[4px_20px_12px_20px]',
  'rounded-[16px_24px_8px_16px]',
  'rounded-[12px_8px_24px_12px]',
] as const

const PLACEHOLDER_GRADIENTS = [
  'from-primary/20 to-accent',
  'from-secondary/20 to-muted',
  'from-accent to-primary/10',
  'from-muted to-secondary/10',
  'from-primary/10 to-secondary/10',
  'from-secondary/15 to-accent',
] as const

interface ListingCardProps {
  listing: Listing
  city: City
  index: number
}

export function ListingCard({ listing, city, index }: ListingCardProps) {
  const radiusClass = RADIUS_PATTERNS[index % 6]
  const gradientClass = PLACEHOLDER_GRADIENTS[index % 6]
  const firstPhoto = listing.photo_urls?.[0]
  const typeLabel = LISTING_TYPES[listing.type]
  const isLooking = listing.type.startsWith('looking_for')

  return (
    <Link
      href={`/${city.slug}/listings/${listing.id}`}
      className={`group block bg-white border border-border ${radiusClass} overflow-hidden shadow-[0_4px_20px_rgba(93,112,82,0.1)] hover:shadow-[0_8px_30px_rgba(93,112,82,0.18)] hover:-translate-y-1 transition-all duration-300`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
          >
            <span className="font-heading text-2xl text-foreground/20">
              {listing.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-body font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
            isLooking
              ? 'bg-secondary/90 text-secondary-foreground'
              : 'bg-white/80 text-foreground'
          }`}
        >
          {typeLabel}
        </span>

        <FavoriteButton
          listingId={listing.id}
          className="absolute top-3 right-3 shadow-sm"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <span className="shrink-0 font-heading text-base font-bold text-primary">
            {formatPrice(listing.monthly_rent, city.currency)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-body text-muted-foreground">
          {listing.neighborhood && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.neighborhood}
            </span>
          )}
          {listing.move_in_date && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(listing.move_in_date)}
            </span>
          )}
        </div>

        <p className="text-xs font-body text-muted-foreground/70 pt-1 border-t border-border/50">
          Posted by{' '}
          <span className="text-foreground/60 font-medium">{listing.poster_first_name}</span>
        </p>
      </div>
    </Link>
  )
}
