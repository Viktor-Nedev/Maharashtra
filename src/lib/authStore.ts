import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

/** Ensure a profile row exists for a signed-in user (runs once a session exists,
 * i.e. AFTER email confirmation — RLS needs an authenticated uid). */
function ensureProfile(user: User | null) {
  if (!supabase || !user) return;
  const name = (user.user_metadata?.name as string | undefined) ?? '';
  void supabase
    .from('profiles')
    .upsert({ id: user.id, name })
    .then(({ error }) => { if (error) console.warn('[profiles upsert]', error.message); });
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init() {
    if (!supabase) {
      set({ loading: false });
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      set({ user: data.user, loading: false });
      ensureProfile(data.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      ensureProfile(session?.user ?? null);
    });
  },

  async signIn(email, password) {
    if (!supabase) return 'Demo mode: Supabase not configured. Add VITE_SUPABASE_ANON_KEY to .env';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  async signUp(email, password, name) {
    if (!supabase) return 'Demo mode: Supabase not configured. Add VITE_SUPABASE_ANON_KEY to .env';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return error.message;
    // The profile row is created on the first authenticated session (after the
    // user confirms their email) — see ensureProfile in init().
    return null;
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
