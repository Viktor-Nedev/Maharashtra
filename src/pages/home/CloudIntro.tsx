import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScrollStore } from '@/lib/scrollStore';

const CLOUDS = 'https://assets.codepen.io/557388/clouds.png';

/**
 * Page-load transition: a sky of drifting clouds that PART (left/right) and fade
 * to reveal the cinematic flight beneath. Stays visible until the WebGL scene is
 * ready AND a minimum on-screen time has elapsed, so the reveal always plays.
 */
export function CloudIntro({ ready }: { ready: boolean }) {
  const [minElapsed, setMinElapsed] = useState(false);
  const preload = useScrollStore((s) => s.preloadProgress);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const visible = !(ready && minElapsed);
  // Real preload progress (0–1) so the bar reflects actual map loading.
  const pct = ready ? 1 : Math.max(0.04, Math.min(0.99, preload));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="cloud-intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          {/* Drifting + parting cloud banks */}
          <motion.div
            className="cloud-intro__bank cloud-intro__bank--left"
            style={{ backgroundImage: `url(${CLOUDS})` }}
            initial={{ x: '8%', opacity: 1 }}
            animate={{ x: '0%' }}
            exit={{ x: '-115%', opacity: 0.6 }}
            transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1] }}
          />
          <motion.div
            className="cloud-intro__bank cloud-intro__bank--right"
            style={{ backgroundImage: `url(${CLOUDS})` }}
            initial={{ x: '-8%', opacity: 1 }}
            animate={{ x: '0%' }}
            exit={{ x: '115%', opacity: 0.6 }}
            transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1] }}
          />

          {/* Brand + status */}
          <motion.div className="cloud-intro__center" exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: 0.7 }}>
            <span className="cloud-intro__brand">MAHARASHTRA</span>
            <span className="cloud-intro__tag">
              {ready ? 'Clear skies ahead' : `Loading the map… ${Math.round(pct * 100)}%`}
            </span>
            <div className="cloud-intro__bar">
              <motion.div
                className="cloud-intro__bar-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
