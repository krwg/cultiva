import { describe, expect, it, vi } from 'vitest';
import { buildPublicAppSettings, invokePluginRpc } from './plugin-api.js';

describe('plugin-api', () => {
  const manifest = { id: 'demo', permissions: ['storage', 'ui', 'settings.read', 'habits.read'] };
  const settings = { lang: 'ru', theme: 'dark', pluginsEnabled: true };

  it('returns public settings snapshot with settings.read', async () => {
    const out = await invokePluginRpc('app.getSettings', [], manifest, {
      storage: { get: vi.fn(), set: vi.fn() },
      storagePrefix: 'plugin_demo_',
      settings,
      readThemeCssColor: () => '#000',
      readPluginDataFile: vi.fn()
    });
    expect(out.lang).toBe('ru');
    expect(out.theme).toBe('dark');
    expect(out.pluginsEnabled).toBe(true);
  });

  it('denies settings.read without permission', async () => {
    await expect(
      invokePluginRpc('app.getSettings', [], { permissions: ['ui'] }, {
        storage: { get: vi.fn(), set: vi.fn() },
        storagePrefix: 'plugin_x_',
        settings,
        readThemeCssColor: () => '#000',
        readPluginDataFile: vi.fn()
      })
    ).rejects.toThrow(/settings\.read/);
  });

  it('removes namespaced storage keys', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    await invokePluginRpc('storage.remove', ['favorites'], manifest, {
      storage: { get: vi.fn(), set },
      storagePrefix: 'plugin_demo_',
      settings,
      readThemeCssColor: () => '#000',
      readPluginDataFile: vi.fn()
    });
    expect(set).toHaveBeenCalledWith('plugin_demo_favorites', null);
  });

  it('buildPublicAppSettings omits sensitive fields', () => {
    const pub = buildPublicAppSettings({ lang: 'en', avatar: { emoji: '🌱' }, accentColor: '#fff' });
    expect(pub.lang).toBe('en');
    expect(pub.avatar).toBeUndefined();
    expect(pub.accentColor).toBeUndefined();
  });
});
