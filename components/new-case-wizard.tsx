"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarPlus2,
  FileText,
  Gauge,
  HeartPulse,
  Library,
  ListChecks,
  Mail,
  MessageSquareQuote,
  NotebookPen,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip, ChipButton } from "@/components/ui/Chip";
import { OutputCard } from "@/components/ui/OutputCard";
import { RiskFlagList } from "@/components/ui/RiskFlagList";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
import { Stepper } from "@/components/ui/Stepper";
import { qualityChecksMock } from "@/lib/mock-data";
import { scenarioList, scenarioMeta, toUiScenario, type ScenarioUI } from "@/lib/scenarios";
import { extractPlaceholders, renderTemplate } from "@/lib/template-engine";
import {
  TEMPLATE_REVIEW_BANNER,
  commonPlaceholderDictionary,
  getTemplateFieldConfig,
  validateTemplateValues
} from "@/lib/template-placeholders";
import { cn, formatDateTime } from "@/lib/utils";

interface TimelineDraft {
  id: string;
  date: string;
  title: string;
  note: string;
}

interface RiskFlagItem {
  id: string;
  code: string;
  label: string;
  severity: "low" | "med" | "high";
  guidance: string;
}

interface SelectedTemplate {
  id: string;
  scenario: string;
  scenarioUi: ScenarioUI | null;
  name: string;
  version: string;
  body: string;
}

interface OutputPack {
  script: string;
  invite_email: string;
  meeting_notes: string;
  followup_email: string;
  improvement_plan: string;
  checklist: string;
}

interface VersionEntry {
  id: string;
  time: string;
  mode: "Standard" | "Safety";
  note: string;
}

const steps = ["Scenario", "Intake", "Summary", "Timeline", "Risk", "Outputs"];

const scenarioIcons: Record<ScenarioUI, typeof Gauge> = {
  performance: Gauge,
  conduct: Library,
  sickness_absence: HeartPulse,
  grievance: Scale,
  conflict: Users,
  flexible_working: CalendarPlus2
};

const outputLabels: Array<{ key: keyof OutputPack; label: string; icon: typeof FileText }> = [
  { key: "script", label: "Conversation Script", icon: MessageSquareQuote },
  { key: "invite_email", label: "Meeting Invite Email", icon: Mail },
  { key: "meeting_notes", label: "Meeting Notes Template", icon: NotebookPen },
  { key: "followup_email", label: "Follow-up Email", icon: Mail },
  { key: "improvement_plan", label: "Improvement Plan", icon: Sparkles },
  { key: "checklist", label: "Checklist", icon: ListChecks }
];

const baseOutputs: OutputPack = {
  script:
    "Opening\n- Thank the colleague for attending and set purpose.\n\nFacts\n- Share observed facts and timeline references.\n\nImpact\n- Explain team or service impact in neutral language.\n\nQuestions\n- Ask for perspective and support needs.\n\nExpectations\n- Confirm expected standards and review dates.\n\nClose\n- Summarize actions and document in writing.",
  invite_email:
    "Subject: Case discussion meeting\n\nHi [Name],\n\nI would like to schedule time to review the case details, discuss context, and agree practical next steps.\n\nKind regards,\n[Manager]",
  meeting_notes:
    "Meeting Notes\n- Date/Time:\n- Participants:\n- Key facts reviewed:\n- Employee response:\n- Agreed actions:\n- Next review:",
  followup_email:
    "Subject: Follow-up and agreed actions\n\nHi [Name],\n\nThank you for your time. This note summarizes agreed actions and review points from our meeting.",
  improvement_plan:
    "- Objective:\n- Measurement:\n- Support available:\n- Review date:\n- Owner:",
  checklist:
    "- [ ] Confirm summary quality\n- [ ] Validate timeline chronology\n- [ ] Check policy step alignment\n- [ ] Send follow-up communication\n- [ ] Set next checkpoint"
};

