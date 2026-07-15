// Date/format helpers (en-GB, Europe/London).

const DF = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
});

const DF_SHORT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/London',
});

export function formatDate(d: Date): string {
  return DF.format(d);
}

export function formatDateShort(d: Date): string {
  return DF_SHORT.format(d);
}

export function formatDateRange(start: Date, end?: Date): string {
  if (!end || start.getTime() === end.getTime()) return formatDate(start);
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

// Is the event still upcoming/ongoing relative to a reference date?
export function isUpcoming(start: Date, end: Date | undefined, ref: Date): boolean {
  const last = end ?? start;
  return last.getTime() >= ref.getTime();
}
