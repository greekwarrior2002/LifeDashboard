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

## Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

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
