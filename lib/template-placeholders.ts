export const TEMPLATE_REVIEW_BANNER =
  "Template draft only — review against your organisation policies and current UK law/ACAS guidance.";

export type PlaceholderType = "text" | "longtext" | "date" | "email" | "phone";

export interface PlaceholderDefinition {
  key: string;
  label: string;
  example: string;
  type: PlaceholderType;
}

export interface TemplateFieldConfig {
  requiredFields: string[];
  optionalFields: string[];
}

export const commonPlaceholderDictionary: Record<string, PlaceholderDefinition> = {
  employee_name: {
    key: "employee_name",
    label: "Employee name",
    example: "Jordan Patel",
    type: "text"
  },
  employee_role: {
    key: "employee_role",
    label: "Employee role",
    example: "Customer Success Adviser",
    type: "text"
  },
  manager_name: {
    key: "manager_name",
    label: "Manager name",
    example: "Alex Morgan",
    type: "text"
  },
  manager_role: {
    key: "manager_role",
    label: "Manager role",
    example: "People Manager",
    type: "text"
  },
  hr_contact: {
    key: "hr_contact",
    label: "HR contact",
    example: "Naomi Lee",
    type: "text"
  },
  business_unit: {
    key: "business_unit",
    label: "Business unit",
    example: "Customer Operations",
    type: "text"
  },
  meeting_date: {
    key: "meeting_date",
    label: "Meeting date",
    example: "18 March 2026",
    type: "date"
  },
  meeting_time: {
    key: "meeting_time",
    label: "Meeting time",
    example: "10:00",
    type: "text"
  },
  meeting_location: {
    key: "meeting_location",
    label: "Meeting location",
    example: "Room 2B / Teams",
    type: "text"
  },
  review_date: {
    key: "review_date",
    label: "Review date",
    example: "01 April 2026",
    type: "date"
  },
  policy_name: {
    key: "policy_name",
    label: "Policy name",
    example: "Capability and Performance Policy",
    type: "text"
  },
  policy_step: {
    key: "policy_step",
    label: "Policy step",
    example: "Formal stage 1",
    type: "text"
  },
  issue_summary: {
    key: "issue_summary",
    label: "Issue summary",
    example: "KPI and quality targets missed over 8 weeks",
    type: "longtext"
  },
  evidence_summary: {
    key: "evidence_summary",
    label: "Evidence summary",
    example: "QA reports and weekly metrics data",
    type: "longtext"
  },
  support_actions: {
    key: "support_actions",
    label: "Support actions",
    example: "Weekly coaching and shadow sessions",
    type: "longtext"
  },
  expected_improvement: {
    key: "expected_improvement",
    label: "Expected improvement",
    example: "Sustain 95% quality score for 6 weeks",
    type: "longtext"
  },
  warning_type: {
    key: "warning_type",
    label: "Warning type",
    example: "First written warning",
    type: "text"
  },
  appeal_deadline: {
    key: "appeal_deadline",
    label: "Appeal deadline",
    example: "Within 5 working days",
    type: "text"
  },
  occupational_health_provider: {
    key: "occupational_health_provider",
    label: "Occupational health provider",
    example: "WorkWell OH Services",
    type: "text"
  },
  prepared_by: {
    key: "prepared_by",
    label: "Prepared by",
    example: "Alex Morgan",
    type: "text"
  },
  reviewed_by: {
    key: "reviewed_by",
    label: "Reviewed by",
    example: "HR Business Partner",
    type: "text"
  },
  prepared_date: {
    key: "prepared_date",
    label: "Prepared date",
    example: "03 March 2026",
    type: "date"
  },
  template_version: {
    key: "template_version",
    label: "Template version",
    example: "1.0",
    type: "text"
  }
};

