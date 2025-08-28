import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
      react({
        // Enable React Compiler optimizations if available
        babel: {
          plugins: [
            // React Compiler for automatic memoization (Context7 pattern)
            mode === 'production' && [
              'babel-plugin-react-compiler',
            ],
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
      // Context7 Performance Optimization - Warmup most used files
      warmup: {
        clientFiles: [
          // Most complex components based on analysis
          './src/shared/components/atoms/design-system/PokemonSearch.tsx',
          './src/shared/services/UnifiedApiService.ts',
          './src/shared/utils/validation/index.ts',
          // Frequently used utilities
          './src/shared/utils/helpers/common.ts',
          './src/shared/utils/core/index.ts',
        ],
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

            // UI libraries - frequently used, pre-bundle
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
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
            if (
              id.includes('axios') ||
              id.includes('react-hot-toast') ||
              id.includes('jszip')
            ) {
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
          chunkFileNames: (_chunkInfo) => {
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
      reportCompressedSize: false, // Disable for faster builds - Context7 recommendation

      // Minification settings for production
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console.logs in production
          drop_debugger: true,
          pure_funcs:
            mode === 'production'
              ? ['console.log', 'console.info']
              : [],
        },
        mangle: {
          safari10: true, // Handle Safari 10 compatibility
        },
      },
    },

    // Context7 Dependency Optimization - Updated based on analysis
    optimizeDeps: {
      include: [
        // Core React dependencies - pre-bundle for faster dev startup
        'react',
        'react-dom',
        'react-hook-form',
        '@tanstack/react-query',
        // UI components that are frequently used
        'lucide-react',
        'clsx',
        'tailwind-merge',
      ],
      exclude: [
        // Large libraries that were removed from dependencies
        // No longer excluding recharts, framer-motion as they're now removed
      ],
      // Improved cold start performance based on Context7 optimization
      holdUntilCrawlEnd: false,
    },

    // Context7 Module Resolution
    resolve: {
      alias: {
        // shadcn/ui alias for proper component imports
        '@': path.resolve(__dirname, './src'),
      },
    }
  }
));
