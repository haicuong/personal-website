/**
 * Checks whether a string represents a calendar date in YYYY-MM-DD format.
 */
export function isDateOnly(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
}

/**
 * Parses a date string into a Date object and optional timeZone.
 *
 * For calendar dates (YYYY-MM-DD), constructs a UTC date object and returns
 * timeZone: "UTC" so that formatting with Intl.DateTimeFormat preserves the exact
 * calendar day (year, month, day) without accidental day shifting in negative UTC offsets.
 *
 * For timestamp strings (e.g., ISO 8601 with time/offset), parses as standard Date.
 */
export function parseDate(
  dateStr?: string,
): { date: Date; timeZone?: string } | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  if (isDateOnly(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    if (
      utcDate.getUTCFullYear() !== year ||
      utcDate.getUTCMonth() !== month - 1 ||
      utcDate.getUTCDate() !== day
    ) {
      return null;
    }
    return { date: utcDate, timeZone: "UTC" };
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return { date: parsed };
}

/**
 * Formats a date string for display in the specified or ambient locale.
 *
 * - Calendar dates (YYYY-MM-DD) are formatted with timeZone: "UTC" to guarantee
 *   the calendar day does not shift across any visitor timezone.
 * - Timestamp strings are formatted according to the visitor's ambient timezone.
 */
export function formatLocalizedDate(
  dateStr?: string,
  locale?: string,
  fallback = "",
): string {
  const parsed = parseDate(dateStr);
  if (!parsed) return fallback;

  const options: Intl.DateTimeFormatOptions = parsed.timeZone
    ? { timeZone: parsed.timeZone }
    : {};

  try {
    return new Intl.DateTimeFormat(locale, options).format(parsed.date);
  } catch {
    return fallback;
  }
}

/**
 * Formats a date string with ambient/default locale.
 */
export function formatDisplayDate(dateStr?: string, fallback = ""): string {
  return formatLocalizedDate(dateStr, undefined, fallback);
}

export function serializePageData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
