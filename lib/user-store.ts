import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import {
  DEFAULT_USER_STATE,
  type IntegrationProvider,
  type IntegrationRecord,
  type PublicUserState,
  type UserGoals,
  type UserHealth,
  type UserProfile,
  type UserState,
  type VisibleCards,
} from "@/lib/types/user";

function resolveDataDir(): string {
  const override = process.env.LIFEOS_DATA_DIR;
  if (override && override.length > 0) return override;
  // Vercel / serverless: only /tmp is writable. Note this is ephemeral -
  // configure a real persistent store (Vercel Blob, KV, or LIFEOS_DATA_DIR
  // pointing at a mounted volume) for durable state.
  if (process.env.VERCEL) return "/tmp/lifeos";
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const FILE_PATH = path.join(DATA_DIR, "user.json");

// Cookie-backed copy of the per-user state. Survives Vercel /tmp eviction
// (which would otherwise drop the onboarding profile between requests).
const STATE_COOKIE = "lifeos_state_v1";
const INTEGRATION_COOKIE_PREFIX = "lifeos_integration_v1_";
const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  "google",
  "ticktick",
  "apple_health",
];
const STATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const COOKIE_BYTE_BUDGET = 3800;

type CookieState = {
  onboardingCompletedAt: string | null;
  profile: UserProfile;
  goals: UserGoals;
  visibleCards: VisibleCards;
  health: UserHealth;
};

function toCookieState(state: UserState): CookieState {
  return {
    onboardingCompletedAt: state.onboardingCompletedAt,
    profile: state.profile,
    goals: state.goals,
    visibleCards: state.visibleCards,
    health: state.health,
  };
}

function encodeCookieJSON(value: unknown): string | null {
  const encoded = Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  return encoded.length <= COOKIE_BYTE_BUDGET ? encoded : null;
}

function decodeCookieJSON<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object") return parsed as T;
    return null;
  } catch {
    return null;
  }
}

function readCookieState(): Partial<CookieState> | null {
  return decodeCookieJSON<Partial<CookieState>>(cookies().get(STATE_COOKIE)?.value);
}

function writeCookieValue(name: string, value: string): void {
  cookies().set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STATE_COOKIE_MAX_AGE,
  });
}

function clearCookieValue(name: string): void {
  cookies().set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function writeCookieState(state: UserState): void {
  try {
    const encoded = encodeCookieJSON(toCookieState(state));
    if (!encoded) return;
    writeCookieValue(STATE_COOKIE, encoded);
  } catch {
    // cookies().set throws outside route handlers / server actions - that's
    // fine, every write path here runs inside one.
  }
}

function integrationCookieName(provider: IntegrationProvider): string {
  return `${INTEGRATION_COOKIE_PREFIX}${provider}`;
}

function readIntegrationCookies(): Partial<Record<IntegrationProvider, IntegrationRecord>> {
  const jar = cookies();
  const integrations: Partial<Record<IntegrationProvider, IntegrationRecord>> = {};
  for (const provider of INTEGRATION_PROVIDERS) {
    const record = decodeCookieJSON<IntegrationRecord>(
      jar.get(integrationCookieName(provider))?.value,
    );
    if (record?.encryptedTokens && record.connectedAt) {
      integrations[provider] = record;
    }
  }
  return integrations;
}

function writeIntegrationCookies(state: UserState): void {
  try {
    for (const provider of INTEGRATION_PROVIDERS) {
      const record = state.integrations[provider];
      const name = integrationCookieName(provider);
      if (!record) {
        clearCookieValue(name);
        continue;
      }

      const encoded = encodeCookieJSON(record);
      if (encoded) writeCookieValue(name, encoded);
    }
  } catch {
    // Best effort: the file write remains the source of truth whenever the
    // runtime has durable storage.
  }
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function mergeWithDefaults(partial: Partial<UserState> | null): UserState {
  if (!partial) return structuredClone(DEFAULT_USER_STATE);
  return {
    ...DEFAULT_USER_STATE,
    ...partial,
    profile: { ...DEFAULT_USER_STATE.profile, ...(partial.profile ?? {}) },
    goals: { ...DEFAULT_USER_STATE.goals, ...(partial.goals ?? {}) },
    visibleCards: {
      ...DEFAULT_USER_STATE.visibleCards,
      ...(partial.visibleCards ?? {}),
    },
    health: { ...DEFAULT_USER_STATE.health, ...(partial.health ?? {}) },
    integrations: { ...(partial.integrations ?? {}) },
  };
}

async function readFileState(): Promise<Partial<UserState> | null> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as Partial<UserState>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function getUser(): Promise<UserState> {
  // The cookies carry profile/goals/visibleCards/health plus per-provider
  // encrypted integration records so Vercel lambda instance changes do not
  // make a successful OAuth connection look disconnected.
  const fromFile = await readFileState();
  const fromCookie = readCookieState();
  const fromIntegrationCookies = readIntegrationCookies();
  const merged: Partial<UserState> = {
    ...(fromFile ?? {}),
    ...(fromCookie ?? {}),
    integrations: {
      ...(fromFile?.integrations ?? {}),
      ...fromIntegrationCookies,
    },
  };
  return mergeWithDefaults(merged);
}

async function writeUser(next: UserState): Promise<void> {
  // Best-effort file write: works in dev and with LIFEOS_DATA_DIR, may
  // disappear between requests on Vercel /tmp - cookies cover single-user
  // state and integrations for the deployed dashboard.
  try {
    await ensureDir();
    const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, FILE_PATH);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[user-store] file write failed:", (err as Error).message);
    }
  }
  writeCookieState(next);
  writeIntegrationCookies(next);
}

