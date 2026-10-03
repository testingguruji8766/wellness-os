# 🌿 Wellness Management System (WellnessOS)

A modern, minimal, full-stack **Wellness Management System** built for wellness studios offering yoga, meditation, occult science sessions, workshops, courses, batches, and special offers.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase PostgreSQL**, **Supabase Auth**, and **Supabase Row Level Security (RLS)**. Ready for one-click deployment on **Vercel**.

---

## ✨ Features

### 👑 Admin Panel (`/admin`)
- **Dashboard Overview**: Dynamically calculated metrics (Total Users, Active Users, Total Batches, Published Workshops, Active Offers, Total Registrations) and recent activity.
- **Batches Management**: Full CRUD (Create, Read, Update, Delete) + Publish/Unpublish toggle, instructor assignment, schedule, capacity, and price management.
- **Workshops Management**: Full CRUD + Publish/Unpublish toggle, date/time, venue, capacity, instructor, and price settings.
- **Offers Management**: Percentage or fixed amount discounts, validity periods, and assignment to specific batches or workshops.
- **User Management**: View user profiles, search users, activate/deactivate accounts (admins protected).
- **Registrations Tracking**: Monitor all user enrollments with instant status updates (`confirmed`, `pending`, `cancelled`).

### 👤 User Panel (`/dashboard`, `/batches`, `/workshops`, `/offers`, `/registrations`, `/profile`)
- **Dynamic Dashboard**: Personalized view of available batches, upcoming workshops, active offers, and registration status.
- **Browse Batches & Workshops**: Filter and view details, live capacity tracking, and real-time registration with duplicate prevention.
- **Active Offers**: View discounted offerings with clear eligibility and expiration badges.
- **My Registrations**: Track status of registered batches and workshops.
- **Profile Management**: Update name, phone, and date of birth.

### 🌐 Public Landing Page (`/`)
- Responsive hero, about, services, dynamic workshops, dynamic offers showcase, and quick access navigation.
- Graceful empty states when no content is yet published.

### 🔒 Security & Data Integrity
- **Supabase Auth**: Secure email/password authentication.
- **Strict Role-Based Access Control (RBAC)**: Enforced both at middleware, server component layer (`lib/auth`), and database layer.
- **Row Level Security (RLS)**: Enforced on all PostgreSQL tables.
- **Zero Hardcoded Business Content**: All batches, workshops, offers, and registrations are purely database-driven.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions & Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or newer
- A Supabase account ([supabase.com](https://supabase.com))

---

### 2. Supabase Setup & Database Schema

1. Create a new project in the [Supabase Dashboard](https://database.new).
2. Navigate to **SQL Editor** in your Supabase project.
3. Open the file [`supabase/schema.sql`](file:///c:/Users/Ved/OneDrive/Desktop/wms/supabase/schema.sql) from this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.

This script will create:
- Tables: `profiles`, `batches`, `workshops`, `offers`, `registrations`
- Auto-profile creation trigger on user signup
- Real-time capacity counter triggers
- Indexes for high query performance
- Full Row Level Security (RLS) policies for Admin and User roles

---

### 3. Test Account Setup

Create the following 3 accounts in **Supabase Dashboard > Authentication > Users > Add User** (or via the `/register` page in the app):

| Role | Email | Password | Setup Note |
|---|---|---|---|
| **Admin** | `admin@test.com` | *Your secure password* | Must set `role = 'admin'` in `profiles` (see below) |
| **User 1** | `user1@test.com` | *Your secure password* | Standard user account |
| **User 2** | `user2@test.com` | *Your secure password* | Standard user account |

#### Grant Admin Role to `admin@test.com`:
Run the following query in the **Supabase SQL Editor**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@test.com';
```

---

### 4. Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Retrieve your project URL and Anon API key from **Supabase Dashboard > Project Settings > API**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

---

### 5. Local Development

Install dependencies and run the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- Landing Page: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Register: `http://localhost:3000/register`
- Admin Panel: `http://localhost:3000/admin` (Requires admin login)
- User Dashboard: `http://localhost:3000/dashboard` (Requires user login)

---

## 🚢 Vercel Deployment Instructions

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon key
5. Click **Deploy**.
6. In your Supabase project under **Authentication > URL Configuration**:
   - Add your Vercel deployment URL (e.g. `https://your-app.vercel.app`) to **Site URL** and **Redirect URLs**.

---

## 📂 Project Architecture

```
wms/
├── app/
│   ├── (user)/               # Authenticated User panel routes
│   │   ├── dashboard/        # User dynamic dashboard
│   │   ├── batches/          # Published batches & registration
│   │   ├── workshops/        # Published workshops & registration
│   │   ├── offers/           # Active published offers
│   │   ├── registrations/    # User's registration history
│   │   └── profile/          # User profile settings
│   ├── admin/                # Admin Panel routes (role-protected)
│   │   ├── batches/          # Batch CRUD & publish toggles
│   │   ├── workshops/        # Workshop CRUD & publish toggles
│   │   ├── offers/           # Offers management & assignment
│   │   ├── users/            # User account management
│   │   └── registrations/    # Registration status management
│   ├── login/                # Auth login page
│   ├── register/             # Auth registration page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Public dynamic landing page
├── components/
│   ├── admin/                # Admin sidebar, forms, and action triggers
│   └── user/                 # User sidebar, registration button, profile form
├── lib/
│   ├── auth/                 # Server-side auth helpers & role guards
│   ├── supabase/             # Client, Server, and Middleware Supabase clients
│   └── utils/                # Formatting & date calculation utilities
├── supabase/
│   └── schema.sql            # Full PostgreSQL schema with RLS & triggers
├── types/
│   └── index.ts              # TypeScript definitions for all entities
└── middleware.ts             # Route protection and session refresh middleware
```

---

## 🧪 Verification & User Flow Walkthrough

1. **Empty State Check**: Visit `http://localhost:3000` with an empty database. Observe clear empty states for services, workshops, and offers.
2. **Admin Flow**:
   - Log in with `admin@test.com`.
   - Access `/admin`.
   - Create and publish a Yoga batch (e.g., Morning Vinyasa Flow).
   - Create and publish a Workshop (e.g., Sound Bath Meditation).
   - Create an Offer (e.g., 20% Early Bird Discount) linked to the workshop.
3. **User Flow**:
   - Log in with `user1@test.com`.
   - View the active batch and workshop on `/dashboard`, `/batches`, and `/workshops`.
   - Click **Register** for the workshop.
   - Navigate to `/registrations` to see the registration marked as `pending` or `confirmed`.
   - Try to register again to verify duplicate prevention.
4. **Admin Verification**:
   - Log back in as `admin@test.com`.
   - Go to `/admin/registrations` and observe the new enrollment.
   - Update the registration status to `confirmed`.
