import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { encryptJSON } from "@/lib/crypto";
import { setIntegrationCookie } from "@/lib/integration-cookies";
import { issueAppleHealthApiKey } from "@/lib/integrations/apple-health-token";
import { setIntegration, toPublic } from "@/lib/user-store";
import type { IntegrationRecord } from "@/lib/types/user";

export const runtime = "nodejs";

function buildWebhookUrl(req: NextRequest): string {
  const explicit = process.env.LIFEOS_PUBLIC_URL;
  const base = explicit && explicit.length > 0
    ? explicit.replace(/\/$/, "")
    : new URL(req.url).origin;
  return `${base}/api/integrations/apple-health/ingest`;
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  // Stateless signed key: Health Auto Export will not send browser cookies, so
  // the ingest route must verify this key with LIFEOS_AUTH_SECRET directly.
  const apiKey = issueAppleHealthApiKey(auth.secret);
  const fingerprint = createHash("sha256").update(apiKey).digest("hex");

  const record: IntegrationRecord = {
    encryptedTokens: encryptJSON(auth.secret, { apiKey }),
    connectedAt: new Date().toISOString(),
    apiKeyFingerprint: fingerprint,
  };
  const next = await setIntegration("apple_health", record);

  const res = NextResponse.json({
    apiKey,
    webhookUrl: buildWebhookUrl(req),
    user: toPublic(next),
  });
  setIntegrationCookie(res, "apple_health", record);
  return res;
}
