export const SCENARIOS = [
  "PERFORMANCE",
  "CONDUCT",
  "SICKNESS_ABSENCE",
  "GRIEVANCE",
  "CONFLICT",
  "FLEXIBLE_WORKING"
] as const;

export const CASE_STATUSES = ["Draft", "Ready", "NeedsReview"] as const;
export const TONE_PREFERENCES = ["neutral", "supportive", "firm"] as const;
export const LENGTH_PREFERENCES = ["short", "standard", "detailed"] as const;
export const GENERATION_MODES = ["standard", "safety"] as const;

export type Scenario = (typeof SCENARIOS)[number];
export type CaseStatus = (typeof CASE_STATUSES)[number];
export type TonePreference = (typeof TONE_PREFERENCES)[number];
export type LengthPreference = (typeof LENGTH_PREFERENCES)[number];
export type GenerationMode = (typeof GENERATION_MODES)[number];

export type RiskSeverity = "low" | "med" | "high";

export interface RiskFlag {
  code: string;
  label: string;
  severity: RiskSeverity;
  guidance: string;
  matchedKeywords?: string[];
}

export interface MissingInfo {
  noTimeline: boolean;
  tooGeneric: boolean;
  noSpecificExamples: boolean;
}

export interface RiskEngineResult {
  riskFlags: RiskFlag[];
  highRisk: boolean;
  missingInfo: MissingInfo;
}

export interface OutputPayload {
  script: string;
  invite_email: string;
  meeting_notes: string;
  followup_email: string;
  improvement_plan: string;
  checklist: string;
}

export interface GenerateInput {
  caseTitle: string;
  scenario: Scenario;
  summary: string;
  timelineEvents: Array<{ date: string; note: string }>;
  tonePreference: TonePreference;
  lengthPreference: LengthPreference;
  orgPolicyText?: string | null;
  riskFlags?: RiskFlag[];
}

export function isScenario(value: unknown): value is Scenario {
  return typeof value === "string" && (SCENARIOS as readonly string[]).includes(value);
}

export function isCaseStatus(value: unknown): value is CaseStatus {
  return typeof value === "string" && (CASE_STATUSES as readonly string[]).includes(value);
}

export function isTonePreference(value: unknown): value is TonePreference {
  return typeof value === "string" && (TONE_PREFERENCES as readonly string[]).includes(value);
}

export function isLengthPreference(value: unknown): value is LengthPreference {
  return typeof value === "string" && (LENGTH_PREFERENCES as readonly string[]).includes(value);
}

export function isGenerationMode(value: unknown): value is GenerationMode {
  return typeof value === "string" && (GENERATION_MODES as readonly string[]).includes(value);
}
