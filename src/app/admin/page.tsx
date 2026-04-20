'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Settings, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Plus,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react'
import { insforge } from '@/lib/insforge'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    cities: 0,
    listings: 0,
    profiles: 0,
    pendingReports: 0
  })

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await insforge.auth.getCurrentUser()
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
      
      if (!data?.user || !adminEmails.includes(data.user.email || '')) {
        router.push('/')
        return
      }
      
      setIsAdmin(true)
      
      // Fetch some stats
      const [cities, listings, profiles, reports] = await Promise.all([
        insforge.database.from('cities').select('id', { count: 'exact', head: true }),
        insforge.database.from('listings').select('id', { count: 'exact', head: true }),
        insforge.database.from('profiles').select('id', { count: 'exact', head: true }),
        insforge.database.from('listing_reports').select('id', { count: 'exact', head: true })
      ])
      
      setStats({
        cities: cities.count || 0,
        listings: listings.count || 0,
        profiles: profiles.count || 0,
        pendingReports: reports.count || 0
      })
      
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  if (loading) return null

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground text-foreground">Control center for Homeys World</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Cities', value: stats.cities, icon: MapPin, color: 'text-blue-600' },
            { label: 'Active Listings', value: stats.listings, icon: TrendingUp, color: 'text-green-600' },
            { label: 'User Profiles', value: stats.profiles, icon: Users, color: 'text-purple-600' },
            { label: 'Pending Reports', value: stats.pendingReports, icon: AlertTriangle, color: 'text-red-600' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white/60 border border-border p-6 rounded-[2rem] shadow-sm">
              <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="font-heading text-2xl font-bold">{stat.value}</p>
              <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white/60 border border-border rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                City Management
              </h2>
              <Link href="/admin/cities" className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4" />
              </Link>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-6">Add new cities, manage neighborhoods, and toggle visibility.</p>
            <Link href="/admin/cities" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:gap-3 transition-all">
              Manage Cities <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          <section className="bg-white/60 border border-border rounded-[2.5rem] p-8 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                Moderation
              </h2>
              <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded-full text-muted-foreground uppercase tracking-wider">Coming Soon</span>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-6">Review flagged listings and user reports to keep the community safe.</p>
            <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-muted-foreground">
              Review Queue <ArrowRight className="w-4 h-4" />
            </span>
          </section>
        </div>
      </div>
    </div>
  )
}
