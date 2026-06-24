import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ACTIVITY_SHOWCASE,
  CATEGORY_LABELS,
  DESTINATIONS,
  activityImage,
  type ActivityCategory,
} from '@/data/destinations';
import { WorldMap } from '@/components/WorldMap';
import { Tilt } from '@/components/Tilt';
import { ExploreHero3D } from '@/components/ExploreHero3D';
import { usePlatformStore } from '@/lib/store';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ActivityCategory[];

/** Hide a broken Unsplash image so the figure's gradient shows instead. */
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.opacity = '0';
};

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

  const showcase = useMemo(
    () =>
      ACTIVITY_SHOWCASE.filter(
        ({ activity }) => filter === 'all' || activity.category === filter,
      ),
    [filter],
  );

  return (
    <div className="explore">
      {/* Ambient side decorations */}
      <div className="explore__orbs" aria-hidden="true">
        <span className="orb orb--1" />
        <span className="orb orb--2" />
        <span className="orb orb--3" />
        <span className="explore__grid-lines" />
      </div>

      {/* Hero: copy + live 3D globe */}
      <section className="explore__hero explore__hero--split">
        <motion.div
          className="explore__hero-copy"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">The Platform</span>
          <h1>
            Find your next <span className="grad-text">adventure</span>
          </h1>
          <p>Six signature regions. Eighteen kinds of experience across Maharashtra — trek, dive, glide, ride.</p>
          <div className="explore__hero-stats">
            <div><strong>{DESTINATIONS.length}</strong><span>regions</span></div>
            <div><strong>{DESTINATIONS.reduce((n, d) => n + d.activities.length, 0)}</strong><span>activities</span></div>
            <div><strong>4.8★</strong><span>avg rating</span></div>
          </div>
          <div className="explore__hero-cta">
            <a href="#experiences" className="btn btn--primary">Browse experiences</a>
            <Link to="/planner" className="btn btn--ghost">Plan a trip</Link>
          </div>
        </motion.div>

        <motion.div
          className="explore__hero-art"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <ExploreHero3D />
        </motion.div>
      </section>

      {/* Controls */}
      <div className="explore__controls">
        <input
          className="explore__search"
          placeholder="Search destinations or activities…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <button className={`chip ${filter === 'all' ? 'is-active' : ''}`} onClick={() => setFilter('all')}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip ${filter === c ? 'is-active' : ''}`} onClick={() => setFilter(c)}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Activities showcase with photos + 3D tilt */}
      <section className="experiences" id="experiences">
        <h2 className="section-title">Signature experiences</h2>
        <div className="exp-grid">
          {showcase.map(({ activity, destination }, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.5 }}
            >
              <Tilt className="exp-card">
                <Link to={`/book/${destination.slug}/${activity.id}`} className="exp-card__inner">
                  <div className="exp-card__media">
                    <img src={activityImage(activity.sceneType)} alt={activity.name} loading="lazy" onError={hideBroken} />
                    <span className="exp-card__cat">{CATEGORY_LABELS[activity.category]}</span>
                    <span className={`exp-card__diff difficulty--${activity.difficulty}`}>{activity.difficulty}</span>
                  </div>
                  <div className="exp-card__body">
                    <h3>{activity.name}</h3>
                    <p>{destination.name} · {activity.durationHours}h</p>
                    <div className="exp-card__foot">
                      <span className="price">₹{activity.pricePerPerson.toLocaleString('en-IN')}</span>
                      <span className="exp-card__go">Book →</span>
                    </div>
                  </div>
                </Link>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="explore__map">
        <h2 className="section-title">Explore the map</h2>
        <WorldMap />
      </section>

      {/* Destination cards */}
      <section className="card-grid-section">
        <h2 className="section-title">Regions</h2>
        <div className="card-grid">
          {destinations.map((d, i) => (
            <motion.article
              key={d.id}
              className="dest-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.5 }}
            >
              <Link to={`/destination/${d.slug}`} className="dest-card__media">
                <img src={d.image} alt={d.name} loading="lazy" onError={hideBroken} />
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
                  <span>from ₹{Math.min(...d.activities.map((a) => a.pricePerPerson)).toLocaleString('en-IN')}</span>
                </div>
                <Link to={`/destination/${d.slug}`} className="btn btn--ghost btn--sm">View</Link>
              </div>
            </motion.article>
          ))}
          {destinations.length === 0 && <p className="empty">No matches — try another filter.</p>}
        </div>
      </section>
    </div>
  );
}
