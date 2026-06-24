import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getDestinationBySlug } from '@/data/destinations';
import { usePlatformStore } from '@/lib/store';
import { ActivityScene } from '@/experience/activities/ActivityScene';

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK as string | undefined;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

// --- Stripe PaymentElement sub-form ----------------------------------------
interface PayFormProps {
  total: number;
  onSuccess: () => void;
}
function PayForm({ total, onSuccess }: PayFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setErr('');
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (error) {
      setErr(error.message ?? 'Payment failed');
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={submit} className="pay-form">
      <PaymentElement
        options={{
          layout: 'tabs',
          fields: { billingDetails: { address: { country: 'never' } } },
        }}
      />
      {err && <p className="auth-form__error">{err}</p>}
      <button
        type="submit"
        className="btn btn--primary btn--lg btn--block"
        disabled={!stripe || paying}
        style={{ marginTop: '1.2rem' }}
      >
        {paying ? 'Processing…' : `Pay ₹${total.toLocaleString('en-IN')}`}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
export default function Booking() {
  const { slug, activityId } = useParams<{ slug: string; activityId: string }>();
  const addBooking = usePlatformStore((s) => s.addBooking);

  const dest = slug ? getDestinationBySlug(slug) : undefined;
  const activity = dest?.activities.find((a) => a.id === activityId);

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [people, setPeople] = useState(2);
  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [clientSecret, setClientSecret] = useState('');
  const [fetchingSecret, setFetchingSecret] = useState(false);

  const total = useMemo(
    () => (activity ? activity.pricePerPerson * people : 0),
    [activity, people],
  );

  useEffect(() => {
    if (step === 'done') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleProceedToPayment = async () => {
    if (!stripePromise) {
      // No Stripe configured — demo mode confirms instantly
      confirmBooking();
      return;
    }
    setFetchingSecret(true);
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const data = await res.json() as { clientSecret?: string; error?: string };
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep('pay');
      } else {
        // API unavailable (local dev without secret key) → demo confirm
        confirmBooking();
      }
    } catch {
      confirmBooking();
    } finally {
      setFetchingSecret(false);
    }
  };

  const confirmBooking = () => {
    if (!dest || !activity) return;
    addBooking({
      destinationSlug: dest.slug,
      destinationName: dest.name,
      activityId: activity.id,
      activityName: activity.name,
      date,
      people,
      total,
    });
    setStep('done');
  };

  if (!dest || !activity) {
    return (
      <div className="booking booking--missing">
        <h1>Activity not found</h1>
        <Link to="/explore" className="btn btn--primary">Back to Explore</Link>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <motion.div className="booking booking--done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="booking__check">✓</div>
        <h1>Booking confirmed!</h1>
        <p>
          {activity.name} at {dest.name} · {people} {people === 1 ? 'person' : 'people'} · {date}
        </p>
        <p className="booking__total-confirm">₹{total.toLocaleString('en-IN')} paid</p>
        <div className="scene__cta">
          <Link to="/account" className="btn btn--primary">View my trips</Link>
          <Link to="/explore" className="btn btn--ghost">Explore more</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="booking">
      <Link to={`/destination/${dest.slug}`} className="booking__back">← {dest.name}</Link>
      <div className="booking__grid">
        <div className="booking__summary">
          <ActivityScene sceneType={activity.sceneType} />
          <div className="booking__summary-text">
            <span className="eyebrow">{dest.region}</span>
            <h1>{activity.name}</h1>
            <p>{activity.description}</p>
            <div className="booking__facts">
              <span>⏱ {activity.durationHours}h</span>
              <span className={`difficulty difficulty--${activity.difficulty}`}>{activity.difficulty}</span>
            </div>
          </div>
        </div>

        {step === 'form' && (
          <form className="booking__form" onSubmit={(e) => { e.preventDefault(); handleProceedToPayment(); }}>
            <h2>Reserve your spot</h2>

            <label>
              Date
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label>
              Travellers
              <div className="stepper">
                <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))}>−</button>
                <span>{people}</span>
                <button type="button" onClick={() => setPeople((p) => Math.min(12, p + 1))}>+</button>
              </div>
            </label>

            <div className="booking__total">
              <div>
                <span>₹{activity.pricePerPerson.toLocaleString('en-IN')} × {people}</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={fetchingSecret}>
              {fetchingSecret ? 'Preparing payment…' : 'Proceed to Payment →'}
            </button>
            {!stripePromise && (
              <p className="booking__note">Demo mode — no real payment required.</p>
            )}
          </form>
        )}

        {step === 'pay' && stripePromise && clientSecret && (
          <div className="booking__form">
            <h2>Payment</h2>
            <div className="booking__total" style={{ marginBottom: '1.4rem' }}>
              <div>
                <span>{activity.name} × {people}</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#ff7a3d' } } }}>
              <PayForm total={total} onSuccess={confirmBooking} />
            </Elements>
            <button className="link-btn" style={{ marginTop: '1rem', display: 'block' }} onClick={() => setStep('form')}>
              ← Back
            </button>
            <p className="booking__note">
              Test card: 4242 4242 4242 4242 · any future date · any CVC
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
