import { createClient } from '@/lib/supabase-server'
import type { City } from '@/lib/types'
import {
  Shield,
  Plus,
  ToggleLeft,
  ToggleRight,
  Globe,
  MapPin,
} from 'lucide-react'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

async function addCity(formData: FormData) {
  'use server'
  const slug = (formData.get('slug') as string).trim().toLowerCase()
  const name = (formData.get('name') as string).trim()
  const country = (formData.get('country') as string).trim()
  const currency = (formData.get('currency') as string).trim() || 'USD'
  const neighborhoodsRaw = (formData.get('neighborhoods') as string).trim()
  const neighborhoods = neighborhoodsRaw
    ? neighborhoodsRaw.split(',').map((n) => n.trim()).filter(Boolean)
    : []

  if (!slug || !name || !country) return

  const supabase = await (await import('@/lib/supabase-server')).createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) return

  await supabase.from('cities').insert({
    slug,
    name,
    country,
    currency,
    neighborhoods,
    is_active: true,
    listing_count: 0,
  })

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/cities')
}

async function toggleCity(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'

  const supabase = await (await import('@/lib/supabase-server')).createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) return

  await supabase.from('cities').update({ is_active: active }).eq('id', id)

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/cities')
}

export const metadata = {
  title: 'Admin - Cities - Homeys World',
}

export default async function AdminCitiesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user ||
    !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')
  ) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-foreground mb-2">
            403 Forbidden
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true })

  const allCities = (cities ?? []) as City[]

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Manage Cities
            </h1>
            <p className="font-body text-xs text-muted-foreground">
              Admin panel
            </p>
          </div>
        </div>

        {/* Add city form */}
        <form
          action={addCity}
          className="bg-white border border-border rounded-2xl p-6 mb-8 shadow-sm"
        >
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add City
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Slug
              </label>
              <input
                name="slug"
                required
                placeholder="new-york"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Name
              </label>
              <input
                name="name"
                required
                placeholder="New York"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Country
              </label>
              <input
                name="country"
                required
                placeholder="United States"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Currency
              </label>
              <input
                name="currency"
                placeholder="USD"
                defaultValue="USD"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-body text-xs font-medium text-foreground mb-1.5">
                Neighborhoods (comma-separated)
              </label>
              <input
                name="neighborhoods"
                placeholder="Manhattan, Brooklyn, Queens, Bronx"
                className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add City
          </button>
        </form>

        {/* Cities list */}
        <div className="space-y-3">
          {allCities.map((city) => (
            <div
              key={city.id}
              className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {city.name}
                  </h3>
                  <span
                    className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                      city.is_active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {city.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-body text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {city.country}
                  </span>
                  <span>/{city.slug}</span>
                  <span>{city.currency}</span>
                  <span>{city.listing_count} listings</span>
                </div>
                {city.neighborhoods.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {city.neighborhoods.map((n) => (
                      <span
                        key={n}
                        className="inline-flex items-center gap-1 text-xs font-body bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <form action={toggleCity} className="shrink-0">
                <input type="hidden" name="id" value={city.id} />
                <input
                  type="hidden"
                  name="active"
                  value={city.is_active ? 'false' : 'true'}
                />
                <button
                  type="submit"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={city.is_active ? 'Deactivate' : 'Activate'}
                >
                  {city.is_active ? (
                    <ToggleRight className="w-8 h-8 text-primary" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </form>
            </div>
          ))}

          {allCities.length === 0 && (
            <div className="text-center py-12">
              <p className="font-body text-sm text-muted-foreground">
                No cities yet. Add one above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
