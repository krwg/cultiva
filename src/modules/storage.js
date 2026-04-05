import { STORAGE_KEYS } from '../core/config.js';

export const storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Failed to parse ${key}:`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  getHabits() {
    return this.get(STORAGE_KEYS.HABITS) || [];
  },
  
  saveHabits(habits) {
    return this.set(STORAGE_KEYS.HABITS, habits);
  },
  
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS) || {};
  },
  
  saveSettings(settings) {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }
};