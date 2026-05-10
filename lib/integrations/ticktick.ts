import { decryptJSON, encryptJSON } from "@/lib/crypto";
import { getProviderConfig } from "@/lib/integrations/oauth-config";
import { setIntegration, getUser } from "@/lib/user-store";
import type { IntegrationRecord } from "@/lib/types/user";

export type TickTickTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
};

type StoredTickTickTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope?: string;
};

export async function exchangeTickTickCode(
  code: string,
): Promise<StoredTickTickTokens> {
  const config = getProviderConfig("ticktick");
  if (!config) throw new Error("ticktick_not_configured");

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    scope: config.scope,
    redirect_uri: config.redirectUri,
  });
  const basic = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ticktick_token_exchange_failed: ${text}`);
  }
  const data = (await res.json()) as TickTickTokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    scope: data.scope,
  };
}

export async function persistTickTickTokens(
  secret: string,
  tokens: StoredTickTickTokens,
): Promise<void> {
  const record: IntegrationRecord = {
    encryptedTokens: encryptJSON(secret, tokens),
    scope: tokens.scope,
    connectedAt: new Date().toISOString(),
  };
  await setIntegration("ticktick", record);
}

async function getValidTokens(
  secret: string,
): Promise<StoredTickTickTokens | null> {
  const user = await getUser();
  const record = user.integrations.ticktick;
  if (!record) return null;
  try {
    return decryptJSON<StoredTickTickTokens>(secret, record.encryptedTokens);
  } catch {
    return null;
  }
}

export type TickTickTask = {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  dueDate?: string;
  priority?: number;
  status?: number;
  tags?: string[];
};

export async function listTickTickTasks(
  secret: string,
): Promise<TickTickTask[] | null> {
  const tokens = await getValidTokens(secret);
  if (!tokens) return null;

  const projectsRes = await fetch(
    "https://api.ticktick.com/open/v1/project",
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    },
  );
  if (!projectsRes.ok) {
    const text = await projectsRes.text();
    throw new Error(`ticktick_projects_failed: ${projectsRes.status} ${text}`);
  }
  const projects = (await projectsRes.json()) as Array<{
    id: string;
    name: string;
  }>;

  const tasks: TickTickTask[] = [];
  for (const project of projects) {
    const dataRes = await fetch(
      `https://api.ticktick.com/open/v1/project/${project.id}/data`,
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );
    if (!dataRes.ok) continue;
    const data = (await dataRes.json()) as {
      tasks?: Array<{
        id: string;
        title: string;
        projectId?: string;
        dueDate?: string;
        priority?: number;
        status?: number;
        tags?: string[];
      }>;
    };
    for (const t of data.tasks ?? []) {
      tasks.push({
        id: t.id,
        title: t.title,
        projectId: t.projectId,
        projectName: project.name,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
        tags: t.tags,
      });
    }
  }
  return tasks;
}
