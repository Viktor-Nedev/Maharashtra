import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARKS, altitudeAt, routePointAt } from './mapRoute';

const token = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapboxFlight({ lowPower = false }: { lowPower?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setReady = useScrollStore((s) => s.setReady);
  const setPreloadProgress = useScrollStore((s) => s.setPreloadProgress);

  useEffect(() => {
    if (!token || !ref.current) {
      setReady(true);
      return;
    }

    mapboxgl.accessToken = token;

    // Raise the global parallel-request limit so tile batches resolve faster.
    // Default is 16; pushing it higher helps when the user has good bandwidth.
    (mapboxgl as unknown as { workerCount: number }).workerCount = 4;

    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/vikdev/cmlo8l453002c01qu7avs7rf3',
      center: routePointAt(0),
      zoom: 11,
      pitch: 60,
      bearing: 0,
      projection: { name: 'mercator' },
      interactive: false,
      attributionControl: false,
      // Antialias is a real GPU cost on weak devices — only on capable ones.
      antialias: !lowPower,
      // Large cache so tiles warmed at startup stay resident for the whole flight.
      maxTileCacheSize: 3000,
      // Skip the cross-fade animation between tile zoom levels — tiles appear
      // immediately instead of fading in, so the map looks "loaded" faster.
      fadeDuration: 0,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    let raf = 0;
    let eased = 0;
    // `start()` is assigned inside style.load; the error/cap handlers call it so
    // there is a single reveal path (curtain up + scroll loop running).
    let revealNow: (() => void) | null = null;
    // If warming finished we start the flight; otherwise (style never loaded)
    // at least lift the curtain so the page is usable.
    const reveal = () => { if (revealNow) revealNow(); else setReady(true); };

    // Safety net only — if warming hangs or the connection is bad, reveal anyway.
    const overallCap = window.setTimeout(reveal, 8000);
    map.on('error', (e) => {
      console.error('[MapboxFlight]', e?.error?.message ?? e);
      reveal();
    });

    map.on('style.load', () => {
      map.resize();

      if (!map.getSource('satellite')) {
        map.addLayer({ id: 'bg', type: 'background', paint: { 'background-color': '#0e2038' } });
        map.addSource('satellite', {
          type: 'raster',
          url: 'mapbox://mapbox.satellite',
          // 512-px tiles → 4× fewer requests per view than the default 256.
          // Each tile covers the same geographic area but at double the pixel
          // density, so detail is equivalent while round-trips drop sharply.
          tileSize: 512,
          minzoom: 0,
          // Cap at 16: the flight altitude never needs sharper than this, and a
          // lower cap means far fewer tiles to fetch (z17/18 are upsampled).
          maxzoom: 16,
        });
        map.addLayer({
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          paint: { 'raster-fade-duration': 0 }, // no per-tile fade
        });
      }

      // 3D terrain doubles the tile requests (satellite + DEM) and adds GPU
      // cost. On low-power devices we fly over flat satellite instead — still
      // looks great at 60° pitch but loads roughly twice as fast.
      if (!lowPower) {
        if (!map.getSource('dem')) {
          map.addSource('dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: 'dem', exaggeration: 1.2 });
      }

      map.setFog({
        range: [3, 18],
        color: 'rgba(214, 228, 242, 0.35)',
        'high-color': '#9cc4ee',
        'horizon-blend': 0.12,
        'space-color': '#0a1430',
        'star-intensity': 0.05,
      });

      LANDMARKS.forEach((lm) => {
        const el = document.createElement('button');
        el.className = 'map-landmark';
        el.innerHTML = `<span class="map-landmark__dot"></span><span class="map-landmark__name">${lm.name}</span>`;
        if (lm.destinationSlug) {
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => navigate(`/destination/${lm.destinationSlug}`));
        }
        new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(lm.coordinates).addTo(map);
      });

      const aim = (f: number) => {
        const target = routePointAt(f);
        const alt = altitudeAt(f);
        const a = routePointAt(Math.max(0, f - 0.0012));
        const b = routePointAt(Math.min(1, f + 0.0012));
        const cosLat = Math.max(0.05, Math.cos((target[1] * Math.PI) / 180));
        let dx = (b[0] - a[0]) * 111320 * cosLat;
        let dy = (b[1] - a[1]) * 110540;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        // Keep the camera angled down at the terrain (~52° pitch) rather than
        // toward the horizon — a horizon-ward view pulls in hundreds of distant
        // tiles and stalls. Smaller multiplier = more top-down = fewer tiles.
        const D = alt * 1.3;
        const camLngLat: [number, number] = [
          target[0] - (dx * D) / (111320 * cosLat),
          target[1] - (dy * D) / 110540,
        ];
        const cam = map.getFreeCameraOptions();
        cam.position = mapboxgl.MercatorCoordinate.fromLngLat(camLngLat, alt);
        cam.lookAtPoint(target);
        map.setFreeCameraOptions(cam);
      };

      let applied = -1;
      const tick = () => {
        // Skip all camera/tile work while the tab is hidden (saves battery/CPU).
        if (document.hidden) { raf = requestAnimationFrame(tick); return; }
        const targetP = useScrollStore.getState().progress;
        eased += (targetP - eased) * 0.14;
        if (Math.abs(targetP - eased) < 0.0003) eased = targetP;
        if (Math.abs(eased - applied) > 0.00004) {
          applied = eased;
          aim(eased);

          // Draw the route line up to the current scroll position.
          const src = map.getSource('route-line') as mapboxgl.GeoJSONSource | undefined;
          if (src) {
            const n = LANDMARKS.length;
            const scaled = eased * (n - 1);
            const idx = Math.min(Math.floor(scaled), n - 2);
            const frac = scaled - idx;
            const coords = LANDMARKS.slice(0, idx + 1).map((l) => l.coordinates) as [number, number][];
            const a = LANDMARKS[idx].coordinates;
            const b = LANDMARKS[Math.min(idx + 1, n - 1)].coordinates;
            coords.push([a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac]);
            src.setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: coords },
              properties: {},
            });
          }
        }
        raf = requestAnimationFrame(tick);
      };

      let done = false;
      const start = () => {
        if (done) return;
        done = true;
        window.clearTimeout(overallCap);
        setPreloadProgress(1);
        setReady(true);
        aim(0);
        applied = -1;
        raf = requestAnimationFrame(tick);
      };
      // The single reveal path used by the cap + error handlers too.
      revealNow = start;

      // Fast overview preload — warmed behind the cloud-intro curtain. We cache
      // COARSE parents for the whole route (cheap) so the ground + 3D terrain are
      // present everywhere from the first frame; Mapbox then refines satellite +
      // DEM on-demand as the flight proceeds (coarse → sharp, never blank).
      //   Pass 1 (zoom 5) — ancestor tiles for the whole state.
      //   Pass 2 (zoom 8) — coarse satellite + DEM across the whole corridor.
      //   Pass 3 (aim 0)  — warm just the take-off view so the opening is crisp.

      const idleWait = (cb: () => void, cap: number) => {
        let fired = false;
        const fire = () => { if (!fired) { fired = true; window.clearTimeout(t); map.off('idle', fire); cb(); } };
        const t = window.setTimeout(fire, cap);
        map.once('idle', fire);
      };

      // Animated route line: drawn progressively by the tick as the user scrolls.
      map.addSource('route-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [LANDMARKS[0].coordinates] },
          properties: {},
        },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-line',
        paint: { 'line-color': '#ff7a3d', 'line-width': 3, 'line-opacity': 0.55, 'line-blur': 1 },
      });

      // Pass 1: very low zoom overview of Maharashtra
      map.jumpTo({ center: [73.8, 18.5], zoom: 5, pitch: 0, bearing: 0 });
      setPreloadProgress(0.15);

      idleWait(() => {
        // Pass 2: zoom-8 over the route bbox — coarse parents (satellite + DEM)
        // for the entire corridor so terrain is present everywhere instantly.
        map.jumpTo({ center: [73.8, 18.5], zoom: 8, pitch: 0, bearing: 0 });
        setPreloadProgress(0.55);

        idleWait(() => {
          // Pass 3: frame the actual take-off view so the opening is sharp.
          aim(0);
          setPreloadProgress(0.8);
          idleWait(start, 1200);
        }, 1200);
      }, 700);
    });

    return () => {
      window.clearTimeout(overallCap);
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [navigate, setReady, setPreloadProgress]);

  if (!token) {
    return (
      <div className="experience-canvas mapflight mapflight--fallback">
        <div>
          <h2>Add a Mapbox token to take off</h2>
          <p>
            Set <code>VITE_MAPBOX_TOKEN</code> in <code>.env</code> to load the 3D satellite flight.
          </p>
        </div>
      </div>
    );
  }

  return <div className="experience-canvas mapflight" ref={ref} aria-hidden="true" />;
}
