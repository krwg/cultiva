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
    en: { name: 'Daily Quote', description: 'A fresh motivational quote in the garden each day (500 EN quotes).' },
    ru: { name: 'Цитата дня', description: 'Мотивационная цитата в саду каждый день (500 RU цитат).' }
  },
  streak: {
    en: { name: 'Streak Highlights', description: 'Celebrate habit streak milestones in the garden.' },
    ru: { name: 'Серии привычек', description: 'Отмечает важные вехи серий привычек в саду.' }
  }
};

export function getPluginCatalogStrings(pluginId, lang) {
  const entry = PLUGIN_CATALOG[pluginId];
  if (!entry) {
    return null;
  }
  const locale = lang === 'ru' ? 'ru' : 'en';
  return entry[locale] || entry.en;
}
