import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * A pointer-reactive 3D tilt card. Tracks the cursor over the element and rotates
 * it in 3D (with a soft spring), plus a subtle glare. Used to give the Explore
 * cards depth and a "cool effect" on hover.
 */
export function Tilt({
  children,
  className = '',
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 18 });
  const glareX = useTransform(mx, [0, 1], ['0%', '100%']);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
    >
      {children}
      <motion.span
        className="tilt__glare"
        aria-hidden="true"
        style={{ background: useTransform(glareX, (x) => `radial-gradient(circle at ${x} 0%, rgba(255,255,255,0.18), transparent 60%)`) }}
      />
    </motion.div>
  );
}
