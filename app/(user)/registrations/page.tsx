import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { ClipboardList } from 'lucide-react'
import type { Registration } from '@/types'

export default async function RegistrationsPage() {
  const profile = await requireUser()
  const supabase = await createClient()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, batch:batches(id,name), workshop:workshops(id,title)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const list = (registrations ?? []) as Registration[]

  const statusBadge = (s: string) => {
    if (s === 'confirmed') return 'badge-green'
    if (s === 'pending') return 'badge-yellow'
    return 'badge-red'
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">My Registrations</h1>
        <p className="text-neutral-500 mt-1">Track all your batch and workshop registrations.</p>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-semibold mb-2">You have no registrations yet.</h2>
          <p className="text-sm">Browse batches and workshops to register.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Item</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Type</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Registration Date</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.map((r) => {
                  const name = r.batch?.name ?? r.workshop?.title ?? '—'
                  const type = r.batch_id ? 'Batch' : 'Workshop'
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900">{name}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${type === 'Batch' ? 'badge-blue' : 'badge-gray'}`}>{type}</span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{formatDate(r.registration_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusBadge(r.status)} capitalize`}>{r.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
