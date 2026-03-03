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

interface CreateCaseBody {
  title?: unknown;
  scenario?: unknown;
  summary?: unknown;
  status?: unknown;
  tonePreference?: unknown;
  lengthPreference?: unknown;
  appliedTemplateIds?: unknown;
  appliedTemplateSnapshot?: unknown;
  appliedTemplateValues?: unknown;
}

function readTemplateIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry) => typeof entry === "string" && entry.trim().length > 0);
}

function readTemplateSnapshots(value: unknown): AppliedTemplateSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
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

function readTemplateValues(value: unknown): Record<string, Record<string, string>> {
  if (!value || typeof value !== "object") {
    return {};
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

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as CreateCaseBody;

  if (typeof body.title !== "string" || body.title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const scenario = typeof body.scenario === "string" ? toApiScenario(body.scenario) : null;
  if (!scenario) {
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

  const appliedTemplateIds = readTemplateIds(body.appliedTemplateIds);
  const appliedTemplateSnapshot = readTemplateSnapshots(body.appliedTemplateSnapshot);
  const appliedTemplateValues = readTemplateValues(body.appliedTemplateValues);

  const created = await db.case.create({
    data: {
      title: body.title.trim(),
      scenario,
      summary: body.summary.trim(),
      status,
      tonePreference,
      lengthPreference,
      appliedTemplateIdsJson: serializeStringArray(appliedTemplateIds),
      appliedTemplateSnapshotJson: serializeTemplateSnapshots(appliedTemplateSnapshot),
      appliedTemplateValuesJson: serializeTemplateValues(appliedTemplateValues)
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
        scenarioUi: toUiScenario(created.scenario),
        status: created.status,
        summary: created.summary,
        tonePreference: created.tonePreference,
        lengthPreference: created.lengthPreference,
        appliedTemplateIds: parseStringArray(created.appliedTemplateIdsJson),
        appliedTemplateSnapshot: parseTemplateSnapshots(created.appliedTemplateSnapshotJson),
        appliedTemplateValues: parseTemplateValues(created.appliedTemplateValuesJson),
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
      scenarioUi: toUiScenario(item.scenario),
      status: item.status,
      summary: item.summary,
      tonePreference: item.tonePreference,
      lengthPreference: item.lengthPreference,
      appliedTemplateIds: parseStringArray(item.appliedTemplateIdsJson),
      appliedTemplateSnapshot: parseTemplateSnapshots(item.appliedTemplateSnapshotJson),
      appliedTemplateValues: parseTemplateValues(item.appliedTemplateValuesJson),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      timelineEvents: item.timelineEvents.map(toTimelineEventResponse),
      latestVersion: item.outputVersions[0] ? toOutputVersionResponse(item.outputVersions[0]) : null
    }))
  });
}
