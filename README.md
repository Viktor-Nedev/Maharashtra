# Maharashtra — Adventure Booking Platform (with a cinematic 3D flight)

A full-stack, production-ready platform to **discover, compare and book** outdoor
adventures across Maharashtra — fronted by a scroll-driven 3D satellite *flight*
over the state. Built for the **Zero to Live: Website Challenge**.

> Scroll = fly. A 3D airplane carries you south → north over a live Mapbox
> satellite map — Tarkarli, Mahabaleshwar, Pawna, the Sahyadris, Mumbai,
> Bhimashankar, Harishchandragad — and lands you in the booking platform.

## ✅ What it does (challenge requirements)

- **Discover activities** — trekking, camping, water sports, aerial, climbing,
  wildlife — filterable by category, price and duration on `/explore`.
- **Explore destinations** — six signature Maharashtra regions with detail pages.
- **Detailed listings** — every activity opens a listing panel with **pricing,
  an hour-by-hour itinerary, what's included, the verified operator, reviews and
  ratings**, plus a date-range calendar.
- **Seamless booking** — pick a date + party size → `/book/:slug/:activityId` →
  pay → confirmation, saved to your trip history + profile calendar.
- **Secure payments** — Stripe PaymentElement (`/api/create-payment-intent`),
  with a graceful demo-confirm fallback when no Stripe key is set.
- **Operator-based model** — operators (verified, rated) own on-ground execution;
  surfaced on every listing and destination page.
- **AI trip advisor** — streaming **Google Gemini** assistant (`/api/gemini-advise`)
  that recommends destinations and generates multi-day itineraries into the Planner.
- **Accounts + persistence** — Supabase Auth + Postgres (saved trips, planned
  trips, bookings) with Row-Level Security; localStorage fallback for offline demos.
- **Mobile-first & fast** — responsive across phones, code-split lazy routes,
  deferred map JS, and a low-power static-hero path that skips WebGL on weak
  devices.

## 🧱 Stack

React · TypeScript · Vite · Mapbox GL (3D flight + activity maps) · Three.js /
React Three Fiber (airplane overlay) · Framer Motion · GSAP ScrollTrigger ·
Zustand · **Supabase** (Auth + Postgres + RLS) · **Stripe** · **Google Gemini** ·
Vercel (static + edge/node `/api` functions).

## 🚀 Getting started (local)

```bash
npm install
npm run dev
```

Opens with zero config (seed data + localStorage + a static hero). Add keys for
the full experience:

```bash
cp .env.example .env
# fill VITE_MAPBOX_TOKEN, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PK
```

Then create the database tables: open the **Supabase dashboard → SQL → New
query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and
**Run** (or `supabase db push`). This creates `profiles`, `saved_trips`,
`planned_trips`, `bookings` with owner-only RLS.

## 🌐 Deploy to Vercel (live site)

1. Push to GitHub and **Import** the repo in Vercel (framework auto-detected as
   Vite; `vercel.json` already handles SPA routing + asset caching, and `/api`
   edge+node functions deploy automatically).
2. In **Vercel → Project → Settings → Environment Variables**, add:

   | Variable | Scope | Notes |
   |---|---|---|
   | `VITE_MAPBOX_TOKEN` | Build | 3D flight map (else static hero) |
   | `VITE_SUPABASE_URL` | Build | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | Build | publishable / anon key (browser-safe) |
   | `VITE_STRIPE_PK` | Build | Stripe publishable key |
   | `STRIPE_SECRET_KEY` | Runtime | server-side, for payment intents |
   | `GEMINI_API_KEY` | Runtime | server-side, for the AI advisor |

   > The Supabase **secret** key (`sb_secret_…`) is **not** needed by this app and
   > must never be `VITE_`-prefixed or committed.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
4. Deploy:

   ```bash
   npx vercel login
   npx vercel --prod
   ```

   (Or just click **Deploy** after the GitHub import.)

## 📂 Structure

```
api/                       # Vercel functions: gemini-advise (edge), create-payment-intent (node)
src/
  experience/              # MapboxFlight (home 3D flight), PlaneOverlay, Airplane, mapRoute
  pages/home/              # Cinematic homepage + CloudIntro + progress rail
  pages/platform/          # Explore, DestinationDetail, Booking, Planner, Account, AIAdvisor, Compare
  components/              # ActivityMap (pins), ActivityDetailPanel (listing), TripCalendar, nav, …
  data/                    # destinations.ts — destinations / activities / operators / itineraries
  lib/                     # stores (platform/planner/auth/theme/scroll), supabase client, itinerary
  hooks/ · styles/         # cinematic scroll, media queries · SCSS tokens + cinematic + platform
supabase/schema.sql        # Tables + RLS policies
vercel.json                # SPA rewrites + asset caching
```

## 🎬 How the home flight works (and stays fast)

1. `useCinematicScroll` scrubs one GSAP ScrollTrigger over the page and writes
   `progress` (0→1) to a Zustand store.
2. `MapboxFlight` (lazy-loaded so the 1.8 MB mapbox-gl chunk never blocks first
   paint) runs a smoothed RAF loop that samples the landmark route (`mapRoute.ts`)
   and drives the Mapbox free-camera over 3D satellite terrain. A two-pass tile
   preload + a terrain-ward ~52° pitch + 512px tiles keep it lag-free and never
   blank; the loop pauses when the tab is hidden.
3. On low-power / data-saver / no-token devices the whole WebGL flight + airplane
   are swapped for a static scenic hero — instant and battery-friendly on phones.
4. `PlaneOverlay` is a transparent R3F airplane that banks with scroll velocity
   above the map; DOM copy + a progress rail stay in sync per landmark.
```
