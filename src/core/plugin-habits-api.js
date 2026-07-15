import { habits } from '../modules/habits.js';
import { LEGACY_THRESHOLD } from './config.js';
import { getTodayInTZ } from './timezone.js';

const RECENT_HISTORY_LIMIT = 14;

function recentHistoryDates(habit) {
  const history = Array.isArray(habit?.history) ? habit.history : [];
  return [...new Set(history.filter((d) => typeof d === 'string' && d))]
    .sort()
    .slice(-RECENT_HISTORY_LIMIT);
}

export function buildPluginHabitsSnapshot() {
  const today = getTodayInTZ();
  return habits.getAll()
    .filter((h) => (h.progress ?? 0) < LEGACY_THRESHOLD && !h.paused && !h.archived)
    .map((h) => {
      const trackType = h.trackType === 'quantity' ? 'quantity' : 'binary';
      const target = trackType === 'quantity' ? habits.quantityTarget(h) : 1;
      const todayProgress = trackType === 'quantity'
        ? habits.quantityDayProgress(h, today)
        : (h.lastCompleted === today || (h.history || []).includes(today) ? 1 : 0);
      return {
        id: h.id,
        name: h.treeName || h.name,
        category: h.category || 'other',
        trackType,
        progress: h.progress ?? 0,
        currentStreak: h.currentStreak ?? 0,
        bestStreak: h.bestStreak ?? 0,
        lastCompleted: h.lastCompleted ?? null,
        completedToday: trackType === 'quantity'
          ? todayProgress >= target
          : todayProgress === 1,
        target,
        unit: h.unit || '',
        todayProgress,
        recentHistory: recentHistoryDates(h)
      };
    });
}
