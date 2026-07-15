import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

function createMemoryStorage(initial) {
  const store = { ...initial };
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    }
  };
}

describe('timezone', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createMemoryStorage({}));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('returns local civil date when timezone is auto', async () => {
    // 15:00 UTC is still Jul 10 in most western zones but could differ; use a midday UTC
    // instant and compare against local civil formatting (not toISOString).
    vi.setSystemTime(new Date('2024-07-10T15:00:00.000Z'));
    const { getTodayInTZ, getResolvedTimezone } = await import('./timezone.js');
    const tz = getResolvedTimezone();
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date('2024-07-10T15:00:00.000Z'));
    expect(getTodayInTZ()).toBe(expected);
  });

  it('does not use UTC toISOString for auto near midnight offsets', async () => {
    // Fixed offset simulation: 2024-07-10 02:00 UTC → local civil may be Jul 9 in US.
    vi.setSystemTime(new Date('2024-07-10T02:00:00.000Z'));
    const { getTodayInTZ } = await import('./timezone.js');
    const utcSlice = new Date('2024-07-10T02:00:00.000Z').toISOString().split('T')[0];
    const localCivil = [
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, '0'),
      String(new Date().getDate()).padStart(2, '0')
    ].join('-');
    const result = getTodayInTZ();
    // Result must match local/resolved civil date, not blindly equal UTC ISO when they diverge.
    expect(result).toBe(localCivil);
    if (localCivil !== utcSlice) {
      expect(result).not.toBe(utcSlice);
    }
  });

  it('formats today in a fixed IANA timezone', async () => {
    localStorage.setItem('cultiva-timezone', 'America/New_York');
    vi.setSystemTime(new Date('2024-07-10T02:00:00.000Z'));
    const { getTodayInTZ } = await import('./timezone.js');
    expect(getTodayInTZ()).toBe('2024-07-09');
  });

  it('getDateInTZ respects configured timezone', async () => {
    localStorage.setItem('cultiva-timezone', 'America/New_York');
    const { getDateInTZ } = await import('./timezone.js');
    const d = new Date('2024-12-25T05:00:00.000Z');
    expect(getDateInTZ(d)).toBe('2024-12-25');
  });
});
