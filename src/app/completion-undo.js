import { habits } from '../modules/habits.js';
import { showNotification } from './ui-shell.js';
import { TRANSLATIONS } from '../core/i18n.js';
import { settings } from './renderer-bootstrap.js';

export function showCompletionUndo(habitId, previousAmount = null) {
  const t = TRANSLATIONS[settings.lang] || TRANSLATIONS.en;
  showNotification(
    '',
    t.progressSaved || 'Progress saved',
    '',
    t.undo || 'Undo',
    () => {
      void habits.undoCompletion(habitId, previousAmount).then(() => {
        window.dispatchEvent(new CustomEvent('cultiva-garden-refresh'));
      });
    }
  );
}
