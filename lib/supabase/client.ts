// Browser Supabase client. Use from Client Components ("use client").
// Safe to import at module scope — the createBrowserClient call is
// idempotent and reads only the public env vars.

"use client";

import { createBrowserClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not set. Configure Supabase env vars (see SUPABASE_SETUP.md).`,
    );
  }
  return v;
}

export const supabase = createBrowserClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
);
