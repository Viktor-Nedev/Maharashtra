import * as THREE from 'three';

// ---------------------------------------------------------------------------
// The flight path + scene script.
//
// `FLIGHT_CURVE` is the 3D spline the airplane travels along as the user
// scrolls. The camera follows just behind it (see Rig). Each SCENE defines the
// atmosphere (sky/fog colour, fog density, light intensity, terrain biome) that
// the renderer cross-fades between based on scroll progress.
// ---------------------------------------------------------------------------

export type Biome = 'sky' | 'mountains' | 'transition' | 'lake' | 'forest' | 'cliffs' | 'landing';

export interface SceneDef {
  id: string;
  title: string;
  /** Biome rendered on the ground for this scene. */
  biome: Biome;
  /** Sky / background colour. */
  sky: string;
  /** Fog colour (usually close to sky for seamless horizons). */
  fog: string;
  /** Fog density multiplier — high during cloud transitions. */
  fogDensity: number;
  /** Sun / key light intensity. */
  light: number;
  /** Sun colour. */
  lightColor: string;
}

// 8 scenes from the brief. Colours form a dawn → day → golden → dusk arc.
export const SCENES: SceneDef[] = [
  { id: 'arrival',     title: 'Arrival',            biome: 'sky',        sky: '#aecadf', fog: '#cfe0ee', fogDensity: 0.9, light: 1.1, lightColor: '#fff4e0' },
  { id: 'mountains',   title: 'Mountain Region',    biome: 'mountains',  sky: '#8fb1c7', fog: '#b9cfdd', fogDensity: 0.5, light: 1.3, lightColor: '#fff1d6' },
  { id: 'cloud-1',     title: 'Into the Clouds',    biome: 'transition', sky: '#dfe9f1', fog: '#eef4f9', fogDensity: 2.2, light: 1.0, lightColor: '#ffffff' },
  { id: 'lake',        title: 'Lake Region',        biome: 'lake',       sky: '#5e93a8', fog: '#9bc1cf', fogDensity: 0.55, light: 1.35, lightColor: '#fff0cf' },
  { id: 'cloud-2',     title: 'Through the Mist',   biome: 'transition', sky: '#c9d8e2', fog: '#dce8ef', fogDensity: 2.6, light: 0.9, lightColor: '#ffe9d0' },
  { id: 'forest',      title: 'Forest Adventure',   biome: 'forest',     sky: '#4f6f55', fog: '#7fa37f', fogDensity: 0.7, light: 1.25, lightColor: '#fdf0c8' },
  { id: 'cliffs',      title: 'Extreme Adventure',  biome: 'cliffs',     sky: '#6a5a82', fog: '#9a86b0', fogDensity: 0.6, light: 1.2, lightColor: '#ffd9b0' },
  { id: 'landing',     title: 'Final Landing',      biome: 'landing',    sky: '#2b3a63', fog: '#46568a', fogDensity: 0.8, light: 1.0, lightColor: '#ffc98f' },
];

export const SCENE_COUNT = SCENES.length;

// Control points for the airplane spline. X = lateral sweep, Y = altitude,
// Z = forward travel (negative = into the screen). The plane descends overall
// (high above the clouds → low for landing) while weaving side to side so the
// camera always has a dynamic 3/4 view of the terrain below.
// Altitude trends steadily DOWNWARD (32 → 1) so the plane is always flying
// down toward the world, ending in a pronounced landing dive.
const CONTROL_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(0, 32, 10),     // arrival — high above clouds
  new THREE.Vector3(-14, 25, -40),  // bank toward mountains, nosing down
  new THREE.Vector3(10, 22, -90),   // mountain ridge pass
  new THREE.Vector3(0, 22, -140),   // glide through cloud bank
  new THREE.Vector3(-8, 16, -190),  // descend over the lake
  new THREE.Vector3(12, 16, -240),  // circle the lake
  new THREE.Vector3(0, 17, -290),   // second cloud bank
  new THREE.Vector3(-10, 11, -340), // glide low over forest
  new THREE.Vector3(8, 12, -390),   // approach the cliffs
  new THREE.Vector3(-6, 13, -440),  // cinematic banking turn at the cliffs
  new THREE.Vector3(2, 6, -495),    // nose down — begin the dive
  new THREE.Vector3(0, 1.0, -545),  // landing approach
];

export const FLIGHT_CURVE = new THREE.CatmullRomCurve3(
  CONTROL_POINTS,
  false,
  'catmullrom',
  0.5,
);

/** Sample the flight position at progress t (0..1). */
export function flightPosition(t: number, target = new THREE.Vector3()): THREE.Vector3 {
  return FLIGHT_CURVE.getPointAt(THREE.MathUtils.clamp(t, 0, 1), target);
}

/** Sample the forward tangent at progress t — used to orient the plane. */
export function flightTangent(t: number, target = new THREE.Vector3()): THREE.Vector3 {
  return FLIGHT_CURVE.getTangentAt(THREE.MathUtils.clamp(t, 0, 1), target);
}

/**
 * Map global progress (0..1) to a fractional scene index, so callers can both
 * pick the active scene (floor) and the blend factor to the next (frac).
 */
export function sceneAt(progress: number): { index: number; frac: number; next: number } {
  const scaled = THREE.MathUtils.clamp(progress, 0, 0.99999) * (SCENE_COUNT - 1);
  const index = Math.floor(scaled);
  const frac = scaled - index;
  return { index, frac, next: Math.min(index + 1, SCENE_COUNT - 1) };
}
