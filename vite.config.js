import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React vendor chunk
          react: ['react', 'react-dom'],
          // UI vendor chunk
          ui: ['lucide-react'],
          // Note: charts dependencies removed
          // Utility vendor chunk
          utils: ['axios', 'react-hot-toast', 'jszip'],
          // Query vendor chunk
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
