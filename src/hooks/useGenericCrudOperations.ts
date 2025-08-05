/**
 * Generic CRUD Operations Hook
 * Eliminates code duplication across PSA/Raw/Sealed operations hooks
 *
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Handles generic CRUD operations
 * - Open/Closed: Extensible through configuration
 * - Dependency Inversion: Abstracts API operations through interfaces
 * - DRY: Eliminates ~300 lines of duplicate code across operation hooks
 */

import { useCallback } from 'react';
import { ISaleDetails } from '../domain/models/common';
import { showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useAsyncOperation } from './useAsyncOperation';

interface CrudApiOperations<T> {
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleDetails: ISaleDetails) => Promise<T>;
}

interface CrudMessages {
  entityName: string;
  addSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  soldSuccess: string;
}

interface GenericCrudOperationsReturn<T> {
  loading: boolean;
  error: string | null;
  add: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleDetails: ISaleDetails) => Promise<T>;
  clearError: () => void;
}

/**
 * Generic hook for CRUD operations
 * Consolidates duplicate logic from PSA/Raw/Sealed operation hooks
 * Uses TypeScript generics for type safety while maintaining reusability
 *
 * @param apiOperations - API service methods for CRUD operations
 * @param messages - User-facing messages for success notifications
 * @returns Consistent CRUD operation interface with loading/error states
 */
export const useGenericCrudOperations = <T>(
  apiOperations: CrudApiOperations<T>,
  messages: CrudMessages
): GenericCrudOperationsReturn<T> => {
  const { loading, error, execute, clearError } = useAsyncOperation();

  const add = useCallback(
    async (data: Partial<T>): Promise<T> => {
      return await execute(async () => {
        log(`Adding ${messages.entityName.toLowerCase()}...`);
        const newItem = await apiOperations.create(data);
        log(`${messages.entityName} added successfully`);
        showSuccessToast(messages.addSuccess);
        return newItem;
      });
    },
    [execute, apiOperations, messages]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T> => {
      return await execute(async () => {
        log(`Updating ${messages.entityName.toLowerCase()} ${id}...`);
        const updatedItem = await apiOperations.update(id, data);
        log(`${messages.entityName} updated successfully`);
        showSuccessToast(messages.updateSuccess);
        return updatedItem;
      });
    },
    [execute, apiOperations, messages]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      return await execute(async () => {
        log(`Deleting ${messages.entityName.toLowerCase()} ${id}...`);
        await apiOperations.delete(id);
        log(`${messages.entityName} deleted successfully`);
        showSuccessToast(messages.deleteSuccess);
      });
    },
    [execute, apiOperations, messages]
  );

  const markSold = useCallback(
    async (id: string, saleDetails: ISaleDetails): Promise<T> => {
      return await execute(async () => {
        log(`Marking ${messages.entityName.toLowerCase()} ${id} as sold...`);
        const soldItem = await apiOperations.markSold(id, saleDetails);
        log(`${messages.entityName} marked as sold successfully`);
        showSuccessToast(messages.soldSuccess);
        return soldItem;
      });
    },
    [execute, apiOperations, messages]
  );

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

// ========================================
// CONSOLIDATED COLLECTION OPERATIONS HOOK
// ========================================
// This hook consolidates usePsaCardOperations, useRawCardOperations, 
// and useSealedProductOperations following SOLID/DRY principles

import { useMemo } from 'react';

// Entity configuration type for different collection items
export interface CollectionEntityConfig<T> {
  entityName: string;
  apiMethods: {
    create: (data: Omit<T, '_id'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
    markSold: (id: string, saleData: any) => Promise<T>;
  };
  messages: {
    addSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    soldSuccess: string;
  };
}

// Generic return type for collection operations
export interface UseCollectionOperationsReturn<T> {
  loading: boolean;
  error: string | null;
  add: (data: Omit<T, '_id'>) => Promise<T | undefined>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleData: any) => Promise<T | undefined>;
  clearError: () => void;
}

/**
 * Consolidated collection operations hook following SOLID principles
 * Replaces usePsaCardOperations, useRawCardOperations, useSealedProductOperations
 * 
 * @param entityConfig Configuration for the specific collection entity
 * @returns Collection operations interface
 */
