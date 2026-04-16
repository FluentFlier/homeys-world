import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { City } from '@/lib/types'
import { PostForm } from './post-form'

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
  return { title: `Post a Listing in ${city.name} - Homeys World` }
}

export default async function PostListingPage({ params }: Props) {
  const { city: slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/sign-in?next=/${slug}/post`)
  }

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!city) notFound()

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Post a listing
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Share your place or find a roommate in{' '}
            <span className="font-medium text-foreground">{(city as City).name}</span>
          </p>
        </div>

        <PostForm
          city={city as City}
          userEmail={user.email ?? ''}
          userId={user.id}
        />
      </div>
    </div>
  )
}
