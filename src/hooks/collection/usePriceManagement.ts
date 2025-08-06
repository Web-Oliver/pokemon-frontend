/**
 * Price Management Hook
 * 
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles price updates and management
 * - DRY: Eliminates duplicated price logic across components
 * - Reusability: Can be used by other components needing price management
 */

import { useState, useCallback } from 'react';
import { CollectionItem } from './useCollectionItem';
import { getCollectionApiService } from '../../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../../utils/errorHandler';
import { log } from '../../utils/logger';
import { navigationHelper } from '../../utils/navigation';

export interface UsePriceManagementReturn {
  newPrice: string;
  setNewPrice: (price: string) => void;
  handlePriceInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePriceUpdate: (newPrice: number, date: string) => Promise<CollectionItem | null>;
  handleCustomPriceUpdate: () => Promise<void>;
  isValidPrice: boolean;
  isPriceChanged: boolean;
}

/**
 * Custom hook for managing item price updates
 * Handles price input validation, API calls, and state updates
 */
export const usePriceManagement = (
  item: CollectionItem | null,
  onItemUpdate?: (updatedItem: CollectionItem) => void
): UsePriceManagementReturn => {
  const [newPrice, setNewPrice] = useState<string>('');

  // Get URL params for API calls
  const getUrlParams = useCallback(() => {
    return navigationHelper.getCollectionItemParams();
  }, []);

  // Handle price input change (only allow whole numbers)
  const handlePriceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setNewPrice(numericValue);
  }, []);

  // Update item price through API
  const handlePriceUpdate = useCallback(async (
    price: number, 
    date: string
  ): Promise<CollectionItem | null> => {
    if (!item) {
      return null;
    }

    try {
      const { type, id } = getUrlParams();

      if (!type || !id) {
        throw new Error('Invalid URL parameters');
      }

      // Create updated price history with new entry
      const updatedPriceHistory = [
        ...(item.priceHistory || []),
        { price, dateUpdated: date },
      ];

      const collectionApi = getCollectionApiService();
      let updatedItem: CollectionItem;

      // Update item based on type - backend will automatically sync myPrice to latest price
      switch (type) {
        case 'psa':
          updatedItem = await collectionApi.updatePsaCard(id, {
            priceHistory: updatedPriceHistory,
          });
          break;
        case 'raw':
          updatedItem = await collectionApi.updateRawCard(id, {
            priceHistory: updatedPriceHistory,
          });
          break;
        case 'sealed':
          updatedItem = await collectionApi.updateSealedProduct(id, {
            priceHistory: updatedPriceHistory,
          });
          break;
        default:
          throw new Error('Unknown item type');
      }

      // Notify parent component of update
      if (onItemUpdate) {
        onItemUpdate(updatedItem);
      }

      showSuccessToast('Price updated successfully! My Price synced to latest entry.');
      log('[PriceManagement] Price updated successfully', {
        newPrice: price,
        itemId: id,
      });

      return updatedItem;
    } catch (err: any) {
      const errorMessage = 'Failed to update price';
      handleApiError(err, errorMessage);
      throw err; // Re-throw to let calling component handle loading states
    }
  }, [item, getUrlParams, onItemUpdate]);

  // Handle custom price update from input
  const handleCustomPriceUpdate = useCallback(async () => {
    if (!newPrice.trim() || !item) {
      return;
    }

    const price = parseInt(newPrice, 10);
    if (isNaN(price) || price <= 0) {
      return;
    }

    // Check if the new price is the same as current price
    const currentPriceInt = Math.round(item.myPrice || 0);
    if (price === currentPriceInt) {
      return;
    }

    try {
      const currentDate = new Date().toISOString();
      await handlePriceUpdate(price, currentDate);
      setNewPrice(''); // Clear input on success
    } catch (err) {
      // Error already handled by handlePriceUpdate
    }
  }, [newPrice, item, handlePriceUpdate]);

  // Validation helpers
  const isValidPrice = useCallback(() => {
    if (!newPrice.trim()) return false;
    const price = parseInt(newPrice, 10);
    return !isNaN(price) && price > 0;
  }, [newPrice])();

  const isPriceChanged = useCallback(() => {
    if (!newPrice.trim() || !item) return false;
    const price = parseInt(newPrice, 10);
    const currentPriceInt = Math.round(item.myPrice || 0);
    return !isNaN(price) && price !== currentPriceInt;
  }, [newPrice, item])();

  return {
    newPrice,
    setNewPrice,
    handlePriceInputChange,
    handlePriceUpdate,
    handleCustomPriceUpdate,
    isValidPrice,
    isPriceChanged,
  };
};