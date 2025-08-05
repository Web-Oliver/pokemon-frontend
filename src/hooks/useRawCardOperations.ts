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
export const // ========================================
// CONSOLIDATED RAW CARD OPERATIONS HOOK
// ========================================
// Now uses consolidated useConsolidatedCollectionOperations following SOLID/DRY principles

import { useMemo } from 'react';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { 
  useConsolidatedCollectionOperations, 
  createRawCardConfig 
} from './useGenericCrudOperations';

/**
 * Raw Card operations hook - uses consolidated collection operations
 * Maintains backward compatibility while eliminating code duplication
 */
export const useRawCardOperations = () => {
  const collectionApi = getCollectionApiService();

  // Create entity configuration using factory
  const entityConfig = useMemo(
    () => createRawCardConfig(collectionApi),
    [collectionApi]
  );

  // Use consolidated operations hook
  const operations = useConsolidatedCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addRawCard: operations.add,
    updateRawCard: operations.update,
    deleteRawCard: operations.delete,
    markRawCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};;
