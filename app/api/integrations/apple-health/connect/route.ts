import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { encryptJSON } from "@/lib/crypto";
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

  // 32 random bytes → 43-char base64url. Always rotate on each /connect call.
  const apiKey = randomBytes(32).toString("base64url");
  const fingerprint = createHash("sha256").update(apiKey).digest("hex");

  const record: IntegrationRecord = {
    encryptedTokens: encryptJSON(auth.secret, { apiKey }),
    connectedAt: new Date().toISOString(),
    apiKeyFingerprint: fingerprint,
  };
  const next = await setIntegration("apple_health", record);

  return NextResponse.json({
    apiKey,
    webhookUrl: buildWebhookUrl(req),
    user: toPublic(next),
  });
}
