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

export interface AppliedTemplateSnapshot {
  id: string;
  name: string;
  version: string;
  body: string;
}

export function serializeStringArray(value: string[]): string {
  return JSON.stringify(value);
}

export function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => typeof item === "string");
  } catch {
    return [];
  }
}

export function serializeTemplateSnapshots(value: AppliedTemplateSnapshot[]): string {
  return JSON.stringify(value);
}

export function parseTemplateSnapshots(raw: string): AppliedTemplateSnapshot[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((entry) => {
      return (
        entry &&
        typeof entry === "object" &&
        typeof entry.id === "string" &&
        typeof entry.name === "string" &&
        typeof entry.version === "string" &&
        typeof entry.body === "string"
      );
    }) as AppliedTemplateSnapshot[];
  } catch {
    return [];
  }
}

export function serializeTemplateValues(value: Record<string, Record<string, string>>): string {
  return JSON.stringify(value);
}

export function parseTemplateValues(raw: string): Record<string, Record<string, string>> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const out: Record<string, Record<string, string>> = {};
    for (const [templateId, values] of Object.entries(parsed as Record<string, unknown>)) {
      if (!values || typeof values !== "object") {
        continue;
      }

      const nested: Record<string, string> = {};
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        if (typeof value === "string") {
          nested[key] = value;
        }
      }
      out[templateId] = nested;
    }
    return out;
  } catch {
    return {};
  }
}
