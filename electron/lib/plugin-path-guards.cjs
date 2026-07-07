const path = require('path');

const PLUGIN_DOWNLOAD_HOSTS = new Set([
  'raw.githubusercontent.com',
  'github.com',
  'objects.githubusercontent.com'
]);

const SAFE_PLUGIN_ID = /^[a-zA-Z0-9_-]{1,128}$/;

function assertAllowedDownloadUrl(urlString) {
  let u;
  try {
    u = new URL(urlString);
  } catch {
    throw new Error('Invalid download URL');
  }
  if (u.protocol !== 'https:') {
    throw new Error('Only HTTPS plugin downloads are allowed');
  }
  if (!PLUGIN_DOWNLOAD_HOSTS.has(u.hostname)) {
    throw new Error(`Blocked plugin download host: ${u.hostname}`);
  }
}

function isPathInsideDir(rootDir, resolvedPath) {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(resolvedPath);
  const prefix = root.endsWith(path.sep) ? root : root + path.sep;
  return resolved === root || resolved.startsWith(prefix);
}

function resolveUnderPluginRoot(pluginFilesDir, relativePath) {
  const cleanPath = String(relativePath).replace(/^cultiva-plugins[\\/]/, '').replace(/^[/\\]+/, '');
  const resolved = path.resolve(pluginFilesDir, cleanPath);
  if (!isPathInsideDir(pluginFilesDir, resolved)) {
    return null;
  }
  return resolved;
}

function assertSafeRelativeFileName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid file name');
  }
  const norm = path.normalize(name);
  if (path.isAbsolute(norm)) {
    throw new Error(`Blocked absolute plugin file path: ${name}`);
  }
  for (const seg of norm.split(/[/\\]/)) {
    if (seg === '..') {
      throw new Error(`Blocked path in plugin file name: ${name}`);
    }
  }
}

function isSafePluginId(pluginId) {
  return SAFE_PLUGIN_ID.test(pluginId);
}

module.exports = {
  PLUGIN_DOWNLOAD_HOSTS,
  SAFE_PLUGIN_ID,
  assertAllowedDownloadUrl,
  isPathInsideDir,
  resolveUnderPluginRoot,
  assertSafeRelativeFileName,
  isSafePluginId
};
