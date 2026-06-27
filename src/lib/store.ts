import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './toastStore';
import { supabase } from './supabase';
import { useAuthStore } from './authStore';

export const MAX_COMPARE = 3;

/** Current signed-in user id, or null. Read lazily to avoid an import cycle. */
const uid = (): string | null => useAuthStore.getState().user?.id ?? null;

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

/** A trip the user has saved (not yet paid) with a chosen date range. */
export interface PlannedTrip {
  id: string;
  destinationSlug: string;
  destinationName: string;
  activityId: string;
  activityName: string;
  image: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD (== dateFrom for single-day)
  people: number;
  total: number;
  createdAt: number;
}

interface PlatformState {
  saved: string[]; // destination slugs
  plannedTrips: PlannedTrip[];
  bookings: Booking[];
  compare: string[]; // destination slugs queued for comparison
  toggleSaved: (slug: string) => void;
  isSaved: (slug: string) => boolean;
  addPlannedTrip: (t: Omit<PlannedTrip, 'id' | 'createdAt'>) => PlannedTrip;
  removePlannedTrip: (id: string) => void;
  isActivityPlanned: (activityId: string) => boolean;
  toggleCompare: (slug: string) => void;
  isComparing: (slug: string) => boolean;
  clearCompare: () => void;
  addBooking: (b: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  removeBooking: (id: string) => void;
  /** Hydrate saved/planned/bookings from Supabase for a signed-in user. */
  loadUserData: (userId: string) => Promise<void>;
  /** Clear personal data on sign-out so the next user starts clean. */
  clearUserData: () => void;
}

// --- Supabase write-through (fire-and-forget; UI already updated optimistically)
// All no-op when Supabase is unconfigured or no user is signed in, so the app
// stays fully functional offline with the localStorage cache.
function dbSaveDestination(slug: string) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('saved_trips').upsert({ user_id: id, destination_slug: slug })
    .then(({ error }) => { if (error) console.warn('[saved_trips upsert]', error.message); });
}
function dbUnsaveDestination(slug: string) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('saved_trips').delete().match({ user_id: id, destination_slug: slug })
    .then(({ error }) => { if (error) console.warn('[saved_trips delete]', error.message); });
}
function dbAddPlannedTrip(t: PlannedTrip) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('planned_trips').insert({
    id: t.id, user_id: id,
    destination_slug: t.destinationSlug, destination_name: t.destinationName,
    activity_id: t.activityId, activity_name: t.activityName, image: t.image,
    date_from: t.dateFrom, date_to: t.dateTo, people: t.people, total: t.total,
  }).then(({ error }) => { if (error) console.warn('[planned_trips insert]', error.message); });
}
function dbRemovePlannedTrip(tripId: string) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('planned_trips').delete().match({ id: tripId, user_id: id })
    .then(({ error }) => { if (error) console.warn('[planned_trips delete]', error.message); });
}
function dbAddBooking(b: Booking) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('bookings').insert({
    id: b.id, user_id: id,
    destination_slug: b.destinationSlug, destination_name: b.destinationName,
    activity_id: b.activityId, activity_name: b.activityName,
    booking_date: b.date, people: b.people, total: b.total, status: 'confirmed',
  }).then(({ error }) => { if (error) console.warn('[bookings insert]', error.message); });
}
function dbRemoveBooking(bookingId: string) {
  const id = uid();
  if (!supabase || !id) return;
  void supabase.from('bookings').delete().match({ id: bookingId, user_id: id })
    .then(({ error }) => { if (error) console.warn('[bookings delete]', error.message); });
}

