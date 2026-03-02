import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { toOutputVersionResponse } from "@/lib/server/api-helpers";

interface Context {
  params: {
    id: string;
    versionId: string;
  };
}

export async function POST(_: Request, context: Context): Promise<NextResponse> {
  const caseRecord = await db.case.findUnique({ where: { id: context.params.id } });
  if (!caseRecord) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  const sourceVersion = await db.outputVersion.findUnique({ where: { id: context.params.versionId } });
  if (!sourceVersion || sourceVersion.caseId !== caseRecord.id) {
    return NextResponse.json({ error: "version not found" }, { status: 404 });
  }

  const restoredVersion = await db.outputVersion.create({
    data: {
      caseId: caseRecord.id,
      mode: sourceVersion.mode,
      outputsJson: sourceVersion.outputsJson,
      riskFlagsJson: sourceVersion.riskFlagsJson
    }
  });

  return NextResponse.json({
    restoredFrom: sourceVersion.id,
    version: toOutputVersionResponse(restoredVersion)
  });
}
