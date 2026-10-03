'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

type FormMode = 'create' | 'edit'

interface WorkshopFormProps {
  mode: FormMode
  initialData?: {
    id: string
    title: string
    category: string
    description: string | null
    date: string | null
    start_time: string | null
    end_time: string | null
    venue: string | null
    instructor: string | null
    capacity: number
    price: number
    status: string
    is_published: boolean
  }
}

export default function WorkshopForm({ mode, initialData }: WorkshopFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: initialData?.title ?? '',
    category: initialData?.category ?? '',
    description: initialData?.description ?? '',
    date: initialData?.date ?? '',
    start_time: initialData?.start_time ?? '',
    end_time: initialData?.end_time ?? '',
    venue: initialData?.venue ?? '',
    instructor: initialData?.instructor ?? '',
    capacity: initialData?.capacity ?? 20,
    price: initialData?.price ?? 0,
    status: initialData?.status ?? 'upcoming',
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
      title: form.title, category: form.category, description: form.description || null,
      date: form.date || null, start_time: form.start_time || null, end_time: form.end_time || null,
      venue: form.venue || null, instructor: form.instructor || null,
      capacity: Number(form.capacity), price: Number(form.price),
      status: form.status, is_published: form.is_published,
    }
    let err = null
    if (mode === 'create') {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await supabase.from('workshops').insert({ ...payload, created_by: user!.id })
      err = res.error
    } else {
      const res = await supabase.from('workshops').update(payload).eq('id', initialData!.id)
      err = res.error
    }
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/workshops')
    router.refresh()
  }

  return (
    <div>
      <Link href="/admin/workshops" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Workshops
      </Link>
      <div className="card p-8 max-w-3xl">
        <h1 className="page-title mb-6">{mode === 'create' ? 'Create Workshop' : 'Edit Workshop'}</h1>
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="label">Title *</label><input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Workshop title" required /></div>
            <div><label className="label">Category *</label><input name="category" value={form.category} onChange={handleChange} className="input" placeholder="e.g. Yoga, Occult" required /></div>
            <div><label className="label">Date</label><input name="date" type="date" value={form.date} onChange={handleChange} className="input" /></div>
            <div><label className="label">Venue</label><input name="venue" value={form.venue} onChange={handleChange} className="input" placeholder="Location or Online" /></div>
            <div><label className="label">Instructor</label><input name="instructor" value={form.instructor} onChange={handleChange} className="input" placeholder="Instructor name" /></div>
            <div><label className="label">Start Time</label><input name="start_time" type="time" value={form.start_time} onChange={handleChange} className="input" /></div>
            <div><label className="label">End Time</label><input name="end_time" type="time" value={form.end_time} onChange={handleChange} className="input" /></div>
            <div><label className="label">Capacity *</label><input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} className="input" required /></div>
            <div><label className="label">Price (₹) *</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="input" required /></div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="input min-h-[100px] resize-y" rows={4} placeholder="Describe this workshop..." /></div>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
            <input id="wp_published" name="is_published" type="checkbox" checked={form.is_published} onChange={handleChange} className="w-4 h-4 rounded accent-primary-600" />
            <div>
              <label htmlFor="wp_published" className="text-sm font-medium text-neutral-900 cursor-pointer">Publish this workshop</label>
              <p className="text-xs text-neutral-500">Published workshops are visible to all users.</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : mode === 'create' ? 'Create Workshop' : 'Save Changes'}
            </button>
            <Link href="/admin/workshops" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
