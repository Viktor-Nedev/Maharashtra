import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DESTINATIONS } from '@/data/destinations';

const token = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Mapbox world map of Maharashtra with a marker per destination. Renders a
 * graceful static fallback when no token is configured, so the platform never
 * breaks in demo mode. (Three.js owns the cinematic flight; Mapbox owns the
 * real-world geography — the two layers are intentionally separate.)
 */
export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !ref.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [73.6, 18.9],
      zoom: 7.2,
      pitch: 55,
      bearing: -10,
      antialias: true,
    });

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      map.setFog({ color: 'rgb(186,210,235)', 'high-color': 'rgb(36,92,223)', 'horizon-blend': 0.1 });
    });

    DESTINATIONS.forEach((d) => {
      const el = document.createElement('button');
      el.className = 'map-marker';
      el.title = d.name;
      el.addEventListener('click', () => navigate(`/destination/${d.slug}`));
      new mapboxgl.Marker(el)
        .setLngLat(d.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 24 }).setHTML(`<strong>${d.name}</strong><br/>${d.region}`))
        .addTo(map);
    });

    return () => map.remove();
  }, [navigate]);

  if (!token) {
    return (
      <div className="worldmap worldmap--fallback">
        <div>
          <h3>Maharashtra · World Map</h3>
          <p>Add a <code>VITE_MAPBOX_TOKEN</code> to load the interactive 3D terrain map.</p>
          <ul>
            {DESTINATIONS.map((d) => (
              <li key={d.id}>
                <strong>{d.name}</strong> — {d.region} · {d.coordinates[1].toFixed(2)}°N
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return <div className="worldmap" ref={ref} />;
}
