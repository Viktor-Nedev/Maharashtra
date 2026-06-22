import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { ActivitySceneType } from '@/data/destinations';
import {
  Campfire,
  Cliff,
  CloudPuff,
  Ground,
  Mountain,
  Person,
  PineTree,
  Rock,
  Sun,
  Tent,
  Water,
} from './kit';

// --- small animation helpers ----------------------------------------------
function Bob({ amp = 0.12, speed = 1, rot = 0.05, children }: { amp?: number; speed?: number; rot?: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime * speed;
    ref.current.position.y = Math.sin(t) * amp;
    ref.current.rotation.z = Math.sin(t * 0.8) * rot;
  });
  return <group ref={ref}>{children}</group>;
}

function Drift({ from, to, speed = 0.3, axis = 'y', children }: { from: number; to: number; speed?: number; axis?: 'x' | 'y'; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = (Math.sin(s.clock.elapsedTime * speed) * 0.5 + 0.5);
    const v = from + (to - from) * t;
    if (axis === 'y') ref.current.position.y = v;
    else ref.current.position.x = v;
  });
  return <group ref={ref}>{children}</group>;
}

// Background colour per scene type (drives ActivityScene fog/clear colour).
export const SCENE_BG: Record<ActivitySceneType, string> = {
  trek: '#a9c6d8',
  sunrise: '#f7b27a',
  camp: '#0c1430',
  kayak: '#9cc3d6',
  raft: '#88b0c4',
  boat: '#cfe2ec',
  scuba: '#063a5e',
  zipline: '#9fc7a6',
  paraglide: '#bcdcef',
  hotair: '#cfe6f7',
  climb: '#c8b6d6',
  rappel: '#b9a9c9',
  wildlife: '#7fa07f',
  caving: '#05080f',
  waterfall: '#6f93a0',
  fortwalk: '#b9a36f',
  cycle: '#9bb98a',
  safari: '#c7a86a',
};

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

function Trek() {
  const hiker = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!hiker.current) return;
    const t = (s.clock.elapsedTime * 0.12) % 1;
    hiker.current.position.set(-4 + t * 7, t * 4.2, 2 - t * 4);
  });
  return (
    <group>
      <Ground color="#5a6b54" />
      <Mountain position={[2, 0, -2]} height={11} radius={6} />
      <Mountain position={[-8, 0, -6]} height={8} radius={4} />
      {/* switchback trail */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-2 + i * 1.4, 0.6 + i * 1.0, 1 - i]} rotation={[-Math.PI / 2, 0, i % 2 ? 0.4 : -0.4]}>
          <planeGeometry args={[2.6, 0.7]} />
          <meshStandardMaterial color="#9a8163" roughness={1} />
        </mesh>
      ))}
      {/* summit flag */}
      <group position={[2, 5.6, -2]}>
        <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.04, 0.04, 1.2, 6]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[0.3, 1.0, 0]}><planeGeometry args={[0.6, 0.35]} /><meshStandardMaterial color="#e8743b" side={THREE.DoubleSide} /></mesh>
      </group>
      <group ref={hiker}><Person color="#d94f3d" scale={0.8} /></group>
      <PineTree position={[-5, 0, 3]} scale={1.1} />
      <PineTree position={[5, 0, 2]} />
    </group>
  );
}

function Sunrise() {
  return (
    <group>
      <Sun position={[0, 5, -22]} color="#ffd27a" size={4} />
      <Ground color="#6b5a4a" />
      <Mountain position={[-6, 0, -8]} height={9} radius={5} snow={false} />
      <Mountain position={[7, 0, -10]} height={11} radius={6} snow={false} />
      <Mountain position={[0, 0, -14]} height={13} radius={7} snow={false} />
      <Person position={[0, 0, 4]} color="#2b2f3a" rotation={[0, Math.PI, 0]} />
      <CloudPuff position={[-7, 6, -12]} scale={1.4} />
      <CloudPuff position={[6, 7, -14]} scale={1.6} />
    </group>
  );
}

