/**
 * Supabase Admin Client — src/lib/supabase/admin.ts
 * Uses service role key — ONLY import in server-side code.
 * NEVER expose to client. Bypasses RLS.
 *
 * Lazy singleton: client is created on first call, not at module load.
 * This prevents build-time / server-startup crashes when env vars are
 * not yet available (e.g. first Vercel deployment before env is configured).
 */
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[admin.ts] Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in Vercel → Project Settings → Environment Variables."
    );
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/**
 * Convenience proxy — keeps existing `supabaseAdmin.from(...)` call-sites working
 * while still lazy-loading the client on first use.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabaseAdmin() as any)[prop];
  },
});
