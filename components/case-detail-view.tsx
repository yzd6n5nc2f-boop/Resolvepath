"use client";

import { useMemo, useState } from "react";
import { Clock3, CopyCheck, FileClock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { OutputCard } from "@/components/ui/OutputCard";
import { RiskFlagList } from "@/components/ui/RiskFlagList";
import { qualityChecksMock, scenarioMeta, type CaseRecord, type OutputPack } from "@/lib/mock-data";

const tabs = ["Summary", "Timeline", "Outputs", "Versions"] as const;

type TabKey = (typeof tabs)[number];

const outputLabels: Array<{ key: keyof OutputPack; label: string }> = [
  { key: "script", label: "Conversation Script" },
  { key: "inviteEmail", label: "Meeting Invite Email" },
  { key: "notesTemplate", label: "Meeting Notes Template" },
  { key: "followupEmail", label: "Follow-up Email" },
  { key: "improvementPlan", label: "Improvement Plan" },
  { key: "checklist", label: "Checklist" }
];

export function CaseDetailView({ caseItem }: { caseItem: CaseRecord }): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabKey>("Summary");
  const [outputs, setOutputs] = useState<OutputPack>(caseItem.outputs);
  const highRisk = useMemo(
    () => caseItem.riskFlags.some((entry) => entry.severity === "high"),
    [caseItem.riskFlags]
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{caseItem.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {scenarioMeta[caseItem.scenario].label} • Last updated {caseItem.lastUpdated}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip variant={caseItem.status === "Needs Review" ? "warning" : caseItem.status === "Ready" ? "success" : "default"}>
              {caseItem.status}
            </Chip>
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
          <Card>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Summary</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">{caseItem.summary}</p>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Risk signals</h3>
            <div className="mt-3">
              <RiskFlagList flags={caseItem.riskFlags} />
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "Timeline" ? (
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Timeline</h3>
          <div className="mt-4 space-y-3">
            {caseItem.timeline.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{entry.date}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{entry.title}</p>
                <p className="mt-1 text-sm text-muted">{entry.note}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {activeTab === "Outputs" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {outputLabels.map((item) => (
              <OutputCard
                key={item.key}
                title={item.label}
                value={outputs[item.key]}
                onChange={(value) => setOutputs((current) => ({ ...current, [item.key]: value }))}
              />
            ))}
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
                <p className="mt-1">{highRisk ? "Safety mode active for this case." : "No high-risk flag, standard mode available."}</p>
              </div>
            </Card>
          </aside>
        </div>
      ) : null}

      {activeTab === "Versions" ? (
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Version timeline</h3>
          <div className="mt-4 space-y-3">
            {caseItem.versions.map((version) => (
              <div
                key={version.id}
                className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="rounded-full bg-white p-2 text-[var(--color-text)] shadow-soft">
                  <FileClock className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{version.note}</p>
                  <p className="mt-1 text-xs text-muted">{version.time}</p>
                </div>

                <Chip variant={version.mode === "Safety" ? "warning" : "default"}>{version.mode}</Chip>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <Clock3 className="h-4 w-4" />
                <p className="text-sm font-semibold">Turnaround</p>
              </div>
              <p className="mt-1 text-xs text-muted">Average revision cycle: 18 minutes</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <CopyCheck className="h-4 w-4" />
                <p className="text-sm font-semibold">Audit trail</p>
              </div>
              <p className="mt-1 text-xs text-muted">Every generation saved with timestamp</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-3">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <ShieldAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">Safety mode</p>
              </div>
              <p className="mt-1 text-xs text-muted">Flagged cases preserve neutral escalation language</p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
