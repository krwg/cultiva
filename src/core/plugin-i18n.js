const PLUGIN_CATALOG = {
  weather: {
    en: { name: 'Weather', description: 'Weather in header and garden, city search, and sheet UI.' },
    ru: { name: 'Погода', description: 'Погода в шапке и саду, поиск города и панель настроек.' }
  },
  time: {
    en: { name: 'Clock', description: 'Live clock, time zones, and accent colors in the header.' },
    ru: { name: 'Часы', description: 'Живые часы, часовые пояса и цвет акцента в шапке.' }
  },
  radio: {
    en: { name: 'Radio', description: 'Internet radio streams with sleep timer and volume.' },
    ru: { name: 'Радио', description: 'Интернет-радио с таймером сна и регулировкой громкости.' }
  },
  pomodoro: {
    en: { name: 'Pomodoro', description: 'Focus timer with work and break cycles in the header.' },
    ru: { name: 'Помодоро', description: 'Таймер фокуса с рабочими и короткими перерывами в шапке.' }
  },
  quote: {
    en: { name: 'Daily Quote', description: 'A fresh motivational quote in the garden each day (1000 EN quotes, favorites).' },
    ru: { name: 'Цитата дня', description: 'Мотивационная цитата в саду каждый день (1000 RU цитат, избранное).' }
  },
  streak: {
    en: { name: 'Streak Highlights', description: 'Celebrate habit streak milestones in the garden.' },
    ru: { name: 'Серии привычек', description: 'Отмечает важные вехи серий привычек в саду.' }
  }
};

const PLUGIN_SETTINGS = {
  weather: {
    city: { en: 'City', ru: 'Город' },
    units: { en: 'Units', ru: 'Единицы' },
    showInGarden: { en: 'Show in garden', ru: 'Показывать в саду' },
    'units.celsius': { en: 'Celsius (°C)', ru: 'Цельсий (°C)' },
    'units.fahrenheit': { en: 'Fahrenheit (°F)', ru: 'Фаренгейт (°F)' }
  },
  quote: {
    favorites: { en: 'Favorite quotes', ru: 'Избранные цитаты' }
  },
  radio: {
    station: { en: 'Default station', ru: 'Станция по умолчанию' },
    volume: { en: 'Volume', ru: 'Громкость' },
    sleepMinutes: { en: 'Sleep timer', ru: 'Таймер сна' },
    'volume.0.25': { en: '25%', ru: '25%' },
    'volume.0.35': { en: '35%', ru: '35%' },
    'volume.0.45': { en: '45%', ru: '45%' },
    'volume.0.55': { en: '55%', ru: '55%' },
    'volume.0.65': { en: '65%', ru: '65%' },
    'volume.0.75': { en: '75%', ru: '75%' },
    'sleepMinutes.0': { en: 'Off', ru: 'Выкл' },
    'sleepMinutes.15': { en: '15 min', ru: '15 мин' },
    'sleepMinutes.30': { en: '30 min', ru: '30 мин' },
    'sleepMinutes.60': { en: '60 min', ru: '60 мин' }
  },
  time: {
    format: { en: 'Time Format', ru: 'Формат времени' },
    color: { en: 'Color', ru: 'Цвет' },
    'format.HH:MM:SS': { en: '23:59:59', ru: '23:59:59' },
    'format.HH:MM': { en: '23:59', ru: '23:59' },
    'format.hh:MM:SS A': { en: '11:59:59 PM', ru: '11:59:59 PM' },
    'color.default': { en: 'Default', ru: 'По умолчанию' },
    'color.green': { en: 'Green', ru: 'Зелёный' },
    'color.blue': { en: 'Blue', ru: 'Синий' },
    'color.purple': { en: 'Purple', ru: 'Фиолетовый' },
    'color.orange': { en: 'Orange', ru: 'Оранжевый' },
    'color.graphite': { en: 'Graphite', ru: 'Графит' },
    'color.rainbow': { en: 'Rainbow', ru: 'Радуга' }
  }
};

function resolveLocale(lang) {
  return lang === 'ru' ? 'ru' : 'en';
}

export function getPluginCatalogStrings(pluginId, lang) {
  const entry = PLUGIN_CATALOG[pluginId];
  if (!entry) {
    return null;
  }
  const locale = lang === 'ru' ? 'ru' : 'en';
  return entry[locale] || entry.en;
}

export function getPluginSettingLabel(pluginId, fieldKey, lang, fallback) {
  const entry = PLUGIN_SETTINGS[pluginId]?.[fieldKey];
  if (!entry) {
    return fallback;
  }
  const locale = resolveLocale(lang);
  return entry[locale] || entry.en || fallback;
}

export function getPluginSettingOptionLabel(pluginId, fieldKey, optionValue, lang, fallback) {
  const entry = PLUGIN_SETTINGS[pluginId]?.[`${fieldKey}.${optionValue}`];
  if (!entry) {
    return fallback;
  }
  const locale = resolveLocale(lang);
  return entry[locale] || entry.en || fallback;
}
