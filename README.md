# Life OS — Command Center

A futuristic, dark-mode personal operating system for one high-performing graduate student.
Built as a calm, intelligent dashboard combining priorities, calendar, research, recovery, finances, cars, and life analytics into a single mission-control surface.

## Stack

- Next.js 14 · React 18 · TypeScript
- Tailwind CSS (custom dark palette, glassmorphism, glow accents)
- Framer Motion (page + card animations)
- Recharts (radar, area, bar, line, donut)
- lucide-react icons
- Supabase-ready architecture (mock data layer today, drop-in replacement tomorrow)

## Run locally

```bash
npm install
cp .env.example .env.local      # then edit it
npm run dev
```

`.env.local` must define:

- `LIFEOS_PASSWORD` — your personal passphrase (used to sign in).
- `LIFEOS_AUTH_SECRET` — random string for cookie signing. Generate with
  `openssl rand -base64 48`.

Open <http://localhost:3000> → enter the passphrase → 30-day session cookie.

## Deploy to Vercel (recommended)

1. Push the repo to GitHub (already done on `claude/life-command-center-HFrKE`).
2. Go to <https://vercel.com/new> → "Import" → pick `greekwarrior2002/LifeDashboard`.
3. Framework auto-detects as Next.js — no build config needed.
4. Under **Environment Variables**, add:
   - `LIFEOS_PASSWORD` = your passphrase
   - `LIFEOS_AUTH_SECRET` = `openssl rand -base64 48`
5. Deploy. You'll get a URL like `lifeos-yourname.vercel.app`. Visit on phone /
   iPad / laptop — it asks once for the passphrase, then stays signed in for 30
   days.
6. Optional: add a custom domain (e.g. `lifeos.yourname.com`) in
   Project → Settings → Domains.

Every push to the branch auto-deploys with a unique preview URL; merging to
your default branch updates the production URL.

## Auth model

- Single user, single passphrase.
- Edge middleware (`middleware.ts`) gates every route except `/login` and the
  auth API.
- Successful login sets an HMAC-SHA256-signed, HttpOnly, Secure, SameSite=Lax
  cookie that expires in 30 days.
- Logout button in the sidebar clears the cookie.
- `~750ms` artificial delay on each login attempt to soften brute force.

## Routes

- `/` — Mission Control (homepage)
- `/calendar` — Day timeline view
- `/tasks` — Priorities + TickTick workspace
- `/research` — Lab projects, deadlines, publications
- `/health` — Recovery, sleep consistency, life balance
- `/finance` — Cash flow, spending, subscriptions, savings
- `/cars` — Garage and service logs (Audi A5 Quattro, Audi TT)
- `/applications` — Med school cycle tracker
- `/timeline` — Long-form life timeline
- `/journal` — Daily reflection
- `/analytics` — Life balance + cognitive heatmap
- `/settings` — Integrations & profile

## Design language

- Matte black / dark navy (`ink-950 → 500`)
- Neon blue, violet, emerald, amber accents
- Glass cards with subtle radial glow
- Inter typography, tabular numerals
- Premium feel — calm, intelligent, low cognitive clutter

## Replacing mock data

All mock data lives in `lib/mock-data.ts`. Swap each export for a Supabase/TickTick/Google Calendar fetcher
and the rest of the app stays untouched.
