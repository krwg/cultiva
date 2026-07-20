/**
 * Cultiva adapter for glyph-s 2.8.0 (FlokeStudio/glyph-s).
 * Maps habit/plugin-shaped objects onto the engine item API.
 * @see https://github.com/FlokeStudio/glyph-s
 */
import { rankSearchItems, createSearchEngine } from './glyph-s/engine.js';

const ENGINE_VERSION = '2.8.0';

function normalizeToken(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function toGlyphItem(item) {
  const name = String(item?.name || item?.title || item?.id || '');
  const description = String(item?.description || item?.text || '');
  const tags = Array.isArray(item?.tags) ? item.tags.map(String) : [];
  const keys = [
    ...tags,
    item?.category,
    item?.treeName,
    item?.unit,
    item?.bedId,
    item?.tagline,
    item?.type
  ].filter(Boolean).map(String);

  return {
    cat: String(item?.category || item?.type || 'note'),
    title: () => name,
    sub: String(item?.id || ''),
    keys,
    body: () => [description, item?.notes, item?.tagline].filter(Boolean).join(' '),
    _src: item
  };
}

export { normalizeToken, ENGINE_VERSION, createSearchEngine };

export function glyphSearch(items, query, opts = {}) {
  const list = Array.isArray(items) ? items : [];
  const q = String(query || '').trim();
  if (!q) {
    return list;
  }

  const mapped = list.map(toGlyphItem);
  const ranked = rankSearchItems(mapped, q, {
    limit: opts.limit ?? Math.max(list.length, 12),
    profile: opts.profile || 'balanced',
    settings: {
      fuzzyLayout: true,
      fuzzyTransliteration: true,
      profile: opts.profile || 'balanced'
    }
  });

  return ranked
    .map((row) => row?.it?._src)
    .filter(Boolean);
}
