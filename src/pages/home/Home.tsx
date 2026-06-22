import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Experience } from '@/experience/Experience';
import { useCinematicScroll } from '@/hooks/useCinematicScroll';
import { useLowPower } from '@/hooks/useMediaQuery';
import { useScrollStore } from '@/lib/scrollStore';
import { SCENE_CONTENT } from './sceneContent';
import { CloudIntro } from './CloudIntro';
import { ScrollProgress } from './ScrollProgress';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lowPower = useLowPower();
  const ready = useScrollStore((s) => s.ready);

  useCinematicScroll(containerRef);

  return (
    <div className="cinematic">
      {/* Fixed WebGL flight layer */}
      <Experience lowPower={lowPower} />
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
          <Link to="/account" className="nav__cta">
            Sign in
          </Link>
        </nav>
      </header>

      {/* Scroll-driven scene overlay */}
      <main className="cinematic__scroll" ref={containerRef}>
        {SCENE_CONTENT.map((scene, i) => (
          <section key={scene.id} className={`scene scene--${scene.align}`} data-scene={scene.id}>
            <motion.div
              className="scene__inner"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: '-25% 0px -25% 0px', once: false }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="scene__kicker">{scene.kicker}</span>
              <h1 className="scene__title">
                {scene.title.split('\n').map((line, k) => (
                  <span key={k} className="scene__title-line">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="scene__body">{scene.body}</p>

              {scene.activities && (
                <ul className="scene__activities">
                  {scene.activities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}

              {/* Hero CTA on the first scene */}
              {i === 0 && (
                <div className="scene__cta">
                  <a href="#enter" className="btn btn--primary">
                    Begin the Flight
                  </a>
                  <Link to="/explore" className="btn btn--ghost">
                    Skip to Booking
                  </Link>
                </div>
              )}

              {/* Per-scene destination link */}
              {scene.destinationSlug && (
                <Link to={`/destination/${scene.destinationSlug}`} className="scene__link">
                  View destination →
                </Link>
              )}

              {/* Final landing CTA */}
              {i === SCENE_CONTENT.length - 1 && (
                <div className="scene__cta" id="enter">
                  <Link to="/explore" className="btn btn--primary btn--lg">
                    Start Your Adventure
                  </Link>
                </div>
              )}
            </motion.div>
          </section>
        ))}
      </main>

      {/* Footer — sits below the flight, above the fixed canvas */}
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
