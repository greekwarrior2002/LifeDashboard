import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { findUserByApiKeyFingerprint, getUser } from "@/lib/user-store";
import { ingestRollups } from "@/lib/health-store";
import { parseHAEPayload, type HAEPayload } from "@/lib/integrations/apple-health";
import { verifyAppleHealthApiKey } from "@/lib/integrations/apple-health-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Health Auto Export's first sync can be ~1-2 MB. Cap higher than that, but
// not enough to be useful as a DoS vector.
const MAX_BODY_BYTES = 5 * 1024 * 1024;

function timingSafeMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/.exec(header.trim());
  if (!match) {
    return NextResponse.json({ error: "missing_bearer" }, { status: 401 });
  }
  const presented = match[1];
  const presentedFingerprint = createHash("sha256").update(presented).digest("hex");

  const found = await findUserByApiKeyFingerprint(presentedFingerprint);
  const secret = process.env.LIFEOS_AUTH_SECRET;
  const validStatelessKey = secret
    ? verifyAppleHealthApiKey(secret, presented)
    : false;
  if (
    !validStatelessKey &&
    (!found || found.provider !== "apple_health" || !found.record.apiKeyFingerprint)
  ) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }
  // Constant-time confirm against the stored fingerprint (defense in depth —
  // findUserByApiKeyFingerprint already matched, but the stored value is
  // canonical).
  if (
    !validStatelessKey &&
    found?.record.apiKeyFingerprint &&
    !timingSafeMatch(presentedFingerprint, found.record.apiKeyFingerprint)
  ) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let payload: HAEPayload;
  try {
    payload = JSON.parse(text) as HAEPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    (!payload.data && !payload.metrics && !payload.workouts)
  ) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const user = await getUser();
  const timezone = user.profile.timezone || "UTC";

  const result = parseHAEPayload(payload, timezone);
  if (result.samples === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_supported_samples",
        detail:
          "The request authenticated, but no supported Health Auto Export samples were found. Enable JSON export for sleep_analysis, heart_rate_variability, resting_heart_rate, step_count, active_energy, apple_exercise_time, and workouts.",
        metrics: result.metrics,
        samples: result.samples,
        days: result.days.length,
      },
      { status: 422 },
    );
  }
  await ingestRollups(result.days, {
    at: new Date().toISOString(),
    metrics: result.metrics,
    samples: result.samples,
  });

  return NextResponse.json({
    ok: true,
    metrics: result.metrics,
    samples: result.samples,
    days: result.days.length,
  });
}
