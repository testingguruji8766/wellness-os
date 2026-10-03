import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import AdminBatchActions from '@/components/admin/AdminBatchActions'
import { Plus, Calendar } from 'lucide-react'
import type { Batch } from '@/types'

export default async function AdminBatchesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false })

  const list = (batches ?? []) as Batch[]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Batches</h1>
          <p className="text-neutral-500 mt-1">Manage all batches in the system.</p>
        </div>
        <Link href="/admin/batches/new" className="btn-primary">
          <Plus size={16} /> New Batch
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">No batches yet.</h2>
          <p className="text-sm mb-6">Create your first batch to get started.</p>
          <Link href="/admin/batches/new" className="btn-primary inline-flex">
            <Plus size={16} /> Create Batch
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Category</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Instructor</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Capacity</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Price</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Published</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{b.name}</td>
                    <td className="px-6 py-4"><span className="badge badge-blue">{b.category}</span></td>
                    <td className="px-6 py-4 text-neutral-500">{b.instructor || '—'}</td>
                    <td className="px-6 py-4 text-neutral-500">{b.enrolled_count}/{b.capacity}</td>
                    <td className="px-6 py-4 text-neutral-700 font-medium">{formatCurrency(b.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge capitalize ${b.status === 'active' ? 'badge-green' : b.status === 'completed' ? 'badge-gray' : 'badge-yellow'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${b.is_published ? 'badge-green' : 'badge-gray'}`}>
                        {b.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <AdminBatchActions batchId={b.id} isPublished={b.is_published} />
                    </td>
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
