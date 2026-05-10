// Service-role Supabase client. BYPASSES Row-Level Security.
//
// Only import this from server-side code that genuinely needs to act on
// behalf of any user — currently just the Apple Health webhook ingest route,
// which has no session because the iOS app POSTs directly with a bearer key.
//
// NEVER import this from client components or expose the service-role key
// in any response body.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not set. Configure Supabase env vars (see SUPABASE_SETUP.md).`,
    );
  }
  return v;
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  return cached;
}
