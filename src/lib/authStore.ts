import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

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
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  async signIn(email, password) {
    if (!supabase) return 'Demo mode: Supabase not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  async signUp(email, password, name) {
    if (!supabase) return 'Demo mode: Supabase not configured.';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return error?.message ?? null;
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
