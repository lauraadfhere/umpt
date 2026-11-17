function parse(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Long date in the reader's language, e.g. "2 November 2026". Empty when the date is missing or invalid. */
export function formatDate(iso: string | null, locale: string): string {
  const date = parse(iso);
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date) : "";
}

export function yearOf(iso: string | null): string {
  const date = parse(iso);
  return date ? String(date.getUTCFullYear()) : "";
}

/** Month and year for catalog lists, e.g. "April 2027". */
export function formatMonthYear(iso: string | null, locale: string): string {
  const date = parse(iso);
  return date ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "";
}
