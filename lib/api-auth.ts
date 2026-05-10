import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth";

export type AuthResult =
  | { ok: true; session: SessionPayload; secret: string }
  | { ok: false; response: NextResponse };

export async function requireSession(req: NextRequest): Promise<AuthResult> {
  const secret = process.env.LIFEOS_AUTH_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: NextResponse.json({ error: "server_misconfigured" }, { status: 500 }),
    };
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(secret, token);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, session, secret };
}
