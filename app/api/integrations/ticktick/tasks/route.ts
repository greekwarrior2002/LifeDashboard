import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listTickTickTasks } from "@/lib/integrations/ticktick";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (!auth.ok) return auth.response;

  try {
    const tasks = await listTickTickTasks(auth.secret);
    if (tasks === null) {
      return NextResponse.json({ connected: false, tasks: [] });
    }
    return NextResponse.json({ connected: true, tasks });
  } catch (err) {
    return NextResponse.json(
      { connected: true, error: (err as Error).message, tasks: [] },
      { status: 502 },
    );
  }
}
