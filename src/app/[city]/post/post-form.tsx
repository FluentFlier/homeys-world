'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import imageCompression from 'browser-image-compression'
import {
  Upload,
  X,
  Camera,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { LISTING_TYPES, AMENITIES } from '@/lib/types'
import { listingSchema, type ListingFormValues } from '@/lib/schemas'

interface PostFormProps {
  city: City
  userEmail: string
  userId: string
}

const AMENITY_LABELS: Record<string, string> = {
  furnished: 'Furnished',
  laundry_in_unit: 'In-unit Laundry',
  pets_okay: 'Pets OK',
  parking: 'Parking',
  gym: 'Gym',
  rooftop: 'Rooftop',
  utilities_included: 'Utilities Incl.',
}

function generateUUID() {
  return crypto.randomUUID()
}

export function PostForm({ city, userEmail, userId }: PostFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [listingId] = useState(() => generateUUID())

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: 'room_available',
      contact_email: userEmail,
      amenities: [],
    },
  })

  const type = watch('type')
  const selectedAmenities = watch('amenities')

  // Photo state
  const [photos, setPhotos] = useState<
    { id: string; file: File; preview: string; uploading: boolean; url?: string }[]
  >([])

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)

  const enhanceDescription = async () => {
    const current = watch('description') || ''
    if (current.length < 10) {
      setServerError('Please write at least a few words first.')
      return
    }

    setIsEnhancing(true)
    // Mock AI delay
    await new Promise(r => setTimeout(r, 2000))

    const enhancements = [
      "Welcome to your next home! This beautiful space offers great natural light and a warm atmosphere. Perfect for anyone looking for a comfortable stay in a prime location.",
      "A stunning room in a shared apartment. The neighborhood is quiet yet well-connected, with plenty of local shops and cafes nearby. Ideal for students or professionals.",
      "Look no further! This listing features a spacious layout, modern amenities, and a friendly vibe. You'll love living in this vibrant part of the city."
    ]

    const result = enhancements[Math.floor(Math.random() * enhancements.length)]
    setValue('description', result)
    setIsEnhancing(false)
  }

  const toggleAmenity = (a: string) => {
    const current = selectedAmenities || []
    const next = current.includes(a) ? current.filter((x) => x !== a) : [...current, a]
    setValue('amenities', next)
  }

  const compressAndAddPhotos = useCallback(
    async (files: File[]) => {
      const remaining = 6 - photos.length
      const toProcess = files.slice(0, remaining)

      for (const file of toProcess) {
        if (!file.type.startsWith('image/')) continue

        const id = generateUUID()
        const preview = URL.createObjectURL(file)

        setPhotos((prev) => [...prev, { id, file, preview, uploading: true }])

        try {
          const compressed = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          })

          const path = `${userId}/${listingId}/${id}.jpg`
          const { data, error: uploadError } = await insforge.storage
            .from('listing-photos')
            .upload(path, compressed)

          if (uploadError || !data) {
            setPhotos((prev) => prev.filter((p) => p.id !== id))
            URL.revokeObjectURL(preview)
            continue
          }

          setPhotos((prev) =>
            prev.map((p) =>
              p.id === id ? { ...p, uploading: false, url: data.url } : p
            )
          )
        } catch {
          setPhotos((prev) => prev.filter((p) => p.id !== id))
          URL.revokeObjectURL(preview)
        }
      }
    },
    [photos.length, userId, listingId]
  )

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const onFormSubmit = async (values: ListingFormValues) => {
    if (honeypot) return
    setServerError('')

    if (photos.some((p) => p.uploading)) {
      setServerError('Please wait for photos to finish uploading.')
      return
    }

    setSubmitting(true)

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await insforge.database
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo)

      if ((count ?? 0) >= 3) {
        setServerError('Daily limit of 3 listings reached.')
        setSubmitting(false)
        return
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 60)

      const photoUrls = photos
        .map((p) => p.url)
        .filter((u): u is string => !!u)

      const { error: insertError } = await insforge.database.from('listings').insert([{
        ...values,
        id: listingId,
        user_id: userId,
        city_id: city.id,
        photo_urls: photoUrls,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      }])

      if (insertError) {
        setServerError(insertError.message)
        setSubmitting(false)
        return
      }

      router.push(`/${city.slug}/listings/${listingId}?success=true`)
    } catch {
      setServerError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
      <div style={{ display: 'none' }} aria-hidden="true">
        <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
      </div>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">Basic Info</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(LISTING_TYPES).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('type', value as any)}
              className={`font-body text-sm text-left px-4 py-3 rounded-2xl border transition-all ${
                type === value
                  ? 'border-primary bg-primary/5 text-foreground ring-2 ring-primary/20'
                  : 'border-border bg-white/50 text-muted-foreground hover:border-primary/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block font-body text-xs font-medium text-foreground mb-1.5">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            {...register('title')}
            placeholder="Sunny room near the park"
            className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-body text-xs font-medium text-foreground">Description</label>
            <button
              type="button"
              onClick={enhanceDescription}
              disabled={isEnhancing}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-2 py-1 rounded-md border border-primary/10"
            >
              {isEnhancing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </button>
          </div>
          <textarea
            {...register('description')}
            placeholder="Details about the space..."
            rows={4}
            className="w-full font-body text-sm bg-white/50 border border-border rounded-2xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
          />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">Rent ({city.currency})</label>
            <input
              type="number"
              {...register('monthly_rent', { valueAsNumber: true })}
              placeholder="1500"
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">Neighborhood</label>
            <select
              {...register('neighborhood')}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            >
              <option value="">Select neighborhood</option>
              {city.neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">Move-in Date</label>
            <input
              type="date"
              {...register('move_in_date')}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">Move-out Date</label>
            <input
              type="date"
              {...register('move_out_date')}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-medium text-foreground mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`font-body text-xs px-3.5 py-2 rounded-full border transition-all ${
                  selectedAmenities?.includes(a)
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-white/50 text-muted-foreground hover:border-primary/30'
                }`}
              >
                {AMENITY_LABELS[a] ?? a}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Photos</h2>
        {photos.length < 6 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
          >
            <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Click or drag photos</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">Contact Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">First Name <span className="text-destructive">*</span></label>
            <input {...register('poster_first_name')} placeholder="Your name" className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">Email <span className="text-destructive">*</span></label>
            <input {...register('contact_email')} placeholder="you@example.com" className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
          </div>
        </div>
      </section>

      {serverError && (
        <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Post listing <ArrowRight className="w-5 h-5" /></>}
      </button>
    </form>
  )
}
