import { DESTINATIONS, type Activity, type Destination, type ActivityCategory } from '@/data/destinations';

export interface ItineraryDay {
  day: number;
  destination: Destination;
  activities: Activity[];
  subtotal: number; // for `people`
}

export interface Itinerary {
  days: ItineraryDay[];
  total: number;
  people: number;
  budget: number;
}

export interface ItineraryOptions {
  days?: number;
  people?: number;
  budget?: number; // total budget for the whole trip (all people)
  category?: ActivityCategory | 'all';
}

/**
 * Builds a deterministic multi-day Maharashtra itinerary from the destination
 * dataset, greedily filling each day with ~2 activities at a distinct region
 * while staying under budget. Pure data → works with or without the AI API, so
 * the Planner integration is always reliable for demos.
 */
export function buildItinerary(opts: ItineraryOptions = {}): Itinerary {
  const days = opts.days ?? 3;
  const people = opts.people ?? 2;
  const budget = opts.budget ?? 25000;
  const category = opts.category ?? 'all';
  const perDayBudget = (budget / days) / people;

  // Rank destinations by how many matching, affordable activities they offer.
  const pool = DESTINATIONS.map((d) => ({
    destination: d,
    activities: d.activities
      .filter((a) => category === 'all' || a.category === category)
      .sort((a, b) => a.pricePerPerson - b.pricePerPerson),
  })).filter((p) => p.activities.length > 0);

  const result: ItineraryDay[] = [];
  let total = 0;

  for (let day = 1; day <= days && pool.length > 0; day++) {
    // Rotate through distinct destinations across days.
    const slot = pool[(day - 1) % pool.length];
    const picked: Activity[] = [];
    let spent = 0;

    for (const a of slot.activities) {
      if (picked.length >= 2) break;
      if (spent + a.pricePerPerson <= perDayBudget || picked.length === 0) {
        picked.push(a);
        spent += a.pricePerPerson;
      }
    }

    const subtotal = spent * people;
    total += subtotal;
    result.push({ day, destination: slot.destination, activities: picked, subtotal });
  }

  return { days: result, total, people, budget };
}

/** Human-readable markdown summary for the chat transcript. */
export function itineraryToMarkdown(it: Itinerary): string {
  const lines: string[] = [
    `**Your ${it.days.length}-day Maharashtra itinerary** (for ${it.people} ${it.people === 1 ? 'person' : 'people'}):`,
    '',
  ];
  for (const d of it.days) {
    lines.push(`**Day ${d.day} · ${d.destination.name}**`);
    for (const a of d.activities) {
      lines.push(`• ${a.name} — ${a.durationHours}h · ₹${a.pricePerPerson.toLocaleString('en-IN')}/person`);
    }
    lines.push(`_Day subtotal: ₹${d.subtotal.toLocaleString('en-IN')}_`);
    lines.push('');
  }
  lines.push(`**Estimated total: ₹${it.total.toLocaleString('en-IN')}** (budget ₹${it.budget.toLocaleString('en-IN')})`);
  lines.push('');
  lines.push('Saved to your [Trip Planner](/planner) ✓');
  return lines.join('\n');
}
