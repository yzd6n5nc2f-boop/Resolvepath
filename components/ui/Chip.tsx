import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "default" | "selected" | "success" | "warning" | "danger";

const chipStyles: Record<ChipVariant, string> = {
  default: "bg-brand-gray/75 text-black",
  selected: "bg-brand-navy text-white ring-1 ring-brand-navy/55",
  success: "bg-brand-teal/20 text-black",
  warning: "bg-brand-amber/30 text-black",
  danger: "bg-[#F9C2B2]/50 text-black"
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
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold tracking-[0.01em] transition hover:opacity-90",
        chipStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