function Camp() {
  return (
    <group>
      <Stars radius={60} depth={30} count={1200} factor={3} fade speed={0.5} />
      <Ground color="#27332a" />
      <Tent position={[-1.6, 0, 1]} color="#e8743b" />
      <Tent position={[1.7, 0, 0.4]} color="#3d7ea6" />
      <Campfire position={[0, 0, 2.6]} />
      <Person position={[1.1, 0, 3]} color="#caa15a" scale={0.85} rotation={[0, -0.6, 0]} />
      <PineTree position={[-4, 0, -2]} scale={1.3} />
      <PineTree position={[4, 0, -3]} scale={1.5} />
      <PineTree position={[-3, 0, 4]} />
      <Mountain position={[0, 0, -12]} height={12} radius={7} />
    </group>
  );
}

function Kayak() {
  return (
    <group>
      <Water color="#2b6c8a" />
      <Bob amp={0.1} speed={1.4} rot={0.06}>
        <group position={[0, 0.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.4, 2.6, 6, 12]} />
            <meshStandardMaterial color="#e8b13b" roughness={0.5} />
          </mesh>
          <Person position={[0, 0.2, 0]} color="#d94f3d" scale={0.7} />
          {/* paddle */}
          <mesh position={[0, 0.9, 0]} rotation={[0, 0, 0.7]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 6]} />
            <meshStandardMaterial color="#3a2a1c" />
          </mesh>
        </group>
      </Bob>
      <Mountain position={[-9, -0.2, -8]} height={7} radius={4} snow={false} />
      <Sun position={[8, 4, -16]} color="#ffb066" size={2.4} />
    </group>
  );
}

function Raft() {
  return (
    <group>
      <Water color="#3f7c98" />
      <Bob amp={0.18} speed={2.2} rot={0.12}>
        <group position={[0, 0.15, 0]}>
          <mesh castShadow>
            <torusGeometry args={[1.2, 0.32, 10, 24]} />
            <meshStandardMaterial color="#d8492f" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.0, 20]} />
            <meshStandardMaterial color="#2b2f3a" />
          </mesh>
          {[[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]].map(([x, z], i) => (
            <Person key={i} position={[x, 0.2, z]} color={['#f2c94c', '#6fcf97', '#5e7bff', '#eb5757'][i]} scale={0.55} />
          ))}
        </group>
      </Bob>
      {/* splashes */}
      {[[-2, 0, 1], [2.2, 0, -1], [1.5, 0, 2]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#eaf4f8" transparent opacity={0.7} />
        </mesh>
      ))}
      <Rock position={[-3, 0.2, -2]} scale={1.6} />
      <Rock position={[3.4, 0.1, 1.5]} scale={1.3} />
    </group>
  );
}

function Boat() {
  return (
    <group>
      <Water color="#3a7e9a" />
      <Bob amp={0.08} speed={1} rot={0.04}>
        <group position={[0, 0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[3, 0.5, 1.2]} />
            <meshStandardMaterial color="#8a5a32" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.3, 3.2, 4, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#6b4424" roughness={0.8} />
          </mesh>
          <Person position={[-0.6, 0.4, 0]} color="#5e7bff" scale={0.6} />
          <Person position={[0.7, 0.4, 0]} color="#f2c94c" scale={0.6} />
        </group>
      </Bob>
      {/* distant fort silhouette */}
      <mesh position={[-10, 2, -14]}><boxGeometry args={[6, 5, 2]} /><meshStandardMaterial color="#4a4f5e" /></mesh>
      <Sun position={[9, 5, -16]} color="#ffd27a" size={2.6} />
    </group>
  );
}

function Scuba() {
  const diver = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (diver.current) {
      diver.current.position.y = 1 + Math.sin(s.clock.elapsedTime * 0.8) * 0.4;
      diver.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <group>
      <Ground color="#caa46a" y={-3} size={40} />
      {/* coral */}
      {[[-4, -3, -2, '#e0607a'], [4, -3, 0, '#e08a3b'], [-2, -3, 3, '#7a5ad0'], [3, -3, 3, '#d85f9a']].map((c, i) => (
        <mesh key={i} position={[c[0] as number, (c[1] as number) + 0.8, c[2] as number]}>
          <coneGeometry args={[0.6, 1.8, 6]} />
          <meshStandardMaterial color={c[3] as string} roughness={0.8} />
        </mesh>
      ))}
      {/* fish */}
      {[[-5, 1, 2], [5, 2, -1], [-3, 3, -2], [2, 0.5, 4]].map((p, i) => (
        <FishSwim key={i} base={p as [number, number, number]} />
      ))}
      <group ref={diver}>
        <Person color="#1b2a44" scale={0.9} rotation={[Math.PI / 2.4, 0, 0]} />
        {/* tank */}
        <mesh position={[0, 0.9, -0.3]}><cylinderGeometry args={[0.16, 0.16, 0.7, 10]} /><meshStandardMaterial color="#d8d8d8" metalness={0.6} /></mesh>
      </group>
      {/* bubbles */}
      {[0, 1, 2, 3].map((i) => <Bubble key={i} x={0.3 + i * 0.05} delay={i * 0.6} />)}
    </group>
  );
}

function FishSwim({ base }: { base: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const t = s.clock.elapsedTime * 0.5 + base[0];
      ref.current.position.set(base[0] + Math.sin(t) * 3, base[1] + Math.sin(t * 1.4) * 0.4, base[2] + Math.cos(t) * 2);
      ref.current.rotation.y = -t;
    }
  });
  return (
    <mesh ref={ref}>
      <coneGeometry args={[0.18, 0.7, 6]} />
      <meshStandardMaterial color="#ffd27a" roughness={0.7} />
    </mesh>
  );
}

