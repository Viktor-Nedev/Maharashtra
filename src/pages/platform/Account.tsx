import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getDestinationBySlug } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useThemeStore } from '@/lib/themeStore';
import { TripCalendar, type TripEvent } from '@/components/TripCalendar';

type Tab = 'profile' | 'trips' | 'settings';

const fmtRange = (from: string, to: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const f = new Date(from + 'T00:00:00').toLocaleDateString('en-IN', opts);
  if (from === to) return f;
  const t = new Date(to + 'T00:00:00').toLocaleDateString('en-IN', opts);
  return `${f} → ${t}`;
};

export default function Account() {
  const [tab, setTab] = useState<Tab>('trips');
  const { saved, plannedTrips, bookings, removeBooking, removePlannedTrip, toggleSaved } =
    usePlatformStore();
  const { user, signOut } = useAuthStore();
  const { theme, toggle: toggleTheme } = useThemeStore();

  const savedDestinations = saved
    .map((slug) => getDestinationBySlug(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getDestinationBySlug>>[];

  const calendarEvents = useMemo<TripEvent[]>(
    () => [
      ...plannedTrips.map((t) => ({
        dateFrom: t.dateFrom,
        dateTo: t.dateTo,
        label: t.activityName,
        type: 'planned' as const,
      })),
      ...bookings.map((b) => ({
        dateFrom: b.date,
        dateTo: b.date,
        label: b.activityName,
        type: 'booked' as const,
      })),
    ],
    [plannedTrips, bookings],
  );

  const displayName =
    (user?.user_metadata?.name as string | undefined) ?? user?.email ?? 'Traveller';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="profile">
      {/* Header */}
      <motion.div
        className="profile__head"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile__avatar">{initials}</div>
        <div className="profile__info">
          <h1 className="profile__name">{displayName}</h1>
          {user?.email && <p className="profile__email">{user.email}</p>}
          {joinedDate && <p className="profile__since">Member since {joinedDate}</p>}
          {!user && (
            <Link to="/login" className="btn btn--primary btn--sm profile__signin">
              Sign in to sync trips
            </Link>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="profile__tabs">
        {(['profile', 'trips', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`profile__tab ${tab === t ? 'is-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'profile' ? '👤 Profile' : t === 'trips' ? '🗺 My Trips' : '⚙ Settings'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.div
            key="profile"
            className="profile__section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2>Profile</h2>
            {user ? (
              <div className="profile__details">
                <div className="profile__field">
                  <label>Display name</label>
                  <input
                    type="text"
                    defaultValue={displayName}
                    className="profile__input"
                    readOnly
                  />
                </div>
                <div className="profile__field">
                  <label>Email</label>
                  <input
                    type="email"
                    defaultValue={user.email ?? ''}
                    className="profile__input"
                    readOnly
                  />
                </div>
                {joinedDate && (
                  <p className="profile__meta">Member since {joinedDate}</p>
                )}
              </div>
            ) : (
              <p className="empty">
                <Link to="/login">Sign in</Link> to view your profile.
              </p>
            )}
          </motion.div>
        )}

        {tab === 'trips' && (
          <motion.div
            key="trips"
            className="profile__section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <section className="profile__calendar">
              <h2>Trip calendar</h2>
              {calendarEvents.length === 0 ? (
                <p className="empty">
                  No dates yet. Open an activity and pick your days to see them here.
                </p>
              ) : (
                <div className="profile__cal-wrap">
                  <TripCalendar events={calendarEvents} />
                  <div className="profile__planned">
                    <h3>Upcoming ({plannedTrips.length})</h3>
                    {plannedTrips.length === 0 ? (
                      <p className="empty">Nothing planned yet.</p>
                    ) : (
                      <ul className="planned-list">
                        {plannedTrips
                          .slice()
                          .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))
                          .map((t) => (
                            <li key={t.id} className="planned-item">
                              <span
                                className="planned-item__thumb"
                                style={{ backgroundImage: `url(${t.image})` }}
                              />
                              <div className="planned-item__body">
                                <strong>{t.activityName}</strong>
                                <span>{t.destinationName}</span>
                                <span className="planned-item__dates">
                                  📅 {fmtRange(t.dateFrom, t.dateTo)} · {t.people} ppl
                                </span>
                              </div>
                              <div className="planned-item__actions">
                                <Link
                                  to={`/book/${t.destinationSlug}/${t.activityId}?date=${t.dateFrom}&people=${t.people}`}
                                  className="btn btn--primary btn--sm"
                                >
                                  Book
                                </Link>
                                <button
                                  className="link-btn"
                                  onClick={() => removePlannedTrip(t.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section>
              <h2>Saved trips ({savedDestinations.length})</h2>
              {savedDestinations.length === 0 ? (
                <p className="empty">
                  Nothing saved yet.{' '}
                  <Link to="/explore">Explore destinations →</Link>
                </p>
              ) : (
                <div className="saved-grid">
                  {savedDestinations.map((d) => (
                    <div key={d.id} className="saved-card">
                      <img src={d.image} alt={d.name} loading="lazy" />
                      <div className="saved-card__body">
                        <strong>{d.name}</strong>
                        <span>{d.region}</span>
                      </div>
                      <div className="saved-card__actions">
                        <Link to={`/destination/${d.slug}`} className="btn btn--ghost btn--sm">
                          Open
                        </Link>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => toggleSaved(d.slug)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="profile__bookings">
              <h2>Booking history ({bookings.length})</h2>
              {bookings.length === 0 ? (
                <p className="empty">
                  No bookings yet.{' '}
                  <Link to="/explore">Find an adventure →</Link>
                </p>
              ) : (
                <div className="profile__bookings-table-wrap">
                  <table className="bookings">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Destination</th>
                        <th>Date</th>
                        <th>People</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id}>
                          <td>{b.activityName}</td>
                          <td>{b.destinationName}</td>
                          <td>{b.date}</td>
                          <td>{b.people}</td>
                          <td>₹{b.total.toLocaleString('en-IN')}</td>
                          <td>
                            <button
                              className="link-btn"
                              onClick={() => removeBooking(b.id)}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </motion.div>
        )}

        {tab === 'settings' && (
          <motion.div
            key="settings"
            className="profile__section profile__settings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2>Settings</h2>

            <div className="settings-group">
              <h3>Appearance</h3>
              <div className="settings-row">
                <div>
                  <span className="settings-row__label">Theme</span>
                  <span className="settings-row__desc">
                    Currently: {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </span>
                </div>
                <button
                  className={`theme-switch ${theme === 'light' ? 'theme-switch--light' : ''}`}
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  <span className="theme-switch__track">
                    <span className="theme-switch__thumb" />
                  </span>
                  <span className="theme-switch__labels">
                    <span>🌙</span>
                    <span>☀️</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="settings-group">
              <h3>Regional</h3>
              <div className="settings-row">
                <div>
                  <span className="settings-row__label">Currency</span>
                  <span className="settings-row__desc">Prices displayed in</span>
                </div>
                <select className="settings-select" disabled>
                  <option>INR ₹</option>
                </select>
              </div>
              <div className="settings-row">
                <div>
                  <span className="settings-row__label">Language</span>
                  <span className="settings-row__desc">Interface language</span>
                </div>
                <select className="settings-select" disabled>
                  <option>English</option>
                  <option>मराठी</option>
                </select>
              </div>
            </div>

            <div className="settings-group">
              <h3>Notifications</h3>
              <div className="settings-row">
                <div>
                  <span className="settings-row__label">Email updates</span>
                  <span className="settings-row__desc">Trip reminders and offers</span>
                </div>
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="settings-toggle__track" />
                </label>
              </div>
            </div>

            {user && (
              <div className="settings-group">
                <h3>Account</h3>
                <button className="btn btn--ghost settings-signout" onClick={signOut}>
                  Sign out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
