import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getProviderConfig } from "@/lib/integrations/oauth-config";
import {
  OAUTH_STATE_COOKIE_PREFIX,
  createStateToken,
} from "@/lib/integrations/oauth-state";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  const config = getProviderConfig("google");
  if (!config) {
    return NextResponse.json(
      { error: "google_oauth_not_configured" },
      { status: 501 },
    );
  }

  const state = createStateToken(auth.secret);
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("state", state);
  for (const [k, v] of Object.entries(config.extraAuthParams ?? {})) {
    url.searchParams.set(k, v);
  }

  const res = NextResponse.redirect(url, { status: 303 });
  res.cookies.set(`${OAUTH_STATE_COOKIE_PREFIX}google`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
