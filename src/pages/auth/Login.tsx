import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await signIn(email, password);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="auth-split">
      {/* Left — form */}
      <div className="auth-split__form-side">
        <motion.div
          className="auth-split__form-inner"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link to="/" className="brand auth-split__brand">
            Maha<span className="brand__accent">rashtra</span>
          </Link>

          <div className="auth-split__heading">
            <h1>Welcome back</h1>
            <p>Sign in to access your trips and bookings</p>
          </div>

          <form className="auth-form" onSubmit={handle}>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {error && <p className="auth-form__error">{error}</p>}

            <button className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="auth-split__footer">
            No account?{' '}
            <Link to="/register" className="auth-split__link">
              Create one →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right — image panel */}
      <motion.div
        className="auth-split__image-side"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        style={{ backgroundImage: 'url(/Mahabaleshwar.jpg)' }}
        aria-hidden="true"
      >
        <div className="auth-split__image-overlay">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            "Maharashtra — where every peak hides a story and every trail leads to wonder."
          </motion.blockquote>
          <div className="auth-split__image-dots">
            <span className="auth-split__dot auth-split__dot--active" />
            <span className="auth-split__dot" />
            <span className="auth-split__dot" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
