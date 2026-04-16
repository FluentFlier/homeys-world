'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'
import {
  Upload,
  X,
  Camera,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import type { City } from '@/lib/types'
import { LISTING_TYPES, AMENITIES } from '@/lib/types'

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

  // Form state
  const [type, setType] = useState<string>('room_available')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [moveInDate, setMoveInDate] = useState('')
  const [moveOutDate, setMoveOutDate] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [posterFirstName, setPosterFirstName] = useState('')
  const [contactEmail, setContactEmail] = useState(userEmail)
  const [contactPhone, setContactPhone] = useState('')
  const [contactSocial, setContactSocial] = useState('')
  const [honeypot, setHoneypot] = useState('')

  // Photo state
  const [photos, setPhotos] = useState<
    { id: string; file: File; preview: string; uploading: boolean; url?: string }[]
  >([])

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    compressAndAddPhotos(files)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    compressAndAddPhotos(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Honeypot check
    if (honeypot) return

    if (!title.trim() || !posterFirstName.trim() || !contactEmail.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    // Check if photos are still uploading
    if (photos.some((p) => p.uploading)) {
      setError('Please wait for photos to finish uploading.')
      return
    }

    setSubmitting(true)

    try {
      // Rate limit: count listings in last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count } = await insforge.database
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo)

      if ((count ?? 0) >= 3) {
        setError(
          'You have reached the limit of 3 listings per day. Please try again tomorrow.'
        )
        setSubmitting(false)
        return
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 60)

      const photoUrls = photos
        .map((p) => p.url)
        .filter((u): u is string => !!u)

      const { error: insertError } = await insforge.database.from('listings').insert([{
        id: listingId,
        user_id: userId,
        city_id: city.id,
        type,
        title: title.trim(),
        description: description.trim(),
        monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
        move_in_date: moveInDate || null,
        move_out_date: moveOutDate || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        neighborhood: neighborhood || null,
        amenities,
        photo_urls: photoUrls,
        poster_first_name: posterFirstName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim() || null,
        contact_social: contactSocial.trim() || null,
        is_active: true,
        expires_at: expiresAt.toISOString(),
      }])

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
        return
      }

      router.push(`/${city.slug}/listings/${listingId}?success=true`)
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Honeypot */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {/* Section 1: Basic Info */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
          What are you listing?
        </h2>

        {/* Type radio group */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(LISTING_TYPES).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
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

        {/* Title */}
        <div className="mb-4">
          <label className="block font-body text-xs font-medium text-foreground mb-1.5">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sunny room near the park"
            maxLength={120}
            required
            className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-body text-xs font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell potential roommates about the space, the vibe, your ideal housemate..."
            rows={4}
            maxLength={2000}
            className="w-full font-body text-sm bg-white/50 border border-border rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
        </div>
      </section>

      {/* Section 2: Details */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
          Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Monthly rent */}
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Monthly Rent ({city.currency})
            </label>
            <input
              type="number"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="1500"
              min={0}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Bedrooms
            </label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="2"
              min={0}
              max={10}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Move-in date */}
          <div>
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

          {/* Move-out date */}
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Move-out Date
            </label>
            <input
              type="date"
              value={moveOutDate}
              onChange={(e) => setMoveOutDate(e.target.value)}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Bathrooms
            </label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="1"
              min={0}
              max={10}
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Neighborhood
            </label>
            {city.neighborhoods.length > 0 ? (
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="">Select neighborhood</option>
                {city.neighborhoods.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Neighborhood"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            )}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block font-body text-xs font-medium text-foreground mb-2">
            Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`font-body text-xs px-3.5 py-2 rounded-full border transition-all ${
                  amenities.includes(a)
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

      {/* Section 3: Photos */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
          Photos
        </h2>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Up to 6 photos. They will be compressed automatically.
        </p>

        {/* Drop zone */}
        {photos.length < 6 && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                {dragOver ? (
                  <Upload className="w-6 h-6 text-primary" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <p className="font-body text-sm text-foreground font-medium">
                {dragOver ? 'Drop photos here' : 'Drag photos here or click to browse'}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                JPG, PNG, WebP up to 10MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Thumbnails */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted"
              >
                <img
                  src={photo.preview}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                />
                {photo.uploading && (
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-foreground/60 text-white flex items-center justify-center hover:bg-foreground/80 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Contact */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
          Contact Info
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={posterFirstName}
              onChange={(e) => setPosterFirstName(e.target.value)}
              placeholder="Your first name"
              required
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block font-body text-xs font-medium text-foreground mb-1.5">
              Social (optional)
            </label>
            <input
              type="text"
              value={contactSocial}
              onChange={(e) => setContactSocial(e.target.value)}
              placeholder="@handle or profile URL"
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
        className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-8 py-3.5 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Publishing...
          </span>
        ) : (
          <>
            Publish Listing
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}
