// Health Auto Export (https://www.healthyapps.dev/) payload parser.
// HAE pushes JSON in this shape from the iOS app:
// { data: { metrics: [{ name, units, data: [{...}] }, ...], workouts: [...] } }

import type { DayRollup, SleepDay, WorkoutSample } from "@/lib/types/health";

export type HAEMetricSample = {
  [key: string]: unknown;
  date?: string;
  startDate?: string;
  endDate?: string;
  // Sleep samples
  sleepStart?: string;
  sleepEnd?: string;
  inBedStart?: string;
  inBedEnd?: string;
  inBed?: number;
  asleep?: number;
  totalSleep?: number;
  value?: string;
  source?: string;
  // Most numeric metrics
  qty?: number;
  // Some HAE metrics use min/max/avg fields
  Avg?: number;
  Min?: number;
  Max?: number;
};

export type HAEMetric = {
  name: string;
  units?: string;
  data: HAEMetricSample[];
};

export type HAEWorkout = {
  name?: string;
  start?: string;
  end?: string;
  duration?: number; // seconds
  totalEnergyBurned?: number;
};

export type HAEPayload = {
  data?: {
    metrics?: HAEMetric[];
    workouts?: HAEWorkout[];
  };
  metrics?: HAEMetric[];
  workouts?: HAEWorkout[];
};

// --- Date parsing -----------------------------------------------------------

