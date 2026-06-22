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

      setReady(true);

      // Only re-aim the camera when the eased progress actually moves. Pushing
      // free-camera options every single frame (even when settled) makes
      // mapbox-gl continuously re-evaluate and ABORT in-flight satellite tiles,
      // so the imagery never finishes loading and the map looks blank. Snapping
      // when close + skipping no-op updates lets the tiles load once you stop.
      let applied = -1;
      const tick = () => {
        const target = useScrollStore.getState().progress;
        eased += (target - eased) * 0.1;
        if (Math.abs(target - eased) < 0.0003) eased = target;

        if (Math.abs(eased - applied) > 0.00004) {
          applied = eased;
          const ground = routePointAt(eased);
          const alt = altitudeAt(eased);
          // Scale the look-ahead with altitude so the camera holds a ~55-60°
          // downward pitch instead of staring at the horizon. This keeps the
          // satellite terrain filling the frame AND keeps the visible area small
          // enough that its tiles actually finish loading (a horizon-ward pitch
          // needs hundreds of tiles and never resolves → blank map).
          const lookFrac = Math.min(0.014, Math.max(0.004, alt / 350000));
          const look = routePointAt(Math.min(1, eased + lookFrac));

          const cam = map.getFreeCameraOptions();
          cam.position = mapboxgl.MercatorCoordinate.fromLngLat(ground, alt);
          cam.lookAtPoint(look);
          map.setFreeCameraOptions(cam);
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
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
