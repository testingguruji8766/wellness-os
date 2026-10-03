import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import AdminWorkshopActions from '@/components/admin/AdminWorkshopActions'
import { Plus, BookOpen } from 'lucide-react'
import type { Workshop } from '@/types'

export default async function AdminWorkshopsPage() {
  await requireAdmin()
  const supabase = await createClient()
  const { data: workshops } = await supabase.from('workshops').select('*').order('created_at', { ascending: false })
  const list = (workshops ?? []) as Workshop[]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Workshops</h1>
          <p className="text-neutral-500 mt-1">Manage all workshops.</p>
        </div>
        <Link href="/admin/workshops/new" className="btn-primary"><Plus size={16} /> New Workshop</Link>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No workshops yet.</h2>
          <Link href="/admin/workshops/new" className="btn-primary inline-flex mt-4"><Plus size={16} /> Create Workshop</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Title</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Category</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Date</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Venue</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Capacity</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Price</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Published</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.map((w) => (
                  <tr key={w.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{w.title}</td>
                    <td className="px-6 py-4"><span className="badge badge-blue">{w.category}</span></td>
                    <td className="px-6 py-4 text-neutral-500">{w.date ? formatDate(w.date) : '—'}</td>
                    <td className="px-6 py-4 text-neutral-500">{w.venue || '—'}</td>
                    <td className="px-6 py-4 text-neutral-500">{w.enrolled_count}/{w.capacity}</td>
                    <td className="px-6 py-4 text-neutral-700 font-medium">{formatCurrency(w.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${w.is_published ? 'badge-green' : 'badge-gray'}`}>
                        {w.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><AdminWorkshopActions workshopId={w.id} isPublished={w.is_published} /></td>
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
