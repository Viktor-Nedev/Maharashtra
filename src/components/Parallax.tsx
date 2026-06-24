import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Props {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px across the element's scroll range. + = moves up. */
  offset?: number;
}

/**
 * Scroll-linked parallax wrapper. As the element passes through the viewport its
 * content drifts vertically, giving depth to the home scenes (foreground copy and
 * background media move at different rates).
 */
export function Parallax({ children, className, offset = 60 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
