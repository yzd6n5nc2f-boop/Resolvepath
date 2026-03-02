import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  isCaseStatus,
  isLengthPreference,
  isScenario,
  isTonePreference,
  type CaseStatus,
  type LengthPreference,
  type TonePreference
} from "@/lib/server/domain";
import { toOutputVersionResponse, toTimelineEventResponse } from "@/lib/server/api-helpers";

interface Context {
  params: {
    id: string;
  };
}

interface UpdateCaseBody {
  title?: unknown;
  scenario?: unknown;
  status?: unknown;
  summary?: unknown;
  tonePreference?: unknown;
  lengthPreference?: unknown;
}

export async function GET(_: Request, context: Context): Promise<NextResponse> {
  const caseRecord = await db.case.findUnique({
    where: { id: context.params.id },
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!caseRecord) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  return NextResponse.json({
    case: {
      id: caseRecord.id,
      title: caseRecord.title,
      scenario: caseRecord.scenario,
      status: caseRecord.status,
      summary: caseRecord.summary,
      tonePreference: caseRecord.tonePreference,
      lengthPreference: caseRecord.lengthPreference,
      createdAt: caseRecord.createdAt.toISOString(),
      updatedAt: caseRecord.updatedAt.toISOString(),
      timelineEvents: caseRecord.timelineEvents.map(toTimelineEventResponse),
      outputVersions: caseRecord.outputVersions.map(toOutputVersionResponse)
    }
  });
}

export async function PUT(request: Request, context: Context): Promise<NextResponse> {
  const existing = await db.case.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as UpdateCaseBody;

  const updateData: {
    title?: string;
    scenario?: string;
    status?: CaseStatus;
    summary?: string;
    tonePreference?: TonePreference;
    lengthPreference?: LengthPreference;
  } = {};

  if (typeof body.title === "string" && body.title.trim().length > 0) {
    updateData.title = body.title.trim();
  }

  if (typeof body.summary === "string" && body.summary.trim().length > 0) {
    updateData.summary = body.summary.trim();
  }

  if (isScenario(body.scenario)) {
    updateData.scenario = body.scenario;
  }

  if (isCaseStatus(body.status)) {
    updateData.status = body.status;
  }

  if (isTonePreference(body.tonePreference)) {
    updateData.tonePreference = body.tonePreference;
  }

  if (isLengthPreference(body.lengthPreference)) {
    updateData.lengthPreference = body.lengthPreference;
  }

  const updated = await db.case.update({
    where: { id: context.params.id },
    data: updateData,
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  return NextResponse.json({
    case: {
      id: updated.id,
      title: updated.title,
      scenario: updated.scenario,
      status: updated.status,
      summary: updated.summary,
      tonePreference: updated.tonePreference,
      lengthPreference: updated.lengthPreference,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      timelineEvents: updated.timelineEvents.map(toTimelineEventResponse),
      latestVersion: updated.outputVersions[0] ? toOutputVersionResponse(updated.outputVersions[0]) : null
    }
  });
}
