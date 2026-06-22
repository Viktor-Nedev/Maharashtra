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
  // ep = eased flight progress (lags the raw scroll a touch, exactly like the map
  // camera, so plane + terrain glide together instead of snapping).
  const state = useRef({ ep: 0, prev: 0, bank: 0, vel: 0 });
  const baseScale = lowPower ? 0.42 : 0.5;

  useFrame((s, dt) => {
    if (!group.current) return;
    const target = useScrollStore.getState().progress;

    // Ease toward the scroll target → smooth, buttery flight transition.
    state.current.ep += (target - state.current.ep) * Math.min(1, dt * 3.2);
    const p = state.current.ep;

    // Scroll velocity (from the eased value) → banking.
    const raw = (p - state.current.prev) / Math.max(dt, 0.001);
    state.current.prev = p;
    state.current.vel += (raw - state.current.vel) * Math.min(1, dt * 6);

    const t = s.clock.elapsedTime;

    // Flight phases ---------------------------------------------------------
    // enter  : fly in from below + far away at the first destination.
    // turn   : pivot from facing the viewer to flying forward into the scene.
    // descend: gentle drop toward the lower sections across the scroll.
    // exit   : bank hard and peel off to the right into the distance.
    const enter = THREE.MathUtils.smoothstep(p, 0.0, 0.09);
    const turn = THREE.MathUtils.smoothstep(p, 0.05, 0.24);
    const descend = THREE.MathUtils.smoothstep(p, 0.12, 0.9);
    const exit = THREE.MathUtils.smoothstep(p, 0.9, 1.0);

    // Position --------------------------------------------------------------
    const weave = Math.sin(p * Math.PI * 3) * 1.2 * turn;
    const x = weave + exit * exit * 15; // sweep off to the right on exit
    const y =
      THREE.MathUtils.lerp(1.3, -1.5, descend) +
      Math.sin(t * 1.2) * 0.12 +
      (1 - enter) * -5.5 + // start well below the frame, rise into place
      exit * 3.2; // climb away on exit
    const z = (1 - enter) * -12 + exit * -7; // arrive from afar, recede on exit
    group.current.position.set(x, y, z);

    // Grow in from the distance as it appears.
    group.current.scale.setScalar(baseScale * (0.4 + 0.6 * enter));

    // Banking from scroll velocity, plus a hard roll into the exit turn.
    const targetBank =
      THREE.MathUtils.clamp(state.current.vel * -2.2, -0.6, 0.6) * turn - exit * 1.0;
    state.current.bank += (targetBank - state.current.bank) * Math.min(1, dt * 4);

    // Yaw: face the camera (π) at the start, rotate to fly forward, weave between
    // sections, then yaw away on exit.
    const yaw =
      THREE.MathUtils.lerp(Math.PI, 0, turn) + Math.sin(p * Math.PI * 4) * 0.22 * turn - exit * 1.2;
    // Pitch: level while greeting the viewer, nose-down descending, pull up on exit.
    const pitch = turn * (0.1 + descend * 0.24) + Math.sin(t * 1.1) * 0.02 - exit * 0.45;
    group.current.rotation.set(pitch, yaw, state.current.bank + Math.sin(t * 0.8) * 0.03);
  });

  return (
    <group ref={group} scale={baseScale}>
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
