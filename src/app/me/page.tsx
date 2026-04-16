import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import type { Listing } from '@/lib/types'
import { LISTING_TYPES, formatPrice, formatDate } from '@/lib/types'
import {
  Plus,
  MapPin,
  Pause,
  Play,
  Trash2,
  Clock,
  Pencil,
  Inbox,
} from 'lucide-react'

async function toggleActive(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  const supabase = await (await import('@/lib/supabase-server')).createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('listings')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/me')
}

async function deleteListing(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await (await import('@/lib/supabase-server')).createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('listings').delete().eq('id', id).eq('user_id', user.id)
  const { revalidatePath } = await import('next/cache')
  revalidatePath('/me')
}

async function extendListing(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const supabase = await (await import('@/lib/supabase-server')).createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: listing } = await supabase
    .from('listings')
    .select('expires_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!listing) return

  const base = new Date(listing.expires_at) > new Date()
    ? new Date(listing.expires_at)
    : new Date()
  base.setDate(base.getDate() + 60)

  await supabase
    .from('listings')
    .update({
      expires_at: base.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/me')
}

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export const metadata = {
  title: 'My Listings - Homeys World',
}

export default async function MyListingsPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in?next=/me')
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('*, cities(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allListings = (listings ?? []) as Listing[]
  const now = new Date()

  const active = allListings.filter(
    (l) => l.is_active && new Date(l.expires_at) > now
  )
  const expired = allListings.filter(
    (l) => !l.is_active || new Date(l.expires_at) <= now
  )

  const currentTab = tab === 'expired' ? 'expired' : 'active'
  const display = currentTab === 'active' ? active : expired

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            My Listings
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-5 py-2.5 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Link
            href="/me?tab=active"
            className={`font-body text-sm px-4 py-2 rounded-full transition-colors ${
              currentTab === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Active ({active.length})
          </Link>
          <Link
            href="/me?tab=expired"
            className={`font-body text-sm px-4 py-2 rounded-full transition-colors ${
              currentTab === 'expired'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            Expired ({expired.length})
          </Link>
        </div>

        {/* Listings */}
        {display.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
              {currentTab === 'active'
                ? 'No active listings'
                : 'No expired listings'}
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {currentTab === 'active'
                ? 'Post your first listing and find your next homey.'
                : 'Expired listings will appear here.'}
            </p>
            {currentTab === 'active' && (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-2.5 hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post a Listing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {display.map((listing) => {
              const city = listing.cities
              const isExpired = new Date(listing.expires_at) <= now
              const citySlug = city?.slug ?? ''

              return (
                <div
                  key={listing.id}
                  className="bg-white border border-border rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-24 h-20 sm:h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                      {listing.photo_urls?.[0] ? (
                        <img
                          src={listing.photo_urls[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                          <span className="font-heading text-lg text-foreground/20">
                            {listing.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading text-base font-semibold text-foreground leading-tight line-clamp-1">
                            {listing.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-body text-muted-foreground">
                            {city && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {city.name}
                              </span>
                            )}
                            <span>
                              {LISTING_TYPES[listing.type]}
                            </span>
                            <span>
                              {formatPrice(
                                listing.monthly_rent,
                                city?.currency ?? 'USD'
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <span
                          className={`shrink-0 text-xs font-body font-semibold px-2.5 py-1 rounded-full ${
                            isExpired || !listing.is_active
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isExpired
                            ? 'Expired'
                            : listing.is_active
                              ? 'Active'
                              : 'Paused'}
                        </span>
                      </div>

                      <div className="flex items-center gap-x-3 mt-1.5 text-xs font-body text-muted-foreground/70">
                        <span>
                          Posted {formatDate(listing.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {formatDate(listing.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <Link
                      href={`/${citySlug}/listings/${listing.id}`}
                      className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
                    >
                      View
                    </Link>

                    <Link
                      href={`/${citySlug}/post?edit=${listing.id}`}
                      className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Link>

                    {!isExpired && (
                      <form action={toggleActive}>
                        <input type="hidden" name="id" value={listing.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={listing.is_active ? 'false' : 'true'}
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
                        >
                          {listing.is_active ? (
                            <>
                              <Pause className="w-3 h-3" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              Activate
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    <form action={extendListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 font-body text-xs text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-full hover:bg-primary/5"
                      >
                        <Clock className="w-3 h-3" />
                        Extend 60 days
                      </button>
                    </form>

                    <form action={deleteListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 font-body text-xs text-destructive hover:text-destructive/80 transition-colors px-3 py-1.5 rounded-full hover:bg-destructive/5"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
