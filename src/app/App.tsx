/**
 * Main App Component
 *
 * Root application component implementing basic routing and layout structure.
 * Following CLAUDE.md guidelines for layered architecture and beautiful design.
 *
 * Phase 4.2: Basic routing implementation with MainLayout integration
 */

import { lazy, Suspense, useEffect, useState, useTransition } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { log } from '@/shared/utils/performance/logger';
import { Toaster } from 'react-hot-toast';
import { PageLoading } from '@/shared/components/molecules/common/LoadingStates';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from '@/theme';
import DevMonitor from '@/shared/components/development/DevMonitor';
// Cache debugging removed - overengineered development utility not needed
// Layout
import MainLayout from '@/shared/components/layout/layouts/MainLayout';

// Context7 Lazy Loading Strategy - Performance Optimized Code Splitting
// Following React.dev patterns for optimal bundle performance
// Updated to use new domain structure

// Collection Domain (Critical path components)
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Collection = lazy(() => import('@/domains/collection/pages/Collection'));
const CollectionItemDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "collection-detail" */ '@/domains/collection/pages/CollectionItemDetail'
    )
);
const AddEditItem = lazy(
  () =>
    import(
      /* webpackChunkName: "collection-forms" */ '@/domains/collection/pages/AddEditItem'
    )
);

// Search Domain (bundled together for caching)
const SetSearch = lazy(
  () =>
    import(
      /* webpackChunkName: "search-features" */ '@/domains/search/pages/SetSearch'
    )
);
const SealedProductSearch = lazy(
  () =>
    import(
      /* webpackChunkName: "search-features" */ '@/domains/search/pages/SealedProductSearch'
    )
);

// Collection Domain - Auction features (bundled together for better caching)
const Auctions = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '@/domains/collection/pages/Auctions'
    )
);
const AuctionDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '@/domains/collection/pages/AuctionDetail'
    )
);
const CreateAuction = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '@/domains/collection/pages/CreateAuction'
    )
);
const AuctionEdit = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '@/domains/collection/pages/AuctionEdit'
    )
);

// Collection Domain - Analytics features (separate chunks)
const SalesAnalytics = lazy(
  () =>
    import(
      /* webpackChunkName: "analytics" */ '@/domains/collection/pages/SalesAnalytics'
    )
);
const Activity = lazy(
  () =>
    import(
      /* webpackChunkName: "activity" */ '@/domains/collection/pages/Activity'
    )
);

// Marketplace Domain - Export functionality
const DbaExport = lazy(
  () =>
    import(
      /* webpackChunkName: "marketplace-export" */ '@/domains/marketplace/pages/DbaExport'
    )
);

// ICR Domain - Image Character Recognition Features
const OcrWorkflow = lazy(
  () => import(/* webpackChunkName: "icr-features" */ '@/domains/icr/components/OcrWorkflow')
);

// ICR Domain - Matching workflow
const MatchingWorkflow = lazy(
  () => import(/* webpackChunkName: "icr-matching" */ '@/domains/icr/pages/MatchingWorkflow')
);

// Old scan components removed - now using unified OcrWorkflow

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

  // Route configuration - simple routing without external router library
  const renderPage = () => {
    // Handle dynamic auction routes
    if (currentPath.startsWith('/auctions/') && currentPath !== '/auctions') {
      const routePart = currentPath.split('/auctions/')[1];
      if (routePart === 'create') {
        return <CreateAuction />;
      }
      // Handle edit routes: /auctions/{id}/edit
      if (routePart && routePart.includes('/edit')) {
        const auctionId = routePart.split('/edit')[0];
        return <AuctionEdit auctionId={auctionId} />;
      }
      if (routePart && !routePart.includes('/')) {
        return <AuctionDetail auctionId={routePart} />;
      }
    }

    // Handle edit routes: /collection/edit/{type}/{id}
    if (currentPath.startsWith('/collection/edit/')) {
      const pathParts = currentPath.split('/');
      if (pathParts.length === 5) {
        // /collection/edit/{type}/{id}
        const [, , , type, id] = pathParts;
        if ((type === 'psa' || type === 'raw' || type === 'sealed') && id) {
          return <AddEditItem />;
        }
      }
    }

    // Handle dynamic collection item detail routes
    if (
      currentPath.startsWith('/collection/') &&
      currentPath !== '/collection' &&
      currentPath !== '/collection/add'
    ) {
      const pathParts = currentPath.split('/');
      if (pathParts.length === 4) {
        // /collection/{type}/{id}
        const [, , type, id] = pathParts;
        if ((type === 'psa' || type === 'raw' || type === 'sealed') && id) {
          return <CollectionItemDetail />;
        }
      }
    }

    switch (currentPath) {
      case '/':
      case '/dashboard':
        return <Dashboard />;
      case '/collection':
        return <Collection />;
      case '/collection/add':
        return <AddEditItem />;
      case '/add-item':
        return <AddEditItem />;
      case '/sets':
      case '/set-search':
        return <SetSearch />;
      case '/sealed-products-search':
        return <SealedProductSearch />;
      case '/auctions':
        return <Auctions />;
      case '/sales-analytics':
      case '/analytics':
        return <SalesAnalytics />;
      case '/activity':
        return <Activity />;
      case '/dba-export':
        return <DbaExport />;
      case '/ocr':
      case '/ocr-matching':
        return <OcrWorkflow />;
      case '/matching':
        return <MatchingWorkflow />;
      case '/ocr/scans':
      case '/ocr/uploaded':
      case '/ocr/extracted':
      case '/ocr/stitch':
        return <OcrWorkflow />;
      default:
        // Default to dashboard for root and unknown routes
        return <Dashboard />;
    }
  };

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
                <PageLoading />
              </div>
            }
          >
            {renderPage()}
          </Suspense>
        </MainLayout>
        {(import.meta as ImportMeta & { env?: { MODE?: string } }).env?.MODE === 'development' && (
          <>
            <ReactQueryDevtools
              initialIsOpen={false}
              buttonPosition="bottom-left"
              position="bottom"
            />
            {/* Development monitoring tools */}
            <DevMonitor />
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
