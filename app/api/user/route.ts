import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getUser, toPublic, updateUser } from "@/lib/user-store";
import type { UserState } from "@/lib/types/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const user = await getUser();
    return NextResponse.json(toPublic(user));
  } catch (err) {
    return NextResponse.json(
      { error: "read_failed", detail: (err as Error).message },
      { status: 500 },
    );
  }
}

type Patch = {
  profile?: Partial<UserState["profile"]>;
  goals?: Partial<UserState["goals"]>;
  visibleCards?: Partial<UserState["visibleCards"]>;
  health?: Partial<UserState["health"]>;
  calendar?: Partial<UserState["calendar"]>;
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

  try {
    const next = await updateUser((cur) => ({
      ...cur,
      profile: { ...cur.profile, ...(body.profile ?? {}) },
      goals: { ...cur.goals, ...(body.goals ?? {}) },
      visibleCards: { ...cur.visibleCards, ...(body.visibleCards ?? {}) },
      health: { ...cur.health, ...(body.health ?? {}) },
      calendar: { ...cur.calendar, ...(body.calendar ?? {}) },
    }));
    return NextResponse.json(toPublic(next));
  } catch (err) {
    const detail = (err as Error).message;
    console.error("[/api/user] write failed:", detail);
    return NextResponse.json(
      { error: "write_failed", detail },
      { status: 500 },
    );
  }
}
