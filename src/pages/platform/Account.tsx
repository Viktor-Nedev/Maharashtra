import { Link } from 'react-router-dom';
import { DESTINATIONS, getDestinationBySlug } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';

export default function Account() {
  const { saved, bookings, removeBooking, toggleSaved } = usePlatformStore();
  const savedDestinations = saved
    .map((slug) => getDestinationBySlug(slug))
    .filter(Boolean) as typeof DESTINATIONS;

  return (
    <div className="account">
      <header className="account__head">
        <div className="account__avatar">M</div>
        <div>
          <h1>My Trips</h1>
          <p>Saved destinations and your booking history.</p>
        </div>
      </header>

      <section>
        <h2>Saved trips ({savedDestinations.length})</h2>
        {savedDestinations.length === 0 ? (
          <p className="empty">
            Nothing saved yet. <Link to="/explore">Explore destinations →</Link>
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
                  <Link to={`/destination/${d.slug}`} className="btn btn--ghost btn--sm">Open</Link>
                  <button className="btn btn--ghost btn--sm" onClick={() => toggleSaved(d.slug)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Booking history ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p className="empty">No bookings yet.</p>
        ) : (
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
                    <button className="link-btn" onClick={() => removeBooking(b.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
