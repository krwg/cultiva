import { describe, it, expect } from 'vitest';
import { buildHabitsCsv } from './csv-export.js';

describe('buildHabitsCsv', () => {
  it('exports habit completion rows with headers', () => {
    const csv = buildHabitsCsv([
      {
        id: 'h1',
        name: 'Read',
        category: 'learning',
        trackType: 'binary',
        history: ['2026-07-10', '2026-07-11'],
        progress: 2,
        currentStreak: 2
      }
    ]);
    expect(csv).toContain('habit_id,name,category');
    expect(csv).toContain('h1,Read,learning,binary,2026-07-10');
    expect(csv).toContain('2026-07-11');
  });

  it('escapes commas in habit names', () => {
    const csv = buildHabitsCsv([
      {
        id: 'h2',
        name: 'Run, fast',
        trackType: 'binary',
        history: ['2026-07-12'],
        progress: 1,
        currentStreak: 1
      }
    ]);
    expect(csv).toContain('"Run, fast"');
  });
});
