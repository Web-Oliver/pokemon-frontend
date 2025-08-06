/**
 * Generic CRUD Operations Hook
 * Following CLAUDE.md SOLID principles with complete DRY compliance
 *
 * SOLID Principles Applied:
 * - SRP: Single responsibility - only handles generic CRUD operations
 * - OCP: Open for extension through configuration, closed for modification
 * - DIP: Depends on abstractions (CrudApiOperations interface)
 * - DRY: Single source of truth for CRUD patterns
 *
 * INTEGRATED: Now uses patterns from genericApiOperations.ts for complete DRY compliance
 * - ResourceOperations interface integration
 * - ResourceConfig support for direct factory usage
 * - Automatic operation mapping from createResourceOperations
 */

import { useCallback, useMemo } from 'react';
import { ISaleDetails } from '../../domain/models/common';
import { showSuccessToast } from '../../components/organisms/ui/toastNotifications';
import { log } from '../../utils/performance/logger';
import { useAsyncOperation } from '../useAsyncOperation';
import {
  ResourceOperations,
  ResourceConfig,
  createResourceOperations,
  OperationOptions,
  GenericParams,
} from '../../api/genericApiOperations';

// ============================================================================
// CORE CRUD INTERFACES - SINGLE SOURCE OF TRUTH
// ============================================================================

export interface CrudApiOperations<T> {
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleDetails: ISaleDetails) => Promise<T>;
}

export interface CrudMessages {
  entityName: string;
  addSuccess: string;
  updateSuccess: string;
  deleteSuccess: string;
  soldSuccess: string;
}

export interface GenericCrudOperationsReturn<T> {
  loading: boolean;
  error: string | null;
  add: (data: Partial<T>, options?: OperationOptions) => Promise<T>;
  update: (id: string, data: Partial<T>, options?: OperationOptions) => Promise<T>;
  delete: (id: string, options?: OperationOptions) => Promise<void>;
  markSold: (id: string, saleDetails: ISaleDetails, options?: OperationOptions) => Promise<T>;
  search: (params: GenericParams, options?: OperationOptions) => Promise<T[]>;
  getAll: (params?: GenericParams, options?: OperationOptions) => Promise<T[]>;
  getById: (id: string, options?: OperationOptions) => Promise<T>;
  export?: (params?: GenericParams, options?: OperationOptions) => Promise<Blob>;
  clearError: () => void;
}

/**
 * Enhanced configuration for generic CRUD operations
 * Integrates with genericApiOperations patterns
 */
export interface EnhancedCrudConfig {
  // Direct ResourceConfig for automatic operation generation
  resourceConfig?: ResourceConfig;
  
  // Specialized operation flags (from createResourceOperations)
  includeSoldOperations?: boolean;
  includeExportOperations?: boolean;
  
  // Custom API operations (legacy support)
  apiOperations?: CrudApiOperations<any>;
}

// ============================================================================
// CORE GENERIC CRUD HOOK - SINGLE RESPONSIBILITY
// ============================================================================

/**
 * Generic hook for CRUD operations following SOLID principles
 * This is the ONLY place where generic CRUD logic should be implemented
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

// ============================================================================
// ENHANCED GENERIC CRUD HOOK WITH GENERICAPIOPERATIONS INTEGRATION
// ============================================================================

/**
 * Enhanced generic CRUD hook with full genericApiOperations.ts integration
 * Supports both ResourceConfig-based automatic generation and custom operations
 *
 * @param config - Enhanced configuration with ResourceConfig support
 * @param messages - User-facing messages for success notifications
 * @returns Complete CRUD operation interface with all genericApiOperations patterns
 */
