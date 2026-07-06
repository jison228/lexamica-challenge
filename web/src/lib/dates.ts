/**
 * All frontend date handling lives here — one format, one set of conversions.
 *
 * We use a fixed locale + UTC so the server and client render the exact same
 * string (no hydration mismatch), and show day-level granularity (no time).
 */

const DISPLAY_FMT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

/** An ISO timestamp → "Jul 6, 2026" — the one date format the UI shows. */
export function formatDate(iso: string): string {
  return DISPLAY_FMT.format(new Date(iso));
}

/** Today as a "YYYY-MM-DD" string for an <input type="date"> min/max/value. */
export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/** An <input type="date"> value ("YYYY-MM-DD") → ISO timestamp (undefined if empty). */
export function dateInputToISO(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}
