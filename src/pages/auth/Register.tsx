import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      setDone(true);
      setTimeout(() => navigate('/explore'), 2200);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="brand auth-card__brand">
          Maha<span className="brand__accent">rashtra</span>
        </Link>
        <h1>Create account</h1>
        <p className="auth-card__sub">Your Maharashtra adventure starts here</p>

        {done ? (
          <div className="auth-card__done">
            <div className="booking__check">✓</div>
            <p>Account created! Check your email to confirm, then you're in.</p>
          </div>
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">
            Sign in →
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
