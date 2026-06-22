import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CATEGORY_LABELS,
  DESTINATIONS,
  type ActivityCategory,
} from '@/data/destinations';
import { WorldMap } from '@/components/WorldMap';
import { usePlatformStore } from '@/lib/store';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ActivityCategory[];

export default function Explore() {
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const { toggleSaved, isSaved } = usePlatformStore();

  const destinations = useMemo(() => {
    return DESTINATIONS.filter((d) => {
      const matchesCategory =
        filter === 'all' || d.activities.some((a) => a.category === filter);
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.activities.some((a) => a.name.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="explore">
      <section className="explore__hero">
        <span className="eyebrow">The Platform</span>
        <h1>Find your next adventure</h1>
        <p>Four signature regions. Fifteen+ curated experiences across Maharashtra.</p>
      </section>

      <section className="explore__map">
        <WorldMap />
      </section>

      <div className="explore__controls">
        <input
          className="explore__search"
          placeholder="Search destinations or activities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <button
            className={`chip ${filter === 'all' ? 'is-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${filter === c ? 'is-active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <section className="card-grid">
        {destinations.map((d, i) => (
          <motion.article
            key={d.id}
            className="dest-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <Link to={`/destination/${d.slug}`} className="dest-card__media">
              <img src={d.image} alt={d.name} loading="lazy" />
              <span className="dest-card__region">{d.region}</span>
            </Link>
            <button
              className={`dest-card__save ${isSaved(d.slug) ? 'is-saved' : ''}`}
              onClick={() => toggleSaved(d.slug)}
              aria-label="Save trip"
            >
              {isSaved(d.slug) ? '♥' : '♡'}
            </button>
            <div className="dest-card__body">
              <h3>{d.name}</h3>
              <p>{d.tagline}</p>
              <div className="dest-card__meta">
                <span>{d.activities.length} activities</span>
                <span>
                  from ₹
                  {Math.min(...d.activities.map((a) => a.pricePerPerson)).toLocaleString('en-IN')}
                </span>
              </div>
              <Link to={`/destination/${d.slug}`} className="btn btn--ghost btn--sm">
                View
              </Link>
            </div>
          </motion.article>
        ))}
        {destinations.length === 0 && <p className="empty">No matches — try another filter.</p>}
      </section>
    </div>
  );
}
