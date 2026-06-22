// ---------------------------------------------------------------------------
// Domain model + seed data for Maharashtra adventure tourism.
//
// This data drives BOTH the cinematic homepage (each scene maps to a region)
// AND the booking platform (explore grid, detail pages, booking flow).
// When Supabase is configured the platform reads from the DB; otherwise it
// falls back to this seed data so the project demos with zero config.
// ---------------------------------------------------------------------------

export type ActivityCategory =
  | 'trekking'
  | 'camping'
  | 'water'
  | 'aerial'
  | 'climbing'
  | 'wildlife';

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  durationHours: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  pricePerPerson: number; // INR
  description: string;
}

export interface Operator {
  id: string;
  name: string;
  rating: number;
  verified: boolean;
  since: number;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  /** Which cinematic scene introduces this destination (1-based). */
  scene: number;
  tagline: string;
  description: string;
  /** Lng/Lat for the Mapbox world map. */
  coordinates: [number, number];
  heroColor: string; // dominant atmospheric tint for the scene
  elevation: number; // metres
  bestSeason: string;
  image: string;
  activities: Activity[];
  operators: Operator[];
}

// Stable, royalty-free Unsplash imagery (Maharashtra landscapes).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1400&q=80`;

export const DESTINATIONS: Destination[] = [
  {
    id: 'sahyadri',
    slug: 'sahyadri-ranges',
    name: 'Sahyadri Ranges',
    region: 'Western Ghats',
    scene: 2,
    tagline: 'Where the clouds break over ancient peaks',
    description:
      'The spine of the Western Ghats. Basalt cliffs, fort-crowned summits and ' +
      'monsoon waterfalls make the Sahyadris the beating heart of Maharashtra trekking.',
    coordinates: [73.6783, 18.6298],
    heroColor: '#5b7c8d',
    elevation: 1438,
    bestSeason: 'Jun – Feb',
    image: img('1506905925346-21bda4d32df4'),
    activities: [
      {
        id: 'sahyadri-trek',
        name: 'Kalsubai Summit Trek',
        category: 'trekking',
        durationHours: 8,
        difficulty: 'moderate',
        pricePerPerson: 1800,
        description: 'Trek to the highest peak in Maharashtra (1646m) for a sea of clouds at dawn.',
      },
      {
        id: 'sahyadri-camp',
        name: 'Ridge-line Camping',
        category: 'camping',
        durationHours: 18,
        difficulty: 'easy',
        pricePerPerson: 2500,
        description: 'Overnight under the Milky Way on a high basalt ridge with a sunrise trail.',
      },
      {
        id: 'sahyadri-sunrise',
        name: 'Sunrise Heritage Trail',
        category: 'trekking',
        durationHours: 4,
        difficulty: 'easy',
        pricePerPerson: 1200,
        description: 'A gentle pre-dawn trail to a Maratha fort with panoramic golden-hour views.',
      },
    ],
    operators: [
      { id: 'op-trekmh', name: 'TrekMaharashtra Collective', rating: 4.8, verified: true, since: 2014 },
      { id: 'op-summit', name: 'Summit Sahyadri', rating: 4.6, verified: true, since: 2017 },
    ],
  },
  {
    id: 'pawna',
    slug: 'pawna-lake',
    name: 'Pawna Lake',
    region: 'Maval Valley',
    scene: 4,
    tagline: 'Still water beneath fortress skies',
    description:
      'A serene reservoir ringed by forts and rolling hills. By day, kayaks cut ' +
      'mirror-flat water; by night, lakeside camps glow against the Lohagad silhouette.',
    coordinates: [73.4805, 18.6499],
    heroColor: '#2e6f7e',
    elevation: 610,
    bestSeason: 'Oct – Mar',
    image: img('1544551763-46a013bb70d5'),
    activities: [
      {
        id: 'pawna-kayak',
        name: 'Sunset Kayaking',
        category: 'water',
        durationHours: 2,
        difficulty: 'easy',
        pricePerPerson: 900,
        description: 'Paddle across glassy water as the forts turn amber at dusk.',
      },
      {
        id: 'pawna-raft',
        name: 'White-water Rafting',
        category: 'water',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 1600,
        description: 'Monsoon-fed rapids on the feeder rivers — grade II–III thrills.',
      },
      {
        id: 'pawna-boat',
        name: 'Heritage Boating',
        category: 'water',
        durationHours: 1.5,
        difficulty: 'easy',
        pricePerPerson: 700,
        description: 'A calm guided boat tour beneath the ramparts of Tung fort.',
      },
    ],
    operators: [
      { id: 'op-lakeside', name: 'Lakeside Adventures', rating: 4.7, verified: true, since: 2016 },
    ],
  },
  {
    id: 'bhimashankar',
    slug: 'bhimashankar-forest',
    name: 'Bhimashankar Forest',
    region: 'Sahyadri Reserve',
    scene: 6,
    tagline: 'Light through an ancient canopy',
    description:
      'A protected evergreen reserve where god-rays pierce the mist and the rare ' +
      'Indian giant squirrel rules the canopy. Maharashtra at its wildest and greenest.',
    coordinates: [73.5363, 19.0728],
    heroColor: '#2f5d3a',
    elevation: 1034,
    bestSeason: 'Aug – Jan',
    image: img('1448375240586-882707db888b'),
    activities: [
      {
        id: 'bhima-zip',
        name: 'Canopy Zipline',
        category: 'aerial',
        durationHours: 2,
        difficulty: 'moderate',
        pricePerPerson: 1400,
        description: 'Fly between forest platforms on a 600m zipline above the green.',
      },
      {
        id: 'bhima-hike',
        name: 'Reserve Forest Hike',
        category: 'trekking',
        durationHours: 5,
        difficulty: 'moderate',
        pricePerPerson: 1300,
        description: 'A guided naturalist hike through old-growth forest and stream crossings.',
      },
      {
        id: 'bhima-trail',
        name: 'Wildlife Nature Trail',
        category: 'wildlife',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 1000,
        description: 'Track the giant squirrel and endemic birds with a forest guide.',
      },
    ],
    operators: [
      { id: 'op-wildtrails', name: 'WildTrails Bhimashankar', rating: 4.9, verified: true, since: 2012 },
    ],
  },
  {
    id: 'harishchandragad',
    slug: 'harishchandragad-cliffs',
    name: 'Harishchandragad',
    region: 'Malshej Range',
    scene: 7,
    tagline: 'The edge of the world: Konkan Kada',
    description:
      'Home to the legendary Konkan Kada — a 1,800ft concave cliff that swallows ' +
      'the horizon. The ultimate stage for paragliding, climbing and extreme ascents.',
    coordinates: [73.7792, 19.3866],
    heroColor: '#7a5a8d',
    elevation: 1424,
    bestSeason: 'Oct – Feb',
    image: img('1551632811-561732d1e306'),
    activities: [
      {
        id: 'hari-para',
        name: 'Cliff Paragliding',
        category: 'aerial',
        durationHours: 2,
        difficulty: 'hard',
        pricePerPerson: 4500,
        description: 'Tandem flight off the Konkan Kada with 1000m of air beneath you.',
      },
      {
        id: 'hari-climb',
        name: 'Rock Climbing Ascent',
        category: 'climbing',
        durationHours: 6,
        difficulty: 'extreme',
        pricePerPerson: 3800,
        description: 'Technical multi-pitch basalt climbing with certified mountain guides.',
      },
      {
        id: 'hari-extreme',
        name: 'Edge Rappelling',
        category: 'climbing',
        durationHours: 4,
        difficulty: 'hard',
        pricePerPerson: 3200,
        description: 'Descend a sheer 200m face with full safety rigging and instruction.',
      },
    ],
    operators: [
      { id: 'op-vertical', name: 'Vertical Limits MH', rating: 4.8, verified: true, since: 2015 },
      { id: 'op-skyhigh', name: 'SkyHigh Paragliding', rating: 4.5, verified: false, since: 2019 },
    ],
  },
];

export const ALL_ACTIVITIES: (Activity & { destination: Destination })[] =
  DESTINATIONS.flatMap((d) => d.activities.map((a) => ({ ...a, destination: d })));

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  trekking: 'Trekking',
  camping: 'Camping',
  water: 'Water Sports',
  aerial: 'Aerial',
  climbing: 'Climbing',
  wildlife: 'Wildlife',
};
