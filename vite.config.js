// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // important for relative paths in Vercel
  build: {
    outDir: 'dist', // where the built site will go
    emptyOutDir: true
  },
  server: {
    port: 3000, // localhost:3000 during dev
    open: true // automatically open browser
  }
});
