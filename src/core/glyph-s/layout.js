export const EN2RU = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  '[': 'х', ']': 'ъ', a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л',
  l: 'д', ';': 'ж', "'": 'э', z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь',
  ',': 'б', '.': 'ю',
};
export const RU2EN = {};
Object.keys(EN2RU).forEach((k) => {
  RU2EN[EN2RU[k]] = k;
});

export function swapKeyboardEnToRu(s) {
  let out = '';
  const low = String(s || '').toLowerCase();
  for (let i = 0; i < low.length; i++) out += EN2RU[low.charAt(i)] || low.charAt(i);
  return out;
}

export function swapKeyboardRuToEn(s) {
  let out = '';
  const low = String(s || '').toLowerCase();
  for (let i = 0; i < low.length; i++) out += RU2EN[low.charAt(i)] || low.charAt(i);
  return out;
}

const LAT2CYR = {
  sh: 'ш', ch: 'ч', zh: 'ж', ya: 'я', yo: 'ё', yu: 'ю', ye: 'е',
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', z: 'з', i: 'и',
  y: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р',
  s: 'с', t: 'т', u: 'у', f: 'ф', h: 'х', c: 'ц', w: 'в', x: 'кс', j: 'дж', q: 'к',
};
const CYR2LAT = {};
Object.keys(LAT2CYR).forEach((k) => {
  const v = LAT2CYR[k];
  if (!CYR2LAT[v] || k.length > CYR2LAT[v].length) CYR2LAT[v] = k;
});

export function latinToCyrillicRough(s) {
  let x = String(s || '').toLowerCase();
  let out = '';
  let i = 0;
  while (i < x.length) {
    let matched = false;
    for (let len = 2; len >= 1; len--) {
      const part = x.slice(i, i + len);
      if (LAT2CYR[part]) {
        out += LAT2CYR[part];
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += x.charAt(i);
      i++;
    }
  }
  return out;
}

export function cyrillicToLatinRough(s) {
  let x = String(s || '').toLowerCase();
  const keys = Object.keys(CYR2LAT).sort((a, b) => b.length - a.length);
  let out = '';
  let i = 0;
  while (i < x.length) {
    let matched = false;
    for (let ki = 0; ki < keys.length; ki++) {
      const cyr = keys[ki];
      if (x.slice(i, i + cyr.length) === cyr) {
        out += CYR2LAT[cyr];
        i += cyr.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += x.charAt(i);
      i++;
    }
  }
  return out;
}

export function expandTokenVariants(tok, settings = {}) {
  const set = new Set();
  const t = String(tok || '').toLowerCase().trim();
  if (!t) return [];
  set.add(t);
  if (settings.fuzzyLayout !== false) {
    const ru = swapKeyboardEnToRu(t);
    const en = swapKeyboardRuToEn(t);
    if (ru && ru !== t) set.add(ru);
    if (en && en !== t) set.add(en);
  }
  if (settings.fuzzyTransliteration !== false) {
    const cyr = latinToCyrillicRough(t);
    const lat = cyrillicToLatinRough(t);
    if (cyr && cyr !== t) set.add(cyr);
    if (lat && lat !== t) set.add(lat);
  }
  return Array.from(set).filter((v) => v.length >= 1);
}

export function expandQueryVariants(rawQ, settings = {}) {
  const q = String(rawQ || '').trim();
  if (!q) return [];
  const set = new Set([q.toLowerCase()]);
  if (settings.fuzzyLayout !== false) {
    const ru = swapKeyboardEnToRu(q);
    const en = swapKeyboardRuToEn(q);
    if (ru !== q) set.add(ru);
    if (en !== q) set.add(en);
  }
  if (settings.fuzzyTransliteration !== false) {
    const cyr = latinToCyrillicRough(q);
    const lat = cyrillicToLatinRough(q);
    if (cyr !== q) set.add(cyr);
    if (lat !== q) set.add(lat);
  }
  return Array.from(set);
}
