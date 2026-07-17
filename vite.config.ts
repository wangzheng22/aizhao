import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://wangzheng22.github.io/aizhao/
// Absolute base avoids "./..." resolving to site root when the URL has no trailing slash.
const githubPagesBase = '/aizhao/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [react()],
  server: {
    port: 5174,
  },
}));
