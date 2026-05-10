import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getUser, toPublic, updateUser } from "@/lib/user-store";
import type { UserState } from "@/lib/types/user";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  const user = await getUser();
  return NextResponse.json(toPublic(user));
}

type Patch = {
  profile?: Partial<UserState["profile"]>;
  goals?: Partial<UserState["goals"]>;
  visibleCards?: Partial<UserState["visibleCards"]>;
  health?: Partial<UserState["health"]>;
};

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  let body: Patch;
  try {
    body = (await req.json()) as Patch;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const next = await updateUser((cur) => ({
    ...cur,
    profile: { ...cur.profile, ...(body.profile ?? {}) },
    goals: { ...cur.goals, ...(body.goals ?? {}) },
    visibleCards: { ...cur.visibleCards, ...(body.visibleCards ?? {}) },
    health: { ...cur.health, ...(body.health ?? {}) },
  }));

  return NextResponse.json(toPublic(next));
}
