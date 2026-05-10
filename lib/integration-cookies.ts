import type { NextResponse } from "next/server";
import type { IntegrationProvider, IntegrationRecord } from "@/lib/types/user";

const INTEGRATION_COOKIE_PREFIX = "lifeos_integration_v1_";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const COOKIE_BYTE_BUDGET = 3800;

function integrationCookieName(provider: IntegrationProvider): string {
  return `${INTEGRATION_COOKIE_PREFIX}${provider}`;
}

function encodeCookieJSON(value: unknown): string | null {
  const encoded = Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return encoded.length <= COOKIE_BYTE_BUDGET ? encoded : null;
}

export function setIntegrationCookie(
  response: NextResponse,
  provider: IntegrationProvider,
  record: IntegrationRecord,
): void {
  const encoded = encodeCookieJSON(record);
  if (!encoded) return;
  response.cookies.set(integrationCookieName(provider), encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearIntegrationCookie(
  response: NextResponse,
  provider: IntegrationProvider,
): void {
  response.cookies.set(integrationCookieName(provider), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