export const useEnhancedGenericCrudOperations = <T>(
  config: EnhancedCrudConfig,
  messages: CrudMessages
): GenericCrudOperationsReturn<T> => {
  const { loading, error, execute, clearError } = useAsyncOperation();

  // Create ResourceOperations automatically from config if provided
  const resourceOperations = useMemo(() => {
    if (config.resourceConfig) {
      return createResourceOperations<T>(config.resourceConfig, {
        includeSoldOperations: config.includeSoldOperations,
        includeExportOperations: config.includeExportOperations,
      });
    }
    return null;
  }, [config.resourceConfig, config.includeSoldOperations, config.includeExportOperations]);

  // Use ResourceOperations or fallback to custom API operations
  const apiOperations = resourceOperations || config.apiOperations;

  if (!apiOperations) {
    throw new Error('useEnhancedGenericCrudOperations: Either resourceConfig or apiOperations must be provided');
  }

  const add = useCallback(
    async (data: Partial<T>, options?: OperationOptions): Promise<T> => {
      return await execute(async () => {
        log(`Adding ${messages.entityName.toLowerCase()}...`);
        const newItem = await apiOperations.create(data, options);
        log(`${messages.entityName} added successfully`);
        showSuccessToast(messages.addSuccess);
        return newItem;
      });
    },
    [execute, apiOperations, messages]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>, options?: OperationOptions): Promise<T> => {
      return await execute(async () => {
        log(`Updating ${messages.entityName.toLowerCase()} ${id}...`);
        const updatedItem = await apiOperations.update(id, data, options);
        log(`${messages.entityName} updated successfully`);
        showSuccessToast(messages.updateSuccess);
        return updatedItem;
      });
    },
    [execute, apiOperations, messages]
  );

  const deleteItem = useCallback(
    async (id: string, options?: OperationOptions): Promise<void> => {
      return await execute(async () => {
        log(`Deleting ${messages.entityName.toLowerCase()} ${id}...`);
        await apiOperations.remove(id, options);
        log(`${messages.entityName} deleted successfully`);
        showSuccessToast(messages.deleteSuccess);
      });
    },
    [execute, apiOperations, messages]
  );

  const markSold = useCallback(
    async (id: string, saleDetails: ISaleDetails, options?: OperationOptions): Promise<T> => {
      return await execute(async () => {
        if (!apiOperations.markSold) {
          throw new Error(`markSold operation not available for ${messages.entityName}`);
        }
        log(`Marking ${messages.entityName.toLowerCase()} ${id} as sold...`);
        const soldItem = await apiOperations.markSold(id, saleDetails, options);
        log(`${messages.entityName} marked as sold successfully`);
        showSuccessToast(messages.soldSuccess);
        return soldItem;
      });
    },
    [execute, apiOperations, messages]
  );

  const search = useCallback(
    async (params: GenericParams, options?: OperationOptions): Promise<T[]> => {
      return await execute(async () => {
        log(`Searching ${messages.entityName.toLowerCase()}s...`);
        const results = await apiOperations.search(params, options);
        log(`Search completed for ${messages.entityName.toLowerCase()}s`);
        return results;
      });
    },
    [execute, apiOperations, messages]
  );

  const getAll = useCallback(
    async (params?: GenericParams, options?: OperationOptions): Promise<T[]> => {
      return await execute(async () => {
        log(`Fetching all ${messages.entityName.toLowerCase()}s...`);
        const items = await apiOperations.getAll(params, options);
        log(`Fetched ${Array.isArray(items) ? items.length : 0} ${messages.entityName.toLowerCase()}s`);
        return items;
      });
    },
    [execute, apiOperations, messages]
  );

  const getById = useCallback(
    async (id: string, options?: OperationOptions): Promise<T> => {
      return await execute(async () => {
        log(`Fetching ${messages.entityName.toLowerCase()} ${id}...`);
        const item = await apiOperations.getById(id, options);
        log(`Fetched ${messages.entityName.toLowerCase()} successfully`);
        return item;
      });
    },
    [execute, apiOperations, messages]
  );

  const exportData = useMemo(() => {
    if (!apiOperations.export) {
      return undefined;
    }
    
    return async (params?: GenericParams, options?: OperationOptions): Promise<Blob> => {
      return await execute(async () => {
        log(`Exporting ${messages.entityName.toLowerCase()}s...`);
        const blob = await apiOperations.export!(params, options);
        log(`Export completed for ${messages.entityName.toLowerCase()}s`);
        showSuccessToast(`${messages.entityName}s exported successfully! 📥`);
        return blob;
      });
    };
  }, [execute, apiOperations, messages]);

  return {
    loading,
    error,
    add,
    update,
    delete: deleteItem,
    markSold,
    search,
    getAll,
    getById,
    export: exportData,
    clearError,
  };
};

// ============================================================================
// FACTORY FUNCTIONS FOR COMMON PATTERNS
// ============================================================================

/**
 * Factory function to create CRUD operations with collection logging
 * Implements the createLoggedCollectionOperation<T> pattern from refactoring plan
 */
export const createLoggedCollectionOperation = <T>(
  resourceConfig: ResourceConfig,
  messages: CrudMessages,
  options: {
    includeSoldOperations?: boolean;
    includeExportOperations?: boolean;
  } = {}
) => {
  const config: EnhancedCrudConfig = {
    resourceConfig,
    includeSoldOperations: options.includeSoldOperations ?? true, // Collection items typically support sold operations
    includeExportOperations: options.includeExportOperations ?? true, // Collection items typically support export
  };

  return {
    config,
    messages,
    useOperations: () => useEnhancedGenericCrudOperations<T>(config, messages),
  };
};

export default useGenericCrudOperations;
