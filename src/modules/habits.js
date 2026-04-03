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

  toggle(id, amount = null) {
    const habits = this.getAll();
    const habit = habits.find(h => h.id === id);
    if (!habit) return null;
    const today = new Date().toISOString().split('T')[0];
    if (habit.trackType === 'quantity') {
      const current = habit.dailyProgress[today] || 0;
      const newAmount = amount !== null ? amount : current;
      habit.dailyProgress[today] = newAmount;
      if (newAmount >= habit.target && current < habit.target) {
        habit.progress++;
        habit.lastCompleted = today;
        if (!habit.history.includes(today)) habit.history.push(today);
      } else if (newAmount < habit.target && current >= habit.target) {
        habit.progress = Math.max(0, habit.progress - 1);
        habit.lastCompleted = null;
        habit.history = habit.history.filter(d => d !== today);
      }
    } else {
      if (habit.lastCompleted === today) {
        habit.lastCompleted = null;
        habit.progress = Math.max(0, habit.progress - 1);
        habit.history = habit.history.filter(d => d !== today);
      } else {
        habit.streak++;
        habit.progress++;
        habit.lastCompleted = today;
        if (!habit.history.includes(today)) habit.history.push(today);
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
      if (progress >= stage.min && progress <= stage.max) return stage;
    }
    return GROWTH_STAGES.SEED;
  },

  getStats(id) {
    const h = this.getAll().find(x => x.id === id);
    if (!h) return null;
    const days = Math.max(1, Math.floor((Date.now() - new Date(h.startDate)) / (1000 * 60 * 60 * 24)));
    const rate = Math.round((h.history.length / days) * 100);
    return {
      name: h.name,
      stage: this.getStage(h.progress),
      currentStreak: h.streak,
      bestStreak: this._calcBestStreak(h.history),
      completionRate: rate,
      totalDays: h.history.length,
      trackType: h.trackType,
      target: h.target,
      unit: h.unit
    };
  },

  getCalendarData(id) {
    const h = this.getAll().find(x => x.id === id);
    if (!h) return [];
    const today = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 364);
    const days = [];
    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      let level = 0;
      if (h.history.includes(ds)) {
        if (h.trackType === 'quantity') {
          const pct = (h.dailyProgress[ds] || 0) / h.target;
          level = Math.min(4, Math.floor(pct * 4));
        } else {
          level = 4;
        }
      }
      days.push({ date: ds, level });
    }
    return days;
  },

  _calcBestStreak(history) {
    if (!history?.length) return 0;
    const sorted = [...history].sort();
    let best = 1;
    let current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        best = Math.max(best, current);
      } else if (diff > 1) {
        current = 1;
      }
    }
    return best;
  }
};