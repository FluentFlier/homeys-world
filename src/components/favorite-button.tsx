'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { insforge } from '@/lib/insforge'

interface FavoriteButtonProps {
  listingId: string
  className?: string
}

export function FavoriteButton({ listingId, className = '' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function checkStatus() {
      const { data } = await insforge.auth.getCurrentUser()
      if (data?.user) {
        setUserId(data.user.id)
        const { data: fav } = await insforge.database
          .from('favorites')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('listing_id', listingId)
          .single()
        
        setIsFavorited(!!fav)
      }
    }
    checkStatus()
  }, [listingId])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      window.location.href = `/sign-in?next=${window.location.pathname}`
      return
    }

    setLoading(true)
    try {
      if (isFavorited) {
        await insforge.database
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId)
        setIsFavorited(false)
      } else {
        await insforge.database
          .from('favorites')
          .insert([{ user_id: userId, listing_id: listingId }])
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full backdrop-blur-md transition-all ${
        isFavorited 
          ? 'bg-primary text-white scale-110' 
          : 'bg-white/70 text-muted-foreground hover:bg-white hover:text-primary'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  )
}
