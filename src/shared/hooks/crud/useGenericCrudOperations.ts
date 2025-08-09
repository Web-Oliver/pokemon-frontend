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
import { ISaleDetails } from "../../types/common"';
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

// ============================================================================
// SPECIALIZED FACTORY FUNCTIONS FOR CARD OPERATIONS
// ============================================================================

/**
 * Entity configuration interface for consistent factory patterns
 */
export interface EntityConfig<T> {
  apiMethods: CrudApiOperations<T>;
  entityName: string;
  messages: {
    addSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    soldSuccess: string;
  };
}

/**
 * Factory function for PSA Card operations configuration
 * Provides maximum flexibility for PSA card CRUD operations
 */
export const createPsaCardConfig = (collectionApi: any): EntityConfig<any> => {
  return {
    apiMethods: {
      create: (data: any) => collectionApi.createPsaCard(data),
      update: (id: string, data: any) => collectionApi.updatePsaCard(id, data),
      delete: (id: string) => collectionApi.deletePsaCard(id),
      markSold: (id: string, saleDetails: any) => collectionApi.markPsaCardSold(id, saleDetails),
    },
    entityName: 'PSA Graded Card',
    messages: {
      addSuccess: '🏆 PSA Card added to collection!',
      updateSuccess: '✨ PSA Card updated successfully!',
      deleteSuccess: '🗑️ PSA Card removed from collection!',
      soldSuccess: '💰 PSA Card marked as sold!',
    },
  };
};

/**
 * Factory function for Raw Card operations configuration
 * Provides maximum flexibility for Raw card CRUD operations
 */
export const createRawCardConfig = (collectionApi: any): EntityConfig<any> => {
  return {
    apiMethods: {
      create: (data: any) => collectionApi.createRawCard(data),
      update: (id: string, data: any) => collectionApi.updateRawCard(id, data),
      delete: (id: string) => collectionApi.deleteRawCard(id),
      markSold: (id: string, saleDetails: any) => collectionApi.markRawCardSold(id, saleDetails),
    },
    entityName: 'Raw Card',
    messages: {
      addSuccess: '📦 Raw Card added to collection!',
      updateSuccess: '✨ Raw Card updated successfully!',
      deleteSuccess: '🗑️ Raw Card removed from collection!',
      soldSuccess: '💰 Raw Card marked as sold!',
    },
  };
};

/**
 * Factory function for Sealed Product operations configuration
 * Provides maximum flexibility for Sealed product CRUD operations
 */
export const createSealedProductConfig = (collectionApi: any): EntityConfig<any> => {
  return {
    apiMethods: {
      create: (data: any) => collectionApi.createSealedProduct(data),
      update: (id: string, data: any) => collectionApi.updateSealedProduct(id, data),
      delete: (id: string) => collectionApi.deleteSealedProduct(id),
      markSold: (id: string, saleDetails: any) => collectionApi.markSealedProductSold(id, saleDetails),
    },
    entityName: 'Sealed Product',
    messages: {
      addSuccess: '📦 Sealed Product added to collection!',
      updateSuccess: '✨ Sealed Product updated successfully!',
      deleteSuccess: '🗑️ Sealed Product removed from collection!',
      soldSuccess: '💰 Sealed Product marked as sold!',
    },
  };
};

/**
 * Generic factory function for creating any entity configuration
 * Maximum flexibility - can be used for any entity type
 */
export const createEntityConfig = <T>(
  entityName: string,
  apiMethods: CrudApiOperations<T>,
  customMessages?: Partial<EntityConfig<T>['messages']>
): EntityConfig<T> => {
  const defaultMessages = {
    addSuccess: `✅ ${entityName} added successfully!`,
    updateSuccess: `✨ ${entityName} updated successfully!`,
    deleteSuccess: `🗑️ ${entityName} removed successfully!`,
    soldSuccess: `💰 ${entityName} marked as sold!`,
  };

  return {
    apiMethods,
    entityName,
    messages: { ...defaultMessages, ...customMessages },
  };
};

// ============================================================================
// CONFIGURATION BUILDER PATTERN FOR MAXIMUM FLEXIBILITY
// ============================================================================

/**
 * Builder class for creating flexible CRUD configurations
 * Provides maximum flexibility with method chaining
 */
export class CrudConfigBuilder<T> {
  private config: Partial<EnhancedCrudConfig> = {};
  private messages: Partial<CrudMessages> = {};
  private entityName: string = 'Entity';

