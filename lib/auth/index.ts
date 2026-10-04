import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const fallbackProfile: Profile = {
      id: user.id,
      email: user.email || '',
      full_name: (user.user_metadata?.full_name as string) || (user.email ? user.email.split('@')[0] : 'User'),
      phone: null,
      date_of_birth: null,
      bio: null,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      await supabase.from('profiles').upsert(fallbackProfile)
    } catch {
      // Continue with fallback in memory
    }

    return fallbackProfile
  }

  return profile
}

export async function requireUser(): Promise<Profile> {
  const profile = await getUser()
  if (!profile) {
    redirect('/login')
  }
  return profile
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser()
  if (profile.role !== 'admin') redirect('/dashboard')
  return profile
}
