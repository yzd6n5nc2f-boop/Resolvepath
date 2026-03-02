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

interface CreateCaseBody {
  title?: unknown;
  scenario?: unknown;
  summary?: unknown;
  status?: unknown;
  tonePreference?: unknown;
  lengthPreference?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as CreateCaseBody;

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!isScenario(body.scenario)) {
    return NextResponse.json({ error: "scenario is invalid" }, { status: 400 });
  }

  if (typeof body.summary !== "string" || body.summary.trim().length === 0) {
    return NextResponse.json({ error: "summary is required" }, { status: 400 });
  }

  const status: CaseStatus = isCaseStatus(body.status) ? body.status : "Draft";
  const tonePreference: TonePreference = isTonePreference(body.tonePreference)
    ? body.tonePreference
    : "neutral";
  const lengthPreference: LengthPreference = isLengthPreference(body.lengthPreference)
    ? body.lengthPreference
    : "standard";

  const created = await db.case.create({
    data: {
      title: body.title.trim(),
      scenario: body.scenario,
      summary: body.summary.trim(),
      status,
      tonePreference,
      lengthPreference
    },
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  return NextResponse.json(
    {
      case: {
        id: created.id,
        title: created.title,
        scenario: created.scenario,
        status: created.status,
        summary: created.summary,
        tonePreference: created.tonePreference,
        lengthPreference: created.lengthPreference,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        timelineEvents: created.timelineEvents.map(toTimelineEventResponse),
        latestVersion: created.outputVersions[0] ? toOutputVersionResponse(created.outputVersions[0]) : null
      }
    },
    { status: 201 }
  );
}

export async function GET(): Promise<NextResponse> {
  const cases = await db.case.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  return NextResponse.json({
    cases: cases.map((item) => ({
      id: item.id,
      title: item.title,
      scenario: item.scenario,
      status: item.status,
      summary: item.summary,
      tonePreference: item.tonePreference,
      lengthPreference: item.lengthPreference,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      timelineEvents: item.timelineEvents.map(toTimelineEventResponse),
      latestVersion: item.outputVersions[0] ? toOutputVersionResponse(item.outputVersions[0]) : null
    }))
  });
}
