import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL, signSession } from "@/lib/auth";
import { requireSession } from "@/lib/api-auth";
import { completeOnboarding, toPublic } from "@/lib/user-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  const next = await completeOnboarding();
  const token = await signSession(auth.secret, { onboarded: true });

  const res = NextResponse.json({ ok: true, user: toPublic(next) });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
}
