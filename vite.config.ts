import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const rootDir = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(rootDir, 'app'),
      pages: path.resolve(rootDir, 'pages'),
      features: path.resolve(rootDir, 'features'),
      shared: path.resolve(rootDir, 'shared'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', '**/.git/**', 'e2e/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
