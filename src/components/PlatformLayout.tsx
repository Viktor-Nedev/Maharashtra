import { Link, NavLink, Outlet } from 'react-router-dom';
import { isSupabaseEnabled } from '@/lib/supabase';

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
          <NavLink to="/account">Trips</NavLink>
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
