import { db } from './db.js';

const MIGRATION_FLAG = 'cultiva_migrated_to_idb_v1';
const SESSION_KEY = 'cultiva_current_session';

let _habitsCache = [];
let _settingsCache = {};
let _isInitialized = false;
let _currentUserId = null;

export const storage = {
  async init() {
    if (_isInitialized) return;
    
    // 1. Migration from localStorage (one-time)
    if (!localStorage.getItem(MIGRATION_FLAG)) {
      console.log('[Storage] Migrating localStorage -> IndexedDB...');
      try {
        const habitsJson = localStorage.getItem('cultiva-habits');
        if (habitsJson) {
          const habits = JSON.parse(habitsJson);
          for (const h of habits) await db.put('habits', h);
          localStorage.removeItem('cultiva-habits');
        }
        const settingsJson = localStorage.getItem('cultiva-settings');
        if (settingsJson) {
          const settings = JSON.parse(settingsJson);
          await db.put('settings', { key: 'cultiva-settings', value: settings });
          localStorage.removeItem('cultiva-settings');
        }
        localStorage.setItem(MIGRATION_FLAG, 'true');
        console.log('[Storage] Migration complete');
      } catch (e) {
        console.error('[Storage] Migration failed:', e);
      }
    }

    // 2. CRITICAL FIX: Check for existing session on startup
    try {
        const session = await db.get('sessions', SESSION_KEY);
        if (session) {
            _currentUserId = session.email; // Восстанавливаем контекст пользователя
            console.log('[Storage] Restored session for:', _currentUserId);
        }
    } catch (e) {
        console.error('[Storage] Session check failed:', e);
    }

    // 3. Load habits filtered by the restored user
    await this._loadFromDB();
    _isInitialized = true;
    console.log('[Storage] System ready');
  },

  async _loadFromDB() {
    try {
      const allHabits = await db.getAll('habits');
      const settingsRecord = await db.get('settings', 'cultiva-settings');
      _settingsCache = settingsRecord ? settingsRecord.value : {};
      
      // Filter habits: if logged in show user's habits, else show guest habits
      _habitsCache = _currentUserId
        ? allHabits.filter(h => h.userId === _currentUserId)
        : allHabits.filter(h => !h.userId);
    } catch (e) {
      console.error('[Storage] Failed to load from IndexedDB:', e);
      const h = localStorage.getItem('cultiva-habits');
      if (h) _habitsCache = JSON.parse(h);
      const s = localStorage.getItem('cultiva-settings');
      if (s) _settingsCache = JSON.parse(s);
    }
  },

  getHabits() { return _habitsCache; },
  get(key) { return _settingsCache[key] || null; },
  getCurrentUserId() { return _currentUserId; },

  async setCurrentUser(userId) {
    _currentUserId = userId;
    await this._loadFromDB(); // Перезагружаем кэш
  },

  async saveHabits(habits) {
    // 1. Обновляем кэш
    const myHabits = habits.map(h => ({ ...h, userId: _currentUserId || null }));
    _habitsCache = myHabits;

    // 2. Безопасное сохранение в БД
    // Получаем все привычки из БД, убираем старые привычки ТЕКУЩЕГО юзера, добавляем новые
    try {
        const allHabitsInDB = await db.getAll('habits');
        const otherHabits = allHabitsInDB.filter(h => h.userId !== _currentUserId);
        
        // Очистка стора и перезапись (самый надежный способ при удалении)
        await db.clear('habits');
        
        const finalList = [...otherHabits, ...myHabits];
        for (const h of finalList) {
            await db.put('habits', h);
        }
        
        // Бэкап
        localStorage.setItem('cultiva-habits', JSON.stringify(finalList));
    } catch (e) {
        console.error('[Storage] Save failed:', e);
    }
  },

  async set(key, value) {
    _settingsCache[key] = value;
    await db.put('settings', { key, value });
    localStorage.setItem('cultiva-settings', JSON.stringify(_settingsCache));
  }
};