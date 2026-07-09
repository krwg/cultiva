import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function createMemoryStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    get length() { return Object.keys(store).length; },
    key: (index) => Object.keys(store)[index] ?? null
  };
}

const habitsStore = new Map();
const settingsStore = new Map();

function runTx(tx) {
  queueMicrotask(() => {
    if (tx.oncomplete) {
      tx.oncomplete();
    }
  });
}

vi.mock('./db.js', () => ({
  db: {
    open: async () => ({
      transaction: () => {
        const tx = {
          objectStore: (name) => ({
            delete: (id) => {
              if (name === 'habits') {
                habitsStore.delete(id);
              }
            },
            put: (row) => {
              if (name === 'habits') {
                habitsStore.set(row.id, row);
              } else if (name === 'settings') {
                settingsStore.set(row.key, row);
              }
            },
            clear: () => {
              if (name === 'habits') {
                habitsStore.clear();
              } else if (name === 'settings') {
                settingsStore.clear();
              }
            }
          }),
          oncomplete: null,
          onerror: null
        };
        runTx(tx);
        return tx;
      }
    }),
    getAll: async (storeName) => {
      if (storeName === 'habits') {
        return Array.from(habitsStore.values());
      }
      if (storeName === 'settings') {
        return Array.from(settingsStore.values());
      }
      return [];
    },
    get: async (storeName, key) => {
      if (storeName === 'sessions') {
        return null;
      }
      if (storeName === 'settings') {
        return settingsStore.get(key) ?? null;
      }
      return null;
    },
    put: async (storeName, row) => {
      if (storeName === 'settings') {
        settingsStore.set(row.key, row);
      } else if (storeName === 'habits') {
        habitsStore.set(row.id, row);
      }
    }
  }
}));

describe('storage migrateHabitRecord', () => {
  it('migrates legacy streak field', async () => {
    const { migrateHabitRecord } = await import('./storage.js');
    const out = migrateHabitRecord({ id: '1', name: 'Test', streak: 5, progress: 1 });
    expect(out.currentStreak).toBe(5);
    expect(out.streak).toBeUndefined();
  });

  it('coerces quantity track type and target', async () => {
    const { migrateHabitRecord } = await import('./storage.js');
    const out = migrateHabitRecord({ id: '2', name: 'Water', trackType: 'quantity', target: 0 });
    expect(out.trackType).toBe('quantity');
    expect(out.target).toBe(1);
  });

  it('normalizes binary habits to target 1', async () => {
    const { migrateHabitRecord } = await import('./storage.js');
    const out = migrateHabitRecord({ id: '3', name: 'Read', trackType: 'binary', target: 10 });
    expect(out.target).toBe(1);
  });
});

describe('storage habit persistence', () => {
  beforeEach(() => {
    habitsStore.clear();
    settingsStore.clear();
    vi.stubGlobal('localStorage', createMemoryStorage({}));
    vi.stubGlobal('crypto', { randomUUID: () => 'uuid-test' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('deletes habits missing from userId index when saving', async () => {
    habitsStore.set('legacy', { id: 'legacy', name: 'Legacy', progress: 0 });
    habitsStore.set('keep', { id: 'keep', name: 'Keep', progress: 0, userId: null });

    const { storage } = await import('./storage.js');
    await storage.init();
    await storage.saveHabits([{ id: 'keep', name: 'Keep', progress: 0 }]);

    expect(habitsStore.has('legacy')).toBe(false);
    expect(habitsStore.has('keep')).toBe(true);
    expect(storage.getHabits()).toHaveLength(1);
  });

  it('clears all habits and cultiva localStorage keys', async () => {
    habitsStore.set('a', { id: 'a', name: 'A', progress: 0, userId: null });
    localStorage.setItem('cultiva-habits', JSON.stringify([{ id: 'a' }]));
    localStorage.setItem('cultiva-installed-plugins', '["weather"]');
    localStorage.setItem('cultiva_calendar_events', '{}');

    const { storage } = await import('./storage.js');
    await storage.init();
    await storage.clearAll();

    expect(habitsStore.size).toBe(0);
    expect(storage.getHabits()).toHaveLength(0);
    expect(localStorage.getItem('cultiva-habits')).toBeNull();
    expect(localStorage.getItem('cultiva-installed-plugins')).toBeNull();
    expect(localStorage.getItem('cultiva_calendar_events')).toBeNull();
  });
});
