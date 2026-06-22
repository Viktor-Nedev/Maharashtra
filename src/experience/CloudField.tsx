import { useMemo, useRef } from 'react';
import { Cloud, Clouds } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Puff {
  position: [number, number, number];
  scale: number;
  opacity: number;
  speed: number;
}

/**
 * Volumetric cloud field. Clouds are clustered densely at the two "cloud
 * transition" scenes (z ≈ -140 and z ≈ -290) so flying through them blankets the
 * camera, and scattered thinly elsewhere for depth and parallax.
 */
export function CloudField({ lowPower = false }: { lowPower?: boolean }) {
  const group = useRef<THREE.Group>(null);

  const puffs = useMemo<Puff[]>(() => {
    const out: Puff[] = [];
    // Dense transition banks
    const banks = [-140, -290];
    banks.forEach((bz) => {
      const count = lowPower ? 6 : 12;
      for (let i = 0; i < count; i++) {
        out.push({
          position: [(Math.random() - 0.5) * 40, 10 + (Math.random() - 0.5) * 20, bz - (Math.random() - 0.5) * 50],
          scale: 6 + Math.random() * 6,
          opacity: 0.85,
          speed: 0.2 + Math.random() * 0.4,
        });
      }
    });
    // Scattered ambient clouds along the whole route
    const scatter = lowPower ? 10 : 22;
    for (let i = 0; i < scatter; i++) {
      out.push({
        position: [(Math.random() - 0.5) * 160, 8 + Math.random() * 24, 20 - Math.random() * 560],
        scale: 5 + Math.random() * 8,
        opacity: 0.5,
        speed: 0.1 + Math.random() * 0.3,
      });
    }
    return out;
  }, [lowPower]);

  // Gentle drift so the sky feels alive.
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      c.position.x += Math.sin(performance.now() * 0.0001 + i) * dt * 0.4;
    });
  });

  return (
    <group ref={group}>
      <Clouds material={THREE.MeshBasicMaterial} limit={lowPower ? 30 : 60}>
        {puffs.map((p, i) => (
          <Cloud
            key={i}
            position={p.position}
            scale={p.scale}
            opacity={p.opacity}
            speed={p.speed}
            segments={lowPower ? 12 : 26}
            bounds={[10, 3, 10]}
            volume={6}
            color="#f3f7fb"
            fade={120}
          />
        ))}
      </Clouds>
    </group>
  );
}
