import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

async function ensureSettings() {
  const found = await db.setting.findUnique({ where: { id: 1 } });
  if (found) {
    return found;
  }

  return db.setting.create({
    data: {
      id: 1,
      disclaimerAccepted: false,
      acceptedAt: null,
      orgPolicyText: null
    }
  });
}

export async function GET(): Promise<NextResponse> {
  const settings = await ensureSettings();

  return NextResponse.json({
    settings: {
      id: settings.id,
      disclaimerAccepted: settings.disclaimerAccepted,
      acceptedAt: settings.acceptedAt ? settings.acceptedAt.toISOString() : null,
      orgPolicyText: settings.orgPolicyText,
      updatedAt: settings.updatedAt.toISOString()
    }
  });
}
