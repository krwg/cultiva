export function buildPluginInstallFileList(manifest, baseUrl, sha256Map) {
  const sh = sha256Map && typeof sha256Map === 'object' ? sha256Map : {};
  const base = String(baseUrl).replace(/\/$/, '');
  const entryFileRaw =
    typeof manifest.entry === 'string' && manifest.entry.trim() ? manifest.entry.trim() : 'index.js';
  const entryFile = entryFileRaw.replace(/^[/\\]+/, '');

  const files = [
    { name: 'manifest.json', url: `${base}/manifest.json`, sha256: sh['manifest.json'] },
    { name: entryFile, url: `${base}/${entryFile}`, sha256: sh[entryFile] }
  ];

  if (Array.isArray(manifest.styles)) {
    for (const rel of manifest.styles) {
      if (typeof rel !== 'string' || !rel.trim()) {
        continue;
      }
      const name = rel.replace(/^[/\\]+/, '');
      files.push({ name, url: `${base}/${name}`, sha256: sh[name] });
    }
  }

  if (Array.isArray(manifest.data)) {
    for (const rel of manifest.data) {
      if (typeof rel !== 'string' || !rel.trim()) {
        continue;
      }
      const name = rel.replace(/^[/\\]+/, '');
      files.push({ name, url: `${base}/${name}`, sha256: sh[name] });
    }
  }

  return files;
}

export function assertRegistrySha256ForFiles(files) {
  const missing = [];
  for (const file of files) {
    const hash = file.sha256;
    if (typeof hash !== 'string' || hash.trim().length !== 64) {
      missing.push(file.name);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Registry missing sha256 for: ${missing.join(', ')}`);
  }
}
