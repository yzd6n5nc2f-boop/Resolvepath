import { notFound } from "next/navigation";
import { CaseDetailView } from "@/components/case-detail-view";
import { toOutputVersionResponse, toTimelineEventResponse } from "@/lib/server/api-helpers";
import { db } from "@/lib/server/db";
import { parseTemplateSnapshots, parseTemplateValues } from "@/lib/server/json";
import { toUiScenario } from "@/lib/scenarios";
import { renderTemplate } from "@/lib/template-engine";

export default async function CaseDetailPage({ params }: { params: { id: string } }): Promise<JSX.Element> {
  const caseRecord = await db.case.findUnique({
    where: { id: params.id },
    include: {
      timelineEvents: { orderBy: { date: "asc" } },
      outputVersions: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!caseRecord) {
    notFound();
  }

  const templateSnapshots = parseTemplateSnapshots(caseRecord.appliedTemplateSnapshotJson);
  const templateValues = parseTemplateValues(caseRecord.appliedTemplateValuesJson);

  const templatesUsed = templateSnapshots.map((snapshot) => {
    const values = {
      template_version: snapshot.version,
      ...(templateValues[snapshot.id] || {})
    };

    return {
      id: snapshot.id,
      name: snapshot.name,
      version: snapshot.version,
      body: snapshot.body,
      values,
      rendered: renderTemplate(snapshot.body, values)
    };
  });

  return (
    <CaseDetailView
      caseItem={{
        id: caseRecord.id,
        title: caseRecord.title,
        scenarioUi: toUiScenario(caseRecord.scenario),
        status: caseRecord.status,
        summary: caseRecord.summary,
        updatedAt: caseRecord.updatedAt.toISOString(),
        timelineEvents: caseRecord.timelineEvents.map(toTimelineEventResponse),
        outputVersions: caseRecord.outputVersions.map(toOutputVersionResponse).map((version) => ({
          id: version.id,
          createdAt: version.createdAt,
          mode: version.mode,
          outputs: version.outputs,
          riskFlags: version.riskFlags
        })),
        templatesUsed
      }}
    />
  );
}
