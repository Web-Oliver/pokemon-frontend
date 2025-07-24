/**
 * Navigation Utilities
 * Layer 1: Core/Foundation (Application-agnostic utilities)
 * Eliminates duplicate navigation patterns across 10+ files
 * Follows DRY principle and provides consistent navigation behavior
 */

/**
 * Navigation helper functions
 * Consolidates the repeated navigation patterns found across pages
 */
export const navigationHelper = {
  /**
   * Navigate to a new path using pushState and trigger popstate event
   * This is the pattern used across Collection, Auctions, and other pages
   */
  navigateTo: (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  },

  /**
   * Navigate to collection item detail page
   * Used in Collection, Search pages, etc.
   */
  navigateToItemDetail: (type: 'psa' | 'raw' | 'sealed', id: string) => {
    navigationHelper.navigateTo(`/collection/${type}/${id}`);
  },

  /**
   * Navigate to auction detail page
   * Used in Auctions page, auction cards, etc.
   */
  navigateToAuctionDetail: (auctionId: string) => {
    navigationHelper.navigateTo(`/auctions/${auctionId}`);
  },

  /**
   * Navigate to edit pages
   * Used for editing items and auctions
   */
  navigateToEdit: {
    item: (type: 'psa' | 'raw' | 'sealed', id: string) => {
      navigationHelper.navigateTo(`/collection/edit/${type}/${id}`);
    },
    auction: (auctionId: string) => {
      navigationHelper.navigateTo(`/auctions/edit/${auctionId}`);
    },
  },

  /**
   * Navigate to create pages
   */
  navigateToCreate: {
    item: () => {
      navigationHelper.navigateTo('/add-item');
    },
    auction: () => {
      navigationHelper.navigateTo('/auctions/create');
    },
  },

  /**
   * Navigate back to collection page
   * Used across multiple pages
   */
  navigateToCollection: () => {
    navigationHelper.navigateTo('/collection');
  },

  /**
   * Navigate to auctions list page
   */
  navigateToAuctions: () => {
    navigationHelper.navigateTo('/auctions');
  },

  /**
   * Navigate to search pages
   */
  navigateToSearch: {
    sets: () => {
      navigationHelper.navigateTo('/sets');
    },
    products: () => {
      navigationHelper.navigateTo('/sealed-products');
    },
  },

  /**
   * Navigate to analytics pages
   */
  navigateToAnalytics: {
    sales: () => {
      navigationHelper.navigateTo('/analytics/sales');
    },
    general: () => {
      navigationHelper.navigateTo('/analytics');
    },
  },

  /**
   * Reload the current page
   * Used across multiple components
   */
  reload: () => {
    window.location.reload();
  },

  /**
   * Go back in history
   */
  goBack: () => {
    window.history.back();
  },

  /**
   * Get current path without query parameters
   */
  getCurrentPath: () => {
    return window.location.pathname;
  },

  /**
   * Check if currently on a specific path
   */
  isCurrentPath: (path: string) => {
    return window.location.pathname === path;
  },

  /**
   * Check if currently on an edit page
   */
  isEditPage: () => {
    return window.location.pathname.includes('/edit/');
  },

  /**
   * Get URL parameters for collection item detail page
   * Extracts type and id from /collection/{type}/{id} URLs
   */
  getCollectionItemParams: () => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length === 4 && pathParts[1] === 'collection') {
      // /collection/{type}/{id}
      const [, , type, id] = pathParts;
      return { type, id };
    }
    return { type: null, id: null };
  },

  /**
   * Get auction ID from current URL
   * Extracts auction ID from /auctions/{id}/edit or /auctions/{id} URLs
   */
  getAuctionIdFromUrl: () => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'auctions' && pathParts.length >= 3) {
      if (pathParts[3] === 'edit') {
        // /auctions/{id}/edit
        return pathParts[2];
      } else if (pathParts.length === 3) {
        // /auctions/{id}
        return pathParts[2];
      }
    }
    return null;
  },
};
