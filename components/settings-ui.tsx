"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

const disclaimerText =
  "This tool helps you draft communications and organise a fair process. It does not provide legal advice. Follow your organisation’s policies and seek qualified HR/legal advice for high-risk situations.";

export function SettingsUI(): JSX.Element {
  const [accepted, setAccepted] = useState(false);
  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const acceptedStored = window.localStorage.getItem("resolvepath-ui-disclaimer") === "true";
    const retentionStored = window.localStorage.getItem("resolvepath-ui-retention");

    setAccepted(acceptedStored);
    if (retentionStored !== null) {
      setRetentionEnabled(retentionStored === "true");
    }
  }, []);

  const save = (): void => {
    window.localStorage.setItem("resolvepath-ui-disclaimer", String(accepted));
    window.localStorage.setItem("resolvepath-ui-retention", String(retentionEnabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-semibold text-[var(--color-text)]">Settings</h2>
        <p className="mt-1 text-sm text-muted">UI controls only. Backend persistence pending.</p>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--color-primary-soft)] p-2 text-[var(--color-text)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">Disclaimer Acceptance</h3>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text)]">{disclaimerText}</p>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2 rounded-2xl bg-[var(--color-surface-2)] p-3 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>I understand and accept this guidance.</span>
        </label>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Data retention</p>
            <p className="text-xs text-muted">UI toggle only for MVP visual behavior</p>
          </div>
          <button
            onClick={() => setRetentionEnabled((valueState) => !valueState)}
            className={`relative h-7 w-12 rounded-full transition ${
              retentionEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-2)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition ${
                retentionEnabled ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <UploadCloud className="h-4 w-4" />
            <p className="text-sm font-semibold">Policy pack upload placeholder</p>
          </div>
          <p className="mt-1 text-xs text-muted">Upload workflow is backend pending. This section is UI only.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save}>Save Settings</Button>
          {saved ? <Chip variant="success">Saved</Chip> : null}
        </div>
      </Card>
    </div>
  );
}
