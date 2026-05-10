# Cutover Prompt — Send This to Claude Later

Copy everything between the `---` lines below and paste it as your next message to me when Supabase is set up. It tells me everything I need to do the auth + storage cutover.

---

I've finished the Supabase setup from `SUPABASE_SETUP.md`:

- Supabase project created
- `supabase/migrations/0001_init.sql` ran successfully (no errors)
- Email auth enabled, email confirmation **off**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel for Production + Preview + Development

Please ship the Supabase cutover commit on the `claude/mobile-optimization-xDR4U` branch. Scope:

## 1. Auth swap

- Replace `app/api/auth/login/route.ts` to call `supabase.auth.signInWithPassword({ email, password })`. Keep the `next` redirect param behavior. On success, redirect to `/onboarding` if the profile's `onboarding_completed_at` is null, else to `safeNext`.
- Add `app/api/auth/signup/route.ts` calling `supabase.auth.signUp({ email, password })`. Single-user app, but using Supabase signup (the trigger creates the profile row automatically).
- Replace `app/api/auth/logout/route.ts` to call `supabase.auth.signOut()`.
- Rewrite `app/login/page.tsx` to a Client Component with email + password fields and a "Create account" toggle. Keep the existing dark-glass aesthetic (`max-w-sm`, `h-11` inputs, neon-blue submit). Show inline auth errors.
- Replace `middleware.ts` to read the Supabase session via `@supabase/ssr` `createServerClient` against `req.cookies` and `res.cookies`. If no session → redirect to `/login`. If session but profile.onboarding_completed_at is null and not on `/onboarding` → redirect to `/onboarding`. Keep the same matcher: `["/((?!_next/|favicon.ico|login|api/).*)"]`.
- Update `lib/api-auth.ts` `requireSession` to return `{ ok: true, userId, supabase }` from a server-side Supabase client. Replace all callers.
- Keep `lib/auth.ts` only for `safeEqual` (still used by Apple Health webhook for constant-time comparison) and the OAuth state token helpers — delete `signSession`/`verifySession`.

## 2. User store rewrite

- Rewrite `lib/user-store.ts` to query `public.profiles` and `public.integrations` via the server Supabase client. Preserve the public function shapes (`getUser()`, `updateUser()`, `setIntegration()`, `clearIntegration()`, `completeOnboarding()`, `findUserByApiKeyFingerprint()`, `toPublic()`) so callers don't change beyond requireSession's return type.
  - `getUser()` → `select * from profiles where id = auth.uid()` + `select * from integrations where user_id = auth.uid()`, then map column names → existing `UserState` shape.
  - `updateUser(patch)` → read, apply patch, `upsert` into profiles (only the columns that changed).
  - `setIntegration(provider, record)` → upsert into integrations.
  - `clearIntegration(provider)` → delete from integrations where user_id + provider.
  - `completeOnboarding()` → update profiles set onboarding_completed_at = now() where id = auth.uid().
  - `findUserByApiKeyFingerprint(fp)` → use `getSupabaseAdminClient()` (service role) to look up `select user_id, ... from integrations where api_key_fingerprint = $1 and provider = 'apple_health'`. Return shape unchanged.
  - `toPublic()` stays the same.
- Drop the file-write fallback (`/tmp/lifeos`) — not needed anymore.
- Drop the cookie writes (`writeCookieState`, `writeIntegrationCookies`, `INTEGRATION_COOKIE_PREFIX`, etc.) — Supabase is the source of truth.

## 3. Health store rewrite

- Rewrite `lib/health-store.ts` (currently writes to `<DATA_DIR>/health-samples.json`) to use `public.health_days` and `public.health_ingest_log`. The webhook ingest path uses the admin client (no session), the read path (`/api/integrations/apple-health/summary`) uses the user-scoped server client.

## 4. Integration OAuth callbacks

For each of `app/api/oauth/google/{start,callback,disconnect}/route.ts` and `app/api/oauth/ticktick/{start,callback,disconnect}/route.ts`:

- `requireSession` now gives `userId` instead of an HMAC `secret`. Token encryption still uses `LIFEOS_AUTH_SECRET` from env (unchanged) — only the storage layer changes.
- OAuth state tokens (`createStateToken` / `verifyStateToken` in `lib/integrations/oauth-state.ts`): keep using `LIFEOS_AUTH_SECRET` from env directly instead of taking it as a parameter.
- `persistGoogleTokens` and `persistTickTickTokens` (in `lib/integrations/google-calendar.ts` and `lib/integrations/ticktick.ts`): change signature to take userId instead of secret, write to Supabase via `setIntegration`. Token decrypt path (`getValidTokens`) similarly: take userId, read from `getUser()` (which now hits Supabase).

## 5. Apple Health routes

- `app/api/integrations/apple-health/connect/route.ts` — same pattern: requireSession → userId, write encrypted record + fingerprint to Supabase.
- `app/api/integrations/apple-health/disconnect/route.ts` — same.
- `app/api/integrations/apple-health/ingest/route.ts` — uses admin client to look up user by fingerprint, then writes to `health_days` and `health_ingest_log`. Keep timing-safe comparison.
- `app/api/integrations/apple-health/summary/route.ts` — read from health_days via user-scoped client.

## 6. Cleanup

- Remove `LIFEOS_PASSWORD` from `.env.example` (the legacy section). Keep `LIFEOS_AUTH_SECRET` (still used for token encryption).
- Update `app/login/page.tsx` to drop the `?config=1` "missing LIFEOS_PASSWORD" warning.
- Run `npm run build` and `npm run typecheck`. Fix any type errors. Don't ship unless the build is clean.
- Commit with message `Migrate auth, user store, and integrations to Supabase` and push to `claude/mobile-optimization-xDR4U`.
- Don't open a PR — I'll merge to main from GitHub myself.

## What I've already verified before sending this prompt

- The schema is in Supabase (no errors when running `0001_init.sql`).
- Email signups are enabled, confirm-email is off.
- The three env vars are set in Vercel for all three environments.
- I'm OK with re-onboarding once after the cutover deploys (existing cookie-based onboarding state and integration tokens won't migrate).

If anything in this scope is ambiguous, ask me before changing it. Specifically: don't introduce a multi-user UI, don't add email confirmation flows, don't change the visual design.
