import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import type { RiskFlag } from "@/lib/mock-data";

interface RiskFlagListProps {
  flags: RiskFlag[];
}

function severityVariant(severity: RiskFlag["severity"]): "info" | "warning" | "danger" {
  if (severity === "high") {
    return "danger";
  }

  if (severity === "med") {
    return "warning";
  }

  return "info";
}

function severityStyles(severity: RiskFlag["severity"]): string {
  if (severity === "high") {
    return "border-[var(--color-danger-border)] bg-[var(--color-danger-soft)]";
  }

  if (severity === "med") {
    return "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)]";
  }

  return "border-[var(--color-info-border)] bg-[var(--color-info-soft)]";
}

function SeverityIcon({ severity }: { severity: RiskFlag["severity"] }): JSX.Element {
  if (severity === "high") {
    return <ShieldAlert className="h-4 w-4" />;
  }

  if (severity === "med") {
    return <AlertTriangle className="h-4 w-4" />;
  }

  return <Info className="h-4 w-4" />;
}

export function RiskFlagList({ flags }: RiskFlagListProps): JSX.Element {
  return (
    <div className="space-y-3">
      {flags.map((flag) => (
        <Card key={flag.id} className={cn("border p-4", severityStyles(flag.severity))} padded={false}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-full bg-[var(--color-surface)] p-1.5 text-[var(--color-text)]">
                <SeverityIcon severity={flag.severity} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">{flag.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{flag.guidance}</p>
              </div>
            </div>
            <Chip variant={severityVariant(flag.severity)}>{flag.severity.toUpperCase()}</Chip>
          </div>
        </Card>
      ))}
    </div>
  );
}
