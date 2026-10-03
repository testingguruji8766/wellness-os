import { requireUser } from '@/lib/auth'
import UserSidebar from '@/components/user/UserSidebar'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser()

  return (
    <div className="min-h-screen bg-neutral-50">
      <UserSidebar profile={profile} />
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
