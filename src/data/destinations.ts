// ---------------------------------------------------------------------------
// Domain model + seed data for Maharashtra adventure tourism.
// ---------------------------------------------------------------------------

export type ActivityCategory =
  | 'trekking'
  | 'camping'
  | 'water'
  | 'aerial'
  | 'climbing'
  | 'wildlife';

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

export interface ActivityReview {
  author: string;
  rating: number;
  text: string;
}

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  sceneType: ActivitySceneType;
  durationHours: number;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  pricePerPerson: number; // INR
  description: string;
  coordinates?: [number, number]; // [lng, lat]
  image?: string;
  reviews?: ActivityReview[];
  /** Hour-by-hour schedule for the experience. Falls back to a generated one. */
  itinerary?: string[];
  /** What the price includes. Falls back to a category default. */
  included?: string[];
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
  scene: number;
  tagline: string;
  description: string;
  coordinates: [number, number];
  heroColor: string;
  elevation: number;
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
      {
        id: 'sahyadri-trek',
        name: 'Kalsubai Summit Trek',
        category: 'trekking',
        sceneType: 'trek',
        durationHours: 8,
        difficulty: 'moderate',
        pricePerPerson: 1800,
        description: 'Trek to the highest peak in Maharashtra (1646m) for a sea of clouds at dawn.',
        coordinates: [73.6946, 19.6019],
        reviews: [
          { author: 'Aarav S.', rating: 5, text: 'Phenomenal sunrise at the summit — clouds below us for miles!' },
          { author: 'Priya M.', rating: 5, text: 'The guides were excellent and the trail is well-marked.' },
          { author: 'Daniel R.', rating: 4, text: 'Tough ascent but absolutely worth it. Bring layers.' },
        ],
      },
      {
        id: 'sahyadri-camp',
        name: 'Ridge-line Camping',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 18,
        difficulty: 'easy',
        pricePerPerson: 2500,
        description: 'Overnight under the Milky Way on a high basalt ridge with a sunrise trail.',
        coordinates: [73.4781, 18.7106],
        reviews: [
          { author: 'Sneha P.', rating: 5, text: 'Woke up to absolute magic. Stars like I have never seen.' },
          { author: 'Kiran V.', rating: 5, text: 'Campfire, chai and the Sahyadri horizon — perfect.' },
        ],
      },
      {
        id: 'sahyadri-sunrise',
        name: 'Sinhagad Sunrise Trail',
        category: 'trekking',
        sceneType: 'sunrise',
        durationHours: 4,
        difficulty: 'easy',
        pricePerPerson: 1200,
        description: 'A gentle pre-dawn trail to the legendary Sinhagad fort for panoramic golden-hour views.',
        coordinates: [73.7554, 18.3663],
        reviews: [
          { author: 'Meera K.', rating: 5, text: 'Sunrise over the clouds was unreal. Worth every rupee.' },
          { author: 'Rohan B.', rating: 4, text: 'Great for beginners. The fort itself has fascinating history.' },
        ],
      },
      {
        id: 'sahyadri-waterfall',
        name: 'Monsoon Waterfall Rappel',
        category: 'climbing',
        sceneType: 'rappel',
        durationHours: 5,
        difficulty: 'hard',
        pricePerPerson: 3000,
        description: 'Rappel down a thundering 120ft monsoon waterfall with full safety rigging.',
        coordinates: [73.48, 18.6],
        reviews: [
          { author: 'Vikram N.', rating: 5, text: 'An absolute adrenaline rush. Totally safe with expert guides.' },
          { author: 'Aditi S.', rating: 5, text: 'The power of the waterfall is incredible. Go in July!' },
        ],
      },
      {
        id: 'sahyadri-night',
        name: 'Night Sky Stargazing Trek',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 6,
        difficulty: 'easy',
        pricePerPerson: 1500,
        description: 'A guided night trek to a dark-sky ridge with telescopes and astro-photography.',
        coordinates: [73.4053, 18.756],
        reviews: [
          { author: 'Ananya R.', rating: 5, text: 'The Milky Way was visible with the naked eye. Stunning.' },
          { author: 'Siddharth L.', rating: 4, text: 'Excellent guide explained constellations the whole time.' },
        ],
      },
      {
        id: 'sahyadri-fall',
        name: 'Devkund Waterfall Trek',
        category: 'trekking',
        sceneType: 'waterfall',
        durationHours: 6,
        difficulty: 'moderate',
        pricePerPerson: 1700,
        description: 'Trek through dense forest to a thundering plunge-pool waterfall for a swim.',
        coordinates: [73.45, 18.55],
        reviews: [
          { author: 'Rhea D.', rating: 5, text: 'The most pristine waterfall I have seen. Crystal clear pool!' },
          { author: 'Arjun K.', rating: 5, text: 'Worth every step of the trek. Take waterproof shoes.' },
        ],
      },
      {
        id: 'sahyadri-fort',
        name: 'Lohagad Fort Heritage Walk',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 5,
        difficulty: 'easy',
        pricePerPerson: 1400,
        description: 'Walk through the imposing gates and battlements of Lohagad, the "Iron Fort".',
        coordinates: [73.4781, 18.7106],
        reviews: [
          { author: 'Nisha T.', rating: 5, text: 'The history is incredible — Shivaji captured this fort twice!' },
          { author: 'Sam P.', rating: 4, text: 'Easy walk with great views over Pawna Lake from the top.' },
        ],
      },
      {
        id: 'sahyadri-rajmachi',
        name: 'Rajmachi Fort Expedition',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 7,
        difficulty: 'moderate',
        pricePerPerson: 2000,
        description: 'Trek to the twin-peak Rajmachi fort, with views of Sahyadri valleys and monsoon clouds.',
        coordinates: [73.39, 18.829],
        reviews: [
          { author: 'Tanvi G.', rating: 5, text: 'Remote and atmospheric — felt like stepping back in time.' },
          { author: 'Jay M.', rating: 5, text: 'Less crowded than Lohagad and equally stunning.' },
        ],
      },
      {
        id: 'sahyadri-torna',
        name: 'Torna Fort Conquest',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 8,
        difficulty: 'hard',
        pricePerPerson: 2200,
        description: 'Scale Prachandagad — the first fort captured by the young Shivaji Maharaj in 1643.',
        coordinates: [73.618, 18.276],
        reviews: [
          { author: 'Vivek A.', rating: 5, text: 'One of the best treks in Sahyadri. Views are unmatched.' },
          { author: 'Pooja N.', rating: 4, text: 'Hard climb but you feel like royalty at the top.' },
        ],
      },
      {
        id: 'sahyadri-sandhan',
        name: 'Sandhan Valley Canyon Trek',
        category: 'trekking',
        sceneType: 'caving',
        durationHours: 9,
        difficulty: 'hard',
        pricePerPerson: 3200,
        description: 'Descend the "Valley of Shadow" — a slot canyon with rappels and water crossings.',
        coordinates: [73.78, 19.542],
        reviews: [
          { author: 'Omkar R.', rating: 5, text: 'India\'s Grand Canyon did not disappoint. Epic adventure!' },
          { author: 'Shruti B.', rating: 5, text: 'Technically challenging and visually stunning. A must-do.' },
        ],
      },
      {
        id: 'sahyadri-malshej',
        name: 'Malshej Ghat Monsoon Camp',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 20,
        difficulty: 'easy',
        pricePerPerson: 2800,
        description: 'Camp in the heart of Malshej Ghat during monsoon — waterfalls on every cliff face.',
        coordinates: [73.8167, 19.2833],
        reviews: [
          { author: 'Kavya S.', rating: 5, text: 'Waterfalls literally everywhere. The most magical place.' },
          { author: 'Dev P.', rating: 4, text: 'Flamingos at dawn made it extra special.' },
        ],
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
        sceneType: 'kayak',
        durationHours: 2,
        difficulty: 'easy',
        pricePerPerson: 900,
        description: 'Paddle across glassy water as the forts turn amber at dusk.',
        coordinates: [73.471, 18.681],
        reviews: [
          { author: 'Ishita R.', rating: 5, text: 'The golden hour on the lake is absolutely magical.' },
          { author: 'Nikhil S.', rating: 5, text: 'Perfect for beginners. Guides were patient and helpful.' },
        ],
      },
      {
        id: 'pawna-raft',
        name: 'White-water Rafting',
        category: 'water',
        sceneType: 'raft',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 1600,
        description: 'Monsoon-fed rapids on the Kundalika river — grade II–III thrills at Kolad.',
        coordinates: [73.27, 18.41],
        reviews: [
          { author: 'Rahul G.', rating: 5, text: 'Perfect rapids — exciting but safe. Best 3 hours ever.' },
          { author: 'Anika P.', rating: 4, text: 'Kolad river is fantastic. Go in monsoon for the best flow.' },
        ],
      },
      {
        id: 'pawna-boat',
        name: 'Heritage Boating',
        category: 'water',
        sceneType: 'boat',
        durationHours: 1.5,
        difficulty: 'easy',
        pricePerPerson: 700,
        description: 'A calm guided boat tour beneath the ramparts of Tung fort.',
        coordinates: [73.471, 18.681],
        reviews: [
          { author: 'Leela T.', rating: 5, text: 'So peaceful. The fort reflections in the water were beautiful.' },
          { author: 'Harsh V.', rating: 4, text: 'Great way to see the forts from the water.' },
        ],
      },
      {
        id: 'pawna-lakecamp',
        name: 'Lakeside Camping',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 16,
        difficulty: 'easy',
        pricePerPerson: 2200,
        description: 'Tents on the shore, a bonfire, and the Lohagad fort mirrored in the water.',
        coordinates: [73.471, 18.681],
        reviews: [
          { author: 'Swati M.', rating: 5, text: 'The bonfire with Lohagad in the background — movie magic.' },
          { author: 'Kunal J.', rating: 5, text: 'Woke up to mist on the lake. Nothing better in the world.' },
        ],
      },
      {
        id: 'pawna-scuba',
        name: 'Reservoir Discovery Dive',
        category: 'water',
        sceneType: 'scuba',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 3500,
        description: 'A guided confined-water discovery dive for first-time divers in the reservoir.',
        coordinates: [73.471, 18.681],
        reviews: [
          { author: 'Mansi D.', rating: 4, text: 'First time diving and I was not scared at all — great guides.' },
          { author: 'Yash A.', rating: 4, text: 'Visibility is decent. Interesting freshwater experience.' },
        ],
      },
      {
        id: 'pawna-cycle',
        name: 'Lakeside Cycling Tour',
        category: 'trekking',
        sceneType: 'cycle',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 1100,
        description: 'Pedal the shoreline trails between forts on a guided mountain-bike loop.',
        coordinates: [73.471, 18.681],
        reviews: [
          { author: 'Trisha K.', rating: 5, text: 'Perfect trail, perfect views, great bikes. Loved every minute.' },
          { author: 'Rohan S.', rating: 4, text: 'Excellent route with easy terrain and great fort sightings.' },
        ],
      },
      {
        id: 'pawna-fort',
        name: 'Tikona Fort Sunset Walk',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 4,
        difficulty: 'moderate',
        pricePerPerson: 1300,
        description: 'Climb the conical Tikona fort for a 360° sunset over the reservoir.',
        coordinates: [73.475, 18.64],
        reviews: [
          { author: 'Deepa N.', rating: 5, text: 'Tikona from the lake is stunning — the triangle fort shape.' },
          { author: 'Aman V.', rating: 5, text: 'Sunset view from the top is one of a kind.' },
        ],
      },
      {
        id: 'pawna-bhandardara',
        name: 'Bhandardara Lake Escape',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 20,
        difficulty: 'easy',
        pricePerPerson: 2600,
        description: 'Camp beside Arthur Lake at Bhandardara — waterfalls cascade into the reservoir.',
        coordinates: [73.75, 19.5333],
        reviews: [
          { author: 'Pooja R.', rating: 5, text: 'Bhandardara is paradise — the Umbrella Falls nearby are stunning.' },
          { author: 'Saurabh M.', rating: 5, text: 'Best camping spot in Maharashtra, hands down.' },
        ],
      },
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
      {
        id: 'bhima-zip',
        name: 'Canopy Zipline',
        category: 'aerial',
        sceneType: 'zipline',
        durationHours: 2,
        difficulty: 'moderate',
        pricePerPerson: 1400,
        description: 'Fly between forest platforms on a 600m zipline above the green canopy.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Neha S.', rating: 5, text: 'Flying over the forest canopy was surreal. Best in class.' },
          { author: 'Kartik P.', rating: 5, text: 'Exhilarating! The forest below is so dense and beautiful.' },
        ],
      },
      {
        id: 'bhima-hike',
        name: 'Reserve Forest Hike',
        category: 'trekking',
        sceneType: 'trek',
        durationHours: 5,
        difficulty: 'moderate',
        pricePerPerson: 1300,
        description: 'A guided naturalist hike through old-growth forest and stream crossings.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Gauri L.', rating: 5, text: 'The giant squirrel sighting made my year. Wonderful guide!' },
          { author: 'Arun M.', rating: 4, text: 'Dense forest, cool temperatures, and fantastic flora.' },
        ],
      },
      {
        id: 'bhima-trail',
        name: 'Wildlife Nature Trail',
        category: 'wildlife',
        sceneType: 'wildlife',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 1000,
        description: 'Track the giant squirrel and endemic birds with a trained forest guide.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Priti K.', rating: 5, text: 'Spotted the giant squirrel and a hornbill in one walk!' },
          { author: 'Suresh N.', rating: 4, text: 'Very peaceful and educational. Great for families.' },
        ],
      },
      {
        id: 'bhima-cave',
        name: 'Ancient Cave Exploration',
        category: 'climbing',
        sceneType: 'caving',
        durationHours: 4,
        difficulty: 'moderate',
        pricePerPerson: 1800,
        description: 'Explore lantern-lit lava caves and rock-cut shrines deep in the reserve.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Ashish D.', rating: 5, text: 'The cave shrines are ancient and atmospheric. Incredible experience.' },
          { author: 'Rekha S.', rating: 4, text: 'Fascinating geology and history combined.' },
        ],
      },
      {
        id: 'bhima-birding',
        name: 'Karnala Bird Sanctuary Dawn Walk',
        category: 'wildlife',
        sceneType: 'wildlife',
        durationHours: 4,
        difficulty: 'easy',
        pricePerPerson: 1200,
        description: 'A slow dawn walk at Karnala for hornbills, malabar trogons and over 200 bird species.',
        coordinates: [73.116, 18.892],
        reviews: [
          { author: 'Sunita R.', rating: 5, text: 'Ticked off 30 species in one morning! Paradise for birders.' },
          { author: 'Bharat V.', rating: 5, text: 'The Karnala fort in the background adds a dramatic touch.' },
        ],
      },
      {
        id: 'bhima-jeep',
        name: 'Reserve Jeep Safari',
        category: 'wildlife',
        sceneType: 'safari',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 2200,
        description: 'An open-jeep safari along forest tracks looking for leopard, gaur and deer.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Rajesh P.', rating: 4, text: 'Spotted gaur and barking deer. Jeep was comfortable.' },
          { author: 'Maya B.', rating: 5, text: 'Exhilarating drive through the forest. Excellent naturalist guide.' },
        ],
      },
      {
        id: 'bhima-fall',
        name: 'Hidden Waterfall Trail',
        category: 'trekking',
        sceneType: 'waterfall',
        durationHours: 4,
        difficulty: 'moderate',
        pricePerPerson: 1500,
        description: 'A monsoon trail to a secluded waterfall deep inside the reserve canopy.',
        coordinates: [73.5363, 19.0728],
        reviews: [
          { author: 'Divya K.', rating: 5, text: 'The hidden waterfall is absolutely pristine and worth every step.' },
          { author: 'Aditya N.', rating: 4, text: 'Remote and beautiful. The forest path is half the fun.' },
        ],
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
        name: 'Konkan Kada Cliff Paragliding',
        category: 'aerial',
        sceneType: 'paraglide',
        durationHours: 2,
        difficulty: 'hard',
        pricePerPerson: 4500,
        description: 'Tandem flight off the Konkan Kada with 1,800ft of air beneath you.',
        coordinates: [73.775, 19.3867],
        reviews: [
          { author: 'Vikrant S.', rating: 5, text: 'The most incredible experience of my life. Absolutely breathtaking.' },
          { author: 'Pallavi R.', rating: 5, text: 'Launching off that cliff edge — nothing prepares you for it.' },
          { author: 'Harsh G.', rating: 5, text: 'Pilot was fantastic. I never felt unsafe for a second.' },
        ],
      },
      {
        id: 'hari-climb',
        name: 'Rock Climbing Ascent',
        category: 'climbing',
        sceneType: 'climb',
        durationHours: 6,
        difficulty: 'extreme',
        pricePerPerson: 3800,
        description: 'Technical multi-pitch basalt climbing with certified mountain guides.',
        coordinates: [73.775, 19.3867],
        reviews: [
          { author: 'Sameer K.', rating: 5, text: 'Serious climbing on world-class basalt. A dream route.' },
          { author: 'Neetha P.', rating: 4, text: 'Challenging but the guides are top-notch. Very safe.' },
        ],
      },
      {
        id: 'hari-extreme',
        name: 'Edge Rappelling',
        category: 'climbing',
        sceneType: 'rappel',
        durationHours: 4,
        difficulty: 'hard',
        pricePerPerson: 3200,
        description: 'Descend a sheer 200m face with full safety rigging and expert instruction.',
        coordinates: [73.775, 19.3867],
        reviews: [
          { author: 'Pradeep V.', rating: 5, text: 'Terrifying in the best possible way. Views on descent are insane.' },
          { author: 'Sneha A.', rating: 5, text: 'Heart pounding the whole time. Totally recommended for thrill-seekers.' },
        ],
      },
      {
        id: 'hari-balloon',
        name: 'Sunrise Hot-Air Balloon',
        category: 'aerial',
        sceneType: 'hotair',
        durationHours: 2,
        difficulty: 'easy',
        pricePerPerson: 6500,
        description: 'Drift over the Malshej cliffs at first light in a luxury hot-air balloon.',
        coordinates: [73.562, 18.758],
        reviews: [
          { author: 'Riya M.', rating: 5, text: 'Words cannot describe the sunrise from the balloon. Magical.' },
          { author: 'Sunil B.', rating: 5, text: 'Worth every rupee. Champagne landing was a beautiful touch.' },
        ],
      },
      {
        id: 'hari-trek',
        name: 'Konkan Kada Trek',
        category: 'trekking',
        sceneType: 'trek',
        durationHours: 9,
        difficulty: 'hard',
        pricePerPerson: 2400,
        description: 'A demanding trek to the lip of the great concave cliff for a sunset to remember.',
        coordinates: [73.775, 19.3867],
        reviews: [
          { author: 'Chirag S.', rating: 5, text: 'Standing at the edge of Konkan Kada is life-changing.' },
          { author: 'Vaibhavi N.', rating: 4, text: 'Hard work but the payoff is unlike anywhere else in India.' },
        ],
      },
      {
        id: 'hari-fort',
        name: 'Ancient Fort & Cave Walk',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 5,
        difficulty: 'moderate',
        pricePerPerson: 1600,
        description: 'Explore the 6th-century fort, Kedareshwar cave and Saptatirtha tank.',
        coordinates: [73.775, 19.3867],
        reviews: [
          { author: 'Lalitha K.', rating: 5, text: 'Kedareshwar cave is spellbinding. The linga in water is ancient.' },
          { author: 'Mihail P.', rating: 4, text: 'Fascinating history and beautiful views on the way up.' },
        ],
      },
      {
        id: 'hari-kamshet',
        name: 'Kamshet Paragliding Hub',
        category: 'aerial',
        sceneType: 'paraglide',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 3500,
        description: 'India\'s paragliding capital — tandem flights and a training school at Kamshet.',
        coordinates: [73.562, 18.758],
        reviews: [
          { author: 'Arnav R.', rating: 5, text: 'Kamshet is perfect for first-timers and pros alike. Great thermals.' },
          { author: 'Nandini S.', rating: 5, text: 'Multiple flights in one day! The team is exceptional.' },
        ],
      },
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
      {
        id: 'maha-para',
        name: 'Panchgani Valley Paragliding',
        category: 'aerial',
        sceneType: 'paraglide',
        durationHours: 1.5,
        difficulty: 'moderate',
        pricePerPerson: 3800,
        description: 'Launch off Panchgani\'s Table Land and soar over the Krishna Valley.',
        coordinates: [73.801, 17.924],
        reviews: [
          { author: 'Shraddha M.', rating: 5, text: 'Panchgani from above is breathtaking. Table Land looks alien!' },
          { author: 'Aditya L.', rating: 5, text: 'Smooth flight, friendly pilot, incredible views. 10/10.' },
        ],
      },
      {
        id: 'maha-trek',
        name: 'Plateau Sunset Trek',
        category: 'trekking',
        sceneType: 'sunrise',
        durationHours: 4,
        difficulty: 'easy',
        pricePerPerson: 1100,
        description: 'Walk the table-top plateau to Arthur\'s Seat for a golden valley sunset.',
        coordinates: [73.6578, 17.9243],
        reviews: [
          { author: 'Preeti V.', rating: 5, text: 'Arthur\'s Seat at sunset is one of my top Maharashtra memories.' },
          { author: 'Roshan K.', rating: 4, text: 'Easy, beautiful walk. Great for families and couples.' },
        ],
      },
      {
        id: 'maha-boat',
        name: 'Venna Lake Boating',
        category: 'water',
        sceneType: 'boat',
        durationHours: 1,
        difficulty: 'easy',
        pricePerPerson: 600,
        description: 'Pedal and row boats on the tranquil, tree-lined Venna Lake.',
        coordinates: [73.6578, 17.9243],
        reviews: [
          { author: 'Geeta S.', rating: 4, text: 'Lovely lake setting, perfect for a calm afternoon.' },
          { author: 'Karan P.', rating: 4, text: 'Peaceful and scenic. Great for kids.' },
        ],
      },
      {
        id: 'maha-zip',
        name: 'Forest Zipline Circuit',
        category: 'aerial',
        sceneType: 'zipline',
        durationHours: 2,
        difficulty: 'moderate',
        pricePerPerson: 1500,
        description: 'A multi-line zip circuit through the dense plateau forest.',
        coordinates: [73.6578, 17.9243],
        reviews: [
          { author: 'Vishal R.', rating: 5, text: 'Flying through the treetops with valley views — pure joy.' },
          { author: 'Tanya M.', rating: 4, text: 'Well-maintained equipment. Great fun for the whole group.' },
        ],
      },
      {
        id: 'maha-cycle',
        name: 'Strawberry Valley Cycling',
        category: 'trekking',
        sceneType: 'cycle',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 1000,
        description: 'A gentle ride past strawberry farms and plateau viewpoints.',
        coordinates: [73.6578, 17.9243],
        reviews: [
          { author: 'Anjali K.', rating: 5, text: 'Strawberry picking along the way was a fun bonus!' },
          { author: 'Sanjay N.', rating: 4, text: 'Flat roads, great scenery, fresh strawberries. Perfect day.' },
        ],
      },
      {
        id: 'maha-fall',
        name: 'Lingmala Waterfall Trail',
        category: 'trekking',
        sceneType: 'waterfall',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 900,
        description: 'A short forest trail to the 600ft Lingmala falls viewing decks.',
        coordinates: [73.6578, 17.9243],
        reviews: [
          { author: 'Hema R.', rating: 5, text: 'The view of Lingmala from the deck is spectacular in monsoon.' },
          { author: 'Vikash P.', rating: 4, text: 'Easy walk, beautiful falls. Go in July for maximum impact.' },
        ],
      },
      {
        id: 'maha-panchgani',
        name: 'Panchgani Table Land Camp',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 18,
        difficulty: 'easy',
        pricePerPerson: 2400,
        description: 'Camp on Asia\'s second-largest plateau with 360° valley views at dawn.',
        coordinates: [73.799, 17.924],
        reviews: [
          { author: 'Swara M.', rating: 5, text: 'Camping on the plateau with the Deccan below — unforgettable.' },
          { author: 'Tejas B.', rating: 5, text: 'The Table Land sunrise made everyone emotional. Worth every moment.' },
        ],
      },
      {
        id: 'maha-lonavala',
        name: 'Lonavala Waterfall & Cave Trek',
        category: 'trekking',
        sceneType: 'waterfall',
        durationHours: 6,
        difficulty: 'moderate',
        pricePerPerson: 1600,
        description: 'Trek the lush hills above Lonavala to monsoon waterfalls and Karla Caves.',
        coordinates: [73.406, 18.754],
        reviews: [
          { author: 'Mihir S.', rating: 5, text: 'Lonavala is magical in monsoon — green everywhere, waterfalls everywhere.' },
          { author: 'Radhika P.', rating: 4, text: 'The Karla Caves add great history to the adventure.' },
        ],
      },
      {
        id: 'maha-matheran',
        name: 'Matheran Heritage Trail',
        category: 'trekking',
        sceneType: 'trek',
        durationHours: 5,
        difficulty: 'easy',
        pricePerPerson: 1300,
        description: 'Walk the car-free hill station of Matheran and its famous lookout points.',
        coordinates: [73.271, 18.988],
        reviews: [
          { author: 'Leena V.', rating: 5, text: 'Matheran without cars is so peaceful. The toy train is a bonus!' },
          { author: 'Omkar G.', rating: 4, text: 'Great walking trails and multiple viewpoints. Very serene.' },
        ],
      },
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
      {
        id: 'tark-scuba',
        name: 'Coral Reef Scuba Dive',
        category: 'water',
        sceneType: 'scuba',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 4200,
        description: 'Dive vibrant nearshore reefs with PADI-certified dive masters.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Kavita R.', rating: 5, text: 'Saw three species of parrotfish in one dive! Crystal clear water.' },
          { author: 'Subhash P.', rating: 5, text: 'Best diving in Maharashtra by far. Excellent instructors.' },
          { author: 'Emma W.', rating: 4, text: 'Beautiful reefs and warm water. Great visibility in Nov–Feb.' },
        ],
      },
      {
        id: 'tark-kayak',
        name: 'Backwater Kayaking',
        category: 'water',
        sceneType: 'kayak',
        durationHours: 2,
        difficulty: 'easy',
        pricePerPerson: 1000,
        description: 'Paddle the calm Karli backwaters through mangrove channels.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Smita K.', rating: 5, text: 'The mangroves are magical. So quiet and green.' },
          { author: 'Darius N.', rating: 4, text: 'Perfect for beginners. The backwater channels are beautiful.' },
        ],
      },
      {
        id: 'tark-boat',
        name: 'Dolphin Spotting Boat',
        category: 'water',
        sceneType: 'boat',
        durationHours: 2,
        difficulty: 'easy',
        pricePerPerson: 1200,
        description: 'A morning boat trip to spot wild dolphins off the Tarkarli shore.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Anisha B.', rating: 5, text: 'A pod of dolphins swam alongside the boat. Kids were ecstatic!' },
          { author: 'Ram D.', rating: 5, text: 'Guarantee dolphin sightings in season. Never disappoints.' },
        ],
      },
      {
        id: 'tark-camp',
        name: 'Beach Bonfire Camping',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 14,
        difficulty: 'easy',
        pricePerPerson: 2000,
        description: 'Beachfront tents, a bonfire and a sky full of stars by the Arabian Sea.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Maithili R.', rating: 5, text: 'Falling asleep to waves and waking up to a sunrise. Pure bliss.' },
          { author: 'Aniket S.', rating: 5, text: 'The bonfire on the beach was perfect for our group trip.' },
        ],
      },
      {
        id: 'tark-fort',
        name: 'Sindhudurg Sea-Fort Tour',
        category: 'trekking',
        sceneType: 'fortwalk',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 1300,
        description: 'Boat across to Shivaji\'s island sea-fort and walk its ancient ramparts.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Padma V.', rating: 5, text: 'Sindhudurg is a masterpiece of Maratha engineering. Stunning.' },
          { author: 'Naveen K.', rating: 4, text: 'Very photogenic fort. The boat ride is part of the fun.' },
        ],
      },
      {
        id: 'tark-cycle',
        name: 'Coastal Village Cycling',
        category: 'trekking',
        sceneType: 'cycle',
        durationHours: 2.5,
        difficulty: 'easy',
        pricePerPerson: 950,
        description: 'Ride palm-lined lanes between Malvan fishing villages and quiet beaches.',
        coordinates: [73.4833, 16.0333],
        reviews: [
          { author: 'Swapna R.', rating: 4, text: 'The coastal roads are gorgeous. Fish market stop was a highlight.' },
          { author: 'Farida M.', rating: 4, text: 'Charming villages, fresh sea breeze. Loved it.' },
        ],
      },
      {
        id: 'tark-kolad',
        name: 'Kolad River Rafting',
        category: 'water',
        sceneType: 'raft',
        durationHours: 3,
        difficulty: 'moderate',
        pricePerPerson: 1800,
        description: 'White-water rafting on the Kundalika river at Kolad — Maharashtra\'s top rafting spot.',
        coordinates: [73.27, 18.41],
        reviews: [
          { author: 'Rohan V.', rating: 5, text: 'Kolad is the best rafting in Maharashtra. Rapid after rapid!' },
          { author: 'Akshata M.', rating: 5, text: 'Grade III rapids that get your heart pumping. Safety is top-notch.' },
        ],
      },
      {
        id: 'tark-alibaug',
        name: 'Alibaug Sea Sports',
        category: 'water',
        sceneType: 'kayak',
        durationHours: 3,
        difficulty: 'easy',
        pricePerPerson: 2200,
        description: 'Jet ski, banana boat, parasailing and water sports near Mumbai at Alibaug beach.',
        coordinates: [72.8722, 18.6414],
        reviews: [
          { author: 'Nidhi P.', rating: 5, text: 'Perfect weekend from Mumbai. Jet skiing was a blast!' },
          { author: 'Sachin R.', rating: 4, text: 'Great variety of water sports, very well organized.' },
        ],
      },
      {
        id: 'tark-diveagar',
        name: 'Diveagar Beach Retreat',
        category: 'camping',
        sceneType: 'camp',
        durationHours: 16,
        difficulty: 'easy',
        pricePerPerson: 2100,
        description: 'Unspoilt Konkan beach camping at Diveagar — clean sands, coconut groves.',
        coordinates: [72.991, 18.176],
        reviews: [
          { author: 'Leena S.', rating: 5, text: 'Diveagar is a hidden gem. Far fewer tourists than Alibaug.' },
          { author: 'Pratik N.', rating: 5, text: 'Pristine beach, beautiful sunset, excellent seafood nearby.' },
        ],
      },
      {
        id: 'tark-mandwa',
        name: 'Mandwa Beach Water Sports',
        category: 'water',
        sceneType: 'boat',
        durationHours: 2.5,
        difficulty: 'easy',
        pricePerPerson: 1700,
        description: 'Water sports and beach fun at Mandwa — a quick ferry from Mumbai\'s Gateway.',
        coordinates: [72.882, 18.795],
        reviews: [
          { author: 'Naina B.', rating: 4, text: 'So convenient from Mumbai. Ferry + beach in half a day!' },
          { author: 'Tarun K.', rating: 4, text: 'Great for a quick escape. Water is clean and activities varied.' },
        ],
      },
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

