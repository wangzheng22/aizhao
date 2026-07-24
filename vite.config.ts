import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// GitHub Pages project site: https://wangzheng22.github.io/aizhao/aiping/
const githubPagesBase = '/aizhao/aiping/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase : '/',
  plugins: [react(), svgr()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
}))
