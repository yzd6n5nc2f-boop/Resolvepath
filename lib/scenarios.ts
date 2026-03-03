export type ScenarioUI =
  | "performance"
  | "conduct"
  | "sickness_absence"
  | "grievance"
  | "conflict"
  | "flexible_working";

export type ScenarioAPI =
  | "PERFORMANCE"
  | "CONDUCT"
  | "SICKNESS_ABSENCE"
  | "GRIEVANCE"
  | "CONFLICT"
  | "FLEXIBLE_WORKING";

const uiToApiMap: Record<ScenarioUI, ScenarioAPI> = {
  performance: "PERFORMANCE",
  conduct: "CONDUCT",
  sickness_absence: "SICKNESS_ABSENCE",
  grievance: "GRIEVANCE",
  conflict: "CONFLICT",
  flexible_working: "FLEXIBLE_WORKING"
};

const apiToUiMap: Record<ScenarioAPI, ScenarioUI> = {
  PERFORMANCE: "performance",
  CONDUCT: "conduct",
  SICKNESS_ABSENCE: "sickness_absence",
  GRIEVANCE: "grievance",
  CONFLICT: "conflict",
  FLEXIBLE_WORKING: "flexible_working"
};

export const scenarioMeta: Record<ScenarioUI, { label: string; description: string }> = {
  performance: {
    label: "Performance",
    description: "Structure performance conversations with clarity and fairness."
  },
  conduct: {
    label: "Conduct",
    description: "Document behaviour concerns and guide consistent follow-through."
  },
  sickness_absence: {
    label: "Sickness Absence",
    description: "Plan supportive check-ins, adjustments, and return discussions."
  },
  grievance: {
    label: "Grievance",
    description: "Capture concerns, evidence, and clear next procedural steps."
  },
  conflict: {
    label: "Conflict",
    description: "Prepare mediation conversations and practical reset plans."
  },
  flexible_working: {
    label: "Flexible Working",
    description: "Assess requests with transparent decision framing."
  }
};

export const scenarioList: ScenarioUI[] = Object.keys(uiToApiMap) as ScenarioUI[];

function normalizeScenarioToken(value: string): string {
  return value.trim().replace(/[\s-]+/g, "_");
}

export function toApiScenario(value: string): ScenarioAPI | null {
  const trimmed = normalizeScenarioToken(value);
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase() as ScenarioUI;
  if (lower in uiToApiMap) {
    return uiToApiMap[lower];
  }

  const upper = trimmed.toUpperCase() as ScenarioAPI;
  if (upper in apiToUiMap) {
    return upper;
  }

  return null;
}

export function toUiScenario(value: string): ScenarioUI | null {
  const trimmed = normalizeScenarioToken(value);
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase() as ScenarioAPI;
  if (upper in apiToUiMap) {
    return apiToUiMap[upper];
  }

  const lower = trimmed.toLowerCase() as ScenarioUI;
  if (lower in uiToApiMap) {
    return lower;
  }

  return null;
}
