import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  isPathInsideDir,
  resolveUnderPluginRoot,
  resolvePluginRelativeFile,
  assertSafeRelativeFileName,
  assertAllowedDownloadUrl,
  isSafePluginId
} = require('../../electron/lib/plugin-path-guards.cjs');

describe('plugin-path-guards', () => {
  const root = path.join('/tmp', 'cultiva-plugins-test');

  it('detects path traversal', () => {
    expect(resolveUnderPluginRoot(root, '../secret.txt')).toBeNull();
    expect(resolveUnderPluginRoot(root, 'weather/manifest.json')).toBe(
      path.resolve(root, 'weather/manifest.json')
    );
  });

  it('validates inside dir checks', () => {
    expect(isPathInsideDir('/tmp/root', '/tmp/root/ok/file')).toBe(true);
    expect(isPathInsideDir('/tmp/root', '/tmp/other/file')).toBe(false);
  });

  it('rejects unsafe file names', () => {
    expect(() => assertSafeRelativeFileName('../x')).toThrow();
    expect(() => assertSafeRelativeFileName('index.js')).not.toThrow();
  });

  it('allows github download hosts only', () => {
    expect(() => assertAllowedDownloadUrl('https://raw.githubusercontent.com/krwg/cultiva-plugins/main/registry.json')).not.toThrow();
    expect(() => assertAllowedDownloadUrl('http://raw.githubusercontent.com/x')).toThrow();
    expect(() => assertAllowedDownloadUrl('https://evil.example/x')).toThrow();
  });

  it('validates plugin ids', () => {
    expect(isSafePluginId('weather')).toBe(true);
    expect(isSafePluginId('../bad')).toBe(false);
  });

  it('rejects cross-plugin relative reads', () => {
    expect(resolvePluginRelativeFile(root, 'weather', '../other/secret.js')).toBeNull();
    expect(resolvePluginRelativeFile(root, 'weather', 'manifest.json')).toBe(
      path.resolve(root, 'weather', 'manifest.json')
    );
    expect(resolvePluginRelativeFile(root, '../evil', 'a.js')).toBeNull();
  });
});
