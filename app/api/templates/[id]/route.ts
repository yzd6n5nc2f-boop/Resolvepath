import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { isScenario } from "@/lib/server/domain";

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

export async function PUT(request: Request, context: Context): Promise<NextResponse> {
  const existing = await db.template.findUnique({ where: { id: context.params.id } });
  if (!existing) {
    return NextResponse.json({ error: "template not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as UpdateTemplateBody;

  const updateData: {
    scenario?: string;
    name?: string;
    body?: string;
  } = {};

  if (isScenario(body.scenario)) {
    updateData.scenario = body.scenario;
  }

  if (typeof body.name === "string" && body.name.trim().length > 0) {
    updateData.name = body.name.trim();
  }

  if (typeof body.body === "string" && body.body.trim().length > 0) {
    updateData.body = body.body.trim();
  }

  const updated = await db.template.update({
    where: { id: context.params.id },
    data: updateData
  });

  return NextResponse.json({
    template: {
      id: updated.id,
      scenario: updated.scenario,
      name: updated.name,
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
