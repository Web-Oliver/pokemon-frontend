/**
 * Sets API Client
 * Handles all set-related API operations matching the backend endpoints
 */

import unifiedApiClient from './unifiedApiClient';
import { ISet } from '../domain/models/card';

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

export interface OptimizedSetSearchParams {
  query: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPsaPopulation?: number;
  minCardCount?: number;
  limit?: number;
  page?: number;
}

export interface OptimizedSetSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: ISet[];
}

/**
 * Get all sets - USES NEW UNIFIED SEARCH API
 * @returns Promise<ISet[]> - Complete sets array
 */
export const getSets = async (): Promise<ISet[]> => {
  // Use the main sets endpoint to get all sets
  const response = await unifiedApiClient.get('/sets?limit=1000');
  return response.sets || [];
};

/**
 * Get paginated sets with optional filters - USES NEW UNIFIED SEARCH API
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedSetsResponse> - Paginated sets response
 */
export const getPaginatedSets = async (
  params?: PaginatedSetsParams
): Promise<PaginatedSetsResponse> => {
  const { page = 1, limit = 20, year, search } = params || {};

  if (search && search.trim()) {
    // Use optimized search when there's a search term
    const optimizedParams: OptimizedSetSearchParams = {
      query: search.trim(),
      page,
      limit,
      ...(year && { year }),
    };

    const response = await searchSetsOptimized(optimizedParams);

    // Calculate pagination for optimized search
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
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(year && { year: year.toString() }),
    });

    const response = await unifiedApiClient.get(`/sets?${queryParams.toString()}`);

    return {
      sets: response.sets || [],
      total: response.totalSets || 0,
      currentPage: response.currentPage || page,
      totalPages: response.totalPages || 1,
      hasNextPage: response.hasNextPage || false,
      hasPrevPage: response.hasPrevPage || false,
    };
  }
};

/**
 * Get set by ID
 * @param id - Set ID
 * @returns Promise<ISet> - Single set
 */
export const getSetById = async (id: string): Promise<ISet> => {
  const response = await unifiedApiClient.get(`/sets/${id}`);
  return response.data || response;
};

// Import consolidated search functions
export { 
  searchSetsOptimized,
  getSetSuggestionsOptimized,
  getBestMatchSetOptimized,
  searchSetsByYear,
  searchSetsByYearRange,
  searchSetsByPsaPopulation,
  searchSetsByCardCount
} from './consolidatedSearch';

