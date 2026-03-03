import Link from "next/link";
import {
  Activity,
  BadgeAlert,
  Briefcase,
  CalendarCheck2,
  Flame,
  Gauge,
  HeartPulse,
  Scale,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { mockCases, scenarioList, scenarioMeta } from "@/lib/mock-data";

const scenarioIcons = {
  performance: Gauge,
  conduct: Briefcase,
  sickness_absence: HeartPulse,
  grievance: Scale,
  conflict: Users,
  flexible_working: CalendarCheck2
};

export default function DashboardPage(): JSX.Element {
  const readyCount = mockCases.filter((entry) => entry.status === "Ready").length;
  const reviewCount = mockCases.filter((entry) => entry.status === "Needs Review").length;

  return (
    <div className="space-y-7">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <Card>
          <Chip variant="default">Open Cases</Chip>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{mockCases.length}</p>
          <p className="mt-1 text-sm text-muted">Mock portfolio this week</p>
        </Card>

        <Card>
          <Chip variant="success">Ready</Chip>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{readyCount}</p>
          <p className="mt-1 text-sm text-muted">Draft packs prepared</p>
        </Card>

        <Card>
          <Chip variant="warning">Needs Review</Chip>
          <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{reviewCount}</p>
          <p className="mt-1 text-sm text-muted">Safety gate recommended</p>
        </Card>

        <Card className="bg-[var(--color-surface-2)] text-[var(--color-text)]">
          <div className="flex items-center justify-between">
            <Chip variant="selected">Action</Chip>
            <Flame className="h-4 w-4" />
          </div>
          <p className="mt-3 text-base font-semibold">Start a fresh case flow</p>
          <Link href="/cases/new" className="mt-4 inline-flex">
            <Button variant="primary">Start New Case</Button>
          </Link>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">Scenario Paths</h2>
            <p className="text-sm text-muted">Choose a pathway and launch the guided wizard.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarioList.map((scenario) => {
            const Icon = scenarioIcons[scenario];
            return (
              <Link key={scenario} href={`/cases/new?scenario=${scenario}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-[var(--color-primary-soft)] p-2.5 text-[var(--color-text)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Chip variant="default">Start</Chip>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">{scenarioMeta[scenario].label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{scenarioMeta[scenario].description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Recent Case Activity</h3>
          <div className="mt-4 space-y-3">
            {mockCases.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-[var(--color-surface-2)] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{entry.title}</p>
                  <p className="text-xs text-muted">{entry.lastUpdated}</p>
                </div>
                <Link href={`/cases/${entry.id}`}>
                  <Button size="sm" variant="secondary">
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-[var(--color-text)]">Quality Signal</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-[var(--color-warning-soft)] p-4">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <BadgeAlert className="h-4 w-4" />
                <p className="text-sm font-semibold">1 high-risk case in review queue</p>
              </div>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-2)] p-4">
              <div className="flex items-center gap-2 text-[var(--color-text)]">
                <Activity className="h-4 w-4" />
                <p className="text-sm">Timeline completeness at 92% across active drafts</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
