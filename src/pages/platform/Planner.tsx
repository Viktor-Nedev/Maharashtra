import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DESTINATIONS } from '@/data/destinations';
import { usePlannerStore, usePlatformStore } from '@/lib/store';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function Planner() {
  const {
    budgetCap, items, stops, notes,
    setBudgetCap, addItem, removeItem, addStop, toggleStop, removeStop, setNotes,
  } = usePlannerStore();
  const saved = usePlatformStore((s) => s.saved);

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [stop, setStop] = useState('');

  const spent = useMemo(() => items.reduce((s, i) => s + i.amount, 0), [items]);
  const remaining = budgetCap - spent;
  const pct = budgetCap > 0 ? Math.min(100, (spent / budgetCap) * 100) : 0;
  const over = remaining < 0;

  const savedDests = DESTINATIONS.filter((d) => saved.includes(d.slug));

  const submitItem = () => {
    const amt = Number(amount);
    if (!label.trim() || !Number.isFinite(amt) || amt <= 0) return;
    addItem(label.trim(), amt);
    setLabel('');
    setAmount('');
  };
  const submitStop = (title?: string) => {
    const t = (title ?? stop).trim();
    if (!t) return;
    addStop(t);
    setStop('');
  };

  return (
    <div className="planner">
      <section className="planner__intro">
        <span className="eyebrow">Your trip journal</span>
        <h1>Trip Planner</h1>
        <p>Sketch your budget, line up the places you’ll fly to, and scribble your ideas — it all saves automatically.</p>
      </section>

      <div className="planner__grid">
        {/* Budget notebook card */}
        <motion.section
          className="notebook notebook--budget"
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="notebook__rings" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <span key={i} />)}</div>
          <div className="notebook__page">
            <h2>💰 Budget</h2>

            <label className="planner__cap">
              Total budget
              <input
                type="number"
                value={budgetCap}
                min={0}
                onChange={(e) => setBudgetCap(Number(e.target.value))}
              />
            </label>

            <div className={`budget-bar ${over ? 'is-over' : ''}`}>
              <motion.span
                className="budget-bar__fill"
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
            <div className="budget-bar__legend">
              <span>Spent <strong>{inr(spent)}</strong></span>
              <span className={over ? 'is-over' : ''}>
                {over ? 'Over by ' : 'Left '} <strong>{inr(Math.abs(remaining))}</strong>
              </span>
            </div>

            <ul className="budget-list">
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <motion.li
                    key={it.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                  >
                    <span>{it.label}</span>
                    <span className="budget-list__amt">{inr(it.amount)}</span>
                    <button onClick={() => removeItem(it.id)} aria-label="Remove">✕</button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {items.length === 0 && <li className="budget-list__empty">No items yet — add flights, stays, activities…</li>}
            </ul>

            <div className="planner__add">
              <input placeholder="Item (e.g. Paragliding)" value={label} onChange={(e) => setLabel(e.target.value)} />
              <input
                type="number" placeholder="₹" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitItem()}
              />
              <button className="btn btn--primary btn--sm" onClick={submitItem}>Add</button>
            </div>
          </div>
        </motion.section>

        {/* Itinerary notebook card */}
        <motion.section
          className="notebook notebook--stops"
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="notebook__rings" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <span key={i} />)}</div>
          <div className="notebook__page">
            <h2>📍 Places to visit</h2>

            {savedDests.length > 0 && (
              <div className="planner__quick">
                <span>Quick add from saved:</span>
                <div className="planner__quick-chips">
                  {savedDests.map((d) => (
                    <button key={d.slug} className="chip" onClick={() => submitStop(d.name)}>+ {d.name}</button>
                  ))}
                </div>
              </div>
            )}

            <ul className="stop-list">
              <AnimatePresence initial={false}>
                {stops.map((p, idx) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={p.done ? 'is-done' : ''}
                  >
                    <span className="stop-list__no">{idx + 1}</span>
                    <button className="stop-list__check" onClick={() => toggleStop(p.id)} aria-label="Toggle visited">
                      {p.done ? '✓' : ''}
                    </button>
                    <span className="stop-list__title">{p.title}</span>
                    <button className="stop-list__del" onClick={() => removeStop(p.id)} aria-label="Remove">✕</button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {stops.length === 0 && <li className="stop-list__empty">Add the places you want to fly to.</li>}
            </ul>

            <div className="planner__add">
              <input
                placeholder="Add a place or stop…" value={stop}
                onChange={(e) => setStop(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitStop()}
              />
              <button className="btn btn--primary btn--sm" onClick={() => submitStop()}>Add</button>
            </div>

            <Link to="/explore" className="planner__discover">Discover more places →</Link>
          </div>
        </motion.section>

        {/* Notes notebook card */}
        <motion.section
          className="notebook notebook--notes"
          initial={{ opacity: 0, y: 30, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="notebook__rings" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <span key={i} />)}</div>
          <div className="notebook__page">
            <h2>✍️ Notes</h2>
            <textarea
              className="planner__notes"
              placeholder="Pack layers for the Ghats. Sunrise trek on day 2. Book scuba in advance…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={12}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
