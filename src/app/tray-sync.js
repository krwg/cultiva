import { habits } from '../modules/habits.js';
import { getTodayInTZ } from '../core/timezone.js';
import { LEGACY_THRESHOLD } from '../core/config.js';

export function buildTrayHabitPayload() {
  const today = getTodayInTZ();
  return habits.getAll()
    .filter((h) => (h.progress ?? 0) < LEGACY_THRESHOLD && habits.isDueToday(h, today))
    .slice(0, 12)
    .map((h) => {
      const completedToday = h.trackType === 'quantity'
        ? habits.quantityDayProgress(h, today) >= habits.quantityTarget(h)
        : h.lastCompleted === today;
      return { id: h.id, name: h.name, completedToday };
    });
}

export function syncTrayHabits() {
  if (!window.electron?.syncTrayHabits) {
    return;
  }
  void window.electron.syncTrayHabits(buildTrayHabitPayload());
}
