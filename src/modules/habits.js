import { storage } from './storage.js';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS } from '../core/config.js';

export const habits = {
  getAll() {
    return storage.getHabits();
  },

  add(data) {
    const habits = this.getAll();
    const active = habits.filter(h => h.progress < LEGACY_THRESHOLD);
    
    if (active.length >= MAX_ACTIVE_HABITS) {
      throw new Error('Garden is full');
    }

    const newHabit = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      name: data.name,
      description: data.description || '',
      category: data.category || 'other',
      trackType: data.trackType || 'binary',
      target: data.target || 1,
      unit: data.unit || '',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      progress: 0,
      streak: 0,
      lastCompleted: null,
      history: [],
      dailyProgress: {},
      treeName: null,
      createdAt: new Date().toISOString()
    };

    habits.push(newHabit);
    storage.saveHabits(habits);
    return newHabit;
  },

  toggle(id) {
    const habits = this.getAll();
    const habit = habits.find(h => h.id === id);
    if (!habit) return null;

    const today = new Date().toISOString().split('T')[0];
    
    if (habit.trackType === 'binary') {
      if (habit.lastCompleted === today) {
        habit.lastCompleted = null;
        habit.progress = Math.max(0, habit.progress - 1);
        habit.history = habit.history.filter(d => d !== today);
      } else {
        habit.streak++;
        habit.progress++;
        habit.lastCompleted = today;
        if (!habit.history.includes(today)) {
          habit.history.push(today);
        }
      }
    }
    storage.saveHabits(habits);
    return habit;
  },

  remove(id) {
    const habits = this.getAll().filter(h => h.id !== id);
    storage.saveHabits(habits);
  },

  getStage(progress) {
    for (let key in GROWTH_STAGES) {
      const stage = GROWTH_STAGES[key];
      if (progress >= stage.min && progress <= stage.max) {
        return stage;
      }
    }
    return GROWTH_STAGES.SEED;
  }
};