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

import { createResourceOperations, SET_CONFIG } from './genericApiOperations';
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
type ISetCreatePayload = Omit<ISet, 'id' | '_id'>;

/**
 * Set update payload interface
 */
type ISetUpdatePayload = Partial<ISetCreatePayload>;

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
  includeExportOperations: false, // DISABLED - Sets are read-only
  includeBatchOperations: false, // DISABLED - Sets are read-only
});

// DISABLE MODIFICATION OPERATIONS - Sets are reference data only
setOperations.create = () =>
  Promise.reject(new Error('Set creation disabled - reference data only'));
setOperations.update = () =>
  Promise.reject(new Error('Set updates disabled - reference data only'));
setOperations.remove = () =>
  Promise.reject(new Error('Set deletion disabled - reference data only'));
setOperations.bulkCreate = () =>
  Promise.reject(new Error('Bulk set creation disabled - reference data only'));

// ========== EXPORTED API OPERATIONS ==========

// getSets and getSetById removed - not used by any frontend components

// SET MODIFICATION OPERATIONS DISABLED
// Sets are reference data managed by admin/backend only

/**
 * Search sets with parameters - consolidated implementation
 * @param searchParams - Set search parameters
 * @returns Promise<ISet[]> - Search results
 */
export const searchSets = async (searchParams: any): Promise<ISet[]> => {
  const result = await searchSetsApi(searchParams);
  return result.data;
};

// BULK AND BATCH SET OPERATIONS DISABLED
// Sets are reference data - no frontend modifications allowed

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
export { getSetSuggestions, getBestMatchSet } from './searchApi';
