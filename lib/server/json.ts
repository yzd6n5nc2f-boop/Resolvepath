import type { OutputPayload, RiskFlag } from "@/lib/server/domain";

export function serializeOutputs(outputs: OutputPayload): string {
  return JSON.stringify(outputs);
}

export function parseOutputs(raw: string): OutputPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<OutputPayload>;
    if (
      typeof parsed.script !== "string" ||
      typeof parsed.invite_email !== "string" ||
      typeof parsed.meeting_notes !== "string" ||
      typeof parsed.followup_email !== "string" ||
      typeof parsed.improvement_plan !== "string" ||
      typeof parsed.checklist !== "string"
    ) {
      return null;
    }

    return parsed as OutputPayload;
  } catch {
    return null;
  }
}

export function serializeRiskFlags(riskFlags: RiskFlag[]): string {
  return JSON.stringify(riskFlags);
}

export function parseRiskFlags(raw: string): RiskFlag[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item && typeof item === "object") as RiskFlag[];
  } catch {
    return [];
  }
}
