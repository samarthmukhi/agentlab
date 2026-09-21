// Central place to read the Supabase env vars and decide whether cloud auth is
// enabled. When these are absent, AgentLab runs exactly as before: local-only,
// no account, no API key required (Invariant 10 preserved).

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);
}
