import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { toApiScenario, toUiScenario } from "@/lib/scenarios";

interface CreateTemplateBody {
  scenario?: unknown;
  name?: unknown;
  version?: unknown;
  body?: unknown;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const scenarioParam = searchParams.get("scenario");
  const normalizedScenario = scenarioParam ? toApiScenario(scenarioParam) : null;
  if (scenarioParam && !normalizedScenario) {
    return NextResponse.json({ error: "scenario is invalid" }, { status: 400 });
  }

  const templates = await db.template.findMany({
    where: normalizedScenario ? { scenario: normalizedScenario } : undefined,
    orderBy: [{ scenario: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({
    templates: templates.map((template) => ({
      id: template.id,
      scenario: template.scenario,
      scenarioUi: toUiScenario(template.scenario),
      name: template.name,
      version: template.version,
      body: template.body,
      createdAt: template.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as CreateTemplateBody;
  const scenario = typeof body.scenario === "string" ? toApiScenario(body.scenario) : null;

  if (!scenario) {
    return NextResponse.json({ error: "scenario is invalid" }, { status: 400 });
  }

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (typeof body.body !== "string" || body.body.trim().length === 0) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const created = await db.template.create({
    data: {
      scenario,
      name: body.name.trim(),
      version: typeof body.version === "string" && body.version.trim().length > 0 ? body.version.trim() : "1.0",
      body: body.body.trim()
    }
  });

  return NextResponse.json(
    {
      template: {
        id: created.id,
        scenario: created.scenario,
        scenarioUi: toUiScenario(created.scenario),
        name: created.name,
        version: created.version,
        body: created.body,
        createdAt: created.createdAt.toISOString()
      }
    },
    { status: 201 }
  );
}
