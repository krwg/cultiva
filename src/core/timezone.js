export function getCultivaTimezone() {
  const tz = localStorage.getItem('cultiva-timezone') || 'auto';
  return tz === 'auto' ? undefined : tz;
}

/** Resolved IANA zone for formatting; `auto` uses the runtime local zone. */
export function getResolvedTimezone() {
  const configured = getCultivaTimezone();
  if (configured) {
    return configured;
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

function localCivilDateParts(date) {
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0')
  };
}

function formatCivilDateInZone(date, timeZone) {
  if (!timeZone) {
    const parts = localCivilDateParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year').value;
    const month = parts.find((p) => p.type === 'month').value;
    const day = parts.find((p) => p.type === 'day').value;
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.warn('[Timezone] Failed to format date with timezone, using local civil:', e);
    const parts = localCivilDateParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
}

/** Civil YYYY-MM-DD for "today" in the app timezone (never UTC via toISOString). */
export function getTodayInTZ() {
  return formatCivilDateInZone(new Date(), getResolvedTimezone());
}

/** Civil YYYY-MM-DD for an arbitrary instant in the app timezone. */
export function getDateInTZ(date) {
  return formatCivilDateInZone(date instanceof Date ? date : new Date(date), getResolvedTimezone());
}

/** Local Date at midday for a civil YYYY-MM-DD (calendar navigation). */
export function civilDateToLocalDate(dateStr) {
  const [y, m, d] = String(dateStr || '').split('-').map(Number);
  if (!y || !m || !d) {
    const today = getTodayInTZ();
    const [ty, tm, td] = today.split('-').map(Number);
    return new Date(ty, tm - 1, td, 12, 0, 0, 0);
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Today as a local Date object (same civil day as getTodayInTZ). */
export function getTodayDateInTZ() {
  return civilDateToLocalDate(getTodayInTZ());
}