// HAE timestamps look like "2024-05-09 23:00:00 -0400". Parse to Date.
function parseHAEDate(input: string | undefined): Date | null {
  if (!input) return null;
  // Replace the space between date and time with 'T' and convert the offset
  // "-0400" -> "-04:00" so it parses as ISO-8601.
  const iso = input
    .replace(" ", "T")
    .replace(/ (-?\d{2})(\d{2})$/, "$1:$2")
    .replace(/ ([+-]\d{2}:\d{2})$/, "$1");
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function stringField(s: HAEMetricSample, names: string[]): string | undefined {
  for (const name of names) {
    const value = s[name];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return undefined;
}

function sampleDate(s: HAEMetricSample): Date | null {
  return parseHAEDate(
    s.date ??
      s.startDate ??
      s.endDate ??
      stringField(s, ["Date", "date", "Start", "End"]),
  );
}

// YYYY-MM-DD in the given IANA timezone for an absolute Date.
export function localDateKey(d: Date, timezone: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return fmt.format(d); // en-CA gives YYYY-MM-DD
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// Decimal-hour clock time for a date in the given timezone.
function localClockHours(d: Date, timezone: string): number {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(d);
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    return h + m / 60;
  } catch {
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  }
}

// --- Per-day accumulator ---------------------------------------------------

type SleepSummary = {
  asleepHours?: number;
  inBedHours?: number;
  bedTime?: number;
  wakeTime?: number;
  sources: string[];
};

type Bucket = {
  date: string;
  sleepBlocks: SleepDay[];
  sleepSummary: SleepSummary;
  hrvSum: number;
  hrvCount: number;
  rhr?: number;
  steps?: number;
  activeEnergy?: number;
  exerciseMin?: number;
  mindfulMin?: number;
  respRate?: number;
  workouts: WorkoutSample[];
  raw: Record<string, number>;
};

function bucket(byDate: Map<string, Bucket>, key: string): Bucket {
  let b = byDate.get(key);
  if (!b) {
    b = {
      date: key,
      sleepBlocks: [],
      sleepSummary: { sources: [] },
      hrvSum: 0,
      hrvCount: 0,
      workouts: [],
      raw: {},
    };
    byDate.set(key, b);
  }
  return b;
}

function sampleValue(s: HAEMetricSample): number | null {
  if (typeof s.qty === "number") return s.qty;
  if (typeof s.Avg === "number") return s.Avg;
  if (typeof s.totalSleep === "number") return s.totalSleep;
  return null;
}

function numericField(s: HAEMetricSample, names: string[]): number | null {
  for (const name of names) {
    const value = s[name];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function normaliseMetricName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normaliseColumnName(name: string): string {
  return name.trim().toLowerCase().replace(/[\[\]()]/g, "").replace(/[\s-]+/g, "_");
}

function isSleepMetric(name: string): boolean {
  const normalised = normaliseMetricName(name);
  return normalised === "sleep_analysis" || normalised === "sleep";
}

type SleepSummaryKind = "total" | "inBed" | "stage" | "asleep" | "awake";

function sleepSummaryKind(name: string): SleepSummaryKind | null {
  const normalised = normaliseColumnName(name);
  if (!normalised.startsWith("sleep_analysis_")) return null;
  if (normalised.includes("total_hr")) return "total";
  if (normalised.includes("in_bed_hr")) return "inBed";
  if (
    normalised.includes("core_hr") ||
    normalised.includes("deep_hr") ||
    normalised.includes("rem_hr")
  ) {
    return "stage";
  }
  if (normalised.includes("asleep_hr")) return "asleep";
  if (normalised.includes("awake_hr")) return "awake";
  return null;
}

function isAsleepState(value: string | undefined): boolean {
  if (!value) return true;
  const normalised = value.trim().toLowerCase();
  return ["asleep", "core", "rem", "deep", "unspecified"].includes(normalised);
}

function isInBedState(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "in bed";
}

function totalSleepDurationHours(s: HAEMetricSample): number | null {
  const total = numericField(s, [
    "totalSleep",
    "Sleep Analysis [Total] (hr)",
    "Sleep Analysis Total (hr)",
  ]);
  if (total !== null) return total > 0 ? total : null;

  const stageValues = [
    numericField(s, ["Sleep Analysis [Core] (hr)", "Sleep Analysis Core (hr)"]),
    numericField(s, ["Sleep Analysis [Deep] (hr)", "Sleep Analysis Deep (hr)"]),
    numericField(s, ["Sleep Analysis [REM] (hr)", "Sleep Analysis REM (hr)"]),
  ];
  if (stageValues.every((v): v is number => v !== null)) {
    const stageTotal = stageValues.reduce((sum, value) => sum + value, 0);
    return stageTotal > 0 ? stageTotal : null;
  }

  return null;
}

function sleepDurationHours(s: HAEMetricSample, start: Date | null, end: Date | null): number | null {
  const total = totalSleepDurationHours(s);
  if (total !== null) return total;

  // Apple Health Auto Export's Asleep column is often 0 for every row, so do
  // not use either the CSV column or its JSON alias as an asleep duration.
  if (typeof s.qty === "number" && s.qty > 0 && isAsleepState(s.value)) return s.qty;
  if (start && end && isAsleepState(s.value)) {
    const duration = (end.getTime() - start.getTime()) / 3_600_000;
    return duration > 0 ? duration : null;
  }
  return null;
}

function inBedDurationHours(
  s: HAEMetricSample,
  asleepHours: number,
  start: Date | null,
  end: Date | null,
): number {
  const inBed = numericField(s, [
    "inBed",
    "Sleep Analysis [In Bed] (hr)",
    "Sleep Analysis In Bed (hr)",
  ]);
  if (inBed !== null) return inBed;
  if (typeof s.qty === "number" && isInBedState(s.value)) return s.qty;
  if (start && end && isInBedState(s.value)) {
    return (end.getTime() - start.getTime()) / 3_600_000;
  }
  return asleepHours;
}

function handleSleepMetric(
  metric: HAEMetric,
  timezone: string,
  byDate: Map<string, Bucket>,
): { handled: boolean; samples: number } {
  let samples = 0;
  for (const s of metric.data ?? []) {
    const segmentStart = parseHAEDate(s.startDate) ?? parseHAEDate(s.date);
    const segmentEnd = parseHAEDate(s.endDate);
    const sleepStart = parseHAEDate(s.sleepStart) ?? parseHAEDate(s.inBedStart) ?? segmentStart;
    const sleepEnd = parseHAEDate(s.sleepEnd) ?? parseHAEDate(s.inBedEnd) ?? segmentEnd;
    const dateForBucket = sleepEnd ?? segmentEnd ?? segmentStart ?? sampleDate(s);
    if (!dateForBucket) continue;

    const asleep = sleepDurationHours(s, segmentStart, segmentEnd);
    if (asleep === null || asleep <= 0) continue;

    const inBed = inBedDurationHours(s, asleep, segmentStart, segmentEnd);
    const b = bucket(byDate, localDateKey(dateForBucket, timezone));
    b.sleepBlocks.push({
      inBedHours: Math.max(inBed, asleep),
      asleepHours: asleep,
      bedTime: localClockHours(sleepStart ?? segmentStart ?? dateForBucket, timezone),
      wakeTime: localClockHours(sleepEnd ?? segmentEnd ?? dateForBucket, timezone),
      sources: s.source ? [s.source] : undefined,
    });
    samples++;
  }
  return { handled: true, samples };
}

function handleSleepSummaryMetric(
  metric: HAEMetric,
  kind: SleepSummaryKind,
  timezone: string,
  byDate: Map<string, Bucket>,
): { handled: boolean; samples: number } {
  if (kind === "asleep" || kind === "awake") return { handled: true, samples: 0 };

  let samples = 0;
  for (const s of metric.data ?? []) {
    const value = sampleValue(s);
    const d = sampleDate(s);
    if (value === null || value <= 0 || !d) continue;

    const summary = bucket(byDate, localDateKey(d, timezone)).sleepSummary;
    if (kind === "total") summary.asleepHours = value;
    if (kind === "stage") summary.asleepHours = (summary.asleepHours ?? 0) + value;
    if (kind === "inBed") summary.inBedHours = value;

    const start = parseHAEDate(s.sleepStart) ?? parseHAEDate(s.inBedStart) ?? parseHAEDate(s.startDate);
    const end = parseHAEDate(s.sleepEnd) ?? parseHAEDate(s.inBedEnd) ?? parseHAEDate(s.endDate);
    if (start) summary.bedTime = localClockHours(start, timezone);
    if (end) summary.wakeTime = localClockHours(end, timezone);
    if (s.source) summary.sources.push(s.source);
    samples++;
  }

  return { handled: true, samples };
}

// Map HAE metric name -> handler that updates the bucket for that day.
function handleMetric(
  metric: HAEMetric,
  timezone: string,
  byDate: Map<string, Bucket>,
): { handled: boolean; samples: number } {
  if (isSleepMetric(metric.name)) {
    return handleSleepMetric(metric, timezone, byDate);
  }

  const summaryKind = sleepSummaryKind(metric.name);
  if (summaryKind) {
    return handleSleepSummaryMetric(metric, summaryKind, timezone, byDate);
  }

  let samples = 0;
  switch (normaliseMetricName(metric.name)) {
    case "heart_rate_variability": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.hrvSum += v;
        b.hrvCount++;
        samples++;
      }
      return { handled: true, samples };
    }
    case "resting_heart_rate": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.rhr = v;
        samples++;
      }
      return { handled: true, samples };
    }
    case "respiratory_rate": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.respRate = v;
        samples++;
      }
      return { handled: true, samples };
    }
    case "step_count": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.steps = (b.steps ?? 0) + v;
        samples++;
      }
      return { handled: true, samples };
    }
    case "active_energy": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.activeEnergy = (b.activeEnergy ?? 0) + v;
        samples++;
      }
      return { handled: true, samples };
    }
    case "apple_exercise_time": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.exerciseMin = (b.exerciseMin ?? 0) + v;
        samples++;
      }
      return { handled: true, samples };
    }
    case "mindful_minutes":
    case "mindful_session": {
      for (const s of metric.data) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.mindfulMin = (b.mindfulMin ?? 0) + v;
        samples++;
      }
      return { handled: true, samples };
    }
    default:
      return { handled: false, samples: 0 };
  }
}

