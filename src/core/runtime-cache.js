const TTL_MS = 15 * 60 * 1000;

const _entries = new Map();

export function cacheGet(key) {
  const row = _entries.get(key);
  if (!row) {
    return null;
  }
  if (Date.now() > row.expiresAt) {
    _entries.delete(key);
    return null;
  }
  return row.value;
}

export function cacheSet(key, value, ttlMs = TTL_MS) {
  _entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function cacheInvalidate(key) {
  if (key) {
    _entries.delete(key);
    return;
  }
  _entries.clear();
}

export async function cacheFetch(key, fetcher, ttlMs = TTL_MS) {
  const hit = cacheGet(key);
  if (hit !== null) {
    return hit;
  }
  const value = await fetcher();
  return cacheSet(key, value, ttlMs);
}
