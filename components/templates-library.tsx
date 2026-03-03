"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ChipButton } from "@/components/ui/Chip";
import { mockTemplates, scenarioList, scenarioMeta, type ScenarioKey } from "@/lib/mock-data";

export function TemplatesLibrary(): JSX.Element {
  const [scenarioFilter, setScenarioFilter] = useState<ScenarioKey | "all">("all");
  const [query, setQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter((entry) => {
      const scenarioPass = scenarioFilter === "all" || entry.scenario === scenarioFilter;
      const queryPass =
        query.trim().length === 0 ||
        entry.name.toLowerCase().includes(query.toLowerCase()) ||
        entry.preview.toLowerCase().includes(query.toLowerCase());

      return scenarioPass && queryPass;
    });
  }, [scenarioFilter, query]);

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Templates Library</h2>
        <p className="mt-1 text-sm text-muted">Filter and preview scenario-specific drafting templates.</p>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-9 pr-3 text-sm"
              placeholder="Search templates"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <ChipButton variant={scenarioFilter === "all" ? "selected" : "default"} onClick={() => setScenarioFilter("all")}>
              All
            </ChipButton>
            {scenarioList.map((entry) => (
              <ChipButton
                key={entry}
                variant={scenarioFilter === entry ? "selected" : "default"}
                onClick={() => setScenarioFilter(entry)}
              >
                {scenarioMeta[entry].label}
              </ChipButton>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((entry) => (
          <Card key={entry.id} className="h-full transition hover:-translate-y-0.5 hover:shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {scenarioMeta[entry.scenario].label}
            </p>
            <h3 className="mt-2 text-base font-semibold text-[var(--color-text)]">{entry.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{entry.preview}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
