import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LANDMARKS } from '@/experience/mapRoute';
import { getDestinationBySlug } from '@/data/destinations';
import { useCinematicScroll } from '@/hooks/useCinematicScroll';
import { useLowPower } from '@/hooks/useMediaQuery';
import { useScrollStore } from '@/lib/scrollStore';
import { useAuthStore } from '@/lib/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Parallax } from '@/components/Parallax';
import { Magnetic } from '@/components/Magnetic';
import { CloudIntro } from './CloudIntro';
import { FlightClouds } from './FlightClouds';

// Defer the heavy WebGL chunks (mapbox-gl ~1.8 MB, three/r3f ~820 KB) so neither
// blocks first paint — the cloud intro + page shell render immediately while
// these download behind the curtain.
const MapboxFlight = lazy(() =>
  import('@/experience/MapboxFlight').then((m) => ({ default: m.MapboxFlight })),
);
const PlaneOverlay = lazy(() =>
  import('@/experience/PlaneOverlay').then((m) => ({ default: m.PlaneOverlay })),
);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
const STATIC_HERO_IMG = '/header_maharashta.jpg';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lowPower = useLowPower();
  const ready = useScrollStore((s) => s.ready);
  const setReady = useScrollStore((s) => s.setReady);
  const user = useAuthStore((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Skip the WebGL flight entirely on weak/low-power devices, data-saver mode,
  // or when no Mapbox token is configured — show a fast static scenic hero so
  // phones stay smooth and the live site never looks broken.
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  const useStaticHero = lowPower || saveData || !MAPBOX_TOKEN;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The static hero has nothing to preload — lift the cloud intro immediately.
  useEffect(() => {
    if (useStaticHero) setReady(true);
  }, [useStaticHero, setReady]);

  useCinematicScroll(containerRef);

  return (
    <div className="cinematic">
      {/* Fixed background: 3D satellite flight, or a static scenic hero */}
      {useStaticHero ? (
        <div
          className="experience-canvas cinematic__static-hero"
          style={{ backgroundImage: `url(${STATIC_HERO_IMG})` }}
          aria-hidden="true"
        />
      ) : (
        <>
          <Suspense fallback={null}>
            <MapboxFlight lowPower={lowPower} />
            <PlaneOverlay lowPower={lowPower} />
          </Suspense>
          <FlightClouds />
        </>
      )}
      <CloudIntro ready={ready} />

      {/* Floating top navigation */}
      <header className={`cinematic__nav ${scrolled ? 'is-scrolled' : ''}`}>
        <span className="brand">
          Maha<span className="brand__accent">rashtra</span>
        </span>
        <nav>
          <Link to="/explore">Explore</Link>
          {user && <Link to="/planner">Planner</Link>}
          {user && <Link to="/account">Trips</Link>}
          <ThemeToggle />
          <Link to="/account" className="nav__cta">
            {user ? 'Account' : 'Sign in'}
          </Link>
          {/* Phone-only hamburger (desktop links are hidden ≤620px) */}
          <button
            className={`cinematic__burger ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>

        {/* Phone-only slide-down menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="cinematic__menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link to="/explore" onClick={() => setMenuOpen(false)}>Explore</Link>
              {user && <Link to="/planner" onClick={() => setMenuOpen(false)}>Planner</Link>}
              {user && <Link to="/account" onClick={() => setMenuOpen(false)}>Trips</Link>}
              <Link to="/account" onClick={() => setMenuOpen(false)}>
                {user ? 'Account' : 'Sign in'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero header banner (image background + title) */}
      <section className="cinematic__hero">
        <div className="cinematic__hero-inner">
          <h1 className="cinematic__hero-title">MAHARASHTRA</h1>
          <span className="cinematic__hero-sub">Fly through adventures</span>
        </div>
      </section>

      {/* Scroll-driven landmark overlay */}
      <main className="cinematic__scroll" ref={containerRef}>
        {LANDMARKS.map((lm, i) => {
          const dest = lm.destinationSlug ? getDestinationBySlug(lm.destinationSlug) : undefined;
          const isFirst = i === 0;
          const isLast = i === LANDMARKS.length - 1;
          // The opening scene gets a roomy split layout: copy on one side, a big
          // hero photo on the other.
          if (isFirst) {
            return (
              <section key={lm.id} className="scene scene--intro" data-scene={lm.id}>
                <motion.div
                  className="scene__inner scene__inner--intro"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: '-20% 0px -20% 0px', once: false }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="intro__text">
                    <span className="scene__kicker">{lm.kicker}</span>
                    <h1 className="scene__title intro__title">
                      <span className="scene__title-line">Explore Maharashtra</span>
                      <span className="scene__title-line">Like Never Before</span>
                    </h1>
                    <p className="scene__body">{lm.body}</p>
                    <div className="scene__cta">
                      <Magnetic>
                        <a href="#enter" className="btn btn--primary btn--lg">
                          Begin the Flight
                        </a>
                      </Magnetic>
                      <Link to="/explore" className="btn btn--ghost">
                        Skip to Booking
                      </Link>
                    </div>
                  </div>

                  {lm.images?.[0] && (
                    <Parallax className="intro__media" offset={42}>
                      <img src={lm.images[0]} alt={lm.name} decoding="async" />
                    </Parallax>
                  )}
                </motion.div>
              </section>
            );
          }

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
                  <span className="scene__title-line">{lm.name}</span>
                </h1>
                <p className="scene__body">{lm.body}</p>

                {lm.images && lm.images.length > 0 && (
                  <Parallax
                    className={`scene__media scene__media--${lm.images.length > 1 ? 'pair' : 'single'}`}
                    offset={32}
                  >
                    {lm.images.map((src) => (
                      <figure key={src} className="scene__photo">
                        <img src={src} alt={lm.name} loading="lazy" decoding="async" />
                      </figure>
                    ))}
                  </Parallax>
                )}

                {dest && (
                  <ul className="scene__activities">
                    {dest.activities.slice(0, 4).map((a) => (
                      <li key={a.id}>{a.name}</li>
                    ))}
                  </ul>
                )}

                {dest && (
                  <Link to={`/destination/${dest.slug}`} className="scene__link">
                    View destination →
                  </Link>
                )}

                {isLast && (
                  <div className="scene__cta" id="enter">
                    <Magnetic>
                      <Link to="/explore" className="btn btn--primary btn--lg">
                        Start Your Adventure
                      </Link>
                    </Magnetic>
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
            <Link to="/planner">Planner</Link>
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
