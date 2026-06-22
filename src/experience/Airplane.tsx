import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Stylised low-poly airplane built entirely from primitives so the experience
 * runs with ZERO external assets. To swap in the real `airplane.glb`, replace
 * the meshes here with a `useGLTF('/models/airplane.glb')` scene — the rest of
 * the flight system (positioning/banking) operates on the parent group and is
 * model-agnostic.
 */
export const Airplane = forwardRef<THREE.Group>((_, ref) => {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#eef1f5', metalness: 0.35, roughness: 0.4 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8743b', metalness: 0.2, roughness: 0.5 }),
    [],
  );
  const glassMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d2a3a',
        metalness: 0.6,
        roughness: 0.15,
        emissive: '#173f55',
        emissiveIntensity: 0.4,
      }),
    [],
  );

  return (
    // Inner group rotated so the model "nose" points down -Z (flight forward).
    <group ref={ref} dispose={null}>
      <group rotation={[0, Math.PI, 0]} scale={1.1}>
        {/* Fuselage */}
        <mesh material={bodyMat} castShadow>
          <capsuleGeometry args={[0.62, 3.4, 6, 16]} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0, 2.1]} rotation={[Math.PI / 2, 0, 0]} material={accentMat} castShadow>
          <coneGeometry args={[0.62, 1.1, 16]} />
        </mesh>
        {/* Cockpit glass */}
        <mesh position={[0, 0.38, 1.0]} scale={[0.7, 0.55, 1.1]} material={glassMat}>
          <sphereGeometry args={[0.55, 16, 16]} />
        </mesh>
        {/* Main wings */}
        <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]} castShadow material={bodyMat}>
          <boxGeometry args={[7.2, 0.12, 1.3]} />
        </mesh>
        {/* Wing accent stripes */}
        <mesh position={[0, -0.04, 0.55]} material={accentMat}>
          <boxGeometry args={[7.2, 0.14, 0.18]} />
        </mesh>
        {/* Tail wings */}
        <mesh position={[0, 0.05, -1.9]} castShadow material={bodyMat}>
          <boxGeometry args={[2.6, 0.1, 0.7]} />
        </mesh>
        {/* Vertical stabiliser */}
        <mesh position={[0, 0.55, -1.95]} castShadow material={accentMat}>
          <boxGeometry args={[0.12, 1.0, 0.8]} />
        </mesh>
        {/* Engine pods */}
        {[-2.0, 2.0].map((x) => (
          <mesh key={x} position={[x, -0.28, 0.2]} rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 1.0, 12]} />
          </mesh>
        ))}
      </group>
      {/* Navigation light — also gives the plane a faint glow for bloom. */}
      <pointLight position={[0, 0.4, -2]} color="#ff6b3d" intensity={6} distance={8} />
    </group>
  );
});

Airplane.displayName = 'Airplane';
