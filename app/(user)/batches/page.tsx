import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Calendar, ChevronRight } from 'lucide-react'
import type { Batch } from '@/types'

export default async function BatchesPage() {
  await requireUser()
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from('batches')
    .select('*')
    .eq('is_published', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const list = (batches ?? []) as Batch[]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Batches</h1>
        <p className="text-neutral-500 mt-1">Browse available batches and register for your preferred sessions.</p>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No batches available yet.</h2>
          <p className="text-sm">Check back soon for new sessions.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((b) => (
            <Link key={b.id} href={`/batches/${b.id}`} className="card p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <span className="badge badge-blue">{b.category}</span>
                <span className={`badge ${b.enrolled_count >= b.capacity ? 'badge-red' : 'badge-green'}`}>
                  {b.enrolled_count >= b.capacity ? 'Full' : `${b.capacity - b.enrolled_count} spots`}
                </span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">{b.name}</h3>
              {b.instructor && <p className="text-xs text-neutral-500 mb-1">By {b.instructor}</p>}
              {b.schedule && <p className="text-xs text-neutral-400 mb-2">{b.schedule}</p>}
              {b.description && <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{b.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                <span className="text-lg font-bold text-primary-600">{formatCurrency(b.price)}</span>
                <span className="btn-primary text-xs py-1.5 px-3">
                  Enroll Now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
