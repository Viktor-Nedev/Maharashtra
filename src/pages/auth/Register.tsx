import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuthStore();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const err = await signUp(email, password, name);
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      // Account created but NOT logged in — the user must confirm their email
      // first. No auto-redirect; we show the "check your inbox" state instead.
      setDone(true);
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
            <h1>Start your adventure</h1>
            <p>Create a free account and book Maharashtra's best experiences</p>
          </div>

          {done ? (
            <motion.div
              className="auth-split__done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="auth-split__done-icon">✉</div>
              <h2>Confirm your email</h2>
              <p>
                We've sent a confirmation link to <strong>{email}</strong>. Open it to
                activate your account, then sign in.
              </p>
              <Link to="/login" className="btn btn--primary btn--block" style={{ marginTop: '1.2rem' }}>
                Go to sign in →
              </Link>
            </motion.div>
          ) : (
            <form className="auth-form" onSubmit={handle}>
              <label>
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
              </label>

              {error && <p className="auth-form__error">{error}</p>}

              <button className="btn btn--primary btn--block" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>
          )}

          <p className="auth-split__footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-split__link">
              Sign in →
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right — image panel (different image for register) */}
      <motion.div
        className="auth-split__image-side"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        style={{ backgroundImage: 'url(/Harishchandra.jpg)' }}
        aria-hidden="true"
      >
        <div className="auth-split__image-overlay">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            "From the Konkan coast to the Sahyadri peaks — Maharashtra's adventures wait for no one."
          </motion.blockquote>
          <div className="auth-split__image-dots">
            <span className="auth-split__dot" />
            <span className="auth-split__dot auth-split__dot--active" />
            <span className="auth-split__dot" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
