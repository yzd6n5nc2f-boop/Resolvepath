import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { RiskFlag } from "@/lib/mock-data";

interface RiskFlagListProps {
  flags: RiskFlag[];
}

function severityVariant(severity: RiskFlag["severity"]): "default" | "warning" | "danger" {
  if (severity === "high") {
    return "danger";
  }

  if (severity === "med") {
    return "warning";
  }

  return "default";
}

export function RiskFlagList({ flags }: RiskFlagListProps): JSX.Element {
  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <Card
          key={flag.id}
          className={cn(
            "border p-4",
            flag.severity === "high" ? "border-brand-amber/50 bg-brand-amber/10" : "border-brand-navy/10"
          )}
          padded={false}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-white p-1.5 text-brand-navy">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-navy">{flag.label}</p>
                <p className="mt-1 text-xs leading-5 text-brand-ink">{flag.guidance}</p>
              </div>
            </div>
            <Chip variant={severityVariant(flag.severity)}>{flag.severity.toUpperCase()}</Chip>
          </div>
        </Card>
      ))}
    </div>
  );
}
