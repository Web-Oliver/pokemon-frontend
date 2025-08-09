import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      threshold: {
        global: {
          lines: 20,
          functions: 20,
          branches: 20,
          statements: 20
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'src': resolve(__dirname, './src'),
      'shared': resolve(__dirname, './src/shared'),
      'components': resolve(__dirname, './src/components'),
      'features': resolve(__dirname, './src/features'),
    },
  },
});