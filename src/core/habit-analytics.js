import { getTodayInTZ, getDateInTZ } from './timezone.js';

function parseDayKey(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(weekStart) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
}

function monthRange(year, monthIndex) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  return { start, end };
}

function eachDay(from, to, fn) {
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    fn(getDateInTZ(cursor), cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
}

export function countCompletionsInRange(habits, fromDate, toDate) {
  const fromKey = getDateInTZ(fromDate);
  const toKey = getDateInTZ(toDate);
  let completions = 0;
  let possible = 0;

  for (const habit of habits) {
    if (habit.progress >= 365) {
      continue;
    }
    const historySet = new Set(habit.history || []);
    eachDay(fromDate, toDate, (dayKey) => {
      if (dayKey < fromKey || dayKey > toKey) {
        return;
      }
      possible += 1;
      if (historySet.has(dayKey)) {
        completions += 1;
      }
    });
  }

  return { completions, possible };
}

export function getWeeklySummary(habits, anchor = new Date()) {
  const weekStart = startOfWeek(anchor);
  const weekEnd = endOfWeek(weekStart);
  const { completions, possible } = countCompletionsInRange(habits, weekStart, weekEnd);
  const rate = possible > 0 ? Math.round((completions / possible) * 100) : 0;
  return {
    labelStart: getDateInTZ(weekStart),
    labelEnd: getDateInTZ(weekEnd),
    completions,
    possible,
    rate
  };
}

export function getMonthlySummary(habits, anchor = new Date()) {
  const { start, end } = monthRange(anchor.getFullYear(), anchor.getMonth());
  const { completions, possible } = countCompletionsInRange(habits, start, end);
  const rate = possible > 0 ? Math.round((completions / possible) * 100) : 0;
  return {
    labelMonth: `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`,
    completions,
    possible,
    rate
  };
}

export function getPerHabitMonthlyRates(habits, anchor = new Date()) {
  const { start, end } = monthRange(anchor.getFullYear(), anchor.getMonth());
  const fromKey = getDateInTZ(start);
  const toKey = getDateInTZ(end);
  const todayKey = getTodayInTZ();
  const effectiveEnd = toKey > todayKey ? todayKey : toKey;
  const totalDays = Math.max(1, Math.floor((parseDayKey(effectiveEnd) - parseDayKey(fromKey)) / (1000 * 60 * 60 * 24)) + 1);

  return habits
    .filter((h) => h.progress < 365)
    .map((habit) => {
      const historySet = new Set(habit.history || []);
      let done = 0;
      eachDay(start, parseDayKey(effectiveEnd), (dayKey) => {
        if (dayKey >= fromKey && dayKey <= effectiveEnd && historySet.has(dayKey)) {
          done += 1;
        }
      });
      return {
        id: habit.id,
        name: habit.name,
        completions: done,
        possible: totalDays,
        rate: Math.round((done / totalDays) * 100)
      };
    })
    .sort((a, b) => b.rate - a.rate || b.completions - a.completions);
}
