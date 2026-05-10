import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { clearIntegrationCookie } from "@/lib/integration-cookies";
import { clearIntegration, toPublic } from "@/lib/user-store";
import { clearHealthSamples } from "@/lib/health-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const next = await clearIntegration("apple_health");
  await clearHealthSamples();
  const res = NextResponse.json({ ok: true, user: toPublic(next) });
  clearIntegrationCookie(res, "apple_health");
  return res;
}
