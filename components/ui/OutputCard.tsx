"use client";

import { useState } from "react";
import { Clipboard, PencilLine, Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface OutputCardProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
}

export function OutputCard({ title, value, onChange }: OutputCardProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");

  const onCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyLabel("Copied");
      setTimeout(() => setCopyLabel("Copy"), 1200);
    } catch {
      setCopyLabel("Copy failed");
      setTimeout(() => setCopyLabel("Copy"), 1200);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onCopy}>
            <Clipboard className="h-3.5 w-3.5" />
            {copyLabel}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setEditing((valueState) => !valueState)}>
            {editing ? <Save className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
            {editing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={!editing}
        className={
          "h-52 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-sm leading-6 text-[var(--color-text)] outline-none transition " +
          "focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)]"
        }
      />
    </Card>
  );
}
