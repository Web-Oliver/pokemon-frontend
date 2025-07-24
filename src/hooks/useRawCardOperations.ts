/**
 * Raw Card Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles Raw card operations
 *
 * OPTIMIZED: Now uses useGenericCrudOperations to eliminate code duplication
 * Following CLAUDE.md DRY principles - reduced from ~100 lines to ~30 lines
 */

import { useMemo } from 'react';
import { IRawCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { useGenericCrudOperations } from './useGenericCrudOperations';

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
 * Uses generic CRUD operations to eliminate code duplication
 * Follows SRP - only handles Raw card configuration and interface mapping
 */
export const useRawCardOperations = (): UseRawCardOperationsReturn => {
  const collectionApi = getCollectionApiService();

  // Memoize API operations configuration to prevent unnecessary re-renders
  const apiOperations = useMemo(
    () => ({
      create: collectionApi.createRawCard.bind(collectionApi),
      update: collectionApi.updateRawCard.bind(collectionApi),
      delete: collectionApi.deleteRawCard.bind(collectionApi),
      markSold: collectionApi.markRawCardSold.bind(collectionApi),
    }),
    [collectionApi]
  );

  // Memoize messages configuration
  const messages = useMemo(
    () => ({
      entityName: 'Raw Card',
      addSuccess: 'Raw card added to collection!',
      updateSuccess: 'Raw card updated successfully!',
      deleteSuccess: 'Raw card removed from collection!',
      soldSuccess: 'Raw card marked as sold!',
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
  } = useGenericCrudOperations<IRawCard>(apiOperations, messages);

  // Return interface-compatible methods
  return {
    loading,
    error,
    addRawCard: add,
    updateRawCard: update,
    deleteRawCard: deleteItem,
    markRawCardSold: markSold,
    clearError,
  };
};
