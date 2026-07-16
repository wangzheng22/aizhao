import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so Gitee Pages works under https://用户名.gitee.io/仓库名/
  base: './',
  plugins: [react()],
  server: {
    port: 5174,
  },
});
