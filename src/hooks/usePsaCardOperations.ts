/**
 * PSA Card Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles PSA card operations
 */

import { useCallback } from 'react';
import { IPsaGradedCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useAsyncOperation } from './useAsyncOperation';

export interface UsePsaCardOperationsReturn {
  loading: boolean;
  error: string | null;
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<IPsaGradedCard>;
  updatePsaCard: (id: string, cardData: Partial<IPsaGradedCard>) => Promise<IPsaGradedCard>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: ISaleDetails) => Promise<IPsaGradedCard>;
  clearError: () => void;
}

/**
 * Hook for PSA card operations
 * Follows SRP - only handles PSA card API operations
 */
export const usePsaCardOperations = (): UsePsaCardOperationsReturn => {
  const { loading, error, execute, clearError } = useAsyncOperation();
  const collectionApi = getCollectionApiService();

  const addPsaCard = useCallback(
    async (cardData: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> => {
      return await execute(async () => {
        log('Adding PSA graded card...');
        const newCard = await collectionApi.createPsaCard(cardData);
        log('PSA graded card added successfully');
        showSuccessToast('PSA graded card added to collection!');
        return newCard;
      });
    },
    [execute, collectionApi]
  );

  const updatePsaCard = useCallback(
    async (id: string, cardData: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> => {
      return await execute(async () => {
        log(`Updating PSA graded card ${id}...`);
        const updatedCard = await collectionApi.updatePsaCard(id, cardData);
        
        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log('PSA graded card updated successfully');
        showSuccessToast('PSA graded card updated successfully!');
        return cardWithId;
      });
    },
    [execute, collectionApi]
  );

  const deletePsaCard = useCallback(
    async (id: string): Promise<void> => {
      return await execute(async () => {
        log(`Deleting PSA graded card ${id}...`);
        await collectionApi.deletePsaCard(id);
        log('PSA graded card deleted successfully');
        showSuccessToast('PSA graded card removed from collection!');
      });
    },
    [execute, collectionApi]
  );

  const markPsaCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> => {
      return await execute(async () => {
        log(`Marking PSA graded card ${id} as sold...`);
        const soldCard = await collectionApi.markPsaCardSold(id, saleDetails);
        log('PSA graded card marked as sold successfully');
        showSuccessToast('PSA graded card marked as sold! 💰');
        return soldCard;
      });
    },
    [execute, collectionApi]
  );

  return {
    loading,
    error,
    addPsaCard,
    updatePsaCard,
    deletePsaCard,
    markPsaCardSold,
    clearError,
  };
};