function Bubble({ x, delay }: { x: number; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const t = ((s.clock.elapsedTime + delay) % 3) / 3;
      ref.current.position.set(x + Math.sin(t * 10) * 0.1, 1.6 + t * 4, -0.2);
      (ref.current.material as THREE.MeshStandardMaterial).opacity = 1 - t;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#dff3ff" transparent opacity={0.6} />
    </mesh>
  );
}

function Zipline() {
  const slider = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (slider.current) {
      const t = (s.clock.elapsedTime * 0.18) % 1;
      slider.current.position.set(-5 + t * 10, 4 - t * 2.2, 0);
    }
  });
  const towerL: [number, number, number] = [-5, 0, 0];
  const towerR: [number, number, number] = [5, 0, 0];
  return (
    <group>
      <Ground color="#3f6b46" />
      {[towerL, towerR].map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, 0]} castShadow>
          <boxGeometry args={[0.4, 5 - i * 2, 0.4]} />
          <meshStandardMaterial color="#5a4634" roughness={1} />
        </mesh>
      ))}
      {/* cable */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, -0.22]}>
        <cylinderGeometry args={[0.03, 0.03, 10.2, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <group ref={slider}>
        <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.3, 0.2, 0.3]} /><meshStandardMaterial color="#cccccc" metalness={0.6} /></mesh>
        <Person position={[0, -0.6, 0]} color="#e8743b" scale={0.7} rotation={[0.2, 0, 0]} />
      </group>
      <PineTree position={[-3, 0, 3]} scale={1.4} />
      <PineTree position={[3, 0, 3]} scale={1.2} />
      <PineTree position={[0, 0, -4]} scale={1.6} />
    </group>
  );
}

function Paraglide() {
  return (
    <group>
      <Bob amp={0.3} speed={0.8} rot={0.08}>
        <group position={[0, 1.5, 0]}>
          {/* canopy wing */}
          <mesh position={[0, 2.4, 0]} scale={[3.2, 0.5, 1.4]}>
            <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e8743b" side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
          {/* lines */}
          {[-1.2, -0.4, 0.4, 1.2].map((x) => (
            <mesh key={x} position={[x, 1.3, 0]} rotation={[0, 0, x * 0.12]}>
              <cylinderGeometry args={[0.015, 0.015, 2.4, 4]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          ))}
          <Person color="#1b2a44" scale={0.9} />
        </group>
      </Bob>
      <CloudPuff position={[-6, 0, -6]} scale={1.6} />
      <CloudPuff position={[6, 2, -8]} scale={1.8} />
      <CloudPuff position={[0, -3, -4]} scale={2} />
      <Cliff position={[0, -10, -8]} width={10} height={12} depth={8} />
      <Sun position={[10, 6, -18]} color="#ffd27a" size={2.6} />
    </group>
  );
}

function HotAir() {
  return (
    <group>
      <Drift from={-0.5} to={0.8} speed={0.4} axis="y">
        <group>
          {/* balloon */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <sphereGeometry args={[2, 24, 24]} />
            <meshStandardMaterial color="#d8492f" roughness={0.5} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 3.4, 0]} rotation={[0, (i / 5) * Math.PI, 0]}>
              <torusGeometry args={[2, 0.06, 8, 24, Math.PI]} />
              <meshStandardMaterial color="#f2c94c" />
            </mesh>
          ))}
          {/* basket + lines */}
          {[[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]].map(([x, z], i) => (
            <mesh key={i} position={[x, 1.6, z]}><cylinderGeometry args={[0.02, 0.02, 1.6, 4]} /><meshStandardMaterial color="#222" /></mesh>
          ))}
          <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[1.1, 0.8, 1.1]} /><meshStandardMaterial color="#8a5a32" /></mesh>
          <Person position={[0, 1.1, 0]} color="#5e7bff" scale={0.55} />
        </group>
      </Drift>
      <CloudPuff position={[-6, -1, -6]} scale={1.6} />
      <CloudPuff position={[7, 1, -8]} scale={1.8} />
      <Sun position={[9, 5, -16]} color="#ffd27a" size={2.4} />
    </group>
  );
}

