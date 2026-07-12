import { describe, it, expect } from 'vitest';
import { isAllowedPluginRpcMethod, pluginHasPermission } from './plugin-rpc.js';

describe('plugin-rpc', () => {
  it('allows storage and ui rpc methods', () => {
    expect(isAllowedPluginRpcMethod('storage.get')).toBe(true);
    expect(isAllowedPluginRpcMethod('storage.set')).toBe(true);
    expect(isAllowedPluginRpcMethod('ui.showNotification')).toBe(true);
    expect(isAllowedPluginRpcMethod('app.getHabits')).toBe(true);
    expect(isAllowedPluginRpcMethod('network.fetch')).toBe(false);
  });

  it('checks manifest permissions', () => {
    const manifest = { permissions: ['storage', 'ui'] };
    expect(pluginHasPermission(manifest, 'storage')).toBe(true);
    expect(pluginHasPermission(manifest, 'network')).toBe(false);
    expect(pluginHasPermission({ permissions: ['habits.read'] }, 'habits.read')).toBe(true);
    expect(pluginHasPermission({}, 'storage')).toBe(false);
  });
});
