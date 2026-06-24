// ---------------------------------------------------------------------------
// Domain model + seed data for Maharashtra adventure tourism.
//
// Drives the booking platform (explore grid, detail pages, booking flow) and the
// per-activity 3D scenes (each activity carries a `sceneType` that selects a
// bespoke React Three Fiber scene — see src/experience/activities).
// ---------------------------------------------------------------------------

export type ActivityCategory =
  | 'trekking'
  | 'camping'
  | 'water'
  | 'aerial'
  | 'climbing'
  | 'wildlife';

/** Selects the bespoke 3D scene rendered for an activity. */
export type ActivitySceneType =
  | 'trek'
  | 'sunrise'
  | 'camp'
  | 'kayak'
  | 'raft'
  | 'boat'
  | 'scuba'
  | 'zipline'
  | 'paraglide'
  | 'hotair'
  | 'climb'
  | 'rappel'
  | 'wildlife'
  | 'caving'
  | 'waterfall'
  | 'fortwalk'
  | 'cycle'
  | 'safari';

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  sceneType: ActivitySceneType;
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
  heroColor: string;
  elevation: number; // metres
  bestSeason: string;
  image: string;
  activities: Activity[];
  operators: Operator[];
}

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
    coordinates: [73.4053, 18.756],
    heroColor: '#5b7c8d',
    elevation: 1438,
    bestSeason: 'Jun – Feb',
    image: img('1506905925346-21bda4d32df4'),
    activities: [
      { id: 'sahyadri-trek', name: 'Kalsubai Summit Trek', category: 'trekking', sceneType: 'trek', durationHours: 8, difficulty: 'moderate', pricePerPerson: 1800, description: 'Trek to the highest peak in Maharashtra (1646m) for a sea of clouds at dawn.' },
      { id: 'sahyadri-camp', name: 'Ridge-line Camping', category: 'camping', sceneType: 'camp', durationHours: 18, difficulty: 'easy', pricePerPerson: 2500, description: 'Overnight under the Milky Way on a high basalt ridge with a sunrise trail.' },
      { id: 'sahyadri-sunrise', name: 'Sunrise Heritage Trail', category: 'trekking', sceneType: 'sunrise', durationHours: 4, difficulty: 'easy', pricePerPerson: 1200, description: 'A gentle pre-dawn trail to a Maratha fort with panoramic golden-hour views.' },
      { id: 'sahyadri-waterfall', name: 'Monsoon Waterfall Rappel', category: 'climbing', sceneType: 'rappel', durationHours: 5, difficulty: 'hard', pricePerPerson: 3000, description: 'Rappel down a thundering 120ft monsoon waterfall with full safety rigging.' },
      { id: 'sahyadri-night', name: 'Night Sky Stargazing Trek', category: 'camping', sceneType: 'camp', durationHours: 6, difficulty: 'easy', pricePerPerson: 1500, description: 'A guided night trek to a dark-sky ridge with telescopes and astro-photography.' },
      { id: 'sahyadri-fall', name: 'Devkund Waterfall Trek', category: 'trekking', sceneType: 'waterfall', durationHours: 6, difficulty: 'moderate', pricePerPerson: 1700, description: 'Trek through dense forest to a thundering plunge-pool waterfall for a swim.' },
      { id: 'sahyadri-fort', name: 'Maratha Fort Heritage Walk', category: 'trekking', sceneType: 'fortwalk', durationHours: 5, difficulty: 'easy', pricePerPerson: 1400, description: 'A guided walk through the ramparts and gates of a hill-top Maratha fort.' },
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
      { id: 'pawna-kayak', name: 'Sunset Kayaking', category: 'water', sceneType: 'kayak', durationHours: 2, difficulty: 'easy', pricePerPerson: 900, description: 'Paddle across glassy water as the forts turn amber at dusk.' },
      { id: 'pawna-raft', name: 'White-water Rafting', category: 'water', sceneType: 'raft', durationHours: 3, difficulty: 'moderate', pricePerPerson: 1600, description: 'Monsoon-fed rapids on the feeder rivers — grade II–III thrills.' },
      { id: 'pawna-boat', name: 'Heritage Boating', category: 'water', sceneType: 'boat', durationHours: 1.5, difficulty: 'easy', pricePerPerson: 700, description: 'A calm guided boat tour beneath the ramparts of Tung fort.' },
      { id: 'pawna-lakecamp', name: 'Lakeside Camping', category: 'camping', sceneType: 'camp', durationHours: 16, difficulty: 'easy', pricePerPerson: 2200, description: 'Tents on the shore, a bonfire, and the Lohagad fort mirrored in the water.' },
      { id: 'pawna-scuba', name: 'Reservoir Discovery Dive', category: 'water', sceneType: 'scuba', durationHours: 3, difficulty: 'moderate', pricePerPerson: 3500, description: 'A guided confined-water discovery dive for first-time divers.' },
      { id: 'pawna-cycle', name: 'Lakeside Cycling Tour', category: 'trekking', sceneType: 'cycle', durationHours: 3, difficulty: 'easy', pricePerPerson: 1100, description: 'Pedal the shoreline trails between forts on a guided mountain-bike loop.' },
      { id: 'pawna-fort', name: 'Tung Fort Sunset Walk', category: 'trekking', sceneType: 'fortwalk', durationHours: 4, difficulty: 'moderate', pricePerPerson: 1300, description: 'Climb the conical "Kathingad" fort for a 360° sunset over the reservoir.' },
    ],
    operators: [
      { id: 'op-lakeside', name: 'Lakeside Adventures', rating: 4.7, verified: true, since: 2016 },
      { id: 'op-bluewater', name: 'BlueWater Pawna', rating: 4.5, verified: true, since: 2018 },
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
      { id: 'bhima-zip', name: 'Canopy Zipline', category: 'aerial', sceneType: 'zipline', durationHours: 2, difficulty: 'moderate', pricePerPerson: 1400, description: 'Fly between forest platforms on a 600m zipline above the green.' },
      { id: 'bhima-hike', name: 'Reserve Forest Hike', category: 'trekking', sceneType: 'trek', durationHours: 5, difficulty: 'moderate', pricePerPerson: 1300, description: 'A guided naturalist hike through old-growth forest and stream crossings.' },
      { id: 'bhima-trail', name: 'Wildlife Nature Trail', category: 'wildlife', sceneType: 'wildlife', durationHours: 3, difficulty: 'easy', pricePerPerson: 1000, description: 'Track the giant squirrel and endemic birds with a forest guide.' },
      { id: 'bhima-cave', name: 'Ancient Cave Exploration', category: 'climbing', sceneType: 'caving', durationHours: 4, difficulty: 'moderate', pricePerPerson: 1800, description: 'Explore lantern-lit lava caves and rock-cut shrines deep in the reserve.' },
      { id: 'bhima-birding', name: 'Dawn Birding Safari', category: 'wildlife', sceneType: 'wildlife', durationHours: 4, difficulty: 'easy', pricePerPerson: 1200, description: 'A slow dawn walk for hornbills, malabar trogons and the giant squirrel.' },
      { id: 'bhima-jeep', name: 'Reserve Jeep Safari', category: 'wildlife', sceneType: 'safari', durationHours: 3, difficulty: 'easy', pricePerPerson: 2200, description: 'An open-jeep safari along forest tracks for elephants, gaur and deer.' },
      { id: 'bhima-fall', name: 'Hidden Waterfall Trail', category: 'trekking', sceneType: 'waterfall', durationHours: 4, difficulty: 'moderate', pricePerPerson: 1500, description: 'A monsoon trail to a secluded waterfall deep inside the reserve canopy.' },
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
      { id: 'hari-para', name: 'Cliff Paragliding', category: 'aerial', sceneType: 'paraglide', durationHours: 2, difficulty: 'hard', pricePerPerson: 4500, description: 'Tandem flight off the Konkan Kada with 1000m of air beneath you.' },
      { id: 'hari-climb', name: 'Rock Climbing Ascent', category: 'climbing', sceneType: 'climb', durationHours: 6, difficulty: 'extreme', pricePerPerson: 3800, description: 'Technical multi-pitch basalt climbing with certified mountain guides.' },
      { id: 'hari-extreme', name: 'Edge Rappelling', category: 'climbing', sceneType: 'rappel', durationHours: 4, difficulty: 'hard', pricePerPerson: 3200, description: 'Descend a sheer 200m face with full safety rigging and instruction.' },
      { id: 'hari-balloon', name: 'Sunrise Hot-Air Balloon', category: 'aerial', sceneType: 'hotair', durationHours: 2, difficulty: 'easy', pricePerPerson: 6500, description: 'Drift over the Malshej cliffs at first light in a hot-air balloon.' },
      { id: 'hari-trek', name: 'Konkan Kada Trek', category: 'trekking', sceneType: 'trek', durationHours: 9, difficulty: 'hard', pricePerPerson: 2400, description: 'A demanding trek to the lip of the great concave cliff for sunset.' },
      { id: 'hari-fort', name: 'Ancient Fort & Cave Walk', category: 'trekking', sceneType: 'fortwalk', durationHours: 5, difficulty: 'moderate', pricePerPerson: 1600, description: 'Explore the 6th-century fort, Kedareshwar cave and Saptatirtha tank.' },
    ],
    operators: [
      { id: 'op-vertical', name: 'Vertical Limits MH', rating: 4.8, verified: true, since: 2015 },
      { id: 'op-skyhigh', name: 'SkyHigh Paragliding', rating: 4.5, verified: false, since: 2019 },
    ],
  },
  {
    id: 'mahabaleshwar',
    slug: 'mahabaleshwar',
    name: 'Mahabaleshwar',
    region: 'Satara Highlands',
    scene: 5,
    tagline: 'Strawberry hills and emerald valleys',
    description:
      'The highest hill station in the Western Ghats — misty plateaus, valley ' +
      'viewpoints and strawberry farms, with adventure tucked into every ridge.',
    coordinates: [73.6578, 17.9243],
    heroColor: '#3f6f55',
    elevation: 1353,
    bestSeason: 'Oct – Jun',
    image: img('1469474968028-56623f02e42e'),
    activities: [
      { id: 'maha-para', name: 'Valley Paragliding', category: 'aerial', sceneType: 'paraglide', durationHours: 1.5, difficulty: 'moderate', pricePerPerson: 3800, description: 'Launch off a plateau edge and soar over the strawberry valleys.' },
      { id: 'maha-trek', name: 'Plateau Sunset Trek', category: 'trekking', sceneType: 'sunrise', durationHours: 4, difficulty: 'easy', pricePerPerson: 1100, description: 'Walk the table-top plateau to Arthur\'s Seat for a golden valley sunset.' },
      { id: 'maha-boat', name: 'Venna Lake Boating', category: 'water', sceneType: 'boat', durationHours: 1, difficulty: 'easy', pricePerPerson: 600, description: 'Pedal and row boats on the tranquil, tree-lined Venna Lake.' },
      { id: 'maha-zip', name: 'Forest Zipline Circuit', category: 'aerial', sceneType: 'zipline', durationHours: 2, difficulty: 'moderate', pricePerPerson: 1500, description: 'A multi-line zip circuit through the dense plateau forest.' },
      { id: 'maha-cycle', name: 'Strawberry Valley Cycling', category: 'trekking', sceneType: 'cycle', durationHours: 3, difficulty: 'easy', pricePerPerson: 1000, description: 'A gentle ride past strawberry farms and plateau viewpoints.' },
      { id: 'maha-fall', name: 'Lingmala Waterfall Trail', category: 'trekking', sceneType: 'waterfall', durationHours: 3, difficulty: 'easy', pricePerPerson: 900, description: 'A short forest trail to the 600ft Lingmala falls viewing decks.' },
    ],
    operators: [
      { id: 'op-ghatglide', name: 'GhatGlide', rating: 4.6, verified: true, since: 2016 },
    ],
  },
  {
    id: 'tarkarli',
    slug: 'tarkarli-coast',
    name: 'Tarkarli Coast',
    region: 'Konkan Coast',
    scene: 8,
    tagline: 'Turquoise water and white-sand calm',
    description:
      'Maharashtra\'s clearest water on the Konkan coast — scuba reefs, dolphin ' +
      'boats and palm-lined sand where the Karli river meets the Arabian Sea.',
    coordinates: [73.4796, 16.0],
    heroColor: '#1f7fa0',
    elevation: 4,
    bestSeason: 'Nov – May',
    image: img('1507525428034-b723cf961d3e'),
    activities: [
      { id: 'tark-scuba', name: 'Coral Reef Scuba Dive', category: 'water', sceneType: 'scuba', durationHours: 3, difficulty: 'moderate', pricePerPerson: 4200, description: 'Dive vibrant nearshore reefs with PADI-certified dive masters.' },
      { id: 'tark-kayak', name: 'Backwater Kayaking', category: 'water', sceneType: 'kayak', durationHours: 2, difficulty: 'easy', pricePerPerson: 1000, description: 'Paddle the calm Karli backwaters through mangrove channels.' },
      { id: 'tark-boat', name: 'Dolphin Spotting Boat', category: 'water', sceneType: 'boat', durationHours: 2, difficulty: 'easy', pricePerPerson: 1200, description: 'A morning boat trip to spot wild dolphins off the Tarkarli shore.' },
      { id: 'tark-camp', name: 'Beach Bonfire Camping', category: 'camping', sceneType: 'camp', durationHours: 14, difficulty: 'easy', pricePerPerson: 2000, description: 'Beachfront tents, a bonfire and a sky full of stars by the sea.' },
      { id: 'tark-fort', name: 'Sindhudurg Sea-Fort Tour', category: 'trekking', sceneType: 'fortwalk', durationHours: 3, difficulty: 'easy', pricePerPerson: 1300, description: 'Boat across to Shivaji\'s island sea-fort and walk its ramparts.' },
      { id: 'tark-cycle', name: 'Coastal Village Cycling', category: 'trekking', sceneType: 'cycle', durationHours: 2.5, difficulty: 'easy', pricePerPerson: 950, description: 'Ride palm-lined lanes between fishing villages and quiet beaches.' },
    ],
    operators: [
      { id: 'op-deepblue', name: 'DeepBlue Tarkarli', rating: 4.7, verified: true, since: 2015 },
      { id: 'op-konkan', name: 'Konkan Coast Co.', rating: 4.4, verified: true, since: 2019 },
    ],
  },
];

