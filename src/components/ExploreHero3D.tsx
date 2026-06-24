import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Airplane } from '@/experience/Airplane';
import { useLowPower } from '@/hooks/useMediaQuery';

function Globe() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.18;
  });

  // A few "destination" pins scattered on the sphere surface.
  const pins = useMemo(() => {
    const r = 2.02;
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
      {/* solid core */}
      <mesh>
        <icosahedronGeometry args={[2, 4]} />
        <meshStandardMaterial color="#16314f" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* wireframe shell */}
      <mesh scale={1.012}>
        <icosahedronGeometry args={[2, 3]} />
        <meshBasicMaterial color="#5e7bff" wireframe transparent opacity={0.35} />
      </mesh>
      {/* glowing pins */}
      {pins.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={i % 2 ? '#ff7a3d' : '#ffb066'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

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
