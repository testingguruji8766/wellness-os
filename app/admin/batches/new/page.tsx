import BatchForm from '@/components/admin/BatchForm'
import { requireAdmin } from '@/lib/auth'

export default async function NewBatchPage() {
  await requireAdmin()
  return <BatchForm mode="create" />
}
