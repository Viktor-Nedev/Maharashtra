import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import { FlightController } from './FlightController';
import { World } from './World';
import { CloudField } from './CloudField';
import { Markers } from './Markers';
import { Effects } from './Effects';
import { useScrollStore } from '@/lib/scrollStore';

/**
 * The fixed, full-viewport WebGL layer that sits behind the scrolling HTML.
 * Pointer events pass through to the DOM except where markers opt back in.
 */
export function Experience({ lowPower }: { lowPower: boolean }) {
  const setReady = useScrollStore((s) => s.setReady);

  return (
    <div className="experience-canvas" aria-hidden="true">
      <Canvas
        shadows={!lowPower}
        dpr={lowPower ? [1, 1.2] : [1, 2]}
        gl={{
          antialias: !lowPower,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        camera={{ fov: 50, near: 0.5, far: 1200, position: [0, 30, 30] }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#cfe6ff', '#3a3326', 0.6]} />

          <FlightController lowPower={lowPower} />
          <World />
          <CloudField lowPower={lowPower} />
          <Markers />

          <Effects lowPower={lowPower} />
          <Preload all />
        </Suspense>

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}
