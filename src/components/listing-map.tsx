'use client'

import { useEffect, useRef } from 'react'
import type { Listing, City } from '@/lib/types'
import { formatPrice, LISTING_TYPES } from '@/lib/types'
import { getListingCoords, CITY_CENTERS } from '@/lib/neighborhood-coords'

interface ListingMapProps {
  listings: Listing[]
  city: City
  onMarkerClick?: (listingId: string) => void
}

export function ListingMap({ listings, city, onMarkerClick }: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Dynamic import to avoid SSR issues
    let cancelled = false

    async function initMap() {
      const L = (await import('leaflet')).default

      if (cancelled || !mapRef.current) return

      // Clean up previous instance
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
      }

      const center = CITY_CENTERS[city.slug] ?? [37.7749, -122.4194]
      const map = L.map(mapRef.current, {
        center,
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
      })

      mapInstanceRef.current = map

      // Use OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Custom marker icon matching the design system
      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: #5D7052;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(93,112,82,0.4);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const lookingIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: #C18C5D;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(193,140,93,0.4);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      // Add markers for each listing
      listings.forEach((listing) => {
        const coords = getListingCoords(listing.neighborhood, city.slug)
        if (!coords) return

        const isLooking = listing.type.startsWith('looking_for')
        const typeLabel = LISTING_TYPES[listing.type]
        const price = formatPrice(listing.monthly_rent, city.currency)

        const marker = L.marker(coords, {
          icon: isLooking ? lookingIcon : markerIcon,
        }).addTo(map)

        const popupContent = `
          <div style="font-family: 'Nunito', sans-serif; min-width: 180px; max-width: 240px;">
            <div style="font-size: 11px; font-weight: 600; color: ${isLooking ? '#C18C5D' : '#5D7052'}; margin-bottom: 4px;">
              ${typeLabel}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #2C2C24; margin-bottom: 2px; line-height: 1.3;">
              ${listing.title}
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #5D7052; margin-bottom: 4px;">
              ${price}
            </div>
            ${listing.neighborhood ? `<div style="font-size: 11px; color: #78786C;">${listing.neighborhood}</div>` : ''}
            <a href="/${city.slug}/listings/${listing.id}"
               style="display: inline-block; margin-top: 8px; font-size: 12px; color: #5D7052; font-weight: 600; text-decoration: none;">
              View listing &rarr;
            </a>
          </div>
        `

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'custom-popup',
        })

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(listing.id))
        }
      })

      // Fit bounds if there are markers
      if (listings.length > 0) {
        const validCoords = listings
          .map((l) => getListingCoords(l.neighborhood, city.slug))
          .filter((c): c is [number, number] => c !== null)

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords.map(([lat, lng]) => [lat, lng]))
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
        }
      }
    }

    initMap()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [listings, city, onMarkerClick])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
      <div ref={mapRef} className="w-full h-[400px] lg:h-[500px]" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-border/50 z-[1000]">
        <div className="flex items-center gap-3 text-xs font-body">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            Looking
          </span>
        </div>
      </div>
    </div>
  )
}
