import Image from "next/image";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
import { Card } from "@/components/ui/Card";
import { toOutputVersionResponse, toTimelineEventResponse } from "@/lib/server/api-helpers";
import { db } from "@/lib/server/db";
import { parseTemplateSnapshots, parseTemplateValues } from "@/lib/server/json";
import { scenarioMeta, toUiScenario } from "@/lib/scenarios";
import { TEMPLATE_REVIEW_BANNER } from "@/lib/template-placeholders";
import { renderTemplate } from "@/lib/template-engine";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function CasePrintPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const caseItem = await db.case.findUnique({
    where: { id: params.id },
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  if (!caseItem) {
    notFound();
  }

  const latestVersion = caseItem.outputVersions[0] ? toOutputVersionResponse(caseItem.outputVersions[0]) : null;
  const templateSnapshots = parseTemplateSnapshots(caseItem.appliedTemplateSnapshotJson);
  const templateValues = parseTemplateValues(caseItem.appliedTemplateValuesJson);

  const renderedTemplates = templateSnapshots.map((snapshot) => {
    const values = {
      template_version: snapshot.version,
      ...(templateValues[snapshot.id] || {})
    };

    return {
      id: snapshot.id,
      name: snapshot.name,
      version: snapshot.version,
      rendered: renderTemplate(snapshot.body, values)
    };
  });

  const scenarioUi = toUiScenario(caseItem.scenario);

  return (
    <div className="mx-auto max-w-4xl space-y-5 py-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Image src="/logo.jpeg" alt="ResolvePath" width={130} height={30} priority />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-text)]">ResolvePath Case Report</h1>
              <p className="mt-1 text-sm text-muted">Case ID: {caseItem.id}</p>
              <p className="text-sm text-muted">Generated: {formatDateTime(new Date())}</p>
            </div>
          </div>
          <div className="print:hidden">
            <PrintButton />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Inputs</h2>
        <p className="mt-2 text-sm text-muted">
          {scenarioUi ? scenarioMeta[scenarioUi].label : caseItem.scenario} • Updated {formatDateTime(caseItem.updatedAt)}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">{caseItem.summary}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Timeline</h2>
        <div className="mt-3 space-y-2">
          {caseItem.timelineEvents.length > 0 ? (
            caseItem.timelineEvents.map((event) => {
              const formatted = toTimelineEventResponse(event);
              return (
                <div key={formatted.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{formatted.date}</p>
                  <p className="mt-1 text-sm text-[var(--color-text)]">{formatted.note}</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">No timeline entries recorded.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Risk Flags</h2>
        <div className="mt-3 space-y-2">
          {latestVersion?.riskFlags && latestVersion.riskFlags.length > 0 ? (
            latestVersion.riskFlags.map((flag, index) => (
              <div key={`${flag.code || "flag"}-${index}`} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">{flag.label}</p>
                <p className="mt-1 text-xs text-muted">Severity: {flag.severity.toUpperCase()}</p>
                <p className="mt-1 text-sm text-[var(--color-text)]">{flag.guidance}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No risk flags stored for this case version.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Outputs</h2>
        {latestVersion?.outputs ? (
          <div className="mt-3 space-y-4">
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Conversation Script</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">{latestVersion.outputs.script}</pre>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Meeting Invite Email</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                {latestVersion.outputs.invite_email}
              </pre>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Meeting Notes Template</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                {latestVersion.outputs.meeting_notes}
              </pre>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Follow-up Email</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                {latestVersion.outputs.followup_email}
              </pre>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Improvement Plan</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                {latestVersion.outputs.improvement_plan}
              </pre>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Checklist</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]">
                {latestVersion.outputs.checklist}
              </pre>
            </section>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No generated output pack is stored for this case yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Templates Used</h2>
        <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
          {TEMPLATE_REVIEW_BANNER}
        </div>

        {renderedTemplates.length > 0 ? (
          <div className="mt-4 space-y-4">
            {renderedTemplates.map((template) => (
              <section key={template.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {template.name} (v{template.version})
                </h3>
                <div className="mt-3">
                  <SafeMarkdown markdown={template.rendered} className="space-y-3 text-sm leading-7 text-[var(--color-text)]" />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No templates were applied to this case.</p>
        )}
      </Card>

      <Card className="print:block">
        <p className="text-xs text-muted">
          Report date: {formatDate(new Date())}. This document supports internal process drafting and record keeping.
        </p>
      </Card>
    </div>
  );
}
