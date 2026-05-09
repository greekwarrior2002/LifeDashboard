import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL, safeEqual, signSession } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const secret = process.env.LIFEOS_AUTH_SECRET;
  const expected = process.env.LIFEOS_PASSWORD;

  if (!secret || !expected) {
    return NextResponse.json(
      { error: "Server is missing LIFEOS_PASSWORD or LIFEOS_AUTH_SECRET." },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/") || "/";

  // Light throttle — ~750ms — to soften brute force.
  await new Promise((r) => setTimeout(r, 750));

  if (!safeEqual(password, expected)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "1");
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await signSession(secret);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const dest = new URL(safeNext, req.nextUrl.origin);
  const res = NextResponse.redirect(dest, { status: 303 });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
}
