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
    item?.unit
  ].join(' '));
}

function scoreQuery(text, query) {
  if (!query) {
    return 0;
  }
  if (text.includes(query)) {
    return query.length * 10;
  }

  const words = text.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const word of words) {
    if (word.startsWith(query)) {
      score += query.length * 4;
      continue;
    }
    if (word.includes(query)) {
      score += query.length * 2;
    }
  }
  return score;
}

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
