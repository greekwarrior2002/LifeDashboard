import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { addReminder } from "@/lib/garage-store";
import type { GarageReminderInput } from "@/lib/types/garage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;
  try {
    const body = (await req.json()) as GarageReminderInput;
    return NextResponse.json(await addReminder(body));
  } catch (err) {
    return NextResponse.json(
      { error: "reminder_write_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
