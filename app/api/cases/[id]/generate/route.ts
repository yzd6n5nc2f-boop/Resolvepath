import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import {
  isGenerationMode,
  isLengthPreference,
  isTonePreference,
  type GenerationMode,
  type LengthPreference,
  type TonePreference
} from "@/lib/server/domain";
import { generateOutputs } from "@/lib/server/generateOutputs";
import { serializeOutputs, serializeRiskFlags } from "@/lib/server/json";
import { riskEngine } from "@/lib/server/riskEngine";
import { toOutputVersionResponse } from "@/lib/server/api-helpers";
import { toApiScenario } from "@/lib/scenarios";

interface Context {
  params: {
    id: string;
  };
}

interface GenerateBody {
  mode?: unknown;
  tonePreference?: unknown;
  lengthPreference?: unknown;
}

export async function POST(request: Request, context: Context): Promise<NextResponse> {
  const caseRecord = await db.case.findUnique({
    where: { id: context.params.id },
    include: {
      timelineEvents: { orderBy: { date: "asc" } }
    }
  });

  if (!caseRecord) {
    return NextResponse.json({ error: "case not found" }, { status: 404 });
  }

  const settings = await db.setting.findUnique({ where: { id: 1 } });
  const body = (await request.json().catch(() => ({}))) as GenerateBody;

  const tonePreference: TonePreference = isTonePreference(body.tonePreference)
    ? body.tonePreference
    : isTonePreference(caseRecord.tonePreference)
      ? caseRecord.tonePreference
      : "neutral";

  const lengthPreference: LengthPreference = isLengthPreference(body.lengthPreference)
    ? body.lengthPreference
    : isLengthPreference(caseRecord.lengthPreference)
      ? caseRecord.lengthPreference
      : "standard";

  const timeline = caseRecord.timelineEvents.map((event) => ({ date: event.date, note: event.note }));
  const risk = riskEngine(caseRecord.summary, timeline);

  const requestedMode: GenerationMode | null = isGenerationMode(body.mode) ? body.mode : null;
  const mode: GenerationMode = risk.highRisk ? "safety" : requestedMode || "standard";

  const scenario = toApiScenario(caseRecord.scenario) || "PERFORMANCE";

  const outputs = await generateOutputs(
    {
      caseTitle: caseRecord.title,
      scenario,
      summary: caseRecord.summary,
      timelineEvents: timeline,
      tonePreference,
      lengthPreference,
      orgPolicyText: settings?.orgPolicyText,
      riskFlags: risk.riskFlags
    },
    mode
  );

  const version = await db.outputVersion.create({
    data: {
      caseId: caseRecord.id,
      mode,
      outputsJson: serializeOutputs(outputs),
      riskFlagsJson: serializeRiskFlags(risk.riskFlags)
    }
  });

  const nextStatus = risk.highRisk ? "NeedsReview" : "Ready";

  await db.case.update({
    where: { id: caseRecord.id },
    data: {
      tonePreference,
      lengthPreference,
      status: nextStatus
    }
  });

  return NextResponse.json({
    caseId: caseRecord.id,
    mode,
    outputs,
    version: toOutputVersionResponse(version),
    riskFlags: risk.riskFlags,
    highRisk: risk.highRisk,
    missingInfo: risk.missingInfo,
    safetyGate: risk.highRisk
      ? "Safety Gate: This draft is process support only, not legal advice. Seek qualified HR/legal review before formal decisions."
      : null
  });
}
