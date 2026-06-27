import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When env vars are absent the client is null and the app falls back to
// localStorage + seed data so demos work without a backend.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseEnabled = supabase !== null;
