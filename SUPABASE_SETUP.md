# Supabase Setup — LifeDashboard

This walks you through getting Supabase ready so the dashboard can sync your data across iPhone, iPad, and computer. Everything here can be done from your phone.

**What this commit does:** adds the Supabase SDK, the SQL schema, server/client/admin Supabase clients, and this guide. **No behavior changes yet** — your existing passphrase auth and cookie-based storage keep working.

**What the next commit will do:** swap auth to Supabase email/password, move profile/onboarding/integrations into the Supabase tables, and migrate the OAuth callbacks. After that, log in on iPhone = same data as desktop.

When you've finished the steps below, paste `CUTOVER_PROMPT.md` to me and I'll do the cutover commit.

---

## 1. Create the Supabase project (5 min)

1. Open [supabase.com](https://supabase.com) on your phone, sign in.
2. Tap **New project**.
3. Org: pick whatever (Personal is fine).
4. Name: `lifedashboard`.
5. Database password: tap the dice icon to generate a strong one. **Copy it to your password manager** — you'll need it once if you ever connect from a SQL client.
6. Region: pick the closest one to you (for Toronto: `East US (North Virginia)` or `Central Canada`).
7. Pricing plan: **Free**.
8. Tap **Create new project**. Provisioning takes ~2 minutes.

## 2. Run the schema (2 min)

1. In your project dashboard, tap the **SQL Editor** icon in the left rail.
2. Tap **New query**.
3. Open `supabase/migrations/0001_init.sql` in this repo on GitHub, tap **Copy raw file**.
4. Paste into the SQL editor.
5. Tap **Run** (bottom-right).
6. Expect: "Success. No rows returned." If you see an error, screenshot and send it to me.

## 3. Enable email auth (1 min)

1. Left rail → **Authentication** → **Providers**.
2. **Email** is enabled by default — verify the toggle is on.
3. Tap **Email** to expand. Make sure **Enable email signups** is on.
4. (Optional but recommended) Turn **Confirm email** OFF for now — you're the only user, no need to verify yourself. You can turn it back on later.

## 4. Grab the keys (1 min)

1. Left rail → **Project Settings** → **API**.
2. Copy three values into a note:
   - **Project URL** (something like `https://abcd1234.supabase.co`)
   - **Project API keys → anon / public** (long `eyJ...` string)
   - **Project API keys → service_role** (long `eyJ...` string — **secret, don't share**)

## 5. Add env vars to Vercel (3 min)

1. Open [vercel.com](https://vercel.com) → your `lifedashboard` project.
2. **Settings** → **Environment Variables**.
3. Add these three, all checked for **Production**, **Preview**, and **Development**:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |

4. **Don't redeploy yet** — there's nothing using these vars until the cutover commit.

## 6. Create your user account (after cutover commit lands)

The cutover commit replaces the passphrase login with email + password. After it deploys:

1. Visit `lifedashboard.vercel.app/login` on your phone.
2. Tap **Create account**, enter your email + a strong password.
3. Done. Your profile row in Supabase is auto-created by a trigger.
4. Walk through onboarding once — it'll be saved to Supabase, so when you log in on desktop you'll see the same setup.
5. Re-connect Google Calendar, TickTick, and Apple Health from Settings (the old cookies don't carry over).

## What you can ignore

- **Storage** (in the Supabase left rail) — not used.
- **Edge Functions** — not used.
- **Realtime** — optional, can wire up later if you want priorities to update live across devices.
- **Database backups** — Free tier has 7-day point-in-time recovery automatically.

## When you're done

Paste me `CUTOVER_PROMPT.md` (it has all the context I need) and I'll ship the cutover commit. I'll mention any deployment gotchas in that commit's message.
