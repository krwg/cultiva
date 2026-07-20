/**
 * Cultiva foundation adapter for glyph-mi (scaffold — habits/metadata hooks later).
 * KNN queries run in the Electron main process when available.
 */

export async function queryGlyphKnn(vector, k = 8) {
  if (typeof window === 'undefined' || !window.electron?.glyphKnnQuery) {
    return { ok: false, results: [], reason: 'knn-ipc-unavailable' };
  }
  const results = await window.electron.glyphKnnQuery(vector, k);
  return { ok: true, results: results || [] };
}

export async function loadGlyphKnnFeatures(rows) {
  if (typeof window === 'undefined' || !window.electron?.glyphKnnLoad) {
    return { ok: false, count: 0, reason: 'knn-ipc-unavailable' };
  }
  return window.electron.glyphKnnLoad(rows);
}

export function analyzeCultivaFoundation(input = {}) {
  return {
    moduleId: 'cultiva',
    provider: 'glyph-mi-cultiva-foundation',
    fields: {
      title: String(input.title || ''),
      tags: Array.isArray(input.tags) ? input.tags : []
    },
    confidence: { score: 0, reasons: ['Cultiva foundation scaffold — MI hooks reserved for a future release'] },
    sources: ['cultiva-foundation'],
    hints: { integrated: false, knn: Boolean(window?.electron?.glyphKnnQuery) }
  };
}
