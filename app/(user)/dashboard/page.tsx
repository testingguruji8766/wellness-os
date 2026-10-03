import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Calendar, BookOpen, Tag, ClipboardList, ArrowRight, Sparkles } from 'lucide-react'
import type { Batch, Workshop, Offer, Registration } from '@/types'

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const [{ data: batches }, { data: workshops }, { data: offers }, { data: registrations }] =
    await Promise.all([
      supabase
        .from('batches')
        .select('id,name,category,instructor,schedule,price,capacity,enrolled_count')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('workshops')
        .select('id,title,category,date,venue,instructor,price')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('offers')
        .select('id,name,description,discount_type,discount_value,end_date')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('registrations')
        .select('id,registration_date,status,batch_id,workshop_id,batch:batches(id,name),workshop:workshops(id,title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

  return {
    batches: (batches ?? []) as Batch[],
    workshops: (workshops ?? []) as Workshop[],
    offers: (offers ?? []) as Offer[],
    registrations: (registrations ?? []) as unknown as Registration[],
  }
}

export default async function DashboardPage() {
  const profile = await requireUser()
  const { batches, workshops, offers, registrations } = await getDashboardData(profile.id)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Good day, {profile.full_name?.split(' ')[0] ?? 'there'} 👋</h1>
        <p className="text-neutral-500 mt-1">Here&apos;s what&apos;s available for you today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available Batches', value: batches.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', href: '/batches' },
          { label: 'Upcoming Workshops', value: workshops.length, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', href: '/workshops' },
          { label: 'Active Offers', value: offers.length, icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50', href: '/offers' },
          { label: 'My Registrations', value: registrations.length, icon: ClipboardList, color: 'text-primary-600', bg: 'bg-primary-50', href: '/registrations' },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-500 mt-1 group-hover:text-primary-600 transition-colors">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Batches */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Available Batches</h2>
            <Link href="/batches" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {batches.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No batches available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map((b) => (
                <Link key={b.id} href={`/batches/${b.id}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{b.name}</p>
                    {b.instructor && <p className="text-xs text-neutral-500 mt-0.5">By {b.instructor}</p>}
                    {b.schedule && <p className="text-xs text-neutral-400">{b.schedule}</p>}
                  </div>
                  <span className="text-sm font-semibold text-primary-600 flex-shrink-0">{formatCurrency(b.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Workshops */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming Workshops</h2>
            <Link href="/workshops" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {workshops.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No workshops scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workshops.map((w) => (
                <Link key={w.id} href={`/workshops/${w.id}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm truncate">{w.title}</p>
                    {w.date && <p className="text-xs text-neutral-500 mt-0.5">📅 {formatDate(w.date)}</p>}
                    {w.venue && <p className="text-xs text-neutral-400">📍 {w.venue}</p>}
                  </div>
                  <span className="text-sm font-semibold text-primary-600 flex-shrink-0">{formatCurrency(w.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Active Offers */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Active Offers</h2>
            <Link href="/offers" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {offers.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <Tag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active offers right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="flex items-start gap-4 p-4 rounded-xl border border-neutral-100 bg-primary-50/30">
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">{o.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {o.discount_type === 'percentage' ? `${o.discount_value}% off` : `₹${o.discount_value} off`}
                    </p>
                    {o.end_date && <p className="text-xs text-neutral-400">Until {formatDate(o.end_date)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Registrations */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">My Registrations</h2>
            <Link href="/registrations" className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {registrations.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">You have no registrations yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((r) => {
                const name = r.batch?.name ?? r.workshop?.title ?? 'Unknown'
                const type = r.batch_id ? 'Batch' : 'Workshop'
                const statusColor = r.status === 'confirmed' ? 'badge-green' : r.status === 'pending' ? 'badge-yellow' : 'badge-red'
                return (
                  <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">{name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{type} · {formatDate(r.registration_date)}</p>
                    </div>
                    <span className={`badge ${statusColor} capitalize`}>{r.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
