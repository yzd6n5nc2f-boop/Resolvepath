import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { toTimelineEventResponse } from "@/lib/server/api-helpers";

interface Context {
  params: {
    id: string;
  };
}

interface AddTimelineBody {
  date?: unknown;
  note?: unknown;
}

export async function POST(request: Request, context: Context): Promise<NextResponse> {
  const caseRecord = await db.case.findUnique({ where: { id: context.params.id } });
  if (!caseRecord) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as AddTimelineBody;

  if (typeof body.date !== "string" || body.date.trim().length === 0) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  if (typeof body.note !== "string" || body.note.trim().length === 0) {
    return NextResponse.json({ error: "note is required" }, { status: 400 });
  }

  const created = await db.timelineEvent.create({
    data: {
      caseId: caseRecord.id,
      date: body.date,
      note: body.note.trim()
    }
  });

  return NextResponse.json({ event: toTimelineEventResponse(created) }, { status: 201 });
}
