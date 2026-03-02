import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-card">
      <ol className="grid gap-2 md:grid-cols-6">
        {steps.map((step, index) => {
          const number = index + 1;
          const complete = number < currentStep;
          const active = number === currentStep;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold",
                active
                  ? "border-brand-navy/60 bg-brand-navy text-white"
                  : complete
                    ? "border-brand-navy/10 bg-brand-gray/40 text-black"
                    : "border-brand-navy/10 bg-white text-black/65"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  active ? "bg-white text-black" : complete ? "bg-black text-white" : "bg-brand-gray text-black"
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
