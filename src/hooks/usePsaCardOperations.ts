/**
 * PSA Card Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles PSA card operations
 *
 * OPTIMIZED: Now uses useGenericCrudOperations to eliminate code duplication
 * Following CLAUDE.md DRY principles - reduced from ~100 lines to ~30 lines
 */

import { useMemo } from 'react';
import { IPsaGradedCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { useGenericCrudOperations } from './useGenericCrudOperations';

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
 * Uses generic CRUD operations to eliminate code duplication
 * Follows SRP - only handles PSA card configuration and interface mapping
 */
export const usePsaCardOperations = (): UsePsaCardOperationsReturn => {
  const collectionApi = getCollectionApiService();

  // Memoize API operations configuration to prevent unnecessary re-renders
  const apiOperations = useMemo(
    () => ({
      create: collectionApi.createPsaCard.bind(collectionApi),
      update: collectionApi.updatePsaCard.bind(collectionApi),
      delete: collectionApi.deletePsaCard.bind(collectionApi),
      markSold: collectionApi.markPsaCardSold.bind(collectionApi),
    }),
    [collectionApi]
  );

  // Memoize messages configuration
  const messages = useMemo(
    () => ({
      entityName: 'PSA Graded Card',
      addSuccess: 'PSA graded card added to collection!',
      updateSuccess: 'PSA graded card updated successfully!',
      deleteSuccess: 'PSA graded card removed from collection!',
      soldSuccess: 'PSA graded card marked as sold!',
    }),
    []
  );

  const {
    loading,
    error,
    add,
    update,
    delete: deleteItem,
    markSold,
    clearError,
  } = useGenericCrudOperations<IPsaGradedCard>(apiOperations, messages);

  // Return interface-compatible methods
  return {
    loading,
    error,
    addPsaCard: add,
    updatePsaCard: update,
    deletePsaCard: deleteItem,
    markPsaCardSold: markSold,
    clearError,
  };
};
