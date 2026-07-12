/**
 * Pluggable storage backend registry — foundation for future cross-device sync.
 * Phase 1: preference + adapter interface; local IndexedDB remains the default store.
 */

export const STORAGE_BACKEND_IDS = {
  LOCAL: 'local',
  ACCOUNT: 'account'
};

export const SNAPSHOT_VERSION = 1;

export function normalizeStorageBackendId(value) {
  return value === STORAGE_BACKEND_IDS.ACCOUNT
    ? STORAGE_BACKEND_IDS.ACCOUNT
    : STORAGE_BACKEND_IDS.LOCAL;
}

/**
 * @typedef {object} StorageBackendOption
 * @property {string} id
 * @property {string} labelKey
 * @property {string} descKey
 * @property {boolean} available
 * @property {string} [unavailableKey]
 */

/**
 * @param {{ isAuthenticated: boolean }} ctx
 * @returns {StorageBackendOption[]}
 */
export function listStorageBackendOptions({ isAuthenticated }) {
  return [
    {
      id: STORAGE_BACKEND_IDS.LOCAL,
      labelKey: 'storageBackendLocal',
      descKey: 'storageBackendLocalDesc',
      available: true
    },
    {
      id: STORAGE_BACKEND_IDS.ACCOUNT,
      labelKey: 'storageBackendAccount',
      descKey: 'storageBackendAccountDesc',
      available: isAuthenticated,
      unavailableKey: 'storageBackendAccountSignIn'
    }
  ];
}

/**
 * @typedef {object} StorageSnapshot
 * @property {number} version
 * @property {number} exportedAt
 * @property {string} backendId
 * @property {object[]} habits
 * @property {Record<string, unknown>} settings
 */

/**
 * @param {{ habits: object[], settingsRows: Record<string, unknown>, backendId?: string }} input
 * @returns {StorageSnapshot}
 */
export function buildStorageSnapshot({ habits, settingsRows, backendId }) {
  return {
    version: SNAPSHOT_VERSION,
    exportedAt: Date.now(),
    backendId: normalizeStorageBackendId(backendId),
    habits: Array.isArray(habits) ? habits.map((h) => ({ ...h })) : [],
    settings: settingsRows && typeof settingsRows === 'object' ? { ...settingsRows } : {}
  };
}

export function validateStorageSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return false;
  }
  if (!Array.isArray(snapshot.habits)) {
    return false;
  }
  if (!snapshot.settings || typeof snapshot.settings !== 'object') {
    return false;
  }
  return true;
}

/**
 * @typedef {object} StorageAdapter
 * @property {string} id
 * @property {() => boolean} isAvailable
 * @property {() => Promise<{ habits: object[], settings: Record<string, unknown> }>} readAll
 * @property {(payload: { habits: object[], settings: Record<string, unknown> }) => Promise<void>} writeAll
 */

/**
 * @param {string} id
 * @param {{
 *   isAuthenticated: () => boolean,
 *   readHabits: () => object[],
 *   readSettings: () => Record<string, unknown>,
 *   writeHabits: (habits: object[]) => Promise<void>,
 *   mergeSetting: (key: string, value: unknown) => Promise<void>
 * }} deps
 * @returns {StorageAdapter}
 */
export function createStorageAdapter(id, deps) {
  const normalized = normalizeStorageBackendId(id);

  const base = {
    async readAll() {
      return {
        habits: deps.readHabits(),
        settings: deps.readSettings()
      };
    },
    async writeAll({ habits, settings }) {
      await deps.writeHabits(habits);
      for (const [key, value] of Object.entries(settings)) {
        await deps.mergeSetting(key, value);
      }
    }
  };

  if (normalized === STORAGE_BACKEND_IDS.ACCOUNT) {
    return {
      id: STORAGE_BACKEND_IDS.ACCOUNT,
      isAvailable: () => deps.isAuthenticated(),
      async readAll() {
        if (!deps.isAuthenticated()) {
          throw new Error('STORAGE_BACKEND_REQUIRES_AUTH');
        }
        return base.readAll();
      },
      async writeAll(payload) {
        if (!deps.isAuthenticated()) {
          throw new Error('STORAGE_BACKEND_REQUIRES_AUTH');
        }
        return base.writeAll(payload);
      }
    };
  }

  return {
    id: STORAGE_BACKEND_IDS.LOCAL,
    isAvailable: () => true,
    ...base
  };
}

/**
 * Switch backends via export → import. Both adapters currently target the same IndexedDB
 * profile; this helper keeps a stable migration path for future remote backends.
 *
 * @param {string} fromId
 * @param {string} toId
 * @param {StorageAdapter} fromAdapter
 * @param {StorageAdapter} toAdapter
 */
export async function migrateStorageBackend(fromId, toId, fromAdapter, toAdapter) {
  const from = normalizeStorageBackendId(fromId);
  const to = normalizeStorageBackendId(toId);
  if (from === to) {
    return { changed: false };
  }
  if (!toAdapter.isAvailable()) {
    throw new Error('STORAGE_BACKEND_UNAVAILABLE');
  }

  const snapshot = await fromAdapter.readAll();
  const packed = buildStorageSnapshot({
    habits: snapshot.habits,
    settingsRows: snapshot.settings,
    backendId: from
  });

  if (from !== to) {
    await toAdapter.writeAll({
      habits: packed.habits,
      settings: packed.settings
    });
  }

  return { changed: true, snapshot: packed };
}

/**
 * @param {StorageSnapshot} snapshot
 * @param {StorageAdapter} adapter
 */
export async function importStorageSnapshot(snapshot, adapter) {
  if (!validateStorageSnapshot(snapshot)) {
    throw new Error('STORAGE_SNAPSHOT_INVALID');
  }
  if (!adapter.isAvailable()) {
    throw new Error('STORAGE_BACKEND_UNAVAILABLE');
  }
  await adapter.writeAll({
    habits: snapshot.habits,
    settings: snapshot.settings
  });
}
