/**
 * Main App Component
 *
 * Root application component implementing basic routing and layout structure.
 * Following CLAUDE.md guidelines for layered architecture and beautiful design.
 *
 * Phase 4.2: Basic routing implementation with MainLayout integration
 */

import { useState, useEffect, Suspense, lazy } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { log } from './utils/logger';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import { queryClient } from './lib/queryClient';

// Layout
import MainLayout from './components/layouts/MainLayout';

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Collection = lazy(() => import('./pages/Collection'));
const CollectionItemDetail = lazy(() => import('./pages/CollectionItemDetail'));
const SetSearch = lazy(() => import('./pages/SetSearch'));
const SealedProductSearch = lazy(() => import('./pages/SealedProductSearch'));
const Auctions = lazy(() => import('./pages/Auctions'));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail'));
const CreateAuction = lazy(() => import('./pages/CreateAuction'));
const AuctionEdit = lazy(() => import('./pages/AuctionEdit'));
const SalesAnalytics = lazy(() => import('./pages/SalesAnalytics'));
const Activity = lazy(() => import('./pages/Activity'));
const AddEditItem = lazy(() => import('./pages/AddEditItem'));
const DbaExport = lazy(() => import('./pages/DbaExport'));

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Test logger functionality
  log('App loaded!');

  // Test API client error handling removed for cleaner console

  // Listen for navigation changes from MainLayout
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
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
      default:
        // Default to dashboard for root and unknown routes
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          {renderPage()}
        </Suspense>
      </MainLayout>
      <ReactQueryDevtools initialIsOpen={false} />
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
    </QueryClientProvider>
  );
}

export default App;
