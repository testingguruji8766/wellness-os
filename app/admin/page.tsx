import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { Users, Calendar, BookOpen, Tag, ClipboardList, TrendingUp } from 'lucide-react'
import type { Registration } from '@/types'

async function getStats() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeUsers },
    { count: totalBatches },
    { count: publishedWorkshops },
    { count: activeOffers },
    { count: totalRegistrations },
    { data: recentRegistrations },
    { data: upcomingWorkshops },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('is_active', true),
    supabase.from('batches').select('*', { count: 'exact', head: true }),
    supabase.from('workshops').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('offers').select('*', { count: 'exact', head: true }).eq('is_published', true).gte('end_date', new Date().toISOString()),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase
      .from('registrations')
      .select('id,registration_date,status,profile:profiles(full_name,email),batch:batches(name),workshop:workshops(title)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('workshops')
      .select('id,title,date,venue,capacity,enrolled_count')
      .eq('is_published', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5),
  ])

  return {
    stats: {
      totalUsers: totalUsers ?? 0,
      activeUsers: activeUsers ?? 0,
      totalBatches: totalBatches ?? 0,
      publishedWorkshops: publishedWorkshops ?? 0,
      activeOffers: activeOffers ?? 0,
      totalRegistrations: totalRegistrations ?? 0,
    },
    recentRegistrations: (recentRegistrations ?? []) as unknown as Registration[],
    upcomingWorkshops: (upcomingWorkshops ?? []) as any[],
  }
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const { stats, recentRegistrations, upcomingWorkshops } = await getStats()

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Batches', value: stats.totalBatches, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Published Workshops', value: stats.publishedWorkshops, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Active Offers', value: stats.activeOffers, icon: Tag, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: ClipboardList, color: 'text-primary-600', bg: 'bg-primary-50' },
  ]

  const statusBadge = (s: string) => {
    if (s === 'confirmed') return 'badge-green'
    if (s === 'pending') return 'badge-yellow'
    return 'badge-red'
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of your wellness platform.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-6">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <section className="card p-6">
          <h2 className="section-title mb-5">Recent Registrations</h2>
          {recentRegistrations.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No registrations yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((r) => {
                const name = (r as any).profile?.full_name ?? 'Unknown User'
                const item = (r as any).batch?.name ?? (r as any).workshop?.title ?? '—'
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 border border-neutral-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
                      <p className="text-xs text-neutral-500 truncate">{item} · {formatDate(r.registration_date)}</p>
                    </div>
                    <span className={`badge ${statusBadge(r.status)} capitalize`}>{r.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Upcoming Workshops */}
        <section className="card p-6">
          <h2 className="section-title mb-5">Upcoming Workshops</h2>
          {upcomingWorkshops.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming workshops.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingWorkshops.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{w.title}</p>
                    <p className="text-xs text-neutral-500">{formatDate(w.date)}{w.venue ? ` · ${w.venue}` : ''}</p>
                  </div>
                  <span className="text-xs text-neutral-400">{w.enrolled_count}/{w.capacity}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
