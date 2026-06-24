import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isSupabaseEnabled } from '@/lib/supabase';
import { useAuthStore } from '@/lib/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';

function UserMenu() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link to="/login" className="btn btn--ghost btn--sm">
        Sign in
      </Link>
    );
  }

  const initials = (user.user_metadata?.name as string | undefined)
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? user.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="user-menu" onMouseLeave={() => setOpen(false)}>
      <button
        className="user-menu__avatar"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
      >
        {initials}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="user-menu__drop"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="user-menu__email">{user.email}</div>
            <Link to="/account" className="user-menu__item" onClick={() => setOpen(false)}>
              My Trips
            </Link>
            <Link to="/planner" className="user-menu__item" onClick={() => setOpen(false)}>
              Planner
            </Link>
            <button
              className="user-menu__item user-menu__item--danger"
              onClick={async () => {
                await signOut();
                setOpen(false);
                navigate('/');
              }}
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Shared chrome (nav + footer) for the booking platform routes. */
export function PlatformLayout() {
  return (
    <div className="platform">
      <header className="platform__nav">
        <Link to="/" className="brand">
          Maha<span className="brand__accent">rashtra</span>
        </Link>
        <nav className="platform__links">
          <NavLink to="/explore">Explore</NavLink>
          <NavLink to="/advisor" className="nav__ai">
            ✦ AI Advisor
          </NavLink>
          <NavLink to="/planner">Planner</NavLink>
          <NavLink to="/account">Trips</NavLink>
          <ThemeToggle />
          <UserMenu />
          <Link to="/" className="nav__cta">
            ✦ Cinematic
          </Link>
        </nav>
      </header>

      <Outlet />

      <footer className="platform__footer">
        <div>
          <span className="brand">
            Maha<span className="brand__accent">rashtra</span>
          </span>
          <p>Adventure tourism, reimagined as a flight through a living world.</p>
        </div>
        <div className="platform__footer-meta">
          <span>{isSupabaseEnabled ? 'Live · Supabase connected' : 'Demo mode · local data'}</span>
          <span>© {new Date().getFullYear()} Maharashtra Adventures</span>
        </div>
      </footer>
    </div>
  );
}
