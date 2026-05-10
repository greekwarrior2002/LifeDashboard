import type { IntegrationProvider } from "@/lib/types/user";

export type OAuthProviderConfig = {
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  extraAuthParams?: Record<string, string>;
};

type OAuthRequestLike = {
  headers: { get(name: string): string | null };
  nextUrl?: { origin: string; protocol: string };
};

function getEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export function getOAuthRedirectBaseUrl(req: OAuthRequestLike): string {
  const host =
    firstHeaderValue(req.headers.get("x-forwarded-host")) ??
    firstHeaderValue(req.headers.get("host"));
  const proto =
    firstHeaderValue(req.headers.get("x-forwarded-proto")) ??
    req.nextUrl?.protocol.replace(/:$/, "") ??
    (host?.startsWith("localhost") ? "http" : "https");

  if (host) return `${proto}://${host}`;
  return req.nextUrl?.origin ?? getEnv("LIFEOS_PUBLIC_URL") ?? "http://localhost:3000";
}

function defaultRedirect(
  provider: IntegrationProvider,
  redirectBaseUrl?: string,
): string {
  const base = redirectBaseUrl ?? process.env.LIFEOS_PUBLIC_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/oauth/${provider}/callback`;
}

function redirectUri(
  provider: IntegrationProvider,
  envName: string,
  redirectBaseUrl?: string,
): string {
  const configured = getEnv(envName);
  if (!configured) return defaultRedirect(provider, redirectBaseUrl);

  try {
    const url = new URL(configured);
    if (url.pathname === "/" || url.pathname === "") {
      return `${url.origin}/api/oauth/${provider}/callback`;
    }
  } catch {
    // Fall through and use the configured value as-is; OAuth providers will
    // surface a precise redirect mismatch if it is malformed.
  }

  return configured;
}

export function getProviderConfig(
  provider: IntegrationProvider,
  redirectBaseUrl?: string,
): OAuthProviderConfig | null {
  if (provider === "google") {
    const clientId = getEnv("GOOGLE_OAUTH_CLIENT_ID");
    const clientSecret = getEnv("GOOGLE_OAUTH_CLIENT_SECRET");
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      clientId,
      clientSecret,
      redirectUri: redirectUri(
        "google",
        "GOOGLE_OAUTH_REDIRECT_URI",
        redirectBaseUrl,
      ),
      scope:
        "openid email https://www.googleapis.com/auth/calendar.readonly",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
      },
    };
  }

  if (provider === "ticktick") {
    const clientId = getEnv("TICKTICK_OAUTH_CLIENT_ID");
    const clientSecret = getEnv("TICKTICK_OAUTH_CLIENT_SECRET");
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://ticktick.com/oauth/authorize",
      tokenUrl: "https://ticktick.com/oauth/token",
      clientId,
      clientSecret,
      redirectUri: redirectUri(
        "ticktick",
        "TICKTICK_OAUTH_REDIRECT_URI",
        redirectBaseUrl,
      ),
      scope: "tasks:read tasks:write",
    };
  }

  return null;
}
