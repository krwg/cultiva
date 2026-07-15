import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./timezone.js', () => ({
  getTodayInTZ: () => '2026-05-30',
  getDateInTZ: (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}));

describe('habit-analytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-30T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('summarizes weekly completions across habits', async () => {
    const { getWeeklySummary } = await import('./habit-analytics.js');
    const habits = [
      { progress: 10, history: ['2026-05-26', '2026-05-27', '2026-05-28'] },
      { progress: 5, history: ['2026-05-26', '2026-05-28'] }
    ];
    const w = getWeeklySummary(habits, new Date('2026-05-30T12:00:00.000Z'));
    expect(w.completions).toBe(5);
    expect(w.possible).toBe(14);
    expect(w.rate).toBe(36);
  });

  it('counts only scheduled weekdays as possible days', async () => {
    const { countCompletionsInRange } = await import('./habit-analytics.js');
    const habits = [
      {
        progress: 1,
        schedule: { mode: 'weekdays', weekdays: [1, 2, 3, 4, 5] },
        history: ['2026-05-26', '2026-05-27']
      }
    ];
    // Mon 2026-05-25 .. Sun 2026-05-31 → 5 weekday slots
    const r = countCompletionsInRange(
      habits,
      new Date('2026-05-25T12:00:00.000Z'),
      new Date('2026-05-31T12:00:00.000Z')
    );
    expect(r.possible).toBe(5);
    expect(r.completions).toBe(2);
  });

  it('uses weekly quota for possible days', async () => {
    const { countCompletionsInRange } = await import('./habit-analytics.js');
    const habits = [
      {
        progress: 1,
        schedule: { mode: 'weekly', timesPerWeek: 3 },
        history: ['2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29']
      }
    ];
    const r = countCompletionsInRange(
      habits,
      new Date('2026-05-25T12:00:00.000Z'),
      new Date('2026-05-31T12:00:00.000Z')
    );
    expect(r.possible).toBe(3);
    expect(r.completions).toBe(3);
  });

  it('ranks habits by monthly completion rate', async () => {
    const { getPerHabitMonthlyRates } = await import('./habit-analytics.js');
    const habits = [
      { id: 'a', name: 'Alpha', progress: 1, history: ['2026-05-01', '2026-05-02', '2026-05-03'] },
      { id: 'b', name: 'Beta', progress: 1, history: ['2026-05-01'] }
    ];
    const rows = getPerHabitMonthlyRates(habits, new Date('2026-05-30T12:00:00.000Z'));
    expect(rows[0].name).toBe('Alpha');
    expect(rows[0].completions).toBe(3);
  });
});
