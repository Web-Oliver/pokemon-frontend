/**
 * Navigation Utilities
 * Layer 1: Core/Foundation (Application-agnostic utilities)
 * Eliminates duplicate navigation patterns across 10+ files
 * Follows DRY principle and provides consistent navigation behavior
 *
 * Standard with comprehensive ID safety and validation to prevent
 * [object Object] URLs and malformed navigation issues
 */

import { log } from './logger';

/**
 * Validate and sanitize ID parameters to prevent navigation issues
 * Ensures safe string conversion and prevents object-based IDs from breaking URLs
 */
const validateAndSanitizeId = (id: any, context: string): string | null => {
  // Handle null/undefined
  if (id === null || id === undefined) {
    log(`[NAVIGATION] Invalid ID (null/undefined) in ${context}`, { id });
    return null;
  }

  // Handle empty string
  if (id === '') {
    log(`[NAVIGATION] Empty ID string in ${context}`, { id });
    return null;
  }

  // Handle string IDs (most common case)
  if (typeof id === 'string') {
    const trimmedId = id.trim();
    if (trimmedId === '') {
      log(`[NAVIGATION] Empty trimmed ID string in ${context}`, {
        originalId: id,
      });
      return null;
    }

    // Check for potential object string representations
    if (
      trimmedId.startsWith('[object') ||
      trimmedId.includes('[object Object]')
    ) {
      log(`[NAVIGATION] Detected object string representation in ${context}`, {
        id: trimmedId,
      });
      return null;
    }

    return encodeURIComponent(trimmedId);
  }

  // Handle numeric IDs
  if (typeof id === 'number') {
    if (isNaN(id) || !isFinite(id)) {
      log(`[NAVIGATION] Invalid numeric ID in ${context}`, { id });
      return null;
    }
    return encodeURIComponent(String(id));
  }

  // Handle MongoDB ObjectId or other objects with string representation
  if (typeof id === 'object') {
    // Try to extract _id first (MongoDB pattern)
    if (id._id) {
      return validateAndSanitizeId(id._id, `${context} (from _id property)`);
    }

    // Try to extract id property
    if (id.id) {
      return validateAndSanitizeId(id.id, `${context} (from id property)`);
    }

    // Try toString() if it exists and returns something meaningful
    if (typeof id.toString === 'function') {
      const stringRepresentation = id.toString();
      if (
        stringRepresentation !== '[object Object]' &&
        stringRepresentation.trim() !== ''
      ) {
        return validateAndSanitizeId(
          stringRepresentation,
          `${context} (from toString())`
        );
      }
    }

    log(`[NAVIGATION] Unable to extract valid ID from object in ${context}`, {
      id,
      hasIdProp: 'id' in id,
      has_idProp: '_id' in id,
      objectKeys: Object.keys(id),
    });
    return null;
  }

  // Handle boolean, function, symbol, etc.
  log(`[NAVIGATION] Unsupported ID type ${typeof id} in ${context}`, {
    id,
    type: typeof id,
  });
  return null;
};

/**
 * Validate path components and construct safe navigation paths
 */
const constructSafePath = (
  pathSegments: string[],
  context: string
): string | null => {
  const validSegments = pathSegments.filter((segment) => {
    if (!segment || segment.trim() === '') {
      log(`[NAVIGATION] Empty path segment in ${context}`, { pathSegments });
      return false;
    }
    return true;
  });

  if (validSegments.length !== pathSegments.length) {
    log(`[NAVIGATION] Some path segments were invalid in ${context}`, {
      original: pathSegments,
      valid: validSegments,
    });
    return null;
  }

  return `/${validSegments.join('/')}`;
};

/**
 * Navigation helper functions
 * Consolidates the repeated navigation patterns found across pages
 * Standard with comprehensive ID safety and error handling
 */