// Row shapes returned by Supabase (untyped client → cast on read).
interface SavedRow { destination_slug: string }
interface PlannedRow {
  id: string; destination_slug: string; destination_name: string;
  activity_id: string; activity_name: string; image: string | null;
  date_from: string; date_to: string; people: number; total: number; created_at: string;
}
interface BookingRow {
  id: string; destination_slug: string; destination_name: string;
  activity_id: string; activity_name: string; booking_date: string;
  people: number; total: number; created_at: string;
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
      plannedTrips: [],
      bookings: [],
      compare: [],
      toggleSaved: (slug) => {
        const wasSaved = get().saved.includes(slug);
        set((s) => ({
          saved: wasSaved ? s.saved.filter((x) => x !== slug) : [...s.saved, slug],
        }));
        if (wasSaved) dbUnsaveDestination(slug);
        else dbSaveDestination(slug);
        toast(wasSaved ? 'Removed from saved trips' : 'Saved to your trips ♥', 'success');
      },
      isSaved: (slug) => get().saved.includes(slug),
      addPlannedTrip: (t) => {
        const trip: PlannedTrip = { ...t, id: crypto.randomUUID(), createdAt: Date.now() };
        const needsSave = !get().saved.includes(t.destinationSlug);
        set((s) => ({
          plannedTrips: [trip, ...s.plannedTrips],
          // keep the destination flagged as saved for the heart/Regions UI
          saved: needsSave ? [...s.saved, t.destinationSlug] : s.saved,
        }));
        dbAddPlannedTrip(trip);
        if (needsSave) dbSaveDestination(t.destinationSlug);
        const days = Math.round(
          (new Date(t.dateTo).getTime() - new Date(t.dateFrom).getTime()) / 86_400_000,
        ) + 1;
        toast(
          days > 1 ? `Saved ${t.activityName} for ${days} days ♥` : `Saved ${t.activityName} ♥`,
          'success',
        );
        return trip;
      },
      removePlannedTrip: (id) => {
        set((s) => ({ plannedTrips: s.plannedTrips.filter((t) => t.id !== id) }));
        dbRemovePlannedTrip(id);
      },
      isActivityPlanned: (activityId) =>
        get().plannedTrips.some((t) => t.activityId === activityId),
      toggleCompare: (slug) => {
        const current = get().compare;
        if (current.includes(slug)) {
          set({ compare: current.filter((x) => x !== slug) });
          return;
        }
        if (current.length >= MAX_COMPARE) {
          toast(`You can compare up to ${MAX_COMPARE} destinations`, 'info');
          return;
        }
        set({ compare: [...current, slug] });
        toast('Added to comparison', 'success');
      },
      isComparing: (slug) => get().compare.includes(slug),
      clearCompare: () => set({ compare: [] }),
      addBooking: (b) => {
        const booking: Booking = {
          ...b,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        dbAddBooking(booking);
        return booking;
      },
      removeBooking: (id) => {
        set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) }));
        dbRemoveBooking(id);
      },

      loadUserData: async (userId) => {
        if (!supabase) return;
        const [savedRes, plannedRes, bookingsRes] = await Promise.all([
          supabase.from('saved_trips').select('destination_slug').eq('user_id', userId),
          supabase.from('planned_trips').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        ]);
        const saved = ((savedRes.data ?? []) as SavedRow[]).map((r) => r.destination_slug);
        const plannedTrips: PlannedTrip[] = ((plannedRes.data ?? []) as PlannedRow[]).map((r) => ({
          id: r.id,
          destinationSlug: r.destination_slug,
          destinationName: r.destination_name,
          activityId: r.activity_id,
          activityName: r.activity_name,
          image: r.image ?? '',
          dateFrom: r.date_from,
          dateTo: r.date_to,
          people: r.people,
          total: r.total,
          createdAt: new Date(r.created_at).getTime(),
        }));
        const bookings: Booking[] = ((bookingsRes.data ?? []) as BookingRow[]).map((r) => ({
          id: r.id,
          destinationSlug: r.destination_slug,
          destinationName: r.destination_name,
          activityId: r.activity_id,
          activityName: r.activity_name,
          date: r.booking_date,
          people: r.people,
          total: r.total,
          createdAt: new Date(r.created_at).getTime(),
        }));
        set({ saved, plannedTrips, bookings });
      },

      clearUserData: () => set({ saved: [], plannedTrips: [], bookings: [] }),
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
