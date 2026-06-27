import { forwardRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/3d_models/toy_plane.glb';

/**
 * The home/explore airplane — now a real GLB model (public/3d_models/toy_plane.glb).
 * The flight system (PlaneOverlay) drives the parent group's position/rotation,
 * so this component only normalises the model's size + orientation. The inner
 * group is rotated so the nose points forward (-Z); tweak ORIENT if the imported
 * model faces a different axis.
 */
const ORIENT: [number, number, number] = [0, Math.PI, 0];
const TARGET_SIZE = 3.4; // world units along the longest axis (matches old plane)

export const Airplane = forwardRef<THREE.Group>((_, ref) => {
  const { scene } = useGLTF(MODEL_URL);

  // Clone + normalise once: centre at origin and scale to a known size so the
  // flight maths works regardless of the model's native units.
  const model = useMemo(() => {
    const s = scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const k = TARGET_SIZE / maxDim;
    s.scale.setScalar(k);
    s.position.set(-center.x * k, -center.y * k, -center.z * k);
    s.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = false;
      }
    });
    return s;
  }, [scene]);

  return (
    <group ref={ref} dispose={null}>
      <group rotation={ORIENT}>
        <primitive object={model} />
      </group>
      {/* Navigation light — also gives the plane a faint glow for bloom. */}
      <pointLight position={[0, 0.4, -2]} color="#ff6b3d" intensity={6} distance={8} />
    </group>
  );
});

Airplane.displayName = 'Airplane';

useGLTF.preload(MODEL_URL);