export async function updateUser(
  patch: (current: UserState) => UserState,
): Promise<UserState> {
  // Run inline - chained continuations would break the per-request
  // AsyncLocalStorage context that cookies() relies on.
  const current = await getUser();
  const next = patch(current);
  await writeUser(next);
  return next;
}

export async function setIntegration(
  provider: IntegrationProvider,
  record: IntegrationRecord,
): Promise<UserState> {
  return updateUser((cur) => ({
    ...cur,
    integrations: { ...cur.integrations, [provider]: record },
  }));
}

export async function clearIntegration(
  provider: IntegrationProvider,
): Promise<UserState> {
  return updateUser((cur) => {
    const next = { ...cur.integrations };
    delete next[provider];
    return { ...cur, integrations: next };
  });
}

export async function completeOnboarding(): Promise<UserState> {
  return updateUser((cur) => ({
    ...cur,
    onboardingCompletedAt: new Date().toISOString(),
  }));
}

export function toPublic(state: UserState): PublicUserState {
  return {
    onboardingCompletedAt: state.onboardingCompletedAt,
    profile: state.profile,
    goals: state.goals,
    visibleCards: state.visibleCards,
    health: state.health,
    integrations: {
      google: {
        connected: !!state.integrations.google,
        connectedAt: state.integrations.google?.connectedAt ?? null,
      },
      ticktick: {
        connected: !!state.integrations.ticktick,
        connectedAt: state.integrations.ticktick?.connectedAt ?? null,
      },
      apple_health: {
        connected: !!state.integrations.apple_health,
        connectedAt: state.integrations.apple_health?.connectedAt ?? null,
      },
    },
  };
}

export async function findUserByApiKeyFingerprint(
  fingerprint: string,
): Promise<{ provider: IntegrationProvider; record: IntegrationRecord } | null> {
  const user = await getUser();
  for (const [provider, record] of Object.entries(user.integrations)) {
    if (record?.apiKeyFingerprint === fingerprint) {
      return {
        provider: provider as IntegrationProvider,
        record,
      };
    }
  }
  return null;
}

export function getDataDirInfo() {
  return { dataDir: DATA_DIR, ephemeral: !process.env.LIFEOS_DATA_DIR && !!process.env.VERCEL };
}
