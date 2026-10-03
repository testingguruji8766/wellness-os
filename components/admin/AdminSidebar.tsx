'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials } from '@/lib/utils'
import type { Profile } from '@/types'
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Tag,
  ClipboardList,
  LogOut,
  Leaf,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

interface AdminSidebarProps {
  profile: Profile
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/batches', label: 'Batches', icon: Calendar },
  { href: '/admin/workshops', label: 'Workshops', icon: BookOpen },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
]

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-800">
        <span className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-white" />
        </span>
        <div>
          <p className="text-sm font-bold text-white">WellnessOS</p>
          <p className="text-xs text-neutral-400">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
              )}
            >
              <Icon size={17} className={active ? 'text-primary-400' : 'text-neutral-500'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center text-primary-300 text-xs font-bold flex-shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-neutral-200 truncate">{profile.full_name || 'Admin'}</p>
            <div className="flex items-center gap-1">
              <ShieldCheck size={10} className="text-primary-400" />
              <p className="text-xs text-neutral-500">Administrator</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-neutral-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-neutral-900 fixed top-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-neutral-900 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </span>
          <span className="text-sm font-bold text-white">WellnessOS Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-neutral-900 h-full shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
