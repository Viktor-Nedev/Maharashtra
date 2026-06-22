import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase is OPTIONAL. When env vars are absent the client is null and the app
 * transparently falls back to local seed data + localStorage (see store.ts), so
 * the project runs and demos with zero backend configuration.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseEnabled = supabase !== null;
