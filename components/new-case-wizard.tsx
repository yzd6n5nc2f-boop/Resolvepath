"use client";

import { useMemo, useState } from "react";
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
  Users,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip, ChipButton } from "@/components/ui/Chip";
import { OutputCard } from "@/components/ui/OutputCard";
import { RiskFlagList } from "@/components/ui/RiskFlagList";
import { Stepper } from "@/components/ui/Stepper";
import {
  qualityChecksMock,
  scenarioList,
  scenarioMeta,
  type OutputPack,
  type RiskFlag,
  type ScenarioKey,
  type VersionEntry
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TimelineDraft {
  id: string;
  date: string;
  title: string;
  note: string;
}

const steps = ["Scenario", "Intake", "Summary", "Timeline", "Risk", "Outputs"];

const scenarioIcons = {
  performance: Gauge,
  conduct: Library,
  sickness_absence: HeartPulse,
  grievance: Scale,
  conflict: Users,
  flexible_working: CalendarPlus2
};

const outputLabels: Array<{ key: keyof OutputPack; label: string; icon: typeof FileText }> = [
  { key: "script", label: "Conversation Script", icon: MessageSquareQuote },
  { key: "inviteEmail", label: "Meeting Invite Email", icon: Mail },
  { key: "notesTemplate", label: "Meeting Notes Template", icon: NotebookPen },
  { key: "followupEmail", label: "Follow-up Email", icon: Mail },
  { key: "improvementPlan", label: "Improvement Plan", icon: Sparkles },
  { key: "checklist", label: "Checklist", icon: ListChecks }
];

const baseOutputs: OutputPack = {
  script:
    "Opening\n- Thank the colleague for attending and set purpose.\n\nFacts\n- Share observed facts and timeline references.\n\nImpact\n- Explain team or service impact in neutral language.\n\nQuestions\n- Ask for perspective and support needs.\n\nExpectations\n- Confirm expected standards and review dates.\n\nClose\n- Summarize actions and document in writing.",
  inviteEmail:
    "Subject: Case discussion meeting\n\nHi [Name],\n\nI would like to schedule time to review the case details, discuss context, and agree practical next steps.\n\nKind regards,\n[Manager]",
  notesTemplate:
    "Meeting Notes\n- Date/Time:\n- Participants:\n- Key facts reviewed:\n- Employee response:\n- Agreed actions:\n- Next review:",
  followupEmail:
    "Subject: Follow-up and agreed actions\n\nHi [Name],\n\nThank you for your time. This note summarizes agreed actions and review points from our meeting.",
  improvementPlan:
    "- Objective:\n- Measurement:\n- Support available:\n- Review date:\n- Owner:",
  checklist:
    "- [ ] Confirm summary quality\n- [ ] Validate timeline chronology\n- [ ] Check policy step alignment\n- [ ] Send follow-up communication\n- [ ] Set next checkpoint"
};

function buildRiskFlags(summary: string, timeline: TimelineDraft[]): RiskFlag[] {
  const text = summary.toLowerCase();
  const flags: RiskFlag[] = [];

  if (text.includes("discrimination") || text.includes("harassment") || text.includes("pregnancy")) {
    flags.push({
      id: "high-1",
      label: "Potential protected characteristic sensitivity",
      severity: "high",
      guidance: "Switch to neutral language and route to HR review before formal decisions."
    });
  }

  if (timeline.length === 0) {
    flags.push({
      id: "med-1",
      label: "Timeline evidence missing",
      severity: "med",
      guidance: "Add dated events before finalizing outputs for consistency."
    });
  }

  if (summary.trim().split(/\s+/).length < 30) {
    flags.push({
      id: "low-1",
      label: "Summary may be too brief",
      severity: "low",
      guidance: "Add examples and context to improve conversation quality."
    });
  }

  if (!flags.length) {
    flags.push({
      id: "low-2",
      label: "No material risk signal detected",
      severity: "low",
      guidance: "Proceed with standard drafting and policy reminders."
    });
  }

  return flags;
}

export function NewCaseWizard({ initialScenario }: { initialScenario?: string }): JSX.Element {
  const scenarioInitial = scenarioList.includes(initialScenario as ScenarioKey)
    ? (initialScenario as ScenarioKey)
    : "performance";

  const [step, setStep] = useState(1);
  const [scenario, setScenario] = useState<ScenarioKey>(scenarioInitial);
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
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [tone, setTone] = useState<"Neutral" | "Supportive" | "Firm">("Neutral");
  const [length, setLength] = useState<"Short" | "Standard" | "Detailed">("Standard");
  const [outputs, setOutputs] = useState<OutputPack>(baseOutputs);
  const [versions, setVersions] = useState<VersionEntry[]>([
    { id: "v1", time: "02 Mar 2026, 09:40", mode: "Standard", note: "Initial draft pack" }
  ]);

  const generatedSummary =
    summary ||
    `${scenarioMeta[scenario].label} case involving ${intake.employee || "[Employee]"}. Key concern: ${
      intake.concern || "[add concern details]"
    }. Prior actions: ${intake.priorActions || "[add actions]"}. Desired outcome: ${
      intake.desiredOutcome || "[add expected result]"
    }.`;

  const riskFlags = useMemo(() => buildRiskFlags(generatedSummary, timeline), [generatedSummary, timeline]);
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

  const regenerateOutputs = (): void => {
    setVersions((items) => [
      {
        id: String(Date.now()),
        time: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        mode: highRisk ? "Safety" : "Standard",
        note: `Regenerated (${tone} • ${length})`
      },
      ...items
    ]);
  };

  return (
    <div className="space-y-6">
      <Stepper steps={steps} currentStep={step} />

      {step === 1 ? (
        <Card>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Choose scenario</h2>
          <p className="mt-1 text-sm text-muted">Select a path to preload prompts and templates.</p>
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
                      : "border-[var(--color-border)] bg-white hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-white p-2 text-[var(--color-text)] shadow-soft">
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
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
              placeholder="Jordan Patel"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-[var(--color-text)]">Role</span>
            <input
              value={intake.role}
              onChange={(event) => setIntake((data) => ({ ...data, role: event.target.value }))}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
              placeholder="Customer Success Associate"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">What is the main concern?</span>
            <textarea
              value={intake.concern}
              onChange={(event) => setIntake((data) => ({ ...data, concern: event.target.value }))}
              className="h-28 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2"
              placeholder="Summarize issue with objective facts"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">Prior actions taken</span>
            <textarea
              value={intake.priorActions}
              onChange={(event) => setIntake((data) => ({ ...data, priorActions: event.target.value }))}
              className="h-24 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2"
              placeholder="Check-ins, coaching, informal actions"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-medium text-[var(--color-text)]">Desired outcome</span>
            <textarea
              value={intake.desiredOutcome}
              onChange={(event) => setIntake((data) => ({ ...data, desiredOutcome: event.target.value }))}
              className="h-24 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2"
              placeholder="Expected change and review window"
            />
          </label>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Case summary</h2>
          <p className="mt-1 text-sm text-muted">Edit this draft summary before quality checks.</p>
          <textarea
            value={generatedSummary}
            onChange={(event) => setSummary(event.target.value)}
            className="mt-4 h-80 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6"
          />
        </Card>
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
                <div key={entry.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
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
              <div className="rounded-full bg-white p-1.5 text-[var(--color-text)]">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">Safety Gate</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text)]">
                  High-risk scenarios should remain neutral and be reviewed by HR/legal before irreversible action.
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
                <span>I acknowledge the safety gate and will escalate review before formal outcomes.</span>
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
                {(["Neutral", "Supportive", "Firm"] as const).map((item) => (
                  <ChipButton
                    key={item}
                    onClick={() => setTone(item)}
                    variant={tone === item ? "selected" : "default"}
                  >
                    {item}
                  </ChipButton>
                ))}
                {(["Short", "Standard", "Detailed"] as const).map((item) => (
                  <ChipButton
                    key={item}
                    onClick={() => setLength(item)}
                    variant={length === item ? "selected" : "default"}
                  >
                    {item}
                  </ChipButton>
                ))}
                <Button onClick={regenerateOutputs}>Regenerate</Button>
              </div>
            </div>
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
                  {versions.map((entry) => (
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
                  ))}
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
                  <p className="mt-1">Apply safety mode for any high-risk flags before communication.</p>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={goBack} disabled={step === 1}>
          Back
        </Button>
        <Button onClick={goNext} disabled={step === 6 || (step === 5 && highRisk && !safetyAccepted)}>
          Continue
        </Button>
      </div>

      {eventModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Add timeline event</h3>
              <button className="rounded-full p-2 hover:bg-[var(--color-surface-2)]" onClick={() => setEventModalOpen(false)}>
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
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-[var(--color-text)]">Title</span>
                <input
                  value={eventDraft.title}
                  onChange={(event) =>
                    setEventDraft((valueState) => ({ ...valueState, title: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3"
                  placeholder="Coaching session"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-[var(--color-text)]">Note</span>
                <textarea
                  value={eventDraft.note}
                  onChange={(event) =>
                    setEventDraft((valueState) => ({ ...valueState, note: event.target.value }))
                  }
                  className="h-28 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2"
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
