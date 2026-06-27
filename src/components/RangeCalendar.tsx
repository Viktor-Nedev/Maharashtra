import { useState } from 'react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Props {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
  onPick: (date: string) => void;
  /** Allow selecting dates before today (default false). */
  allowPast?: boolean;
}

/** Reusable month-view calendar with start→end range highlighting. */
export function RangeCalendar({ from, to, onPick, allowPast = false }: Props) {
  const today = new Date();
  const init = from ? new Date(from + 'T00:00:00') : today;
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = today.toISOString().slice(0, 10);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="adp-calendar range-cal">
      <div className="adp-calendar__head">
        <button type="button" onClick={prev} aria-label="Previous month">‹</button>
        <span>{MONTHS[month]} {year}</span>
        <button type="button" onClick={next} aria-label="Next month">›</button>
      </div>
      <div className="adp-calendar__grid">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="adp-calendar__dow">{d}</span>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = !allowPast && dateStr < todayStr;
          const isStart = dateStr === from;
          const isEnd = dateStr === to;
          const inRange = from && to && dateStr > from && dateStr < to;
          const cls = [
            'adp-calendar__day',
            isStart || isEnd ? 'is-selected' : '',
            inRange ? 'is-in-range' : '',
            isPast ? 'is-past' : '',
          ].filter(Boolean).join(' ');
          return (
            <button key={day} type="button" className={cls} disabled={isPast} onClick={() => !isPast && onPick(dateStr)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
