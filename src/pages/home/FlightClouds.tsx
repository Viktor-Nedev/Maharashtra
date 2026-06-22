import { useEffect, useRef } from 'react';
import { useScrollStore } from '@/lib/scrollStore';
import { LANDMARK_COUNT } from '@/experience/mapRoute';

const CLOUDS = 'https://assets.codepen.io/557388/clouds.png';
const LAYERS = 3;
const SEGMENTS = LANDMARK_COUNT - 1; // cloud "wipes" happen between landmarks

/**
 * Scroll-driven cloud transitions layered OVER the flight. Each cloud band drifts
 * (slow ambient motion + scroll parallax) and its opacity pulses between
 * landmarks — so as the plane travels from one place to the next it punches
 * through a bank of cloud, which clears as the next landmark arrives. Sits above
 * the plane (z 22) so clouds occasionally sweep in front of it for real depth.
 */
export function FlightClouds() {
  const layers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const p = useScrollStore.getState().progress;
      // 0 at each landmark, 1 mid-transit between them.
      const pulse = Math.pow(Math.sin(p * SEGMENTS * Math.PI), 2);

      layers.current.forEach((el, i) => {
        if (!el) return;
        const depth = 1 + i; // back → front
        const dir = i % 2 ? -1 : 1;
        // ambient time drift + scroll-coupled parallax
        const drift = (now * 0.004 * depth + p * 220 * depth) * dir;
        const x = ((drift % 160) + 160) % 160 - 30; // wrap, keep on-screen-ish
        const y = (i - 1) * 7 - p * 6 * depth;
        el.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${1.3 + i * 0.35})`;
        el.style.opacity = String(pulse * (0.55 - i * 0.1));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flight-clouds" aria-hidden="true">
      {Array.from({ length: LAYERS }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (layers.current[i] = el)}
          className="flight-clouds__band"
          style={{ backgroundImage: `url(${CLOUDS})` }}
        />
      ))}
    </div>
  );
}
