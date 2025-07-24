/**
 * Main App Component
 *
 * Root application component implementing basic routing and layout structure.
 * Following CLAUDE.md guidelines for layered architecture and beautiful design.
 *
 * Phase 4.2: Basic routing implementation with MainLayout integration
 */

import { useState, useEffect } from 'react';
import { log } from './utils/logger';
import { Toaster } from 'react-hot-toast';

// Layout and Pages
import MainLayout from './components/layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import CollectionItemDetail from './pages/CollectionItemDetail';
import SetSearch from './pages/SetSearch';
import SealedProductSearch from './pages/SealedProductSearch';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import CreateAuction from './pages/CreateAuction';
import AuctionEdit from './pages/AuctionEdit';
import SalesAnalytics from './pages/SalesAnalytics';
import Activity from './pages/Activity';
import AddEditItem from './pages/AddEditItem';
import DbaExport from './pages/DbaExport';
import DbaSelection from './pages/DbaSelection';

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
      case '/dba-selection':
        return <DbaSelection />;
      default:
        // Default to dashboard for root and unknown routes
        return <Dashboard />;
    }
  };

  return (
    <>
      <MainLayout>{renderPage()}</MainLayout>
      <Toaster
        position='top-right'
        reverseOrder={false}
        gutter={8}
        containerClassName=''
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
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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
    </>
  );
}

export default App;
