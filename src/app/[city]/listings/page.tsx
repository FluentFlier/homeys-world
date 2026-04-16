import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { City } from '@/lib/types'
import { BrowseClient } from './browse-client'

interface Props {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props) {
  const { city: slug } = await params
  const supabase = await createClient()
  const { data: city } = await supabase
    .from('cities')
    .select('name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!city) return { title: 'City not found' }
  return { title: `Browse Listings in ${city.name} - Homeys World` }
}

export default async function BrowseListingsPage({ params }: Props) {
  const { city: slug } = await params
  const supabase = await createClient()

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!city) notFound()

  return <BrowseClient city={city as City} />
}
