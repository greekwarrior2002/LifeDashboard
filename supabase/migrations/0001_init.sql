-- LifeDashboard initial schema.
--
-- Run this in the Supabase SQL Editor after creating the project.
-- Authenticated users get one profile row, integration tokens are stored
-- encrypted at rest (encryption happens in the Next.js app — Supabase only
-- stores the ciphertext + IV), and Apple Health rollups are stored per-day.

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users. Holds everything the dashboard reads on
-- every page load (name, program, goals, visibility toggles, health prefs).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  program text not null default '',
  cycle text not null default '',
  timezone text not null default 'America/Toronto',
  onboarding_completed_at timestamptz,
  priorities text[] not null default '{}',
  focus_areas text[] not null default '{}',
  sleep_target_hours numeric not null default 8,
  recovery_goal int not null default 80,
  habits text[] not null default '{}',
  visible_cards jsonb not null default '{
    "ticktick": true,
    "calendar": true,
    "health": true,
    "finance": true,
    "cars": true,
    "research": true,
    "applications": true,
    "journal": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- integrations: 1 row per (user, provider). Stores opaque encrypted token
-- payloads; the app encrypts/decrypts using LIFEOS_AUTH_SECRET so a Supabase
-- DB leak alone does not expose OAuth refresh tokens.
-- ---------------------------------------------------------------------------
create table public.integrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google', 'ticktick', 'apple_health')),
  encrypted_ciphertext text not null,
  encrypted_iv text not null,
  scope text,
  api_key_fingerprint text,
  connected_at timestamptz not null default now(),
  primary key (user_id, provider)
);

-- Used by the Apple Health webhook to look up which user a bearer token
-- belongs to without decrypting every row. Partial index — only Apple Health
-- rows have a fingerprint.
create index integrations_fingerprint_idx
  on public.integrations (api_key_fingerprint)
  where api_key_fingerprint is not null;

-- ---------------------------------------------------------------------------
-- health_days: rollups posted by the Health Auto Export iOS app.
-- One row per (user, date). data is the rollup blob (sleep, hrv, steps, etc).
-- ---------------------------------------------------------------------------
create table public.health_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null,
  ingested_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ---------------------------------------------------------------------------
-- health_ingest_log: tracks the most recent successful Apple Health sync,
-- so the dashboard can show "last sync 12m ago".
-- ---------------------------------------------------------------------------
create table public.health_ingest_log (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_at timestamptz not null,
  metrics int not null default 0,
  samples int not null default 0
);

-- ---------------------------------------------------------------------------
-- Auto-create a profiles row whenever a new auth.users row is inserted.
-- Runs as the postgres role (security definer) so the insert can target a
-- table protected by RLS without the new user having a session yet.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh on every profile change.
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security: every user only sees their own data.
-- The Apple Health webhook bypasses RLS by using the service-role key.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.integrations enable row level security;
alter table public.health_days enable row level security;
alter table public.health_ingest_log enable row level security;

create policy "profiles self select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

create policy "integrations self all" on public.integrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "health_days self all" on public.health_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "health_ingest_log self all" on public.health_ingest_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
