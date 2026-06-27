import Stripe from 'stripe';

export const config = { runtime: 'nodejs' };

export default async function handler(
  req: { method: string; body: string },
  res: {
    status: (code: number) => { json: (data: unknown) => void };
    setHeader: (k: string, v: string) => void;
  },
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).json({});
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(503).json({ error: 'Stripe not configured' });

  try {
    const stripe = new Stripe(key, { apiVersion: '2025-05-28.basil' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    // The client sends the total in rupees (INR); Stripe expects the smallest
    // currency unit (paise), so multiply by 100.
    const rupees = Number(body?.amount) || 0;
    const amount = Math.round(rupees * 100);
    if (amount < 100) return res.status(400).json({ error: 'Invalid amount' }); // ≥ ₹1

    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({ clientSecret: intent.client_secret });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Stripe error';
    res.status(500).json({ error: msg });
  }
}
