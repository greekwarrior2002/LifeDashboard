import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { encryptJSON } from "@/lib/crypto";
import { setIntegrationCookie } from "@/lib/integration-cookies";
import { issueAppleHealthApiKey } from "@/lib/integrations/apple-health-token";
import { setIntegration, toPublic } from "@/lib/user-store";
import type { IntegrationRecord } from "@/lib/types/user";

export const runtime = "nodejs";

function isLocalBase(value: string): boolean {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return true;
  }
}

function buildWebhookUrl(req: NextRequest): { url: string; warnings: string[] } {
  const explicit = process.env.LIFEOS_PUBLIC_URL;
  const requestOrigin = new URL(req.url).origin;
  const explicitBase = explicit?.replace(/\/$/, "");
  const requestBase = requestOrigin.replace(/\/$/, "");
  const base = explicitBase && !isLocalBase(explicitBase)
    ? explicitBase
    : requestBase;
  const warnings: string[] = [];

  if (explicitBase && isLocalBase(explicitBase) && !isLocalBase(requestBase)) {
    warnings.push(
      "LIFEOS_PUBLIC_URL is set to localhost, so the app used the deployed request URL instead. Update LIFEOS_PUBLIC_URL to your https deployment URL before reconnecting integrations.",
    );
  }
  if (isLocalBase(base)) {
    warnings.push(
      "This webhook points at localhost. Health Auto Export on your iPhone needs a publicly reachable https URL, such as your Vercel deployment URL.",
    );
  } else if (!base.startsWith("https://")) {
    warnings.push(
      "Health Auto Export may reject non-HTTPS webhook URLs. Use your https deployment URL for Apple Health sync.",
    );
  }

  return {
    url: `${base}/api/integrations/apple-health/ingest`,
    warnings,
  };
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
  const webhook = buildWebhookUrl(req);

  const res = NextResponse.json({
    apiKey,
    webhookUrl: webhook.url,
    fallbackUrl: `${webhook.url}?token=${encodeURIComponent(apiKey)}`,
    warnings: webhook.warnings,
    user: toPublic(next),
  });
  setIntegrationCookie(res, "apple_health", record);
  return res;
}
