const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractPlaceholders(body: string): string[] {
  const found = new Set<string>();
  let match = PLACEHOLDER_REGEX.exec(body);

  while (match) {
    if (match[1]) {
      found.add(match[1]);
    }
    match = PLACEHOLDER_REGEX.exec(body);
  }

  return Array.from(found);
}

export function renderTemplate(body: string, values: Record<string, string>): string {
  return body.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    const value = values[key];
    if (typeof value !== "string") {
      return `{{${key}}}`;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : `{{${key}}}`;
  });
}

export function missingValues(placeholders: string[], values: Record<string, string>): string[] {
  return placeholders.filter((key) => !values[key] || values[key].trim().length === 0);
}
