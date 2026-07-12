import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: '../public',

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        calendar: resolve(__dirname, 'src/pages/calendar/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('core/locales/ru.js')) {
            return 'locale-ru';
          }
          if (id.includes('modules/storage') || id.includes('modules/db.js') || id.includes('modules/auth')) {
            return 'storage';
          }
          if (id.includes('plugin-manager') || id.includes('plugin-sandbox-host') || id.includes('plugin-api')) {
            return 'plugins';
          }
          if (id.includes('rowan-cluster-bg')) {
            return 'rowan-canvas';
          }
          if (id.includes('ambient-bg.js')) {
            return 'ambient-runtime';
          }
        }
      }
    }
  },

  server: {
    port: 3000,
  },
});
