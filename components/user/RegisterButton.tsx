'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

interface Props {
  type: 'batch' | 'workshop'
  itemId: string
  userId: string
}

export default function RegisterButton({ type, itemId, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const payload: {
      user_id: string
      status: string
      batch_id?: string
      workshop_id?: string
    } = {
      user_id: userId,
      status: 'confirmed',
    }
    if (type === 'batch') payload.batch_id = itemId
    else payload.workshop_id = itemId

    const { error: insertError } = await supabase.from('registrations').insert(payload as any)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You are already registered for this item.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
        <CheckCircle size={16} />
        Registration successful!
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleRegister}
        disabled={loading}
        className="btn-primary w-full justify-center py-3"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Registering…</>
        ) : (
          `Register for this ${type}`
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
