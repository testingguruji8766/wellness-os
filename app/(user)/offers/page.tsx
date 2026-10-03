import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatDate, formatDiscount } from '@/lib/utils'
import { Tag, Sparkles } from 'lucide-react'
import type { Offer } from '@/types'

export default async function OffersPage() {
  await requireUser()
  const supabase = await createClient()

  const { data: offers } = await supabase
    .from('offers')
    .select('*, batch:batches(id,name), workshop:workshops(id,title)')
    .eq('is_published', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('created_at', { ascending: false })

  const list = (offers ?? []) as Offer[]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Offers</h1>
        <p className="text-neutral-500 mt-1">Exclusive deals and discounts for our members.</p>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No active offers available.</h2>
          <p className="text-sm">New offers will appear here when available.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((o) => (
            <div key={o.id} className="card p-6 bg-gradient-to-br from-white to-primary-50/30 border-primary-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} className="text-orange-500" />
                </div>
                <span className="badge badge-green">Active</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">{o.name}</h3>
              {o.description && <p className="text-sm text-neutral-500 mb-4">{o.description}</p>}

              <div className="p-3 bg-primary-50 rounded-xl mb-4">
                <p className="text-xl font-bold text-primary-700">{formatDiscount(o.discount_type, o.discount_value)}</p>
                {o.discount_type === 'percentage'
                  ? <p className="text-xs text-primary-600">{o.discount_value}% discount applied</p>
                  : <p className="text-xs text-primary-600">₹{o.discount_value} off the price</p>}
              </div>

              {(o.batch || o.workshop) && (
                <p className="text-xs text-neutral-500 mb-2">
                  Applicable to: <span className="font-medium text-neutral-700">{o.batch?.name ?? o.workshop?.title}</span>
                </p>
              )}

              {o.start_date && o.end_date && (
                <p className="text-xs text-neutral-400">
                  Valid: {formatDate(o.start_date)} – {formatDate(o.end_date)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
