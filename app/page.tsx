import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Leaf, ArrowRight, Sparkles, Users, BookOpen, Star, ChevronRight, Mail, Phone, MapPin } from 'lucide-react'
import type { Batch, Workshop, Offer } from '@/types'
import { formatDate, formatCurrency, formatDiscount } from '@/lib/utils'

async function getPublicData() {
  const supabase = await createClient()

  const [{ data: batches }, { data: workshops }, { data: offers }] = await Promise.all([
    supabase
      .from('batches')
      .select('id,name,category,description,instructor,schedule,price,capacity,enrolled_count')
      .eq('is_published', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('workshops')
      .select('id,title,category,description,date,venue,instructor,price,capacity,enrolled_count')
      .eq('is_published', true)
      .order('date', { ascending: true })
      .limit(4),
    supabase
      .from('offers')
      .select('id,name,description,discount_type,discount_value,end_date')
      .eq('is_published', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .limit(3),
  ])

  return {
    batches: (batches ?? []) as Batch[],
    workshops: (workshops ?? []) as Workshop[],
    offers: (offers ?? []) as Offer[],
  }
}

const services = [
  { icon: '🧘', title: 'Yoga', desc: 'Traditional and modern yoga practices for all levels.' },
  { icon: '🌿', title: 'Meditation', desc: 'Guided meditation sessions for stress relief and clarity.' },
  { icon: '🔮', title: 'Occult Science', desc: 'Explore ancient wisdom and esoteric knowledge.' },
  { icon: '📚', title: 'Courses', desc: 'Structured learning paths for deep transformation.' },
  { icon: '🌸', title: 'Workshops', desc: 'Intensive short-format sessions on focused topics.' },
  { icon: '⭐', title: 'Special Offers', desc: 'Exclusive deals and bundle packages for members.' },
]

export default async function LandingPage() {
  const { batches, workshops, offers } = await getPublicData()

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white" size={18} />
            </span>
            <span className="text-lg font-bold text-neutral-900">WellnessOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#services" className="hover:text-primary-600 transition-colors">Services</a>
            <a href="#workshops" className="hover:text-primary-600 transition-colors">Workshops</a>
            <a href="#offers" className="hover:text-primary-600 transition-colors">Offers</a>
            <a href="#about" className="hover:text-primary-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">Log in</Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-4 sm:px-6 bg-gradient-to-b from-primary-50/60 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-100 rounded-full text-primary-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles size={12} />
            Transform Your Wellness Journey
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-tight mb-6">
            Your Complete<br />
            <span className="text-primary-600">Wellness</span> Platform
          </h1>
          <p className="text-xl text-neutral-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Discover yoga, meditation, occult science, and transformative workshops.
            Join a community committed to holistic well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
              Start Your Journey <ArrowRight size={18} />
            </Link>
            <a href="#workshops" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
              Explore Workshops
            </a>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">About WellnessOS</p>
            <h2 className="text-3xl font-bold text-neutral-900 mb-5">
              Holistic wellness for modern life
            </h2>
            <p className="text-neutral-500 leading-relaxed mb-6">
              WellnessOS is a professional management platform for wellness businesses offering yoga, meditation,
              occult science, workshops and more. We bridge ancient wisdom with modern technology to create
              seamless wellness experiences.
            </p>
            <p className="text-neutral-500 leading-relaxed mb-8">
              Our platform connects practitioners with certified instructors, making it easy to discover sessions,
              register for workshops, and track your wellness journey all in one place.
            </p>
            <Link href="/register" className="btn-primary">
              Join the Community <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🧘', title: 'Expert Instructors', desc: 'Certified & experienced wellness professionals' },
              { icon: '📅', title: 'Flexible Schedules', desc: 'Morning, evening & weekend sessions available' },
              { icon: '🌿', title: 'Holistic Approach', desc: 'Mind, body & spirit integration' },
              { icon: '🔒', title: 'Safe Space', desc: 'Inclusive and welcoming environment for all' },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">What We Offer</p>
            <h2 className="text-3xl font-bold text-neutral-900">Our Services</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="card p-6 hover:shadow-md transition-shadow duration-200 group">
                <span className="text-3xl mb-4 block">{s.icon}</span>
                <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{s.title}</h3>
                <p className="text-sm text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Live Batches */}
          {batches.length > 0 && (
            <div className="mt-16">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Available Batches</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {batches.map((b) => (
                  <div key={b.id} className="card p-5 hover:shadow-md transition-shadow">
                    <span className="badge badge-green mb-3">{b.category}</span>
                    <h4 className="font-semibold text-neutral-900 mb-1">{b.name}</h4>
                    {b.instructor && <p className="text-xs text-neutral-500 mb-2">By {b.instructor}</p>}
                    <p className="text-sm font-bold text-primary-600 mt-3">{formatCurrency(b.price)}</p>
                    <p className="text-xs text-neutral-400 mt-1">{b.capacity - b.enrolled_count} spots left</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Workshops ── */}
      <section id="workshops" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Live Events</p>
            <h2 className="text-3xl font-bold text-neutral-900">Upcoming Workshops</h2>
          </div>
          {workshops.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <BookOpen size={40} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No workshops have been published yet.</p>
              <p className="text-sm mt-1">Check back soon for upcoming events.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {workshops.map((w) => (
                <div key={w.id} className="card p-5 hover:shadow-md transition-shadow group">
                  <span className="badge badge-blue mb-3">{w.category}</span>
                  <h4 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">{w.title}</h4>
                  {w.date && <p className="text-xs text-neutral-500 mb-1">📅 {formatDate(w.date)}</p>}
                  {w.venue && <p className="text-xs text-neutral-500 mb-2">📍 {w.venue}</p>}
                  {w.instructor && <p className="text-xs text-neutral-500">By {w.instructor}</p>}
                  <p className="text-sm font-bold text-primary-600 mt-3">{formatCurrency(w.price)}</p>
                  <Link href="/register" className="mt-3 text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                    Register Now <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Offers ── */}
      <section id="offers" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-primary-50/40 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Special Deals</p>
            <h2 className="text-3xl font-bold text-neutral-900">Active Offers</h2>
          </div>
          {offers.length === 0 ? (
            <div className="text-center py-16 text-neutral-400">
              <Star size={40} className="mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No active offers available.</p>
              <p className="text-sm mt-1">New offers are added regularly.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((o) => (
                <div key={o.id} className="card p-6 border-primary-200 bg-gradient-to-br from-white to-primary-50/30 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">{formatDiscount(o.discount_type, o.discount_value)}</span>
                    <span className="badge badge-green">Active</span>
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{o.name}</h4>
                  {o.description && <p className="text-sm text-neutral-500 mb-3">{o.description}</p>}
                  {o.end_date && <p className="text-xs text-neutral-400">Valid until {formatDate(o.end_date)}</p>}
                  <Link href="/register" className="mt-4 btn-primary text-xs px-3 py-2">
                    Claim Offer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-primary-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to begin your wellness journey?</h2>
          <p className="text-primary-100 mb-8 text-lg">Join hundreds of members who are transforming their lives.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-primary-400 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-neutral-900 text-neutral-400 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={16} />
              </span>
              <span className="text-lg font-bold text-white">WellnessOS</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Professional wellness management platform for yoga, meditation, occult science, and transformative workshops.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {['Services', 'Workshops', 'Offers', 'About'].map((l) => (
                <li key={l}><a href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">WellnessOS</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed for wellness businesses to manage sessions, batches, workshops, offers, and registrations seamlessly.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-neutral-800 text-center text-xs">
          © {new Date().getFullYear()} WellnessOS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
