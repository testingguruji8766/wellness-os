'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'
import { Loader2, CheckCircle } from 'lucide-react'

interface Props {
  profile: Profile
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    bio: profile.bio ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        bio: formData.bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle size={16} />
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="full_name" className="label">Full Name</label>
          <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} className="input" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" value={profile.email} className="input bg-neutral-50 cursor-not-allowed" disabled readOnly />
          <p className="text-xs text-neutral-400 mt-1">Email is managed through your account settings.</p>
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="input" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label htmlFor="date_of_birth" className="label">Date of Birth</label>
          <input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="label">About You</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="input min-h-[100px] resize-y"
          placeholder="Tell us a bit about yourself..."
          rows={4}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Save Profile'}
      </button>
    </form>
  )
}
