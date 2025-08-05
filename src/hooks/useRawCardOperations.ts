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
import { useGenericCrudOperations, createRawCardConfig } from './useGenericCrudOperations';

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
/**
 * Raw Card operations hook - uses consolidated collection operations
 */
export const useRawCardOperations = (): UseRawCardOperationsReturn => {
  const collectionApi = getCollectionApiService();

  const entityConfig = useMemo(
    () => createRawCardConfig(collectionApi),
    [collectionApi]
  );

  const operations = useGenericCrudOperations(entityConfig);

  return {
    loading: operations.loading,
    error: operations.error,
    addRawCard: operations.add,
    updateRawCard: operations.update,
    deleteRawCard: operations.delete,
    markRawCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};
