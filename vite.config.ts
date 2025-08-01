import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Compiler optimizations if available
      babel: {
        plugins: [
          // React Compiler for automatic memoization (Context7 pattern)
          process.env.NODE_ENV === 'production' && ['babel-plugin-react-compiler'],
        ].filter(Boolean),
      },
    }),
  ],
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
    // Context7 Bundle Optimization Settings
    target: 'es2020', // Modern browsers for better tree-shaking
    cssCodeSplit: true, // Enable CSS code splitting (Vite default)
    rollupOptions: {
      output: {
        // Context7 Advanced Code Splitting Strategy
        manualChunks: (id) => {
          // React ecosystem - critical path
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // UI libraries - lazy load candidates
          if (id.includes('lucide-react') || id.includes('framer-motion')) {
            return 'ui-vendor';
          }
          
          // Heavy libraries - separate chunks for better caching
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          
          // Search and highlighting - lazy loadable
          if (id.includes('SearchDropdown') || id.includes('/search/')) {
            return 'search-features';
          }
          
          // Forms - conditional loading
          if (id.includes('/forms/') || id.includes('react-hook-form')) {
            return 'form-features';
          }
          
          // Utilities - tree-shakeable
          if (id.includes('axios') || id.includes('react-hot-toast') || id.includes('jszip')) {
            return 'utils-vendor';
          }
          
          // Data fetching - critical path
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          
          // Node modules default
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        
        // Context7 Performance Optimizations
        chunkFileNames: (chunkInfo) => {
          // Add hash for better caching
          return `js/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType || '')) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // Context7 Tree-shaking Optimizations
      treeshake: {
        moduleSideEffects: false, // Enable aggressive tree-shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    
    // Context7 Bundle Size Optimizations
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
    reportCompressedSize: true, // Show gzipped sizes
    
    // Minification settings for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production', // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true, // Handle Safari 10 compatibility
      },
    },
  },
  
  // Context7 Dependency Optimization
  optimizeDeps: {
    include: [
      // Pre-bundle these dependencies for faster dev startup
      'react',
      'react-dom',
      'react-hook-form',
      '@tanstack/react-query',
    ],
    exclude: [
      // Don't pre-bundle large or rarely used deps
      'recharts',
      'framer-motion',
    ],
  },
  
  // Context7 Module Resolution
  resolve: {
    alias: {
      // Enable tree-shaking for commonly used utilities
      '@/utils': '/src/utils',
      '@/components': '/src/components',
      '@/hooks': '/src/hooks',
    },
  },
});
