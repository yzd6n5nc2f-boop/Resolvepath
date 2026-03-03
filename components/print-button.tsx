"use client";

export function PrintButton(): JSX.Element {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-2)]"
    >
      Print / Save as PDF
    </button>
  );
}
