import { requireUser } from '@/lib/auth'
import { getInitials, formatDate } from '@/lib/utils'
import ProfileForm from '@/components/user/ProfileForm'
import { User } from 'lucide-react'

export default async function ProfilePage() {
  const profile = await requireUser()

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">My Profile</h1>
        <p className="text-neutral-500 mt-1">Manage your personal information.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Avatar card */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-700 text-2xl font-bold">
            {getInitials(profile.full_name)}
          </div>
          <h2 className="font-semibold text-neutral-900">{profile.full_name || 'User'}</h2>
          <p className="text-sm text-neutral-500 mt-1">{profile.email}</p>
          <span className={`badge mt-3 ${profile.role === 'admin' ? 'badge-blue' : 'badge-green'} capitalize`}>
            {profile.role}
          </span>
          {profile.date_of_birth && (
            <p className="text-xs text-neutral-400 mt-4">DOB: {formatDate(profile.date_of_birth)}</p>
          )}
          <p className="text-xs text-neutral-400 mt-1">Member since {formatDate(profile.created_at)}</p>
        </div>

        {/* Form */}
        <div className="lg:col-span-3 card p-8">
          <h2 className="section-title mb-6">Edit Information</h2>
          <ProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
