/**
 * Raw Card Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles Raw card operations
 */

import { useCallback } from 'react';
import { IRawCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useAsyncOperation } from './useAsyncOperation';

export interface UseRawCardOperationsReturn {
  loading: boolean;
  error: string | null;
  addRawCard: (cardData: Partial<IRawCard>) => Promise<IRawCard>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<IRawCard>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: ISaleDetails) => Promise<IRawCard>;
  clearError: () => void;
}

/**
 * Hook for Raw card operations
 * Follows SRP - only handles Raw card API operations
 */
export const useRawCardOperations = (): UseRawCardOperationsReturn => {
  const { loading, error, execute, clearError } = useAsyncOperation();
  const collectionApi = getCollectionApiService();

  const addRawCard = useCallback(
    async (cardData: Partial<IRawCard>): Promise<IRawCard> => {
      return await execute(async () => {
        log('Adding raw card...');
        const newCard = await collectionApi.createRawCard(cardData);
        log('Raw card added successfully');
        showSuccessToast('Raw card added to collection!');
        return newCard;
      });
    },
    [execute, collectionApi]
  );

  const updateRawCard = useCallback(
    async (id: string, cardData: Partial<IRawCard>): Promise<IRawCard> => {
      return await execute(async () => {
        log(`Updating raw card ${id}...`);
        const updatedCard = await collectionApi.updateRawCard(id, cardData);
        
        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log('Raw card updated successfully');
        showSuccessToast('Raw card updated successfully!');
        return cardWithId;
      });
    },
    [execute, collectionApi]
  );

  const deleteRawCard = useCallback(
    async (id: string): Promise<void> => {
      return await execute(async () => {
        log(`Deleting raw card ${id}...`);
        await collectionApi.deleteRawCard(id);
        log('Raw card deleted successfully');
        showSuccessToast('Raw card removed from collection!');
      });
    },
    [execute, collectionApi]
  );

  const markRawCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails): Promise<IRawCard> => {
      return await execute(async () => {
        log(`Marking raw card ${id} as sold...`);
        const soldCard = await collectionApi.markRawCardSold(id, saleDetails);
        log('Raw card marked as sold successfully');
        showSuccessToast('Raw card marked as sold! 💰');
        return soldCard;
      });
    },
    [execute, collectionApi]
  );

  return {
    loading,
    error,
    addRawCard,
    updateRawCard,
    deleteRawCard,
    markRawCardSold,
    clearError,
  };
};