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
 * This is the CORE generic CRUD hook - no duplicates, no consolidation mixing
 */

import { useCallback } from 'react';
import { ISaleDetails } from '../../domain/models/common';
import { showSuccessToast } from '../../ui/toastNotifications';
import { log } from '../../utils/logger';
import { useAsyncOperation } from '../useAsyncOperation';

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
  add: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  markSold: (id: string, saleDetails: ISaleDetails) => Promise<T>;
  clearError: () => void;
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

export default useGenericCrudOperations;