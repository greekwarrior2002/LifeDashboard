import { promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import {
  cloneDefaultLifeData,
  type FinanceData,
  type LifeData,
  type ResearchProject,
  type TimelineMilestone,
} from "@/lib/life-data-shared";

function resolveDataDir(): string {
  const override = process.env.LIFEOS_DATA_DIR;
  if (override && override.length > 0) return override;
  if (process.env.VERCEL) return "/tmp/lifeos";
  return path.join(process.cwd(), "data");
}

const FILE_PATH = path.join(resolveDataDir(), "life-data.json");
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const COOKIE_BYTE_BUDGET = 3800;
const LIFE_DATA_COOKIES = {
  researchProjects: "lifeos_life_data_research_v1",
  finance: "lifeos_life_data_finance_v1",
  timeline: "lifeos_life_data_timeline_v1",
} as const;

function mergeLifeData(partial: Partial<LifeData> | null): LifeData {
  const defaults = cloneDefaultLifeData();
  if (!partial) return defaults;
  return {
    ...defaults,
    ...partial,
    researchProjects: partial.researchProjects ?? defaults.researchProjects,
    finance: {
      ...defaults.finance,
      ...(partial.finance ?? {}),
      savings: {
        ...defaults.finance.savings,
        ...(partial.finance?.savings ?? {}),
      },
    },
    timeline: partial.timeline ?? defaults.timeline,
  };
}

async function readFileState(): Promise<Partial<LifeData> | null> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as Partial<LifeData>;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
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

function readCookieState(): Partial<LifeData> {
  const jar = cookies();
  return {
    researchProjects: decodeCookieJSON<LifeData["researchProjects"]>(
      jar.get(LIFE_DATA_COOKIES.researchProjects)?.value,
    ) ?? undefined,
    finance: decodeCookieJSON<LifeData["finance"]>(
      jar.get(LIFE_DATA_COOKIES.finance)?.value,
    ) ?? undefined,
    timeline: decodeCookieJSON<LifeData["timeline"]>(
      jar.get(LIFE_DATA_COOKIES.timeline)?.value,
    ) ?? undefined,
  };
}

function writeLifeDataCookies(data: LifeData): void {
  try {
    const jar = cookies();
    const sections = {
      [LIFE_DATA_COOKIES.researchProjects]: data.researchProjects,
      [LIFE_DATA_COOKIES.finance]: data.finance,
      [LIFE_DATA_COOKIES.timeline]: data.timeline,
    };
    for (const [name, value] of Object.entries(sections)) {
      const encoded = encodeCookieJSON(value);
      if (!encoded) continue;
      jar.set(name, encoded, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
  } catch {
    // Route handlers can set cookies; plain server component reads cannot.
  }
}

export async function getLifeData(): Promise<LifeData> {
  const fromFile = await readFileState();
  const fromCookie = readCookieState();
  return mergeLifeData({ ...(fromFile ?? {}), ...fromCookie });
}

export type LifeDataPatch = {
  researchProjects?: ResearchProject[];
  finance?: Partial<FinanceData>;
  timeline?: TimelineMilestone[];
};

export async function updateLifeData(patch: LifeDataPatch): Promise<LifeData> {
  const current = await getLifeData();
  const next = mergeLifeData({
    ...current,
    ...patch,
    finance: patch.finance ? { ...current.finance, ...patch.finance } : current.finance,
    updatedAt: new Date().toISOString(),
  });
  try {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
    await fs.rename(tmp, FILE_PATH);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[life-data-store] file write failed:", (err as Error).message);
    }
  }
  writeLifeDataCookies(next);
  return next;
}
