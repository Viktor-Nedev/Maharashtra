import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
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
import { ImageWithSkeleton } from '@/components/ImageWithSkeleton';
import { TerrainPreview } from '@/experience/TerrainPreview';
import { usePlatformStore } from '@/lib/store';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ActivityCategory[];

/** Hide a broken Unsplash image so the figure's gradient shows instead. */
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.opacity = '0';
};

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const ctrl = animate(mv, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const unsub = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return () => { ctrl.stop(); unsub(); };
  }, [mv, spring, to, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

type DurationFilter = 'any' | 'short' | 'half' | 'full';

const DURATION_LABELS: Record<DurationFilter, string> = {
  any: 'Any duration',
  short: '< 4h',
  half: '4–8h',
  full: 'Full day',
};

export default function Explore() {
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [priceMax, setPriceMax] = useState(15000);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('any');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { toggleSaved, isSaved, toggleCompare, isComparing } = usePlatformStore();

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
      const matchesPrice = d.activities.some((a) => a.pricePerPerson <= priceMax);
      const matchesDuration =
        durationFilter === 'any' ||
        d.activities.some((a) => {
          if (durationFilter === 'short') return a.durationHours < 4;
          if (durationFilter === 'half') return a.durationHours >= 4 && a.durationHours <= 8;
          if (durationFilter === 'full') return a.durationHours > 8;
          return true;
        });
      return matchesCategory && matchesQuery && matchesPrice && matchesDuration;
    });
  }, [filter, query, priceMax, durationFilter]);

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
            <div><strong><CountUp to={DESTINATIONS.length} /></strong><span>regions</span></div>
            <div><strong><CountUp to={DESTINATIONS.reduce((n, d) => n + d.activities.length, 0)} /></strong><span>activities</span></div>
            <div><strong><CountUp to={4.8} suffix="★" /></strong><span>avg rating</span></div>
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

      {/* Advanced filters */}
      <div className="explore__advanced">
        <div className="explore__adv-group">
          <label className="explore__adv-label">
            Max price: <strong>₹{priceMax.toLocaleString('en-IN')}</strong>
          </label>
          <input
            type="range"
            className="explore__price-slider"
            min={500}
            max={15000}
            step={500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
          />
        </div>
        <div className="explore__adv-group">
          <label className="explore__adv-label">Duration</label>
          <div className="chips">
            {(Object.keys(DURATION_LABELS) as DurationFilter[]).map((d) => (
              <button
                key={d}
                className={`chip chip--sm ${durationFilter === d ? 'is-active' : ''}`}
                onClick={() => setDurationFilter(d)}
              >
                {DURATION_LABELS[d]}
              </button>
            ))}
          </div>
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
                    <ImageWithSkeleton src={activityImage(activity.sceneType)} alt={activity.name} onImgError={hideBroken} />
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
          {destinations.map((d, i) => {
            const active = flippedId === d.id || hoveredId === d.id;
            return (
            <motion.article
              key={d.id}
              className={`dest-card ${flippedId === d.id ? 'is-flipped' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.5 }}
              onClick={() => setFlippedId(flippedId === d.id ? null : d.id)}
              onMouseEnter={() => setHoveredId(d.id)}
              onMouseLeave={() => setHoveredId((h) => (h === d.id ? null : h))}
            >
              <div className="dest-card__inner">
                {/* Front face */}
                <div className="dest-card__face dest-card__front">
                  <div className="dest-card__media">
                    <ImageWithSkeleton src={d.image} alt={d.name} onImgError={hideBroken} />
                    <span className="dest-card__region">{d.region}</span>
                  </div>
                  <button
                    className={`dest-card__compare ${isComparing(d.slug) ? 'is-on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleCompare(d.slug); }}
                    aria-label={isComparing(d.slug) ? 'Remove from comparison' : 'Add to comparison'}
                    title="Compare"
                  >
                    {isComparing(d.slug) ? '✓ Compare' : '⇄ Compare'}
                  </button>
                  <div className="dest-card__front-foot">
                    <h3>{d.name}</h3>
                    <span>{d.activities.length} exp</span>
                  </div>
                </div>

                {/* Back face — live procedural 3D terrain */}
                <div className="dest-card__face dest-card__back">
                  <div className="dest-card__terrain">
                    {active && <TerrainPreview slug={d.slug} />}
                    <span className="dest-card__terrain-label">3D terrain</span>
                  </div>
                  <div className="dest-card__back-body">
                    <div>
                      <span className="eyebrow">{d.region}</span>
                      <h3>{d.name}</h3>
                      <div className="dest-card__meta">
                        <span>{d.activities.length} activities</span>
                        <span>from ₹{Math.min(...d.activities.map((a) => a.pricePerPerson)).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="dest-card__back-actions">
                      <button
                        className={`dest-card__save ${isSaved(d.slug) ? 'is-saved' : ''}`}
                        aria-label="Save trip"
                        onClick={(e) => { e.stopPropagation(); toggleSaved(d.slug); }}
                      >
                        {isSaved(d.slug) ? '♥' : '♡'}
                      </button>
                      <Link
                        to={`/destination/${d.slug}`}
                        className="btn btn--primary btn--sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
            );
          })}
          {destinations.length === 0 && <p className="empty">No matches — try another filter.</p>}
        </div>
      </section>
    </div>
  );
}
