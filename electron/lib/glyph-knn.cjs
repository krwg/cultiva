'use strict';

function vectorSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || !a.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function createKnnStore() {
  const store = new Map();

  function loadFeatures(rows) {
    store.clear();
    for (const row of rows || []) {
      const trackId = row.track_id ?? row.id;
      if (trackId == null) continue;
      const vector = row.title_vec ?? row.vector;
      if (!vector || !vector.length) continue;
      const normalized = vector instanceof Float32Array ? vector : Float32Array.from(vector);
      store.set(String(trackId), {
        track_id: trackId,
        vector: normalized,
        artist_norm: row.artist_norm ?? '',
        album: row.album ?? '',
        genre: row.genre ?? '',
        bpm: row.bpm ?? 0,
        energy: row.energy ?? 0
      });
    }
    return store.size;
  }

  function query(vector, k = 8) {
    const queryVec = vector instanceof Float32Array ? vector : Float32Array.from(vector || []);
    const scored = [];
    for (const entry of store.values()) {
      scored.push({
        track_id: entry.track_id,
        similarity: vectorSimilarity(queryVec, entry.vector),
        artist_norm: entry.artist_norm,
        album: entry.album,
        genre: entry.genre,
        bpm: entry.bpm,
        energy: entry.energy
      });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, Math.max(1, k));
  }

  return { loadFeatures, query, size: () => store.size };
}

const knnStore = createKnnStore();

function registerGlyphKnnIpc(ipcMain) {
  ipcMain.handle('glyph:knn:load', (_event, rows) => {
    const count = knnStore.loadFeatures(rows);
    return { ok: true, count };
  });

  ipcMain.handle('glyph:knn:query', (_event, vector, k) => {
    return knnStore.query(vector, k);
  });

  ipcMain.handle('glyph:knn:status', () => ({
    ok: true,
    count: knnStore.size()
  }));
}

module.exports = { registerGlyphKnnIpc, createKnnStore };
