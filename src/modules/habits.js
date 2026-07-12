import { storage } from './storage.js';
import { GROWTH_STAGES, LEGACY_THRESHOLD, MAX_ACTIVE_HABITS, STREAK_GRACE_DAYS_PER_MONTH, GARDEN_FULL_ERROR } from '../core/config.js';
import { getTodayInTZ, getDateInTZ } from '../core/timezone.js';
import {
  normalizeSchedule,
  isDueToday as scheduleIsDueToday,
  isScheduledDay,
  scheduledDaysBetween,
  completionsInWeek,
  weekStartMonday,
  datesInWeek
} from '../core/habit-schedule.js';

function isStreakGraceEnabled() {
  try {
    const raw = localStorage.getItem('cultiva-settings');
    if (!raw) {
      return true;
    }
    const s = JSON.parse(raw);
    return s.streakGraceEnabled !== false;
  } catch {
    return true;
  }
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(aStr, bStr) {
  const a = new Date(aStr);
  const b = new Date(bStr);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export const habits = {
  isGardenVisible(habit) {
    return habit && !habit.paused && !habit.archived;
  },

  isDueToday(habit, todayStr = getTodayInTZ()) {
    return this.isGardenVisible(habit) && scheduleIsDueToday(habit, todayStr);
  },

  normalizeSchedule(schedule) {
    return normalizeSchedule(schedule);
  },

  getGardenHabits() {
    return this.getAll()
      .filter((h) => h.progress < LEGACY_THRESHOLD && this.isGardenVisible(h))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  getAll() {
    return storage.getHabits();
  },

  quantityDayProgress(habit, dayKey) {
    const raw = habit?.dailyProgress?.[dayKey];
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  },

  quantityTarget(habit) {
    const n = Number(habit?.target);
    return Number.isFinite(n) && n > 0 ? n : 1;
  },

  add(data) {
    return this._add(data);
  },

  async _add(data) {
    const allHabits = this.getAll();
    const active = allHabits.filter((h) => h.progress < LEGACY_THRESHOLD && this.isGardenVisible(h));
    if (active.length >= MAX_ACTIVE_HABITS) {
      throw new Error(GARDEN_FULL_ERROR);
    }

    const userId = storage.getCurrentUserId();
    const today = getTodayInTZ();

    const newHabit = {
      id: crypto.randomUUID?.() || Date.now().toString() + Math.random().toString(36),
      userId: userId || null,
      name: data.name,
      description: data.description || '',
      category: data.category || 'other',
      trackType: data.trackType === 'quantity' ? 'quantity' : 'binary',
      target: data.trackType === 'quantity'
        ? (Number.isFinite(Number(data.target)) && Number(data.target) > 0 ? Number(data.target) : 1)
        : 1,
      unit: data.unit || '',
      startDate: data.startDate || today,
      progress: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastCompleted: null,
      history: [],
      dailyProgress: {},
      treeName: null,
      createdAt: new Date().toISOString(),
      sortOrder: Date.now(),
      schedule: normalizeSchedule(data.schedule),
      reminderEnabled: !!data.reminderEnabled,
      reminderTime: data.reminderTime || '09:00'
    };

    allHabits.push(newHabit);
    await storage.saveHabits(allHabits);
    return newHabit;
  },

  toggle(id, amount = null) {
    return this._toggle(id, amount);
  },

  async _toggle(id, amount = null) {
    const allHabits = this.getAll();
    const habit = allHabits.find(h => h.id === id);
    if (!habit) {return null;}

    const today = getTodayInTZ();
    let justCompleted = false;

    if (habit.trackType === 'quantity') {
      const current = this.quantityDayProgress(habit, today);
      const target = this.quantityTarget(habit);
      let newAmount;
      if (amount !== null && amount !== undefined) {
        const n = Number(amount);
        newAmount = Number.isFinite(n) ? n : current;
      } else {
        newAmount = current + 1;
      }
      habit.dailyProgress = habit.dailyProgress || {};
      habit.dailyProgress[today] = newAmount;

      const wasCompleted = current >= target;
      const isCompleted = newAmount >= target;

      if (isCompleted && !wasCompleted) {
        habit.progress++;
        habit.lastCompleted = today;
        if (!habit.history.includes(today)) {habit.history.push(today);}
        justCompleted = true;
      } else if (!isCompleted && wasCompleted) {
        habit.progress = Math.max(0, habit.progress - 1);
        habit.lastCompleted = null;
        habit.history = habit.history.filter(d => d !== today);
      }

      this._recalculateStreaks(habit);
    } else {
      if (habit.lastCompleted === today) {
        habit.lastCompleted = null;
        habit.progress = Math.max(0, habit.progress - 1);
        habit.history = habit.history.filter(d => d !== today);
      } else {
        habit.progress++;
        habit.lastCompleted = today;
        if (!habit.history.includes(today)) {habit.history.push(today);}
        justCompleted = true;
      }

      this._recalculateStreaks(habit);
    }

    await storage.saveHabits(allHabits);
    return { habit, justCompleted };
  },

  _recalculateStreaks(habit) {
    const today = getTodayInTZ();
    const history = habit.history || [];
    const sortedHistory = [...new Set(history)].sort();
    const historySet = new Set(sortedHistory);
    const graceEnabled = isStreakGraceEnabled() && STREAK_GRACE_DAYS_PER_MONTH > 0;
    const schedule = normalizeSchedule(habit.schedule);

    if (schedule.mode === 'weekly') {
      let currentStreak = 0;
      let anchor = today;
      for (let w = 0; w < 104; w++) {
        const count = completionsInWeek(habit, anchor);
        if (count >= schedule.timesPerWeek) {
          currentStreak++;
          const d = new Date(`${weekStartMonday(anchor)}T12:00:00`);
          d.setDate(d.getDate() - 7);
          anchor = d.toISOString().slice(0, 10);
        } else if (anchor === today && count < schedule.timesPerWeek) {
          break;
        } else {
          break;
        }
      }
      habit.currentStreak = currentStreak;
      habit.bestStreak = Math.max(habit.bestStreak || 0, currentStreak);
      return;
    }

    let currentStreak = 0;
    const checkDate = new Date(`${today}T12:00:00`);
    const graceMonthsUsed = new Set();

    while (true) {
      const dateStr = getDateInTZ(checkDate);
      if (!isScheduledDay(habit, dateStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (daysBetween(dateStr, today) > 400) {
          break;
        }
        continue;
      }
      if (historySet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        break;
      } else if (graceEnabled && !graceMonthsUsed.has(monthKey(dateStr))) {
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        let prevStr = getDateInTZ(prev);
        while (!isScheduledDay(habit, prevStr) && daysBetween(prevStr, dateStr) < 14) {
          prev.setDate(prev.getDate() - 1);
          prevStr = getDateInTZ(prev);
        }
        if (historySet.has(prevStr)) {
          graceMonthsUsed.add(monthKey(dateStr));
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }

    let bestStreak = 0;
    let tempStreak = 0;
    const bestGraceMonthsUsed = new Set();
    const scheduledHistory = sortedHistory.filter((d) => isScheduledDay(habit, d));

    for (let i = 0; i < scheduledHistory.length; i++) {
      const currentDate = scheduledHistory[i];

      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = scheduledHistory[i - 1];
        const diffDays = daysBetween(prevDate, currentDate);

        if (diffDays <= 7 && schedule.mode === 'weekdays') {
          let scheduledBetween = 0;
          const cur = new Date(`${prevDate}T12:00:00`);
          const end = new Date(`${currentDate}T12:00:00`);
          cur.setDate(cur.getDate() + 1);
          while (cur < end) {
            const ds = cur.toISOString().slice(0, 10);
            if (isScheduledDay(habit, ds)) {
              scheduledBetween += 1;
            }
            cur.setDate(cur.getDate() + 1);
          }
          if (scheduledBetween === 0) {
            tempStreak++;
          } else if (
            graceEnabled
            && scheduledBetween === 1
            && !bestGraceMonthsUsed.has(monthKey(currentDate))
          ) {
            bestGraceMonthsUsed.add(monthKey(currentDate));
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else if (diffDays === 1) {
          tempStreak++;
        } else if (
          graceEnabled
          && diffDays === 2
          && !bestGraceMonthsUsed.has(monthKey(currentDate))
        ) {
          bestGraceMonthsUsed.add(monthKey(currentDate));
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      bestStreak = Math.max(bestStreak, tempStreak);
    }

    if (habit.lastCompleted !== today && schedule.mode !== 'weekly') {
      const lastDate = scheduledHistory[scheduledHistory.length - 1];
      if (lastDate) {
        const diffDays = daysBetween(lastDate, today);
        if (diffDays > 1 && !(graceEnabled && diffDays === 2)) {
          currentStreak = 0;
        }
      }
    }

    habit.currentStreak = currentStreak;
    habit.bestStreak = Math.max(habit.bestStreak || 0, bestStreak, currentStreak);
  },

  recalculateAllStreaks() {
    return this._recalculateAllStreaks();
  },

  async _recalculateAllStreaks() {
    const allHabits = this.getAll();
    allHabits.forEach((h) => this._recalculateStreaks(h));
    await storage.saveHabits(allHabits);
  },

  remove(id) {
    return this._remove(id);
  },

  async _remove(id) {
    const allHabits = this.getAll().filter(h => h.id !== id);
    await storage.saveHabits(allHabits);
  },

  async setPaused(id, paused) {
    const allHabits = this.getAll();
    const habit = allHabits.find((h) => h.id === id);
    if (!habit) {
      return null;
    }
    habit.paused = !!paused;
    if (habit.paused) {
      habit.archived = false;
    }
    await storage.saveHabits(allHabits);
    return habit;
  },

  async setArchived(id, archived) {
    const allHabits = this.getAll();
    const habit = allHabits.find((h) => h.id === id);
    if (!habit) {
      return null;
    }
    habit.archived = !!archived;
    if (habit.archived) {
      habit.paused = false;
    }
    await storage.saveHabits(allHabits);
    return habit;
  },

  async reorder(id, delta) {
    const ordered = this.getGardenHabits();
    const idx = ordered.findIndex((h) => h.id === id);
    const swapIdx = idx + delta;
    if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) {
      return false;
    }
    const allHabits = this.getAll();
    const current = allHabits.find((h) => h.id === ordered[idx].id);
    const neighbor = allHabits.find((h) => h.id === ordered[swapIdx].id);
    if (!current || !neighbor) {
      return false;
    }
    const tmp = current.sortOrder;
    current.sortOrder = neighbor.sortOrder;
    neighbor.sortOrder = tmp;
    await storage.saveHabits(allHabits);
    return true;
  },

  getStage(progress) {
    for (const key in GROWTH_STAGES) {
      const stage = GROWTH_STAGES[key];
      if (progress >= stage.min && progress <= stage.max) {return stage;}
    }
    return GROWTH_STAGES.SEED;
  },

  getStats(id) {
    const h = this.getAll().find(x => x.id === id);
    if (!h) {return null;}

    const today = getTodayInTZ();
    const startDate = h.startDate || today;

    const totalDays = scheduledDaysBetween(startDate, today, h.schedule);
    const completedDays = h.history?.length || 0;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      name: h.name,
      stage: this.getStage(h.progress),
      currentStreak: h.currentStreak || 0,
      bestStreak: h.bestStreak || 0,
      completionRate,
      totalDays: completedDays,
      trackType: h.trackType,
      target: h.target,
      unit: h.unit
    };
  },

  getCalendarData(id) {
    const h = this.getAll().find(x => x.id === id);
    if (!h) {return [];}

    const start = new Date();
    start.setDate(start.getDate() - 364);

    const days = [];
    const historySet = new Set(h.history || []);

    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const ds = getDateInTZ(d);
      let level = 0;

      if (historySet.has(ds)) {
        if (h.trackType === 'quantity') {
          const cur = this.quantityDayProgress(h, ds);
          const tgt = this.quantityTarget(h);
          const pct = cur / tgt;
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
