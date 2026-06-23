import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARKS, altitudeAt, routePointAt } from './mapRoute';

const token = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * The homepage hero: a 3D satellite Mapbox map that the user flies across as
 * they scroll. The camera tracks the landmark route south → north, descending in
 * altitude (flying "down" toward the terrain) and looking ahead. All map
 * interactions are disabled so the page scroll drives the flight; a smoothed RAF
 * loop eases the camera toward the scroll target to keep motion buttery.
 */
export function MapboxFlight() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setReady = useScrollStore((s) => s.setReady);

  useEffect(() => {
    if (!token || !ref.current) {
      setReady(true); // don't trap the loader if the map can't load
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: ref.current,
      // Custom Mapbox Studio satellite style (account: vikdev).
      style: 'mapbox://styles/vikdev/cmlo8l453002c01qu7avs7rf3',
      center: routePointAt(0),
      zoom: 11,
      pitch: 70,
      bearing: 0,
      // The empty custom style defaults to the globe projection; the scroll
      // fly-through (free-camera) is designed for a flat mercator world.
      projection: { name: 'mercator' },
      interactive: false, // page scroll drives the flight, not the map
      attributionControl: false,
      antialias: true,
      // Keep a big tile cache so the whole route's satellite tiles, once warmed
      // up at load, stay resident and the flight has no streaming lag.
      maxTileCacheSize: 2000,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    let raf = 0;
    let eased = 0;

    // Safety net: never trap the cloud-intro loader if the style stalls or errors
    // (bad token, network, missing style). Reveal the page anyway after 6s.
    const readyFallback = window.setTimeout(() => setReady(true), 6000);
    map.on('error', (e) => {
      // eslint-disable-next-line no-console
      console.error('[MapboxFlight]', e?.error?.message ?? e);
      setReady(true);
    });

    map.on('style.load', () => {
      window.clearTimeout(readyFallback);
      map.resize();

      // Satellite imagery. The custom Studio style is currently empty (no sources
      // or layers), so we inject Mapbox's raster satellite source + layer here to
      // guarantee a real satellite map renders. If the style later defines its own
      // imagery, this just sits beneath it.
      if (!map.getSource('satellite')) {
        // Dark earth fallback so any not-yet-loaded area reads as a night map
        // rather than showing the pale page background through the canvas.
        map.addLayer({ id: 'bg', type: 'background', paint: { 'background-color': '#0e2038' } });
        map.addSource('satellite', {
          type: 'raster',
          url: 'mapbox://mapbox.satellite',
          tileSize: 256,
        });
        map.addLayer({ id: 'satellite', type: 'raster', source: 'satellite' });
      }

      // 3D terrain (skip if the custom style already provides a DEM source).
      if (!map.getSource('dem')) {
        map.addSource('dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        });
      }
      map.setTerrain({ source: 'dem', exaggeration: 1.6 });

      // Light atmospheric haze — kept far out so the satellite terrain stays
      // crisp and visible rather than being washed flat-white.
      map.setFog({
        range: [3, 18],
        color: 'rgba(214, 228, 242, 0.35)',
        'high-color': '#9cc4ee',
        'horizon-blend': 0.12,
        'space-color': '#0a1430',
        'star-intensity': 0.05,
      });

      // Landmark markers
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

      // Aim the camera so the LANDMARK at fraction f is centred in view. The
      // camera sits a fixed *metric* distance behind the target (derived from the
      // local route bearing) at the current altitude, giving a steady ~56°
      // downward pitch regardless of how long each route segment is. Looking AT
      // the active place (rather than ahead of it) is what makes each section line
      // up with the exact spot on the map.
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
        const D = alt * 1.5; // back-offset → ~56° pitch
        const camLngLat: [number, number] = [
          target[0] - (dx * D) / (111320 * cosLat),
          target[1] - (dy * D) / 110540,
        ];
        const cam = map.getFreeCameraOptions();
        cam.position = mapboxgl.MercatorCoordinate.fromLngLat(camLngLat, alt);
        cam.lookAtPoint(target);
        map.setFreeCameraOptions(cam);
      };

      // Only re-aim when the eased progress actually moves. Pushing free-camera
      // options every frame (even when settled) makes mapbox-gl re-evaluate and
      // ABORT in-flight tiles, so imagery never resolves.
      let applied = -1;
      const tick = () => {
        const targetP = useScrollStore.getState().progress;
        eased += (targetP - eased) * 0.14;
        if (Math.abs(targetP - eased) < 0.0003) eased = targetP;
        if (Math.abs(eased - applied) > 0.00004) {
          applied = eased;
          aim(eased);
        }
        raf = requestAnimationFrame(tick);
      };

      // Pre-warm a low-zoom OVERVIEW of the whole region first. Those few coarse
      // tiles become the parent tiles under every flight position, so the map is
      // always covered by (at worst) a blurry satellite parent that sharpens as
      // detail streams — never a transparent/blank gap. Flying high (altitudeAt)
      // also keeps each view's tile count low so detail arrives fast, and
      // maxTileCacheSize keeps everything resident once seen.
      map.jumpTo({ center: [73.7, 18.4], zoom: 6.3, pitch: 0, bearing: 0 });

      const reveal = () => {
        setReady(true);
        aim(0);
        applied = -1;
        raf = requestAnimationFrame(tick);
      };
      const cap = window.setTimeout(reveal, 3000);
      map.once('idle', () => {
        window.clearTimeout(cap);
        reveal();
      });
    });

    return () => {
      window.clearTimeout(readyFallback);
      cancelAnimationFrame(raf);
      map.remove();
    };
  }, [navigate, setReady]);

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
