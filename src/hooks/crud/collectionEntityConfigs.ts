/**
 * Collection Entity Configuration Factory
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility - only handles entity configuration definitions
 * - OCP: Open for extension by adding new entity configs
 * - DIP: Depends on abstractions (API interfaces)
 * - DRY: Single source of truth for entity configurations
 */

import { useMemo } from 'react';
import { CrudApiOperations, CrudMessages } from './useGenericCrudOperations';

// ============================================================================
// COLLECTION ENTITY CONFIGURATION INTERFACE
// ============================================================================

export interface CollectionEntityConfig<T> {
  entityName: string;
  apiMethods: CrudApiOperations<T>;
  messages: CrudMessages;
}

// ============================================================================
// ENTITY CONFIGURATION FACTORIES - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Creates PSA Card entity configuration
 * @param collectionApi - API service instance
 * @returns Configuration object for PSA card operations
 */
export const createPsaCardConfig = (collectionApi: any): CollectionEntityConfig<any> => ({
  entityName: 'PSA Graded Card',
  apiMethods: {
    create: collectionApi.createPsaCard.bind(collectionApi),
    update: collectionApi.updatePsaCard.bind(collectionApi),
    delete: collectionApi.deletePsaCard.bind(collectionApi),
    markSold: collectionApi.markPsaCardSold.bind(collectionApi),
  },
  messages: {
    entityName: 'PSA Graded Card',
    addSuccess: 'PSA graded card added to collection!',
    updateSuccess: 'PSA graded card updated successfully!',
    deleteSuccess: 'PSA graded card removed from collection!',
    soldSuccess: 'PSA graded card marked as sold!',
  },
});

/**
 * Creates Raw Card entity configuration
 * @param collectionApi - API service instance  
 * @returns Configuration object for raw card operations
 */
export const createRawCardConfig = (collectionApi: any): CollectionEntityConfig<any> => ({
  entityName: 'Raw Card',
  apiMethods: {
    create: collectionApi.createRawCard.bind(collectionApi),
    update: collectionApi.updateRawCard.bind(collectionApi),
    delete: collectionApi.deleteRawCard.bind(collectionApi),
    markSold: collectionApi.markRawCardSold.bind(collectionApi),
  },
  messages: {
    entityName: 'Raw Card',
    addSuccess: 'Raw card added to collection!',
    updateSuccess: 'Raw card updated successfully!',
    deleteSuccess: 'Raw card removed from collection!',
    soldSuccess: 'Raw card marked as sold!',
  },
});

/**
 * Creates Sealed Product entity configuration
 * @param collectionApi - API service instance
 * @returns Configuration object for sealed product operations
 */
export const createSealedProductConfig = (collectionApi: any): CollectionEntityConfig<any> => ({
  entityName: 'Sealed Product',
  apiMethods: {
    create: collectionApi.createSealedProduct.bind(collectionApi),
    update: collectionApi.updateSealedProduct.bind(collectionApi),
    delete: collectionApi.deleteSealedProduct.bind(collectionApi),
    markSold: collectionApi.markSealedProductSold.bind(collectionApi),
  },
  messages: {
    entityName: 'Sealed Product',
    addSuccess: 'Sealed product added to collection!',
    updateSuccess: 'Sealed product updated successfully!',
    deleteSuccess: 'Sealed product removed from collection!',
    soldSuccess: 'Sealed product marked as sold!',
  },
});

// ============================================================================
// COLLECTION OPERATIONS RETURN INTERFACE
// ============================================================================

export interface UseCollectionOperationsReturn<T> {
  loading: boolean;
  error: string | null;
  add: (data: Omit<T, '_id'>) => Promise<T | undefined>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleData: any) => Promise<T | undefined>;
  clearError: () => void;
}

// ============================================================================
// ENTITY-SPECIFIC HOOK FACTORY UTILITIES
// ============================================================================

/**
 * Creates a memoized entity configuration
 * @param configFactory - Configuration factory function
 * @param collectionApi - API service instance
 * @returns Memoized entity configuration
 */
export const useEntityConfig = <T>(
  configFactory: (api: any) => CollectionEntityConfig<T>,
  collectionApi: any
): CollectionEntityConfig<T> => {
  return useMemo(() => configFactory(collectionApi), [configFactory, collectionApi]);
};