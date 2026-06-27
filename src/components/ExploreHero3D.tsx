import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Airplane } from '@/experience/Airplane';
import { useLowPower } from '@/hooks/useMediaQuery';

const EARTH_URL = '/3d_models/earth.glb';

function Globe() {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(EARTH_URL);

  // Normalise the earth model to a ~4-unit diameter, centred at the origin.
  const earth = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const k = 4 / maxDim;
    s.scale.setScalar(k);
    s.position.set(-center.x * k, -center.y * k, -center.z * k);
    return s;
  }, [scene]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.14;
  });

  // A few glowing "destination" pins floating just above the surface.
  const pins = useMemo(() => {
    const r = 2.12;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 7; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 7);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ));
    }
    return pts;
  }, []);

  return (
    <group ref={group} rotation={[0.3, 0, 0.1]}>
      <primitive object={earth} />
      {pins.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color={i % 2 ? '#ff7a3d' : '#ffb066'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(EARTH_URL);

function OrbitingPlane() {
  const pivot = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (pivot.current) {
      pivot.current.rotation.y = s.clock.elapsedTime * 0.5;
      pivot.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.3) * 0.15;
    }
  });
  return (
    <group ref={pivot}>
      <group position={[3.1, 0.4, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.26}>
        <Airplane />
      </group>
    </group>
  );
}

/** Small interactive-feeling 3D centrepiece for the Explore hero. */
export function ExploreHero3D() {
  const lowPower = useLowPower();
  return (
    <div className="explore-hero3d" aria-hidden="true">
      <Canvas
        dpr={lowPower ? [1, 1.2] : [1, 2]}
        camera={{ fov: 42, position: [0, 0.6, 8] }}
        gl={{ antialias: !lowPower, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 5]} intensity={1.6} color="#fff3df" />
          <pointLight position={[-5, -2, -3]} intensity={1.2} color="#5e7bff" />
          <Globe />
          {!lowPower && <OrbitingPlane />}
        </Suspense>
      </Canvas>
    </div>
  );
}
