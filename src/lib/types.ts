export interface City {
  id: string
  slug: string
  name: string
  country: string
  latitude: number | null
  longitude: number | null
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
  latitude: number | null
  longitude: number | null
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

export interface Profile {
  id: string
  user_id: string
  display_name: string
  bio: string
  age_range: string | null
  gender: string | null
  occupation: string | null
  avatar_url: string | null
  looking_in_city_id: string | null
  budget_min: number | null
  budget_max: number | null
  move_in_date: string | null
  lifestyle: string[]
  hobbies: string[]
  social_links: Record<string, string>
  contact_email: string | null
  is_active: boolean
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

export interface InsForgeUser {
  id: string
  email: string
  emailVerified: boolean
  providers: string[]
  createdAt: string
  updatedAt: string
  profile: {
    name?: string
    avatar_url?: string
  }
  metadata: Record<string, unknown>
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

export const LIFESTYLE_OPTIONS = [
  'early_bird',
  'night_owl',
  'clean_freak',
  'social',
  'quiet',
  'pet_friendly',
  'non_smoker',
  'vegetarian',
  'works_from_home',
  'student',
  'professional',
  'lgbtq_friendly',
] as const

export const LIFESTYLE_LABELS: Record<string, string> = {
  early_bird: 'Early Bird',
  night_owl: 'Night Owl',
  clean_freak: 'Clean & Tidy',
  social: 'Social Butterfly',
  quiet: 'Quiet & Chill',
  pet_friendly: 'Pet Friendly',
  non_smoker: 'Non-Smoker',
  vegetarian: 'Vegetarian/Vegan',
  works_from_home: 'WFH',
  student: 'Student',
  professional: 'Professional',
  lgbtq_friendly: 'LGBTQ+ Friendly',
}

export const HOBBY_OPTIONS = [
  'cooking',
  'gaming',
  'hiking',
  'reading',
  'fitness',
  'music',
  'travel',
  'art',
  'coding',
  'cinema',
  'yoga',
  'photography',
] as const

export const HOBBY_LABELS: Record<string, string> = {
  cooking: 'Cooking',
  gaming: 'Gaming',
  hiking: 'Hiking',
  reading: 'Reading',
  fitness: 'Fitness',
  music: 'Music',
  travel: 'Travel',
  art: 'Art',
  coding: 'Coding',
  cinema: 'Cinema',
  yoga: 'Yoga',
  photography: 'Photography',
}

export function formatPrice(amount: number | null, currency: string) {
  if (amount == null) return 'Ask'
  const sym = currency === 'GBP' ? '\u00a3' : '$'
  return `${sym}${amount.toLocaleString()}/mo`
}

export function formatBudget(min: number | null, max: number | null, currency: string = 'USD') {
  const sym = currency === 'GBP' ? '\u00a3' : '$'
  if (min && max) return `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}/mo`
  if (min) return `${sym}${min.toLocaleString()}+/mo`
  if (max) return `Up to ${sym}${max.toLocaleString()}/mo`
  return 'Flexible'
}

export function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
