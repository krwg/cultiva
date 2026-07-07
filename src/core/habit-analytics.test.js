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
