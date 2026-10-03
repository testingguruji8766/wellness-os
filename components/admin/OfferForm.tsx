'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

type FormMode = 'create' | 'edit'

interface OfferFormProps {
  mode: FormMode
  initialData?: {
    id: string; name: string; description: string | null
    discount_type: string; discount_value: number
    start_date: string | null; end_date: string | null
    applicable_batch_id: string | null; applicable_workshop_id: string | null
    status: string; is_published: boolean
  }
}

export default function OfferForm({ mode, initialData }: OfferFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([])
  const [workshops, setWorkshops] = useState<{ id: string; title: string }[]>([])
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    discount_type: initialData?.discount_type ?? 'percentage',
    discount_value: initialData?.discount_value ?? 10,
    start_date: initialData?.start_date?.split('T')[0] ?? '',
    end_date: initialData?.end_date?.split('T')[0] ?? '',
    applicable_batch_id: initialData?.applicable_batch_id ?? '',
    applicable_workshop_id: initialData?.applicable_workshop_id ?? '',
    status: initialData?.status ?? 'active',
    is_published: initialData?.is_published ?? false,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('batches').select('id,name').then(({ data }) => setBatches(data ?? []))
    supabase.from('workshops').select('id,title').then(({ data }) => setWorkshops(data ?? []))
  }, [])

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
      name: form.name, description: form.description || null,
      discount_type: form.discount_type, discount_value: Number(form.discount_value),
      start_date: form.start_date || null, end_date: form.end_date || null,
      applicable_batch_id: form.applicable_batch_id || null,
      applicable_workshop_id: form.applicable_workshop_id || null,
      status: form.status, is_published: form.is_published,
    }
    let err = null
    if (mode === 'create') {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await supabase.from('offers').insert({ ...payload, created_by: user!.id })
      err = res.error
    } else {
      const res = await supabase.from('offers').update(payload).eq('id', initialData!.id)
      err = res.error
    }
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/offers')
    router.refresh()
  }

  return (
    <div>
      <Link href="/admin/offers" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Offers
      </Link>
      <div className="card p-8 max-w-3xl">
        <h1 className="page-title mb-6">{mode === 'create' ? 'Create Offer' : 'Edit Offer'}</h1>
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="label">Offer Name *</label><input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g. Early Bird Discount" required /></div>
            <div>
              <label className="label">Discount Type *</label>
              <select name="discount_type" value={form.discount_type} onChange={handleChange} className="input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="label">Discount Value *</label>
              <input name="discount_value" type="number" min="0" step="0.01" value={form.discount_value} onChange={handleChange} className="input" required />
            </div>
            <div><label className="label">Start Date</label><input name="start_date" type="date" value={form.start_date} onChange={handleChange} className="input" /></div>
            <div><label className="label">End Date</label><input name="end_date" type="date" value={form.end_date} onChange={handleChange} className="input" /></div>
            <div>
              <label className="label">Applicable Batch (optional)</label>
              <select name="applicable_batch_id" value={form.applicable_batch_id} onChange={handleChange} className="input">
                <option value="">All / None</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Applicable Workshop (optional)</label>
              <select name="applicable_workshop_id" value={form.applicable_workshop_id} onChange={handleChange} className="input">
                <option value="">All / None</option>
                {workshops.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea name="description" value={form.description} onChange={handleChange} className="input min-h-[80px] resize-y" rows={3} placeholder="Describe this offer..." /></div>
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
            <input id="offer_published" name="is_published" type="checkbox" checked={form.is_published} onChange={handleChange} className="w-4 h-4 rounded accent-primary-600" />
            <div>
              <label htmlFor="offer_published" className="text-sm font-medium text-neutral-900 cursor-pointer">Publish this offer</label>
              <p className="text-xs text-neutral-500">Published offers appear to all users.</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : mode === 'create' ? 'Create Offer' : 'Save Changes'}
            </button>
            <Link href="/admin/offers" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
