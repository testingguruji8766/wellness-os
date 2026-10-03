import { requireAdmin } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin()

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminSidebar profile={profile} />
      <main className="lg:pl-60">
        <div className="pt-14 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
