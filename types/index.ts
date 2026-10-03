export type UserRole = 'admin' | 'user'

export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled'

export type DiscountType = 'percentage' | 'fixed'

export type BatchStatus = 'active' | 'inactive' | 'completed'

export type WorkshopStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export type OfferStatus = 'active' | 'inactive' | 'expired'

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  date_of_birth: string | null
  bio: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Batch {
  id: string
  name: string
  category: string
  description: string | null
  instructor: string | null
  schedule: string | null
  start_time: string | null
  end_time: string | null
  capacity: number
  enrolled_count: number
  price: number
  status: BatchStatus
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  title: string
  category: string
  description: string | null
  date: string | null
  start_time: string | null
  end_time: string | null
  venue: string | null
  instructor: string | null
  capacity: number
  enrolled_count: number
  price: number
  status: WorkshopStatus
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Offer {
  id: string
  name: string
  description: string | null
  discount_type: DiscountType
  discount_value: number
  start_date: string | null
  end_date: string | null
  applicable_batch_id: string | null
  applicable_workshop_id: string | null
  status: OfferStatus
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  // Joined
  batch?: Pick<Batch, 'id' | 'name'>
  workshop?: Pick<Workshop, 'id' | 'title'>
}

export interface Registration {
  id: string
  user_id: string
  batch_id: string | null
  workshop_id: string | null
  registration_date: string
  status: RegistrationStatus
  notes: string | null
  created_at: string
  updated_at: string
  // Joined
  profile?: Pick<Profile, 'id' | 'full_name' | 'email'>
  batch?: Pick<Batch, 'id' | 'name'>
  workshop?: Pick<Workshop, 'id' | 'title'>
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalBatches: number
  publishedWorkshops: number
  activeOffers: number
  totalRegistrations: number
}
