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
        {/* Fuselage — capsule laid along the Z (forward) axis so it reads as a
            sleek body, not a vertical cylinder. */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow>
          <capsuleGeometry args={[0.46, 3.4, 8, 18]} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0, 2.35]} rotation={[Math.PI / 2, 0, 0]} material={accentMat} castShadow>
          <coneGeometry args={[0.46, 1.0, 18]} />
        </mesh>
        {/* Cockpit glass */}
        <mesh position={[0, 0.3, 1.25]} scale={[0.62, 0.5, 1.15]} material={glassMat}>
          <sphereGeometry args={[0.5, 16, 16]} />
        </mesh>
        {/* Main wings — slight back-sweep for a jet look */}
        <mesh position={[0, -0.08, -0.1]} rotation={[0, 0, 0]} castShadow material={bodyMat}>
          <boxGeometry args={[7.0, 0.1, 1.2]} />
        </mesh>
        {/* Wing accent stripes */}
        <mesh position={[0, -0.02, 0.4]} material={accentMat}>
          <boxGeometry args={[7.0, 0.12, 0.16]} />
        </mesh>
        {/* Tail wings */}
        <mesh position={[0, 0.04, -1.95]} castShadow material={bodyMat}>
          <boxGeometry args={[2.6, 0.09, 0.7]} />
        </mesh>
        {/* Vertical stabiliser */}
        <mesh position={[0, 0.5, -2.0]} rotation={[-0.25, 0, 0]} castShadow material={accentMat}>
          <boxGeometry args={[0.11, 0.95, 0.7]} />
        </mesh>
        {/* Engine pods slung under the wings */}
        {[-2.0, 2.0].map((x) => (
          <mesh key={x} position={[x, -0.3, 0.15]} rotation={[Math.PI / 2, 0, 0]} material={bodyMat} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 1.1, 14]} />
          </mesh>
        ))}
      </group>
      {/* Navigation light — also gives the plane a faint glow for bloom. */}
      <pointLight position={[0, 0.4, -2]} color="#ff6b3d" intensity={6} distance={8} />
    </group>
  );
});

Airplane.displayName = 'Airplane';