export const templateFieldConfigByName: Record<string, TemplateFieldConfig> = {
  "Informal Performance Conversation Notes": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "support_actions",
      "review_date"
    ],
    optionalFields: ["employee_role", "evidence_summary", "policy_name"]
  },
  "Performance Improvement Plan (PIP)": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "issue_summary",
      "expected_improvement",
      "support_actions",
      "review_date"
    ],
    optionalFields: ["employee_role", "policy_name", "business_unit"]
  },
  "Invite to Capability/Performance Meeting": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "policy_name"
    ],
    optionalFields: ["hr_contact", "policy_step"]
  },
  "Outcome Letter — Performance Meeting": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "expected_improvement",
      "review_date"
    ],
    optionalFields: ["appeal_deadline", "policy_name", "policy_step"]
  },
  "Investigation Plan and Checklist": {
    requiredFields: [
      "manager_name",
      "hr_contact",
      "issue_summary",
      "evidence_summary",
      "review_date"
    ],
    optionalFields: ["policy_name", "business_unit"]
  },
  "Invite to Disciplinary Hearing": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "issue_summary"
    ],
    optionalFields: ["policy_name", "hr_contact"]
  },
  "Outcome Letter — Disciplinary Warning": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "warning_type",
      "issue_summary",
      "expected_improvement",
      "appeal_deadline"
    ],
    optionalFields: ["policy_name", "review_date"]
  },
  "Outcome Letter — Disciplinary Dismissal": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "appeal_deadline"
    ],
    optionalFields: ["policy_name", "hr_contact"]
  },
  "Grievance Acknowledgement Letter": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "policy_name",
      "issue_summary"
    ],
    optionalFields: ["hr_contact", "review_date"]
  },
  "Invite to Grievance Meeting": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "policy_name"
    ],
    optionalFields: ["hr_contact"]
  },
  "Grievance Outcome Letter": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "review_date"
    ],
    optionalFields: ["appeal_deadline", "policy_name"]
  },
  "Return-to-Work Meeting Notes and Action Plan": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "support_actions",
      "review_date"
    ],
    optionalFields: ["occupational_health_provider", "hr_contact"]
  },
  "Invite to Long-Term Sickness Review Meeting": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "policy_name"
    ],
    optionalFields: ["occupational_health_provider", "hr_contact"]
  },
  "Occupational Health Referral Request": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "issue_summary",
      "occupational_health_provider",
      "support_actions"
    ],
    optionalFields: ["employee_role", "policy_name", "review_date"]
  },
  "Flexible Working Request Acknowledgement": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "policy_name",
      "issue_summary"
    ],
    optionalFields: ["review_date", "business_unit"]
  },
  "Invite to Flexible Working Consultation": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "policy_name"
    ],
    optionalFields: ["review_date"]
  },
  "Flexible Working Decision Letter — Approved/Trial/Adjusted": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "issue_summary",
      "expected_improvement",
      "review_date"
    ],
    optionalFields: ["policy_name", "business_unit"]
  },
  "Flexible Working Decision Letter — Refused with Appeal": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "issue_summary",
      "appeal_deadline",
      "policy_name"
    ],
    optionalFields: ["business_unit", "hr_contact"]
  },
  "Mediation Invitation": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "meeting_time",
      "meeting_location",
      "issue_summary"
    ],
    optionalFields: ["hr_contact", "policy_name"]
  },
  "Mediation Ground Rules and Agreement": {
    requiredFields: [
      "employee_name",
      "manager_name",
      "meeting_date",
      "issue_summary",
      "review_date"
    ],
    optionalFields: ["hr_contact", "support_actions"]
  }
};

export function getTemplateFieldConfig(templateName: string): TemplateFieldConfig {
  return (
    templateFieldConfigByName[templateName] || {
      requiredFields: [],
      optionalFields: []
    }
  );
}

export function validateTemplateValues(templateName: string, values: Record<string, string>): {
  missingRequired: string[];
  warnings: string[];
} {
  const config = getTemplateFieldConfig(templateName);
  const missingRequired = config.requiredFields.filter((key) => !values[key] || values[key].trim().length === 0);

  const warnings: string[] = [];
  const dateKeys = [...config.requiredFields, ...config.optionalFields].filter((key) => key.includes("date"));
  for (const key of dateKeys) {
    const value = values[key];
    if (value && !/\d/.test(value)) {
      warnings.push(`${key} should include a usable date.`);
    }
  }

  return {
    missingRequired,
    warnings
  };
}
