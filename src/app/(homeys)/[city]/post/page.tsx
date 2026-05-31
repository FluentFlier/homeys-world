'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { PostForm } from './post-form'
import { Loader2 } from 'lucide-react'

export default function PostListingPage() {
  const params = useParams<{ city: string }>()
  const router = useRouter()
  const slug = params.city

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await insforge.auth.getCurrentUser()

      if (!user) {
        router.push(`/sign-in?next=/${slug}/post`)
        return
      }

      setUser(user)

      const { data: cityData } = await insforge.database
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!cityData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setCity(cityData as City)
      setLoading(false)
    }

    init()
  }, [slug, router])

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound || !city || !user) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <p className="font-body text-sm text-muted-foreground">City not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Post a listing
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            Share your place or find a roommate in{' '}
            <span className="font-medium text-foreground">{city.name}</span>
          </p>
        </div>

        <PostForm
          city={city}
          userEmail={user.email ?? ''}
          userId={user.id}
        />
      </div>
    </div>
  )
}
