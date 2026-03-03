import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/server/db";
import { scenarioMeta, toUiScenario } from "@/lib/scenarios";
import { formatDateTime } from "@/lib/utils";

function statusVariant(status: string): "default" | "success" | "warning" {
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

export default async function MyCasesPage(): Promise<JSX.Element> {
  const cases = await db.case.findMany({
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">My Cases</h2>
            <p className="mt-1 text-sm text-muted">Cases saved in your local ResolvePath database.</p>
          </div>
          <Link href="/cases/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="overflow-hidden" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Case</th>
                <th className="px-5 py-3">Scenario</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {cases.length > 0 ? (
                cases.map((entry) => {
                  const scenarioUi = toUiScenario(entry.scenario);

                  return (
                    <tr key={entry.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                      <td className="px-5 py-3 font-semibold text-[var(--color-text)]">{entry.title}</td>
                      <td className="px-5 py-3 text-[var(--color-text)]">
                        {scenarioUi ? scenarioMeta[scenarioUi].label : entry.scenario}
                      </td>
                      <td className="px-5 py-3">
                        <Chip variant={statusVariant(entry.status)}>{statusLabel(entry.status)}</Chip>
                      </td>
                      <td className="px-5 py-3 text-muted">{formatDateTime(entry.updatedAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/cases/${entry.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                    No cases yet. Start a new case to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
