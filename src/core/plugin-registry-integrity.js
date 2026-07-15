import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildPluginInstallFileList,
  assertRegistrySha256ForFiles
} = require('../../electron/lib/plugin-registry-integrity.cjs');

export { buildPluginInstallFileList, assertRegistrySha256ForFiles };
