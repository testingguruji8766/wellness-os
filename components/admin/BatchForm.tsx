'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

type FormMode = 'create' | 'edit'

interface BatchFormProps {
  mode: FormMode
  initialData?: {
    id: string
    name: string
    category: string
    description: string | null
    instructor: string | null
    schedule: string | null
    start_time: string | null
    end_time: string | null
    capacity: number
    price: number
    status: string
    is_published: boolean
  }
}

export default function BatchForm({ mode, initialData }: BatchFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    description: initialData?.description ?? '',
    instructor: initialData?.instructor ?? '',
    schedule: initialData?.schedule ?? '',
    start_time: initialData?.start_time ?? '',
    end_time: initialData?.end_time ?? '',
    capacity: initialData?.capacity ?? 20,
    price: initialData?.price ?? 0,
    status: initialData?.status ?? 'active',
    is_published: initialData?.is_published ?? false,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || null,
      instructor: form.instructor || null,
      schedule: form.schedule || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      capacity: Number(form.capacity),
      price: Number(form.price),
      status: form.status,
      is_published: form.is_published,
    }

    let err = null
    if (mode === 'create') {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await supabase.from('batches').insert({ ...payload, created_by: user!.id })
      err = res.error
    } else {
      const res = await supabase.from('batches').update(payload).eq('id', initialData!.id)
      err = res.error
    }

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/admin/batches')
    router.refresh()
  }

  return (
    <div>
      <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Batches
      </Link>

      <div className="card p-8 max-w-3xl">
        <h1 className="page-title mb-6">{mode === 'create' ? 'Create Batch' : 'Edit Batch'}</h1>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Batch Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Morning Yoga Flow" required />
            </div>
            <div>
              <label className="label">Category *</label>
              <input name="category" value={form.category} onChange={handleChange} className="input" placeholder="e.g. Yoga, Meditation" required />
            </div>
            <div>
              <label className="label">Instructor</label>
              <input name="instructor" value={form.instructor} onChange={handleChange} className="input" placeholder="Instructor name" />
            </div>
            <div>
              <label className="label">Schedule</label>
              <input name="schedule" value={form.schedule} onChange={handleChange} className="input" placeholder="e.g. Mon, Wed, Fri" />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input name="start_time" type="time" value={form.start_time} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">End Time</label>
              <input name="end_time" type="time" value={form.end_time} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Capacity *</label>
              <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Price (₹) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input min-h-[100px] resize-y" placeholder="Describe this batch..." rows={4} />
          </div>

          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
            <input
              id="is_published"
              name="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-primary-600"
            />
            <div>
              <label htmlFor="is_published" className="text-sm font-medium text-neutral-900 cursor-pointer">Publish this batch</label>
              <p className="text-xs text-neutral-500">Published batches are visible to all users.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : mode === 'create' ? 'Create Batch' : 'Save Changes'}
            </button>
            <Link href="/admin/batches" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
