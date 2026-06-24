import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARKS, altitudeAt, routePointAt } from './mapRoute';

const token = import.meta.env.VITE_MAPBOX_TOKEN;

export function MapboxFlight() {
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
      pitch: 70,
      bearing: 0,
      projection: { name: 'mercator' },
      interactive: false,
      attributionControl: false,
      antialias: true,
      // Large cache so tiles warmed at startup stay resident for the whole flight.
      maxTileCacheSize: 3000,
      // Skip the cross-fade animation between tile zoom levels — tiles appear
      // immediately instead of fading in, so the map looks "loaded" faster.
      fadeDuration: 0,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    let raf = 0;
    let eased = 0;

    const readyFallback = window.setTimeout(() => setReady(true), 7000);
    map.on('error', (e) => {
      console.error('[MapboxFlight]', e?.error?.message ?? e);
      setReady(true);
    });

    map.on('style.load', () => {
      window.clearTimeout(readyFallback);
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
          maxzoom: 18,
        });
        map.addLayer({
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          paint: { 'raster-fade-duration': 0 }, // no per-tile fade
        });
      }

      if (!map.getSource('dem')) {
        map.addSource('dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'dem', exaggeration: 1.6 });

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
        const D = alt * 1.5;
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

      // Three-pass preload strategy:
      //
      // Pass 1 — zoom 5 overview (whole Maharashtra in ~4 tiles). These become
      // the ancestor tiles for every flight position, so even if detail hasn't
      // arrived yet the map is never blank — just blurry-but-present.
      //
      // Pass 2 — zoom 8 overview (~64 tiles, medium detail for the whole route).
      // This is the "second parent" level; tiles that arrive here sharpen the
      // whole route before we've even loaded the close-up views.
      //
      // Pass 3 — per-landmark warmup at flight altitude. Step cap is 350 ms
      // (down from 550) because the parent tiles loaded in passes 1 + 2 mean
      // Mapbox only needs to fetch the final zoom-level delta, which is fast.
      //
      // Overall cap: 5 s (down from 6.5 s). The two-pass overview means we can
      // afford to be stricter — the map already looks good by 2 s.

      const idleWait = (cb: () => void, cap: number) => {
        let fired = false;
        const fire = () => { if (!fired) { fired = true; window.clearTimeout(t); map.off('idle', fire); cb(); } };
        const t = window.setTimeout(fire, cap);
        map.once('idle', fire);
      };

      // Pass 1: very low zoom overview of Maharashtra
      map.jumpTo({ center: [73.8, 18.5], zoom: 5, pitch: 0, bearing: 0 });
      setPreloadProgress(0.05);

      idleWait(() => {
        // Pass 2: medium zoom to cache the whole route corridor
        map.jumpTo({ center: [73.8, 18.5], zoom: 8, pitch: 0, bearing: 0 });
        setPreloadProgress(0.12);

        idleWait(() => {
          // Pass 3: 20 evenly-spaced positions across the entire route (every
          // 5 % of scroll progress) so all intermediate camera positions are
          // pre-warmed, not just the 8 landmark locations.
          const STEPS = 20;
          const warmAt = (j: number) => {
            if (done) return;
            if (j >= STEPS) { start(); return; }
            aim(j / (STEPS - 1));
            setPreloadProgress(0.15 + 0.83 * (j / STEPS));
            idleWait(() => warmAt(j + 1), 280);
          };
          warmAt(0);

          // Animated route line: draws itself as the user scrolls.
          const routeCoords = LANDMARKS.map((l) => l.coordinates);
          map.addSource('route-line', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: [routeCoords[0]] },
              properties: {},
            },
          });
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-line',
            paint: {
              'line-color': '#ff7a3d',
              'line-width': 3,
              'line-opacity': 0.55,
              'line-blur': 1,
            },
          });
        }, 800);
      }, 600);

      const overallCap = window.setTimeout(start, 5000);
    });

    return () => {
      window.clearTimeout(0); // no-op, individual timeouts clear themselves
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
