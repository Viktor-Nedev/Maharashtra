import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const PANELS = 6;

/**
 * A cinematic page transition: on every route change a cascade of brand-coloured
 * panels wipes UP across the screen — covering the view, then continuing off the
 * top to reveal the new page beneath — with a glowing plane streaking through.
 * Keyed on the pathname so it re-mounts and replays on each navigation; it sits
 * above everything and never blocks interaction.
 */
export function RouteTransition() {
  const { pathname } = useLocation();

  return (
    <div className="route-transition" aria-hidden="true">
      <div key={pathname} className="route-transition__set">
        {Array.from({ length: PANELS }).map((_, i) => (
          <motion.div
            key={i}
            className="route-transition__panel"
            initial={{ y: '100%' }}
            animate={{ y: ['100%', '0%', '0%', '-100%'] }}
            transition={{
              duration: 1.05,
              times: [0, 0.4, 0.52, 1],
              delay: i * 0.05,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        ))}

        <motion.div
          className="route-transition__plane"
          initial={{ x: '-30vw', opacity: 0 }}
          animate={{ x: ['-30vw', '50vw', '130vw'], opacity: [0, 1, 0] }}
          transition={{ duration: 1.05, times: [0, 0.5, 1], ease: [0.5, 0, 0.5, 1] }}
        >
          ✈
        </motion.div>

        <motion.span
          className="route-transition__brand"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.05] }}
          transition={{ duration: 1.05, times: [0, 0.42, 0.52, 0.8], ease: 'easeInOut' }}
        >
          Maha<span>rashtra</span>
        </motion.span>
      </div>
    </div>
  );
}