export const navigationHelper = {
  /**
   * Navigate to a new path using pushState and trigger popstate event
   * Standard with path validation and error handling
   */
  navigateTo: (path: string) => {
    if (!path || typeof path !== 'string' || path.trim() === '') {
      log('[NAVIGATION] Invalid path provided to navigateTo', { path });
      return false;
    }

    const trimmedPath = path.trim();
    if (!trimmedPath.startsWith('/')) {
      log('[NAVIGATION] Path should start with / for proper navigation', {
        path: trimmedPath,
      });
      return false;
    }

    try {
      window.history.pushState({}, '', trimmedPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      log('[NAVIGATION] Successfully navigated to path', { path: trimmedPath });
      return true;
    } catch (error) {
      log('[NAVIGATION] Error during navigation', { path: trimmedPath, error });
      return false;
    }
  },

  /**
   * Navigate to collection item detail page with comprehensive ID validation
   * Used in Collection, Search pages, etc.
   */
  navigateToItemDetail: (type: 'psa' | 'raw' | 'sealed', id: any) => {
    const validId = validateAndSanitizeId(id, 'navigateToItemDetail');
    if (!validId) {
      log('[NAVIGATION] Failed to navigate to item detail - invalid ID', {
        type,
        id,
      });
      return false;
    }

    const safePath = constructSafePath(
      ['collection', type, validId],
      'navigateToItemDetail'
    );
    if (!safePath) {
      return false;
    }

    return navigationHelper.navigateTo(safePath);
  },

  /**
   * Navigate to auction detail page with ID validation
   * Used in Auctions page, auction cards, etc.
   */
  navigateToAuctionDetail: (auctionId: any) => {
    const validId = validateAndSanitizeId(auctionId, 'navigateToAuctionDetail');
    if (!validId) {
      log('[NAVIGATION] Failed to navigate to auction detail - invalid ID', {
        auctionId,
      });
      return false;
    }

    const safePath = constructSafePath(
      ['auctions', validId],
      'navigateToAuctionDetail'
    );
    if (!safePath) {
      return false;
    }

    return navigationHelper.navigateTo(safePath);
  },

  /**
   * Navigate to edit pages with comprehensive ID validation
   * Used for editing items and auctions
   */
  navigateToEdit: {
    item: (type: 'psa' | 'raw' | 'sealed', id: any) => {
      const validId = validateAndSanitizeId(id, 'navigateToEdit.item');
      if (!validId) {
        log('[NAVIGATION] Failed to navigate to edit item - invalid ID', {
          type,
          id,
        });
        return false;
      }

      const safePath = constructSafePath(
        ['collection', 'edit', type, validId],
        'navigateToEdit.item'
      );
      if (!safePath) {
        return false;
      }

      return navigationHelper.navigateTo(safePath);
    },
    auction: (auctionId: any) => {
      const validId = validateAndSanitizeId(
        auctionId,
        'navigateToEdit.auction'
      );
      if (!validId) {
        log('[NAVIGATION] Failed to navigate to edit auction - invalid ID', {
          auctionId,
        });
        return false;
      }

      const safePath = constructSafePath(
        ['auctions', 'edit', validId],
        'navigateToEdit.auction'
      );
      if (!safePath) {
        return false;
      }

      return navigationHelper.navigateTo(safePath);
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
   * Get URL parameters for collection item detail page with enhanced validation
   * Extracts type and id from /collection/{type}/{id} URLs with safety checks
   */
  getCollectionItemParams: () => {
    try {
      const pathParts = window.location.pathname
        .split('/')
        .filter((part) => part !== '');

      if (pathParts.length === 3 && pathParts[0] === 'collection') {
        // /collection/{type}/{id}
        const [, type, rawId] = pathParts;

        // Validate type
        if (!['psa', 'raw', 'sealed'].includes(type)) {
          log('[NAVIGATION] Invalid collection item type in URL', {
            type,
            validTypes: ['psa', 'raw', 'sealed'],
            fullPath: window.location.pathname,
          });
          return { type: null, id: null };
        }

        // Validate and sanitize ID
        const sanitizedId = validateAndSanitizeId(
          decodeURIComponent(rawId),
          'getCollectionItemParams'
        );
        if (!sanitizedId) {
          log('[NAVIGATION] Invalid collection item ID in URL', {
            rawId,
            type,
            fullPath: window.location.pathname,
          });
          return { type, id: null };
        }

        log('[NAVIGATION] Successfully extracted collection item params', {
          type,
          id: sanitizedId,
        });
        return { type, id: sanitizedId };
      }

      // Handle edit URL pattern: /collection/edit/{type}/{id}
      if (
        pathParts.length === 4 &&
        pathParts[0] === 'collection' &&
        pathParts[1] === 'edit'
      ) {
        const [, , type, rawId] = pathParts;

        if (!['psa', 'raw', 'sealed'].includes(type)) {
          log('[NAVIGATION] Invalid collection item type in edit URL', {
            type,
            validTypes: ['psa', 'raw', 'sealed'],
            fullPath: window.location.pathname,
          });
          return { type: null, id: null };
        }

        const sanitizedId = validateAndSanitizeId(
          decodeURIComponent(rawId),
          'getCollectionItemParams (edit)'
        );
        if (!sanitizedId) {
          log('[NAVIGATION] Invalid collection item ID in edit URL', {
            rawId,
            type,
            fullPath: window.location.pathname,
          });
          return { type, id: null };
        }

        log('[NAVIGATION] Successfully extracted collection edit params', {
          type,
          id: sanitizedId,
        });
        return { type, id: sanitizedId };
      }

      log('[NAVIGATION] URL does not match collection item patterns', {
        pathParts,
        fullPath: window.location.pathname,
      });
      return { type: null, id: null };
    } catch (error) {
      log('[NAVIGATION] Error parsing collection item params from URL', {
        error,
        pathname: window.location.pathname,
      });
      return { type: null, id: null };
    }
  },

  /**
   * Get auction ID from current URL with enhanced validation
   * Extracts auction ID from /auctions/{id}/edit or /auctions/{id} URLs
   */
  getAuctionIdFromUrl: () => {
    try {
      const pathParts = window.location.pathname
        .split('/')
        .filter((part) => part !== '');

      if (pathParts.length >= 2 && pathParts[0] === 'auctions') {
        let rawId: string;
        let context: string;

        if (pathParts.length === 3 && pathParts[2] === 'edit') {
          // /auctions/{id}/edit
          rawId = pathParts[1];
          context = 'getAuctionIdFromUrl (edit)';
        } else if (pathParts.length === 2) {
          // /auctions/{id}
          rawId = pathParts[1];
          context = 'getAuctionIdFromUrl (detail)';
        } else {
          log('[NAVIGATION] Auction URL does not match expected patterns', {
            pathParts,
            fullPath: window.location.pathname,
          });
          return null;
        }

        // Validate and sanitize the ID
        const sanitizedId = validateAndSanitizeId(
          decodeURIComponent(rawId),
          context
        );
        if (!sanitizedId) {
          log('[NAVIGATION] Invalid auction ID in URL', {
            rawId,
            context,
            fullPath: window.location.pathname,
          });
          return null;
        }

        log('[NAVIGATION] Successfully extracted auction ID', {
          id: sanitizedId,
          context,
        });
        return sanitizedId;
      }

      log('[NAVIGATION] URL is not an auction URL', {
        pathParts,
        fullPath: window.location.pathname,
      });
      return null;
    } catch (error) {
      log('[NAVIGATION] Error parsing auction ID from URL', {
        error,
        pathname: window.location.pathname,
      });
      return null;
    }
  },

  /**
   * Standard navigation safety utilities
   */

  /**
   * Validate if a given ID is safe for navigation
   * Useful for pre-flight checks before navigation attempts
   */
  isValidNavigationId: (id: any): boolean => {
    return validateAndSanitizeId(id, 'isValidNavigationId') !== null;
  },

  /**
   * Get safe navigation URL without actually navigating
   * Useful for link generation and validation
   */
  getSafeNavigationUrl: {
    itemDetail: (type: 'psa' | 'raw' | 'sealed', id: any): string | null => {
      const validId = validateAndSanitizeId(
        id,
        'getSafeNavigationUrl.itemDetail'
      );
      if (!validId) {
        return null;
      }

      return constructSafePath(
        ['collection', type, validId],
        'getSafeNavigationUrl.itemDetail'
      );
    },

    auctionDetail: (auctionId: any): string | null => {
      const validId = validateAndSanitizeId(
        auctionId,
        'getSafeNavigationUrl.auctionDetail'
      );
      if (!validId) {
        return null;
      }

      return constructSafePath(
        ['auctions', validId],
        'getSafeNavigationUrl.auctionDetail'
      );
    },

    editItem: (type: 'psa' | 'raw' | 'sealed', id: any): string | null => {
      const validId = validateAndSanitizeId(
        id,
        'getSafeNavigationUrl.editItem'
      );
      if (!validId) {
        return null;
      }

      return constructSafePath(
        ['collection', 'edit', type, validId],
        'getSafeNavigationUrl.editItem'
      );
    },

    editAuction: (auctionId: any): string | null => {
      const validId = validateAndSanitizeId(
        auctionId,
        'getSafeNavigationUrl.editAuction'
      );
      if (!validId) {
        return null;
      }

      return constructSafePath(
        ['auctions', 'edit', validId],
        'getSafeNavigationUrl.editAuction'
      );
    },
  },

  /**
   * Recover from navigation errors by redirecting to safe fallback routes
   */
  recoverFromNavigationError: (
    errorContext: string,
    fallbackPath: string = '/'
  ) => {
    log(
      `[NAVIGATION] Recovering from navigation error in ${errorContext}, redirecting to fallback`,
      {
        errorContext,
        fallbackPath,
      }
    );

    return navigationHelper.navigateTo(fallbackPath);
  },

  /**
   * Batch validation for multiple IDs (useful for bulk operations)
   */
  validateNavigationIds: (ids: any[], context: string): string[] => {
    const validIds: string[] = [];
    const invalidCount = ids.length;

    ids.forEach((id, index) => {
      const validId = validateAndSanitizeId(id, `${context}[${index}]`);
      if (validId) {
        validIds.push(validId);
      }
    });

    if (validIds.length !== invalidCount) {
      log(`[NAVIGATION] Some IDs failed validation in batch operation`, {
        context,
        totalIds: invalidCount,
        validIds: validIds.length,
        invalidIds: invalidCount - validIds.length,
      });
    }

    return validIds;
  },
};
