# Maharashtra — Cinematic 3D Travel Platform

A scroll-driven cinematic flight through Maharashtra's greatest adventures, fused
with a real booking platform. Built for the **3D Websites Hackathon** and
**Zero to Live: Website Challenge**.

> Scroll = fly. A 3D airplane carries you from above the clouds, over the
> Sahyadri ranges, through cloud transitions, across Pawna Lake, into the
> Bhimashankar forest, over the Harishchandragad cliffs, and down to a glowing
> landing hub — where the real booking platform begins.

## ✨ Highlights

- **8-scene scroll cinematic** driven by GSAP ScrollTrigger → a single scroll
  progress value steers a React Three Fiber world (airplane, chase camera, fog,
  colour grading, camera shake).
- **Procedural world** — mountains, reflective lake, instanced forest, cliffs and
  a glowing landing hub, all generated from code (zero external 3D assets needed
  to run; drop in `airplane.glb` etc. when ready).
- **Cinematic post-processing** — bloom, depth-of-field, vignette, film grain.
- **Volumetric clouds** that engulf the camera during transition scenes.
- **Full booking platform** — explore + filter, Mapbox 3D terrain map,
  destination detail, operators, reviews, booking flow, saved trips, history.
- **Runs with zero config** — Supabase + Mapbox are optional; the app falls back
  to seed data + localStorage so you can demo instantly.
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
  experience/        # WebGL flight: Canvas, FlightController, World, Clouds, Markers, Effects
  pages/home/        # Cinematic homepage + scene content + loader + progress rail
  pages/platform/    # Explore, DestinationDetail, Booking, Account
  components/         # PlatformLayout, WorldMap (Mapbox)
  data/              # Destinations / activities / operators seed model
  lib/               # scrollStore, platform store (persisted), supabase client
  hooks/             # useCinematicScroll (GSAP), useMediaQuery / useLowPower
  styles/            # SCSS tokens + base + cinematic + platform
supabase/schema.sql  # Tables + RLS policies
vercel.json          # SPA rewrites + asset caching
```

## 🎬 How the flight works

1. `useCinematicScroll` attaches one scrubbed GSAP ScrollTrigger over the whole
   page and writes `progress` (0→1) to a Zustand store.
2. `FlightController` reads `progress` each frame and samples a
   `CatmullRomCurve3` flight path for position + tangent, banks the plane into
   turns, follows with a smoothed chase camera, and cross-fades the
   sky/fog/light between the 8 scenes (`src/experience/flight.ts`).
3. The DOM overlay (`pages/home`) shows synchronized text per scene and a scene
   progress rail.

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
