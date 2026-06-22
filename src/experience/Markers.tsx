import { useRef, useState } from 'react';
import { Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DESTINATIONS } from '@/data/destinations';

// Map each destination's cinematic scene to a world-space anchor above its biome.
const SCENE_ANCHORS: Record<number, [number, number, number]> = {
  2: [-10, 6, -90], // mountains
  4: [10, 4, -215], // lake
  6: [-12, 8, -340], // forest
  7: [8, 12, -440], // cliffs
};

function Marker({
  position,
  label,
  region,
}: {
  position: [number, number, number];
  label: string;
  region: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) ref.current.position.y = position[1] + Math.sin(t * 1.5) * 0.4;
    if (ring.current) {
      const s = 1 + (Math.sin(t * 2) * 0.5 + 0.5) * 0.6;
      ring.current.scale.setScalar(s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 1 - (s - 1) / 0.6;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Billboard>
        {/* Pulse ring */}
        <mesh ref={ring} rotation={[0, 0, 0]}>
          <ringGeometry args={[1.0, 1.15, 32]} />
          <meshBasicMaterial color="#ff8a4c" transparent toneMapped={false} />
        </mesh>
        {/* Core dot */}
        <mesh
          scale={hovered ? 1.4 : 1}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <circleGeometry args={[0.55, 24]} />
          <meshBasicMaterial color="#ffd9a8" toneMapped={false} />
        </mesh>
      </Billboard>

      {hovered && (
        <Html center distanceFactor={40} position={[0, 2.2, 0]} zIndexRange={[20, 0]}>
          <div className="marker-label">
            <span className="marker-label__region">{region}</span>
            <span className="marker-label__name">{label}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/** Floating destination markers that hover over each biome in the world. */
export function Markers() {
  return (
    <group>
      {DESTINATIONS.map((d) => {
        const anchor = SCENE_ANCHORS[d.scene];
        if (!anchor) return null;
        return <Marker key={d.id} position={anchor} label={d.name} region={d.region} />;
      })}
    </group>
  );
}
