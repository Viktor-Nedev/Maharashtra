import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Airplane } from './Airplane';
import { useScrollStore } from '@/lib/scrollStore';

/**
 * A transparent WebGL layer composited OVER the Mapbox satellite map AND over the
 * scrolling copy: the 3D airplane the user is flying. As you scroll it descends
 * from the top of the screen toward the bottom, weaving and banking past the
 * text. At the very end of the page it banks hard and peels off to the side,
 * shrinking into the distance.
 */
function Plane({ lowPower }: { lowPower: boolean }) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({ prev: 0, bank: 0, vel: 0 });

  useFrame((s, dt) => {
    if (!group.current) return;
    const p = useScrollStore.getState().progress;

    // Scroll velocity → banking.
    const raw = (p - state.current.prev) / Math.max(dt, 0.001);
    state.current.prev = p;
    state.current.vel += (raw - state.current.vel) * Math.min(1, dt * 6);

    const t = s.clock.elapsedTime;

    // Descend from the top of the viewport toward the bottom across the scroll.
    const descend = THREE.MathUtils.smoothstep(p, 0, 0.9);
    // Peel-off near the very end of the page (0.88 → 1).
    const exit = THREE.MathUtils.smoothstep(p, 0.88, 1);

    // Position: gentle horizontal weave + vertical descent, then sweep off to the
    // right and into the distance on exit.
    const x = 0.4 + Math.sin(p * Math.PI * 3) * 1.1 + exit * exit * 13;
    const y = THREE.MathUtils.lerp(3.4, -1.4, descend) + Math.sin(t * 1.2) * 0.12 + exit * 3.4;
    const z = exit * -5;
    group.current.position.set(x, y, z);

    // Banking from scroll velocity, plus a hard roll into the exit turn.
    const targetBank = THREE.MathUtils.clamp(state.current.vel * -2.0, -0.6, 0.6) - exit * 1.0;
    state.current.bank += (targetBank - state.current.bank) * Math.min(1, dt * 4);

    // Nose-down pitch while descending; pull up + yaw away as it peels off.
    const pitch = 0.12 + descend * 0.16 + Math.sin(t * 1.1) * 0.02 - exit * 0.45;
    const yaw = Math.sin(t * 0.5) * 0.04 - exit * 1.1;
    group.current.rotation.set(pitch, yaw, state.current.bank + Math.sin(t * 0.8) * 0.03);
  });

  return (
    <group ref={group} scale={lowPower ? 0.42 : 0.5}>
      <Airplane />
    </group>
  );
}

export function PlaneOverlay({ lowPower = false }: { lowPower?: boolean }) {
  return (
    <div className="plane-overlay" aria-hidden="true">
      <Canvas
        dpr={lowPower ? [1, 1.2] : [1, 2]}
        gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, near: 0.1, far: 100, position: [0.6, 1.4, 9] }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <hemisphereLight args={['#dbeafe', '#3a3326', 0.7]} />
          <directionalLight position={[5, 8, 6]} intensity={1.6} color="#fff3df" />
          <Plane lowPower={lowPower} />
        </Suspense>
      </Canvas>
    </div>
  );
}
