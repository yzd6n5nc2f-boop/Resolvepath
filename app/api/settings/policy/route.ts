import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

interface SavePolicyBody {
  orgPolicyText?: unknown;
}

export async function PUT(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as SavePolicyBody;

  if (typeof body.orgPolicyText !== "string") {
    return NextResponse.json({ error: "orgPolicyText is required" }, { status: 400 });
  }

  const updated = await db.setting.upsert({
    where: { id: 1 },
    update: {
      orgPolicyText: body.orgPolicyText.trim() || null
    },
    create: {
      id: 1,
      disclaimerAccepted: false,
      acceptedAt: null,
      orgPolicyText: body.orgPolicyText.trim() || null
    }
  });

  return NextResponse.json({
    settings: {
      id: updated.id,
      disclaimerAccepted: updated.disclaimerAccepted,
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : null,
      orgPolicyText: updated.orgPolicyText,
      updatedAt: updated.updatedAt.toISOString()
    }
  });
}
