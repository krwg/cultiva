import { BRANDING } from './branding.js';

function escapeIcal(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line) {
  const max = 73;
  if (line.length <= max) {
    return line;
  }
  const parts = [line.slice(0, max)];
  let rest = line.slice(max);
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`);
    rest = rest.slice(max - 1);
  }
  return parts.join('\r\n');
}

function formatUtcStamp(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function dayKeyToIcalDate(dayKey) {
  return dayKey.replace(/-/g, '');
}

function addDaysToKey(dayKey, days) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function buildHabitIcalEvents(habits) {
  const lines = [];
  const stamp = formatUtcStamp(new Date());

  for (const habit of habits) {
    const history = [...new Set(habit.history || [])].sort();
    for (const dayKey of history) {
      const uid = `${habit.id}-${dayKey}@cultiva.local`;
      const summary = escapeIcal(`${habit.name} — Cultiva`);
      const start = dayKeyToIcalDate(dayKey);
      const end = dayKeyToIcalDate(addDaysToKey(dayKey, 1));
      lines.push(
        'BEGIN:VEVENT',
        foldLine(`UID:${uid}`),
        foldLine(`DTSTAMP:${stamp}`),
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        foldLine(`SUMMARY:${summary}`),
        foldLine(`DESCRIPTION:${escapeIcal(habit.description || 'Habit completed in Cultiva')}`),
        'END:VEVENT'
      );
    }
  }

  return lines;
}

export function buildCalendarIcalEvents(eventsByDate) {
  const lines = [];
  const stamp = formatUtcStamp(new Date());

  if (!eventsByDate || typeof eventsByDate !== 'object') {
    return lines;
  }

  for (const [dayKey, dayEvents] of Object.entries(eventsByDate)) {
    if (!Array.isArray(dayEvents)) {
      continue;
    }
    for (const ev of dayEvents) {
      if (!ev || typeof ev !== 'object') {
        continue;
      }
      const uid = `${ev.id || `${dayKey}-${ev.title}`}@cultiva.local`;
      const summary = escapeIcal(ev.title || 'Cultiva event');
      const hasTime = typeof ev.time === 'string' && /^\d{2}:\d{2}$/.test(ev.time);
      if (hasTime) {
        const [hh, mm] = ev.time.split(':');
        const start = `${dayKeyToIcalDate(dayKey)}T${hh}${mm}00`;
        const endDate = ev.endDate && /^\d{4}-\d{2}-\d{2}$/.test(ev.endDate) ? ev.endDate : dayKey;
        const endTime = typeof ev.endTime === 'string' && /^\d{2}:\d{2}$/.test(ev.endTime) ? ev.endTime : ev.time;
        const [eh, em] = endTime.split(':');
        const end = `${dayKeyToIcalDate(endDate)}T${eh}${em}00`;
        lines.push(
          'BEGIN:VEVENT',
          foldLine(`UID:${uid}`),
          foldLine(`DTSTAMP:${stamp}`),
          `DTSTART:${start}`,
          `DTEND:${end}`,
          foldLine(`SUMMARY:${summary}`),
          'END:VEVENT'
        );
      } else {
        const start = dayKeyToIcalDate(dayKey);
        const end = dayKeyToIcalDate(addDaysToKey(dayKey, 1));
        lines.push(
          'BEGIN:VEVENT',
          foldLine(`UID:${uid}`),
          foldLine(`DTSTAMP:${stamp}`),
          `DTSTART;VALUE=DATE:${start}`,
          `DTEND;VALUE=DATE:${end}`,
          foldLine(`SUMMARY:${summary}`),
          'END:VEVENT'
        );
      }
    }
  }

  return lines;
}

export function buildIcalDocument({ habits = [], calendarEvents = null } = {}) {
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cultiva//Habit Export//EN',
    foldLine(`X-WR-CALNAME:${escapeIcal(BRANDING.APP_NAME)}`),
    ...buildHabitIcalEvents(habits),
    ...buildCalendarIcalEvents(calendarEvents),
    'END:VCALENDAR'
  ];
  return `${body.join('\r\n')}\r\n`;
}

export function downloadIcalFile(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
