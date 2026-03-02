export type ScenarioKey =
  | "performance"
  | "conduct"
  | "sickness_absence"
  | "grievance"
  | "conflict"
  | "flexible_working";

export type CaseStatus = "Draft" | "Ready" | "Needs Review";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  note: string;
}

export interface RiskFlag {
  id: string;
  label: string;
  severity: "low" | "med" | "high";
  guidance: string;
}

export interface VersionEntry {
  id: string;
  time: string;
  mode: "Standard" | "Safety";
  note: string;
}

export interface OutputPack {
  script: string;
  inviteEmail: string;
  notesTemplate: string;
  followupEmail: string;
  improvementPlan: string;
  checklist: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  scenario: ScenarioKey;
  status: CaseStatus;
  lastUpdated: string;
  owner: string;
  summary: string;
  timeline: TimelineEvent[];
  riskFlags: RiskFlag[];
  versions: VersionEntry[];
  outputs: OutputPack;
}

export interface TemplateRecord {
  id: string;
  scenario: ScenarioKey;
  name: string;
  preview: string;
}

export const scenarioMeta: Record<
  ScenarioKey,
  {
    label: string;
    description: string;
  }
> = {
  performance: {
    label: "Performance",
    description: "Structure performance conversations with clarity and fairness."
  },
  conduct: {
    label: "Conduct",
    description: "Document behavior concerns and guide consistent follow-through."
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

export const scenarioList: ScenarioKey[] = [
  "performance",
  "conduct",
  "sickness_absence",
  "grievance",
  "conflict",
  "flexible_working"
];

export const mockCases: CaseRecord[] = [
  {
    id: "case-001",
    title: "Performance plan - Jordan Patel",
    scenario: "performance",
    status: "Ready",
    lastUpdated: "02 Mar 2026, 10:12",
    owner: "Alex Morgan",
    summary:
      "Jordan has missed agreed KPI targets for 2 consecutive months despite weekly coaching check-ins. Notes indicate missed handover quality checks and delayed customer follow-up. Manager wants a structured improvement conversation with measurable milestones.",
    timeline: [
      {
        id: "e1",
        date: "12 Feb 2026",
        title: "Weekly check-in",
        note: "Discussed target variance and clarified expected quality threshold."
      },
      {
        id: "e2",
        date: "19 Feb 2026",
        title: "Coaching session",
        note: "Provided examples and offered peer shadow support for 2 weeks."
      },
      {
        id: "e3",
        date: "27 Feb 2026",
        title: "Escalation prep",
        note: "Prepared formal improvement meeting and documentation pack."
      }
    ],
    riskFlags: [
      {
        id: "r1",
        label: "No dispute on chronology",
        severity: "low",
        guidance: "Timeline is complete and sequenced clearly."
      },
      {
        id: "r2",
        label: "Consistency check recommended",
        severity: "med",
        guidance: "Confirm coaching evidence is attached before formal plan."
      }
    ],
    versions: [
      {
        id: "v1",
        time: "02 Mar 2026, 09:40",
        mode: "Standard",
        note: "Initial draft pack"
      },
      {
        id: "v2",
        time: "02 Mar 2026, 10:12",
        mode: "Standard",
        note: "Adjusted tone to supportive"
      }
    ],
    outputs: {
      script:
        "Opening\n- Thank you for joining. Today is a structured check-in on recent performance outcomes.\n\nFacts\n- Review two months of KPI variance and quality checkpoints.\n\nImpact\n- Explain service impact and workload pressure on peers.\n\nQuestions\n- Ask what barriers are affecting consistency and what support is needed.\n\nExpectations\n- Agree measurable targets and review schedule.\n\nClose\n- Confirm actions in writing and set next review date.",
      inviteEmail:
        "Subject: Performance support meeting\n\nHi Jordan,\n\nI would like to schedule a meeting to review recent performance outcomes, discuss support, and agree clear next steps.\n\nKind regards,\nAlex",
      notesTemplate:
        "Meeting Notes\n- Date/Time:\n- Attendees:\n- Key facts discussed:\n- Employee perspective:\n- Agreed actions:\n- Review date:",
      followupEmail:
        "Subject: Follow-up and agreed actions\n\nHi Jordan,\n\nThanks for your time today. Confirming the agreed actions, support steps, and review date. Please reply if any point needs correction.",
      improvementPlan:
        "- Objective: Improve handover quality to 98% by next review.\n- Measure: Weekly QA audit on 10 cases.\n- Support: 2 shadow sessions + toolkit refresher.\n- Review date: [Insert date]",
      checklist:
        "- [ ] Validate timeline evidence\n- [ ] Share agenda before meeting\n- [ ] Capture employee response\n- [ ] Send written follow-up\n- [ ] Set next checkpoint"
    }
  },
  {
    id: "case-002",
    title: "Grievance intake - Priya Singh",
    scenario: "grievance",
    status: "Needs Review",
    lastUpdated: "01 Mar 2026, 16:20",
    owner: "Naomi Lee",
    summary:
      "Priya raised concerns about repeated exclusion from project decisions and comments perceived as biased. Initial notes include references to potential discrimination. Safety mode drafting recommended pending HR review.",
    timeline: [
      {
        id: "e4",
        date: "24 Feb 2026",
        title: "Concern raised",
        note: "Employee submitted written grievance summary to line manager."
      },
      {
        id: "e5",
        date: "26 Feb 2026",
        title: "Acknowledgement",
        note: "Manager confirmed receipt and outlined next procedural steps."
      }
    ],
    riskFlags: [
      {
        id: "r3",
        label: "Potential discrimination language",
        severity: "high",
        guidance: "Use neutral wording and seek HR/legal review before formal conclusions."
      },
      {
        id: "r4",
        label: "Sensitive witness detail",
        severity: "med",
        guidance: "Keep records factual and avoid assumptions."
      }
    ],
    versions: [
      {
        id: "v3",
        time: "01 Mar 2026, 15:52",
        mode: "Safety",
        note: "Neutral escalation pack"
      },
      {
        id: "v4",
        time: "01 Mar 2026, 16:20",
        mode: "Safety",
        note: "Added policy reminder"
      }
    ],
    outputs: {
      script:
        "Opening\n- Thank you for raising your concern. This conversation focuses on facts and process.\n\nFacts\n- Review dates, examples, and any corroborating records.\n\nImpact\n- Document impact statements without drawing legal conclusions.\n\nQuestions\n- Clarify desired outcome and any immediate wellbeing concerns.\n\nExpectations\n- Explain next procedural steps and timeline.\n\nClose\n- Confirm written follow-up and HR review path.",
      inviteEmail:
        "Subject: Grievance discussion meeting\n\nHi Priya,\n\nThank you for raising your concern. I would like to meet to understand the facts and confirm next procedural steps.\n\nKind regards,\nNaomi",
      notesTemplate:
        "Grievance Notes\n- Date/Time\n- Concern summary\n- Supporting examples\n- Witnesses\n- Immediate actions\n- Next steps",
      followupEmail:
        "Subject: Follow-up and next steps\n\nHi Priya,\n\nThank you for meeting today. This email confirms the process steps and expected timeline for review.",
      improvementPlan:
        "- Objective: Ensure timely and fair grievance handling process.\n- Measure: Milestones completed within policy timeline.\n- Owner: Investigating manager\n- Review date: [Insert date]",
      checklist:
        "- [ ] Acknowledge concern in writing\n- [ ] Log chronology\n- [ ] Assign impartial reviewer\n- [ ] Check policy and support needs\n- [ ] Confirm communication plan"
    }
  }
];

export const mockTemplates: TemplateRecord[] = [
  {
    id: "t1",
    scenario: "performance",
    name: "Performance Meeting Agenda",
    preview: "Opening context, evidence review, support options, and agreed milestones."
  },
  {
    id: "t2",
    scenario: "conduct",
    name: "Conduct Investigation Prompt",
    preview: "Capture facts, witness input, and objective standards for consistency."
  },
  {
    id: "t3",
    scenario: "sickness_absence",
    name: "Return to Work Structure",
    preview: "Discuss wellbeing, adjustments, and phased return checkpoints."
  },
  {
    id: "t4",
    scenario: "grievance",
    name: "Grievance Acknowledgement",
    preview: "Confirm receipt, process timeline, and point of contact."
  },
  {
    id: "t5",
    scenario: "conflict",
    name: "Mediation Ground Rules",
    preview: "Shared standards, respectful dialogue commitments, and follow-up reviews."
  },
  {
    id: "t6",
    scenario: "flexible_working",
    name: "Flexible Working Assessment",
    preview: "Role coverage analysis, alternatives, and trial period framing."
  }
];

export const qualityChecksMock = [
  "Language remains factual and non-judgemental",
  "Timeline and summary are aligned",
  "Policy reminders are included in final draft"
];
