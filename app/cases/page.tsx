"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { mockCases, scenarioMeta } from "@/lib/mock-data";

function statusVariant(status: string): "default" | "success" | "warning" {
  if (status === "Ready") {
    return "success";
  }

  if (status === "Needs Review") {
    return "warning";
  }

  return "default";
}

export default function MyCasesPage(): JSX.Element {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">My Cases</h2>
        <p className="mt-1 text-sm text-muted">UI preview list with scenario, status, and update signals.</p>
      </Card>

      <Card className="overflow-hidden" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[var(--color-surface-2)] text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Case</th>
                <th className="px-5 py-3">Scenario</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {mockCases.map((entry) => (
                <tr
                  key={entry.id}
                  onClick={() => router.push(`/cases/${entry.id}`)}
                  className="cursor-pointer border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                >
                  <td className="px-5 py-3 font-semibold text-[var(--color-text)]">{entry.title}</td>
                  <td className="px-5 py-3 text-[var(--color-text)]">{scenarioMeta[entry.scenario].label}</td>
                  <td className="px-5 py-3">
                    <Chip variant={statusVariant(entry.status)}>{entry.status}</Chip>
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text)]">{entry.owner}</td>
                  <td className="px-5 py-3 text-muted">{entry.lastUpdated}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/cases/${entry.id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
