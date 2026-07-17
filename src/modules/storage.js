import { db } from './db.js';
import { normalizeSchedule } from '../core/habit-schedule.js';
import {
  STORAGE_BACKEND_IDS,
  normalizeStorageBackendId,
  buildStorageSnapshot,
  createStorageAdapter,
  migrateStorageBackend,
  importStorageSnapshot,
  validateStorageSnapshot
} from './storage-backend.js';

const SESSION_KEY = 'cultiva_current_session';
const HABITS_IDB_MIGRATION_KEY = 'cultiva-habits-idb-migrated';

let _habitsCache = [];
let _settingsCache = {};
let _isInitialized = false;
let _initPromise = null;
let _currentUserId = null;
let _authProbe = () => !!_currentUserId;
const _deletedHabitIds = new Set();
let _habitsLsTimer = null;

let _habitsWriteScheduled = false;
let _habitsWriteWaiters = [];

const _dirtySettingKeys = new Set();
let _settingsWriteScheduled = false;
let _settingsWriteWaiters = [];

function _scheduleWriteFlush(runFlush) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      void runFlush();
    });
  } else {
    setTimeout(() => {
      void runFlush();
    }, 0);
  }
}

function _queueHabitsWrite() {
  if (!_habitsWriteScheduled) {
    _habitsWriteScheduled = true;
    _scheduleWriteFlush(_flushHabitsToDisk);
  }
  return new Promise((resolve, reject) => {
    _habitsWriteWaiters.push({ resolve, reject });
  });
}

async function _flushHabitsToDisk() {
  const waiters = _habitsWriteWaiters;
  _habitsWriteWaiters = [];
  _habitsWriteScheduled = false;
  const myHabits = _habitsCache;

  try {
    await _persistHabitsUpsert(myHabits);
    _scheduleHabitsLocalStorageMirror(myHabits);
    console.log('[Storage] Saved', myHabits.length, 'habits to IndexedDB');
    waiters.forEach((w) => w.resolve());
  } catch (e) {
    console.error('[Storage] IndexedDB save failed, using localStorage only:', e);
    try {
      localStorage.setItem('cultiva-habits', JSON.stringify(myHabits));
    } catch {
      void 0;
    }
    waiters.forEach((w) => w.reject(e));
  }
}

function _scheduleHabitsLocalStorageMirror(habits) {
  if (_habitsLsTimer) {
    clearTimeout(_habitsLsTimer);
  }
  _habitsLsTimer = setTimeout(() => {
    _habitsLsTimer = null;
    try {
      localStorage.setItem('cultiva-habits', JSON.stringify(habits));
    } catch {
      void 0;
    }
  }, 2500);
}

function _flushHabitsLocalStorageNow() {
  if (_habitsLsTimer) {
    clearTimeout(_habitsLsTimer);
    _habitsLsTimer = null;
  }
  try {
    localStorage.setItem('cultiva-habits', JSON.stringify(_habitsCache));
  } catch {
    void 0;
  }
}

if (typeof window !== 'undefined') {
  const flushOnLeave = () => {
    _flushHabitsLocalStorageNow();
    if (_habitsWriteScheduled || _habitsWriteWaiters.length > 0) {
      void _flushHabitsToDisk();
    }
  };
  window.addEventListener('beforeunload', flushOnLeave);
  window.addEventListener('pagehide', flushOnLeave);
}

function _queueSettingsWrite() {
  if (!_settingsWriteScheduled) {
    _settingsWriteScheduled = true;
    _scheduleWriteFlush(_flushSettingsToDisk);
  }
  return new Promise((resolve, reject) => {
    _settingsWriteWaiters.push({ resolve, reject });
  });
}

