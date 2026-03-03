import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "default" | "selected" | "success" | "warning" | "danger" | "info";

const chipStyles: Record<ChipVariant, string> = {
  default: "border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]",
  selected:
    "border border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)] ring-1 ring-[var(--color-primary)]",
  success: "border border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  danger: "border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  info: "border border-[var(--color-info-border)] bg-[var(--color-info-soft)] text-[var(--color-info)]"
};

export function Chip({
  className,
  children,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: ChipVariant }): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold tracking-[0.01em]",
        chipStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ChipButton({
  className,
  children,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ChipVariant }): JSX.Element {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold tracking-[0.01em] transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]",
        "hover:brightness-[0.98]",
        chipStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
