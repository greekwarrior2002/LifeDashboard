import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listGoogleEvents } from "@/lib/integrations/google-calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  const fromParam = req.nextUrl.searchParams.get("from");
  const toParam = req.nextUrl.searchParams.get("to");
  const from = fromParam ? new Date(fromParam) : startOfToday();
  const to = toParam ? new Date(toParam) : endOfToday(from);

  try {
    const events = await listGoogleEvents(auth.secret, { from, to });
    if (events === null) {
      return NextResponse.json({ connected: false, events: [] });
    }
    return NextResponse.json({ connected: true, events });
  } catch (err) {
    return NextResponse.json(
      { connected: true, error: (err as Error).message, events: [] },
      { status: 502 },
    );
  }
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday(from: Date): Date {
  const d = new Date(from);
  d.setHours(23, 59, 59, 999);
  return d;
}
