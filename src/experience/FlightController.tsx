import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Airplane } from './Airplane';
import { flightPosition, flightTangent, sceneAt, SCENES } from './flight';
import { useScrollStore } from '@/lib/scrollStore';

const damp = THREE.MathUtils.damp;

/**
 * Reads scroll `progress` from the store every frame and drives:
 *  - the airplane position + orientation (with banking on turns),
 *  - the chase camera (smoothed follow),
 *  - sky / fog colour + density (cross-faded between scenes),
 *  - key-light intensity + colour,
 *  - subtle camera shake (amplified during cloud transitions & the cliff turn).
 */
export function FlightController({ lowPower = false }: { lowPower?: boolean }) {
  const plane = useRef<THREE.Group>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const { scene, camera } = useThree();

  // Pre-built colour objects to lerp into (avoids per-frame allocation).
  const skyColors = useMemo(() => SCENES.map((s) => new THREE.Color(s.sky)), []);
  const fogColors = useMemo(() => SCENES.map((s) => new THREE.Color(s.fog)), []);
  const lightColors = useMemo(() => SCENES.map((s) => new THREE.Color(s.lightColor)), []);

  // Scratch vectors.
  const v = useRef({
    pos: new THREE.Vector3(),
    tan: new THREE.Vector3(),
    camPos: new THREE.Vector3(),
    lookAt: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
    m: new THREE.Matrix4(),
    q: new THREE.Quaternion(),
    prevX: 0,
    skyTmp: new THREE.Color(),
    fogTmp: new THREE.Color(),
    lightTmp: new THREE.Color(),
  }).current;

  // Ensure exponential fog exists.
  useMemo(() => {
    scene.fog = new THREE.FogExp2('#cfe0ee', 0.0025);
    scene.background = new THREE.Color('#aecadf');
  }, [scene]);

  useFrame((state, dt) => {
    const progress = useScrollStore.getState().progress;
    const { index, frac, next } = sceneAt(progress);

    // --- Airplane transform -------------------------------------------------
    flightPosition(progress, v.pos);
    flightTangent(progress, v.tan).normalize();

    if (plane.current) {
      plane.current.position.lerp(v.pos, 1 - Math.exp(-10 * dt));

      // Orient along the path.
      v.lookAt.copy(plane.current.position).add(v.tan);
      v.m.lookAt(plane.current.position, v.lookAt, v.up);
      v.q.setFromRotationMatrix(v.m);

      // Bank into turns based on lateral velocity (dx of the tangent).
      const bank = THREE.MathUtils.clamp(-v.tan.x * 1.6, -0.8, 0.8);
      const bankQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), bank);
      v.q.multiply(bankQ);

      plane.current.quaternion.slerp(v.q, 1 - Math.exp(-8 * dt));

      // Idle bob for life.
      plane.current.position.y += Math.sin(state.clock.elapsedTime * 1.2) * 0.06;
    }

    // --- Chase camera -------------------------------------------------------
    v.camPos.copy(v.pos).addScaledVector(v.tan, -18);
    v.camPos.y += 7;

    // Camera shake: baseline + bursts during cloud transitions / cliff turn.
    const biome = SCENES[index].biome;
    const transitionBoost = biome === 'transition' ? 1 : SCENES[next].biome === 'transition' ? frac : 0;
    const cliffBoost = biome === 'cliffs' ? 0.6 : 0;
    const shakeAmp = (lowPower ? 0.04 : 0.09) + transitionBoost * 0.22 + cliffBoost * 0.18;
    const t = state.clock.elapsedTime;
    v.camPos.x += Math.sin(t * 13.0) * shakeAmp;
    v.camPos.y += Math.cos(t * 11.0) * shakeAmp;

    camera.position.lerp(v.camPos, 1 - Math.exp(-6 * dt));
    v.lookAt.copy(v.pos).addScaledVector(v.tan, 6);
    camera.lookAt(v.lookAt);

    // --- Atmosphere cross-fade ---------------------------------------------
    v.skyTmp.copy(skyColors[index]).lerp(skyColors[next], frac);
    v.fogTmp.copy(fogColors[index]).lerp(fogColors[next], frac);
    v.lightTmp.copy(lightColors[index]).lerp(lightColors[next], frac);

    (scene.background as THREE.Color).copy(v.skyTmp);
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(v.fogTmp);
    const density = THREE.MathUtils.lerp(SCENES[index].fogDensity, SCENES[next].fogDensity, frac);
    fog.density = damp(fog.density, 0.0022 + density * 0.004, 4, dt);

    if (sun.current) {
      sun.current.color.copy(v.lightTmp);
      const li = THREE.MathUtils.lerp(SCENES[index].light, SCENES[next].light, frac);
      sun.current.intensity = damp(sun.current.intensity, li, 4, dt);
      // Keep the sun roughly ahead-left of the plane for consistent god-rays.
      sun.current.position.set(v.pos.x - 40, v.pos.y + 60, v.pos.z - 30);
      sun.current.target.position.copy(v.pos);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <directionalLight
        ref={sun}
        castShadow={!lowPower}
        intensity={1.1}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <Airplane ref={plane} />
    </>
  );
}
