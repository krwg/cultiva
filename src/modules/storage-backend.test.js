import { describe, it, expect, vi } from 'vitest';
import {
  STORAGE_BACKEND_IDS,
  normalizeStorageBackendId,
  listStorageBackendOptions,
  buildStorageSnapshot,
  validateStorageSnapshot,
  createStorageAdapter,
  migrateStorageBackend,
  importStorageSnapshot
} from './storage-backend.js';

describe('storage-backend registry', () => {
  it('normalizes unknown backend ids to local', () => {
    expect(normalizeStorageBackendId('account')).toBe(STORAGE_BACKEND_IDS.ACCOUNT);
    expect(normalizeStorageBackendId('cloud')).toBe(STORAGE_BACKEND_IDS.LOCAL);
    expect(normalizeStorageBackendId(undefined)).toBe(STORAGE_BACKEND_IDS.LOCAL);
  });

  it('lists account backend as unavailable when signed out', () => {
    const guest = listStorageBackendOptions({ isAuthenticated: false });
    const signedIn = listStorageBackendOptions({ isAuthenticated: true });
    expect(guest.find((o) => o.id === 'account')?.available).toBe(false);
    expect(signedIn.find((o) => o.id === 'account')?.available).toBe(true);
  });

  it('builds and validates snapshots', () => {
    const snap = buildStorageSnapshot({
      habits: [{ id: '1', name: 'Read' }],
      settingsRows: { 'cultiva-settings': { lang: 'en' } },
      backendId: 'local'
    });
    expect(validateStorageSnapshot(snap)).toBe(true);
    expect(snap.habits).toHaveLength(1);
    expect(snap.settings['cultiva-settings'].lang).toBe('en');
  });
});

describe('storage adapters', () => {
  function makeDeps({ authenticated = true } = {}) {
    const habits = [{ id: 'h1', name: 'Meditate', progress: 0 }];
    const settings = { 'cultiva-settings': { lang: 'ru', storageBackend: 'local' } };
    return {
      isAuthenticated: () => authenticated,
      readHabits: () => habits,
      readSettings: () => settings,
      writeHabits: vi.fn(async (next) => {
        habits.splice(0, habits.length, ...next);
      }),
      mergeSetting: vi.fn(async (key, value) => {
        settings[key] = value;
      })
    };
  }

  it('account adapter rejects guests', async () => {
    const deps = makeDeps({ authenticated: false });
    const adapter = createStorageAdapter(STORAGE_BACKEND_IDS.ACCOUNT, deps);
    expect(adapter.isAvailable()).toBe(false);
    await expect(adapter.readAll()).rejects.toThrow('STORAGE_BACKEND_REQUIRES_AUTH');
  });

  it('migrates between adapters via snapshot round-trip', async () => {
    const deps = makeDeps({ authenticated: true });
    const local = createStorageAdapter(STORAGE_BACKEND_IDS.LOCAL, deps);
    const account = createStorageAdapter(STORAGE_BACKEND_IDS.ACCOUNT, deps);

    const result = await migrateStorageBackend(
      STORAGE_BACKEND_IDS.LOCAL,
      STORAGE_BACKEND_IDS.ACCOUNT,
      local,
      account
    );

    expect(result.changed).toBe(true);
    expect(result.snapshot.habits).toHaveLength(1);
    expect(deps.writeHabits).toHaveBeenCalled();
  });

  it('imports validated snapshots', async () => {
    const deps = makeDeps({ authenticated: true });
    const adapter = createStorageAdapter(STORAGE_BACKEND_IDS.LOCAL, deps);
    const snap = buildStorageSnapshot({
      habits: [{ id: 'x', name: 'Run' }],
      settingsRows: { 'cultiva-settings': { lang: 'en' } }
    });
    await importStorageSnapshot(snap, adapter);
    expect(deps.writeHabits).toHaveBeenCalledWith(snap.habits);
  });
});
