import BatchForm from '@/components/admin/BatchForm'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditBatchPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase.from('batches').select('*').eq('id', params.id).single()
  if (!data) notFound()

  return <BatchForm mode="edit" initialData={data} />
}
