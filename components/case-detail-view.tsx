"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock3, CopyCheck, FileClock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { OutputCard } from "@/components/ui/OutputCard";
import { RiskFlagList } from "@/components/ui/RiskFlagList";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
import { qualityChecksMock } from "@/lib/mock-data";
import { scenarioMeta, type ScenarioUI } from "@/lib/scenarios";
import { TEMPLATE_REVIEW_BANNER } from "@/lib/template-placeholders";
import { formatDateTime } from "@/lib/utils";

const tabs = ["Summary", "Timeline", "Outputs", "Versions"] as const;

type TabKey = (typeof tabs)[number];

interface OutputPack {
  script: string;
  invite_email: string;
  meeting_notes: string;
  followup_email: string;
  improvement_plan: string;
  checklist: string;
}

interface CaseDetailData {
  id: string;
  title: string;
  scenarioUi: ScenarioUI | null;
  status: string;
  summary: string;
  updatedAt: string;
  timelineEvents: Array<{
    id: string;
    date: string;
    note: string;
    createdAt: string;
  }>;
  outputVersions: Array<{
    id: string;
    createdAt: string;
    mode: string;
    outputs: OutputPack | null;
    riskFlags: Array<{
      code?: string;
      label: string;
      severity: "low" | "med" | "high";
      guidance: string;
    }>;
  }>;
  templatesUsed: Array<{
    id: string;
    name: string;
    version: string;
    body: string;
    values: Record<string, string>;
    rendered: string;
  }>;
}

const outputLabels: Array<{ key: keyof OutputPack; label: string }> = [
  { key: "script", label: "Conversation Script" },
  { key: "invite_email", label: "Meeting Invite Email" },
  { key: "meeting_notes", label: "Meeting Notes Template" },
  { key: "followup_email", label: "Follow-up Email" },
  { key: "improvement_plan", label: "Improvement Plan" },
  { key: "checklist", label: "Checklist" }
];

function statusChipVariant(status: string): "default" | "success" | "warning" {
  const normalized = status.toLowerCase();
  if (normalized === "ready") {
    return "success";
  }
  if (normalized === "needsreview" || normalized === "needs review") {
    return "warning";
  }
  return "default";
}

function statusLabel(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "needsreview" || normalized === "needs review") {
    return "Needs Review";
  }
  if (normalized === "ready") {
    return "Ready";
  }
  return "Draft";
}

function versionModeLabel(mode: string): "Standard" | "Safety" {
  return mode.toLowerCase() === "safety" ? "Safety" : "Standard";
}

const emptyOutputs: OutputPack = {
  script: "",
  invite_email: "",
  meeting_notes: "",
  followup_email: "",
  improvement_plan: "",
  checklist: ""
};

export function CaseDetailView({ caseItem }: { caseItem: CaseDetailData }): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");

  const latestVersion = caseItem.outputVersions[0] || null;
  const [outputs, setOutputs] = useState<OutputPack>(latestVersion?.outputs || emptyOutputs);

  const highRisk = useMemo(
    () =>
      (latestVersion?.riskFlags || []).some((entry) => {
        return entry.severity === "high";
      }),
    [latestVersion]
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{caseItem.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {caseItem.scenarioUi ? scenarioMeta[caseItem.scenarioUi].label : "Scenario"} • Last updated{" "}
              {formatDateTime(caseItem.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip variant={statusChipVariant(caseItem.status)}>{statusLabel(caseItem.status)}</Chip>
            <Link href={`/cases/${caseItem.id}/print`}>
              <Button variant="secondary">Print</Button>
            </Link>
            <Button variant="secondary">Export</Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      {activeTab === "Summary" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Card>
              <h3 className="text-base font-semibold text-[var(--color-text)]">Summary</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">{caseItem.summary}</p>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-[var(--color-text)]">Templates used</h3>

              <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
                {TEMPLATE_REVIEW_BANNER}
              </div>

              {caseItem.templatesUsed.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-muted">
                  No templates were applied to this case.
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {caseItem.templatesUsed.map((template) => (
                    <div key={template.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {template.name} <span className="text-xs text-muted">v{template.version}</span>
                      </p>
                      <div className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                        <SafeMarkdown markdown={template.rendered} className="space-y-3 text-sm leading-7 text-[var(--color-text)]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Risk signals</h3>
            <div className="mt-3">
              {(latestVersion?.riskFlags || []).length > 0 ? (
                <RiskFlagList flags={latestVersion?.riskFlags || []} />
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-muted">
                  No risk flags stored for this case version.
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "Timeline" ? (
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Timeline</h3>
          <div className="mt-4 space-y-3">
            {caseItem.timelineEvents.length > 0 ? (
              caseItem.timelineEvents.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{entry.date}</p>
                  <p className="mt-1 text-sm text-[var(--color-text)]">{entry.note}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-muted">
                No timeline events are recorded.
              </div>
            )}
          </div>
        </Card>
      ) : null}

      {activeTab === "Outputs" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {latestVersion?.outputs ? (
              outputLabels.map((item) => (
                <OutputCard
                  key={item.key}
                  title={item.label}
                  value={outputs[item.key]}
                  onChange={(value) => setOutputs((current) => ({ ...current, [item.key]: value }))}
                />
              ))
            ) : (
              <Card>
                <p className="text-sm text-muted">No generated outputs yet for this case.</p>
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card>
              <h3 className="text-base font-semibold text-[var(--color-text)]">Quality Checks</h3>
              <div className="mt-3 space-y-2">
                {qualityChecksMock.map((item) => (
                  <div key={item} className="rounded-xl bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-[var(--color-warning-soft)] p-3 text-xs text-[var(--color-text)]">
                <p className="font-semibold">HR Review Recommended</p>
                <p className="mt-1">
                  {highRisk ? "Safety mode is active for this case." : "No high-risk flag, standard mode available."}
                </p>
              </div>
            </Card>
          </aside>
        </div>
      ) : null}

      {activeTab === "Versions" ? (
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Version timeline</h3>
          <div className="mt-4 space-y-3">
            {caseItem.outputVersions.length > 0 ? (
              caseItem.outputVersions.map((version) => (
                <div
                  key={version.id}
                  className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
                >
                  <div className="rounded-full bg-[var(--color-surface)] p-2 text-[var(--color-text)] shadow-soft">
                    <FileClock className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {versionModeLabel(version.mode)} generation
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(version.createdAt)}</p>
                  </div>

                  <Chip variant={versionModeLabel(version.mode) === "Safety" ? "warning" : "default"}>
                    {versionModeLabel(version.mode)}
                  </Chip>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-sm text-muted">
                No versions saved yet.
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <Clock3 className="h-4 w-4" />
                <p className="text-sm font-semibold">Turnaround</p>
              </div>
              <p className="mt-1 text-xs text-muted">Versions preserve timestamps for process traceability.</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <CopyCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Audit trail</p>
              </div>
              <p className="mt-1 text-xs text-muted">Each generation is retained with risk flags and mode.</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Safety mode</p>
              </div>
              <p className="mt-1 text-xs text-muted">High-risk drafts keep neutral escalation language.</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
