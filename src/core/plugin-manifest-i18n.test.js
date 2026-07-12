import { describe, expect, it } from 'vitest';
import {
  resolvePluginCatalogMeta,
  resolvePluginSettingEmptyMessage,
  resolvePluginSettingLabel,
  resolvePluginSettingOptionLabel
} from './plugin-manifest-i18n.js';

describe('plugin-manifest-i18n', () => {
  it('resolves catalog meta from registry i18n', () => {
    const meta = resolvePluginCatalogMeta({
      name: 'Weather Widget',
      description: 'EN desc',
      i18n: {
        ru: { name: 'Погода', description: 'RU desc' }
      }
    }, 'ru');
    expect(meta.name).toBe('Погода');
    expect(meta.description).toBe('RU desc');
  });

  it('falls back to manifest name when i18n missing', () => {
    const meta = resolvePluginCatalogMeta({ name: 'Clock', description: 'Tick' }, 'en');
    expect(meta.name).toBe('Clock');
    expect(meta.description).toBe('Tick');
  });

  it('resolves setting labels and option labels from field i18n', () => {
    const field = {
      key: 'units',
      label: 'Units',
      i18n: {
        ru: {
          label: 'Единицы',
          options: { celsius: 'Цельсий (°C)' }
        }
      }
    };
    expect(resolvePluginSettingLabel(field, 'ru', 'Units')).toBe('Единицы');
    expect(resolvePluginSettingOptionLabel(field, 'celsius', 'ru', { label: 'Celsius (°C)' })).toBe('Цельсий (°C)');
    expect(resolvePluginSettingOptionLabel(field, 'fahrenheit', 'ru', { label: 'Fahrenheit (°F)' })).toBe('Fahrenheit (°F)');
  });

  it('resolves favorites empty message from field i18n', () => {
    const field = {
      key: 'favorites',
      i18n: {
        en: { emptyMessage: 'Nothing saved yet.' }
      }
    };
    expect(resolvePluginSettingEmptyMessage(field, 'en', 'Fallback')).toBe('Nothing saved yet.');
    expect(resolvePluginSettingEmptyMessage(field, 'ru', 'Fallback')).toBe('Nothing saved yet.');
    expect(resolvePluginSettingEmptyMessage({
      key: 'favorites',
      i18n: { en: { emptyMessage: 'EN' }, ru: { emptyMessage: 'RU' } }
    }, 'ru', 'Fallback')).toBe('RU');
  });
});
