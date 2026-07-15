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

  it('compareVersions returns -1/0/1 including equality', async () => {
    const compareVersions = (a, b) => {
      const strip = (v) => String(v || '').split(/[-+]/)[0];
      const ap = strip(a).split('.').map((x) => parseInt(x, 10) || 0);
      const bp = strip(b).split('.').map((x) => parseInt(x, 10) || 0);
      for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
        const av = ap[i] || 0;
        const bv = bp[i] || 0;
        if (av < bv) {
          return -1;
        }
        if (av > bv) {
          return 1;
        }
      }
      return 0;
    };
    const deps = {
      storage: { get: vi.fn(), set: vi.fn() },
      storagePrefix: 'plugin_demo_',
      settings,
      readThemeCssColor: () => '#000',
      readPluginDataFile: vi.fn(),
      compareVersions
    };
    expect(await invokePluginRpc('app.compareVersions', ['1.2.0', '1.2.0'], manifest, deps)).toBe(0);
    expect(await invokePluginRpc('app.compareVersions', ['1.3.0', '1.2.0'], manifest, deps)).toBe(1);
    expect(await invokePluginRpc('app.compareVersions', ['1.1.0', '1.2.0'], manifest, deps)).toBe(-1);
  });
});
