/**
 * Page Navigation Hook
 * 
 * Centralizes navigation patterns repeated across CreateAuction, AuctionEdit,
 * AuctionDetail, and other page components.
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Handles page navigation and URL management
 * - DRY: Eliminates repeated navigation code across pages
 * - Interface Segregation: Provides specific navigation methods
 */

import { useCallback } from 'react';

export const usePageNavigation = () => {
  // Generic navigation helper
  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  // Auction-specific navigation methods
  const navigateToAuctions = useCallback(() => {
    navigateTo('/auctions');
  }, [navigateTo]);

  const navigateToAuctionDetail = useCallback((auctionId: string) => {
    navigateTo(`/auctions/${auctionId}`);
  }, [navigateTo]);

  const navigateToAuctionEdit = useCallback((auctionId: string) => {
    navigateTo(`/auctions/${auctionId}/edit`);
  }, [navigateTo]);

  const navigateToCreateAuction = useCallback(() => {
    navigateTo('/auctions/create');
  }, [navigateTo]);

  // Collection item navigation methods
  const navigateToItemDetail = useCallback((type: 'psa' | 'raw' | 'sealed', itemId: string) => {
    const routes = {
      psa: `/collection/psa-graded/${itemId}`,
      raw: `/collection/raw/${itemId}`,
      sealed: `/collection/sealed/${itemId}`,
    };
    navigateTo(routes[type]);
  }, [navigateTo]);

  const navigateToCollection = useCallback(() => {
    navigateTo('/collection');
  }, [navigateTo]);

  const navigateToDashboard = useCallback(() => {
    navigateTo('/dashboard');
  }, [navigateTo]);

  // Add item navigation methods
  const navigateToAddItem = useCallback((type?: 'psa' | 'raw' | 'sealed') => {
    const path = type ? `/collection/add?type=${type}` : '/collection/add';
    navigateTo(path);
  }, [navigateTo]);

  const navigateToEditItem = useCallback((type: 'psa' | 'raw' | 'sealed', itemId: string) => {
    const routes = {
      psa: `/collection/psa-graded/${itemId}/edit`,
      raw: `/collection/raw/${itemId}/edit`,
      sealed: `/collection/sealed/${itemId}/edit`,
    };
    navigateTo(routes[type]);
  }, [navigateTo]);

  // URL extraction helpers
  const extractAuctionIdFromUrl = useCallback(() => {
    const pathParts = window.location.pathname.split('/');
    const auctionIndex = pathParts.indexOf('auctions');
    return auctionIndex !== -1 && pathParts[auctionIndex + 1] 
      ? pathParts[auctionIndex + 1] 
      : null;
  }, []);

  const extractItemIdFromUrl = useCallback(() => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1] || null;
  }, []);

  // Back navigation
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return {
    // Generic navigation
    navigateTo,
    goBack,
    
    // Auction navigation
    navigateToAuctions,
    navigateToAuctionDetail,
    navigateToAuctionEdit,
    navigateToCreateAuction,
    
    // Collection navigation
    navigateToCollection,
    navigateToItemDetail,
    navigateToAddItem,
    navigateToEditItem,
    
    // Dashboard navigation
    navigateToDashboard,
    
    // URL helpers
    extractAuctionIdFromUrl,
    extractItemIdFromUrl,
  };
};