export const useConsolidatedCollectionOperations = <T>(
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
// ========================================
// CONSOLIDATED DEBOUNCE UTILITIES
// ========================================
// Consolidates both utils/common.ts debounce and hooks/useDebounce

import { useCallback, useEffect, useRef } from 'react';

/**
 * Utility debounce function (from utils/common.ts)
 * For non-React contexts
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Hook-based debounce (from hooks/useDebounce.ts)
 * For React contexts with proper cleanup
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
// ========================================
// ENTITY CONFIGURATION FACTORIES
// ========================================
// Factory functions to create entity-specific configurations

/**
 * Creates PSA Card entity configuration
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
    addSuccess: 'PSA graded card added to collection!',
    updateSuccess: 'PSA graded card updated successfully!',
    deleteSuccess: 'PSA graded card removed from collection!',
    soldSuccess: 'PSA graded card marked as sold!',
  },
});

/**
 * Creates Raw Card entity configuration
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
    addSuccess: 'Raw card added to collection!',
    updateSuccess: 'Raw card updated successfully!',
    deleteSuccess: 'Raw card removed from collection!',
    soldSuccess: 'Raw card marked as sold!',
  },
});

/**
 * Creates Sealed Product entity configuration
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
    addSuccess: 'Sealed product added to collection!',
    updateSuccess: 'Sealed product updated successfully!',
    deleteSuccess: 'Sealed product removed from collection!',
    soldSuccess: 'Sealed product marked as sold!',
  },
});
// ========================================
// CONSOLIDATED COLLECTION OPERATIONS HOOK
// ========================================
// This hook consolidates usePsaCardOperations, useRawCardOperations, 
// and useSealedProductOperations following SOLID/DRY principles

import { useMemo } from 'react';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { useGenericCrudOperations } from './useGenericCrudOperations';

// Entity configuration type for different collection items
export interface CollectionEntityConfig<T> {
  entityName: string;
  apiMethods: {
    create: (data: Omit<T, '_id'>) => Promise<T>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
    markSold: (id: string, saleData: any) => Promise<T>;
  };
  messages: {
    addSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    soldSuccess: string;
  };
}

// Generic return type for collection operations
export interface UseCollectionOperationsReturn<T> {
  loading: boolean;
  error: string | null;
  add: (data: Omit<T, '_id'>) => Promise<T | undefined>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleData: any) => Promise<T | undefined>;
  clearError: () => void;
}

/**
 * Consolidated collection operations hook following SOLID principles
 * Replaces usePsaCardOperations, useRawCardOperations, useSealedProductOperations
 * 
 * @param entityConfig Configuration for the specific collection entity
 * @returns Collection operations interface
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

// ========================================
// ENTITY-SPECIFIC HOOK FACTORIES
// ========================================
// Factory functions to create entity-specific hooks with proper typing

/**
 * PSA Card operations hook - uses consolidated useCollectionOperations
 */
export const usePsaCardOperations = () => {
  const collectionApi = getCollectionApiService();

  const entityConfig: CollectionEntityConfig<any> = useMemo(() => ({
    entityName: 'PSA Graded Card',
    apiMethods: {
      create: collectionApi.createPsaCard.bind(collectionApi),
      update: collectionApi.updatePsaCard.bind(collectionApi),
      delete: collectionApi.deletePsaCard.bind(collectionApi),
      markSold: collectionApi.markPsaCardSold.bind(collectionApi),
    },
    messages: {
      addSuccess: 'PSA graded card added to collection!',
      updateSuccess: 'PSA graded card updated successfully!',
      deleteSuccess: 'PSA graded card removed from collection!',
      soldSuccess: 'PSA graded card marked as sold!',
    },
  }), [collectionApi]);

  const operations = useCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addPsaCard: operations.add,
    updatePsaCard: operations.update,
    deletePsaCard: operations.delete,
    markPsaCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};

/**
 * Raw Card operations hook - uses consolidated useCollectionOperations
 */
export const useRawCardOperations = () => {
  const collectionApi = getCollectionApiService();

  const entityConfig: CollectionEntityConfig<any> = useMemo(() => ({
    entityName: 'Raw Card',
    apiMethods: {
      create: collectionApi.createRawCard.bind(collectionApi),
      update: collectionApi.updateRawCard.bind(collectionApi),
      delete: collectionApi.deleteRawCard.bind(collectionApi),
      markSold: collectionApi.markRawCardSold.bind(collectionApi),
    },
    messages: {
      addSuccess: 'Raw card added to collection!',
      updateSuccess: 'Raw card updated successfully!',
      deleteSuccess: 'Raw card removed from collection!',
      soldSuccess: 'Raw card marked as sold!',
    },
  }), [collectionApi]);

  const operations = useCollectionOperations(entityConfig);

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
};

/**
 * Sealed Product operations hook - uses consolidated useCollectionOperations
 */
export const useSealedProductOperations = () => {
  const collectionApi = getCollectionApiService();

  const entityConfig: CollectionEntityConfig<any> = useMemo(() => ({
    entityName: 'Sealed Product',
    apiMethods: {
      create: collectionApi.createSealedProduct.bind(collectionApi),
      update: collectionApi.updateSealedProduct.bind(collectionApi),
      delete: collectionApi.deleteSealedProduct.bind(collectionApi),
      markSold: collectionApi.markSealedProductSold.bind(collectionApi),
    },
    messages: {
      addSuccess: 'Sealed product added to collection!',
      updateSuccess: 'Sealed product updated successfully!',
      deleteSuccess: 'Sealed product removed from collection!',
      soldSuccess: 'Sealed product marked as sold!',
    },
  }), [collectionApi]);

  const operations = useCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addSealedProduct: operations.add,
    updateSealedProduct: operations.update,
    deleteSealedProduct: operations.delete,
    markSealedProductSold: operations.markSold,
    clearError: operations.clearError,
  };
};

export default useGenericCrudOperations;
