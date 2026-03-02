import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { toOutputVersionResponse } from "@/lib/server/api-helpers";

interface Context {
  params: {
    id: string;
  };
}

export async function GET(_: Request, context: Context): Promise<NextResponse> {
  const caseRecord = await db.case.findUnique({ where: { id: context.params.id } });
  if (!caseRecord) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  const versions = await db.outputVersion.findMany({
    where: { caseId: context.params.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ versions: versions.map(toOutputVersionResponse) });
}
