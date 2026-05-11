import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  EMPTY_HEALTH_SAMPLES,
  ROLLUP_RETENTION_DAYS,
  type DayRollup,
  type HealthSamples,
  type IngestSummary,
} from "@/lib/types/health";

function resolveDataDir(): string {
  const override = process.env.LIFEOS_DATA_DIR;
  if (override && override.length > 0) return override;
  if (process.env.VERCEL) return "/tmp/lifeos";
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const FILE_PATH = path.join(DATA_DIR, "health-samples.json");

let writeChain: Promise<void> = Promise.resolve();

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function getSupabaseHealthUserId(): string | null {
  return (
    process.env.LIFEOS_HEALTH_USER_ID ||
    process.env.LIFEOS_SUPABASE_USER_ID ||
    null
  );
}

function hasSupabaseHealthStore(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    getSupabaseHealthUserId()
  );
}

async function readSupabaseHealthSamples(): Promise<HealthSamples> {
  const userId = getSupabaseHealthUserId();
  if (!userId) return { ...EMPTY_HEALTH_SAMPLES, days: {} };

  const supabase = getSupabaseAdminClient();
  const { data: dayRows, error: dayError } = await supabase
    .from("health_days")
    .select("date,data")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  if (dayError) throw new Error(`health_days_read_failed: ${dayError.message}`);

  const { data: logRow, error: logError } = await supabase
    .from("health_ingest_log")
    .select("last_at,metrics,samples")
    .eq("user_id", userId)
    .maybeSingle();
  if (logError) throw new Error(`health_log_read_failed: ${logError.message}`);

  const days: Record<string, DayRollup> = {};
  for (const row of dayRows ?? []) {
    const date = String(row.date);
    days[date] = { ...(row.data as DayRollup), date };
  }

  return {
    days,
    lastIngest: logRow
      ? {
          at: String(logRow.last_at),
          metrics: Number(logRow.metrics ?? 0),
          samples: Number(logRow.samples ?? 0),
        }
      : null,
  };
}

async function writeSupabaseHealthSamples(state: HealthSamples): Promise<void> {
  const userId = getSupabaseHealthUserId();
  if (!userId) throw new Error("LIFEOS_HEALTH_USER_ID is not set");
  const supabase = getSupabaseAdminClient();
  const rows = Object.values(state.days).map((day) => ({
    user_id: userId,
    date: day.date,
    data: day,
    ingested_at: state.lastIngest?.at ?? new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("health_days")
      .upsert(rows, { onConflict: "user_id,date" });
    if (error) throw new Error(`health_days_write_failed: ${error.message}`);
  }

  if (state.lastIngest) {
    const { error } = await supabase.from("health_ingest_log").upsert(
      {
        user_id: userId,
        last_at: state.lastIngest.at,
        metrics: state.lastIngest.metrics,
        samples: state.lastIngest.samples,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(`health_log_write_failed: ${error.message}`);
  }
}

export async function readHealthSamples(): Promise<HealthSamples> {
  if (hasSupabaseHealthStore()) return readSupabaseHealthSamples();

  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<HealthSamples>;
    return {
      days: parsed.days ?? {},
      lastIngest: parsed.lastIngest ?? null,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...EMPTY_HEALTH_SAMPLES, days: {} };
    }
    throw err;
  }
}

async function writeHealthSamples(state: HealthSamples): Promise<void> {
  if (hasSupabaseHealthStore()) {
    await writeSupabaseHealthSamples(state);
    return;
  }

  await ensureDir();
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function chain<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeChain.then(fn, fn);
  writeChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function trimOldDays(days: Record<string, DayRollup>): Record<string, DayRollup> {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - ROLLUP_RETENTION_DAYS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const out: Record<string, DayRollup> = {};
  for (const [date, day] of Object.entries(days)) {
    if (date >= cutoffIso) out[date] = day;
  }
  return out;
}

// Merge incoming day rollups into existing ones. For each metric, the
// incoming value wins when present (Health Auto Export resends overlapping
// windows, so newer pushes are authoritative).
export function mergeDayRollups(
  existing: DayRollup | undefined,
  incoming: DayRollup,
): DayRollup {
  if (!existing) return incoming;
  return {
    date: incoming.date,
    sleep: incoming.sleep ?? existing.sleep,
    hrv: incoming.hrv ?? existing.hrv,
    restingHeartRate: incoming.restingHeartRate ?? existing.restingHeartRate,
    steps: incoming.steps ?? existing.steps,
    activeEnergyKcal: incoming.activeEnergyKcal ?? existing.activeEnergyKcal,
    exerciseMinutes: incoming.exerciseMinutes ?? existing.exerciseMinutes,
    mindfulMinutes: incoming.mindfulMinutes ?? existing.mindfulMinutes,
    respiratoryRate: incoming.respiratoryRate ?? existing.respiratoryRate,
    workouts: incoming.workouts ?? existing.workouts,
    raw: { ...(existing.raw ?? {}), ...(incoming.raw ?? {}) },
  };
}

export function applyIngest(
  state: HealthSamples,
  incomingDays: DayRollup[],
  summary: IngestSummary,
): HealthSamples {
  const days = { ...state.days };
  for (const day of incomingDays) {
    days[day.date] = mergeDayRollups(days[day.date], day);
  }
  return {
    days: trimOldDays(days),
    lastIngest: summary,
  };
}

export function ingestRollups(
  incomingDays: DayRollup[],
  summary: IngestSummary,
): Promise<HealthSamples> {
  return chain(async () => {
    const current = await readHealthSamples();
    const next = applyIngest(current, incomingDays, summary);
    await writeHealthSamples(next);
    return next;
  });
}

export async function clearHealthSamples(): Promise<void> {
  await chain(async () => {
    if (hasSupabaseHealthStore()) {
      const userId = getSupabaseHealthUserId();
      if (!userId) return;
      const supabase = getSupabaseAdminClient();
      const { error: daysError } = await supabase
        .from("health_days")
        .delete()
        .eq("user_id", userId);
      if (daysError) throw new Error(`health_days_delete_failed: ${daysError.message}`);
      const { error: logError } = await supabase
        .from("health_ingest_log")
        .delete()
        .eq("user_id", userId);
      if (logError) throw new Error(`health_log_delete_failed: ${logError.message}`);
      return;
    }

    try {
      await fs.unlink(FILE_PATH);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  });
}

export function getHealthDataDirInfo() {
  return {
    dataDir: hasSupabaseHealthStore() ? "supabase:health_days" : DATA_DIR,
    ephemeral:
      !hasSupabaseHealthStore() &&
      !process.env.LIFEOS_DATA_DIR &&
      !!process.env.VERCEL,
  };
}
