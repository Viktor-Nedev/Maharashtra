// ---------------------------------------------------------------------------
// The Maharashtra flight route for the homepage Mapbox fly-through.
//
// As the user scrolls, the Mapbox camera flies south → north along these real
// landmarks, descending in altitude (flying "down" toward the terrain) while a
// 3D airplane (PlaneOverlay) banks in front of it. Each landmark doubles as a
// homepage "scene" with overlay copy.
// ---------------------------------------------------------------------------

export interface Landmark {
  id: string;
  name: string;
  region: string;
  /** [lng, lat] */
  coordinates: [number, number];
  kicker: string;
  body: string;
  align: 'left' | 'right' | 'center';
  /** Links the scene to a bookable destination, if any. */
  destinationSlug?: string;
  /** Photos (served from /public) shown alongside the scene copy. */
  images?: string[];
}

// Ordered roughly south → north for a smooth northward sweep.
export const LANDMARKS: Landmark[] = [
  {
    id: 'tarkarli',
    name: 'Tarkarli Coast',
    region: 'Konkan Coast',
    coordinates: [73.4796, 16.0],
    kicker: 'Discover · Explore · Book',
    body: 'Begin high above the Arabian Sea, then dive down into a living satellite world. Scroll to fly north across Maharashtra.',
    align: 'center',
    destinationSlug: 'tarkarli-coast',
    images: ['/Tarkarli-coast.jpg'],
  },
  {
    id: 'mahabaleshwar',
    name: 'Mahabaleshwar',
    region: 'Satara Highlands',
    coordinates: [73.6578, 17.9243],
    kicker: 'Landmark 02',
    body: 'The highest hill station in the Western Ghats — misty plateaus and emerald valleys roll beneath the wing.',
    align: 'left',
    destinationSlug: 'mahabaleshwar',
    images: ['/Mahabaleshwar.jpg', '/Mahabaleshwar2.jpg'],
  },
  {
    id: 'pawna',
    name: 'Pawna Lake',
    region: 'Maval Valley',
    coordinates: [73.4805, 18.6499],
    kicker: 'Landmark 03',
    body: 'Bank low over mirror-flat water ringed by ancient forts. Kayaks cut silver lines through the dusk below.',
    align: 'right',
    destinationSlug: 'pawna-lake',
    images: ['/PawnaLake.avif', '/PawnaLake2.jpg'],
  },
  {
    id: 'sahyadri',
    name: 'Sahyadri Ranges',
    region: 'Western Ghats',
    coordinates: [73.4053, 18.756],
    kicker: 'Landmark 04',
    body: 'The spine of the Ghats — basalt cliffs and fort-crowned summits beneath a sea of monsoon cloud.',
    align: 'left',
    destinationSlug: 'sahyadri-ranges',
    images: ['/SahyadriRanges.jpg', '/SahyadriRanges2.jpg'],
  },
  {
    id: 'mumbai',
    name: 'Gateway of India',
    region: 'Mumbai',
    coordinates: [72.8347, 18.922],
    kicker: 'Landmark 05',
    body: 'A westward jog over the city by the sea — the arch where land meets the Arabian Sea.',
    align: 'center',
    images: ['/GatewayofIndia.webp', '/Gateway-to-India.jpg'],
  },
  {
    id: 'bhimashankar',
    name: 'Bhimashankar Forest',
    region: 'Sahyadri Reserve',
    coordinates: [73.5363, 19.0728],
    kicker: 'Landmark 06',
    body: 'Glide low over an ancient evergreen canopy where god-rays pierce the mist.',
    align: 'left',
    destinationSlug: 'bhimashankar-forest',
    images: ['/BhimashankarForest.jpg', '/BhimashankarForest2.jpg'],
  },
  {
    id: 'harishchandragad',
    name: 'Harishchandragad',
    region: 'Malshej Range',
    coordinates: [73.7792, 19.3866],
    kicker: 'Landmark 07',
    body: 'A cinematic banking turn over the Konkan Kada — 1,800 feet of sheer concave cliff.',
    align: 'right',
    destinationSlug: 'harishchandragad-cliffs',
    images: ['/Harishchandra.jpg'],
  },
  {
    id: 'shirdi',
    name: 'Start Your Adventure',
    region: 'Shirdi · Journey\'s end',
    coordinates: [74.4762, 19.7669],
    kicker: 'Touch down',
    body: 'The plane settles toward the plains. Step out of the sky and into the platform.',
    align: 'center',
    images: ['/header_maharashta.jpg'],
  },
];

export const LANDMARK_COUNT = LANDMARKS.length;

const ROUTE: [number, number][] = LANDMARKS.map((l) => l.coordinates);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Point on the route at fraction t (0..1), interpolated by LANDMARK INDEX (not
 * arc length). This is deliberate: each homepage section is one viewport tall, so
 * section i is centred at scroll progress t = i/(N-1). Mapping by index means the
 * camera is exactly over landmark i when section i is centred — the place on the
 * map always matches the active section. (Arc-length mapping drifted the two
 * apart because landmarks aren't evenly spaced.)
 */
export function routePointAt(t: number): [number, number] {
  const scaled = Math.max(0, Math.min(1, t)) * (ROUTE.length - 1);
  const i = Math.floor(scaled);
  if (i >= ROUTE.length - 1) return ROUTE[ROUTE.length - 1];
  const f = scaled - i;
  return [lerp(ROUTE[i][0], ROUTE[i + 1][0], f), lerp(ROUTE[i][1], ROUTE[i + 1][1], f)];
}

/** Camera altitude in metres at fraction t — descends from high to low. */
export function altitudeAt(t: number): number {
  const HIGH = 7000;
  const LOW = 4200;
  // Ease so the descent accelerates toward the landing.
  const e = Math.pow(Math.max(0, Math.min(1, t)), 1.25);
  return lerp(HIGH, LOW, e);
}

/** Fractional landmark index (floor = active, frac = blend to next). */
export function landmarkAt(t: number): { index: number; frac: number } {
  const scaled = Math.max(0, Math.min(0.99999, t)) * (LANDMARK_COUNT - 1);
  const index = Math.floor(scaled);
  return { index, frac: scaled - index };
}
