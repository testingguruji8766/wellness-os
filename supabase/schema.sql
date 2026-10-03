-- ============================================================
--  🌿 WellnessOS — Supabase PostgreSQL Schema & Security Rules
--  Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ── Enable UUID extension ────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── 1. PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  email           text        not null,
  full_name       text,
  phone           text,
  date_of_birth   date,
  bio             text,
  role            text        not null default 'user' check (role in ('admin', 'user')),
  is_active       boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── 2. BATCHES ────────────────────────────────────────────────
create table if not exists public.batches (
  id              uuid          primary key default gen_random_uuid(),
  name            text          not null,
  category        text          not null,
  description     text,
  instructor      text,
  schedule        text,
  start_time      text,
  end_time        text,
  capacity        integer       not null default 20,
  enrolled_count  integer       not null default 0,
  price           numeric(10,2) not null default 0,
  status          text          not null default 'active' check (status in ('active','inactive','completed')),
  is_published    boolean       not null default false,
  created_by      uuid          references auth.users(id) on delete set null,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- ── 3. WORKSHOPS ──────────────────────────────────────────────
create table if not exists public.workshops (
  id              uuid          primary key default gen_random_uuid(),
  title           text          not null,
  category        text          not null,
  description     text,
  date            date,
  start_time      text,
  end_time        text,
  venue           text,
  instructor      text,
  capacity        integer       not null default 20,
  enrolled_count  integer       not null default 0,
  price           numeric(10,2) not null default 0,
  status          text          not null default 'upcoming' check (status in ('upcoming','ongoing','completed','cancelled')),
  is_published    boolean       not null default false,
  created_by      uuid          references auth.users(id) on delete set null,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- ── 4. OFFERS ─────────────────────────────────────────────────
create table if not exists public.offers (
  id                      uuid          primary key default gen_random_uuid(),
  name                    text          not null,
  description             text,
  discount_type           text          not null check (discount_type in ('percentage','fixed')),
  discount_value          numeric(10,2) not null,
  start_date              timestamptz,
  end_date                timestamptz,
  applicable_batch_id     uuid          references public.batches(id) on delete set null,
  applicable_workshop_id  uuid          references public.workshops(id) on delete set null,
  status                  text          not null default 'active' check (status in ('active','inactive','expired')),
  is_published            boolean       not null default false,
  created_by              uuid          references auth.users(id) on delete set null,
  created_at              timestamptz   not null default now(),
  updated_at              timestamptz   not null default now()
);

-- ── 5. REGISTRATIONS ──────────────────────────────────────────
create table if not exists public.registrations (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  batch_id          uuid        references public.batches(id) on delete set null,
  workshop_id       uuid        references public.workshops(id) on delete set null,
  registration_date date        not null default current_date,
  status            text        not null default 'confirmed' check (status in ('confirmed','pending','cancelled')),
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Prevent duplicate registrations for the same user and batch/workshop
  unique (user_id, batch_id),
  unique (user_id, workshop_id),
  -- Must register for either batch or workshop, not both
  constraint check_registration_type check (
    (batch_id is not null and workshop_id is null) or
    (batch_id is null and workshop_id is not null)
  )
);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_batches_published on public.batches(is_published, status);
create index if not exists idx_workshops_published on public.workshops(is_published, date);
create index if not exists idx_offers_published on public.offers(is_published, start_date, end_date);
create index if not exists idx_registrations_user on public.registrations(user_id);
create index if not exists idx_registrations_batch on public.registrations(batch_id);
create index if not exists idx_registrations_workshop on public.registrations(workshop_id);

-- ── TRIGGER: auto-create profile on user signup ───────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── TRIGGER: updated_at timestamps ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists batches_updated_at on public.batches;
create trigger batches_updated_at before update on public.batches for each row execute function public.set_updated_at();

drop trigger if exists workshops_updated_at on public.workshops;
create trigger workshops_updated_at before update on public.workshops for each row execute function public.set_updated_at();

drop trigger if exists offers_updated_at on public.offers;
create trigger offers_updated_at before update on public.offers for each row execute function public.set_updated_at();

drop trigger if exists registrations_updated_at on public.registrations;
create trigger registrations_updated_at before update on public.registrations for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- ── TRIGGER: update enrolled_count on registration ────────────
create or replace function public.update_enrolled_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    if new.batch_id is not null then
      update public.batches set enrolled_count = enrolled_count + 1 where id = new.batch_id;
    end if;
    if new.workshop_id is not null then
      update public.workshops set enrolled_count = enrolled_count + 1 where id = new.workshop_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.batch_id is not null then
      update public.batches set enrolled_count = greatest(0, enrolled_count - 1) where id = old.batch_id;
    end if;
    if old.workshop_id is not null then
      update public.workshops set enrolled_count = greatest(0, enrolled_count - 1) where id = old.workshop_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists on_registration_change on public.registrations;
create trigger on_registration_change
  after insert or delete on public.registrations
  for each row execute function public.update_enrolled_count();

-- ============================================================
--  ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.batches enable row level security;
alter table public.workshops enable row level security;
alter table public.offers enable row level security;
alter table public.registrations enable row level security;

-- ── Helper: check if current authenticated user is admin ───────
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── PROFILES POLICIES ─────────────────────────────────────────
drop policy if exists "profiles: user can view own" on public.profiles;
create policy "profiles: user can view own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: admin can view all" on public.profiles;
create policy "profiles: admin can view all" on public.profiles
  for select using (public.is_admin());

drop policy if exists "profiles: user can update own" on public.profiles;
create policy "profiles: user can update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles: admin can update all" on public.profiles;
create policy "profiles: admin can update all" on public.profiles
  for update using (public.is_admin());

-- ── BATCHES POLICIES ──────────────────────────────────────────
-- Public and Authenticated users can view published batches
drop policy if exists "batches: view published" on public.batches;
create policy "batches: view published" on public.batches
  for select using (is_published = true);

-- Admins have full access to batches
drop policy if exists "batches: admin view all" on public.batches;
create policy "batches: admin view all" on public.batches
  for select using (public.is_admin());

drop policy if exists "batches: admin insert" on public.batches;
create policy "batches: admin insert" on public.batches
  for insert with check (public.is_admin());

drop policy if exists "batches: admin update" on public.batches;
create policy "batches: admin update" on public.batches
  for update using (public.is_admin());

drop policy if exists "batches: admin delete" on public.batches;
create policy "batches: admin delete" on public.batches
  for delete using (public.is_admin());

-- ── WORKSHOPS POLICIES ────────────────────────────────────────
-- Public and Authenticated users can view published workshops
drop policy if exists "workshops: view published" on public.workshops;
create policy "workshops: view published" on public.workshops
  for select using (is_published = true);

-- Admins have full access to workshops
drop policy if exists "workshops: admin view all" on public.workshops;
create policy "workshops: admin view all" on public.workshops
  for select using (public.is_admin());

drop policy if exists "workshops: admin insert" on public.workshops;
create policy "workshops: admin insert" on public.workshops
  for insert with check (public.is_admin());

drop policy if exists "workshops: admin update" on public.workshops;
create policy "workshops: admin update" on public.workshops
  for update using (public.is_admin());

drop policy if exists "workshops: admin delete" on public.workshops;
create policy "workshops: admin delete" on public.workshops
  for delete using (public.is_admin());

-- ── OFFERS POLICIES ───────────────────────────────────────────
-- Public and Authenticated users can view published & valid offers
drop policy if exists "offers: view active published" on public.offers;
create policy "offers: view active published" on public.offers
  for select using (
    is_published = true
    and (start_date is null or start_date <= now())
    and (end_date is null or end_date >= now())
  );

-- Admins have full access to offers
drop policy if exists "offers: admin view all" on public.offers;
create policy "offers: admin view all" on public.offers
  for select using (public.is_admin());

drop policy if exists "offers: admin insert" on public.offers;
create policy "offers: admin insert" on public.offers
  for insert with check (public.is_admin());

drop policy if exists "offers: admin update" on public.offers;
create policy "offers: admin update" on public.offers
  for update using (public.is_admin());

drop policy if exists "offers: admin delete" on public.offers;
create policy "offers: admin delete" on public.offers
  for delete using (public.is_admin());

-- ── REGISTRATIONS POLICIES ────────────────────────────────────
-- Users can view their own registrations
drop policy if exists "registrations: user view own" on public.registrations;
create policy "registrations: user view own" on public.registrations
  for select using (auth.uid() = user_id);

-- Admins can view all registrations
drop policy if exists "registrations: admin view all" on public.registrations;
create policy "registrations: admin view all" on public.registrations
  for select using (public.is_admin());

-- Users can insert their own registration
drop policy if exists "registrations: user insert own" on public.registrations;
create policy "registrations: user insert own" on public.registrations
  for insert with check (auth.uid() = user_id);

-- Admins can update any registration status
drop policy if exists "registrations: admin update" on public.registrations;
create policy "registrations: admin update" on public.registrations
  for update using (public.is_admin());

-- Admins can delete any registration
drop policy if exists "registrations: admin delete" on public.registrations;
create policy "registrations: admin delete" on public.registrations
  for delete using (public.is_admin());

-- ============================================================
--  TEST ACCOUNT ROLE PROMOTION (Run after creating admin@test.com)
-- ============================================================
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'admin@test.com';
