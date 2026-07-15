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
        history: [
          '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
          '2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24',
          '2026-07-01', '2026-07-02', '2026-07-10', '2026-07-11', '2026-07-12'
        ]
      },
      {
        id: 't1',
        name: 'Trophy',
        progress: 999
      },
      {
        id: 'p1',
        name: 'Paused',
        progress: 1,
        paused: true,
        history: ['2026-07-11']
      },
      {
        id: 'ar1',
        name: 'Archived',
        progress: 1,
        archived: true,
        history: ['2026-07-10']
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
      todayProgress: 1,
      recentHistory: [
        '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
        '2026-06-20', '2026-06-21', '2026-06-22', '2026-06-23', '2026-06-24',
        '2026-07-01', '2026-07-02', '2026-07-10', '2026-07-11', '2026-07-12'
      ]
    });
    expect(snap[0].history).toBeUndefined();
    expect(snap[0].recentHistory).toHaveLength(14);
  });
});
