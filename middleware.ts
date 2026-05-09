import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const secret = process.env.LIFEOS_AUTH_SECRET;

  // Misconfigured deployment — redirect to login so the user sees the warning.
  if (!secret || !process.env.LIFEOS_PASSWORD) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("config", "1");
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySession(secret, token);
  if (ok) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  if (req.nextUrl.pathname !== "/") {
    url.searchParams.set("next", req.nextUrl.pathname);
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|login|api/auth/).*)"],
};
