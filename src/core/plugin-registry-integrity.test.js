import { describe, it, expect } from 'vitest';
import { buildPluginInstallFileList, assertRegistrySha256ForFiles } from './plugin-registry-integrity.js';

const HASH = 'a'.repeat(64);

describe('plugin-registry-integrity', () => {
  it('builds file list from manifest styles and data', () => {
    const files = buildPluginInstallFileList(
      {
        entry: 'index.js',
        styles: ['style.css'],
        data: ['cities.json']
      },
      'https://example.com/plugin',
      {
        'manifest.json': HASH,
        'index.js': HASH,
        'style.css': HASH,
        'cities.json': HASH
      }
    );
    expect(files.map((f) => f.name)).toEqual(['manifest.json', 'index.js', 'style.css', 'cities.json']);
  });

  it('rejects install when registry hash is missing', () => {
    const files = buildPluginInstallFileList(
      { entry: 'index.js' },
      'https://example.com/plugin',
      { 'manifest.json': HASH }
    );
    expect(() => assertRegistrySha256ForFiles(files)).toThrow(/index\.js/);
  });

  it('passes when every file has a 64-char hash', () => {
    const files = buildPluginInstallFileList(
      { entry: 'index.js' },
      'https://example.com/plugin',
      { 'manifest.json': HASH, 'index.js': HASH }
    );
    expect(() => assertRegistrySha256ForFiles(files)).not.toThrow();
  });
});
