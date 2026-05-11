import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getLifeData, updateLifeData, type LifeDataPatch } from "@/lib/life-data-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json(await getLifeData());
  } catch (err) {
    return NextResponse.json(
      { error: "read_failed", detail: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  let body: LifeDataPatch;
  try {
    body = (await req.json()) as LifeDataPatch;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    return NextResponse.json(await updateLifeData(body));
  } catch (err) {
    return NextResponse.json(
      { error: "write_failed", detail: (err as Error).message },
      { status: 500 },
    );
  }
}
