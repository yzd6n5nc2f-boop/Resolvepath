import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ className, padded = true, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-3xl border border-brand-navy/10 bg-white shadow-card",
        padded && "p-5 sm:p-6",
        className
      )}
      {...props}
    />
  );
}
