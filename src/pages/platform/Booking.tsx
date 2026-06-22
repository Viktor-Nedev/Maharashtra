import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDestinationBySlug } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';

export default function Booking() {
  const { slug, activityId } = useParams<{ slug: string; activityId: string }>();
  const addBooking = usePlatformStore((s) => s.addBooking);

  const dest = slug ? getDestinationBySlug(slug) : undefined;
  const activity = dest?.activities.find((a) => a.id === activityId);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [people, setPeople] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const total = useMemo(
    () => (activity ? activity.pricePerPerson * people : 0),
    [activity, people],
  );

  if (!dest || !activity) {
    return (
      <div className="booking booking--missing">
        <h1>Activity not found</h1>
        <Link to="/explore" className="btn btn--primary">Back to Explore</Link>
      </div>
    );
  }

  const handleConfirm = () => {
    addBooking({
      destinationSlug: dest.slug,
      destinationName: dest.name,
      activityId: activity.id,
      activityName: activity.name,
      date,
      people,
      total,
    });
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <motion.div className="booking booking--done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="booking__check">✓</div>
        <h1>Booking confirmed</h1>
        <p>
          {activity.name} at {dest.name} · {people} {people === 1 ? 'person' : 'people'} · {date}
        </p>
        <div className="scene__cta">
          <Link to="/account" className="btn btn--primary">View my trips</Link>
          <Link to="/explore" className="btn btn--ghost">Explore more</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="booking">
      <Link to={`/destination/${dest.slug}`} className="booking__back">← {dest.name}</Link>
      <div className="booking__grid">
        <div className="booking__summary" style={{ backgroundImage: `linear-gradient(180deg, rgba(5,7,13,.35), rgba(5,7,13,.8)), url(${dest.image})` }}>
          <span className="eyebrow">{dest.region}</span>
          <h1>{activity.name}</h1>
          <p>{activity.description}</p>
          <div className="booking__facts">
            <span>⏱ {activity.durationHours}h</span>
            <span className={`difficulty difficulty--${activity.difficulty}`}>{activity.difficulty}</span>
          </div>
        </div>

        <form className="booking__form" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
          <h2>Reserve your spot</h2>

          <label>
            Date
            <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>

          <label>
            Travellers
            <div className="stepper">
              <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</button>
              <span>{people}</span>
              <button type="button" onClick={() => setPeople((p) => Math.min(12, p + 1))}>+</button>
            </div>
          </label>

          <div className="booking__total">
            <div>
              <span>₹{activity.pricePerPerson.toLocaleString('en-IN')} × {people}</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--block">
            Confirm booking
          </button>
          <p className="booking__note">No payment required in demo mode.</p>
        </form>
      </div>
    </div>
  );
}
