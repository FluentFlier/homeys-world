'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Listing } from '@/lib/types'
import Link from 'next/link'
import { formatPrice } from '@/lib/types'

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

interface ListingMapProps {
  listings: Listing[]
  center: [number, number]
  zoom?: number
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

export default function ListingMap({ listings, center, zoom = 12 }: ListingMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fixLeafletIcon()
  }, [])

  if (!isClient) return <div className="w-full h-full bg-muted animate-pulse rounded-[2.5rem]" />

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '2.5rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} zoom={zoom} />
      {listings.map((listing) => {
        if (!listing.latitude || !listing.longitude) return null
        return (
          <Marker 
            key={listing.id} 
            position={[listing.latitude, listing.longitude]}
          >
            <Popup>
              <div className="p-1 min-w-[120px]">
                <p className="font-heading font-bold text-sm mb-1">{listing.title}</p>
                <p className="font-body text-xs text-primary font-bold mb-2">
                  {formatPrice(listing.monthly_rent, 'USD')}
                </p>
                <Link 
                  href={`/city/listings/${listing.id}`} 
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
