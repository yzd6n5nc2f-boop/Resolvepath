"use client";

export function PrintButton(): JSX.Element {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white"
    >
      Print / Save as PDF
    </button>
  );
}
