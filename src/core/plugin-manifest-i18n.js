function resolveLocale(lang) {
  return lang === 'ru' ? 'ru' : 'en';
}

function pickLocaleBlock(source, lang) {
  if (!source || typeof source !== 'object') {
    return null;
  }
  const locale = resolveLocale(lang);
  return source[locale] || source.en || null;
}

export function resolvePluginCatalogMeta(source, lang) {
  if (!source || typeof source !== 'object') {
    return { name: '', description: '' };
  }
  const block = pickLocaleBlock(source.i18n, lang);
  return {
    name: block?.name || source.name || '',
    description: block?.description || source.description || ''
  };
}

export function resolvePluginSettingLabel(field, lang, fallback = '') {
  if (!field || typeof field !== 'object') {
    return fallback;
  }
  const block = pickLocaleBlock(field.i18n, lang);
  return block?.label || field.label || fallback || field.key || '';
}

export function resolvePluginSettingOptionLabel(field, optionValue, lang, opt, fallback = '') {
  if (!field || typeof field !== 'object') {
    return fallback || String(optionValue ?? '');
  }
  const block = pickLocaleBlock(field.i18n, lang);
  const fromOptions = block?.options?.[String(optionValue)];
  if (fromOptions) {
    return fromOptions;
  }
  return opt?.label || fallback || String(optionValue ?? '');
}

export function resolvePluginSettingEmptyMessage(field, lang, fallback = '') {
  if (!field || typeof field !== 'object') {
    return fallback;
  }
  const block = pickLocaleBlock(field.i18n, lang);
  return block?.emptyMessage || field.emptyMessage || fallback;
}
