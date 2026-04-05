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

    const userId = storage.getCurrentUserId();

    const newHabit = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      userId: userId || null,
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

    const today = new Date().toISOString().split('T')[0];
    const progress = h.dailyProgress || {};

    const isCompletedOnDate = (dateStr) => {
      if (h.trackType === 'binary') {
        return h.lastCompleted === dateStr;
      } else {
        const val = progress[dateStr] || 0;
        return val >= (h.target || 1);
      }
    };

    let currentStreak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (isCompletedOnDate(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today && new Date().getHours() < 20) {
        break;
      } else {
        break;
      }
    }

    let bestStreak = 0;
    let tempStreak = 0;
    const startDate = new Date(h.startDate || today);
    const endDate = new Date(today);
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isCompletedOnDate(dateStr)) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const totalDays = Math.max(1, Math.floor((new Date(today) - new Date(h.startDate || today)) / (1000 * 60 * 60 * 24)));
    const completedDays = Object.values(progress).filter(v => v >= (h.target || 1)).length +
                         (h.trackType === 'binary' && h.lastCompleted ? 1 : 0);
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      name: h.name,
      stage: this.getStage(h.progress),
      currentStreak,
      bestStreak,
      completionRate,
      totalDays: completedDays,
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
  }
};