import { useEffect, useRef, useState } from 'react';

/**
 * Custom pointer: a glowing accent dot that tracks the mouse exactly, trailing a
 * comet-like streak that stretches along the direction of travel and grows with
 * speed (and fades away when the pointer is still). The dot grows on interactive
 * elements and dips on press. Desktop / fine-pointer only — disabled on touch and
 * for reduced-motion users so it never gets in the way.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add('cursor-active');

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let prevX = mouse.x;
    let prevY = mouse.y;
    let vx = 0;
    let vy = 0;
    let angle = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Grow the dot when hovering anything clickable.
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'a, button, input, textarea, [role="button"], .chip, .dest-card',
      );
      dotRef.current?.classList.toggle('is-hover', !!interactive);
    };

    const onDown = () => dotRef.current?.classList.add('is-down');
    const onUp = () => dotRef.current?.classList.remove('is-down');

    const loop = () => {
      // Smooth the per-frame velocity so the trail length/angle don't jitter.
      const dx = mouse.x - prevX;
      const dy = mouse.y - prevY;
      prevX = mouse.x;
      prevY = mouse.y;
      vx += (dx - vx) * 0.25;
      vy += (dy - vy) * 0.25;
      const speed = Math.hypot(vx, vy);

      // Re-aim the trail only while actually moving; keep the last heading
      // otherwise so a near-still cursor doesn't spin from velocity noise.
      if (speed > 0.6) angle = Math.atan2(vy, vx);

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
      }
      if (trailRef.current) {
        const len = Math.min(72, speed * 1.9);
        trailRef.current.style.width = `${len}px`;
        trailRef.current.style.opacity = `${Math.min(0.9, speed / 7)}`;
        // Right-centre anchored at the dot, rotated to the heading; the body
        // extends backwards (against motion) into a fading tail.
        trailRef.current.style.transform =
          `translate(${mouse.x}px, ${mouse.y}px) rotate(${angle}rad) translate(-100%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('cursor-active');
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
