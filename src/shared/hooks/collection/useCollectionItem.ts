/**
 * Collection Item Data Management Hook
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles data fetching and state management
 * - DRY: Eliminates duplicated fetching logic across item types
 * - Reusability: Can be used by other components needing item data
 */

import { useState, useEffect, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { getCollectionApiService } from '../../services/ServiceRegistry';
import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import { log } from '../../../shared/utils/performance/logger';
import { navigationHelper } from "../../../shared/utils/navigation";

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;
export type ItemType = 'psa' | 'raw' | 'sealed';

export interface UseCollectionItemReturn {
  item: CollectionItem | null;
  loading: boolean;
  error: string | null;
  refetchItem: () => Promise<void>;
}

/**
 * Custom hook for managing collection item data
 * Handles fetching, caching, and refreshing of item data
 */
export const useCollectionItem = (
  type?: string,
  id?: string
): UseCollectionItemReturn => {
  const [item, setItem] = useState<CollectionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get URL params if not provided
  const getUrlParams = useCallback(() => {
    if (type && id) {
      return { type, id };
    }
    return navigationHelper.getCollectionItemParams();
  }, [type, id]);

  // Fetch item data based on type
  const fetchItemData = useCallback(
    async (itemType: string, itemId: string): Promise<CollectionItem> => {
      const collectionApi = getCollectionApiService();

      switch (itemType) {
        case 'psa':
          return await collectionApi.getPsaGradedCardById(itemId);
        case 'raw':
          return await collectionApi.getRawCardById(itemId);
        case 'sealed':
          return await collectionApi.getSealedProductById(itemId);
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }
    },
    []
  );

  // Main fetch function
  const fetchItem = useCallback(async () => {
    const { type: itemType, id: itemId } = getUrlParams();

    if (!itemType || !itemId) {
      setError('Invalid item type or ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      log(`Fetching ${itemType} item with ID: ${itemId}`);
      const fetchedItem = await fetchItemData(itemType, itemId);

      // Debug PSA card population data (preserving existing debug logic)
      if (itemType === 'psa') {
        console.log('[DEBUG PSA API] Full PSA card response:', fetchedItem);
        const psaCard = fetchedItem as any;
        console.log('[DEBUG PSA API] cardId object:', psaCard.cardId);
        console.log('[DEBUG PSA API] cardId.grades:', psaCard.cardId?.grades);
        console.log('[DEBUG PSA API] cardId.setId:', psaCard.cardId?.setId);
        console.log('[DEBUG PSA API] Individual grade counts:', {
          grade_1: psaCard.cardId?.grades?.grade_1,
          grade_2: psaCard.cardId?.grades?.grade_2,
          grade_9: psaCard.cardId?.grades?.grade_9,
          grade_10: psaCard.cardId?.grades?.grade_10,
          grade_total: psaCard.cardId?.grades?.grade_total,
        });
      }

      setItem(fetchedItem);
      log('Item fetched successfully');
    } catch (err) {
      const errorMessage = 'Failed to load item details';
      handleApiError(err, 'Failed to fetch item details');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getUrlParams, fetchItemData]);

  // Refetch function for external use
  const refetchItem = useCallback(async () => {
    await fetchItem();
  }, [fetchItem]);

  // Initial fetch on mount or param changes
  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    loading,
    error,
    refetchItem,
  };
};

/**
 * Hook variant that extracts URL parameters automatically
 */
export const useCollectionItemFromUrl = (): UseCollectionItemReturn => {
  return useCollectionItem();
};
