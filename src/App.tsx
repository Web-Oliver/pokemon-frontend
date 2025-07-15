/**
 * Main App Component
 * 
 * Root application component implementing basic routing and layout structure.
 * Following CLAUDE.md guidelines for layered architecture and beautiful design.
 * 
 * Phase 4.2: Basic routing implementation with MainLayout integration
 */

import { useState, useEffect } from 'react'
import './App.css'
import { log } from './utils/logger'
import apiClient from './api/apiClient'

// Layout and Pages
import MainLayout from './components/layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Collection from './pages/Collection'
import Search from './pages/Search'
import SetSearch from './pages/SetSearch'
import SealedProductSearch from './pages/SealedProductSearch'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import SalesAnalytics from './pages/SalesAnalytics'
import AddEditItem from './pages/AddEditItem'
import TestPage from './pages/TestPage'

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  
  // Test logger functionality
  log('App loaded!');

  // Test API client error handling (keep for Phase 1 verification)
  useEffect(() => {
    const testApiClient = async () => {
      try {
        await apiClient.get('/non-existent-endpoint');
      } catch (error) {
        // Error is already handled by the interceptor
        log('Expected API error occurred and was handled');
      }
    };
    
    testApiClient();
  }, []);

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
    // Handle dynamic auction detail routes
    if (currentPath.startsWith('/auctions/') && currentPath !== '/auctions') {
      const auctionId = currentPath.split('/auctions/')[1];
      if (auctionId && !auctionId.includes('/')) {
        return <AuctionDetail auctionId={auctionId} />;
      }
    }

    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/collection':
        return <Collection />;
      case '/collection/add':
        return <AddEditItem />;
      case '/search':
        return <Search />;
      case '/sets':
        return <SetSearch />;
      case '/sealed-products-search':
        return <SealedProductSearch />;
      case '/auctions':
        return <Auctions />;
      case '/sales-analytics':
        return <SalesAnalytics />;
      case '/test':
        return <TestPage />;
      default:
        // Default to dashboard for root and unknown routes
        return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  )
}

export default App