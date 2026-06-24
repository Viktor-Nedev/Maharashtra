import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Booking {
  id: string;
  destinationSlug: string;
  destinationName: string;
  activityId: string;
  activityName: string;
  date: string;
  people: number;
  total: number;
  createdAt: number;
}

interface PlatformState {
  saved: string[]; // destination slugs
  bookings: Booking[];
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  addBooking: (b: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  removeBooking: (id: string) => void;
}

/**
 * Client-side persistence for saved trips + booking history. When Supabase is
 * configured this layer can be swapped for DB calls; the UI contract is the
 * same, so the booking flow works identically offline for demos.
 */
export const usePlatformStore = create<PlatformState>()(
  persist(
    (set, get) => ({
      saved: [],
      bookings: [],
      toggleSaved: (slug) =>
        set((s) => ({
          saved: s.saved.includes(slug)
            ? s.saved.filter((x) => x !== slug)
            : [...s.saved, slug],
        })),
      isSaved: (slug) => get().saved.includes(slug),
      addBooking: (b) => {
        const booking: Booking = {
          ...b,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },
      removeBooking: (id) =>
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),
    }),
    { name: 'maharashtra-platform' },
  ),
);

// --- Trip Planner (notebook) ----------------------------------------------
export interface PlannerStop {
  id: string;
  title: string;
  done: boolean;
}
export interface BudgetItem {
  id: string;
  label: string;
  amount: number;
}

interface PlannerState {
  budgetCap: number;
  items: BudgetItem[];
  stops: PlannerStop[];
  notes: string;
  setBudgetCap: (n: number) => void;
  addItem: (label: string, amount: number) => void;
  updateItem: (id: string, patch: Partial<Omit<BudgetItem, 'id'>>) => void;
  removeItem: (id: string) => void;
  addStop: (title: string) => void;
  toggleStop: (id: string) => void;
  removeStop: (id: string) => void;
  setNotes: (s: string) => void;
}

/** Persisted trip-planning notebook: budget, itinerary stops and free notes. */
export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      budgetCap: 25000,
      items: [],
      stops: [],
      notes: '',
      setBudgetCap: (budgetCap) => set({ budgetCap: Math.max(0, budgetCap) }),
      addItem: (label, amount) =>
        set((s) => ({
          items: [...s.items, { id: crypto.randomUUID(), label, amount: Math.max(0, amount) }],
        })),
      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      addStop: (title) =>
        set((s) => ({ stops: [...s.stops, { id: crypto.randomUUID(), title, done: false }] })),
      toggleStop: (id) =>
        set((s) => ({ stops: s.stops.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) })),
      removeStop: (id) => set((s) => ({ stops: s.stops.filter((p) => p.id !== id) })),
      setNotes: (notes) => set({ notes }),
    }),
    { name: 'maharashtra-planner' },
  ),
);
