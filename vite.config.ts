import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// In production we serve from https://<user>.github.io/ramp-tracker/
// In dev we serve from /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/ramp-tracker/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
