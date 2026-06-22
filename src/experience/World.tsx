import { useMemo } from 'react';
import { Instance, Instances, MeshReflectorMaterial } from '@react-three/drei';

// Deterministic PRNG so the world looks the same every reload (no SSR flicker,
// reproducible demos).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Mountains (Scene 2) ---------------------------------------------------
function Mountains({ z }: { z: number }) {
  const peaks = useMemo(() => {
    const rng = mulberry32(12);
    return Array.from({ length: 26 }, () => {
      const h = 8 + rng() * 26;
      return {
        x: (rng() - 0.5) * 130,
        z: z - rng() * 130,
        h,
        r: 6 + rng() * 10,
        snow: h > 22,
      };
    });
  }, [z]);

  return (
    <group>
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, -8, p.z]}>
          <mesh castShadow receiveShadow>
            <coneGeometry args={[p.r, p.h, 6]} />
            <meshStandardMaterial color="#4a5a64" flatShading roughness={0.95} />
          </mesh>
          {p.snow && (
            <mesh position={[0, p.h * 0.32, 0]}>
              <coneGeometry args={[p.r * 0.42, p.h * 0.34, 6]} />
              <meshStandardMaterial color="#eef4f8" flatShading roughness={0.6} />
            </mesh>
          )}
        </group>
      ))}
      {/* River ribbon */}
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[6, -7.6, z - 60]}>
        <planeGeometry args={[5, 150]} />
        <meshStandardMaterial color="#6fa3b8" metalness={0.5} roughness={0.2} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// ---- Lake (Scenes 4) -------------------------------------------------------
function Lake({ z }: { z: number }) {
  const rocks = useMemo(() => {
    const rng = mulberry32(7);
    return Array.from({ length: 14 }, () => ({
      x: (rng() - 0.5) * 120,
      z: z - rng() * 120,
      h: 4 + rng() * 14,
      r: 5 + rng() * 8,
    }));
  }, [z]);

  return (
    <group>
      {/* Reflective water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -7.8, z - 50]} receiveShadow>
        <planeGeometry args={[260, 200]} />
        <MeshReflectorMaterial
          resolution={512}
          mirror={0.65}
          mixStrength={2.2}
          blur={[300, 100]}
          roughness={0.9}
          depthScale={1.1}
          color="#23566b"
          metalness={0.4}
        />
      </mesh>
      {/* Fort-like hills around the shore */}
      {rocks.map((r, i) => (
        <mesh key={i} position={[r.x, -8, r.z]} castShadow>
          <coneGeometry args={[r.r, r.h, 5]} />
          <meshStandardMaterial color="#566b4e" flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ---- Forest (Scene 6) ------------------------------------------------------
function Forest({ z }: { z: number }) {
  const trees = useMemo(() => {
    const rng = mulberry32(99);
    return Array.from({ length: 200 }, () => {
      const s = 0.7 + rng() * 1.6;
      return {
        position: [(rng() - 0.5) * 150, -8, z - rng() * 150] as [number, number, number],
        scale: s,
        rot: rng() * Math.PI,
      };
    });
  }, [z]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, z - 60]} receiveShadow>
        <planeGeometry args={[260, 200]} />
        <meshStandardMaterial color="#2c4a33" roughness={1} />
      </mesh>
      {/* Instanced canopy — one draw call for 200 trees */}
      <Instances castShadow receiveShadow limit={trees.length}>
        <coneGeometry args={[1.4, 5, 7]} />
        <meshStandardMaterial color="#2f5d3a" flatShading roughness={0.9} />
        {trees.map((t, i) => (
          <Instance key={i} position={[t.position[0], t.position[1] + 2.5 * t.scale, t.position[2]]} scale={t.scale} rotation={[0, t.rot, 0]} />
        ))}
      </Instances>
      {/* Instanced trunks */}
      <Instances limit={trees.length}>
        <cylinderGeometry args={[0.18, 0.22, 2.2, 6]} />
        <meshStandardMaterial color="#3a2a1c" roughness={1} />
        {trees.map((t, i) => (
          <Instance key={i} position={[t.position[0], t.position[1] + 1.1 * t.scale, t.position[2]]} scale={t.scale} />
        ))}
      </Instances>
    </group>
  );
}

// ---- Cliffs (Scene 7) ------------------------------------------------------
function Cliffs({ z }: { z: number }) {
  const slabs = useMemo(() => {
    const rng = mulberry32(42);
    return Array.from({ length: 12 }, () => ({
      x: (rng() - 0.5) * 120,
      z: z - rng() * 120,
      h: 24 + rng() * 30,
      w: 10 + rng() * 18,
      d: 10 + rng() * 18,
    }));
  }, [z]);

  return (
    <group>
      {slabs.map((s, i) => (
        <mesh key={i} position={[s.x, -8 + s.h / 2, s.z]} castShadow receiveShadow>
          <boxGeometry args={[s.w, s.h, s.d]} />
          <meshStandardMaterial color="#5c5360" flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ---- Landing hub (Scene 8) -------------------------------------------------
function LandingHub({ z }: { z: number }) {
  return (
    <group position={[0, -8, z - 30]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color="#1b2440" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Glowing landing ring (bloom picks this up) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[16, 18, 64]} />
        <meshBasicMaterial color="#ffb066" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[26, 27, 64]} />
        <meshBasicMaterial color="#5e7bff" toneMapped={false} />
      </mesh>
      {/* Beacon pillars */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 22, 2, Math.sin(a) * 22]}>
            <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
            <meshBasicMaterial color="#ffd9a8" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * The full world, with each biome positioned along the flight path Z axis so it
 * comes into view as the relevant scene becomes active.
 */
export function World() {
  return (
    <group>
      <Mountains z={-90} />
      <Lake z={-215} />
      <Forest z={-340} />
      <Cliffs z={-440} />
      <LandingHub z={-540} />
    </group>
  );
}
