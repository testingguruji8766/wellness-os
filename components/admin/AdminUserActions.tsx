'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, UserX, Loader2 } from 'lucide-react'
import type { UserRole } from '@/types'

interface Props { userId: string; isActive: boolean; role: UserRole }

export default function AdminUserActions({ userId, isActive, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Don't allow deactivating admins
  if (role === 'admin') {
    return <span className="text-xs text-neutral-400">Admin</span>
  }

  async function toggleActive() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_active: !isActive }).eq('id', userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 size={14} className="animate-spin text-neutral-400" />}
      <button
        onClick={toggleActive}
        title={isActive ? 'Deactivate user' : 'Activate user'}
        className={`p-1.5 rounded-lg transition-colors ${isActive
          ? 'hover:bg-red-50 text-neutral-400 hover:text-red-600'
          : 'hover:bg-green-50 text-neutral-400 hover:text-green-600'}`}
      >
        {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
      </button>
    </div>
  )
}
