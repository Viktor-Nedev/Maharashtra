import { useMemo, useState } from 'react';

export interface TripEvent {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  label: string;
  type: 'planned' | 'booked';
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toDate = (s: string) => new Date(s + 'T00:00:00');

/**
 * Local YYYY-MM-DD key. We must NOT use toISOString() here: dates are built at
 * LOCAL midnight, and in any +offset timezone (e.g. India UTC+5:30) toISOString
 * rolls back to the previous UTC day — which would mis-key every event one day
 * early and make booking dots land on the wrong cell (or vanish at month edges).
 */
const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Expand each event's [from, to] range into the individual day strings it covers. */
function eventsByDay(events: TripEvent[]): Map<string, TripEvent[]> {
  const map = new Map<string, TripEvent[]>();
  for (const ev of events) {
    const start = toDate(ev.dateFrom);
    const end = toDate(ev.dateTo);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = localKey(d);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
  }
  return map;
}

export function TripCalendar({ events }: { events: TripEvent[] }) {
  // Start on the month of the soonest upcoming trip, else today.
  const initial = useMemo(() => {
    const todayStr = localKey(new Date());
    const upcoming = events
      .map((e) => e.dateFrom)
      .filter((d) => d >= todayStr)
      .sort()[0];
    return upcoming ? toDate(upcoming) : new Date();
  }, [events]);

  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());

  const byDay = useMemo(() => eventsByDay(events), [events]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = localKey(new Date());

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="trip-cal">
      <div className="trip-cal__head">
        <button type="button" onClick={prev} aria-label="Previous month">‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button type="button" onClick={next} aria-label="Next month">›</button>
      </div>
      <div className="trip-cal__grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="trip-cal__dow">{d}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = byDay.get(dateStr) ?? [];
          const hasBooked = dayEvents.some((e) => e.type === 'booked');
          const hasPlanned = dayEvents.some((e) => e.type === 'planned');
          const isToday = dateStr === todayStr;
          const cls = [
            'trip-cal__day',
            hasBooked ? 'is-booked' : hasPlanned ? 'is-planned' : '',
            isToday ? 'is-today' : '',
          ].filter(Boolean).join(' ');
          return (
            <div
              key={day}
              className={cls}
              title={dayEvents.map((e) => e.label).join(', ')}
            >
              {day}
              {dayEvents.length > 0 && <span className="trip-cal__dot" />}
            </div>
          );
        })}
      </div>
      <div className="trip-cal__legend">
        <span><i className="trip-cal__swatch is-planned" /> Planned</span>
        <span><i className="trip-cal__swatch is-booked" /> Booked</span>
        <span><i className="trip-cal__swatch is-today" /> Today</span>
      </div>
    </div>
  );
}