function buildRiskFlags(summary: string, timeline: TimelineDraft[]): RiskFlagItem[] {
  const text = summary.toLowerCase();
  const flags: RiskFlagItem[] = [];

  if (
    text.includes("discrimination") ||
    text.includes("harassment") ||
    text.includes("pregnancy") ||
    text.includes("whistleblow") ||
    text.includes("terminate") ||
    text.includes("dismiss")
  ) {
    flags.push({
      id: "high-1",
      code: "HIGH_RISK_KEYWORDS",
      label: "Potential high-risk employment signal",
      severity: "high",
      guidance: "Use neutral language and escalate to HR/legal review before formal decisions."
    });
  }

  if (timeline.length === 0) {
    flags.push({
      id: "med-1",
      code: "MISSING_TIMELINE",
      label: "Timeline evidence missing",
      severity: "med",
      guidance: "Add dated events before finalizing outputs for consistency."
    });
  }

  if (summary.trim().split(/\s+/).length < 30) {
    flags.push({
      id: "low-1",
      code: "GENERIC_SUMMARY",
      label: "Summary may be too brief",
      severity: "low",
      guidance: "Add examples and context to improve draft quality."
    });
  }

  if (!flags.length) {
    flags.push({
      id: "low-2",
      code: "NO_SIGNAL",
      label: "No material risk signal detected",
      severity: "low",
      guidance: "Proceed with standard drafting and policy reminders."
    });
  }

  return flags;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toTitleCase(value: string): string {
  if (!value) {
    return value;
  }
  return `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function statusModeLabel(mode: string): "Standard" | "Safety" {
  return mode.toLowerCase() === "safety" ? "Safety" : "Standard";
}

function toFieldLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusFromApi(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "needsreview" || normalized === "needs review") {
    return "Needs Review";
  }
  if (normalized === "ready") {
    return "Ready";
  }
  return "Draft";
}

export function NewCaseWizard({
  initialScenario,
  initialTemplateId
}: {
  initialScenario?: string;
  initialTemplateId?: string;
}): JSX.Element {
  const scenarioInitial = toUiScenario(initialScenario || "") || "performance";

  const [step, setStep] = useState(1);
  const [scenario, setScenario] = useState<ScenarioUI>(scenarioInitial);
  const [intake, setIntake] = useState({
    employee: "",
    role: "",
    concern: "",
    priorActions: "",
    desiredOutcome: ""
  });
  const [summary, setSummary] = useState("");
  const [timeline, setTimeline] = useState<TimelineDraft[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState({ date: "", title: "", note: "" });

  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  const [templateValues, setTemplateValues] = useState<Record<string, Record<string, string>>>({});

  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [tone, setTone] = useState<"neutral" | "supportive" | "firm">("neutral");
  const [length, setLength] = useState<"short" | "standard" | "detailed">("standard");

  const [outputs, setOutputs] = useState<OutputPack>(baseOutputs);
  const [versions, setVersions] = useState<VersionEntry[]>([]);

  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialTemplateId) {
      return;
    }

    let mounted = true;

    const loadTemplate = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/templates/${initialTemplateId}`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          template?: {
            id: string;
            scenario: string;
            scenarioUi?: string | null;
            name: string;
            version: string;
            body: string;
          };
        };

        if (!payload.template || !mounted) {
          return;
        }

        const template: SelectedTemplate = {
          id: payload.template.id,
          scenario: payload.template.scenario,
          scenarioUi: payload.template.scenarioUi
            ? toUiScenario(payload.template.scenarioUi)
            : toUiScenario(payload.template.scenario),
          name: payload.template.name,
          version: payload.template.version || "1.0",
          body: payload.template.body
        };

        setSelectedTemplates((previous) => {
          if (previous.some((item) => item.id === template.id)) {
            return previous;
          }
          return [...previous, template];
        });

        if (template.scenarioUi) {
          setScenario(template.scenarioUi);
        }

        setTemplateValues((previous) => ({
          ...previous,
          [template.id]: {
            template_version: template.version,
            prepared_date: todayIso(),
            ...(previous[template.id] || {})
          }
        }));
      } catch {
        // Ignore fetch failures for query-template preload and keep wizard usable.
      }
    };

    void loadTemplate();

    return () => {
      mounted = false;
    };
  }, [initialTemplateId]);

  const generatedSummary =
    summary ||
    `${scenarioMeta[scenario].label} case involving ${intake.employee || "[Employee]"}. Key concern: ${
      intake.concern || "[add concern details]"
    }. Prior actions: ${intake.priorActions || "[add actions]"}. Desired outcome: ${
      intake.desiredOutcome || "[add expected result]"
    }.`;

  const renderedTemplates = useMemo(() => {
    return selectedTemplates.map((template) => {
      const currentValues = templateValues[template.id] || {};
      const withDefaults: Record<string, string> = {
        ...currentValues,
        template_version: template.version,
        prepared_date: currentValues.prepared_date || todayIso()
      };

      return {
        ...template,
        values: withDefaults,
        rendered: renderTemplate(template.body, withDefaults)
      };
    });
  }, [selectedTemplates, templateValues]);

  const riskFlags = useMemo(() => {
    const combinedSummary = [generatedSummary, ...renderedTemplates.map((entry) => entry.rendered)].join("\n\n");
    return buildRiskFlags(combinedSummary, timeline);
  }, [generatedSummary, renderedTemplates, timeline]);

  const highRisk = riskFlags.some((item) => item.severity === "high");

  const goNext = (): void => {
    if (step === 5 && highRisk && !safetyAccepted) {
      return;
    }
    setStep((valueState) => Math.min(6, valueState + 1));
  };

  const goBack = (): void => setStep((valueState) => Math.max(1, valueState - 1));

  const addTimelineEvent = (): void => {
    if (!eventDraft.date || !eventDraft.title || !eventDraft.note) {
      return;
    }

    setTimeline((items) => [
      ...items,
      {
        id: String(Date.now()),
        date: eventDraft.date,
        title: eventDraft.title,
        note: eventDraft.note
      }
    ]);
    setEventDraft({ date: "", title: "", note: "" });
    setEventModalOpen(false);
  };

  const removeTemplate = (templateId: string): void => {
    setSelectedTemplates((previous) => previous.filter((template) => template.id !== templateId));
    setTemplateValues((previous) => {
      const next = { ...previous };
      delete next[templateId];
      return next;
    });
  };

  const setTemplateFieldValue = (templateId: string, key: string, value: string): void => {
    setTemplateValues((previous) => ({
      ...previous,
      [templateId]: {
        ...(previous[templateId] || {}),
        [key]: value
      }
    }));
  };

  const buildCaseSummaryForSave = (): string => {
    if (!renderedTemplates.length) {
      return generatedSummary;
    }

    const templateSection = renderedTemplates
      .map((entry) => `Template: ${entry.name} (v${entry.version})\n\n${entry.rendered}`)
      .join("\n\n---\n\n");

    return `${generatedSummary}\n\n---\n\nSelected Template Output\n\n${templateSection}`;
  };

  const ensureCaseRecord = async (): Promise<string | null> => {
    const titleRoot = intake.employee?.trim() ? `${intake.employee.trim()}` : "Untitled";
    const caseTitle = `${scenarioMeta[scenario].label} case - ${titleRoot}`;

    const body: Record<string, unknown> = {
      title: caseTitle,
      scenario,
      status: "Draft",
      summary: buildCaseSummaryForSave(),
      tonePreference: tone,
      lengthPreference: length,
      appliedTemplateIds: renderedTemplates.map((entry) => entry.id),
      appliedTemplateSnapshot: renderedTemplates.map((entry) => ({
        id: entry.id,
        name: entry.name,
        version: entry.version,
        body: entry.body
      })),
      appliedTemplateValues: renderedTemplates.reduce<Record<string, Record<string, string>>>((acc, entry) => {
        acc[entry.id] = entry.values;
        return acc;
      }, {})
    };

    if (createdCaseId) {
      const updateResponse = await fetch(`/api/cases/${createdCaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!updateResponse.ok) {
        throw new Error("Could not update case record.");
      }
      return createdCaseId;
    }

    const createResponse = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!createResponse.ok) {
      throw new Error("Could not save case record.");
    }

    const createPayload = (await createResponse.json()) as {
      case?: {
        id: string;
      };
    };

    if (!createPayload.case?.id) {
      throw new Error("Case creation response was incomplete.");
    }

    const caseId = createPayload.case.id;

    for (const event of timeline) {
      await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: event.date,
          note: `${event.title}: ${event.note}`
        })
      });
    }

    setCreatedCaseId(caseId);
    return caseId;
  };

  const saveDraft = async (): Promise<void> => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSavingDraft(true);

    try {
      const caseId = await ensureCaseRecord();
      if (!caseId) {
        throw new Error("Case record was not created.");
      }

      setSuccessMessage("Draft case saved.");
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Unable to save draft case.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const regenerateOutputs = async (): Promise<void> => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsGenerating(true);

    try {
      const caseId = await ensureCaseRecord();
      if (!caseId) {
        throw new Error("Case record was not created.");
      }

      const generateResponse = await fetch(`/api/cases/${caseId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tonePreference: tone,
          lengthPreference: length
        })
      });

      if (!generateResponse.ok) {
        throw new Error("Could not generate outputs.");
      }

      const payload = (await generateResponse.json()) as {
        outputs?: OutputPack;
        version?: {
          id: string;
          createdAt: string;
          mode: string;
        };
        riskFlags?: Array<{
          code: string;
          label: string;
          severity: "low" | "med" | "high";
          guidance: string;
        }>;
        highRisk?: boolean;
      };

      if (payload.outputs) {
        setOutputs(payload.outputs);
      }

      const version = payload.version;
      if (version) {
        setVersions((previous) => [
          {
            id: version.id,
            time: formatDateTime(version.createdAt),
            mode: statusModeLabel(version.mode),
            note: `Generated (${toTitleCase(tone)} • ${toTitleCase(length)})`
          },
          ...previous
        ]);
      }

      if (payload.highRisk === true && !safetyAccepted) {
        setSafetyAccepted(true);
      }

      setSuccessMessage("Outputs generated and version saved.");
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : "Unable to generate outputs.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />

      {step === 1 ? (
        <Card>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Choose scenario</h2>
          <p className="mt-1 text-sm text-muted">Select a path to preload prompts and template packs.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenarioList.map((entry) => {
              const Icon = scenarioIcons[entry];
              const active = scenario === entry;
              return (
                <button
                  key={entry}
                  onClick={() => setScenario(entry)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-[var(--color-surface)] p-2 text-[var(--color-text)] shadow-soft">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Chip variant={active ? "selected" : "default"}>{active ? "Selected" : "Select"}</Chip>
                  </div>
                  <p className="mt-3 text-base font-semibold text-[var(--color-text)]">{scenarioMeta[entry].label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{scenarioMeta[entry].description}</p>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-text)]">Employee name</span>
            <input
              value={intake.employee}
              onChange={(event) => setIntake((data) => ({ ...data, employee: event.target.value }))}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
              placeholder="Jordan Patel"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-text)]">Role</span>
            <input
              value={intake.role}
              onChange={(event) => setIntake((data) => ({ ...data, role: event.target.value }))}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
              placeholder="Customer Success Associate"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">What is the main concern?</span>
            <textarea
              value={intake.concern}
              onChange={(event) => setIntake((data) => ({ ...data, concern: event.target.value }))}
              className="h-28 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              placeholder="Summarize issue with objective facts"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">Prior actions taken</span>
            <textarea
              value={intake.priorActions}
              onChange={(event) => setIntake((data) => ({ ...data, priorActions: event.target.value }))}
              className="h-24 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              placeholder="Check-ins, coaching, informal actions"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">Desired outcome</span>
            <textarea
              value={intake.desiredOutcome}
              onChange={(event) => setIntake((data) => ({ ...data, desiredOutcome: event.target.value }))}
              className="h-24 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              placeholder="Expected change and review window"
            />
          </label>
        </Card>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Case summary</h2>
            <p className="mt-1 text-sm text-muted">Edit this draft summary before quality checks and output generation.</p>
            <textarea
              value={generatedSummary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-4 h-72 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6"
            />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Applied template(s)</h3>
                <p className="text-sm text-muted">
                  Add templates from the library, fill required fields, and review rendered output.
                </p>
              </div>
              <Link href="/templates" className="inline-flex">
                <Button variant="secondary" size="sm">
                  Browse library
                </Button>
              </Link>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-sm text-[var(--color-text)]">
              {TEMPLATE_REVIEW_BANNER}
            </div>

            {selectedTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-muted">
                No template applied yet. Choose a template from the library to preload this case.
              </div>
            ) : (
              <div className="space-y-4">
                {renderedTemplates.map((template) => {
                  const placeholders = extractPlaceholders(template.body);
                  const config = getTemplateFieldConfig(template.name);
                  const requiredKeys = config.requiredFields.filter((key) => placeholders.includes(key));
                  const optionalKeys = config.optionalFields.filter(
                    (key) =>
                      placeholders.includes(key) &&
                      !requiredKeys.includes(key) &&
                      key !== "template_version"
                  );
                  const remainingKeys = placeholders.filter(
                    (key) =>
                      !requiredKeys.includes(key) &&
                      !optionalKeys.includes(key) &&
                      key !== "template_version"
                  );
                  const allOptional = [...optionalKeys, ...remainingKeys];
                  const validation = validateTemplateValues(template.name, template.values);

                  return (
                    <div key={template.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {template.name} <span className="text-xs text-muted">v{template.version}</span>
                          </p>
                          <p className="text-xs text-muted">
                            {template.scenarioUi ? scenarioMeta[template.scenarioUi].label : template.scenario}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeTemplate(template.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                          {requiredKeys.map((key) => {
                            const definition = commonPlaceholderDictionary[key];
                            const fieldType = definition?.type || "text";
                            const value = template.values[key] || "";
                            return (
                              <label key={key} className="block space-y-1 text-xs">
                                <span className="font-semibold text-[var(--color-text)]">
                                  {definition?.label || toFieldLabel(key)}
                                </span>
                                {fieldType === "longtext" ? (
                                  <textarea
                                    value={value}
                                    onChange={(event) =>
                                      setTemplateFieldValue(template.id, key, event.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                                    placeholder={definition?.example || "Enter value"}
                                  />
                                ) : (
                                  <input
                                    value={value}
                                    onChange={(event) =>
                                      setTemplateFieldValue(template.id, key, event.target.value)
                                    }
                                    type={fieldType === "date" ? "date" : "text"}
                                    className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                                    placeholder={definition?.example || "Enter value"}
                                  />
                                )}
                              </label>
                            );
                          })}

                          {allOptional.length > 0 ? (
                            <details className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
                                Optional fields
                              </summary>
                              <div className="mt-3 space-y-3">
                                {allOptional.map((key) => {
                                  const definition = commonPlaceholderDictionary[key];
                                  const fieldType = definition?.type || "text";
                                  const value = template.values[key] || "";
                                  return (
                                    <label key={key} className="block space-y-1 text-xs">
                                      <span className="font-semibold text-[var(--color-text)]">
                                        {definition?.label || toFieldLabel(key)}
                                      </span>
                                      {fieldType === "longtext" ? (
                                        <textarea
                                          value={value}
                                          onChange={(event) =>
                                            setTemplateFieldValue(template.id, key, event.target.value)
                                          }
                                          rows={3}
                                          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                                          placeholder={definition?.example || "Enter value"}
                                        />
                                      ) : (
                                        <input
                                          value={value}
                                          onChange={(event) =>
                                            setTemplateFieldValue(template.id, key, event.target.value)
                                          }
                                          type={fieldType === "date" ? "date" : "text"}
                                          className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                                          placeholder={definition?.example || "Enter value"}
                                        />
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </details>
                          ) : null}

                          {validation.missingRequired.length > 0 ? (
                            <p className="rounded-[var(--radius-md)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
                              Missing required: {validation.missingRequired.map(toFieldLabel).join(", ")}
                            </p>
                          ) : null}
                        </div>

                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Selected template</p>
                          <SafeMarkdown markdown={template.rendered} className="space-y-3 text-sm leading-7 text-[var(--color-text)]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {step === 4 ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text)]">Timeline</h2>
              <p className="text-sm text-muted">Add dated events to support chronology.</p>
            </div>
            <Button variant="secondary" onClick={() => setEventModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {timeline.length ? (
              timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{entry.date}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{entry.title}</p>
                  <p className="mt-1 text-sm text-muted">{entry.note}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-muted">
                No timeline events yet.
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {step === 5 ? (
        <Card className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Risk flags</h2>
            <p className="text-sm text-muted">Review severity signals before generating outputs.</p>
          </div>

          <RiskFlagList flags={riskFlags} />

          <div className="rounded-2xl border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[var(--color-surface)] p-1.5 text-[var(--color-text)]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Safety Gate</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text)]">
                  This tool helps with draft quality and process structure. It does not provide legal advice.
                </p>
              </div>
            </div>

            {highRisk ? (
              <label className="mt-3 flex items-start gap-2 text-sm text-[var(--color-text)]">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--color-warning)]"
                  checked={safetyAccepted}
                  onChange={(event) => setSafetyAccepted(event.target.checked)}
                />
                <span>I acknowledge the safety gate and will escalate to HR/legal review before formal outcomes.</span>
              </label>
            ) : null}
          </div>
        </Card>
      ) : null}

      {step === 6 ? (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Outputs Hub</h2>
                <p className="text-sm text-muted">Refine tone, length, and draft quality before sharing.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(["neutral", "supportive", "firm"] as const).map((item) => (
                  <ChipButton key={item} onClick={() => setTone(item)} variant={tone === item ? "selected" : "default"}>
                    {toTitleCase(item)}
                  </ChipButton>
                ))}
                {(["short", "standard", "detailed"] as const).map((item) => (
                  <ChipButton
                    key={item}
                    onClick={() => setLength(item)}
                    variant={length === item ? "selected" : "default"}
                  >
                    {toTitleCase(item)}
                  </ChipButton>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void saveDraft()} disabled={isSavingDraft || isGenerating}>
                {isSavingDraft ? "Saving..." : "Save Draft Case"}
              </Button>
              <Button onClick={() => void regenerateOutputs()} disabled={isGenerating || isSavingDraft}>
                {isGenerating ? "Generating..." : "Generate Outputs"}
              </Button>
              {createdCaseId ? (
                <Link href={`/cases/${createdCaseId}`} className="inline-flex">
                  <Button variant="ghost">Open Case Detail</Button>
                </Link>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-text)]">
                {errorMessage}
              </p>
            ) : null}
            {successMessage ? (
              <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-success-border)] bg-[var(--color-success-soft)] px-3 py-2 text-sm text-[var(--color-text)]">
                {successMessage}
              </p>
            ) : null}
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {outputLabels.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    <OutputCard
                      title={item.label}
                      value={outputs[item.key]}
                      onChange={(value) => setOutputs((current) => ({ ...current, [item.key]: value }))}
                    />
                  </div>
                );
              })}

              <Card>
                <h3 className="text-base font-semibold text-[var(--color-text)]">Version history</h3>
                <div className="mt-3 space-y-2">
                  {versions.length > 0 ? (
                    versions.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{entry.time}</p>
                          <p className="text-xs text-muted">{entry.note}</p>
                        </div>
                        <Chip variant={entry.mode === "Safety" ? "warning" : "default"}>{entry.mode}</Chip>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-muted">
                      No generations yet.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card>
                <h3 className="text-base font-semibold text-[var(--color-text)]">Quality Checks</h3>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
                  {qualityChecksMock.map((item) => (
                    <li key={item} className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-2xl bg-[var(--color-warning-soft)] p-3 text-xs text-[var(--color-text)]">
                  <p className="font-semibold">HR Review Recommended</p>
                  <p className="mt-1">
                    {highRisk
                      ? "High-risk signal detected. Keep language neutral and escalate review."
                      : "No high-risk signal detected in current draft context."}
                  </p>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={goBack} disabled={step === 1 || isGenerating || isSavingDraft}>
          Back
        </Button>
        {step < 6 ? (
          <Button onClick={goNext} disabled={step === 5 && highRisk && !safetyAccepted}>
            Continue
          </Button>
        ) : (
          <span className="text-xs text-muted">
            {createdCaseId ? `Case saved: ${statusFromApi("Draft")}` : "Save draft or generate outputs to create case."}
          </span>
        )}
      </div>

      {eventModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Add timeline event</h3>
              <button
                className="rounded-full p-2 hover:bg-[var(--color-surface-2)]"
                onClick={() => setEventModalOpen(false)}
              >
                <X className="h-4 w-4 text-[var(--color-text)]" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-[var(--color-text)]">Date</span>
                <input
                  type="date"
                  value={eventDraft.date}
                  onChange={(event) => setEventDraft((valueState) => ({ ...valueState, date: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-[var(--color-text)]">Title</span>
                <input
                  value={eventDraft.title}
                  onChange={(event) => setEventDraft((valueState) => ({ ...valueState, title: event.target.value }))}
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3"
                  placeholder="Coaching session"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-[var(--color-text)]">Note</span>
                <textarea
                  value={eventDraft.note}
                  onChange={(event) => setEventDraft((valueState) => ({ ...valueState, note: event.target.value }))}
                  className="h-28 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEventModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTimelineEvent}>
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
