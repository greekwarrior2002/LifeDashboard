import { decryptJSON, encryptJSON } from "@/lib/crypto";
import { getProviderConfig } from "@/lib/integrations/oauth-config";
import { setIntegration, getUser } from "@/lib/user-store";
import type { IntegrationRecord } from "@/lib/types/user";

export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
  id_token?: string;
};

type StoredGoogleTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
};

export async function exchangeGoogleCode(
  code: string,
  redirectBaseUrl?: string,
): Promise<StoredGoogleTokens> {
  const config = getProviderConfig("google", redirectBaseUrl);
  if (!config) throw new Error("google_not_configured");

  const body = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`google_token_exchange_failed: ${text}`);
  }
  const data = (await res.json()) as GoogleTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
}

async function refreshGoogleTokens(
  current: StoredGoogleTokens,
): Promise<StoredGoogleTokens> {
  const config = getProviderConfig("google");
  if (!config) throw new Error("google_not_configured");
  if (!current.refreshToken) throw new Error("google_no_refresh_token");

  const body = new URLSearchParams({
    refresh_token: current.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  });
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`google_refresh_failed: ${text}`);
  }
  const data = (await res.json()) as GoogleTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? current.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope ?? current.scope,
  };
}

async function getValidTokens(secret: string): Promise<StoredGoogleTokens | null> {
  const user = await getUser();
  const record = user.integrations.google;
  if (!record) return null;
  let tokens: StoredGoogleTokens;
  try {
    tokens = decryptJSON<StoredGoogleTokens>(secret, record.encryptedTokens);
  } catch {
    return null;
  }
  if (tokens.expiresAt - 30_000 > Date.now()) return tokens;
  const refreshed = await refreshGoogleTokens(tokens);
  await persistGoogleTokens(secret, refreshed, record.scope);
  return refreshed;
}

export async function persistGoogleTokens(
  secret: string,
  tokens: StoredGoogleTokens,
  scopeOverride?: string,
): Promise<void> {
  const record: IntegrationRecord = {
    encryptedTokens: encryptJSON(secret, tokens),
    scope: tokens.scope ?? scopeOverride,
    connectedAt: new Date().toISOString(),
  };
  await setIntegration("google", record);
}

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  htmlLink?: string;
  calendarId?: string;
  calendarName?: string;
};

type GoogleCalendarListResponse = {
  items?: Array<{
    id: string;
    summary?: string;
    accessRole?: string;
    selected?: boolean;
    hidden?: boolean;
  }>;
};

type GoogleEventsResponse = {
  items?: Array<{
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string; timeZone?: string };
    end?: { dateTime?: string; date?: string; timeZone?: string };
    location?: string;
    htmlLink?: string;
  }>;
};

function canReadCalendar(accessRole?: string): boolean {
  return ["owner", "writer", "reader", "freeBusyReader"].includes(
    accessRole ?? "",
  );
}

function toEventDate(value?: { dateTime?: string; date?: string }): string {
  if (value?.dateTime) return value.dateTime;
  if (value?.date) return `${value.date}T00:00:00`;
  return new Date().toISOString();
}

async function fetchGoogleJSON<T>(url: URL, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`google_api_failed: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function listGoogleEvents(
  secret: string,
  opts: { from: Date; to: Date },
): Promise<CalendarEvent[] | null> {
  const tokens = await getValidTokens(secret);
  if (!tokens) return null;

  const calendarListUrl = new URL(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
  );
  calendarListUrl.searchParams.set("minAccessRole", "reader");
  const calendarList = await fetchGoogleJSON<GoogleCalendarListResponse>(
    calendarListUrl,
    tokens.accessToken,
  );

  const calendars = (calendarList.items ?? [])
    .filter((calendar) => calendar.id && canReadCalendar(calendar.accessRole))
    .filter((calendar) => !calendar.hidden || calendar.selected);

  const fallbackCalendars = calendars.length
    ? calendars
    : [{ id: "primary", summary: "Primary" }];

  const eventsByCalendar = await Promise.all(
    fallbackCalendars.map(async (calendar) => {
      const url = new URL(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendar.id,
        )}/events`,
      );
      url.searchParams.set("singleEvents", "true");
      url.searchParams.set("orderBy", "startTime");
      url.searchParams.set("timeMin", opts.from.toISOString());
      url.searchParams.set("timeMax", opts.to.toISOString());
      url.searchParams.set("maxResults", "50");

      const data = await fetchGoogleJSON<GoogleEventsResponse>(
        url,
        tokens.accessToken,
      );
      return (data.items ?? []).map((e) => ({
        id: `${calendar.id}:${e.id}`,
        title: e.summary ?? "(no title)",
        start: toEventDate(e.start),
        end: toEventDate(e.end),
        location: e.location,
        htmlLink: e.htmlLink,
        calendarId: calendar.id,
        calendarName: calendar.summary ?? calendar.id,
      }));
    }),
  );

  return eventsByCalendar
    .flat()
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
