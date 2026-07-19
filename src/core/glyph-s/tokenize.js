/**
 * Query tokenization and extended search grammar.
 * @module tokenize
 */

/**
 * Split a query into lowercase tokens on whitespace / punctuation.
 * @param {string} q
 * @returns {string[]}
 */
export function tokenizeQuery(q) {
  return String(q || '')
    .trim()
    .toLowerCase()
    .split(/[\s#./_\-]+/)
    .filter(Boolean);
}

/**
 * Parse extended query grammar into tokens + structured filters.
 * Supports phrases, exclusions, OR groups, and type/page/app/path/tag filters.
 * @param {string} raw
 * @returns {import('./types.js').ParsedSearchQuery}
 */
export function parseSearchQuery(raw) {
  const text = String(raw || '').trim();
  const filters = {
    type: null,
    page: null,
    app: null,
    path: null,
    tag: null,
    tokens: [],
    required: [],
    excluded: [],
    phrases: [],
    orGroups: [],
  };
  if (!text) return filters;

  const parts = text.match(/"[^"]+"|\([^)]*\)|\S+/g) || [];
  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase();
    if (lower.startsWith('-')) {
      const val = lower.slice(1).trim();
      if (val) filters.excluded.push(val.replace(/^"+|"+$/g, ''));
      continue;
    }
    if (part.startsWith('"') && part.endsWith('"') && part.length > 2) {
      const phrase = part.slice(1, -1).toLowerCase().trim();
      if (phrase) {
        filters.phrases.push(phrase);
        filters.required.push(phrase);
      }
      continue;
    }
    if (part.startsWith('(') && part.endsWith(')')) {
      const inner = part.slice(1, -1).trim();
      if (inner) {
        const vars = inner
          .split(/\s+or\s+/i)
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean);
        if (vars.length > 1) filters.orGroups.push(vars);
        else if (vars.length === 1) {
          filters.tokens.push(vars[0]);
          filters.required.push(vars[0]);
        }
      }
      continue;
    }
    const m = lower.match(/^(type|page|app|path|tag):(.+)$/i);
    if (m) {
      let val = m[2].toLowerCase();
      if (m[1].toLowerCase() === 'tag') val = val.replace(/^#/, '');
      filters[m[1].toLowerCase()] = val;
      continue;
    }
    filters.tokens.push(lower);
    filters.required.push(lower);
  }

  return filters;
}
