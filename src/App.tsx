/**
 * Main App Component
 *
 * Root application component implementing basic routing and layout structure.
 * Following CLAUDE.md guidelines for layered architecture and beautiful design.
 *
 * Phase 4.2: Basic routing implementation with MainLayout integration
 */

import { Suspense, useEffect, useState, useTransition } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { log } from './utils/logger';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import { queryClient } from './lib/queryClient';
import { UnifiedThemeProvider as ThemeProvider } from './contexts/theme/UnifiedThemeProvider';

// Layout
import MainLayout from './components/layouts/MainLayout';

// SOLID Router Component - Replaces 73-line renderPage() function
import Router from './components/routing/Router';

// Context7 Pattern: Main App component with useTransition for smooth navigation
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isPending, startTransition] = useTransition();

  // Test logger functionality
  log('App loaded!');

  // Test API client error handling removed for cleaner console

  // Context7 Pattern: Navigation with transition for better UX
  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setCurrentPath(window.location.pathname);
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // SOLID Router Component handles all routing logic
  // Single Responsibility: App.tsx now focuses only on app structure and providers

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MainLayout>
          {/* Context7 Pattern: Suspense boundary with transition state */}
          <Suspense
            fallback={
              <div
                className={`flex items-center justify-center min-h-[60vh] transition-opacity duration-200 ${
                  isPending ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <Router currentPath={currentPath} />
          </Suspense>
        </MainLayout>
        {process.env.NODE_ENV === 'development' && (
          <>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
              position="bottom"
            />
            {/* ThemeDebugger temporarily disabled during refactoring */}
          </>
        )}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Global default options for all toasts
            duration: 4000,
            style: {
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '8px',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#16A34A',
                secondary: '#FFFFFF',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
