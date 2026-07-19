/**
 * Glyph Search core: ranking, snippets, index + engine factory.
 * @module engine
 */

import { parseSearchQuery, tokenizeQuery } from './tokenize.js';
import { expandTokenVariants, expandQueryVariants } from './layout.js';
import { getProfileConfig } from './profiles.js';

/** @type {Record<string, number>} */
const CAT_PRIORITY = { page: 40, note: 36, app: 32, release: 30, action: 24, news: 20 };
/** @type {import('./types.js').SearchSettings} */
const SEARCH_SETTINGS = { fuzzyLayout: true, fuzzyTransliteration: true };
const TOKEN_VARIANT_CACHE = new Map();
const SNIPPET_CACHE = new Map();

function bigramOverlap(a, b) {
  if (a.length < 2 || b.length < 2) return 0;
  const grams = new Set();
  for (let i = 0; i < a.length - 1; i++) grams.add(a.slice(i, i + 2));
  let hit = 0;
  for (let i = 0; i < b.length - 1; i++) {
    if (grams.has(b.slice(i, i + 2))) hit++;
  }
  return hit / Math.max(1, b.length - 1);
}

function tokenHitsText(tok, text, settings) {
  const low = String(text || '').toLowerCase();
  const t = String(tok || '').toLowerCase();
  if (t.length && low.includes(t)) return { score: 80, variant: t };
  for (const v of getTokenVariantsCached(tok, settings)) {
    if (v.length && low.includes(v)) return { score: 65, variant: v };
  }
  if (t.length >= 3) {
    const fuzzy = bigramOverlap(t, low.replace(/\s+/g, ''));
    if (fuzzy >= getProfileConfig(settings.profile).fuzzyCutoff) {
      return { score: Math.round(20 * fuzzy), variant: t };
    }
  }
  return null;
}

function getTokenVariantsCached(tok, settings) {
  const profile = String((settings && settings.profile) || 'legacy');
  const cacheKey = `${profile}|${String(tok || '').toLowerCase()}|${settings?.fuzzyLayout !== false}|${settings?.fuzzyTransliteration !== false}`;
  if (TOKEN_VARIANT_CACHE.has(cacheKey)) return TOKEN_VARIANT_CACHE.get(cacheKey);
  const variants = expandTokenVariants(tok, settings);
  TOKEN_VARIANT_CACHE.set(cacheKey, variants);
  if (TOKEN_VARIANT_CACHE.size > 2048) TOKEN_VARIANT_CACHE.delete(TOKEN_VARIANT_CACHE.keys().next().value);
  return variants;
}

/**
 * @param {import('./types.js').SearchItem} it
 * @param {import('./types.js').ParsedSearchQuery|null|undefined} filters
 * @returns {boolean}
 */
export function matchesSearchFilters(it, filters) {
  if (!filters) return true;
  if (filters.type === 'release' && it.cat !== 'release') return false;
  if (filters.page) {
    const hash = (it.hash || '').toLowerCase();
    const title = typeof it.title === 'function' ? it.title().toLowerCase() : '';
    if (!hash.includes(filters.page) && !title.includes(filters.page)) return false;
  }
  if (filters.app) {
    const slug = (it.hash || '').replace('#project/', '').toLowerCase();
    const title = typeof it.title === 'function' ? it.title().toLowerCase() : '';
    const keys = (it.keys || []).join(' ').toLowerCase();
    if (it.cat === 'app' && !slug.includes(filters.app) && !title.includes(filters.app)) return false;
    if (it.cat !== 'app' && !keys.includes(filters.app)) return false;
  }
  if (filters.path) {
    const sub = (it.sub || '').toLowerCase();
    const hash = (it.hash || '').toLowerCase();
    if (!sub.includes(filters.path) && !hash.includes(filters.path)) return false;
  }
  if (filters.tag) {
    const keys = (it.keys || []).join(' ').toLowerCase();
    const body = (typeof it.body === 'function' ? it.body() : it.body || '').toLowerCase();
    if (!keys.includes(filters.tag) && !body.includes(`#${filters.tag}`)) return false;
  }
  return true;
}

/**
 * Score one item against query tokens / filters.
 * @param {import('./types.js').SearchItem} it
 * @param {string[]} tokens
 * @param {import('./types.js').ParsedSearchQuery|null|undefined} filters
 * @param {import('./types.js').SearchSettings} [settings]
 * @returns {number}
 */
