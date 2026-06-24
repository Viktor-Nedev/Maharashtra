import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDestinationBySlug, CATEGORY_LABELS, activityImage } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';
import { ActivityScene } from '@/experience/activities/ActivityScene';
import { WeatherWidget } from '@/components/WeatherWidget';
import { PhotoGallery } from '@/components/PhotoGallery';
import { shareLink } from '@/lib/share';

const SAMPLE_REVIEWS = [
  { name: 'Aarav S.', rating: 5, text: 'Genuinely the best-organised trek I have done. Guides were superb.' },
  { name: 'Meera K.', rating: 5, text: 'Sunrise over the clouds was unreal. Worth every rupee.' },
  { name: 'Daniel P.', rating: 4, text: 'Stunning scenery, slightly tough climb — bring good shoes!' },
];

export default function DestinationDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dest = slug ? getDestinationBySlug(slug) : undefined;
  const { toggleSaved, isSaved } = usePlatformStore();

  if (!dest) {
    return (
      <div className="detail detail--missing">
        <h1>Destination not found</h1>
        <Link to="/explore" className="btn btn--primary">
          Back to Explore
        </Link>
      </div>
    );
  }

  const featuredActivity = dest.activities[0];

  return (
    <div className="detail">
      {/* Split hero: info left, live 3D scene right */}
      <motion.header
        className="detail__hero detail__hero--split"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="detail__hero-bg"
          style={{ backgroundImage: `url(${dest.image})` }}
          aria-hidden="true"
        />
        <div className="detail__hero-inner">
          <span className="eyebrow">{dest.region}</span>
          <h1>{dest.name}</h1>
          <p>{dest.tagline}</p>
          <div className="detail__stats">
            <span>⛰ {dest.elevation.toLocaleString('en-IN')} m</span>
            <span>☀ {dest.bestSeason}</span>
            <span>📍 {dest.coordinates[1].toFixed(2)}°N {dest.coordinates[0].toFixed(2)}°E</span>
          </div>
          <WeatherWidget coordinates={dest.coordinates} bestSeason={dest.bestSeason} />
          <div className="detail__hero-actions">
            <button
              className={`btn ${isSaved(dest.slug) ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => toggleSaved(dest.slug)}
            >
              {isSaved(dest.slug) ? '♥ Saved' : '♡ Save trip'}
            </button>
            <Link to={`/book/${dest.slug}/${featuredActivity.id}`} className="btn btn--primary">
              Book now →
            </Link>
            <button
              className="btn btn--ghost"
              onClick={() =>
                shareLink(
                  dest.name,
                  `Check out ${dest.name} on Maharashtra Adventures — ${dest.tagline}`,
                  `/destination/${dest.slug}`,
                )
              }
            >
              ↗ Share
            </button>
          </div>
        </div>

        {/* Live 3D scene preview */}
        <div className="detail__hero-scene" aria-hidden="true">
          <ActivityScene sceneType={featuredActivity.sceneType} />
          <span className="detail__hero-scene-label">Live 3D preview</span>
        </div>
      </motion.header>

      <div className="detail__body">
        <main>
          <section className="detail__about">
            <h2>About</h2>
            <p>{dest.description}</p>
          </section>

          <PhotoGallery
            images={[dest.image, ...dest.activities.slice(0, 5).map((a) => activityImage(a.sceneType))]}
            title={dest.name}
          />

          <section className="detail__activities">
            <h2>Activities</h2>
            <div className="activity-list">
              {dest.activities.map((a) => (
                <article key={a.id} className="activity-row">
                  <div
                    className="activity-row__thumb"
                    style={{ backgroundImage: `url(${activityImage(a.sceneType, 400)})` }}
                    aria-hidden="true"
                  />
                  <div className="activity-row__text">
                    <span className="activity-row__cat">{CATEGORY_LABELS[a.category]}</span>
                    <h3>{a.name}</h3>
                    <p>{a.description}</p>
                    <div className="activity-row__meta">
                      <span>⏱ {a.durationHours}h</span>
                      <span className={`difficulty difficulty--${a.difficulty}`}>{a.difficulty}</span>
                    </div>
                    <span className="activity-row__3d">◆ Interactive 3D scene</span>
                  </div>
                  <div className="activity-row__action">
                    <span className="price">₹{a.pricePerPerson.toLocaleString('en-IN')}</span>
                    <span className="price__unit">per person</span>
                    <Link to={`/book/${dest.slug}/${a.id}`} className="btn btn--primary btn--sm">
                      Book
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="detail__reviews">
            <h2>Reviews</h2>
            <div className="reviews">
              {SAMPLE_REVIEWS.map((r) => (
                <article key={r.name} className="review">
                  <div className="review__head">
                    <strong>{r.name}</strong>
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="detail__aside">
          <div className="operators">
            <h2>Operators</h2>
            {dest.operators.map((o) => (
              <div key={o.id} className="operator">
                <div>
                  <strong>{o.name}</strong>
                  {o.verified && <span className="badge">✓ Verified</span>}
                </div>
                <span className="operator__meta">
                  ★ {o.rating} · since {o.since}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
