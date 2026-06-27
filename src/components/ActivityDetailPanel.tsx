import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { activityImage, activityItinerary, activityIncluded, CATEGORY_LABELS } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { toast } from '@/lib/toastStore';
import type { ActivityWithDest } from './ActivityMap';
import { CATEGORY_COLORS } from './ActivityMap';

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="adp-stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'adp-star adp-star--on' : 'adp-star'}>★</span>
      ))}
    </span>
  );
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Month-view calendar with start→end range selection. */
function RangeCalendar({
  from,
  to,
  onPick,
}: {
  from: string;
  to: string;
  onPick: (date: string) => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="adp-calendar">
      <div className="adp-calendar__head">
        <button type="button" onClick={prev} aria-label="Previous month">‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button type="button" onClick={next} aria-label="Next month">›</button>
      </div>
      <div className="adp-calendar__grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="adp-calendar__dow">{d}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = dateStr < todayStr;
          const isStart = dateStr === from;
          const isEnd = dateStr === to;
          const inRange = from && to && dateStr > from && dateStr < to;
          const cls = [
            'adp-calendar__day',
            isStart || isEnd ? 'is-selected' : '',
            inRange ? 'is-in-range' : '',
            isPast ? 'is-past' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={day}
              type="button"
              className={cls}
              disabled={isPast}
              onClick={() => !isPast && onPick(dateStr)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  activity: ActivityWithDest | null;
  onClose: () => void;
}

const DEFAULT_REVIEWS = [
  { author: 'Aarav S.', rating: 5, text: 'Genuinely the best-organised experience I have done. Guides were superb.' },
  { author: 'Meera K.', rating: 5, text: 'Absolutely worth every rupee. Views were unreal.' },
  { author: 'Daniel P.', rating: 4, text: 'Stunning scenery — bring good shoes and a camera!' },
];

const fmt = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export function ActivityDetailPanel({ activity, onClose }: Props) {
  const navigate = useNavigate();
  const { addPlannedTrip } = usePlatformStore();
  const { user } = useAuthStore();

  const [people, setPeople] = useState(2);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  if (!activity) return null;

  const photo = activity.image ?? activityImage(activity.sceneType, 1600);
  const color = CATEGORY_COLORS[activity.category] || '#ff7a3d';
  const reviews = (activity.reviews && activity.reviews.length > 0) ? activity.reviews : DEFAULT_REVIEWS;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const slug = activity.destination.slug;
  const itinerary = activityItinerary(activity);
  const included = activityIncluded(activity);
  const operator = activity.destination.operators?.[0];

  // Range selection: first pick = start, second = end, third resets.
  const pickDate = (d: string) => {
    if (!from || (from && to)) { setFrom(d); setTo(''); return; }
    if (d < from) { setFrom(d); return; }
    setTo(d);
  };

  const days = from ? (to ? Math.round((+new Date(to) - +new Date(from)) / 86_400_000) + 1 : 1) : 0;
  const total = activity.pricePerPerson * people * Math.max(1, days);

  const handleSave = () => {
    if (!user) {
      toast('Sign in to save trips ♥', 'info');
      navigate('/login');
      return;
    }
    if (!from) {
      toast('Pick at least one date to save', 'info');
      return;
    }
    addPlannedTrip({
      destinationSlug: slug,
      destinationName: activity.destination.name,
      activityId: activity.id,
      activityName: activity.name,
      image: photo,
      dateFrom: from,
      dateTo: to || from,
      people,
      total,
    });
    onClose();
  };

  const handleBook = () => {
    const params = new URLSearchParams();
    if (from) params.set('date', from);
    params.set('people', String(people));
    navigate(`/book/${slug}/${activity.id}?${params}`);
  };

  return (
    <AnimatePresence>
      {activity && (
        <motion.div
          className="adp-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="adp"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo background */}
            <div className="adp__photo" style={{ backgroundImage: `url(${photo})` }}>
              <div className="adp__photo-overlay" />
              <button className="adp__close" onClick={onClose} aria-label="Close">✕</button>
              <div className="adp__photo-header">
                <span className="adp__cat" style={{ background: color }}>
                  {CATEGORY_LABELS[activity.category]}
                </span>
                <h2 className="adp__name">{activity.name}</h2>
                <div className="adp__dest">{activity.destination.name} · {activity.destination.region}</div>
                <div className="adp__meta-row">
                  <StarRating rating={avgRating} />
                  <span className="adp__rating-count">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
                  <span className={`adp__diff difficulty--${activity.difficulty}`}>{activity.difficulty}</span>
                  <span className="adp__dur">⏱ {activity.durationHours}h</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="adp__body">
              {/* Left: description + reviews */}
              <div className="adp__left">
                <section className="adp__desc">
                  <h3>About</h3>
                  <p>{activity.description}</p>
                  {operator && (
                    <p className="adp__operator">
                      Operated by <strong>{operator.name}</strong>
                      {operator.verified && <span className="adp__verified">✓ Verified partner</span>}
                      <span className="adp__op-rating">★ {operator.rating}</span>
                    </p>
                  )}
                </section>

                <section className="adp__itinerary">
                  <h3>Itinerary</h3>
                  <ol className="adp__timeline">
                    {itinerary.map((step, i) => (
                      <li key={i}>
                        <span className="adp__timeline-num">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="adp__included">
                  <h3>What's included</h3>
                  <ul className="adp__included-list">
                    {included.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section className="adp__reviews">
                  <h3>Reviews</h3>
                  <div className="adp__review-list">
                    {reviews.map((r, i) => (
                      <article key={i} className="adp__review">
                        <div className="adp__review-head">
                          <span className="adp__review-author">{r.author}</span>
                          <StarRating rating={r.rating} />
                        </div>
                        <p>{r.text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right: calendar + booking */}
              <div className="adp__right">
                <div className="adp__booking">
                  <h3>Pick your dates</h3>
                  <p className="adp__cal-hint">
                    {!from && 'Tap a start date'}
                    {from && !to && `Start ${fmt(from)} — tap an end date for a multi-day trip`}
                    {from && to && `${fmt(from)} → ${fmt(to)} · ${days} days`}
                  </p>
                  <RangeCalendar from={from} to={to} onPick={pickDate} />

                  <div className="adp__people">
                    <span>People</span>
                    <div className="adp__stepper">
                      <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</button>
                      <span>{people}</span>
                      <button type="button" onClick={() => setPeople((p) => Math.min(12, p + 1))}>+</button>
                    </div>
                  </div>

                  <div className="adp__total">
                    <span>Total{days > 1 ? ` · ${days} days` : ''}</span>
                    <strong>₹{total.toLocaleString('en-IN')}</strong>
                  </div>
                  <p className="adp__price-note">
                    ₹{activity.pricePerPerson.toLocaleString('en-IN')} per person{days > 1 ? ' / day' : ''}
                  </p>

                  <button
                    className="btn btn--primary adp__book-btn"
                    onClick={handleBook}
                    disabled={!from}
                  >
                    {from ? 'Book Now →' : 'Select a date'}
                  </button>

                  <button className="btn btn--ghost adp__save-btn" onClick={handleSave}>
                    ♡ Save Trip{days > 1 ? ` (${days} days)` : ''}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
