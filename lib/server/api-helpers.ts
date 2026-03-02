import { parseOutputs, parseRiskFlags } from "@/lib/server/json";

export function toOutputVersionResponse(version: {
  id: string;
  caseId: string;
  createdAt: Date;
  mode: string;
  outputsJson: string;
  riskFlagsJson: string;
}): {
  id: string;
  caseId: string;
  createdAt: string;
  mode: string;
  outputs: ReturnType<typeof parseOutputs>;
  riskFlags: ReturnType<typeof parseRiskFlags>;
} {
  return {
    id: version.id,
    caseId: version.caseId,
    createdAt: version.createdAt.toISOString(),
    mode: version.mode,
    outputs: parseOutputs(version.outputsJson),
    riskFlags: parseRiskFlags(version.riskFlagsJson)
  };
}

export function toTimelineEventResponse(event: {
  id: string;
  caseId: string;
  date: string;
  note: string;
  createdAt: Date;
}): {
  id: string;
  caseId: string;
  date: string;
  note: string;
  createdAt: string;
} {
  return {
    id: event.id,
    caseId: event.caseId,
    date: event.date,
    note: event.note,
    createdAt: event.createdAt.toISOString()
  };
}

export function parseJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
