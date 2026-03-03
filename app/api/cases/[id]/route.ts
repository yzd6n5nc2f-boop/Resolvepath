import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  isCaseStatus,
  isLengthPreference,
  isTonePreference,
  type CaseStatus,
  type LengthPreference,
  type TonePreference
} from "@/lib/server/domain";
import { toApiScenario, toUiScenario } from "@/lib/scenarios";
import {
  parseStringArray,
  parseTemplateSnapshots,
  parseTemplateValues,
  serializeStringArray,
  serializeTemplateSnapshots,
  serializeTemplateValues,
  type AppliedTemplateSnapshot
} from "@/lib/server/json";
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
  appliedTemplateIds?: unknown;
  appliedTemplateSnapshot?: unknown;
  appliedTemplateValues?: unknown;
}

function readTemplateIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter((entry) => typeof entry === "string" && entry.trim().length > 0);
}

function readTemplateSnapshots(value: unknown): AppliedTemplateSnapshot[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .filter((entry) => {
      return (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { id?: unknown }).id === "string" &&
        typeof (entry as { name?: unknown }).name === "string" &&
        typeof (entry as { version?: unknown }).version === "string" &&
        typeof (entry as { body?: unknown }).body === "string"
      );
    })
    .map((entry) => {
      const typed = entry as { id: string; name: string; version: string; body: string };
      return {
        id: typed.id,
        name: typed.name,
        version: typed.version,
        body: typed.body
      };
    });
}

function readTemplateValues(value: unknown): Record<string, Record<string, string>> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const out: Record<string, Record<string, string>> = {};
  for (const [templateId, fields] of Object.entries(value as Record<string, unknown>)) {
    if (!fields || typeof fields !== "object") {
      continue;
    }

    const nested: Record<string, string> = {};
    for (const [field, fieldValue] of Object.entries(fields as Record<string, unknown>)) {
      if (typeof fieldValue === "string") {
        nested[field] = fieldValue;
      }
    }

    out[templateId] = nested;
  }

  return out;
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
      scenarioUi: toUiScenario(caseRecord.scenario),
      status: caseRecord.status,
      summary: caseRecord.summary,
      tonePreference: caseRecord.tonePreference,
      lengthPreference: caseRecord.lengthPreference,
      appliedTemplateIds: parseStringArray(caseRecord.appliedTemplateIdsJson),
      appliedTemplateSnapshot: parseTemplateSnapshots(caseRecord.appliedTemplateSnapshotJson),
      appliedTemplateValues: parseTemplateValues(caseRecord.appliedTemplateValuesJson),
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
    appliedTemplateIdsJson?: string;
    appliedTemplateSnapshotJson?: string;
    appliedTemplateValuesJson?: string;
  } = {};

  if (typeof body.title === "string" && body.title.trim().length > 0) {
    updateData.title = body.title.trim();
  }

  if (typeof body.summary === "string" && body.summary.trim().length > 0) {
    updateData.summary = body.summary.trim();
  }

  if (typeof body.scenario === "string") {
    const scenario = toApiScenario(body.scenario);
    if (!scenario) {
      return NextResponse.json({ error: "scenario is invalid" }, { status: 400 });
    }
    updateData.scenario = scenario;
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

  const templateIds = readTemplateIds(body.appliedTemplateIds);
  if (templateIds) {
    updateData.appliedTemplateIdsJson = serializeStringArray(templateIds);
  }

  const templateSnapshots = readTemplateSnapshots(body.appliedTemplateSnapshot);
  if (templateSnapshots) {
    updateData.appliedTemplateSnapshotJson = serializeTemplateSnapshots(templateSnapshots);
  }

  const templateValues = readTemplateValues(body.appliedTemplateValues);
  if (templateValues) {
    updateData.appliedTemplateValuesJson = serializeTemplateValues(templateValues);
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
      scenarioUi: toUiScenario(updated.scenario),
      status: updated.status,
      summary: updated.summary,
      tonePreference: updated.tonePreference,
      lengthPreference: updated.lengthPreference,
      appliedTemplateIds: parseStringArray(updated.appliedTemplateIdsJson),
      appliedTemplateSnapshot: parseTemplateSnapshots(updated.appliedTemplateSnapshotJson),
      appliedTemplateValues: parseTemplateValues(updated.appliedTemplateValuesJson),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      timelineEvents: updated.timelineEvents.map(toTimelineEventResponse),
      latestVersion: updated.outputVersions[0] ? toOutputVersionResponse(updated.outputVersions[0]) : null
    }
  });
}
