import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { clearIntegration, toPublic } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const next = await clearIntegration("google");
  return NextResponse.json({ ok: true, user: toPublic(next) });
}
