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

function getEnv(name: string): string | null {
  const v = process.env[name];
  return v && v.length > 0 ? v : null;
}

function defaultRedirect(provider: IntegrationProvider): string {
  const base = process.env.LIFEOS_PUBLIC_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/oauth/${provider}/callback`;
}

export function getProviderConfig(
  provider: IntegrationProvider,
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
      redirectUri:
        getEnv("GOOGLE_OAUTH_REDIRECT_URI") ?? defaultRedirect("google"),
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
      redirectUri:
        getEnv("TICKTICK_OAUTH_REDIRECT_URI") ?? defaultRedirect("ticktick"),
      scope: "tasks:read tasks:write",
    };
  }

  return null;
}
