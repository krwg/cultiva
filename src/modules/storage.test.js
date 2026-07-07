import { describe, it, expect } from 'vitest';
import { migrateHabitRecord } from './storage.js';

describe('storage migrateHabitRecord', () => {
  it('migrates legacy streak field', () => {
    const out = migrateHabitRecord({ id: '1', name: 'Test', streak: 5, progress: 1 });
    expect(out.currentStreak).toBe(5);
    expect(out.streak).toBeUndefined();
  });

  it('coerces quantity track type and target', () => {
    const out = migrateHabitRecord({ id: '2', name: 'Water', trackType: 'quantity', target: 0 });
    expect(out.trackType).toBe('quantity');
    expect(out.target).toBe(1);
  });

  it('normalizes binary habits to target 1', () => {
    const out = migrateHabitRecord({ id: '3', name: 'Read', trackType: 'binary', target: 10 });
    expect(out.target).toBe(1);
  });
});
