import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export async function POST(): Promise<NextResponse> {
  const updated = await db.setting.upsert({
    where: { id: 1 },
    update: {
      disclaimerAccepted: true,
      acceptedAt: new Date()
    },
    create: {
      id: 1,
      disclaimerAccepted: true,
      acceptedAt: new Date(),
      orgPolicyText: null
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
