import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Shared low-poly building blocks for the per-activity 3D scenes. Composing
// these keeps each scene distinct yet consistent in art direction.
// ---------------------------------------------------------------------------

export function Ground({ color = '#3a5a40', size = 60, y = 0 }: { color?: string; size?: number; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[size, 64]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

export function Water({ color = '#2b6c8a', size = 80, y = -0.02 }: { color?: string; size?: number; y?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.9 + Math.sin(s.clock.elapsedTime) * 0.04;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      <circleGeometry args={[size, 64]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.12} transparent opacity={0.92} />
    </mesh>
  );
}

export function PineTree({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 6]} />
        <meshStandardMaterial color="#4a3526" roughness={1} />
      </mesh>
      {[1.5, 2.1, 2.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <coneGeometry args={[0.9 - i * 0.22, 1.1 - i * 0.18, 7]} />
          <meshStandardMaterial color={i === 0 ? '#2f5d3a' : '#356b43'} flatShading roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function Rock({ position = [0, 0, 0], scale = 1, color = '#6b6b73' }: { position?: [number, number, number]; scale?: number; color?: string }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow rotation={[0.4, 0.8, 0.2]}>
      <dodecahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color={color} flatShading roughness={0.95} />
    </mesh>
  );
}

export function Mountain({ position = [0, 0, 0], height = 8, radius = 5, snow = true }: { position?: [number, number, number]; height?: number; radius?: number; snow?: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <coneGeometry args={[radius, height, 6]} />
        <meshStandardMaterial color="#566370" flatShading roughness={0.95} />
      </mesh>
      {snow && (
        <mesh position={[0, height * 0.32, 0]}>
          <coneGeometry args={[radius * 0.42, height * 0.34, 6]} />
          <meshStandardMaterial color="#eef4f8" flatShading roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

export function Cliff({ position = [0, 0, 0], width = 6, height = 14, depth = 6, color = '#5c5360' }: { position?: [number, number, number]; width?: number; height?: number; depth?: number; color?: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} flatShading roughness={0.95} />
    </mesh>
  );
}

export function Tent({ position = [0, 0, 0], color = '#e8743b' }: { position?: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1, 1.1, 4]} />
        <meshStandardMaterial color={color} flatShading roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshStandardMaterial color="#7a4a2a" roughness={1} />
      </mesh>
    </group>
  );
}

/** Animated campfire — flickering flame cone + warm point light (bloom-friendly). */
export function Campfire({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    const f = 0.85 + Math.sin(s.clock.elapsedTime * 12) * 0.12 + Math.sin(s.clock.elapsedTime * 7) * 0.06;
    if (flame.current) flame.current.scale.set(1, f, 1);
    if (light.current) light.current.intensity = 6 * f;
  });
  return (
    <group position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[0, (i / 3) * Math.PI, 0.3]}>
          <boxGeometry args={[0.7, 0.12, 0.12]} />
          <meshStandardMaterial color="#3a2a1c" roughness={1} />
        </mesh>
      ))}
      <mesh ref={flame} position={[0, 0.5, 0]}>
        <coneGeometry args={[0.28, 0.9, 8]} />
        <meshBasicMaterial color="#ff8a2b" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.16, 0.55, 8]} />
        <meshBasicMaterial color="#ffe07a" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.6, 0]} color="#ff8a3d" intensity={6} distance={12} />
    </group>
  );
}

/** Minimal stylised human figure. */
export function Person({ position = [0, 0, 0], color = '#d94f3d', scale = 1, rotation = [0, 0, 0] }: { position?: [number, number, number]; color?: string; scale?: number; rotation?: [number, number, number] }) {
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#e8b896" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.7, 4, 10]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} castShadow>
          <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
          <meshStandardMaterial color="#2b2f3a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** Glowing sun disc + directional light, for sunrise/sunset scenes. */
export function Sun({ position = [0, 6, -20], color = '#ff9d4d', size = 3 }: { position?: [number, number, number]; color?: string; size?: number }) {
  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight position={position} color={color} intensity={3} distance={120} />
    </group>
  );
}

/** A drifting cluster of cloud puffs (cheap, for aerial scenes). */
export function CloudPuff({ position = [0, 0, 0], scale = 1 }: { position?: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.position.x = position[0] + Math.sin(s.clock.elapsedTime * 0.2 + position[2]) * 1.5;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      {[[0, 0, 0], [1.1, 0.2, 0.2], [-1.1, 0.1, -0.2], [0.4, 0.5, 0.4]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.9, 12, 12]} />
          <meshStandardMaterial color="#f3f7fb" roughness={1} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

/** Spins its children slowly — handy for orbiting props. */
export function Spin({ speed = 0.3, children }: { speed?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}
