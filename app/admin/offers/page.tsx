import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatDate, formatDiscount } from '@/lib/utils'
import Link from 'next/link'
import AdminOfferActions from '@/components/admin/AdminOfferActions'
import { Plus, Tag } from 'lucide-react'
import type { Offer } from '@/types'

export default async function AdminOffersPage() {
  await requireAdmin()
  const supabase = await createClient()
  const { data: offers } = await supabase
    .from('offers')
    .select('*, batch:batches(id,name), workshop:workshops(id,title)')
    .order('created_at', { ascending: false })
  const list = (offers ?? []) as Offer[]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Offers</h1>
          <p className="text-neutral-500 mt-1">Manage discounts and special offers.</p>
        </div>
        <Link href="/admin/offers/new" className="btn-primary"><Plus size={16} /> New Offer</Link>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No offers yet.</h2>
          <Link href="/admin/offers/new" className="btn-primary inline-flex mt-4"><Plus size={16} /> Create Offer</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Discount</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Applicable To</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Validity</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Published</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">{o.name}</td>
                    <td className="px-6 py-4 text-primary-600 font-semibold">{formatDiscount(o.discount_type, o.discount_value)}</td>
                    <td className="px-6 py-4 text-neutral-500">{o.batch?.name ?? o.workshop?.title ?? 'All'}</td>
                    <td className="px-6 py-4 text-neutral-500 text-xs">
                      {o.start_date ? formatDate(o.start_date) : '—'} → {o.end_date ? formatDate(o.end_date) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${o.is_published ? 'badge-green' : 'badge-gray'}`}>{o.is_published ? 'Published' : 'Draft'}</span>
                    </td>
                    <td className="px-6 py-4"><AdminOfferActions offerId={o.id} isPublished={o.is_published} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
