import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

const LANDMARK_POSITIONS: [number, number, number][] = [
  [0.8, -0.6, 0.2],
  [-0.9, 0.3, 0.5],
  [0.4, 0.9, 0.1],
  [-0.3, -0.8, 0.7],
  [0.6, 0.5, -0.7],
  [-0.7, -0.3, -0.6],
  [0.1, 0.7, -0.8],
  [-0.5, 0.6, 0.7],
];

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial color="#5e7bff" wireframe opacity={0.35} transparent />
    </mesh>
  );
}

function Pins() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3;
  });
  return (
    <group ref={ref}>
      {LANDMARK_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#ff7a3d' : '#ffb066'} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitPlane() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.6;
    ref.current.position.set(Math.cos(t) * 1.55, Math.sin(t * 0.4) * 0.3, Math.sin(t) * 1.55);
    ref.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.04, 0.22, 4, 8]} />
        <meshBasicMaterial color="#ff7a3d" />
      </mesh>
    </group>
  );
}

interface Loader3DProps {
  visible: boolean;
  progress: number;
}

export function Loader3D({ visible, progress }: Loader3DProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loader3d"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <div className="loader3d__canvas">
            <Canvas camera={{ position: [0, 0, 2.8], fov: 50 }} gl={{ antialias: true }}>
              <ambientLight intensity={1.5} />
              <Globe />
              <Pins />
              <OrbitPlane />
            </Canvas>
          </div>

          <motion.h1
            className="loader3d__title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Maha<span>rashtra</span>
          </motion.h1>
          <motion.p
            className="loader3d__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Loading your adventure…
          </motion.p>

          <div className="loader3d__bar">
            <motion.div
              className="loader3d__fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
