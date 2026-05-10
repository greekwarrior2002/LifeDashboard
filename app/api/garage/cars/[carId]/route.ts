import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { deleteCar, updateCar } from "@/lib/garage-store";
import type { GarageCarInput } from "@/lib/types/garage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { carId: string } },
) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const body = (await req.json()) as GarageCarInput;
    return NextResponse.json(await updateCar(params.carId, body));
  } catch (err) {
    return NextResponse.json(
      { error: "garage_write_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { carId: string } },
) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await deleteCar(params.carId));
  } catch (err) {
    return NextResponse.json(
      { error: "garage_delete_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
