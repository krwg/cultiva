export function embedTextSync(text) {
  const dim = 64;
  const vec = new Float32Array(dim);
  const low = String(text || '').toLowerCase();
  for (let i = 0; i < low.length; i++) {
    const code = low.charCodeAt(i);
    vec[code % dim] += 1;
    vec[(code * 7 + i) % dim] += 0.5;
  }
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < dim; i++) vec[i] /= norm;
  return vec;
}

export function embeddingBoost(queryVector, itemVector, weight = 12) {
  if (!queryVector || !itemVector) return 0;
  const q = queryVector instanceof Float32Array ? queryVector : Float32Array.from(queryVector);
  const it = itemVector instanceof Float32Array ? itemVector : Float32Array.from(itemVector);
  if (q.length !== it.length || !q.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < q.length; i++) {
    dot += q[i] * it[i];
    na += q[i] * q[i];
    nb += it[i] * it[i];
  }
  if (!na || !nb) return 0;
  const sim = dot / (Math.sqrt(na) * Math.sqrt(nb));
  if (sim <= 0.05) return 0;
  return Math.round(sim * weight);
}

export async function embedTexts() {
  return null;
}
