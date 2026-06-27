import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  CATEGORY_LABELS,
  DESTINATIONS,
  activityImage,
  type ActivityCategory,
} from '@/data/destinations';
import { ActivityMap, type ActivityWithDest, CATEGORY_COLORS } from '@/components/ActivityMap';
import { ActivityDetailPanel } from '@/components/ActivityDetailPanel';
import { SideParticles } from '@/components/SideParticles';
import { Tilt } from '@/components/Tilt';
import { ExploreHero3D } from '@/components/ExploreHero3D';
import { ImageWithSkeleton } from '@/components/ImageWithSkeleton';
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

const matchesDuration = (hours: number, f: DurationFilter) => {
  if (f === 'any') return true;
  if (f === 'short') return hours < 4;
  if (f === 'half') return hours >= 4 && hours <= 8;
  return hours > 8;
};

export default function Explore() {
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [priceMax, setPriceMax] = useState(15000);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('any');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithDest | null>(null);
  const { toggleSaved, isSaved, toggleCompare, isComparing } = usePlatformStore();

  // All bookable activities that have a map pin, flattened with their region.
  const allActivitiesWithDest = useMemo<ActivityWithDest[]>(
    () =>
      DESTINATIONS.flatMap((d) =>
        d.activities
          .filter((a) => a.coordinates)
          .map((a) => ({ ...a, destination: d })),
      ),
    [],
  );

  // One filter pipeline drives BOTH the Signature experiences grid and the map.
  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allActivitiesWithDest.filter((a) => {
      const matchesCategory = filter === 'all' || a.category === filter;
      const matchesQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.destination.name.toLowerCase().includes(q) ||
        a.destination.region.toLowerCase().includes(q);
      const matchesPrice = a.pricePerPerson <= priceMax;
      return matchesCategory && matchesQuery && matchesPrice && matchesDuration(a.durationHours, durationFilter);
    });
  }, [allActivitiesWithDest, filter, query, priceMax, durationFilter]);

  // Regions that still have at least one matching activity.
  const destinations = useMemo(() => {
    const slugs = new Set(filteredActivities.map((a) => a.destination.slug));
    return DESTINATIONS.filter((d) => slugs.has(d.slug));
  }, [filteredActivities]);

  return (
    <div className="explore">
      {/* Ambient side decorations */}
      <div className="explore__orbs" aria-hidden="true">
        <span className="orb orb--1" />
        <span className="orb orb--2" />
        <span className="orb orb--3" />
        <span className="explore__grid-lines" />
      </div>

      {/* Floating particles on both edges */}
      <SideParticles side="left" />
      <SideParticles side="right" />

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
          <p>Six signature regions. Dozens of experiences across Maharashtra — trek, dive, glide, ride.</p>
          <div className="explore__hero-stats">
            <div><strong><CountUp to={DESTINATIONS.length} /></strong><span>regions</span></div>
            <div><strong><CountUp to={allActivitiesWithDest.length} /></strong><span>activities</span></div>
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
        {(filter !== 'all' || query || durationFilter !== 'any' || priceMax < 15000) && (
          <button
            className="explore__adv-reset"
            onClick={() => { setFilter('all'); setQuery(''); setPriceMax(15000); setDurationFilter('any'); }}
          >
            Reset filters ✕
          </button>
        )}
      </div>

      {/* Activities showcase — every pin activity, click opens the detail panel */}
      <section className="experiences" id="experiences">
        <div className="experiences__head">
          <h2 className="section-title">Signature experiences</h2>
          <span className="experiences__count">{filteredActivities.length} found</span>
        </div>
        <div className="exp-grid">
          {filteredActivities.map((activity, i) => (
            <motion.div
              key={`${activity.destination.slug}-${activity.id}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ delay: (i % 4) * 0.05, duration: 0.5 }}
            >
              <Tilt className="exp-card">
                <button
                  type="button"
                  className="exp-card__inner"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="exp-card__media">
                    <ImageWithSkeleton
                      src={activity.image ?? activityImage(activity.sceneType)}
                      alt={activity.name}
                      onImgError={hideBroken}
                    />
                    <span
                      className="exp-card__cat"
                      style={{ background: CATEGORY_COLORS[activity.category] }}
                    >
                      {CATEGORY_LABELS[activity.category]}
                    </span>
                    <span className={`exp-card__diff difficulty--${activity.difficulty}`}>{activity.difficulty}</span>
                  </div>
                  <div className="exp-card__body">
                    <h3>{activity.name}</h3>
                    <p>{activity.destination.name} · {activity.durationHours}h</p>
                    <div className="exp-card__foot">
                      <span className="price">₹{activity.pricePerPerson.toLocaleString('en-IN')}</span>
                      <span className="exp-card__go">View →</span>
                    </div>
                  </div>
                </button>
              </Tilt>
            </motion.div>
          ))}
          {filteredActivities.length === 0 && (
            <p className="empty">No experiences match your filters — try widening them.</p>
          )}
        </div>
      </section>

      {/* Activity map with pins (same filtered set) */}
      <section className="explore__map">
        <h2 className="section-title">Explore activities on the map</h2>
        <p className="explore__map-hint">Click any pin to see details, reviews and book</p>
        <ActivityMap
          activities={filteredActivities}
          onSelect={(a) => setSelectedActivity(a)}
          className="explore__activity-map"
        />
      </section>

      {/* Shared detail panel */}
      <ActivityDetailPanel
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* Destination cards */}
      <section className="card-grid-section">
        <h2 className="section-title">Regions</h2>
        <div className="card-grid">
          {destinations.map((d, i) => {
            const cats = Array.from(new Set(d.activities.map((a) => a.category)));
            return (
            <motion.article
              key={d.id}
              className={`dest-card ${flippedId === d.id ? 'is-flipped' : ''}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-8%' }}
              transition={{ delay: (i % 3) * 0.06, duration: 0.5 }}
              onClick={() => setFlippedId(flippedId === d.id ? null : d.id)}
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

                {/* Back face — stat banner (no 3D) */}
                <div className="dest-card__face dest-card__back">
                  <div
                    className="dest-card__back-hero"
                    style={{ background: `linear-gradient(150deg, ${d.heroColor}, #0c0e13)` }}
                  >
                    <span className="dest-card__back-tag">{d.region}</span>
                    <div className="dest-card__back-stats">
                      <div>
                        <span className="num">{d.elevation}m</span>
                        <span className="lbl">peak</span>
                      </div>
                      <div>
                        <span className="num">{d.activities.length}</span>
                        <span className="lbl">activities</span>
                      </div>
                      <div>
                        <span className="num">{d.bestSeason}</span>
                        <span className="lbl">best season</span>
                      </div>
                    </div>
                    <div className="dest-card__back-cats">
                      {cats.map((c) => (
                        <span key={c} className="dest-card__cat-dot" title={CATEGORY_LABELS[c]}>
                          <i style={{ background: CATEGORY_COLORS[c] }} />
                          {CATEGORY_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="dest-card__back-body">
                    <div>
                      <h3>{d.name}</h3>
                      <p className="dest-card__back-desc">{d.tagline}</p>
                      <div className="dest-card__meta">
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
