import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import RegisterButton from '@/components/user/RegisterButton'
import { ArrowLeft, Calendar, Clock, Users, User, DollarSign, Tag } from 'lucide-react'
import Link from 'next/link'
import type { Batch } from '@/types'

interface Props {
  params: Promise<{ id: string }> | { id: string }
}

export default async function BatchDetailPage({ params }: Props) {
  const { id } = await Promise.resolve(params)
  const profile = await requireUser()
  const supabase = await createClient()

  const { data: batch } = await supabase
    .from('batches')
    .select('*')
    .eq('id', id)
    .single()

  if (!batch) notFound()

  const b = batch as Batch

  if (!b.is_published) {
    return (
      <div className="card p-16 text-center text-neutral-400">
        <p className="text-lg font-semibold">This batch is unpublished and currently unavailable.</p>
      </div>
    )
  }

  // Check if user already registered
  const { data: existing } = await supabase
    .from('registrations')
    .select('id,status')
    .eq('user_id', profile.id)
    .eq('batch_id', b.id)
    .maybeSingle()

  const isFull = b.enrolled_count >= b.capacity
  const alreadyRegistered = !!existing

  return (
    <div className="animate-fade-in">
      <Link href="/batches" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Batches
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-8">
          <span className="badge badge-blue mb-4">{b.category}</span>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{b.name}</h1>
          {b.instructor && <p className="text-neutral-500 text-sm mb-6">By <span className="font-medium text-neutral-700">{b.instructor}</span></p>}

          {b.description && (
            <div className="mb-8">
              <h2 className="section-title mb-3">About this Batch</h2>
              <p className="text-neutral-600 leading-relaxed">{b.description}</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {b.schedule && (
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <Calendar size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">Schedule</p>
                  <p className="text-sm font-medium">{b.schedule}</p>
                </div>
              </div>
            )}
            {b.start_time && (
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
                <Clock size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">Timings</p>
                  <p className="text-sm font-medium">{b.start_time}{b.end_time ? ` – ${b.end_time}` : ''}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
              <Users size={18} className="text-primary-600" />
              <div>
                <p className="text-xs text-neutral-500">Capacity</p>
                <p className="text-sm font-medium">{b.enrolled_count} / {b.capacity} enrolled</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
              <Tag size={18} className="text-primary-600" />
              <div>
                <p className="text-xs text-neutral-500">Status</p>
                <p className="text-sm font-medium capitalize">{b.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6">
            <p className="text-3xl font-bold text-primary-600 mb-1">{formatCurrency(b.price)}</p>
            <p className="text-sm text-neutral-500 mb-6">per person</p>

            {alreadyRegistered ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium">
                ✓ Already registered (Status: {existing?.status})
              </div>
            ) : isFull ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-medium">
                This batch is full.
              </div>
            ) : (
              <RegisterButton type="batch" itemId={b.id} userId={profile.id} />
            )}

            <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-500 space-y-1">
              <p>🟢 {b.capacity - b.enrolled_count} spots remaining</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
