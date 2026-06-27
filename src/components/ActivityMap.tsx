import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Activity, Destination } from '@/data/destinations';

export const CATEGORY_COLORS: Record<string, string> = {
  trekking: '#ff7a3d',
  camping: '#f5a623',
  water: '#5e7bff',
  aerial: '#a78bfa',
  climbing: '#ef4444',
  wildlife: '#22c55e',
};

export interface ActivityWithDest extends Activity {
  destination: Destination;
}

interface Props {
  activities: ActivityWithDest[];
  onSelect: (activity: ActivityWithDest) => void;
  className?: string;
}

export function ActivityMap({ activities, onSelect, className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    mapboxgl.accessToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) || '';

    const withCoords = activities.filter((a) => a.coordinates);

    const bounds = new mapboxgl.LngLatBounds();
    withCoords.forEach((a) => {
      if (a.coordinates) bounds.extend(a.coordinates as [number, number]);
    });

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: withCoords.length > 0 ? withCoords[0].coordinates! : [73.5, 18.5],
      zoom: 8,
      pitch: 40,
      bearing: -10,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.scrollZoom.disable();

    const markers: mapboxgl.Marker[] = [];

    map.on('load', () => {
      if (withCoords.length > 1 && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 1200 });
      }

      withCoords.forEach((activity) => {
        const color = CATEGORY_COLORS[activity.category] || '#ff7a3d';

        const el = document.createElement('button');
        el.className = 'activity-pin';
        el.setAttribute('aria-label', activity.name);
        el.setAttribute('type', 'button');
        el.innerHTML = `
          <span class="activity-pin__dot" style="background:${color};box-shadow:0 0 0 3px ${color}40"></span>
          <span class="activity-pin__label">${activity.name}</span>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelect(activity);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(activity.coordinates as [number, number])
          .addTo(map);

        markers.push(marker);
      });
    });

    return () => {
      markers.forEach((m) => m.remove());
      map.remove();
    };
  }, [activities, onSelect]);

  return <div ref={mapRef} className={`activity-map ${className}`} />;
}