export function activityImage(sceneType: ActivitySceneType, w = 800): string {
  return `https://images.unsplash.com/photo-${SCENE_PHOTO[sceneType]}?auto=format&fit=crop&w=${w}&q=80`;
}

// --- Listing itinerary + inclusions ----------------------------------------
// Every adventure listing must show an itinerary. Where an activity doesn't
// define a bespoke one, we synthesise a believable schedule from its category
// and duration so the listing is always complete.

const CATEGORY_ITINERARY: Record<ActivityCategory, string[]> = {
  trekking: [
    'Meet the operator team at the trailhead — safety briefing & gear check',
    'Begin the guided ascent through forest and ridgeline sections',
    'Summit / viewpoint break — photos, snacks and local stories',
    'Descent with the guide and transfer back to the base point',
  ],
  camping: [
    'Check-in at the campsite — pitch tents and settle in',
    'Sunset trail and nature walk with the host',
    'Bonfire, dinner and stargazing under the open sky',
    'Sunrise, breakfast and pack-up before departure',
  ],
  water: [
    'Arrival, life-jacket fitting and on-water safety briefing',
    'Guided session on the water with your instructor',
    'Free time to paddle / swim / shoot photos',
    'Return to shore, debrief and refreshments',
  ],
  aerial: [
    'Reporting, weather check and equipment briefing',
    'Ground training and harness / safety setup with the pilot',
    'The main flight — soak in the aerial views',
    'Touchdown, photos and certificate handover',
  ],
  climbing: [
    'Meet the certified guide — knots, belay and safety briefing',
    'Warm-up and technique session on the rock',
    'The main climb / rappel with full top-rope safety',
    'Wind-down, debrief and transfer back',
  ],
  wildlife: [
    'Early reporting at the reserve gate with the naturalist',
    'Guided safari / forest trail to prime sighting spots',
    'Quiet observation and photography of wildlife & birds',
    'Return drive and conservation talk',
  ],
};

