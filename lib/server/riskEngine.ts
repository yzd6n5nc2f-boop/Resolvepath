import type { RiskEngineResult, RiskFlag } from "@/lib/server/domain";

interface RiskRule {
  code: string;
  label: string;
  guidance: string;
  keywords: string[];
}

const HIGH_RISK_RULES: RiskRule[] = [
  {
    code: "PROTECTED_CHARACTERISTIC",
    label: "Protected characteristic / discrimination signal",
    guidance:
      "Use neutral process language and escalate to qualified HR/legal review before formal conclusions.",
    keywords: [
      "discrimination",
      "protected characteristic",
      "race",
      "gender",
      "disability",
      "religion",
      "age",
      "sexual orientation",
      "trans",
      "reasonable adjustment"
    ]
  },
  {
    code: "HARASSMENT",
    label: "Harassment / sexual harassment signal",
    guidance: "Prioritize safety and escalate under formal grievance/investigation policy.",
    keywords: ["harassment", "sexual harassment", "bullying", "bully", "hostile environment"]
  },
  {
    code: "WHISTLEBLOWING",
    label: "Whistleblowing signal",
    guidance: "Treat as protected disclosure risk and involve HR/legal oversight.",
    keywords: ["whistleblowing", "whistleblow", "protected disclosure", "public interest disclosure"]
  },
  {
    code: "PREGNANCY_MATERNITY",
    label: "Pregnancy / maternity signal",
    guidance: "Avoid adverse action framing and check maternity-related policy obligations.",
    keywords: ["pregnancy", "pregnant", "maternity", "return from maternity"]
  },
  {
    code: "DISMISSAL",
    label: "Dismissal / termination signal",
    guidance: "Pause irreversible decisions until process and documentation are reviewed.",
    keywords: ["dismissal", "dismiss", "terminate", "termination", "fired", "fire them"]
  },
  {
    code: "SETTLEMENT",
    label: "Settlement agreement signal",
    guidance: "Use safety mode drafts and route through HR/legal review.",
    keywords: ["settlement agreement", "without prejudice", "protected conversation"]
  }
];

const GENERIC_TERMS = ["issue", "problem", "concern", "situation", "challenge", "not good"];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function matchedKeywords(text: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => text.includes(keyword));
}

function hasSpecificExamples(summary: string, timelineEvents: Array<{ date: string; note: string }>): boolean {
  const summaryText = normalize(summary);
  const dateLikePattern =
    /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
  const quotedPattern = /"[^"]+"|'[^']+'/;

  const hasDateInSummary = dateLikePattern.test(summary);
  const hasQuoteInSummary = quotedPattern.test(summary);
  const hasTimelineDetails =
    timelineEvents.length > 0 &&
    timelineEvents.some((event) => event.date.trim().length > 0 && event.note.trim().split(/\s+/).length > 3);

  return hasDateInSummary || hasQuoteInSummary || hasTimelineDetails || /\b\d+\b/.test(summaryText);
}

export function riskEngine(
  summary: string,
  timelineEvents: Array<{ date: string; note: string }>
): RiskEngineResult {
  const normalizedSummary = normalize(summary);
  const normalizedTimelineText = normalize(timelineEvents.map((event) => `${event.date} ${event.note}`).join(" "));
  const combinedText = `${normalizedSummary} ${normalizedTimelineText}`;

  const riskFlags: RiskFlag[] = [];

  for (const rule of HIGH_RISK_RULES) {
    const matched = matchedKeywords(combinedText, rule.keywords);
    if (matched.length > 0) {
      riskFlags.push({
        code: rule.code,
        label: rule.label,
        severity: "high",
        guidance: rule.guidance,
        matchedKeywords: matched
      });
    }
  }

  const noTimeline = timelineEvents.length === 0;
  const noSpecificExamples = !hasSpecificExamples(summary, timelineEvents);

  const summaryWordCount = normalizedSummary.split(/\s+/).filter(Boolean).length;
  const genericMentions = GENERIC_TERMS.filter((term) => normalizedSummary.includes(term)).length;
  const tooGeneric = summaryWordCount < 30 || (genericMentions >= 2 && noSpecificExamples);

  if (noTimeline) {
    riskFlags.push({
      code: "MISSING_TIMELINE",
      label: "Missing timeline events",
      severity: "med",
      guidance: "Add dated timeline events to support process consistency and auditability."
    });
  }

  if (tooGeneric || noSpecificExamples) {
    riskFlags.push({
      code: "GENERIC_SUMMARY",
      label: "Summary may be too generic",
      severity: "low",
      guidance: "Add concrete dates, examples, and factual references before finalizing outputs."
    });
  }

  return {
    riskFlags,
    highRisk: riskFlags.some((flag) => flag.severity === "high"),
    missingInfo: {
      noTimeline,
      tooGeneric,
      noSpecificExamples
    }
  };
}
