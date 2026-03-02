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
        <h2 className="text-xl font-semibold text-brand-navy">Settings</h2>
        <p className="mt-1 text-sm text-brand-ink/70">UI controls only. Backend persistence pending.</p>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-brand-teal/15 p-2 text-brand-navy">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-navy">Disclaimer Acceptance</h3>
            <p className="mt-1 text-sm leading-6 text-brand-ink">{disclaimerText}</p>
          </div>
        </div>

        <label className="mt-4 flex items-start gap-2 rounded-2xl bg-brand-gray/35 p-3 text-sm text-brand-navy">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-brand-teal"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span>I understand and accept this guidance.</span>
        </label>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-brand-navy/10 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-brand-navy">Data retention</p>
            <p className="text-xs text-brand-ink/70">UI toggle only for MVP visual behavior</p>
          </div>
          <button
            onClick={() => setRetentionEnabled((valueState) => !valueState)}
            className={`relative h-7 w-12 rounded-full transition ${
              retentionEnabled ? "bg-brand-teal" : "bg-brand-gray"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft transition ${
                retentionEnabled ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="rounded-2xl border border-dashed border-brand-navy/25 bg-brand-gray/20 p-4">
          <div className="flex items-center gap-2 text-brand-navy">
            <UploadCloud className="h-4 w-4" />
            <p className="text-sm font-semibold">Policy pack upload placeholder</p>
          </div>
          <p className="mt-1 text-xs text-brand-ink/70">Upload workflow is backend pending. This section is UI only.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save}>Save Settings</Button>
          {saved ? <Chip variant="success">Saved</Chip> : null}
        </div>
      </Card>
    </div>
  );
}