const CATEGORY_INCLUDED: Record<ActivityCategory, string[]> = {
  trekking: ['Certified local guide', 'Safety gear', 'Trail permits', 'Light snacks & water'],
  camping: ['Tent & sleeping gear', 'Campfire & dinner', 'Breakfast', 'Host & safety crew'],
  water: ['All equipment & life jackets', 'Certified instructor', 'Safety kayak/boat support'],
  aerial: ['Trained pilot/instructor', 'All flight gear', 'Insurance', 'Photos/video'],
  climbing: ['Certified guide', 'Ropes, harness & helmet', 'Belay & safety setup'],
  wildlife: ['Expert naturalist', 'Park entry & permits', 'Safari transport'],
};

/** Itinerary for a listing — its own, or a category-based default. */
export function activityItinerary(activity: Activity): string[] {
  if (activity.itinerary && activity.itinerary.length > 0) return activity.itinerary;
  const base = CATEGORY_ITINERARY[activity.category];
  // For longer experiences, hint at the extended duration.
  if (activity.durationHours >= 12) {
    return [base[0], ...base.slice(1, -1), 'Overnight stay with the operator', base[base.length - 1]];
  }
  return base;
}

/** What's included for a listing — its own, or a category-based default. */
export function activityIncluded(activity: Activity): string[] {
  return activity.included && activity.included.length > 0
    ? activity.included
    : CATEGORY_INCLUDED[activity.category];
}

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
