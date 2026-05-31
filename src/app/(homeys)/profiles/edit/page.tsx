'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City, Profile } from '@/lib/types'
import { LIFESTYLE_OPTIONS, LIFESTYLE_LABELS, HOBBY_OPTIONS, HOBBY_LABELS } from '@/lib/types'
import { profileSchema, type ProfileFormValues, type ProfileFormInput } from '@/lib/schemas'
import { Blob } from '@/components/blob'

const AGE_RANGES = ['18-24', '25-30', '31-35', '36-40', '40+'] as const

export default function EditProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<City[]>([])
  const [existingProfile, setExistingProfile] = useState<Profile | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      lifestyle: [],
      hobbies: [],
    },
  })

  const selectedLifestyle = watch('lifestyle')
  const selectedHobbies = watch('hobbies')

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

        const [profileRes, citiesRes] = await Promise.all([
          insforge.database.from('profiles').select('*, cities(*)').eq('user_id', user.id).single(),
          insforge.database.from('cities').select('*').eq('is_active', true).order('name'),
        ])

        if (citiesRes.data) setCities(citiesRes.data)
        if (profileRes.data) {
          const p = profileRes.data as Profile
          setExistingProfile(p)
          reset({
            display_name: p.display_name,
            bio: p.bio,
            age_range: p.age_range,
            gender: p.gender,
            occupation: p.occupation,
            budget_min: p.budget_min,
            budget_max: p.budget_max,
            move_in_date: p.move_in_date,
            lifestyle: p.lifestyle || [],
            hobbies: p.hobbies || [],
            contact_email: p.contact_email || user.email,
          })
        } else {
          setValue('contact_email', user.email || '')
        }
      } catch {
        setServerError('Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, reset, setValue])

  const toggleLifestyle = (option: string) => {
    const current = selectedLifestyle || []
    const next = current.includes(option) ? current.filter((x) => x !== option) : [...current, option]
    setValue('lifestyle', next)
  }

  const toggleHobby = (option: string) => {
    const current = selectedHobbies || []
    const next = current.includes(option) ? current.filter((x) => x !== option) : [...current, option]
    setValue('hobbies', next)
  }

  const onFormSubmit = async (values: ProfileFormValues) => {
    if (!userId) return
    setSubmitting(true)
    setServerError('')

    try {
      const profileData = {
        ...values,
        user_id: userId,
        is_active: true,
        updated_at: new Date().toISOString(),
      }

      const result = existingProfile
        ? await insforge.database.from('profiles').update(profileData).eq('id', existingProfile.id)
        : await insforge.database.from('profiles').insert([profileData])

      if (result.error) {
        setServerError(result.error.message)
        setSubmitting(false)
        return
      }

      router.push('/profiles')
    } catch {
      setServerError('Something went wrong.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      <Blob className="w-[500px] h-[500px] -top-40 -right-40" color="primary" />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <Link href="/profiles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to profiles
        </Link>

        <h1 className="text-3xl font-bold mb-8">{existingProfile ? 'Edit Profile' : 'Create Profile'}</h1>

        <div className="bg-white/60 backdrop-blur-sm border rounded-[2rem] p-8 shadow-sm">
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">About You</h2>
              <div>
                <label className="block text-xs font-medium mb-1.5">Display Name *</label>
                <input {...register('display_name')} className="w-full text-sm bg-white/50 border rounded-full px-4 py-2.5 focus:ring-2 focus:ring-primary/30 outline-none" />
                {errors.display_name && <p className="text-xs text-destructive mt-1">{errors.display_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Bio *</label>
                <textarea {...register('bio')} rows={4} className="w-full text-sm bg-white/50 border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
                {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Housing Preferences</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Budget Min</label>
                  <input type="number" {...register('budget_min', { valueAsNumber: true })} className="w-full text-sm bg-white/50 border rounded-full px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Budget Max</label>
                  <input type="number" {...register('budget_max', { valueAsNumber: true })} className="w-full text-sm bg-white/50 border rounded-full px-4 py-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2">Lifestyle</label>
                <div className="flex flex-wrap gap-2">
                  {LIFESTYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleLifestyle(opt)}
                      className={`text-xs px-3.5 py-2 rounded-full border transition-all ${selectedLifestyle?.includes(opt) ? 'border-primary bg-primary/10 text-primary' : 'bg-white/50 text-muted-foreground'}`}
                    >
                      {LIFESTYLE_LABELS[opt] || opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">Interests & Hobbies</label>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleHobby(opt)}
                      className={`text-xs px-3.5 py-2 rounded-full border transition-all ${selectedHobbies?.includes(opt) ? 'border-secondary bg-secondary/10 text-secondary font-semibold' : 'bg-white/50 text-muted-foreground'}`}
                    >
                      {HOBBY_LABELS[opt] || opt}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {serverError && (
              <div className="p-4 bg-destructive/5 text-destructive text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
