import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";

interface RiskFlagListProps {
  flags: Array<{
    id?: string;
    code?: string;
    label: string;
    severity: "low" | "med" | "high";
    guidance: string;
  }>;
}

function severityVariant(severity: "low" | "med" | "high"): "info" | "warning" | "danger" {
  if (severity === "high") {
    return "danger";
  }

  if (severity === "med") {
    return "warning";
  }

  return "info";
}

function severityStyles(severity: "low" | "med" | "high"): string {
  if (severity === "high") {
    return "border-[var(--color-danger-border)] bg-[var(--color-danger-soft)]";
  }

  if (severity === "med") {
    return "border-[var(--color-warning-border)] bg-[var(--color-warning-soft)]";
  }

  return "border-[var(--color-info-border)] bg-[var(--color-info-soft)]";
}

function SeverityIcon({ severity }: { severity: "low" | "med" | "high" }): JSX.Element {
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
      {flags.map((flag, index) => (
        <Card
          key={flag.id || flag.code || `${flag.label}-${index}`}
          className={cn("border p-4", severityStyles(flag.severity))}
          padded={false}
        >
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
