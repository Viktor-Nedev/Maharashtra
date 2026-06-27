import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Activity, Destination } from '@/data/destinations';

// Cohesive sunset-and-coast palette: the signature orange leads, with warm and
// cool accents that all read clearly on the dark surface and take dark text when
// used as a solid fill (chips, badges, pins).
export const CATEGORY_COLORS: Record<string, string> = {
  trekking: '#ff7a3d', // signature orange
  camping: '#f6a821',  // amber
  water: '#2bb3d6',    // lagoon teal
  aerial: '#9b7bf0',   // twilight violet
  climbing: '#f0506e', // coral red
  wildlife: '#3fb96b', // forest green
};

export interface ActivityWithDest extends Activity {
  destination: Destination;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// Per-category pin artwork (public/markers). Note: category "water" → water_sport.png.
const MARKER_ICONS: Record<string, string> = {
  trekking: '/markers/trekking.png',
  camping: '/markers/camping.png',
  water: '/markers/water_sport.png',
  aerial: '/markers/aerial.png',
  climbing: '/markers/climbing.png',
  wildlife: '/markers/wildlife.png',
};

interface Props {
  activities: ActivityWithDest[];
  onSelect: (activity: ActivityWithDest) => void;
  className?: string;
}

export function ActivityMap({ activities, onSelect, className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Without a token, mapbox-gl throws on construction — bail out and let the
    // pin list / fallback render instead.
    if (!mapRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

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
    // Wheel/trackpad zoom enabled so users can zoom in/out on the map.
    map.scrollZoom.enable();

    const markers: mapboxgl.Marker[] = [];

    map.on('load', () => {
      if (withCoords.length > 1 && !bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 80, maxZoom: 11, duration: 1200 });
      }

      withCoords.forEach((activity) => {
        const icon = MARKER_ICONS[activity.category] || MARKER_ICONS.trekking;

        const el = document.createElement('button');
        el.className = 'activity-pin activity-pin--img';
        el.setAttribute('aria-label', activity.name);
        el.setAttribute('type', 'button');
        el.innerHTML = `
          <img class="activity-pin__img" src="${icon}" alt="" draggable="false" />
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

  // Graceful fallback: a clickable list of activities when there's no map token.
  if (!MAPBOX_TOKEN) {
    const withCoords = activities.filter((a) => a.coordinates);
    return (
      <div className={`activity-map activity-map--fallback ${className}`}>
        <div className="activity-map__fallback-inner">
          <p className="activity-map__fallback-hint">Pick an experience to explore</p>
          <div className="activity-map__fallback-list">
            {withCoords.map((a) => (
              <button
                key={`${a.destination.slug}-${a.id}`}
                type="button"
                className="activity-map__fallback-pin"
                onClick={() => onSelect(a)}
              >
                <span
                  className="activity-map__fallback-dot"
                  style={{ background: CATEGORY_COLORS[a.category] || '#ff7a3d' }}
                />
                {a.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={`activity-map ${className}`} />;
}
