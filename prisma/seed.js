const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function buildTemplateBody({ name, purpose, whenToUse, inputs, draft, optionalClauses, reviewerNotes }) {
  return `# ${name}

## Purpose
${purpose}

## When to use
${whenToUse}

## Inputs required
${inputs.map((entry) => `- ${entry.label} — {{${entry.key}}}`).join("\n")}

## Draft (copy/paste)
${draft}

## Optional clauses
${optionalClauses}

## Notes for reviewer
${reviewerNotes}

## Audit footer
Prepared by: {{prepared_by}}
Reviewed by: {{reviewed_by}}
Date: {{prepared_date}}
Version: {{template_version}}`;
}

const templates = [
  {
    scenario: "PERFORMANCE",
    name: "Informal Performance Conversation Notes",
    version: "1.0",
    body: buildTemplateBody({
      name: "Informal Performance Conversation Notes",
      purpose: "Record a fair and factual informal conversation about performance concerns.",
      whenToUse: "Use before formal capability steps where coaching and support remain appropriate.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Evidence summary", key: "evidence_summary" },
        { label: "Support actions", key: "support_actions" },
        { label: "Review date", key: "review_date" }
      ],
      draft: `Conversation summary for {{employee_name}} on {{meeting_date}}.

Facts discussed:
- {{issue_summary}}
- Evidence referenced: {{evidence_summary}}

Support offered:
- {{support_actions}}

Agreed expectations and timeline:
- Next checkpoint date: {{review_date}}
- Standard expected: [insert standard]

Record acknowledgement:
- Employee comments: [insert response]
- Manager confirmation: {{manager_name}}`,
      optionalClauses:
        "You may add wellbeing support options, training references, or agreed adjustments where relevant.",
      reviewerNotes:
        "Keep notes factual and specific. Avoid assumptions or legal conclusions."
    })
  },
  {
    scenario: "PERFORMANCE",
    name: "Performance Improvement Plan (PIP)",
    version: "1.0",
    body: buildTemplateBody({
      name: "Performance Improvement Plan (PIP)",
      purpose: "Set clear objectives, support, and review checkpoints for performance improvement.",
      whenToUse: "Use after clear concerns are evidenced and support expectations are agreed.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Employee role", key: "employee_role" },
        { label: "Manager name", key: "manager_name" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Expected improvement", key: "expected_improvement" },
        { label: "Support actions", key: "support_actions" },
        { label: "Review date", key: "review_date" }
      ],
      draft: `Performance Improvement Plan for {{employee_name}} ({{employee_role}}).

Current concern:
- {{issue_summary}}

Required improvement outcomes:
- {{expected_improvement}}

Support provided by manager/team:
- {{support_actions}}

Review structure:
- Weekly check-in owner: {{manager_name}}
- Formal review date: {{review_date}}

Plan outcome options:
- [met / partly met / not met]
- Next action in line with policy: [insert]`,
      optionalClauses:
        "Include a measurable success metric table and a training plan if this supports clarity.",
      reviewerNotes:
        "Ensure objectives are specific, measurable, and achievable within realistic timeframes."
    })
  },
  {
    scenario: "PERFORMANCE",
    name: "Invite to Capability/Performance Meeting",
    version: "1.0",
    body: buildTemplateBody({
      name: "Invite to Capability/Performance Meeting",
      purpose: "Invite the employee to a formal capability discussion with clear process information.",
      whenToUse: "Use when moving into formal performance stages under policy.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Policy name", key: "policy_name" },
        { label: "Issue summary", key: "issue_summary" }
      ],
      draft: `Subject: Invitation to capability/performance meeting

Dear {{employee_name}},

You are invited to a formal capability/performance meeting on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

Meeting purpose:
- Review concerns: {{issue_summary}}
- Discuss your perspective
- Confirm next steps under {{policy_name}}

You may bring a companion where your policy allows.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add details of documents enclosed and any reasonable adjustment arrangements.",
      reviewerNotes:
        "Check invitation timing and companion rights align with internal policy."
    })
  },
  {
    scenario: "PERFORMANCE",
    name: "Outcome Letter — Performance Meeting",
    version: "1.0",
    body: buildTemplateBody({
      name: "Outcome Letter — Performance Meeting",
      purpose: "Confirm outcome and expectations after a formal performance meeting.",
      whenToUse: "Use after a capability meeting where outcomes are agreed and documented.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Expected improvement", key: "expected_improvement" },
        { label: "Review date", key: "review_date" },
        { label: "Appeal deadline", key: "appeal_deadline" }
      ],
      draft: `Subject: Outcome of performance meeting held on {{meeting_date}}

Dear {{employee_name}},

Thank you for attending the meeting on {{meeting_date}}.

Outcome summary:
- Concern discussed: {{issue_summary}}
- Required improvement: {{expected_improvement}}
- Review date: {{review_date}}

Please contact {{manager_name}} if any point in this summary is inaccurate.

If policy provides an appeal process, submit any appeal by {{appeal_deadline}}.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add reference to support resources and check-in cadence if relevant.",
      reviewerNotes:
        "Keep language neutral and process-based. Avoid definitive legal conclusions."
    })
  },
  {
    scenario: "CONDUCT",
    name: "Investigation Plan and Checklist",
    version: "1.0",
    body: buildTemplateBody({
      name: "Investigation Plan and Checklist",
      purpose: "Structure a fair conduct investigation with clear evidence and timeline controls.",
      whenToUse: "Use at the start of a conduct investigation to scope tasks and responsibilities.",
      inputs: [
        { label: "Manager name", key: "manager_name" },
        { label: "HR contact", key: "hr_contact" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Evidence summary", key: "evidence_summary" },
        { label: "Review date", key: "review_date" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Investigation plan owner: {{manager_name}}.

Scope:
- Allegation/issue: {{issue_summary}}
- Evidence to gather: {{evidence_summary}}
- Policy framework: {{policy_name}}

Checklist:
- [ ] Confirm scope and investigator role
- [ ] Gather documentary evidence
- [ ] Hold witness meetings
- [ ] Offer employee response meeting
- [ ] Record findings and recommendations
- [ ] Complete review by {{review_date}}

HR support contact: {{hr_contact}}`,
      optionalClauses:
        "Add confidentiality handling and information security steps where required.",
      reviewerNotes:
        "Ensure investigation activity is proportionate and documented chronologically."
    })
  },
  {
    scenario: "CONDUCT",
    name: "Invite to Disciplinary Hearing",
    version: "1.0",
    body: buildTemplateBody({
      name: "Invite to Disciplinary Hearing",
      purpose: "Invite employee to a disciplinary hearing with clear process details.",
      whenToUse: "Use when an investigation supports moving to a formal disciplinary hearing.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Invitation to disciplinary hearing

Dear {{employee_name}},

You are invited to attend a disciplinary hearing on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

Purpose of hearing:
- Review the conduct concerns: {{issue_summary}}
- Consider your response
- Decide next steps under {{policy_name}}

You may bring a companion where policy allows.

Regards,
{{manager_name}}`,
      optionalClauses:
        "List enclosed evidence and hearing chair details.",
      reviewerNotes:
        "Check notice period and hearing rights align with policy."
    })
  },
  {
    scenario: "CONDUCT",
    name: "Outcome Letter — Disciplinary Warning",
    version: "1.0",
    body: buildTemplateBody({
      name: "Outcome Letter — Disciplinary Warning",
      purpose: "Confirm disciplinary warning outcome and expected conduct standards.",
      whenToUse: "Use after disciplinary hearing where warning outcome is applied.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Warning type", key: "warning_type" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Expected improvement", key: "expected_improvement" },
        { label: "Appeal deadline", key: "appeal_deadline" }
      ],
      draft: `Subject: Outcome of disciplinary hearing

Dear {{employee_name}},

Following the disciplinary hearing, the outcome is: {{warning_type}}.

Reason summary:
- {{issue_summary}}

Required standards moving forward:
- {{expected_improvement}}

If your policy provides appeal rights, submit your appeal by {{appeal_deadline}}.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add review duration and consequence wording from internal policy.",
      reviewerNotes:
        "Confirm wording is factual, proportionate, and policy-aligned."
    })
  },
  {
    scenario: "CONDUCT",
    name: "Outcome Letter — Disciplinary Dismissal",
    version: "1.0",
    body: buildTemplateBody({
      name: "Outcome Letter — Disciplinary Dismissal",
      purpose: "Record dismissal outcome communication and process steps.",
      whenToUse: "Use only where policy process is complete and decision is authorised.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Appeal deadline", key: "appeal_deadline" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Outcome of disciplinary hearing held on {{meeting_date}}

Dear {{employee_name}},

Following the hearing on {{meeting_date}}, the decision communicated was dismissal in line with {{policy_name}}.

Summary of concerns considered:
- {{issue_summary}}

You may submit an appeal by {{appeal_deadline}} in accordance with policy.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Include administrative details (final pay, return of equipment, contact route) per policy.",
      reviewerNotes:
        "Use with HR review. Ensure all process records are complete before issue."
    })
  },
  {
    scenario: "GRIEVANCE",
    name: "Grievance Acknowledgement Letter",
    version: "1.0",
    body: buildTemplateBody({
      name: "Grievance Acknowledgement Letter",
      purpose: "Acknowledge receipt of grievance and confirm next process steps.",
      whenToUse: "Use promptly after receiving a grievance submission.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Acknowledgement of grievance

Dear {{employee_name}},

Thank you for your grievance submission. We acknowledge receipt and will manage this under {{policy_name}}.

Summary received:
- {{issue_summary}}

Next step:
- Initial meeting proposed for {{meeting_date}}

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add support options, wellbeing resources, or named contact details.",
      reviewerNotes:
        "Do not pre-judge outcome. Keep acknowledgement neutral."
    })
  },
  {
    scenario: "GRIEVANCE",
    name: "Invite to Grievance Meeting",
    version: "1.0",
    body: buildTemplateBody({
      name: "Invite to Grievance Meeting",
      purpose: "Invite the employee to discuss grievance concerns and evidence.",
      whenToUse: "Use after acknowledgement, before findings are reached.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Invitation to grievance meeting

Dear {{employee_name}},

You are invited to a grievance meeting on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

The meeting will follow {{policy_name}} and will focus on understanding your concerns and relevant evidence.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add companion rights wording where policy supports this.",
      reviewerNotes:
        "Share agenda and evidence pack in line with policy timings."
    })
  },
  {
    scenario: "GRIEVANCE",
    name: "Grievance Outcome Letter",
    version: "1.0",
    body: buildTemplateBody({
      name: "Grievance Outcome Letter",
      purpose: "Communicate grievance findings and next steps.",
      whenToUse: "Use once review/investigation is complete and findings are approved.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Review date", key: "review_date" },
        { label: "Appeal deadline", key: "appeal_deadline" }
      ],
      draft: `Subject: Grievance outcome

Dear {{employee_name}},

Following the grievance process meeting on {{meeting_date}}, this letter confirms the outcome.

Summary reviewed:
- {{issue_summary}}

Actions and follow-up:
- [insert agreed actions]
- Review checkpoint: {{review_date}}

If policy provides appeal rights, submit appeal by {{appeal_deadline}}.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add implementation owners and timeline milestones.",
      reviewerNotes:
        "Use clear factual findings and avoid unnecessary personal commentary."
    })
  },
  {
    scenario: "SICKNESS_ABSENCE",
    name: "Return-to-Work Meeting Notes and Action Plan",
    version: "1.0",
    body: buildTemplateBody({
      name: "Return-to-Work Meeting Notes and Action Plan",
      purpose: "Record a supportive return-to-work discussion and practical action plan.",
      whenToUse: "Use for first return meeting and follow-up review meetings.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Support actions", key: "support_actions" },
        { label: "Review date", key: "review_date" }
      ],
      draft: `Return-to-work notes for {{employee_name}} on {{meeting_date}}.

Health and work context:
- {{issue_summary}}

Agreed support/action plan:
- {{support_actions}}

Review and monitoring:
- Next review date: {{review_date}}
- Escalation contact: {{manager_name}}`,
      optionalClauses:
        "Add workplace adjustment detail and referral actions if applicable.",
      reviewerNotes:
        "Keep tone supportive and factual; avoid assumptions about medical matters."
    })
  },
  {
    scenario: "SICKNESS_ABSENCE",
    name: "Invite to Long-Term Sickness Review Meeting",
    version: "1.0",
    body: buildTemplateBody({
      name: "Invite to Long-Term Sickness Review Meeting",
      purpose: "Invite employee to a structured review meeting for ongoing absence.",
      whenToUse: "Use when absence duration triggers formal review stage under policy.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Invitation to long-term sickness review meeting

Dear {{employee_name}},

You are invited to a review meeting on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

Meeting aims:
- Review current position and support options
- Discuss next steps under {{policy_name}}

Regards,
{{manager_name}}`,
      optionalClauses:
        "Include companion policy and adjustment support details.",
      reviewerNotes:
        "Ensure invitation balances process clarity with wellbeing sensitivity."
    })
  },
  {
    scenario: "SICKNESS_ABSENCE",
    name: "Occupational Health Referral Request",
    version: "1.0",
    body: buildTemplateBody({
      name: "Occupational Health Referral Request",
      purpose: "Request occupational health input with clear context and questions.",
      whenToUse: "Use where policy supports referral to inform workplace decisions.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Employee role", key: "employee_role" },
        { label: "Manager name", key: "manager_name" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Support actions", key: "support_actions" },
        { label: "Occupational health provider", key: "occupational_health_provider" }
      ],
      draft: `Referral request to {{occupational_health_provider}} for {{employee_name}} ({{employee_role}}).

Reason for referral:
- {{issue_summary}}

Support already in place:
- {{support_actions}}

Questions for occupational health:
- [insert role-impact question]
- [insert adjustment question]
- [insert return/timescale question]

Requesting manager: {{manager_name}}`,
      optionalClauses:
        "Add consent and data handling wording based on your internal process.",
      reviewerNotes:
        "Only request information necessary for workplace decisions."
    })
  },
  {
    scenario: "FLEXIBLE_WORKING",
    name: "Flexible Working Request Acknowledgement",
    version: "1.0",
    body: buildTemplateBody({
      name: "Flexible Working Request Acknowledgement",
      purpose: "Acknowledge a flexible working request and confirm process timeline.",
      whenToUse: "Use promptly after receiving a flexible working request.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Acknowledgement of flexible working request

Dear {{employee_name}},

Thank you for your request. We confirm receipt and will review it under {{policy_name}}.

Request summary:
- {{issue_summary}}

Next step:
- Consultation meeting proposed for {{meeting_date}}

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add request reference ID and process milestones if used internally.",
      reviewerNotes:
        "Keep acknowledgement neutral and avoid pre-judging outcome."
    })
  },
  {
    scenario: "FLEXIBLE_WORKING",
    name: "Invite to Flexible Working Consultation",
    version: "1.0",
    body: buildTemplateBody({
      name: "Invite to Flexible Working Consultation",
      purpose: "Invite employee to discuss flexible working request details and options.",
      whenToUse: "Use after request acknowledgement and before decision letter.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Policy name", key: "policy_name" }
      ],
      draft: `Subject: Invitation to flexible working consultation

Dear {{employee_name}},

You are invited to a consultation meeting on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

Purpose:
- Discuss your flexible working request
- Explore practical options under {{policy_name}}

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add attendance details for HR or operational stakeholders if relevant.",
      reviewerNotes:
        "Prepare objective coverage and role impact information before meeting."
    })
  },
  {
    scenario: "FLEXIBLE_WORKING",
    name: "Flexible Working Decision Letter — Approved/Trial/Adjusted",
    version: "1.0",
    body: buildTemplateBody({
      name: "Flexible Working Decision Letter — Approved/Trial/Adjusted",
      purpose: "Confirm a positive or adjusted flexible working decision and implementation terms.",
      whenToUse: "Use when request is approved in full, approved with adjustment, or trialed.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Expected improvement", key: "expected_improvement" },
        { label: "Review date", key: "review_date" }
      ],
      draft: `Subject: Flexible working decision

Dear {{employee_name}},

Following consultation, your request outcome is confirmed as approved/trial/adjusted.

Decision summary:
- {{issue_summary}}

Implementation details:
- Agreed arrangement: {{expected_improvement}}
- Review date: {{review_date}}

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add trial metrics, review points, and amendment process.",
      reviewerNotes:
        "Ensure decision terms are clear, measurable, and communicated consistently."
    })
  },
  {
    scenario: "FLEXIBLE_WORKING",
    name: "Flexible Working Decision Letter — Refused with Appeal",
    version: "1.0",
    body: buildTemplateBody({
      name: "Flexible Working Decision Letter — Refused with Appeal",
      purpose: "Communicate refusal decision with business rationale placeholders and appeal route.",
      whenToUse: "Use where request is declined after consultation and review.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Policy name", key: "policy_name" },
        { label: "Appeal deadline", key: "appeal_deadline" }
      ],
      draft: `Subject: Flexible working decision

Dear {{employee_name}},

After consultation and review under {{policy_name}}, your request cannot be approved at this stage.

Business rationale summary:
- {{issue_summary}}
- [insert operational impact placeholder]
- [insert alternatives considered placeholder]

If policy allows appeal, please submit by {{appeal_deadline}}.

Regards,
{{manager_name}}`,
      optionalClauses:
        "Add available alternative arrangement options where appropriate.",
      reviewerNotes:
        "Keep rationale evidence-based and consistent with documented assessment."
    })
  },
  {
    scenario: "CONFLICT",
    name: "Mediation Invitation",
    version: "1.0",
    body: buildTemplateBody({
      name: "Mediation Invitation",
      purpose: "Invite parties to mediation with clear voluntary process framing.",
      whenToUse: "Use where workplace conflict can be supported through facilitated discussion.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Meeting time", key: "meeting_time" },
        { label: "Meeting location", key: "meeting_location" },
        { label: "Issue summary", key: "issue_summary" }
      ],
      draft: `Subject: Invitation to mediation meeting

Dear {{employee_name}},

You are invited to a mediation meeting on {{meeting_date}} at {{meeting_time}} in {{meeting_location}}.

Purpose:
- Discuss workplace concerns: {{issue_summary}}
- Explore practical steps to reset working relationships

Regards,
{{manager_name}}`,
      optionalClauses:
        "Include mediator details and confidentiality framework where used.",
      reviewerNotes:
        "Confirm all parties understand participation expectations and boundaries."
    })
  },
  {
    scenario: "CONFLICT",
    name: "Mediation Ground Rules and Agreement",
    version: "1.0",
    body: buildTemplateBody({
      name: "Mediation Ground Rules and Agreement",
      purpose: "Document mediation standards and practical commitments between parties.",
      whenToUse: "Use at mediation start and as reference for follow-up checkpoints.",
      inputs: [
        { label: "Employee name", key: "employee_name" },
        { label: "Manager name", key: "manager_name" },
        { label: "Meeting date", key: "meeting_date" },
        { label: "Issue summary", key: "issue_summary" },
        { label: "Support actions", key: "support_actions" },
        { label: "Review date", key: "review_date" }
      ],
      draft: `Mediation agreement dated {{meeting_date}}.

Context:
- {{issue_summary}}

Ground rules agreed:
- Respectful language and no interruptions
- Use factual examples only
- Confidentiality boundaries as agreed

Action commitments:
- {{support_actions}}

Follow-up review date:
- {{review_date}}

Sign-off:
- Employee: {{employee_name}}
- Manager/facilitator: {{manager_name}}`,
      optionalClauses:
        "Add escalation path and review owner if agreement is not maintained.",
      reviewerNotes:
        "Ensure commitments are observable and time-bound where possible."
    })
  }
];

async function main() {
  await prisma.template.deleteMany();

  for (const template of templates) {
    await prisma.template.create({ data: template });
  }

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      disclaimerAccepted: false,
      orgPolicyText: null
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
