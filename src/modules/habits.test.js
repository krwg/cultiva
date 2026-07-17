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

  it('keeps streak when today is incomplete', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage({
      'cultiva-settings': JSON.stringify({ streakGraceEnabled: false })
    }));
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Walk', trackType: 'binary' });
    vi.setSystemTime(new Date('2026-05-28T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-29T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-30T12:00:00.000Z'));
    habits._recalculateStreaks(store.habits.find((x) => x.id === h.id));
    const open = store.habits.find((x) => x.id === h.id);
    expect(open.lastCompleted).toBe('2026-05-29');
    expect(open.currentStreak).toBe(2);
  });

  it('preserves weekday streak across Fri to Mon weekend gap', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage({
      'cultiva-settings': JSON.stringify({ streakGraceEnabled: false })
    }));
    // Friday 2026-05-29 → Monday 2026-06-01
    vi.setSystemTime(new Date('2026-05-29T12:00:00.000Z'));
    const { habits } = await import('./habits.js');
    const h = await habits.add({
      name: 'Office',
      trackType: 'binary',
      schedule: { mode: 'weekdays', weekdays: [1, 2, 3, 4, 5] }
    });
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));
    await habits.toggle(h.id);
    const done = habits.getAll().find((x) => x.id === h.id);
    expect(done.currentStreak).toBe(2);
  });

  it('counts prior full weeks when current weekly quota is still open', async () => {
    vi.stubGlobal('localStorage', createMemoryStorage({
      'cultiva-settings': JSON.stringify({ streakGraceEnabled: false })
    }));
    // Wednesday mid-week
    vi.setSystemTime(new Date('2026-05-27T12:00:00.000Z'));
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
        // Prior week Mon–Sun 2026-05-18..24: two completions; this week only one so far
        history: ['2026-05-19', '2026-05-21', '2026-05-26'],
        lastCompleted: '2026-05-26'
      };
    });
    habits._recalculateStreaks(store.habits.find((x) => x.id === h.id));
    const cur = store.habits.find((x) => x.id === h.id);
    expect(cur.currentStreak).toBe(1);
  });

  it('undoCompletion reverts quantity instead of incrementing', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Water', trackType: 'quantity', target: 2 });
    await habits.toggle(h.id);
    const mid = await habits.toggle(h.id);
    expect(mid.justCompleted).toBe(true);
    expect(mid.previousAmount).toBe(1);
    await habits.undoCompletion(h.id, mid.previousAmount);
    const undone = habits.getAll().find((x) => x.id === h.id);
    expect(undone.dailyProgress['2026-05-30']).toBe(1);
    expect(undone.progress).toBe(0);
    expect(undone.history).not.toContain('2026-05-30');
  });

  it('sets lastCompleted to max remaining history on uncomplete', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Meditate', trackType: 'binary' });
    vi.setSystemTime(new Date('2026-05-28T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-29T12:00:00.000Z'));
    await habits.toggle(h.id);
    vi.setSystemTime(new Date('2026-05-30T12:00:00.000Z'));
    await habits.toggle(h.id);
    await habits.toggle(h.id);
    const undone = habits.getAll().find((x) => x.id === h.id);
    expect(undone.lastCompleted).toBe('2026-05-29');
    expect(undone.history).toEqual(expect.arrayContaining(['2026-05-28', '2026-05-29']));
    expect(undone.history).not.toContain('2026-05-30');
  });

  it('lists paused habits separately from the garden', async () => {
    const { habits } = await import('./habits.js');
    const h = await habits.add({ name: 'Meditate', trackType: 'binary' });
    await habits.setPaused(h.id, true);
    expect(habits.getGardenHabits()).toHaveLength(0);
    expect(habits.getPausedHabits()).toHaveLength(1);
    expect(habits.getPausedHabits()[0].id).toBe(h.id);
  });

  it('picks the closest habit as next Legacy candidate', async () => {
    const { habits } = await import('./habits.js');
    const a = await habits.add({ name: 'A', trackType: 'binary' });
    const b = await habits.add({ name: 'B', trackType: 'binary' });
    store.habits = store.habits.map((h) => {
      if (h.id === a.id) {
        return { ...h, progress: 100 };
      }
      if (h.id === b.id) {
        return { ...h, progress: 200 };
      }
      return h;
    });
    const next = habits.getNextLegacyCandidate();
    expect(next?.id).toBe(b.id);
  });

  it('aggregates calendar levels across all habits', async () => {
    const { habits } = await import('./habits.js');
    const a = await habits.add({ name: 'A', trackType: 'binary' });
    const b = await habits.add({ name: 'B', trackType: 'binary' });
    store.habits = store.habits.map((h) => {
      if (h.id === a.id || h.id === b.id) {
        return { ...h, history: ['2026-05-30'] };
      }
      return h;
    });
    const days = habits.getAggregatedCalendarData();
    expect(days).toHaveLength(365);
    const today = days.find((d) => d.date === '2026-05-30');
    expect(today?.count).toBe(2);
    expect(today?.level).toBe(2);
  });
});
