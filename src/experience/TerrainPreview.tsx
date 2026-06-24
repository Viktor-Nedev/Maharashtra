import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Cheap deterministic hash → 0..1, so each destination gets a stable terrain. */
function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function slugSeed(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

const COLOR_LOW = new THREE.Color('#1f6f4a');   // valley green
const COLOR_MID = new THREE.Color('#6b5536');   // rock brown
const COLOR_HIGH = new THREE.Color('#e9eef5');  // snow

function TerrainMesh({ slug }: { slug: string }) {
  const group = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const SIZE = 10;
    const SEG = 48;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geo.rotateX(-Math.PI / 2);

    const rand = seededRand(slugSeed(slug));
    // A handful of randomised sine "ridges" summed for organic terrain.
    const waves = Array.from({ length: 5 }, () => ({
      fx: 0.25 + rand() * 0.7,
      fz: 0.25 + rand() * 0.7,
      px: rand() * Math.PI * 2,
      pz: rand() * Math.PI * 2,
      amp: 0.5 + rand() * 1.4,
    }));
    const peak = 1.2 + rand() * 1.6;

    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    let maxH = 0.0001;
    const heights: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let h = 0;
      for (const w of waves) {
        h += Math.sin(x * w.fx + w.px) * Math.cos(z * w.fz + w.pz) * w.amp;
      }
      // Dome falloff toward the edges so it reads as an island/massif.
      const d = Math.hypot(x, z) / 7;
      h = Math.max(0, h * peak * (1 - d * d));
      heights.push(h);
      if (h > maxH) maxH = h;
    }

    for (let i = 0; i < pos.count; i++) {
      const h = heights[i];
      pos.setY(i, h);
      const t = h / maxH;
      const c = new THREE.Color();
      if (t < 0.5) c.lerpColors(COLOR_LOW, COLOR_MID, t / 0.5);
      else c.lerpColors(COLOR_MID, COLOR_HIGH, (t - 0.5) / 0.5);
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [slug]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Translucent "sea level" plane for context */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0e3a66" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

/**
 * Lightweight isometric procedural-terrain card. Each destination slug yields a
 * unique, deterministic mini-mountain that slowly rotates — a 3-D flourish on the
 * back of the flip cards. Mount it only when the card is active to limit WebGL
 * contexts.
 */
export function TerrainPreview({ slug }: { slug: string }) {
  return (
    <div className="terrain-preview">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 35, near: 0.1, far: 100, position: [9, 8, 9] }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[6, 12, 4]} intensity={1.6} color="#fff3df" />
          <TerrainMesh slug={slug} />
        </Suspense>
      </Canvas>
    </div>
  );
}
