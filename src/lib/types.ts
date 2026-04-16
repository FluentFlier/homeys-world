export interface City {
  id: string
  slug: string
  name: string
  country: string
  neighborhoods: string[]
  currency: string
  is_active: boolean
  listing_count: number
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  city_id: string
  type: 'room_available' | 'apartment_available' | 'looking_for_room' | 'looking_for_roommate'
  title: string
  description: string
  monthly_rent: number | null
  move_in_date: string | null
  move_out_date: string | null
  neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  amenities: string[]
  photo_urls: string[]
  contact_email: string
  contact_phone: string | null
  contact_social: string | null
  poster_first_name: string
  is_active: boolean
  view_count: number
  expires_at: string
  created_at: string
  updated_at: string
  cities?: City
}

export interface CityRequest {
  city_name: string
  country?: string
  requester_email?: string
  note?: string
}

export const LISTING_TYPES = {
  room_available: 'Room Available',
  apartment_available: 'Whole Place',
  looking_for_room: 'Looking for Room',
  looking_for_roommate: 'Looking for Roommate',
} as const

export const AMENITIES = [
  'furnished',
  'laundry_in_unit',
  'pets_okay',
  'parking',
  'gym',
  'rooftop',
  'utilities_included',
] as const

export function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return 'Ask'
  const sym = currency === 'GBP' ? '£' : '$'
  return `${sym}${amount.toLocaleString()}/mo`
}

export function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
