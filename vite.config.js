import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        landing: resolve(__dirname, 'src/landing.html')
      }
    }
  },
  server: { 
    port: 3000, 
    open: '/',
    host: true 
  }
});