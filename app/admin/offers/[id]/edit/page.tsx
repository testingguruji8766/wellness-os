import OfferForm from '@/components/admin/OfferForm'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> | { id: string } }

export default async function EditOfferPage({ params }: Props) {
  const { id } = await Promise.resolve(params)
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase.from('offers').select('*').eq('id', id).single()
  if (!data) notFound()
  return <OfferForm mode="edit" initialData={data} />
}