export const ALL_ACTIVITIES: (Activity & { destination: Destination })[] =
  DESTINATIONS.flatMap((d) => d.activities.map((a) => ({ ...a, destination: d })));

export function getDestinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export function getActivity(slug: string, activityId: string) {
  const dest = getDestinationBySlug(slug);
  const activity = dest?.activities.find((a) => a.id === activityId);
  return { dest, activity };
}

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  trekking: 'Trekking',
  camping: 'Camping',
  water: 'Water Sports',
  aerial: 'Aerial',
  climbing: 'Climbing',
  wildlife: 'Wildlife',
};

// A representative photo per activity scene type. Reuses Unsplash IDs (broken
// ones fall back to a CSS gradient via onError in the UI). Keeps each activity
// visually distinct without hand-tagging all 50+ entries.
const SCENE_PHOTO: Record<ActivitySceneType, string> = {
  trek: '1551632811-561732d1e306',
  sunrise: '1469474968028-56623f02e42e',
  camp: '1504280390367-361c6d9f38f4',
  kayak: '1545158539-1c1c0c0c0c0c',
  raft: '1530866495561-507c9faab2ed',
  boat: '1507525428034-b723cf961d3e',
  scuba: '1544551763-46a013bb70d5',
  zipline: '1448375240586-882707db888b',
  paraglide: '1605540436563-5bca919ae766',
  hotair: '1507608616759-54f48f0af0ee',
  climb: '1522163182402-834f871fd851',
  rappel: '1551632811-561732d1e306',
  wildlife: '1474511320723-9a56873867b5',
  caving: '1520962880247-cfaf541c8724',
  waterfall: '1432405972618-c60b0225b8f9',
  fortwalk: '1506905925346-21bda4d32df4',
  cycle: '1485965120184-e220f721d03e',
  safari: '1516426122078-c23e76319801',
};

/** Photo URL for an activity, sized for thumbnails by default. */
export function activityImage(sceneType: ActivitySceneType, w = 800): string {
  return `https://images.unsplash.com/photo-${SCENE_PHOTO[sceneType]}?auto=format&fit=crop&w=${w}&q=80`;
}

/** A flat, de-duplicated showcase list: one card per scene type with a sample. */
export const ACTIVITY_SHOWCASE = (() => {
  const seen = new Set<ActivitySceneType>();
  const out: { activity: Activity; destination: Destination }[] = [];
  for (const d of DESTINATIONS) {
    for (const a of d.activities) {
      if (seen.has(a.sceneType)) continue;
      seen.add(a.sceneType);
      out.push({ activity: a, destination: d });
    }
  }
  return out;
})();
