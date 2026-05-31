'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  ChevronDown,
  User,
  Users,
  Loader2,
  SearchX,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City, Profile } from '@/lib/types'
import { LIFESTYLE_LABELS, formatBudget, formatDate } from '@/lib/types'
import { Blob } from '@/components/blob'

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(false)
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [tagFilters, setTagFilters] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        // Auth gate: must be logged in to browse profiles
        const { data: authData } = await insforge.auth.getCurrentUser()
        if (!authData?.user) {
          router.push('/sign-in?next=/profiles')
          return
        }

        const [profileRes, cityRes] = await Promise.all([
          insforge.database
            .from('profiles')
            .select('*, cities(*)')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          insforge.database
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true }),
        ])
        setProfiles((profileRes.data as Profile[]) ?? [])
        setCities((cityRes.data as City[]) ?? [])
      } catch {
        setErrorState(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const allLifestyleTags = useMemo(() => {
    const tags = new Set<string>()
    profiles.forEach((p) => p.lifestyle?.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [profiles])

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (cityFilter !== 'all' && p.looking_in_city_id !== cityFilter) return false
      if (
        tagFilters.length > 0 &&
        !tagFilters.every((t) => p.lifestyle?.includes(t))
      )
        return false
      return true
    })
  }, [profiles, cityFilter, tagFilters])

  function toggleTag(tag: string) {
    setTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function getInitial(name: string) {
    return name?.charAt(0)?.toUpperCase() || '?'
  }

  const avatarColors = [
    'bg-primary text-primary-foreground',
    'bg-secondary text-white',
    'bg-primary/70 text-white',
    'bg-secondary/70 text-white',
    'bg-[#7A8B6F] text-white',
    'bg-[#D4A574] text-white',
  ]

  function getAvatarColor(id: string) {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    return avatarColors[Math.abs(hash) % avatarColors.length]
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 px-4">
        <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-60" color="primary" />
        <Blob className="w-[400px] h-[400px] -top-20 right-0 opacity-40" color="secondary" />
        <Blob className="w-[300px] h-[300px] bottom-0 left-1/3 opacity-30" color="primary" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
            Find your{' '}
            <span className="text-primary">people</span>
          </h1>
          <p className="mt-6 font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Browse profiles of people looking for roommates. Connect with
            someone whose vibe matches yours.
          </p>
          <div className="mt-8">
            <Link
              href="/profiles/edit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              <User className="w-4 h-4" />
              Create your profile
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="relative px-4 pb-8">
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* City dropdown */}
            <div className="relative">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Filter by city"
                className="appearance-none rounded-full border border-border bg-white/60 backdrop-blur-sm pl-4 pr-10 py-2.5 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="all">All cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Lifestyle tags */}
            <div className="flex flex-wrap gap-2">
              {allLifestyleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all hover:scale-105 ${
                    tagFilters.includes(tag)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-accent/60 text-foreground/70 hover:bg-accent'
                  }`}
                >
                  {LIFESTYLE_LABELS[tag] || tag}
                </button>
              ))}
            </div>
          </div>

          {!loading && (
            <p className="font-body text-sm text-muted-foreground mt-4">
              {filtered.length} {filtered.length === 1 ? 'profile' : 'profiles'} found
            </p>
          )}
        </div>
      </section>

      {/* Profile grid */}
      <section className="relative overflow-hidden px-4 pb-20">
        <Blob className="w-[350px] h-[350px] top-20 -right-20 opacity-20" color="secondary" />
        <Blob className="w-[300px] h-[300px] bottom-40 -left-20 opacity-15" color="primary" />

        <div className="relative max-w-5xl mx-auto">
          {errorState ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-5">
                <SearchX className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h3>
              <p className="font-body text-muted-foreground max-w-sm mb-4">
                We could not load profiles. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-5 py-2.5 rounded-full transition-transform hover:scale-105"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="font-body text-muted-foreground">Loading profiles...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/60 mb-5">
                <SearchX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                No profiles found
              </h3>
              <p className="font-body text-muted-foreground max-w-sm">
                Try adjusting your filters or check back later as new people join every day.
              </p>
              {(cityFilter !== 'all' || tagFilters.length > 0) && (
                <button
                  onClick={() => {
                    setCityFilter('all')
                    setTagFilters([])
                  }}
                  className="mt-4 inline-flex items-center gap-2 bg-accent text-foreground font-body font-semibold px-5 py-2.5 rounded-full transition-transform hover:scale-105"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((profile) => {
                const currency = profile.cities?.currency || 'USD'
                const visibleTags = profile.lifestyle?.slice(0, 4) || []
                const extraCount = (profile.lifestyle?.length || 0) - 4

                return (
                  <Link
                    key={profile.id}
                    href={`/profiles/${profile.id}`}
                    className="group relative rounded-[2rem] border border-border bg-white/60 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    {/* Header: avatar + name */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div
                        className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-heading text-lg font-bold ${getAvatarColor(profile.id)}`}
                      >
                        {getInitial(profile.display_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {profile.display_name}
                        </h3>
                        {profile.occupation && (
                          <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{profile.occupation}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* City badge */}
                    {profile.cities && (
                      <div className="mb-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-body text-xs font-medium text-primary">
                          <MapPin className="w-3 h-3" />
                          {profile.cities.name}
                        </span>
                        {profile.age_range && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-accent/60 px-3 py-1 font-body text-xs font-medium text-foreground/70">
                            {profile.age_range}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {profile.bio}
                      </p>
                    )}

                    {/* Details row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
                      <span className="inline-flex items-center gap-1.5 font-body text-xs text-foreground/60">
                        <DollarSign className="w-3.5 h-3.5 text-secondary" />
                        {formatBudget(profile.budget_min, profile.budget_max, currency)}
                      </span>
                      {profile.move_in_date && (
                        <span className="inline-flex items-center gap-1.5 font-body text-xs text-foreground/60">
                          <Calendar className="w-3.5 h-3.5 text-secondary" />
                          {formatDate(profile.move_in_date)}
                        </span>
                      )}
                    </div>

                    {/* Lifestyle chips */}
                    {visibleTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {visibleTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted/60 px-2.5 py-1 font-body text-[11px] font-medium text-foreground/60"
                          >
                            {LIFESTYLE_LABELS[tag] || tag}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="rounded-full bg-muted/60 px-2.5 py-1 font-body text-[11px] font-medium text-foreground/40">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <span className="inline-flex items-center font-body text-sm font-semibold text-primary group-hover:underline transition-colors">
                      View profile
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
