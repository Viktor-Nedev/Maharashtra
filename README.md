# Maharashtra — Cinematic 3D Travel Platform

A scroll-driven cinematic flight through Maharashtra's greatest adventures, fused
with a real booking platform. Built for the **3D Websites Hackathon** and
**Zero to Live: Website Challenge**.

> Scroll = fly. A 3D airplane carries you from above the clouds, over the
> Sahyadri ranges, through cloud transitions, across Pawna Lake, into the
> Bhimashankar forest, over the Harishchandragad cliffs, and down to a glowing
> landing hub — where the real booking platform begins.

## ✨ Highlights

- **Scroll-driven Mapbox flight** — the homepage is a real **3D satellite Mapbox
  map** of Maharashtra that you fly across as you scroll. The camera tracks a
  landmark route south → north, descending in altitude (flying *down* toward the
  terrain), while a 3D airplane (transparent R3F layer) banks in front of it.
- **Cloud-load transition** — clouds part and fade to reveal the flight on load.
- **A bespoke 3D scene for every activity** — trekking, camping, kayaking,
  rafting, boating, scuba, zipline, paragliding, hot-air balloon, climbing,
  rappelling, wildlife and caving each get their own animated, interactive
  (drag-to-orbit) React Three Fiber scene with bloom.
- **Light & dark mode** — persisted, OS-aware, toggle in every nav.
- **Full booking platform** — explore + filter, Mapbox 3D terrain map,
  destination detail, operators, reviews, booking flow, saved trips, history.
- **Runs with zero config** — Supabase is optional; the app falls back to seed
  data + localStorage. (Mapbox needs a token for the satellite map.)
- **Performance-aware** — adaptive DPR, a low-power render path for mobile /
  reduced-motion, aggressive code-splitting, lazy routes.

## 🧱 Stack

React · TypeScript · Vite · Three.js · React Three Fiber · Drei ·
`@react-three/postprocessing` · GSAP + ScrollTrigger · Framer Motion ·
Zustand · Supabase · Mapbox GL · Vercel.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. That's it — no keys required.

### Optional: enable the backend & map

```bash
cp .env.example .env
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_MAPBOX_TOKEN
```

Then create the database:

```bash
# paste supabase/schema.sql into the Supabase SQL editor, or:
supabase db push
```

## 📂 Structure

```
src/
  experience/             # MapboxFlight (home map), PlaneOverlay, Airplane, mapRoute
  experience/activities/  # Per-activity 3D scenes: kit, scenes, ActivityScene
  pages/home/             # Cinematic homepage + CloudIntro + progress rail
  pages/platform/         # Explore, DestinationDetail, Booking, Account
  components/              # PlatformLayout, WorldMap (Mapbox), ThemeToggle
  data/                   # Destinations / activities / operators seed model
  lib/                    # scrollStore, themeStore, platform store, supabase client
  hooks/                  # useCinematicScroll (GSAP), useMediaQuery / useLowPower
  styles/                 # SCSS tokens (light+dark) + base + cinematic + platform + components
supabase/schema.sql       # Tables + RLS policies
vercel.json               # SPA rewrites + asset caching
```

## 🎬 How the home flight works

1. `useCinematicScroll` attaches one scrubbed GSAP ScrollTrigger over the whole
   page and writes `progress` (0→1) to a Zustand store.
2. `MapboxFlight` runs a smoothed RAF loop that reads `progress`, samples the
   landmark route (`mapRoute.ts`) for a ground position + look-ahead point and a
   descending altitude, and drives the Mapbox camera with `setFreeCameraOptions`
   over 3D satellite terrain. All map interactions are disabled so page scroll
   *is* the flight.
3. `PlaneOverlay` is a transparent R3F canvas above the map: the airplane banks
   with scroll velocity and holds a nose-down pitch, so it reads as diving down
   across the live map.
4. The DOM overlay shows synchronized copy per landmark + a progress rail.

## 🚢 Deploy

Push to GitHub and import into Vercel (framework auto-detected as Vite). Add the
optional env vars in the Vercel dashboard. `vercel.json` handles SPA routing and
long-term asset caching.

## 🔁 Swapping in real GLB models

`Airplane.tsx` and `World.tsx` build geometry from primitives so the project runs
asset-free. To use real models, replace the primitive meshes with
`useGLTF('/models/airplane.glb')` — the flight/positioning system operates on the
parent groups and is model-agnostic. Put compressed (Draco/meshopt) GLBs in
`public/models/`.
```
