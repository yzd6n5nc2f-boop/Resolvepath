import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { toApiScenario, toUiScenario } from "@/lib/scenarios";

interface Context {
  params: {
    id: string;
  };
}

interface UpdateTemplateBody {
  scenario?: unknown;
  name?: unknown;
  body?: unknown;
}

function bumpMinorVersion(current: string): string {
  const match = current.trim().match(/^(\d+)\.(\d+)$/);
  if (!match) {
    return "1.1";
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (!Number.isFinite(major) || !Number.isFinite(minor)) {
    return "1.1";
  }

  return `${major}.${minor + 1}`;
}

export async function GET(_: Request, context: Context): Promise<NextResponse> {
  const existing = await db.template.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "template not found" }, { status: 404 });
  }

  return NextResponse.json({
    template: {
      id: existing.id,
      scenario: existing.scenario,
      scenarioUi: toUiScenario(existing.scenario),
      name: existing.name,
      version: existing.version,
      body: existing.body,
      createdAt: existing.createdAt.toISOString()
    }
  });
}

export async function PUT(request: Request, context: Context): Promise<NextResponse> {
  const existing = await db.template.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "template not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as UpdateTemplateBody;

  const updateData: {
    scenario?: string;
    name?: string;
    version?: string;
    body?: string;
  } = {};

  if (typeof body.scenario === "string") {
    const scenario = toApiScenario(body.scenario);
    if (!scenario) {
      return NextResponse.json({ error: "scenario is invalid" }, { status: 400 });
    }
    updateData.scenario = scenario;
  }

  if (typeof body.name === "string" && body.name.trim().length > 0) {
    updateData.name = body.name.trim();
  }

  if (typeof body.body === "string" && body.body.trim().length > 0) {
    updateData.body = body.body.trim();
  }

  const changed = Object.keys(updateData).length > 0;
  if (changed) {
    updateData.version = bumpMinorVersion(existing.version);
  }

  const updated = await db.template.update({
    where: { id: context.params.id },
    data: updateData
  });

  return NextResponse.json({
    template: {
      id: updated.id,
      scenario: updated.scenario,
      scenarioUi: toUiScenario(updated.scenario),
      name: updated.name,
      version: updated.version,
      body: updated.body,
      createdAt: updated.createdAt.toISOString()
    }
  });
}

export async function DELETE(_: Request, context: Context): Promise<NextResponse> {
  const existing = await db.template.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "template not found" }, { status: 404 });
  }

  await db.template.delete({ where: { id: context.params.id } });
  return NextResponse.json({ deleted: true, templateId: context.params.id });
}
