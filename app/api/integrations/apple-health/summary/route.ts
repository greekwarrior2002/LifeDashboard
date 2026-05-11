import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getUser } from "@/lib/user-store";
import { readHealthSamples } from "@/lib/health-store";
import {
  computeReadiness,
  hrvBaseline,
  localDateKey,
} from "@/lib/integrations/apple-health";
import type { DayRollup } from "@/lib/types/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function lastNDates(n: number, timezone: string): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(localDateKey(d, timezone));
  }
  return out;
}

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const days = Math.min(120, Math.max(1, Number(url.searchParams.get("days") ?? 7)));

  const user = await getUser();
  const connected = !!user.integrations.apple_health;
  const samples = await readHealthSamples();
  const timezone = user.profile.timezone || "UTC";

  const dates = lastNDates(days, timezone);
  // Compute HRV baseline over a longer window (14 days) for readiness.
  const baselineDates = lastNDates(14, timezone);
  const baselineDays = baselineDates
    .map((d) => samples.days[d])
    .filter((d): d is DayRollup => !!d);
  const baseline = hrvBaseline(baselineDays);

  const series = dates.map((date) => {
    const day = samples.days[date];
    if (!day) return { date };
    const readiness = computeReadiness(day, {
      sleepTargetHours: user.health.sleepTargetHours,
      hrvBaselineMs: baseline,
    });
    return { ...day, date, readiness };
  });
  const allDays = Object.values(samples.days);
  const daysWithSleep = allDays.filter((day) => !!day.sleep).length;
  const latestSleepDate = allDays
    .filter((day) => !!day.sleep)
    .map((day) => day.date)
    .sort()
    .at(-1) ?? null;

  return NextResponse.json({
    connected,
    lastIngest: samples.lastIngest,
    timezone,
    sleepTargetHours: user.health.sleepTargetHours,
    hrvBaselineMs: baseline,
    diagnostics: {
      storedDays: allDays.length,
      daysWithSleep,
      latestSleepDate,
      seriesDaysWithSleep: series.filter((day) => "sleep" in day && !!day.sleep).length,
      rawMetricKeys: Array.from(
        new Set(allDays.flatMap((day) => Object.keys(day.raw ?? {}))),
      ).slice(0, 25),
    },
    series,
  });
}
