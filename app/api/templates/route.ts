import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { isScenario } from "@/lib/server/domain";

interface CreateTemplateBody {
  scenario?: unknown;
  name?: unknown;
  body?: unknown;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const scenarioParam = searchParams.get("scenario");

  const templates = await db.template.findMany({
    where: isScenario(scenarioParam) ? { scenario: scenarioParam } : undefined,
    orderBy: [{ scenario: "asc" }, { name: "asc" }]
  });

  return NextResponse.json({
    templates: templates.map((template) => ({
      id: template.id,
      scenario: template.scenario,
      name: template.name,
      body: template.body,
      createdAt: template.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as CreateTemplateBody;

  if (!isScenario(body.scenario)) {
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
      scenario: body.scenario,
      name: body.name.trim(),
      body: body.body.trim()
    }
  });

  return NextResponse.json(
    {
      template: {
        id: created.id,
        scenario: created.scenario,
        name: created.name,
        body: created.body,
        createdAt: created.createdAt.toISOString()
      }
    },
    { status: 201 }
  );
}
