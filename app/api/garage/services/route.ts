import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { addService } from "@/lib/garage-store";
import type { GarageServiceInput } from "@/lib/types/garage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const body = (await req.json()) as GarageServiceInput;
    return NextResponse.json(await addService(body));
  } catch (err) {
    return NextResponse.json(
      { error: "service_write_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
