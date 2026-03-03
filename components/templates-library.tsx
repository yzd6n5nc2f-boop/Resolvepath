"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, Eye, Pencil, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip, ChipButton } from "@/components/ui/Chip";
import { SafeMarkdown } from "@/components/ui/SafeMarkdown";
import { extractPlaceholders, renderTemplate } from "@/lib/template-engine";
import {
  TEMPLATE_REVIEW_BANNER,
  commonPlaceholderDictionary,
  getTemplateFieldConfig,
  validateTemplateValues
} from "@/lib/template-placeholders";
import { formatDate } from "@/lib/utils";
import { scenarioList, scenarioMeta, toUiScenario, type ScenarioUI } from "@/lib/scenarios";

interface TemplateRecord {
  id: string;
  scenario: string;
  scenarioUi: ScenarioUI | null;
  name: string;
  version: string;
  body: string;
  createdAt: string;
}

type CopyStatus = "idle" | "copied" | "failed";

function toPreview(body: string): string {
  const clean = body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return clean.length > 140 ? `${clean.slice(0, 140)}...` : clean;
}

function toFieldLabel(key: string): string {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TemplatesLibrary(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);

  const [scenarioFilter, setScenarioFilter] = useState<ScenarioUI | "all">("all");
  const [query, setQuery] = useState("");

  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});

  const [copyBodyStatus, setCopyBodyStatus] = useState<Record<string, CopyStatus>>({});
  const [copyRenderedStatus, setCopyRenderedStatus] = useState<CopyStatus>("idle");

  const [editMode, setEditMode] = useState(false);
  const [editDraftBody, setEditDraftBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === activeTemplateId) || null,
    [templates, activeTemplateId]
  );

  useEffect(() => {
    let mounted = true;

    const loadTemplates = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/templates", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load templates");
        }

        const payload = (await response.json()) as {
          templates?: Array<{
            id: string;
            scenario: string;
            scenarioUi?: string | null;
            name: string;
            version?: string;
            body: string;
            createdAt: string;
          }>;
        };

        const parsed = (payload.templates || []).map((template) => ({
          id: template.id,
          scenario: template.scenario,
          scenarioUi: template.scenarioUi ? toUiScenario(template.scenarioUi) : toUiScenario(template.scenario),
          name: template.name,
          version: template.version || "1.0",
          body: template.body,
          createdAt: template.createdAt
        }));

        if (mounted) {
          setTemplates(parsed);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Unable to load templates");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadTemplates();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeTemplate) {
      return;
    }

    setEditMode(false);
    setEditDraftBody(activeTemplate.body);
    setCopyRenderedStatus("idle");

    setFieldValues((previous) => {
      const current = previous[activeTemplate.id] || {};
      return {
        ...previous,
        [activeTemplate.id]: {
          ...current,
          template_version: activeTemplate.version,
          prepared_date: current.prepared_date || todayIso()
        }
      };
    });
  }, [activeTemplate]);

  const filteredTemplates = useMemo(() => {
    const queryLower = query.trim().toLowerCase();

    return templates.filter((template) => {
      const templateScenario = template.scenarioUi || toUiScenario(template.scenario);
      const scenarioPass = scenarioFilter === "all" || templateScenario === scenarioFilter;
      const queryPass =
        queryLower.length === 0 ||
        template.name.toLowerCase().includes(queryLower) ||
        template.body.toLowerCase().includes(queryLower);

      return scenarioPass && queryPass;
    });
  }, [templates, scenarioFilter, query]);

  const placeholderKeys = useMemo(() => {
    if (!activeTemplate) {
      return [] as string[];
    }

    return extractPlaceholders(activeTemplate.body);
  }, [activeTemplate]);

  const configuredFields = useMemo(() => {
    if (!activeTemplate) {
      return { requiredFields: [], optionalFields: [] };
    }

    return getTemplateFieldConfig(activeTemplate.name);
  }, [activeTemplate]);

  const requiredKeys = useMemo(() => {
    const placeholderSet = new Set(placeholderKeys);
    return configuredFields.requiredFields.filter((key) => placeholderSet.has(key));
  }, [configuredFields.requiredFields, placeholderKeys]);

  const optionalKeys = useMemo(() => {
    const placeholderSet = new Set(placeholderKeys);
    const requiredSet = new Set(requiredKeys);

    const configuredOptional = configuredFields.optionalFields.filter(
      (key) => placeholderSet.has(key) && !requiredSet.has(key)
    );

    const unconfigured = placeholderKeys.filter(
      (key) =>
        !requiredSet.has(key) &&
        !configuredOptional.includes(key) &&
        key !== "template_version"
    );

    return [...configuredOptional.filter((key) => key !== "template_version"), ...unconfigured];
  }, [configuredFields.optionalFields, placeholderKeys, requiredKeys]);

  const activeValues = useMemo(() => {
    if (!activeTemplate) {
      return {} as Record<string, string>;
    }
    return fieldValues[activeTemplate.id] || {};
  }, [activeTemplate, fieldValues]);

  const validation = useMemo(() => {
    if (!activeTemplate) {
      return { missingRequired: [], warnings: [] } as ReturnType<typeof validateTemplateValues>;
    }

    return validateTemplateValues(activeTemplate.name, activeValues);
  }, [activeTemplate, activeValues]);

  const renderedPreview = useMemo(() => {
    if (!activeTemplate) {
      return "";
    }

    const withDefaults: Record<string, string> = {
      ...activeValues,
      template_version: activeTemplate.version,
      prepared_date: activeValues.prepared_date || todayIso()
    };

    return renderTemplate(activeTemplate.body, withDefaults);
  }, [activeTemplate, activeValues]);

  const setFieldValue = (key: string, value: string): void => {
    if (!activeTemplate) {
      return;
    }

    setFieldValues((previous) => ({
      ...previous,
      [activeTemplate.id]: {
        ...(previous[activeTemplate.id] || {}),
        [key]: value
      }
    }));
  };

  const copyTemplateBody = async (template: TemplateRecord): Promise<void> => {
    try {
      await navigator.clipboard.writeText(template.body);
      setCopyBodyStatus((previous) => ({ ...previous, [template.id]: "copied" }));
    } catch {
      setCopyBodyStatus((previous) => ({ ...previous, [template.id]: "failed" }));
    }

    setTimeout(() => {
      setCopyBodyStatus((previous) => ({ ...previous, [template.id]: "idle" }));
    }, 1200);
  };

  const copyRendered = async (): Promise<void> => {
    if (!activeTemplate) {
      return;
    }

    try {
      await navigator.clipboard.writeText(renderedPreview);
      setCopyRenderedStatus("copied");
    } catch {
      setCopyRenderedStatus("failed");
    }

    setTimeout(() => setCopyRenderedStatus("idle"), 1200);
  };

  const saveTemplateEdits = async (): Promise<void> => {
    if (!activeTemplate || !editDraftBody.trim()) {
      return;
    }

    setSavingEdit(true);
    try {
      const response = await fetch(`/api/templates/${activeTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editDraftBody })
      });

      if (!response.ok) {
        throw new Error("Could not save template");
      }

      const payload = (await response.json()) as {
        template?: {
          id: string;
          scenario: string;
          scenarioUi?: string | null;
          name: string;
          version: string;
          body: string;
          createdAt: string;
        };
      };

      if (!payload.template) {
        throw new Error("Template response missing");
      }

      const updated: TemplateRecord = {
        id: payload.template.id,
        scenario: payload.template.scenario,
        scenarioUi: payload.template.scenarioUi
          ? toUiScenario(payload.template.scenarioUi)
          : toUiScenario(payload.template.scenario),
        name: payload.template.name,
        version: payload.template.version,
        body: payload.template.body,
        createdAt: payload.template.createdAt
      };

      setTemplates((previous) =>
        previous.map((template) => (template.id === updated.id ? updated : template))
      );
      setActiveTemplateId(updated.id);
      setEditMode(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save template changes");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">UK Employment Templates Library</h2>
        <p className="text-sm text-muted">
          Active templates backed by your database. Search, preview, fill placeholders, and apply directly to a case.
        </p>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-sm text-[var(--color-text)]">
          {TEMPLATE_REVIEW_BANNER}
        </div>

        <div className="mt-2 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm"
              placeholder="Search templates by name or content"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <ChipButton variant={scenarioFilter === "all" ? "selected" : "default"} onClick={() => setScenarioFilter("all")}>
              All
            </ChipButton>
            {scenarioList.map((entry) => (
              <ChipButton
                key={entry}
                variant={scenarioFilter === entry ? "selected" : "default"}
                onClick={() => setScenarioFilter(entry)}
              >
                {scenarioMeta[entry].label}
              </ChipButton>
            ))}
          </div>
        </div>
      </Card>

      {error ? (
        <Card>
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-muted">Loading templates...</p>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No templates matched your filters.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => {
            const scenarioUi = template.scenarioUi || toUiScenario(template.scenario);
            const copyStatus = copyBodyStatus[template.id] || "idle";

            return (
              <Card key={template.id} className="flex h-full flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <Chip variant="info">{scenarioUi ? scenarioMeta[scenarioUi].label : template.scenario}</Chip>
                  <Chip variant="default">v{template.version}</Chip>
                </div>

                <h3 className="text-base font-semibold text-[var(--color-text)]">{template.name}</h3>
                <p className="text-sm leading-6 text-muted">{toPreview(template.body)}</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="secondary" onClick={() => setActiveTemplateId(template.id)}>
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void copyTemplateBody(template)}>
                    <Copy className="h-3.5 w-3.5" />
                    {copyStatus === "idle"
                      ? "Copy"
                      : copyStatus === "copied"
                        ? "Copied"
                        : "Copy failed"}
                  </Button>
                  <Link
                    href={`/cases/new?templateId=${encodeURIComponent(template.id)}${
                      scenarioUi ? `&scenario=${encodeURIComponent(scenarioUi)}` : ""
                    }`}
                    className="inline-flex"
                  >
                    <Button size="sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Use in case
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <Card className="max-h-[92vh] w-full max-w-7xl overflow-hidden" padded={false}>
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted">Template preview</p>
                <h3 className="truncate text-lg font-semibold text-[var(--color-text)]">
                  {activeTemplate.name} <span className="text-sm text-muted">v{activeTemplate.version}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditMode((value) => !value)}>
                  <Pencil className="h-3.5 w-3.5" />
                  {editMode ? "Cancel edit" : "Edit"}
                </Button>
                {editMode ? (
                  <Button size="sm" onClick={() => void saveTemplateEdits()} disabled={savingEdit || !editDraftBody.trim()}>
                    {savingEdit ? "Saving..." : "Save"}
                  </Button>
                ) : null}
                <button
                  className="rounded-full p-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                  onClick={() => setActiveTemplateId(null)}
                  aria-label="Close template preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid max-h-[calc(92vh-4.5rem)] gap-0 lg:grid-cols-[360px_1fr]">
              <div className="overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
                  {TEMPLATE_REVIEW_BANNER}
                </div>

                {requiredKeys.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Required fields</p>
                    {requiredKeys.map((key) => {
                      const definition = commonPlaceholderDictionary[key];
                      const fieldType = definition?.type || "text";
                      const value = activeValues[key] || "";
                      return (
                        <label key={key} className="block space-y-1 text-xs">
                          <span className="font-semibold text-[var(--color-text)]">
                            {definition?.label || toFieldLabel(key)}
                          </span>
                          {fieldType === "longtext" ? (
                            <textarea
                              value={value}
                              onChange={(event) => setFieldValue(key, event.target.value)}
                              rows={3}
                              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                              placeholder={definition?.example || "Enter value"}
                            />
                          ) : (
                            <input
                              value={value}
                              onChange={(event) => setFieldValue(key, event.target.value)}
                              type={fieldType === "date" ? "date" : "text"}
                              className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                              placeholder={definition?.example || "Enter value"}
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : null}

                {optionalKeys.length > 0 ? (
                  <details className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted">
                      Optional fields
                    </summary>
                    <div className="mt-3 space-y-3">
                      {optionalKeys.map((key) => {
                        const definition = commonPlaceholderDictionary[key];
                        const fieldType = definition?.type || "text";
                        const value = activeValues[key] || "";
                        return (
                          <label key={key} className="block space-y-1 text-xs">
                            <span className="font-semibold text-[var(--color-text)]">
                              {definition?.label || toFieldLabel(key)}
                            </span>
                            {fieldType === "longtext" ? (
                              <textarea
                                value={value}
                                onChange={(event) => setFieldValue(key, event.target.value)}
                                rows={3}
                                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
                                placeholder={definition?.example || "Enter value"}
                              />
                            ) : (
                              <input
                                value={value}
                                onChange={(event) => setFieldValue(key, event.target.value)}
                                type={fieldType === "date" ? "date" : "text"}
                                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                                placeholder={definition?.example || "Enter value"}
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </details>
                ) : null}

                {validation.missingRequired.length > 0 ? (
                  <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-warning-border)] bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
                    Missing required: {validation.missingRequired.map(toFieldLabel).join(", ")}
                  </div>
                ) : null}

                {validation.warnings.length > 0 ? (
                  <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-info-border)] bg-[var(--color-info-soft)] px-3 py-2 text-xs text-[var(--color-text)]">
                    {validation.warnings.join(" ")}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => void copyRendered()}>
                    <Copy className="h-3.5 w-3.5" />
                    {copyRenderedStatus === "idle"
                      ? "Copy rendered output"
                      : copyRenderedStatus === "copied"
                        ? "Copied"
                        : "Copy failed"}
                  </Button>
                  <Link
                    href={`/cases/new?templateId=${encodeURIComponent(activeTemplate.id)}${
                      activeTemplate.scenarioUi
                        ? `&scenario=${encodeURIComponent(activeTemplate.scenarioUi)}`
                        : ""
                    }`}
                    className="inline-flex"
                  >
                    <Button size="sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Use in case
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="overflow-y-auto p-5">
                {editMode ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-muted">Edit template body (Markdown)</p>
                    <textarea
                      value={editDraftBody}
                      onChange={(event) => setEditDraftBody(event.target.value)}
                      className="h-[68vh] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm leading-6"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-muted">Live rendered preview</p>
                    <SafeMarkdown markdown={renderedPreview} className="space-y-3 text-sm leading-7 text-[var(--color-text)]" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
