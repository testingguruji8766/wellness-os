import OfferForm from '@/components/admin/OfferForm'
import { requireAdmin } from '@/lib/auth'

export default async function NewOfferPage() {
  await requireAdmin()
  return <OfferForm mode="create" />
}
