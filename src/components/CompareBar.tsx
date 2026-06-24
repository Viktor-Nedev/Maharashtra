import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getDestinationBySlug } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';

/**
 * Floating bar that surfaces when destinations are queued for comparison.
 * Hidden on the /compare page itself.
 */
export function CompareBar() {
  const { compare, toggleCompare, clearCompare } = usePlatformStore();
  const { pathname } = useLocation();

  const show = compare.length > 0 && pathname !== '/compare';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="compare-bar"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="compare-bar__thumbs">
            {compare.map((slug) => {
              const d = getDestinationBySlug(slug);
              if (!d) return null;
              return (
                <button
                  key={slug}
                  className="compare-bar__thumb"
                  style={{ backgroundImage: `url(${d.image})` }}
                  onClick={() => toggleCompare(slug)}
                  aria-label={`Remove ${d.name}`}
                  title={`Remove ${d.name}`}
                >
                  <span className="compare-bar__remove">✕</span>
                </button>
              );
            })}
          </div>
          <div className="compare-bar__actions">
            <button className="link-btn" onClick={clearCompare}>Clear</button>
            <Link to="/compare" className="btn btn--primary btn--sm">
              Compare {compare.length} →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
