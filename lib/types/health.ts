// Apple Health rollups, populated by the Health Auto Export iOS app
// pushing to /api/integrations/apple-health/ingest.

export type SleepDay = {
  inBedHours: number;
  asleepHours: number;
  // Decimal hours in local time (e.g. 23.5 = 23:30). Wake can be < bed
  // when bed time is the previous evening — consumers use them as-is.
  bedTime: number;
  wakeTime: number;
  sources?: string[];
};

export type WorkoutSample = {
  type: string;
  start: string;
  end: string;
  durationMin: number;
  energyKcal?: number;
};

export type DayRollup = {
  date: string; // YYYY-MM-DD in user's local timezone
  sleep?: SleepDay;
  hrv?: { avgMs: number; samples: number };
  restingHeartRate?: number;
  steps?: number;
  activeEnergyKcal?: number;
  exerciseMinutes?: number;
  mindfulMinutes?: number;
  respiratoryRate?: number;
  workouts?: WorkoutSample[];
  // Anything we received but don't have a card for — preserved so we don't
  // throw user data away.
  raw?: Record<string, number>;
};

export type IngestSummary = {
  at: string;
  metrics: number;
  samples: number;
};

export type HealthSamples = {
  days: Record<string, DayRollup>;
  lastIngest: IngestSummary | null;
};

export const EMPTY_HEALTH_SAMPLES: HealthSamples = {
  days: {},
  lastIngest: null,
};

// Days kept in the rollups file. Anything older is trimmed on write.
export const ROLLUP_RETENTION_DAYS = 120;
