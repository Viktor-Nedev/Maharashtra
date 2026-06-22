import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapboxFlight } from '@/experience/MapboxFlight';
import { PlaneOverlay } from '@/experience/PlaneOverlay';
import { LANDMARKS } from '@/experience/mapRoute';
import { getDestinationBySlug } from '@/data/destinations';
import { useCinematicScroll } from '@/hooks/useCinematicScroll';
import { useLowPower } from '@/hooks/useMediaQuery';
import { useScrollStore } from '@/lib/scrollStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CloudIntro } from './CloudIntro';
import { FlightClouds } from './FlightClouds';
import { ScrollProgress } from './ScrollProgress';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lowPower = useLowPower();
  const ready = useScrollStore((s) => s.ready);

  useCinematicScroll(containerRef);

  return (
    <div className="cinematic">
      {/* Fixed 3D satellite map + airplane overlay */}
      <MapboxFlight />
      <PlaneOverlay lowPower={lowPower} />
      {!lowPower && <FlightClouds />}
      <CloudIntro ready={ready} />
      <ScrollProgress />

      {/* Floating top navigation */}
      <header className="cinematic__nav">
        <span className="brand">
          Maha<span className="brand__accent">rashtra</span>
        </span>
        <nav>
          <Link to="/explore">Explore</Link>
          <Link to="/explore">Activities</Link>
          <a href="#enter">Book</a>
          <ThemeToggle />
          <Link to="/account" className="nav__cta">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Scroll-driven landmark overlay */}
      <main className="cinematic__scroll" ref={containerRef}>
        {LANDMARKS.map((lm, i) => {
          const dest = lm.destinationSlug ? getDestinationBySlug(lm.destinationSlug) : undefined;
          const isFirst = i === 0;
          const isLast = i === LANDMARKS.length - 1;
          return (
            <section key={lm.id} className={`scene scene--${lm.align}`} data-scene={lm.id}>
              <motion.div
                className="scene__inner"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ margin: '-25% 0px -25% 0px', once: false }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="scene__kicker">{lm.kicker}</span>
                <h1 className="scene__title">
                  {isFirst ? (
                    <>
                      <span className="scene__title-line">Explore Maharashtra</span>
                      <span className="scene__title-line">Like Never Before</span>
                    </>
                  ) : (
                    <span className="scene__title-line">{lm.name}</span>
                  )}
                </h1>
                <p className="scene__body">{lm.body}</p>

                {lm.images && lm.images.length > 0 && (
                  <div className={`scene__media scene__media--${lm.images.length > 1 ? 'pair' : 'single'}`}>
                    {lm.images.map((src) => (
                      <figure key={src} className="scene__photo">
                        <img src={src} alt={lm.name} loading="lazy" decoding="async" />
                      </figure>
                    ))}
                  </div>
                )}

                {dest && (
                  <ul className="scene__activities">
                    {dest.activities.slice(0, 4).map((a) => (
                      <li key={a.id}>{a.name}</li>
                    ))}
                  </ul>
                )}

                {isFirst && (
                  <div className="scene__cta">
                    <a href="#enter" className="btn btn--primary">
                      Begin the Flight
                    </a>
                    <Link to="/explore" className="btn btn--ghost">
                      Skip to Booking
                    </Link>
                  </div>
                )}

                {dest && (
                  <Link to={`/destination/${dest.slug}`} className="scene__link">
                    View destination →
                  </Link>
                )}

                {isLast && (
                  <div className="scene__cta" id="enter">
                    <Link to="/explore" className="btn btn--primary btn--lg">
                      Start Your Adventure
                    </Link>
                  </div>
                )}
              </motion.div>
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer className="cinematic__footer">
        <div className="cinematic__footer-inner">
          <span className="brand">
            Maha<span className="brand__accent">rashtra</span>
          </span>
          <div className="cinematic__footer-links">
            <Link to="/explore">Explore</Link>
            <Link to="/account">My Trips</Link>
            <a href="#enter">Book</a>
          </div>
          <p className="cinematic__credit">
            Made by Viktor Nedev ·{' '}
            <a href="mailto:viktornedev08@gmail.com">viktornedev08@gmail.com</a>
          </p>
        </div>
      </footer>

      {/* Scroll cue (first viewport only) */}
      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll to fly</span>
        <div className="scroll-cue__line" />
      </div>
    </div>
  );
}
