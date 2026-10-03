import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'
import AdminUserActions from '@/components/admin/AdminUserActions'
import type { Profile } from '@/types'

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  const list = (users ?? []) as Profile[]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Users</h1>
        <p className="text-neutral-500 mt-1">Manage all registered users.</p>
      </div>

      {list.length === 0 ? (
        <div className="card p-16 text-center text-neutral-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No users yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Name</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Email</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Phone</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Role</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Status</th>
                  <th className="text-left px-6 py-4 font-semibold text-neutral-600">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {list.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">{u.full_name || '—'}</td>
                    <td className="px-6 py-4 text-neutral-500">{u.email}</td>
                    <td className="px-6 py-4 text-neutral-500">{u.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge capitalize ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      <AdminUserActions userId={u.id} isActive={u.is_active} role={u.role} />
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
