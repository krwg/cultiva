import { habits } from '../modules/habits.js';
import { pluginManager } from '../core/plugin-manager.js';
import { showCompletionUndo } from './completion-undo.js';

export async function toggleHabitWithHooks(id, amount = null) {
  const result = await habits.toggle(id, amount);
  if (!result) {
    return null;
  }
  const { habit, justCompleted, previousAmount } = result;
  if (justCompleted) {
    await pluginManager.triggerHook('onHabitComplete', habit);
    showCompletionUndo(id, previousAmount);
  }
  return habit;
}
