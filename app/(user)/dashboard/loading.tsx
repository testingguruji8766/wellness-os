import { redirect } from 'next/navigation'

// Redirect /dashboard → /(user)/dashboard
export default function DashboardRedirect() {
  redirect('/dashboard')
}
