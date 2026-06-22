import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { ActivitySceneType } from '@/data/destinations';
import { SCENE_BG, SCENE_REGISTRY } from './scenes';
import { useLowPower } from '@/hooks/useMediaQuery';

// Scenes that sit on the ground get a soft contact shadow; aerial / underwater
// ones don't.
const GROUNDED: ActivitySceneType[] = ['trek', 'sunrise', 'camp', 'zipline', 'climb', 'rappel', 'wildlife', 'caving', 'fortwalk', 'cycle', 'safari', 'waterfall'];

const CAMERA: Partial<Record<ActivitySceneType, [number, number, number]>> = {
  caving: [0, 3, 11],
  paraglide: [8, 3, 11],
  hotair: [7, 4, 12],
  scuba: [7, 3, 10],
  camp: [7, 4, 9],
};

/**
 * Renders the bespoke 3D scene for a single activity. Interactive (drag to
 * orbit) with a slow auto-rotate, scene-specific atmosphere, and cinematic
 * bloom. Each `sceneType` maps to its own composition in scenes.tsx.
 */
export function ActivityScene({ sceneType }: { sceneType: ActivitySceneType }) {
  const lowPower = useLowPower();
  const Scene = SCENE_REGISTRY[sceneType];
  const bg = SCENE_BG[sceneType];
  const cam: [number, number, number] = CAMERA[sceneType] ?? [7, 4.5, 9.5];
  const grounded = GROUNDED.includes(sceneType);

  return (
    <div className="activity-scene">
      <Canvas
        shadows={!lowPower}
        dpr={lowPower ? [1, 1.2] : [1, 2]}
        camera={{ fov: 45, near: 0.1, far: 200, position: cam }}
        gl={{ antialias: !lowPower, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color(bg);
          scene.fog = new THREE.Fog(bg, 18, 48);
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <hemisphereLight args={['#dfeeff', '#2a2418', 0.7]} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.5}
            color="#fff3df"
            castShadow={!lowPower}
            shadow-mapSize={[1024, 1024]}
          />

          <Scene />

          {grounded && (
            <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={40} blur={2.4} far={20} />
          )}
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={6}
          maxDistance={20}
        />

        {!lowPower && (
          <EffectComposer multisampling={2}>
            <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
            <Vignette eskil={false} offset={0.2} darkness={0.6} />
          </EffectComposer>
        )}
      </Canvas>
      <span className="activity-scene__hint">drag to explore</span>
    </div>
  );
}
