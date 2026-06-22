-- ===========================================================================
-- Maharashtra — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Auth is handled by Supabase Auth (auth.users); these tables reference it.
-- Row Level Security is enabled so users only ever touch their own data.
-- ===========================================================================

-- ---- Reference data: destinations -----------------------------------------
create table if not exists public.destinations (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  region      text not null,
  scene       int  not null,
  tagline     text,
  description text,
  lng         double precision not null,
  lat         double precision not null,
  hero_color  text,
  elevation   int,
  best_season text,
  image       text,
  created_at  timestamptz default now()
);

-- ---- Reference data: operators --------------------------------------------
create table if not exists public.operators (
  id        text primary key,
  name      text not null,
  rating    numeric(2,1) default 0,
  verified  boolean default false,
  since     int
);

-- ---- Reference data: activities -------------------------------------------
create table if not exists public.activities (
  id               text primary key,
  destination_id   text references public.destinations(id) on delete cascade,
  name             text not null,
  category         text not null check (category in
                     ('trekking','camping','water','aerial','climbing','wildlife')),
  duration_hours   numeric(4,1),
  difficulty       text check (difficulty in ('easy','moderate','hard','extreme')),
  price_per_person int not null,
  description      text
);

-- ---- User data: saved trips -----------------------------------------------
create table if not exists public.saved_trips (
  user_id        uuid references auth.users(id) on delete cascade,
  destination_id text references public.destinations(id) on delete cascade,
  created_at     timestamptz default now(),
  primary key (user_id, destination_id)
);

-- ---- User data: bookings --------------------------------------------------
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  activity_id   text references public.activities(id),
  destination_id text references public.destinations(id),
  booking_date  date not null,
  people        int  not null check (people > 0),
  total         int  not null,
  status        text default 'confirmed' check (status in ('confirmed','cancelled')),
  created_at    timestamptz default now()
);

-- ---- User data: reviews ---------------------------------------------------
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade,
  destination_id text references public.destinations(id) on delete cascade,
  rating         int not null check (rating between 1 and 5),
  body           text,
  created_at     timestamptz default now()
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

-- Reference tables: world-readable, no writes from clients.
alter table public.destinations enable row level security;
alter table public.operators    enable row level security;
alter table public.activities   enable row level security;

create policy "destinations are public" on public.destinations for select using (true);
create policy "operators are public"    on public.operators    for select using (true);
create policy "activities are public"   on public.activities   for select using (true);

-- User tables: owner-only.
alter table public.saved_trips enable row level security;
alter table public.bookings    enable row level security;
alter table public.reviews     enable row level security;

create policy "own saved trips" on public.saved_trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own bookings" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reviews: anyone can read, only the author can write/edit.
create policy "reviews are public"   on public.reviews for select using (true);
create policy "own reviews insert"   on public.reviews for insert with check (auth.uid() = user_id);
create policy "own reviews modify"   on public.reviews for update using (auth.uid() = user_id);
create policy "own reviews delete"   on public.reviews for delete using (auth.uid() = user_id);

-- ===========================================================================
-- Helpful indexes
-- ===========================================================================
create index if not exists idx_activities_destination on public.activities(destination_id);
create index if not exists idx_bookings_user          on public.bookings(user_id);
create index if not exists idx_reviews_destination     on public.reviews(destination_id);
