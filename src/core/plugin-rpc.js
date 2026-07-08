export const PLUGIN_RPC_METHODS = new Set(['storage.get', 'storage.set', 'ui.showNotification', 'data.read', 'app.getLocale', 'app.getThemeColor']);

export function isAllowedPluginRpcMethod(method) {
  return PLUGIN_RPC_METHODS.has(method);
}

export function pluginHasPermission(manifest, permission) {
  const perms = manifest?.permissions;
  if (!Array.isArray(perms)) {
    return false;
  }
  return perms.includes(permission);
}
