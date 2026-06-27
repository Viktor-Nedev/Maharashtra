-- ===========================================================================
-- Maharashtra — Supabase schema
-- Run in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run),
-- or `supabase db push`.
--
-- Auth is handled by Supabase Auth (auth.users). The adventure catalogue
-- (destinations / activities / operators) lives in the app as seed data
-- (src/data/destinations.ts), so the USER tables below are self-contained:
-- they store the slug/id + a snapshot of the labels we need to render, with
-- no foreign key to a catalogue table. This keeps the backend simple and
-- avoids having to mirror the whole catalogue into the database.
--
-- Row Level Security is enabled so every user only ever touches their own data.
-- ===========================================================================

-- ---- Profiles (1 row per user, created on sign-up) ------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  created_at  timestamptz default now()
);

-- ---- Saved destinations ("hearts") ----------------------------------------
create table if not exists public.saved_trips (
  user_id          uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null,
  created_at       timestamptz default now(),
  primary key (user_id, destination_slug)
);

-- ---- Planned trips (an activity saved with a chosen date range) ------------
create table if not exists public.planned_trips (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null,
  destination_name text not null,
  activity_id      text not null,
  activity_name    text not null,
  image            text,
  date_from        date not null,
  date_to          date not null,
  people           int  not null check (people > 0),
  total            int  not null,
  created_at       timestamptz default now()
);

-- ---- Bookings (confirmed / paid) ------------------------------------------
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  destination_slug text not null,
  destination_name text not null,
  activity_id      text not null,
  activity_name    text not null,
  booking_date     date not null,
  people           int  not null check (people > 0),
  total            int  not null,
  status           text default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at       timestamptz default now()
);

-- ===========================================================================
-- Row Level Security — owner-only on every table
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.saved_trips   enable row level security;
alter table public.planned_trips enable row level security;
alter table public.bookings      enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own saved trips" on public.saved_trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own planned trips" on public.planned_trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own bookings" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- Helpful indexes
-- ===========================================================================
create index if not exists idx_saved_trips_user   on public.saved_trips(user_id);
create index if not exists idx_planned_trips_user  on public.planned_trips(user_id);
create index if not exists idx_bookings_user       on public.bookings(user_id);
