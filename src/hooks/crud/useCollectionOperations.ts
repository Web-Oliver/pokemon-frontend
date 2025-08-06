/**
 * Collection Operations Hook
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility - handles collection operations using generic CRUD
 * - OCP: Open for extension through entity configurations
 * - DIP: Depends on abstractions (CollectionEntityConfig)
 * - DRY: Reuses generic CRUD operations
 */

import { useGenericCrudOperations } from './useGenericCrudOperations';
import { 
  CollectionEntityConfig, 
  UseCollectionOperationsReturn 
} from './collectionEntityConfigs';

// ============================================================================
// COLLECTION OPERATIONS HOOK - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Consolidated collection operations hook following SOLID principles
 * This replaces the original usePsaCardOperations, useRawCardOperations, useSealedProductOperations
 * 
 * @param entityConfig Configuration for the specific collection entity
 * @returns Collection operations interface with proper error handling
 */
export const useCollectionOperations = <T>(
  entityConfig: CollectionEntityConfig<T>
): UseCollectionOperationsReturn<T> => {
  const {
    loading,
    error,
    add,
    update,
    delete: deleteItem,
    markSold,
    clearError,
  } = useGenericCrudOperations<T>(entityConfig.apiMethods, entityConfig.messages);

  return {
    loading,
    error,
    add,
    update,
    delete: deleteItem,
    markSold,
    clearError,
  };
};

export default useCollectionOperations;