function Climb() {
  const climber = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (climber.current) {
      const t = (s.clock.elapsedTime * 0.1) % 1;
      climber.current.position.set(Math.sin(t * 10) * 0.3, -3 + t * 6, 3.2);
    }
  });
  return (
    <group>
      <Ground color="#5b6a52" />
      <Cliff position={[0, 4, 0]} width={9} height={16} depth={4} color="#6a5d62" />
      {/* holds */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 6, Math.random() * 9, 2.05]}>
          <dodecahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#9a8a70" flatShading />
        </mesh>
      ))}
      <group ref={climber}>
        <Person color="#e8743b" scale={0.85} rotation={[0, Math.PI, 0]} />
      </group>
      <PineTree position={[-5, 0, 4]} />
    </group>
  );
}

function Rappel() {
  const r = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (r.current) {
      const t = (s.clock.elapsedTime * 0.12) % 1;
      r.current.position.set(0, 8 - t * 9, 2.4);
    }
  });
  return (
    <group>
      <Ground color="#56654e" />
      <Cliff position={[0, 5, 0]} width={10} height={18} depth={4} color="#5c5360" />
      {/* rope from top */}
      <mesh position={[0, 6, 2.1]}><cylinderGeometry args={[0.03, 0.03, 12, 6]} /><meshStandardMaterial color="#e8743b" /></mesh>
      <group ref={r}>
        <Person color="#5e7bff" scale={0.85} rotation={[0, Math.PI, -0.2]} />
      </group>
      {/* waterfall accent */}
      <mesh position={[3, 5, 2.05]}><planeGeometry args={[1.4, 14]} /><meshStandardMaterial color="#bfe0ec" transparent opacity={0.55} /></mesh>
    </group>
  );
}

function Wildlife() {
  const deer = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (deer.current) deer.current.position.x = -2 + Math.sin(s.clock.elapsedTime * 0.4) * 2;
  });
  return (
    <group>
      <Ground color="#3f5c3a" />
      {[[-6, 4], [6, 3], [-3, -4], [4, -3], [0, -6], [-8, -1]].map(([x, z], i) => (
        <PineTree key={i} position={[x, 0, z]} scale={1.2 + (i % 3) * 0.3} />
      ))}
      {/* deer */}
      <group ref={deer} position={[-2, 0, 2]}>
        <mesh position={[0, 0.9, 0]} castShadow><capsuleGeometry args={[0.35, 0.9, 4, 8]} /><meshStandardMaterial color="#a06a3c" roughness={0.9} /></mesh>
        <mesh position={[0.6, 1.3, 0]} castShadow><sphereGeometry args={[0.22, 10, 10]} /><meshStandardMaterial color="#8a5a30" /></mesh>
        {[[-0.25, 0.3], [0.25, 0.3], [-0.25, -0.3], [0.25, -0.3]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.35, z]}><cylinderGeometry args={[0.07, 0.07, 0.7, 6]} /><meshStandardMaterial color="#6b4424" /></mesh>
        ))}
        {/* antlers */}
        <mesh position={[0.7, 1.6, 0.1]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.03, 0.03, 0.4, 4]} /><meshStandardMaterial color="#caa15a" /></mesh>
        <mesh position={[0.7, 1.6, -0.1]} rotation={[0, 0, 0.5]}><cylinderGeometry args={[0.03, 0.03, 0.4, 4]} /><meshStandardMaterial color="#caa15a" /></mesh>
      </group>
      <Sun position={[8, 6, -16]} color="#fff0c0" size={2} />
    </group>
  );
}

