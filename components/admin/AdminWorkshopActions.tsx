'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'

interface Props { workshopId: string; isPublished: boolean }

export default function AdminWorkshopActions({ workshopId, isPublished }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function togglePublish() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('workshops').update({ is_published: !isPublished }).eq('id', workshopId)
    router.refresh()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this workshop? This cannot be undone.')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('workshops').delete().eq('id', workshopId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 size={14} className="animate-spin text-neutral-400" />}
      <Link href={`/admin/workshops/${workshopId}/edit`} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-primary-600 transition-colors"><Edit size={15} /></Link>
      <button onClick={togglePublish} className={`p-1.5 rounded-lg hover:bg-neutral-100 transition-colors ${isPublished ? 'text-orange-500' : 'text-green-600'}`}>
        {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
    </div>
  )
}
