/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    testTimeout: 30000, // 30 seconds for integration tests with real API
    hookTimeout: 10000, // 10 seconds for setup/teardown hooks
  },
})