function reduceSleepBlocks(blocks: SleepDay[], summary: SleepSummary): SleepDay | undefined {
  const validBlocks = blocks.filter((block) => block.asleepHours > 0);
  if (validBlocks.length > 0) {
    // Pick the longest asleep block as the "main" sleep, sum durations across all.
    const main = validBlocks.reduce((a, b) => (b.asleepHours > a.asleepHours ? b : a));
    const inBedHours = validBlocks.reduce((sum, b) => sum + b.inBedHours, 0);
    const asleepHours = validBlocks.reduce((sum, b) => sum + b.asleepHours, 0);
    const sources = Array.from(
      new Set(validBlocks.flatMap((b) => b.sources ?? [])),
    );
    return {
      inBedHours,
      asleepHours,
      bedTime: main.bedTime,
      wakeTime: main.wakeTime,
      sources: sources.length ? sources : undefined,
    };
  }

  if (!summary.asleepHours || summary.asleepHours <= 0) return undefined;
  const inBedHours = Math.max(summary.inBedHours ?? summary.asleepHours, summary.asleepHours);
  return {
    inBedHours,
    asleepHours: summary.asleepHours,
    bedTime: summary.bedTime ?? 0,
    wakeTime: summary.wakeTime ?? 0,
    sources: summary.sources.length ? Array.from(new Set(summary.sources)) : undefined,
  };
}

