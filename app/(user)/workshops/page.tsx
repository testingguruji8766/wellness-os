import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import type { Workshop } from '@/types'

export default async function WorkshopsPage() {
  await requireUser()
  const supabase = await createClient()

  const { data: workshops } = await supabase
    .from('workshops')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: true })

  const list = (workshops ?? []) as Workshop[]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Workshops</h1>
        <p className="text-neutral-500 mt-1">Explore workshops and register for upcoming events.</p>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No workshops have been published yet.</h2>
          <p className="text-sm">New workshops will appear here once published.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((w) => (
            <Link key={w.id} href={`/workshops/${w.id}`} className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <span className="badge badge-blue">{w.category}</span>
                <span className={`badge ${w.enrolled_count >= w.capacity ? 'badge-red' : 'badge-green'}`}>
                  {w.enrolled_count >= w.capacity ? 'Full' : `${w.capacity - w.enrolled_count} spots`}
                </span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">{w.title}</h3>
              {w.instructor && <p className="text-xs text-neutral-500 mb-1">By {w.instructor}</p>}
              {w.date && <p className="text-xs text-neutral-500 mb-1">📅 {formatDate(w.date)}</p>}
              {w.venue && <p className="text-xs text-neutral-400 mb-2">📍 {w.venue}</p>}
              {w.description && <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{w.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                <span className="text-lg font-bold text-primary-600">{formatCurrency(w.price)}</span>
                <span className="btn-primary text-xs py-1.5 px-3">
                  Register Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
