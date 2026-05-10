import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DEFAULT_USER_STATE,
  type IntegrationProvider,
  type IntegrationRecord,
  type PublicUserState,
  type UserState,
} from "@/lib/types/user";

function resolveDataDir(): string {
  const override = process.env.LIFEOS_DATA_DIR;
  if (override && override.length > 0) return override;
  // Vercel / serverless: only /tmp is writable. Note this is ephemeral —
  // configure a real persistent store (Vercel Blob, KV, or LIFEOS_DATA_DIR
  // pointing at a mounted volume) for durable state.
  if (process.env.VERCEL) return "/tmp/lifeos";
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const FILE_PATH = path.join(DATA_DIR, "user.json");

let writeChain: Promise<void> = Promise.resolve();

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

export async function getUser(): Promise<UserState> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return mergeWithDefaults(JSON.parse(raw));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return mergeWithDefaults(null);
    }
    throw err;
  }
}

async function writeUser(next: UserState): Promise<void> {
  await ensureDir();
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function chain<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeChain.then(fn, fn);
  writeChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function updateUser(
  patch: (current: UserState) => UserState,
): Promise<UserState> {
  return chain(async () => {
    const current = await getUser();
    const next = patch(current);
    await writeUser(next);
    return next;
  });
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
