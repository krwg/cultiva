import enStatic from './locales/en.js';

const _locales = { en: enStatic, ru: null };
const _pending = { ru: null };
const EMPTY = Object.freeze({});

function localeKey(lang) {
  return lang === 'ru' ? 'ru' : 'en';
}

export async function ensureI18nLocales(...langs) {
  const keys = [...new Set(langs.map(localeKey))];
  await Promise.all(keys.filter((key) => key === 'ru').map((key) => loadLocale(key)));
}

async function loadLocale(key) {
  if (key === 'en' || _locales[key]) {
    return _locales[key];
  }
  if (!_pending[key]) {
    _pending[key] = import('./locales/ru.js').then((mod) => {
      _locales.ru = mod.default ?? mod;
      return _locales.ru;
    });
  }
  return _pending[key];
}

export function getTranslations(lang) {
  const key = localeKey(lang);
  return _locales[key] || _locales.en || EMPTY;
}

export const TRANSLATIONS = {
  get en() {
    return _locales.en || EMPTY;
  },
  get ru() {
    return _locales.ru || _locales.en || EMPTY;
  }
};
