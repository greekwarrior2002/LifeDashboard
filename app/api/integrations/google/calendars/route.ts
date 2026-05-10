import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listGoogleCalendars } from "@/lib/integrations/google-calendar";
import { getUser, toPublic, updateUser } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  try {
    const user = await getUser();
    const calendars = await listGoogleCalendars(auth.secret);
    if (calendars === null) {
      return NextResponse.json({
        connected: false,
        calendars: [],
        selectedCalendarIds: null,
      });
    }
    const selectedCalendarIds =
      user.calendar.selectedCalendarIds ??
      calendars
        .filter((calendar) => !calendar.hidden || calendar.selected)
        .map((calendar) => calendar.id);
    return NextResponse.json({
      connected: true,
      calendars,
      selectedCalendarIds,
    });
  } catch (err) {
    return NextResponse.json(
      { connected: true, calendars: [], error: (err as Error).message },
      { status: 502 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  try {
    const body = (await req.json()) as { selectedCalendarIds?: string[] | null };
    const selectedCalendarIds = Array.isArray(body.selectedCalendarIds)
      ? body.selectedCalendarIds
      : null;
    const next = await updateUser((cur) => ({
      ...cur,
      calendar: {
        selectedCalendarIds,
        updatedAt: new Date().toISOString(),
      },
    }));
    return NextResponse.json(toPublic(next));
  } catch (err) {
    return NextResponse.json(
      { error: "calendar_preferences_failed", detail: (err as Error).message },
      { status: 400 },
    );
  }
}
