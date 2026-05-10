import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { addCar, getGarage } from "@/lib/garage-store";
import type { GarageCarInput } from "@/lib/types/garage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await getGarage());
  } catch (err) {
    return NextResponse.json(
      { error: "garage_read_failed", detail: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const body = (await req.json()) as GarageCarInput;
    return NextResponse.json(await addCar(body));
  } catch (err) {
    return NextResponse.json(
      { error: "garage_write_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