export function scoreSearchItem(it, tokens, filters, settings = SEARCH_SETTINGS) {
  if (filters && !matchesSearchFilters(it, filters)) return 0;
  const title = it.title().toLowerCase();
  const sub = (it.sub || '').toLowerCase();
  const keys = (it.keys || []).join(' ').toLowerCase();
  const body = (typeof it.body === 'function' ? it.body() : it.body || '').toLowerCase();
  const blob = `${title} ${sub} ${keys} ${body}`;

  if (!tokens.length) return Math.round((CAT_PRIORITY[it.cat] ?? 10) * getProfileConfig(settings.profile).scoreScale);

  let score = 0;
  const phrase = tokens.join(' ');
  for (const qv of expandQueryVariants(phrase, settings)) {
    if (qv.length > 2 && body.includes(qv)) score = Math.max(score, 112);
    if (qv.length > 2 && blob.includes(qv)) score = Math.max(score, 50);
  }

  for (const tok of tokens) {
    if (title === tok || sub === tok) score += 125;
    else if (title.startsWith(tok)) score += 95;
    else if (sub.startsWith(tok)) score += 72;
    else if (keys.split(/\s+/).some((k) => k === tok)) score += 68;
    else {
      const bodyHit = tokenHitsText(tok, body, settings);
      if (bodyHit) score += 58 + Math.min(20, bodyHit.score - 60);
      else {
        const titleHit = tokenHitsText(tok, title, settings);
        if (titleHit) score += 52;
        else {
          const subHit = tokenHitsText(tok, sub, settings);
          if (subHit) score += 38;
          else {
            const blobHit = tokenHitsText(tok, blob, settings);
            if (blobHit) score += 24;
            else {
              let i = 0;
              let matched = 0;
              for (const ch of tok) {
                i = blob.indexOf(ch, i);
                if (i === -1) break;
                matched++;
                i++;
              }
              if (matched >= Math.max(2, tok.length - 1)) score += 14;
            }
          }
        }
      }
    }
  }
  if (filters && filters.phrases && filters.phrases.length) {
    for (const phraseToken of filters.phrases) {
      if (blob.includes(phraseToken)) score += 34;
      else score -= 18;
    }
  }
  if (filters && filters.excluded && filters.excluded.length) {
    for (const excluded of filters.excluded) {
      if (!excluded) continue;
      if (blob.includes(excluded)) return 0;
    }
  }
  if (filters && filters.orGroups && filters.orGroups.length) {
    for (const group of filters.orGroups) {
      let hit = false;
      for (const variant of group) {
        if (blob.includes(variant)) {
          hit = true;
          score += 12;
          break;
        }
      }
      if (!hit) return 0;
    }
  }
  return Math.round(score * getProfileConfig(settings.profile).scoreScale);
}

function findSnippetInBlob(blob, tok, settings) {
  const low = String(blob || '');
  const tryList = [String(tok || '').toLowerCase()].concat(getTokenVariantsCached(tok, settings));
  for (let i = 0; i < tryList.length; i++) {
    const v = tryList[i];
    if (!v) continue;
    const idx = low.indexOf(v);
    if (idx < 0) continue;
    const sliceStart = Math.max(0, idx - 28);
    const sliceEnd = Math.min(low.length, idx + v.length + 52);
    return {
      slice: low.slice(sliceStart, sliceEnd).replace(/\n/g, ' '),
      variant: v,
      relStart: idx - sliceStart,
    };
  }
  return null;
}

/**
 * Build a short HTML-friendly snippet for the first matching token.
 * @param {import('./types.js').SearchItem} it
 * @param {string[]} tokens
 * @param {(s: string) => string} [esc]
 * @param {import('./types.js').SearchSettings} [settings]
 * @returns {string}
 */
