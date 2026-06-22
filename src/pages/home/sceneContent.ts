import { DESTINATIONS } from '@/data/destinations';

export interface SceneContent {
  id: string;
  kicker: string;
  title: string;
  body: string;
  align: 'left' | 'right' | 'center';
  /** Slug of the destination featured in this scene, if any. */
  destinationSlug?: string;
  activities?: string[];
}

const find = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);

export const SCENE_CONTENT: SceneContent[] = [
  {
    id: 'arrival',
    kicker: 'Discover · Explore · Book',
    title: 'Explore Maharashtra\nLike Never Before',
    body: 'Fly through adventures. Begin above the clouds and descend into a living world of peaks, lakes and wild forests.',
    align: 'center',
  },
  {
    id: 'mountains',
    kicker: 'Scene 02 — Western Ghats',
    title: 'The Sahyadri Ranges',
    body: 'Banking over basalt cliffs and fort-crowned summits. Below you: a sea of cloud and a thousand trails waiting at dawn.',
    align: 'left',
    destinationSlug: 'sahyadri-ranges',
    activities: find('sahyadri-ranges')?.activities.map((a) => a.name),
  },
  {
    id: 'cloud-1',
    kicker: 'Scene 03',
    title: 'Into the Clouds',
    body: 'Visibility falls to nothing. The world dissolves into white as the next region forms ahead.',
    align: 'center',
  },
  {
    id: 'lake',
    kicker: 'Scene 04 — Maval Valley',
    title: 'Pawna Lake',
    body: 'The clouds open onto mirror-flat water ringed by ancient forts. Circle low over kayaks cutting silver lines through the dusk.',
    align: 'right',
    destinationSlug: 'pawna-lake',
    activities: find('pawna-lake')?.activities.map((a) => a.name),
  },
  {
    id: 'cloud-2',
    kicker: 'Scene 05',
    title: 'Through the Mist',
    body: 'Deeper, denser, darker. The light shifts golden as you climb through the second cloud bank.',
    align: 'center',
  },
  {
    id: 'forest',
    kicker: 'Scene 06 — Sahyadri Reserve',
    title: 'Bhimashankar Forest',
    body: 'God-rays pierce an ancient canopy. Glide low over old-growth green where the giant squirrel rules the treetops.',
    align: 'left',
    destinationSlug: 'bhimashankar-forest',
    activities: find('bhimashankar-forest')?.activities.map((a) => a.name),
  },
  {
    id: 'cliffs',
    kicker: 'Scene 07 — Malshej Range',
    title: 'Harishchandragad',
    body: 'A cinematic banking turn over the Konkan Kada — 1,800 feet of sheer concave cliff and nothing but air below.',
    align: 'right',
    destinationSlug: 'harishchandragad-cliffs',
    activities: find('harishchandragad-cliffs')?.activities.map((a) => a.name),
  },
  {
    id: 'landing',
    kicker: 'Scene 08',
    title: 'Start Your Adventure',
    body: 'The world settles. A glowing hub appears below. Step out of the sky and into the platform.',
    align: 'center',
  },
];
