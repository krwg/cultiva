import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function createMemoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; }
  };
}

const store = { habits: [] };

vi.mock('./storage.js', () => ({
  storage: {
    getHabits: () => store.habits,
    saveHabits: async (list) => { store.habits = list; },
    getCurrentUserId: () => null
  }
}));

describe('habits', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createMemoryStorage({}));
    vi.setSystemTime(new Date('2026-05-30T12:00:00.000Z'));
    store.habits = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('coerces quantity progress from strings', async () => {
    const { habits } = await import('./habits.js');
    expect(habits.quantityDayProgress({ dailyProgress: { '2026-05-30': '3' } }, '2026-05-30')).toBe(3);
    expect(habits.quantityDayProgress({ dailyProgress: {} }, '2026-05-30')).toBe(0);
  });

  it('defaults quantity target to at least 1', async () => {
    const { habits } = await import('./habits.js');
    expect(habits.quantityTarget({ target: 0 })).toBe(1);
    expect(habits.quantityTarget({ target: 5 })).toBe(5);
  });

  it('toggles binary completion for today', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Meditate', trackType: 'binary' });
    await habits.toggle(h.id);
    const done = habits.getAll().find((x) => x.id === h.id);
    expect(done.lastCompleted).toBe('2026-05-30');
    expect(done.progress).toBe(1);
    await habits.toggle(h.id);
    const undone = habits.getAll().find((x) => x.id === h.id);
    expect(undone.lastCompleted).toBeNull();
    expect(undone.progress).toBe(0);
  });

  it('increments quantity habits until target is met', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Water', trackType: 'quantity', target: 2 });
    await habits.toggle(h.id);
    let cur = habits.getAll().find((x) => x.id === h.id);
    expect(cur.dailyProgress['2026-05-30']).toBe(1);
    expect(cur.progress).toBe(0);
    await habits.toggle(h.id);
    cur = habits.getAll().find((x) => x.id === h.id);
    expect(cur.dailyProgress['2026-05-30']).toBe(2);
    expect(cur.progress).toBe(1);
  });

  it('bridges one missed day per month when streak grace is enabled', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage({
      'cultiva-settings': JSON.stringify({ streakGraceEnabled: true })
    }));
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Read', trackType: 'binary' });
    vi.setSystemTime(new Date('2026-05-28T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-29T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-31T12:00:00.000Z'));
    await habits.toggle(h.id);
    const bridged = habits.getAll().find((x) => x.id === h.id);
    expect(bridged.currentStreak).toBe(3);
    expect(bridged.bestStreak).toBe(3);
  });

  it('hides paused and archived habits from the garden list', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Meditate', trackType: 'binary' });
    await habits.setPaused(h.id, true);
    expect(habits.getGardenHabits()).toHaveLength(0);
    await habits.setPaused(h.id, false);
    await habits.setArchived(h.id, true);
    expect(habits.getGardenHabits()).toHaveLength(0);
    const all = habits.getAll();
    expect(all.find((x) => x.id === h.id)?.archived).toBe(true);
  });

  it('breaks streak across two missed days even with grace enabled', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage({
      'cultiva-settings': JSON.stringify({ streakGraceEnabled: true })
    }));
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Run', trackType: 'binary' });
    vi.setSystemTime(new Date('2026-05-28T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-31T12:00:00.000Z'));
    await habits.toggle(h.id);
    const broken = habits.getAll().find((x) => x.id === h.id);
    expect(broken.currentStreak).toBe(1);
    expect(broken.bestStreak).toBe(1);
  });

  it('caps weekly habit completion rate at 100%', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({
      name: 'Gym',
      trackType: 'binary',
      schedule: { mode: 'weekly', timesPerWeek: 2 }
    });
    store.habits = habits.getAll().map((row) => {
      if (row.id !== h.id) {
        return row;
      }
      return {
        ...row,
        startDate: '2026-05-25',
        history: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29']
      };
    });
    const stats = habits.getStats(h.id);
    expect(stats.completionRate).toBeLessThanOrEqual(100);
  });
});
