import WorkshopForm from '@/components/admin/WorkshopForm'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditWorkshopPage({ params }: Props) {
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase.from('workshops').select('*').eq('id', params.id).single()
  if (!data) notFound()
  return <WorkshopForm mode="edit" initialData={data} />
}