export function snippetForItem(it, tokens, esc = (s) => s, settings = SEARCH_SETTINGS) {
  if (!tokens.length) return '';
  const body = typeof it.body === 'function' ? it.body() : it.body || '';
  if (!body) return '';
  const cacheKey = `${it.hash || it.sub || it.title?.() || 'item'}|${tokens.join('|')}|${settings.profile || 'legacy'}`;
  if (SNIPPET_CACHE.has(cacheKey)) return SNIPPET_CACHE.get(cacheKey);
  for (const tok of tokens) {
    const hit = findSnippetInBlob(body, tok, settings);
    if (!hit) continue;
    const prefix = hit.relStart > 28 ? '…' : '';
    let out = esc(hit.slice);
    const v = hit.variant;
    if (v.length >= 2) {
      out = out.replace(
        new RegExp(`(${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark>$1</mark>'
      );
    }
    const value = prefix + out + '…';
    SNIPPET_CACHE.set(cacheKey, value);
    if (SNIPPET_CACHE.size > 4096) SNIPPET_CACHE.delete(SNIPPET_CACHE.keys().next().value);
    return value;
  }
  return '';
}

function itemBodyText(it) {
  if (!it) return '';
  if (typeof it.body === 'function') return String(it.body() || '');
  return String(it.body || '');
}

/**
 * Cheap haystack for fast-path gating. MUST include body — otherwise
 * paragraph-only hits never reach scoreSearchItem (full-text search broken).
 */
function textBagForItem(it) {
  const title = String(it.title?.() || '').toLowerCase();
  const sub = String(it.sub || '').toLowerCase();
  const keys = (it.keys || []).join(' ').toLowerCase();
  const body = itemBodyText(it).toLowerCase();
  return `${title} ${sub} ${keys} ${body}`;
}

function bagPassesFastPath(bag, tokens, filters) {
  if (!tokens.length) return true;
  const hay = String(bag || '');
  for (const excluded of filters?.excluded || []) {
    if (excluded && hay.includes(excluded)) return false;
  }
  for (const required of filters?.required || []) {
    if (!required) continue;
    if (hay.includes(required)) continue;
    if (required.length >= 4 && hay.includes(required.slice(0, 4))) continue;
    return false;
  }
  for (const group of filters?.orGroups || []) {
    let ok = false;
    for (const g of group) {
      if (hay.includes(g)) {
        ok = true;
        break;
      }
    }
    if (!ok) return false;
  }
  return true;
}

function shouldCandidatePassFastPath(it, tokens, filters) {
  return bagPassesFastPath(textBagForItem(it), tokens, filters);
}

function collectTopK(scored, limit) {
  if (scored.length <= limit) return scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).sort((a, b) => a.score - b.score);
  for (let i = limit; i < scored.length; i++) {
    const cand = scored[i];
    if (cand.score <= top[0].score) continue;
    top[0] = cand;
    top.sort((a, b) => a.score - b.score);
  }
  return top.sort((a, b) => b.score - a.score);
}

/**
 * Rank corpus items for a query string.
 * @param {import('./types.js').SearchItem[]} items
 * @param {string} q
 * @param {import('./types.js').RankSearchOptions} [opts]
 * @returns {import('./types.js').RankedHit[]}
 */
export function rankSearchItems(items, q, opts = {}) {
  const settings = { ...SEARCH_SETTINGS, ...(opts.settings || {}) };
  settings.profile = settings.profile || opts.profile || 'legacy';
  const profileCfg = getProfileConfig(settings.profile);
  const startMs = Date.now();
  const filters = parseSearchQuery(q);
  const tokens = filters.tokens.length ? filters.tokens : tokenizeQuery(q);
  const limit = opts.limit ?? 12;

  // Prefer precomputed bags from buildIndex / createSearchEngine when provided.
  const indexRows = Array.isArray(opts.index?.items) ? opts.index.items : null;
  const sourceLen = indexRows ? indexRows.length : items.length;
  const candidates = [];
  const cap = Math.min(profileCfg.maxCandidates, sourceLen);
  for (let i = 0; i < cap; i++) {
    const row = indexRows ? indexRows[i] : null;
    const it = row ? row.it : items[i];
    if (!matchesSearchFilters(it, filters)) continue;
    const bag = row && typeof row.bag === 'string' ? row.bag : textBagForItem(it);
    if (!bagPassesFastPath(bag, tokens, filters)) continue;
    candidates.push(it);
  }

  const scored = [];
  for (const it of candidates) {
    const score = scoreSearchItem(it, tokens, filters, settings);
    if (score > 0) scored.push({ it, score });
  }

  const out = collectTopK(scored, limit);
  if (typeof opts.onDiagnostics === 'function') {
    opts.onDiagnostics({
      profile: settings.profile,
      inputCount: sourceLen,
      candidateCount: candidates.length,
      scoredCount: scored.length,
      outputCount: out.length,
      elapsedMs: Date.now() - startMs,
    });
  }
  return out;
}

/**
 * Pre-compute text bags for repeated searches.
 * @param {import('./types.js').SearchItem[]} [items]
 * @param {import('./types.js').BuildIndexOptions} [opts]
 * @returns {import('./types.js').SearchIndex}
 */
export function buildIndex(items = [], opts = {}) {
  const profile = opts.profile || 'legacy';
  const index = items.map((it, idx) => ({
    id: idx,
    it,
    bag: textBagForItem(it),
    cat: it.cat || 'note',
  }));
  return { items: index, profile, createdAt: Date.now() };
}

/**
 * Create a reusable search engine bound to an index / items.
 * @param {import('./types.js').CreateSearchEngineOptions} [options]
 * @returns {import('./types.js').SearchEngine}
 */
export function createSearchEngine(options = {}) {
  const profile = options.profile || 'balanced';
  const settings = { ...SEARCH_SETTINGS, ...(options.settings || {}), profile };
  const index = options.index || buildIndex(options.items || [], { profile });
  return {
    profile,
    index,
    search(query, runtime = {}) {
      return rankSearchItems(
        index.items.map((x) => x.it),
        query,
        {
          limit: runtime.limit ?? options.limit ?? 12,
          profile: runtime.profile || profile,
          settings: { ...settings, ...(runtime.settings || {}) },
          onDiagnostics: runtime.onDiagnostics || options.onDiagnostics,
          index,
        }
      );
    },
  };
}

export { parseSearchQuery, tokenizeQuery };
export { getProfileConfig, PROFILE_SETTINGS, PROFILE_IDS } from './profiles.js';
