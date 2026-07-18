function normalizeToken(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function collectSearchText(item) {
  return normalizeToken([
    item?.name,
    item?.description,
    item?.category,
    item?.treeName,
    item?.unit,
    item?.notes,
    item?.bedId,
    item?.tagline,
    ...(Array.isArray(item?.tags) ? item.tags : [])
  ].join(' '));
}

function scoreQuery(text, query) {
  if (!query) {
    return 0;
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return 0;
  }
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) {
      score += token.length * 10;
      continue;
    }
    const words = text.split(/\s+/).filter(Boolean);
    let tokenHit = false;
    for (const word of words) {
      if (word.startsWith(token)) {
        score += token.length * 4;
        tokenHit = true;
        break;
      }
      if (word.includes(token)) {
        score += token.length * 2;
        tokenHit = true;
        break;
      }
    }
    if (!tokenHit) {
      return 0;
    }
  }
  return score;
}

export { normalizeToken };

export function glyphSearch(items, query) {
  const q = normalizeToken(query);
  if (!q) {
    return items;
  }

  return items
    .map((item) => ({ item, score: scoreQuery(collectSearchText(item), q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
