import { promises as fs } from "node:fs";
import path from "node:path";
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

export async function readHealthSamples(): Promise<HealthSamples> {
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
    try {
      await fs.unlink(FILE_PATH);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  });
}

export function getHealthDataDirInfo() {
  return {
    dataDir: DATA_DIR,
    ephemeral: !process.env.LIFEOS_DATA_DIR && !!process.env.VERCEL,
  };
}
