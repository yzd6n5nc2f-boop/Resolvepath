import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

interface Context {
  params: {
    eventId: string;
  };
}

export async function DELETE(_: Request, context: Context): Promise<NextResponse> {
  const existing = await db.timelineEvent.findUnique({ where: { id: context.params.eventId } });
  if (!existing) {
    return NextResponse.json({ error: "timeline event not found" }, { status: 404 });
  }

  await db.timelineEvent.delete({ where: { id: context.params.eventId } });
  return NextResponse.json({ deleted: true, eventId: context.params.eventId });
}
