import WorkshopForm from '@/components/admin/WorkshopForm'
import { requireAdmin } from '@/lib/auth'

export default async function NewWorkshopPage() {
  await requireAdmin()
  return <WorkshopForm mode="create" />
}
