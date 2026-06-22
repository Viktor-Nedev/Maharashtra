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
