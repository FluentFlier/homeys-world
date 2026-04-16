'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Mail,
  Eye,
  Instagram,
  Twitter,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { Profile } from '@/lib/types'
import { LIFESTYLE_LABELS, formatBudget, formatDate } from '@/lib/types'
import { Blob } from '@/components/blob'

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [contactRevealed, setContactRevealed] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      // Auth gate
      const { data: authData } = await insforge.auth.getCurrentUser()
      if (!authData?.user) {
        router.push(`/sign-in?next=/profiles/${id}`)
        return
      }

      try {
        const { data, error } = await insforge.database
          .from('profiles')
          .select('*, cities(*)')
          .eq('id', id)
          .single()

        if (error || !data) {
          setNotFound(true)
        } else {
          setProfile(data as Profile)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="font-heading text-xl text-foreground">Profile not found</p>
        <Link
          href="/profiles"
          className="inline-flex items-center gap-1.5 font-body text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profiles
        </Link>
      </div>
    )
  }

  const initial = profile.display_name?.charAt(0)?.toUpperCase() ?? '?'
  const city = profile.cities

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <Blob className="w-[600px] h-[600px] -top-52 -right-52" color="primary" />
      <Blob className="w-[400px] h-[400px] top-[50%] -left-40" color="secondary" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/profiles"
          className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profiles
        </Link>

        {/* Profile card */}
        <div className="bg-white/60 backdrop-blur-sm border border-border rounded-[2rem] overflow-hidden shadow-[0_2px_20px_rgba(93,112,82,0.06)]">
          {/* Header area */}
          <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent px-6 sm:px-8 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/15 border-4 border-white/80 shadow-lg flex items-center justify-center shrink-0">
                <span className="font-heading text-3xl font-bold text-primary">
                  {initial}
                </span>
              </div>

              {/* Name & basics */}
              <div className="text-center sm:text-left">
                <h1 className="font-heading text-2xl font-bold text-foreground mb-1">
                  {profile.display_name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 font-body text-sm text-muted-foreground">
                  {profile.occupation && (
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {profile.occupation}
                    </span>
                  )}
                  {profile.age_range && (
                    <span>{profile.age_range}</span>
                  )}
                  {profile.gender && (
                    <span>{profile.gender}</span>
                  )}
                </div>

                {/* City badge */}
                {city && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
                    <MapPin className="w-3 h-3" />
                    {city.name}, {city.country}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-6 space-y-8">
            {/* Budget & move-in */}
            {(profile.budget_min || profile.budget_max || profile.move_in_date) && (
              <div className="flex flex-wrap gap-4">
                {(profile.budget_min || profile.budget_max) && (
                  <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                    <DollarSign className="w-4 h-4 text-secondary" />
                    <span className="font-body text-sm font-medium text-foreground">
                      {formatBudget(profile.budget_min, profile.budget_max, city?.currency)}
                    </span>
                  </div>
                )}
                {profile.move_in_date && (
                  <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    <span className="font-body text-sm font-medium text-foreground">
                      Move-in {formatDate(profile.move_in_date)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                About
              </h2>
              <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>

            {/* Lifestyle chips */}
            {profile.lifestyle && profile.lifestyle.length > 0 && (
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                  Lifestyle
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map((item) => (
                    <span
                      key={item}
                      className="font-body text-xs px-3.5 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary font-medium"
                    >
                      {LIFESTYLE_LABELS[item] ?? item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact reveal */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">
                Contact
              </h2>

              <div className="bg-white/60 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(93,112,82,0.06)]">
                <div className="px-5 py-5">
                  {!contactRevealed ? (
                    <div className="relative">
                      {/* Blurred placeholder */}
                      <div className="select-none pointer-events-none blur-sm opacity-60 space-y-2.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary/40" />
                          <span className="font-body text-sm text-foreground/50">
                            example@email.com
                          </span>
                        </div>
                        {profile.social_links?.instagram && (
                          <div className="flex items-center gap-2">
                            <Instagram className="w-4 h-4 text-primary/40" />
                            <span className="font-body text-sm text-foreground/50">
                              @instagram_handle
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Overlay button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => setContactRevealed(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-body font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          Reveal contact info
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      {/* Email */}
                      {profile.contact_email && (
                        <a
                          href={`mailto:${profile.contact_email}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors break-all">
                            {profile.contact_email}
                          </span>
                        </a>
                      )}

                      {/* Instagram */}
                      {profile.social_links?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Instagram className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                            {profile.social_links.instagram}
                          </span>
                        </a>
                      )}

                      {/* Twitter/X */}
                      {profile.social_links?.twitter && (
                        <a
                          href={`https://x.com/${profile.social_links.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Twitter className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-body text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                            {profile.social_links.twitter}
                          </span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
