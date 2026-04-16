'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  User,
  Save,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City, Profile } from '@/lib/types'
import { LIFESTYLE_OPTIONS, LIFESTYLE_LABELS } from '@/lib/types'
import { Blob } from '@/components/blob'

const AGE_RANGES = ['18-24', '25-30', '31-35', '36-40', '40+'] as const

export default function EditProfilePage() {
  const router = useRouter()

  // Auth & data state
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<City[]>([])
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')
  const [occupation, setOccupation] = useState('')
  const [lookingInCityId, setLookingInCityId] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [lifestyle, setLifestyle] = useState<string[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const { data: userData } = await insforge.auth.getCurrentUser()
        if (!userData?.user) {
          router.push('/sign-in?next=/profiles/edit')
          return
        }

        const user = userData.user
        setUserId(user.id)
        setContactEmail(user.email ?? '')

        // Fetch existing profile and cities in parallel
        const [profileRes, citiesRes] = await Promise.all([
          insforge.database
            .from('profiles')
            .select('*, cities(*)')
            .eq('user_id', user.id)
            .single(),
          insforge.database
            .from('cities')
            .select('*')
            .eq('is_active', true)
            .order('name'),
        ])

        if (citiesRes.data) setCities(citiesRes.data)

        if (profileRes.data) {
          const p = profileRes.data as Profile
          setExistingProfile(p)
          setDisplayName(p.display_name ?? '')
          setBio(p.bio ?? '')
          setAgeRange(p.age_range ?? '')
          setGender(p.gender ?? '')
          setOccupation(p.occupation ?? '')
          setLookingInCityId(p.looking_in_city_id ?? '')
          setBudgetMin(p.budget_min != null ? String(p.budget_min) : '')
          setBudgetMax(p.budget_max != null ? String(p.budget_max) : '')
          setMoveInDate(p.move_in_date ?? '')
          setLifestyle(p.lifestyle ?? [])
          setContactEmail(p.contact_email ?? user.email ?? '')
          setInstagramHandle(p.social_links?.instagram ?? '')
          setTwitterHandle(p.social_links?.twitter ?? '')
        }
      } catch {
        setError('Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  const toggleLifestyle = (option: string) => {
    setLifestyle((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }
    if (!bio.trim()) {
      setError('Bio is required.')
      return
    }
    if (!userId) {
      setError('Not authenticated.')
      return
    }

    setSubmitting(true)

    try {
      const socialLinks: Record<string, string> = {}
      if (instagramHandle.trim()) socialLinks.instagram = instagramHandle.trim()
      if (twitterHandle.trim()) socialLinks.twitter = twitterHandle.trim()

      const profileData = {
        user_id: userId,
        display_name: displayName.trim(),
        bio: bio.trim(),
        age_range: ageRange || null,
        gender: gender.trim() || null,
        occupation: occupation.trim() || null,
        looking_in_city_id: lookingInCityId || null,
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        move_in_date: moveInDate || null,
        lifestyle,
        social_links: socialLinks,
        contact_email: contactEmail.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      let result
      if (existingProfile) {
        result = await insforge.database
          .from('profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
      } else {
        result = await insforge.database
          .from('profiles')
          .insert([profileData])
      }

      if (result.error) {
        setError(result.error.message)
        setSubmitting(false)
        return
      }

      router.push('/profiles')
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blobs */}
      <Blob className="w-[500px] h-[500px] -top-40 -right-40" color="primary" />
      <Blob className="w-[400px] h-[400px] top-[60%] -left-32" color="secondary" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link
          href="/profiles"
          className="inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profiles
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            {existingProfile ? 'Edit Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Let potential roommates know who you are and what you are looking for.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/60 backdrop-blur-sm border border-border rounded-[2rem] p-6 sm:p-8 shadow-[0_2px_20px_rgba(93,112,82,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section: About You */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
                About You
              </h2>

              {/* Display name */}
              <div className="mb-4">
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                  Display Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should roommates know you?"
                  maxLength={80}
                  required
                  className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Bio */}
              <div className="mb-4">
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                  Bio <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential roommates about yourself"
                  rows={4}
                  maxLength={2000}
                  required
                  className="w-full font-body text-sm bg-white/50 border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age range */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Age Range
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    <option value="">Select age range</option>
                    {AGE_RANGES.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Gender (optional)
                  </label>
                  <input
                    type="text"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="e.g. Female, Non-binary"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Occupation */}
                <div className="sm:col-span-2">
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Software Engineer, Grad Student"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Housing Preferences */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
                Housing Preferences
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Looking in city */}
                <div className="sm:col-span-2">
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Looking in City
                  </label>
                  <select
                    value={lookingInCityId}
                    onChange={(e) => setLookingInCityId(e.target.value)}
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}, {city.country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget min */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Budget Min ($)
                  </label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="800"
                    min={0}
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Budget max */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Budget Max ($)
                  </label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="2000"
                    min={0}
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Move-in date */}
                <div className="sm:col-span-2">
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Move-in Date
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Lifestyle chips */}
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-2">
                  Lifestyle
                </label>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleLifestyle(option)}
                      className={`font-body text-xs px-3.5 py-2 rounded-full border transition-all ${
                        lifestyle.includes(option)
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border bg-white/50 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {LIFESTYLE_LABELS[option] ?? option}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section: Contact & Social */}
            <section>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
                Contact & Social
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact email */}
                <div className="sm:col-span-2">
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Instagram (optional)
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>

                {/* Twitter/X */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                    Twitter / X (optional)
                  </label>
                  <input
                    type="text"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 font-body text-sm text-destructive bg-destructive/5 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-8 py-3.5 hover:bg-primary/90 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {existingProfile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
