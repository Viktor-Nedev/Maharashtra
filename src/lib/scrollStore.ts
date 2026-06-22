import { create } from 'zustand';

// Single source of truth for the cinematic scroll. GSAP ScrollTrigger writes
// `progress` (0 → 1 across the whole homepage); the R3F scene reads it every
// frame to drive the airplane, camera, fog and colour grading. Keeping it in a
// store decouples the DOM scroll layer from the WebGL render layer cleanly.
interface ScrollState {
  /** Global scroll progress, 0 (top / above the clouds) → 1 (landing). */
  progress: number;
  /** Index of the currently dominant scene (0-based). */
  scene: number;
  /** True once the 3D assets are ready and the intro reveal has played. */
  ready: boolean;
  /** User opted into reduced motion / low-power rendering. */
  lowPower: boolean;
  setProgress: (p: number) => void;
  setScene: (s: number) => void;
  setReady: (r: boolean) => void;
  setLowPower: (v: boolean) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  scene: 0,
  ready: false,
  lowPower: false,
  setProgress: (progress) => set({ progress }),
  setScene: (scene) => set({ scene }),
  setReady: (ready) => set({ ready }),
  setLowPower: (lowPower) => set({ lowPower }),
}));
