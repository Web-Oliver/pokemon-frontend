/**
 * Collection Sync Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md + Context7 React optimization principles:
 * - Single Responsibility: Only handles data fetching and synchronization (SRP)
 * - Dependency Inversion: Depends on abstract state management (DIP)
 * - DRY: Centralized data fetching logic
 * - Performance: Memoized fetch operations with useCallback
 */

import { useEffect, useCallback } from 'react';
import * as collectionApi from '../api/collectionApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { UseCollectionStateReturn } from './useCollectionState';
import { 
  transformPsaCardToDisplay, 
  transformRawCardToDisplay, 
  transformSealedProductToDisplay,
  transformCollectionToDisplay,
  DisplayItem
} from '../utils/collectionDataTransforms';

export interface UseCollectionSyncReturn {
  fetchAllCollectionData: () => Promise<void>;
  refreshCollection: () => Promise<void>;
}

/**
 * Collection Synchronization Hook
 *
 * Handles data fetching, collection refresh, and synchronization with backend.
 * Uses dependency injection pattern with state management hook.
 */
export const useCollectionSync = (
  stateManager: UseCollectionStateReturn
): UseCollectionSyncReturn => {
  const { setLoading, setError, updateState } = stateManager;

  /**
   * Fetch all collection data from the backend - memoized for performance
   */
  const fetchAllCollectionData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      log('Fetching collection data...');

      // Fetch all collection items in parallel
      const [psaCardsResponse, rawCardsResponse, sealedProductsResponse] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: false }),
        collectionApi.getRawCards({ sold: false }),
        collectionApi.getSealedProductCollection({ sold: false }),
      ]);

      // Fetch sold items separately
      const [soldPsaCards, soldRawCards, soldSealedProducts] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: true }),
        collectionApi.getRawCards({ sold: true }),
        collectionApi.getSealedProductCollection({ sold: true }),
      ]);

      // Transform data to display format for consistent UI rendering
      const transformedPsaCards = psaCardsResponse.map(transformPsaCardToDisplay);
      const transformedRawCards = rawCardsResponse.map(transformRawCardToDisplay);
      const transformedSealedProducts = sealedProductsResponse.map(transformSealedProductToDisplay);

      // Deduplicate sold items by ID to prevent duplicate keys in React
      const allSoldItems = [...soldPsaCards, ...soldRawCards, ...soldSealedProducts];
      const deduplicatedSoldItems = allSoldItems.filter((item, index, array) => {
        const itemId = item.id || (item as any)._id;
        return (
          array.findIndex(otherItem => {
            const otherId = otherItem.id || (otherItem as any)._id;
            return otherId === itemId;
          }) === index
        );
      });

      // Transform sold items to display format
      const transformedSoldItems = transformCollectionToDisplay(deduplicatedSoldItems);

      updateState(prev => ({
        ...prev,
        psaCards: transformedPsaCards,
        rawCards: transformedRawCards,
        sealedProducts: transformedSealedProducts,
        soldItems: transformedSoldItems,
        loading: false,
      }));

      log('Collection data fetched successfully');
    } catch (error) {
      handleApiError(error, 'Failed to fetch collection data');
      setError('Failed to load collection data');
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  /**
   * Refresh collection data - memoized for performance
   */
  const refreshCollection = useCallback(async () => {
    await fetchAllCollectionData();
  }, [fetchAllCollectionData]);

  // Load collection data on hook initialization
  useEffect(() => {
    fetchAllCollectionData();

    // Check if collection needs refresh after returning from add-item page
    const needsRefresh = sessionStorage.getItem('collectionNeedsRefresh');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('collectionNeedsRefresh');
      log('Collection refresh requested via sessionStorage, fetching fresh data...');
      // Small delay to ensure any pending operations complete
      setTimeout(() => {
        fetchAllCollectionData();
      }, 200);
    }
  }, [fetchAllCollectionData]);

  // Listen for collection update events (triggered when items are added from other pages)
  useEffect(() => {
    const handleCollectionUpdate = () => {
      log('Collection update event received, refreshing data...');
      refreshCollection();
    };

    // Listen for custom collection update events
    window.addEventListener('collectionUpdated', handleCollectionUpdate);

    return () => {
      window.removeEventListener('collectionUpdated', handleCollectionUpdate);
    };
  }, [refreshCollection]);

  return {
    fetchAllCollectionData,
    refreshCollection,
  };
};