async function _flushSettingsToDisk() {
  const waiters = _settingsWriteWaiters;
  _settingsWriteWaiters = [];
  _settingsWriteScheduled = false;
  const keys = [..._dirtySettingKeys];
  _dirtySettingKeys.clear();

  if (keys.length === 0) {
    waiters.forEach((w) => w.resolve());
    return;
  }

  try {
    const dbInstance = await db.open();
    await new Promise((resolve, reject) => {
      const tx = dbInstance.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      for (const key of keys) {
        store.put({ key, value: _settingsCache[key] });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[Storage] IDB settings batch write failed, using localStorage fallback');
  }

  try {
    localStorage.setItem('cultiva-settings', JSON.stringify(_settingsCache));
  } catch (e) {
    console.error('[Storage] Failed to sync localStorage:', e);
  }

  waiters.forEach((w) => w.resolve());
}

async function _writeSettingNow(key, value) {
  _settingsCache[key] = value;
  _dirtySettingKeys.delete(key);
  try {
    await db.put('settings', { key, value });
  } catch (e) {
    console.warn('[Storage] IDB write failed, using localStorage fallback');
  }
  try {
    localStorage.setItem('cultiva-settings', JSON.stringify(_settingsCache));
  } catch (e) {
    console.error('[Storage] Failed to sync localStorage:', e);
  }
}

function _applyStorageAuthProbe(fn) {
  _authProbe = typeof fn === 'function' ? fn : () => !!_currentUserId;
}

export function setStorageAuthProbe(fn) {
  _applyStorageAuthProbe(fn);
}

function _createActiveAdapter(backendId) {
  return createStorageAdapter(backendId, {
    isAuthenticated: () => _authProbe(),
    readHabits: () => _habitsCache,
    readSettings: () => ({ ..._settingsCache }),
    writeHabits: (habits) => storage.saveHabits(habits, { immediate: true }),
    mergeSetting: (key, value) => storage.set(key, value, { immediate: true })
  });
}

function validateHabit(habit) {
  if (!habit || typeof habit !== 'object') {
    console.warn('[Storage] Invalid habit: must be an object, fixing');
    return false;
  }
  if (!habit.id || typeof habit.id !== 'string') {
    habit.id = crypto.randomUUID?.() || Date.now().toString() + Math.random().toString(36);
  }
  if (!habit.name || typeof habit.name !== 'string') {
    habit.name = 'Unnamed Habit';
  }
  if (habit.progress !== undefined && typeof habit.progress !== 'number') {
    habit.progress = parseInt(habit.progress, 10) || 0;
  }
  return true;
}

function migrateHabit(habit) {
  const migrated = { ...habit };

  if (migrated.streak !== undefined && migrated.currentStreak === undefined) {
    migrated.currentStreak = migrated.streak;
  }
  if (migrated.currentStreak === undefined) {
    migrated.currentStreak = 0;
  }

  if (migrated.bestStreak === undefined) {
    migrated.bestStreak = migrated.currentStreak || 0;
  }

  if (!migrated.history || !Array.isArray(migrated.history)) {
    migrated.history = [];
  }

  if (!migrated.dailyProgress || typeof migrated.dailyProgress !== 'object') {
    migrated.dailyProgress = {};
  }

  const tt = String(migrated.trackType || 'binary').toLowerCase();
  migrated.trackType = tt === 'quantity' ? 'quantity' : 'binary';
  const tgtNum = Number(migrated.target);
  if (migrated.trackType === 'quantity') {
    migrated.target = Number.isFinite(tgtNum) && tgtNum > 0 ? tgtNum : 1;
  } else {
    migrated.target = 1;
  }

  if (migrated.userId === undefined) {
    migrated.userId = null;
  }

  delete migrated.streak;

  if (migrated.paused !== true) {
    migrated.paused = false;
  }
  if (migrated.archived !== true) {
    migrated.archived = false;
  }

  const sortNum = Number(migrated.sortOrder);
  if (!Number.isFinite(sortNum)) {
    migrated.sortOrder = migrated.createdAt
      ? new Date(migrated.createdAt).getTime()
      : Date.now();
  }

  migrated.schedule = normalizeSchedule(migrated.schedule);
  migrated.reminderEnabled = migrated.reminderEnabled === true;
  if (!migrated.reminderTime || typeof migrated.reminderTime !== 'string') {
    migrated.reminderTime = '09:00';
  }

  migrated.updatedAt = Date.now();

  return migrated;
}

export function migrateHabitRecord(habit) {
  return migrateHabit(habit);
}

export function habitBelongsToUser(habit, userId) {
  const uid = userId ?? null;
  if (uid === null) {
    return habit.userId === null || habit.userId === undefined;
  }
  return habit.userId === uid;
}

function clearLocalCultivaKeys() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cultiva-') || key.startsWith('cultiva_'))) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('[Storage] localStorage sweep failed:', e);
  }
}

async function _persistHabitsUpsert(myHabits) {
  const dbInstance = await db.open();
  await new Promise((resolve, reject) => {
    const tx = dbInstance.transaction('habits', 'readwrite');
    const store = tx.objectStore('habits');

    for (const id of _deletedHabitIds) {
      store.delete(id);
    }
    _deletedHabitIds.clear();

    for (const habit of myHabits) {
      store.put(habit);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const storage = {
  async init() {
    if (_isInitialized) {
      console.log('[Storage] Already initialized');
      return _initPromise;
    }

    if (_initPromise) {
      console.log('[Storage] Init in progress, waiting...');
      return _initPromise;
    }

    _initPromise = this._doInit();
    return _initPromise;
  },

  async _doInit() {
    console.log('[Storage] Initializing...');

    try {
      const session = await db.get('sessions', SESSION_KEY);
      if (session && session.email) {
        _currentUserId = session.email;
      } else {
        _currentUserId = null;
      }
    } catch (e) {
      console.error('[Storage] Session check failed:', e);
      _currentUserId = null;
    }

    await this._loadFromDB();

    if (Object.keys(_settingsCache).length === 0) {
      const lsBundle = localStorage.getItem('cultiva-settings');
      if (lsBundle) {
        try {
          const parsed = JSON.parse(lsBundle);
          if (parsed && typeof parsed === 'object') {
            const flatKeys = new Set(['lang', 'theme', 'showTrophies', 'showNextTreeProgress', 'focusMode', 'holidayRegion', 'avatar', 'pluginsEnabled', 'nativeNotifyEnabled', 'nativeNotifyHabits', 'nativeNotifyHabitsHour', 'nativeNotifyCalendar', 'nativeNotifyCalendarLeadMinutes']);
            const keys = Object.keys(parsed);
            const looksLikeFlatAppSettings = keys.some((k) => flatKeys.has(k)) && !keys.includes('cultiva-settings');
            if (looksLikeFlatAppSettings) {
              _settingsCache['cultiva-settings'] = parsed;
              await db.put('settings', { key: 'cultiva-settings', value: parsed });
            } else {
              for (const [k, v] of Object.entries(parsed)) {
                _settingsCache[k] = v;
                await db.put('settings', { key: k, value: v });
              }
            }
            console.log('[Storage] Migrated settings from localStorage to IndexedDB (one-time)');
          }
        } catch (e) {
          console.warn('[Storage] Settings bundle migration failed:', e);
        }
      }
    }

    const legacyPlugins = localStorage.getItem('cultiva-installed-plugins');
    if (legacyPlugins && (_settingsCache['cultiva-installed-plugins'] === undefined || _settingsCache['cultiva-installed-plugins'] === null)) {
      try {
        const arr = JSON.parse(legacyPlugins);
        if (Array.isArray(arr)) {
          _settingsCache['cultiva-installed-plugins'] = arr;
          await db.put('settings', { key: 'cultiva-installed-plugins', value: arr });
          console.log('[Storage] Migrated cultiva-installed-plugins from localStorage to IndexedDB');
        }
      } catch (e) {
        console.warn('[Storage] Legacy plugin list migration failed:', e);
      }
    }

    let needsSave = false;
    _habitsCache = _habitsCache.map((h) => {
      const migrated = migrateHabit(h);
      if (_currentUserId && (migrated.userId === null || migrated.userId === undefined || migrated.userId === '')) {
        migrated.userId = _currentUserId;
        needsSave = true;
      }
      if (JSON.stringify(h) !== JSON.stringify(migrated)) {
        needsSave = true;
      }
      return migrated;
    });

    if (needsSave) {
      console.log('[Storage] Applying habit migration...');
      await this._forceSaveHabits(_habitsCache);
    }

    if (!localStorage.getItem(HABITS_IDB_MIGRATION_KEY)) {
      try {
        const allInDb = await db.getAll('habits');
        const localHabits = localStorage.getItem('cultiva-habits');
        if (allInDb.length === 0 && localHabits && _habitsCache.length === 0) {
          const parsed = JSON.parse(localHabits);
          if (Array.isArray(parsed) && parsed.length > 0) {
            _habitsCache = parsed.map(migrateHabit);
            await this._forceSaveHabits(_habitsCache);
            console.log('[Storage] One-time migration: restored', _habitsCache.length, 'habits from localStorage');
          }
        }
      } catch (e) {
        console.error('[Storage] One-time habits migration failed:', e);
      }
      try {
        localStorage.setItem(HABITS_IDB_MIGRATION_KEY, '1');
      } catch {
        void 0;
      }
    }

    _isInitialized = true;
    console.log('[Storage] System ready,', _habitsCache.length, 'habits loaded');
    return _habitsCache;
  },

  isReady() {
    return _isInitialized;
  },

  async reloadHabits() {
    if (!_isInitialized) {
      return this.init();
    }
    await this.flushPendingWrites();
    await this._loadFromDB();
    return _habitsCache;
  },

  async _loadFromDB() {
    try {
      const allHabits = await db.getAll('habits');
      console.log('[Storage] Raw habits from DB:', allHabits.length);

      _habitsCache = allHabits.filter((h) => habitBelongsToUser(h, _currentUserId));

      const settingsRows = await db.getAll('settings');
      _settingsCache = {};
      for (const row of settingsRows) {
        if (row && row.key !== undefined) {
          _settingsCache[row.key] = row.value;
        }
      }

      console.log('[Storage] Loaded', _habitsCache.length, 'habits for user:', _currentUserId || 'guest');

      try {
        if (_habitsCache.length > 0) {
          localStorage.setItem('cultiva-habits', JSON.stringify(_habitsCache));
        } else {
          const existing = localStorage.getItem('cultiva-habits');
          if (!existing || existing === '[]') {
            localStorage.setItem('cultiva-habits', '[]');
          }
        }
      } catch (e) {
        console.warn('[Storage] Could not mirror habits to localStorage:', e);
      }
    } catch (e) {
      console.error('[Storage] Failed to load from IndexedDB:', e);

      const h = localStorage.getItem('cultiva-habits');
      if (h) {
        try {
          const parsed = JSON.parse(h);
          _habitsCache = parsed.map(migrateHabit);
          console.log('[Storage] Loaded', _habitsCache.length, 'habits from localStorage fallback');
        } catch (parseErr) {
          console.error('[Storage] Failed to parse localStorage habits:', parseErr);
          _habitsCache = [];
        }
      }

      const s = localStorage.getItem('cultiva-settings');
      if (s) {
        try {
          const parsed = JSON.parse(s);
          if (parsed && typeof parsed === 'object') {
            _settingsCache = { ...parsed };
          }
        } catch (parseErr) {
          _settingsCache = {};
        }
      }
    }
  },

  async _forceSaveHabits(habits) {
    const validHabits = habits.filter((h) => {
      validateHabit(h);
      return true;
    });

    try {
      await _persistHabitsUpsert(validHabits);
      localStorage.setItem('cultiva-habits', JSON.stringify(validHabits));
    } catch (e) {
      console.error('[Storage] Force save failed:', e);
      localStorage.setItem('cultiva-habits', JSON.stringify(validHabits));
    }
  },

  getHabits() {
    console.log('[Storage] getHabits called, returning', _habitsCache.length, 'habits');
    return _habitsCache;
  },

  async get(key) {
    if (!_isInitialized) {
      await this.init();
    }
    return _settingsCache[key] ?? null;
  },

  getCurrentUserId() {
    return _currentUserId;
  },

  setStorageAuthProbe(fn) {
    _applyStorageAuthProbe(fn);
  },

  getBackendId() {
    const appSettings = _settingsCache['cultiva-settings'];
    if (appSettings && typeof appSettings === 'object' && appSettings.storageBackend) {
      return normalizeStorageBackendId(appSettings.storageBackend);
    }
    return STORAGE_BACKEND_IDS.LOCAL;
  },

  async setBackendId(nextId) {
    const to = normalizeStorageBackendId(nextId);
    const from = this.getBackendId();
    if (from === to) {
      return { changed: false };
    }

    const fromAdapter = _createActiveAdapter(from);
    const toAdapter = _createActiveAdapter(to);
    const result = await migrateStorageBackend(from, to, fromAdapter, toAdapter);

    const appSettings = (await this.get('cultiva-settings')) || {};
    appSettings.storageBackend = to;
    await this.set('cultiva-settings', appSettings);

    return result;
  },

  async exportSnapshot() {
    return buildStorageSnapshot({
      habits: _habitsCache,
      settingsRows: _settingsCache,
      backendId: this.getBackendId()
    });
  },

  async importSnapshot(snapshot) {
    if (!validateStorageSnapshot(snapshot)) {
      throw new Error('STORAGE_SNAPSHOT_INVALID');
    }
    const adapter = _createActiveAdapter(this.getBackendId());
    await importStorageSnapshot(snapshot, adapter);
    await this.flushPendingWrites();
    await this._loadFromDB();
  },

  async flushPendingWrites() {
    if (_habitsWriteScheduled || _habitsWriteWaiters.length > 0) {
      await _flushHabitsToDisk();
    }
    if (_settingsWriteScheduled || _dirtySettingKeys.size > 0) {
      await _flushSettingsToDisk();
    }
  },

  async ensureLocalBackendAfterLogout() {
    if (this.getBackendId() !== STORAGE_BACKEND_IDS.ACCOUNT) {
      return;
    }
    const appSettings = (await this.get('cultiva-settings')) || {};
    appSettings.storageBackend = STORAGE_BACKEND_IDS.LOCAL;
    await this.set('cultiva-settings', appSettings);
  },

  async setCurrentUser(userId) {
    console.log('[Storage] Setting current user:', userId);
    _currentUserId = userId;
    await this._loadFromDB();
  },

  async saveHabits(habits, { immediate = false } = {}) {
    console.log('[Storage] saveHabits called with', habits.length, 'habits');

    const validHabits = habits.filter((h) => {
      validateHabit(h);
      return true;
    });

    const myHabits = validHabits.map((h) => {
      const migrated = migrateHabit(h);
      return {
        ...migrated,
        userId: _currentUserId || null,
        updatedAt: Date.now()
      };
    });

    const prevIds = new Set(_habitsCache.map((h) => h.id));
    const nextIds = new Set(myHabits.map((h) => h.id));
    for (const id of prevIds) {
      if (!nextIds.has(id)) {
        _deletedHabitIds.add(id);
      }
    }

    _habitsCache = myHabits;

    if (immediate) {
      await this._forceSaveHabits(_habitsCache);
      return;
    }

    return _queueHabitsWrite();
  },

  async set(key, value, { immediate = false } = {}) {
    _settingsCache[key] = value;
    if (immediate) {
      return _writeSettingNow(key, value);
    }
    _dirtySettingKeys.add(key);
    return _queueSettingsWrite();
  },

  async clearAll() {
    await this.flushPendingWrites();
    console.log('[Storage] Clearing all data...');
    _habitsCache = [];
    _settingsCache = {};

    try {
      const dbInstance = await db.open();
      await new Promise((resolve, reject) => {
        const tx = dbInstance.transaction(['habits', 'settings', 'sessions'], 'readwrite');
        tx.objectStore('habits').clear();
        tx.objectStore('settings').clear();
        tx.objectStore('sessions').clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('[Storage] Clear failed:', e);
    }

    clearLocalCultivaKeys();
    console.log('[Storage] All data cleared');
  }
};