function Caving() {
  return (
    <group>
      <Ground color="#1a1712" size={30} />
      {/* cave walls */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <Rock key={i} position={[Math.cos(a) * 8, 1 + (i % 3) * 1.5, Math.sin(a) * 8 - 4]} scale={2.4 + (i % 3)} color="#3a3530" />;
      })}
      {/* stalactites */}
      {[[-3, -2], [2, -3], [0, -5], [-1, -4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 6, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.3, 2.2, 6]} />
          <meshStandardMaterial color="#4a443c" flatShading />
        </mesh>
      ))}
      {/* explorer with lantern */}
      <group position={[0, 0, 2]}>
        <Person color="#caa15a" scale={0.9} />
        <mesh position={[0.5, 0.9, 0.2]}><sphereGeometry args={[0.18, 12, 12]} /><meshBasicMaterial color="#ffce6b" toneMapped={false} /></mesh>
        <pointLight position={[0.5, 1, 0.4]} color="#ffc15c" intensity={8} distance={16} />
      </group>
    </group>
  );
}

function Waterfall() {
  const fall = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (fall.current) {
      const m = fall.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.6 + Math.sin(s.clock.elapsedTime * 6) * 0.08;
    }
  });
  return (
    <group>
      <Cliff position={[0, 5, -2]} width={12} height={18} depth={5} color="#4f5a52" />
      {/* falling water sheet */}
      <mesh ref={fall} position={[0, 4, 0.6]}>
        <planeGeometry args={[2.4, 16]} />
        <meshStandardMaterial color="#dbeef5" transparent opacity={0.65} roughness={0.2} metalness={0.3} />
      </mesh>
      {/* plunge pool */}
      <Water color="#2f6f86" size={50} />
      {/* mist at the base */}
      <CloudPuff position={[0, -0.2, 2]} scale={1.4} />
      <CloudPuff position={[-2, 0.2, 2.4]} scale={1} />
      <CloudPuff position={[2.2, 0.1, 2.2]} scale={1.1} />
      <Rock position={[-3, 0.2, 2.5]} scale={1.6} />
      <Rock position={[3.2, 0.1, 2]} scale={1.3} />
      <PineTree position={[-6, 0, 1]} scale={1.4} />
      <PineTree position={[6, 0, 0]} scale={1.6} />
      <Person position={[3.6, 0, 4]} color="#e8743b" scale={0.8} rotation={[0, -0.8, 0]} />
    </group>
  );
}

function FortWalk() {
  return (
    <group>
      <Ground color="#7c6a44" />
      <Mountain position={[0, -1, -10]} height={12} radius={8} snow={false} />
      {/* rampart walls — stepped stone blocks */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={x} position={[x, 1.4 + (i % 2) * 0.4, -1]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 2.8 + (i % 2) * 0.8, 1.6]} />
          <meshStandardMaterial color={i % 2 ? '#8a7656' : '#7a674b'} flatShading roughness={1} />
        </mesh>
      ))}
      {/* battlement merlons */}
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((x) => (
        <mesh key={x} position={[x, 3.1, -0.5]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#6f5d44" flatShading roughness={1} />
        </mesh>
      ))}
      {/* archway gate */}
      <mesh position={[0, 1, 0.2]}>
        <boxGeometry args={[1.4, 2, 0.4]} />
        <meshStandardMaterial color="#2c241a" roughness={1} />
      </mesh>
      {/* saffron flag */}
      <group position={[3, 4, -0.5]}>
        <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.05, 0.05, 2, 6]} /><meshStandardMaterial color="#3a2f22" /></mesh>
        <mesh position={[0.45, 1.4, 0]}><planeGeometry args={[0.9, 0.5]} /><meshStandardMaterial color="#f08a1d" side={THREE.DoubleSide} /></mesh>
      </group>
      <Person position={[-1.4, 0, 3]} color="#d94f3d" scale={0.9} rotation={[0, 0.5, 0]} />
      <Person position={[1.2, 0, 3.4]} color="#5e7bff" scale={0.85} rotation={[0, -0.4, 0]} />
      <Sun position={[9, 6, -16]} color="#ffd27a" size={2.4} />
    </group>
  );
}

