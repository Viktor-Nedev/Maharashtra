import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';

const PUBLIC_LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/advisor', label: '✦ AI Advisor' },
];

// Only shown once the user is signed in.
const AUTH_LINKS = [
  { to: '/planner', label: 'Planner' },
  { to: '/account', label: 'My Trips' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const { pathname } = useLocation();

  const navLinks = user ? [...PUBLIC_LINKS, ...AUTH_LINKS] : PUBLIC_LINKS;

  // Close drawer on route change
  if (!open && pathname) { /* no-op, just subscribe to pathname for re-render */ }

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        className={`hamburger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="mobile-nav__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
            />

            {/* Drawer */}
            <motion.nav
              className="mobile-nav"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mobile-nav__head">
                <Link to="/" className="brand" onClick={close}>
                  Maha<span className="brand__accent">rashtra</span>
                </Link>
                <button className="hamburger is-open" onClick={close} aria-label="Close menu">
                  <span />
                  <span />
                  <span />
                </button>
              </div>

              <ul className="mobile-nav__links">
                {navLinks.map(({ to, label }) => (
                  <li key={to}>
                    <NavLink to={to} className="mobile-nav__link" onClick={close}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="mobile-nav__foot">
                <ThemeToggle />
                {user ? (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={async () => { await signOut(); close(); }}
                  >
                    Sign out
                  </button>
                ) : (
                  <Link to="/login" className="btn btn--primary btn--sm" onClick={close}>
                    Sign in
                  </Link>
                )}
              </div>

              <Link to="/" className="mobile-nav__cinematic" onClick={close}>
                ✦ Cinematic mode
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
