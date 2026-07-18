import { glyphSearch, normalizeToken } from './glyph-s-search.js';

const INDEX_KEY = 'cultiva_glyph_search_index_v1';
const STATUS_KEY = 'cultiva_glyph_search_status_v1';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    void 0;
  }
}

export function getGlyphSearchStatus() {
  const status = readJson(STATUS_KEY, null);
  if (status && typeof status === 'object') {
    return status;
  }
  return {
    ready: false,
    count: 0,
    updatedAt: null,
    message: 'idle'
  };
}

export function setGlyphSearchEnhanced(enabled) {
  try {
    localStorage.setItem('cultiva_glyph_search_enhanced', enabled ? '1' : '0');
  } catch {
    void 0;
  }
}

export function isGlyphSearchEnhanced() {
  try {
    const v = localStorage.getItem('cultiva_glyph_search_enhanced');
    if (v === null) {
      return true;
    }
    return v === '1';
  } catch {
    return true;
  }
}

function pushDoc(docs, doc) {
  const text = normalizeToken(doc.text || '');
  if (!text) {
    return;
  }
  docs.push({
    id: String(doc.id || ''),
    type: String(doc.type || 'other'),
    title: String(doc.title || doc.id || ''),
    text,
    meta: doc.meta || {}
  });
}

export function buildGlyphSearchIndex(sources = {}) {
  const docs = [];
  const habits = Array.isArray(sources.habits) ? sources.habits : [];
  for (const h of habits) {
    pushDoc(docs, {
      id: h.id,
      type: 'habit',
      title: h.name || h.id,
      text: [h.name, h.description, h.category, h.treeName, h.unit, h.bedId, h.notes].join(' '),
      meta: { habitId: h.id }
    });
  }

  const beds = Array.isArray(sources.beds) ? sources.beds : [];
  for (const b of beds) {
    pushDoc(docs, {
      id: `bed:${b.id}`,
      type: 'bed',
      title: b.name || b.id,
      text: [b.name, b.id].join(' '),
      meta: { bedId: b.id }
    });
  }

  const plugins = Array.isArray(sources.plugins) ? sources.plugins : [];
  for (const p of plugins) {
    pushDoc(docs, {
      id: `plugin:${p.id}`,
      type: 'plugin',
      title: p.name || p.id,
      text: [p.id, p.name, p.description, p.tagline, ...(Array.isArray(p.tags) ? p.tags : [])].join(' '),
      meta: { pluginId: p.id }
    });
  }

  const events = Array.isArray(sources.events) ? sources.events : [];
  for (const e of events) {
    pushDoc(docs, {
      id: `event:${e.id}`,
      type: 'event',
      title: e.title || e.name || e.id,
      text: [e.title, e.name, e.description, e.location, e.date].join(' '),
      meta: { eventId: e.id }
    });
  }

  const settingsLabels = Array.isArray(sources.settingsLabels) ? sources.settingsLabels : [];
  for (const s of settingsLabels) {
    pushDoc(docs, {
      id: `setting:${s.id}`,
      type: 'setting',
      title: s.title || s.id,
      text: [s.title, s.description, s.section].join(' '),
      meta: { section: s.section || s.id }
    });
  }

  writeJson(INDEX_KEY, { docs, version: 1 });
  const status = {
    ready: true,
    count: docs.length,
    updatedAt: new Date().toISOString(),
    message: 'ready'
  };
  writeJson(STATUS_KEY, status);
  return status;
}

export function queryGlyphSearchIndex(query, limit = 40) {
  const pack = readJson(INDEX_KEY, { docs: [] });
  const docs = Array.isArray(pack.docs) ? pack.docs : [];
  const mapped = docs.map((d) => ({
    name: d.title,
    description: d.text,
    category: d.type,
    _doc: d
  }));
  return glyphSearch(mapped, query)
    .slice(0, limit)
    .map((row) => row._doc);
}

export function filterHabitsWithIndex(habits, query) {
  if (!isGlyphSearchEnhanced()) {
    return glyphSearch(habits, query);
  }
  const q = normalizeToken(query);
  if (!q) {
    return habits;
  }
  const hits = queryGlyphSearchIndex(query, 200);
  const habitIds = new Set(hits.filter((h) => h.type === 'habit').map((h) => h.meta?.habitId || h.id));
  if (!habitIds.size) {
    return glyphSearch(habits, query);
  }
  const ranked = [];
  for (const id of habitIds) {
    const hit = habits.find((h) => h.id === id);
    if (hit) {
      ranked.push(hit);
    }
  }
  const fallback = glyphSearch(habits, query).filter((h) => !ranked.some((r) => r.id === h.id));
  return [...ranked, ...fallback];
}
