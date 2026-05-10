// Server-side Supabase client. Use from Route Handlers, Server Components,
// and Server Actions. Reads/writes the user's session cookie automatically
// so RLS policies see auth.uid() correctly.
//
// The clients are intentionally created per-request — never cache them across
// requests (cookies() is request-scoped).

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `${name} is not set. Configure Supabase env vars (see SUPABASE_SETUP.md).`,
    );
  }
  return v;
}

export function getSupabaseServerClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const store = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: (name, value, options) => {
        try {
          store.set({ name, value, ...options });
        } catch {
          // Calling .set() outside of a Route Handler / Server Action throws.
          // Read-only contexts (Server Components) can safely ignore writes —
          // the session refresh will land on the next mutating request.
        }
      },
      remove: (name, options) => {
        try {
          store.set({ name, value: "", ...options });
        } catch {
          // Same as above.
        }
      },
    },
  });
}
