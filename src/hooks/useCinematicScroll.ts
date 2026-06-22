import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '@/lib/scrollStore';
import { landmarkAt } from '@/experience/mapRoute';

gsap.registerPlugin(ScrollTrigger);

/**
 * Binds native page scroll → the global `progress` store via a single scrubbed
 * ScrollTrigger spanning the whole cinematic container. This is the only place
 * GSAP touches the scroll position; the WebGL layer just reads the store.
 */
export function useCinematicScroll(containerRef: React.RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const { setProgress, setScene } = useScrollStore.getState();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          setProgress(p);
          setScene(landmarkAt(p).index);
        },
      });
    }, el);

    // Recompute on resize/font-load so section heights stay accurate.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);

    return () => {
      ctx.revert();
      window.removeEventListener('load', refresh);
    };
  }, [containerRef]);
}
