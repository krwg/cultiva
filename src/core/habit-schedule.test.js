import { describe, it, expect } from 'vitest';
import {
  normalizeSchedule,
  isDueToday,
  isScheduledDay,
  completionsInWeek,
  cappedCompletionCount,
  weekdayFromDateStr
} from './habit-schedule.js';

describe('habit-schedule', () => {
  it('defaults to daily schedule', () => {
    expect(normalizeSchedule(null).mode).toBe('daily');
  });

  it('weekdays mode checks day of week', () => {
    const habit = {
      schedule: { mode: 'weekdays', weekdays: [1, 3, 5] },
      history: [],
      paused: false,
      archived: false
    };
    expect(isScheduledDay(habit, '2026-07-06')).toBe(true);
    expect(isScheduledDay(habit, '2026-07-07')).toBe(false);
  });

  it('weekly mode due until quota met', () => {
    const habit = {
      schedule: { mode: 'weekly', timesPerWeek: 2 },
      history: ['2026-07-06'],
      paused: false,
      archived: false
    };
    expect(completionsInWeek(habit, '2026-07-08')).toBe(1);
    expect(isDueToday(habit, '2026-07-08')).toBe(true);
    habit.history.push('2026-07-07');
    expect(isDueToday(habit, '2026-07-08')).toBe(false);
  });

  it('caps weekly completions per week for rate math', () => {
    const habit = {
      schedule: { mode: 'weekly', timesPerWeek: 2 },
      history: ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09']
    };
    // Mon 2026-07-06 week: 4 days logged, cap at 2
    expect(cappedCompletionCount(habit, '2026-07-06', '2026-07-12')).toBe(2);
  });

  it('weekdayFromDateStr returns 0-6', () => {
    expect(weekdayFromDateStr('2026-07-06')).toBeGreaterThanOrEqual(0);
    expect(weekdayFromDateStr('2026-07-06')).toBeLessThanOrEqual(6);
  });
});
