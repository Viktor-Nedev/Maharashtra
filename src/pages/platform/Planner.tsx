import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DESTINATIONS } from '@/data/destinations';
import { usePlannerStore, usePlatformStore } from '@/lib/store';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const QUICK_TAGS = ['Packing', 'Food', 'Transport', 'Gear', 'Budget', 'Tickets'];

function DonutChart({ pct, over }: { pct: number; over: boolean }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg className="donut" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r={r} className="donut__track" />
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        className={`donut__fill ${over ? 'donut__fill--over' : ''}`}
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      />
      <text x="60" y="56" className="donut__pct" textAnchor="middle" dominantBaseline="middle">
        {Math.round(pct)}%
      </text>
      <text x="60" y="72" className="donut__sublabel" textAnchor="middle">
        {over ? 'over' : 'used'}
      </text>
    </svg>
  );
}

export default function Planner() {
  const {
    budgetCap, items, stops, notes,
    setBudgetCap, addItem, removeItem, addStop, toggleStop, removeStop, setNotes,
  } = usePlannerStore();
  const saved = usePlatformStore((s) => s.saved);

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [stop, setStop] = useState('');
  const [tripName, setTripName] = useState('My Maharashtra Adventure');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  const appendTag = (tag: string) => {
    setActiveTag(tag);
    setNotes((notes ? notes + '\n' : '') + `[${tag}] `);
  };

  return (
    <div className="plannerv2">
      {/* Top bar */}
      <div className="plannerv2__topbar">
        <div className="plannerv2__title-wrap">
          {editingName ? (
            <input
              className="plannerv2__trip-input"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              autoFocus
            />
          ) : (
            <button className="plannerv2__trip-name" onClick={() => setEditingName(true)}>
              <span className="plannerv2__trip-icon">✦</span>
              {tripName}
              <span className="plannerv2__trip-edit">✎</span>
            </button>
          )}
        </div>
        <div className="plannerv2__dates">
          <input
            type="date"
            className="plannerv2__date-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="Trip start"
          />
          <span className="plannerv2__date-sep">→</span>
          <input
            type="date"
            className="plannerv2__date-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="Trip end"
          />
        </div>
      </div>

      <div className="plannerv2__grid">
        {/* Budget column */}
        <motion.section
          className="pcard pcard--budget"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pcard__header">
            <span className="pcard__icon">💰</span>
            <h2>Budget</h2>
          </div>

          <div className="pcard__donut-wrap">
            <DonutChart pct={pct} over={over} />
            <div className="pcard__budget-nums">
              <div className="pcard__budget-num">
                <span className="pcard__num">{inr(spent)}</span>
                <span className="pcard__numlabel">spent</span>
              </div>
              <div className="pcard__budget-num">
                <span className={`pcard__num ${over ? 'is-over' : ''}`}>{inr(Math.abs(remaining))}</span>
                <span className="pcard__numlabel">{over ? 'over' : 'left'}</span>
              </div>
            </div>
          </div>

          <label className="pcard__cap-label">
            Total budget
            <input
              className="pcard__cap-input"
              type="number"
              value={budgetCap}
              min={0}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
            />
          </label>

          <ul className="pcard__items">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.li
                  key={it.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="pcard__item"
                >
                  <span className="pcard__item-dot" />
                  <span className="pcard__item-label">{it.label}</span>
                  <span className="pcard__item-amt">{inr(it.amount)}</span>
                  <button className="pcard__item-del" onClick={() => removeItem(it.id)} aria-label="Remove">✕</button>
                </motion.li>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <li className="pcard__empty">Add flights, stays, activities…</li>
            )}
          </ul>

          <div className="pcard__add-row">
            <input
              className="pcard__add-input"
              placeholder="Item (e.g. Paragliding)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitItem()}
            />
            <input
              className="pcard__add-input pcard__add-input--amt"
              type="number"
              placeholder="₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitItem()}
            />
            <button className="btn btn--primary btn--sm" onClick={submitItem}>+</button>
          </div>
        </motion.section>

        {/* Itinerary column */}
        <motion.section
          className="pcard pcard--stops"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pcard__header">
            <span className="pcard__icon">📍</span>
            <h2>Itinerary</h2>
          </div>

          {savedDests.length > 0 && (
            <div className="pcard__quick">
              <span className="pcard__quick-label">Quick add from saved:</span>
              <div className="pcard__chips">
                {savedDests.map((d) => (
                  <button key={d.slug} className="chip chip--sm" onClick={() => submitStop(d.name)}>
                    + {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pcard__timeline">
            <AnimatePresence initial={false}>
              {stops.map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`pcard__stop ${p.done ? 'is-done' : ''}`}
                >
                  <div className="pcard__stop-line">
                    <button
                      className="pcard__stop-check"
                      onClick={() => toggleStop(p.id)}
                      aria-label="Toggle done"
                    >
                      {p.done ? '✓' : idx + 1}
                    </button>
                    <div className="pcard__stop-connector" />
                  </div>
                  <div className="pcard__stop-body">
                    <span className="pcard__stop-title">{p.title}</span>
                    <button className="pcard__stop-del" onClick={() => removeStop(p.id)} aria-label="Remove">✕</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {stops.length === 0 && (
              <p className="pcard__empty">Add the places you want to visit…</p>
            )}
          </div>

          <div className="pcard__add-row">
            <input
              className="pcard__add-input"
              placeholder="Add a place or stop…"
              value={stop}
              onChange={(e) => setStop(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitStop()}
            />
            <button className="btn btn--primary btn--sm" onClick={() => submitStop()}>+</button>
          </div>

          <Link to="/explore" className="pcard__discover">Discover more destinations →</Link>
        </motion.section>

        {/* Notes column */}
        <motion.section
          className="pcard pcard--notes"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pcard__header">
            <span className="pcard__icon">✍️</span>
            <h2>Notes</h2>
          </div>

          <div className="pcard__tags">
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                className={`chip chip--sm ${activeTag === tag ? 'is-active' : ''}`}
                onClick={() => appendTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          <textarea
            className="pcard__notes"
            placeholder="Pack layers for the Ghats. Sunrise trek on day 2. Book scuba in advance…"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setActiveTag(null); }}
            rows={14}
          />
        </motion.section>
      </div>
    </div>
  );
}