export type ParseResult = {
  days: DayRollup[];
  metrics: number; // distinct metric kinds we processed
  samples: number; // total individual samples ingested
};

export function parseHAEPayload(
  payload: HAEPayload,
  timezone: string,
): ParseResult {
  const byDate = new Map<string, Bucket>();
  const metrics = payload.data?.metrics ?? payload.metrics ?? [];
  let totalSamples = 0;
  let metricCount = 0;

  for (const m of metrics) {
    const { handled, samples } = handleMetric(m, timezone, byDate);
    if (handled) {
      if (samples > 0) metricCount++;
      totalSamples += samples;
    } else {
      // Stash unknown metrics in `raw` keyed by metric name (sum of qty per day).
      for (const s of m.data ?? []) {
        const v = sampleValue(s);
        const d = sampleDate(s);
        if (v === null || !d) continue;
        const b = bucket(byDate, localDateKey(d, timezone));
        b.raw[m.name] = (b.raw[m.name] ?? 0) + v;
        totalSamples++;
      }
      if ((m.data ?? []).length > 0) metricCount++;
    }
  }

  const workouts = payload.data?.workouts ?? payload.workouts ?? [];
  for (const w of workouts) {
    const start = parseHAEDate(w.start);
    const end = parseHAEDate(w.end);
    if (!start || !end) continue;
    const key = localDateKey(start, timezone);
    const b = bucket(byDate, key);
    const durationSec = w.duration ?? (end.getTime() - start.getTime()) / 1000;
    b.workouts.push({
      type: w.name ?? "Workout",
      start: start.toISOString(),
      end: end.toISOString(),
      durationMin: Math.round(durationSec / 60),
      energyKcal: w.totalEnergyBurned,
    });
    totalSamples++;
  }
  if (workouts.length > 0) metricCount++;

  const days: DayRollup[] = [];
  for (const b of byDate.values()) {
    days.push({
      date: b.date,
      sleep: reduceSleepBlocks(b.sleepBlocks, b.sleepSummary),
      hrv: b.hrvCount > 0
        ? { avgMs: Math.round(b.hrvSum / b.hrvCount), samples: b.hrvCount }
        : undefined,
      restingHeartRate: b.rhr,
      steps: b.steps !== undefined ? Math.round(b.steps) : undefined,
      activeEnergyKcal: b.activeEnergy !== undefined ? Math.round(b.activeEnergy) : undefined,
      exerciseMinutes: b.exerciseMin !== undefined ? Math.round(b.exerciseMin) : undefined,
      mindfulMinutes: b.mindfulMin !== undefined ? Math.round(b.mindfulMin) : undefined,
      respiratoryRate: b.respRate,
      workouts: b.workouts.length ? b.workouts : undefined,
      raw: Object.keys(b.raw).length ? b.raw : undefined,
    });
  }

  return { days, metrics: metricCount, samples: totalSamples };
}

// --- Derived readiness score ----------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function computeReadiness(
  day: DayRollup,
  context: { sleepTargetHours: number; hrvBaselineMs: number | null },
): number | null {
  const sleepHours = day.sleep?.asleepHours;
  const hrv = day.hrv?.avgMs;
  if (sleepHours === undefined && hrv === undefined) return null;

  const sleepScore =
    sleepHours !== undefined
      ? clamp((sleepHours / context.sleepTargetHours) * 100, 0, 100)
      : null;
  const hrvScore =
    hrv !== undefined && context.hrvBaselineMs && context.hrvBaselineMs > 0
      ? clamp((hrv / context.hrvBaselineMs) * 100, 0, 100)
      : null;

  if (sleepScore !== null && hrvScore !== null) {
    return Math.round(0.5 * sleepScore + 0.5 * hrvScore);
  }
  return Math.round(sleepScore ?? hrvScore ?? 0);
}

export function hrvBaseline(days: DayRollup[]): number | null {
  const samples: number[] = [];
  for (const d of days) {
    if (d.hrv?.avgMs) samples.push(d.hrv.avgMs);
  }
  if (samples.length === 0) return null;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}
