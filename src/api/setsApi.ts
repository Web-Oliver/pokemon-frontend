/**
 * Sets API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for set-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains ISet interface compatibility
 * - ISP: Provides specific set operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  createResourceOperations,
  idMapper,
  SET_CONFIG,
} from './genericApiOperations';
import { unifiedApiClient } from './unifiedApiClient';
import { ISet } from '../domain/models/card';
import { searchSets as searchSetsApi, type SetSearchParams } from './searchApi';

// ========== INTERFACES (ISP Compliance) ==========

export interface PaginatedSetsParams {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}

export interface PaginatedSetsResponse {
  sets: ISet[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Set creation payload interface
 */
interface ISetCreatePayload extends Omit<ISet, 'id' | '_id'> {}

/**
 * Set update payload interface
 */
interface ISetUpdatePayload extends Partial<ISetCreatePayload> {}

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for sets using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const setOperations = createResourceOperations<
  ISet,
  ISetCreatePayload,
  ISetUpdatePayload
>(SET_CONFIG, {
  includeExportOperations: true,
  includeBatchOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all sets with optional parameters
 * @param params - Optional filter parameters
 * @returns Promise<ISet[]> - Array of sets
 */
export const getSets = async (params?: { limit?: number }): Promise<ISet[]> => {
  const { limit = 1000 } = params || {};
  const response = await setOperations.getAll(
    { limit },
    {
      transform: idMapper,
    }
  );
  return response;
};

/**
 * Get set by ID
 * @param id - Set ID
 * @returns Promise<ISet> - Single set
 */
export const getSetById = async (id: string): Promise<ISet> => {
  return setOperations.getById(id, {
    transform: idMapper,
  });
};

/**
 * Create a new set
 * @param setData - Set creation data
 * @returns Promise<ISet> - Created set
 */
export const createSet = setOperations.create;

/**
 * Update existing set
 * @param id - Set ID
 * @param setData - Set update data
 * @returns Promise<ISet> - Updated set
 */
export const updateSet = setOperations.update;

/**
 * Delete set
 * @param id - Set ID
 * @returns Promise<void>
 */
export const removeSet = setOperations.remove;

/**
 * Search sets with parameters - consolidated implementation
 * @param searchParams - Set search parameters
 * @returns Promise<ISet[]> - Search results
 */
export const searchSets = async (searchParams: any): Promise<ISet[]> => {
  const result = await searchSetsApi(searchParams);
  return result.data;
};

/**
 * Bulk create sets
 * @param setsData - Array of set creation data
 * @returns Promise<ISet[]> - Created sets
 */
export const bulkCreateSets = setOperations.bulkCreate;

/**
 * Export sets data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportSets = setOperations.export;

/**
 * Batch operation on sets
 * @param operation - Operation name
 * @param ids - Set IDs
 * @param operationData - Operation-specific data
 * @returns Promise<ISet[]> - Operation results
 */
export const batchSetOperation = setOperations.batchOperation;

// ========== SET-SPECIFIC OPERATIONS ==========

/**
 * Get paginated sets with optional filters
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedSetsResponse> - Paginated sets response
 */
export const getPaginatedSets = async (
  params?: PaginatedSetsParams
): Promise<PaginatedSetsResponse> => {
  const { page = 1, limit = 20, year, search } = params || {};

  if (search && search.trim()) {
    // Use search API when there's a search term
    const searchParams: SetSearchParams = {
      query: search.trim(),
      page,
      limit,
      ...(year && { year }),
    };

    const response = await searchSetsApi(searchParams);

    // Calculate pagination for search results
    const totalPages = Math.ceil(response.count / limit);
    return {
      sets: response.data,
      total: response.count,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } else {
    // Use the main sets endpoint for browsing without search
    const queryParams = {
      page: page.toString(),
      limit: limit.toString(),
      ...(year && { year: year.toString() }),
    };

    const response = await unifiedApiClient.apiGet<PaginatedSetsResponse>(
      '/sets',
      'paginated sets',
      { params: queryParams }
    );

    return {
      sets: response.sets || [],
      total: response.total || 0,
      currentPage: response.currentPage || page,
      totalPages: response.totalPages || 1,
      hasNextPage: response.hasNextPage || false,
      hasPrevPage: response.hasPrevPage || false,
    };
  }
};

// Import consolidated search functions for set-specific search operations
export {
  getSetSuggestions,
  getBestMatchSet,
  searchSetsByYear,
  searchSetsByYearRange,
  searchSetsByPsaPopulation,
  searchSetsByCardCount,
} from './searchApi';
