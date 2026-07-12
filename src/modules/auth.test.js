import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db.js', () => {
  const users = new Map();
  const sessions = new Map();
  return {
    db: {
      get: vi.fn(async (store, key) => {
        if (store === 'users') return users.get(key) || null;
        if (store === 'sessions') return sessions.get(key) || null;
        return null;
      }),
      put: vi.fn(async (store, val) => {
        if (store === 'users') users.set(val.email, val);
        if (store === 'sessions') sessions.set(val.id || 'cultiva_current_session', val);
      }),
      delete: vi.fn(async () => {}),
      _users: users,
      _sessions: sessions
    }
  };
});

vi.mock('./storage.js', () => ({
  storage: {
    getCurrentUserId: () => null,
    getHabits: () => [],
    saveHabits: vi.fn(),
    setCurrentUser: vi.fn()
  }
}));

describe('auth password hashing', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      subtle: {
        importKey: vi.fn(async () => ({})),
        deriveBits: vi.fn(async () => new Uint8Array(32).fill(7))
      },
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      }
    });
    vi.stubGlobal('window', { electron: null });
  });

  it('registers user with hashed credentials', async () => {
    const { auth } = await import('./auth.js');
    await auth.register({
      email: 'test@example.com',
      password: 'secret123',
      name: 'Test'
    });
    const { db } = await import('./db.js');
    const stored = await db.get('users', 'test@example.com');
    expect(stored.email).toBe('test@example.com');
    expect(stored.passwordHash || stored.credentialsEnc).toBeTruthy();
  });

  it('rejects duplicate registration', async () => {
    const { auth } = await import('./auth.js');
    await auth.register({ email: 'dup@test.com', password: 'abcdef', name: 'A' });
    await expect(auth.register({ email: 'dup@test.com', password: 'ghijkl', name: 'B' }))
      .rejects.toThrow();
  });
});
