export function formatDisplayDate(dateStr?: string, fallback = ""): string {
  if (!dateStr) return fallback;

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toLocaleDateString(undefined, { timeZone: "UTC" });
}

export function serializePageData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
