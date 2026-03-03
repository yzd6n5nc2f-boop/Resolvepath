import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps): JSX.Element {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-card">
      <ol className="grid gap-2 md:grid-cols-6">
        {steps.map((step, index) => {
          const number = index + 1;
          const complete = number < currentStep;
          const active = number === currentStep;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2 rounded-[var(--radius-lg)] border px-3 py-2 text-xs font-semibold",
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)]"
                  : complete
                    ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : complete
                      ? "bg-[var(--color-text)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                )}
              >
                {complete ? <Check className="h-3 w-3" /> : number}
              </span>
              <span className="truncate">{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
