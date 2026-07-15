import { getTodayInTZ } from './timezone.js';

export const SCHEDULE_MODES = ['daily', 'weekdays', 'weekly'];

export function normalizeSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object') {
    return { mode: 'daily', weekdays: [1, 2, 3, 4, 5], timesPerWeek: 3 };
  }
  const mode = SCHEDULE_MODES.includes(schedule.mode) ? schedule.mode : 'daily';
  let weekdays = Array.isArray(schedule.weekdays)
    ? [...new Set(schedule.weekdays.map((d) => parseInt(d, 10)).filter((d) => d >= 0 && d <= 6))]
    : [];
  if (mode === 'weekdays' && weekdays.length === 0) {
    weekdays = [1, 2, 3, 4, 5];
  }
  const timesPerWeek = Math.max(1, Math.min(7, parseInt(String(schedule.timesPerWeek), 10) || 3));
  return {
    mode,
    weekdays: mode === 'weekdays' ? weekdays.sort((a, b) => a - b) : [],
    timesPerWeek: mode === 'weekly' ? timesPerWeek : 7
  };
}

export function weekdayFromDateStr(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDay();
}

export function weekStartMonday(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function datesInWeek(anchorDateStr) {
  const start = new Date(`${weekStartMonday(anchorDateStr)}T12:00:00`);
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function completionsInWeek(habit, anchorDateStr) {
  const week = new Set(datesInWeek(anchorDateStr));
  const history = habit.history || [];
  return history.filter((d) => week.has(d)).length;
}

export function isScheduledDay(habit, dateStr) {
  const s = normalizeSchedule(habit?.schedule);
  if (s.mode === 'daily') {
    return true;
  }
  if (s.mode === 'weekdays') {
    return s.weekdays.includes(weekdayFromDateStr(dateStr));
  }
  return true;
}

export function isDueToday(habit, todayStr = getTodayInTZ()) {
  if (!habit || habit.paused || habit.archived) {
    return false;
  }
  const s = normalizeSchedule(habit.schedule);
  if (s.mode === 'daily') {
    return true;
  }
  if (s.mode === 'weekdays') {
    return s.weekdays.includes(weekdayFromDateStr(todayStr));
  }
  if (s.mode === 'weekly') {
    return completionsInWeek(habit, todayStr) < s.timesPerWeek;
  }
  return true;
}

export function scheduledDaysBetween(startStr, endStr, schedule) {
  const s = normalizeSchedule(schedule);
  if (s.mode === 'daily') {
    const a = new Date(`${startStr}T12:00:00`);
    const b = new Date(`${endStr}T12:00:00`);
    return Math.max(1, Math.round((b - a) / 86400000) + 1);
  }
  if (s.mode === 'weekdays') {
    let count = 0;
    const cur = new Date(`${startStr}T12:00:00`);
    const end = new Date(`${endStr}T12:00:00`);
    while (cur <= end) {
      const ds = cur.toISOString().slice(0, 10);
      if (s.weekdays.includes(weekdayFromDateStr(ds))) {
        count += 1;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  }
  const weeks = Math.max(1, Math.ceil(
    (new Date(`${endStr}T12:00:00`) - new Date(`${startStr}T12:00:00`)) / (7 * 86400000)
  ));
  return weeks * s.timesPerWeek;
}

/** Count completions for rate math; weekly habits are capped at timesPerWeek per Monday-week. */
export function cappedCompletionCount(habit, startStr, endStr) {
  const history = Array.isArray(habit?.history) ? habit.history : [];
  const s = normalizeSchedule(habit?.schedule);
  if (s.mode !== 'weekly') {
    return history.filter((d) => d >= startStr && d <= endStr).length;
  }
  const byWeek = new Map();
  for (const d of history) {
    if (d < startStr || d > endStr) {
      continue;
    }
    const ws = weekStartMonday(d);
    byWeek.set(ws, (byWeek.get(ws) || 0) + 1);
  }
  let capped = 0;
  for (const count of byWeek.values()) {
    capped += Math.min(count, s.timesPerWeek);
  }
  return capped;
}
