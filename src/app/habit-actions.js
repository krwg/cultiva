import { habits } from '../modules/habits.js';
import { pluginManager } from '../core/plugin-manager.js';

export async function toggleHabitWithHooks(id, amount = null) {
  const result = habits.toggle(id, amount);
  if (!result) {
    return null;
  }
  const { habit, justCompleted } = result;
  if (justCompleted) {
    await pluginManager.triggerHook('onHabitComplete', habit);
  }
  return habit;
}