  /**
   * Set the entity name for messages and logging
   */
  withEntityName(name: string): CrudConfigBuilder<T> {
    this.entityName = name;
    return this;
  }

  /**
   * Set custom API operations
   */
  withApiOperations(operations: CrudApiOperations<T>): CrudConfigBuilder<T> {
    this.config.apiOperations = operations;
    return this;
  }

  /**
   * Set ResourceConfig for automatic operation generation
   */
  withResourceConfig(resourceConfig: ResourceConfig): CrudConfigBuilder<T> {
    this.config.resourceConfig = resourceConfig;
    return this;
  }

  /**
   * Enable sold operations (default: true for collection items)
   */
  withSoldOperations(enabled: boolean = true): CrudConfigBuilder<T> {
    this.config.includeSoldOperations = enabled;
    return this;
  }

  /**
   * Enable export operations (default: true for collection items)
   */
  withExportOperations(enabled: boolean = true): CrudConfigBuilder<T> {
    this.config.includeExportOperations = enabled;
    return this;
  }

  /**
   * Set custom success messages
   */
  withMessages(messages: Partial<CrudMessages>): CrudConfigBuilder<T> {
    this.messages = { ...this.messages, ...messages };
    return this;
  }

  /**
   * Set custom success message for add operations
   */
  withAddMessage(message: string): CrudConfigBuilder<T> {
    this.messages.addSuccess = message;
    return this;
  }

  /**
   * Set custom success message for update operations
   */
  withUpdateMessage(message: string): CrudConfigBuilder<T> {
    this.messages.updateSuccess = message;
    return this;
  }

  /**
   * Set custom success message for delete operations
   */
  withDeleteMessage(message: string): CrudConfigBuilder<T> {
    this.messages.deleteSuccess = message;
    return this;
  }

  /**
   * Set custom success message for sold operations
   */
  withSoldMessage(message: string): CrudConfigBuilder<T> {
    this.messages.soldSuccess = message;
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): { config: EnhancedCrudConfig; messages: CrudMessages } {
    const defaultMessages: CrudMessages = {
      entityName: this.entityName,
      addSuccess: `✅ ${this.entityName} added successfully!`,
      updateSuccess: `✨ ${this.entityName} updated successfully!`,
      deleteSuccess: `🗑️ ${this.entityName} removed successfully!`,
      soldSuccess: `💰 ${this.entityName} marked as sold!`,
    };

    return {
      config: this.config as EnhancedCrudConfig,
      messages: { ...defaultMessages, ...this.messages },
    };
  }

  /**
   * Build and return the useGenericCrudOperations hook
   */
  buildHook(): GenericCrudOperationsReturn<T> {
    const { config, messages } = this.build();
    
    if (config.resourceConfig) {
      return useEnhancedGenericCrudOperations<T>(config, messages);
    } else if (config.apiOperations) {
      return useGenericCrudOperations<T>(config.apiOperations, messages);
    }
    
    throw new Error('CrudConfigBuilder: Either resourceConfig or apiOperations must be provided');
  }
}

/**
 * Factory function to create a new CrudConfigBuilder
 * Provides maximum flexibility through builder pattern
 */
export const createCrudConfig = <T>(): CrudConfigBuilder<T> => {
  return new CrudConfigBuilder<T>();
};

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON PATTERNS
// ============================================================================

/**
 * Quick factory for collection items (PSA cards, Raw cards, Sealed products)
 * Provides sensible defaults for collection items
 */
export const createCollectionConfig = <T>(
  entityName: string,
  apiOperations: CrudApiOperations<T>,
  customMessages?: Partial<CrudMessages>
) => {
  return createCrudConfig<T>()
    .withEntityName(entityName)
    .withApiOperations(apiOperations)
    .withSoldOperations(true)  // Collection items support being sold
    .withExportOperations(true)  // Collection items support export
    .withMessages(customMessages || {})
    .build();
};

/**
 * Quick factory for non-collection entities (users, settings, etc.)
 * Provides sensible defaults for non-collection items
 */
export const createStandardConfig = <T>(
  entityName: string,
  apiOperations: CrudApiOperations<T>,
  customMessages?: Partial<CrudMessages>
) => {
  return createCrudConfig<T>()
    .withEntityName(entityName)
    .withApiOperations(apiOperations)
    .withSoldOperations(false)  // Standard entities typically don't support being sold
    .withExportOperations(false)  // Standard entities typically don't support export
    .withMessages(customMessages || {})
    .build();
};

export default useGenericCrudOperations;
