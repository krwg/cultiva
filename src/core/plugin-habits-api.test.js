import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../modules/habits.js', () => ({
  habits: {
    getAll: vi.fn(),
    quantityDayProgress: vi.fn(),
    quantityTarget: vi.fn()
  }
}));

vi.mock('./timezone.js', () => ({
  getTodayInTZ: () => '2026-07-12'
}));

import { habits } from '../modules/habits.js';
import { buildPluginHabitsSnapshot } from './plugin-habits-api.js';

describe('buildPluginHabitsSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    habits.quantityDayProgress.mockReturnValue(0);
    habits.quantityTarget.mockReturnValue(3);
  });

  it('returns read-only active habit fields', () => {
    habits.getAll.mockReturnValue([
      {
        id: 'a1',
        name: 'Read',
        treeName: 'Reading Oak',
        category: 'learning',
        trackType: 'binary',
        progress: 2,
        currentStreak: 4,
        bestStreak: 10,
        lastCompleted: '2026-07-12',
        history: ['secret-should-not-leak']
      },
      {
        id: 't1',
        name: 'Trophy',
        progress: 999
      }
    ]);

    const snap = buildPluginHabitsSnapshot();
    expect(snap).toHaveLength(1);
    expect(snap[0]).toEqual({
      id: 'a1',
      name: 'Reading Oak',
      category: 'learning',
      trackType: 'binary',
      progress: 2,
      currentStreak: 4,
      bestStreak: 10,
      lastCompleted: '2026-07-12',
      completedToday: true,
      target: 1,
      unit: '',
      todayProgress: 1
    });
    expect(snap[0].history).toBeUndefined();
  });
});