function Cycle() {
  const rider = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (rider.current) {
      rider.current.position.x = Math.sin(t * 0.4) * 4;
      rider.current.position.z = Math.cos(t * 0.4) * 2;
      rider.current.rotation.y = -t * 0.4 + Math.PI / 2;
      rider.current.position.y = Math.abs(Math.sin(t * 6)) * 0.06;
    }
    if (wheels.current) wheels.current.rotation.x = -t * 6;
  });
  return (
    <group>
      <Ground color="#5e7a47" />
      {/* dirt trail loop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[3.4, 4.6, 48]} />
        <meshStandardMaterial color="#9a7b50" roughness={1} />
      </mesh>
      <group ref={rider} position={[4, 0, 0]}>
        {/* frame */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.3]}><boxGeometry args={[0.9, 0.08, 0.08]} /><meshStandardMaterial color="#e8743b" metalness={0.4} /></mesh>
        <group ref={wheels}>
          <mesh position={[0.45, 0.3, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.32, 0.05, 8, 20]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
          <mesh position={[-0.45, 0.3, 0]}><torusGeometry args={[0.32, 0.05, 8, 20]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
        </group>
        <Person position={[0, 0.5, 0]} color="#f2c94c" scale={0.6} rotation={[0.3, 0, 0]} />
      </group>
      <PineTree position={[-6, 0, -4]} scale={1.5} />
      <PineTree position={[6, 0, -3]} scale={1.3} />
      <PineTree position={[0, 0, -7]} scale={1.7} />
      <Mountain position={[-2, 0, -12]} height={10} radius={6} snow={false} />
      <Sun position={[8, 6, -16]} color="#fff0c0" size={2.2} />
    </group>
  );
}

function Safari() {
  const jeep = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (jeep.current) {
      const t = s.clock.elapsedTime;
      jeep.current.position.x = -3 + Math.sin(t * 0.3) * 3;
      jeep.current.position.y = Math.sin(t * 8) * 0.03;
    }
  });
  return (
    <group>
      <Ground color="#8a7a4a" />
      {/* tall grass tufts */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r = 5 + (i % 4);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.4, Math.sin(a) * r]}>
            <coneGeometry args={[0.25, 0.9, 5]} />
            <meshStandardMaterial color="#9aa04a" flatShading roughness={1} />
          </mesh>
        );
      })}
      {/* safari jeep */}
      <group ref={jeep} position={[-3, 0, 1]}>
        <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[2.2, 0.7, 1.1]} /><meshStandardMaterial color="#4a5d3a" roughness={0.7} /></mesh>
        <mesh position={[0.5, 1.1, 0]}><boxGeometry args={[1, 0.6, 1]} /><meshStandardMaterial color="#3a4a2e" /></mesh>
        {[[-0.7, 0.6], [0.7, 0.6], [-0.7, -0.6], [0.7, -0.6]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.25, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.28, 0.2, 12]} /><meshStandardMaterial color="#1c1c1c" /></mesh>
        ))}
        <Person position={[0.5, 1.1, 0]} color="#caa15a" scale={0.5} />
      </group>
      {/* a watching elephant silhouette */}
      <group position={[5, 0, -2]}>
        <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><capsuleGeometry args={[0.9, 1.4, 6, 10]} /><meshStandardMaterial color="#6b6b6b" roughness={1} /></mesh>
        <mesh position={[1.1, 1.6, 0]} castShadow><sphereGeometry args={[0.6, 12, 12]} /><meshStandardMaterial color="#6b6b6b" /></mesh>
        <mesh position={[1.5, 1.0, 0]} rotation={[0, 0, -0.6]}><cylinderGeometry args={[0.12, 0.05, 1, 8]} /><meshStandardMaterial color="#6b6b6b" /></mesh>
        {[[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.5, z]}><cylinderGeometry args={[0.22, 0.22, 1, 8]} /><meshStandardMaterial color="#5e5e5e" /></mesh>
        ))}
      </group>
      <PineTree position={[-7, 0, -4]} scale={1.4} />
      <Sun position={[9, 5, -16]} color="#ffce8a" size={2.6} />
    </group>
  );
}

export const SCENE_REGISTRY: Record<ActivitySceneType, () => JSX.Element> = {
  trek: Trek,
  sunrise: Sunrise,
  camp: Camp,
  kayak: Kayak,
  raft: Raft,
  boat: Boat,
  scuba: Scuba,
  zipline: Zipline,
  paraglide: Paraglide,
  hotair: HotAir,
  climb: Climb,
  rappel: Rappel,
  wildlife: Wildlife,
  caving: Caving,
  waterfall: Waterfall,
  fortwalk: FortWalk,
  cycle: Cycle,
  safari: Safari,
};
