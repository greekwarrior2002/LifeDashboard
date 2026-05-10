import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { deleteService, updateService } from "@/lib/garage-store";
import type { GarageServiceInput } from "@/lib/types/garage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { serviceId: string } },
) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const body = (await req.json()) as GarageServiceInput;
    return NextResponse.json(await updateService(params.serviceId, body));
  } catch (err) {
    return NextResponse.json(
      { error: "service_write_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { serviceId: string } },
) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await deleteService(params.serviceId));
  } catch (err) {
    return NextResponse.json(
      { error: "service_delete_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
