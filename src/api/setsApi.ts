/**
 * Sets API Client
 * Handles all set-related API operations matching the backend endpoints
 */

import apiClient from './apiClient';
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
  const response = await apiClient.get('/sets?limit=1000');
  const data = response.data;
  return data.sets || [];
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

    const response = await apiClient.get(`/sets?${queryParams.toString()}`);
    const data = response.data;

    return {
      sets: data.sets || [],
      total: data.totalSets || 0,
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
      hasNextPage: data.hasNextPage || false,
      hasPrevPage: data.hasPrevPage || false,
    };
  }
};

/**
 * Get set by ID
 * @param id - Set ID
 * @returns Promise<ISet> - Single set
 */
export const getSetById = async (id: string): Promise<ISet> => {
  const response = await apiClient.get(`/sets/${id}`);
  return response.data.data || response.data;
};

/**
 * New Optimized Set Search using unified search endpoints
 * @param params - Search parameters with enhanced filtering
 * @returns Promise<OptimizedSetSearchResponse> - Enhanced search results with fuzzy matching
 */
export const searchSetsOptimized = async (
  params: OptimizedSetSearchParams
): Promise<OptimizedSetSearchResponse> => {
  const { query, limit = 20, page = 1, ...filters } = params;


  const queryParams = new URLSearchParams({
    query: query.trim(),
    limit: limit.toString(),
    page: page.toString(),
  });

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/search/sets?${queryParams.toString()}`);
  const data = response.data;

  return {
    success: data.success,
    query: data.query,
    count: data.count,
    data: data.data || [],
  };
};

/**
 * Enhanced Set Suggestions using new suggest endpoint
 * @param query - Search query string
 * @param limit - Maximum number of suggestions
 * @returns Promise<ISet[]> - Array of suggestion sets with relevance scoring
 */
export const getSetSuggestionsOptimized = async (
  query: string,
  limit: number = 10
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'sets',
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/search/suggest?${queryParams.toString()}`);
  const data = response.data;

  // Extract set suggestions from the response
  const setSuggestions = data.suggestions?.sets?.data || [];
  return setSuggestions;
};

/**
 * Get best match set using optimized search with limit=1
 * @param query - Search query string
 * @returns Promise<ISet | null> - Best matching set or null
 */
export const getBestMatchSetOptimized = async (query: string): Promise<ISet | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  const response = await searchSetsOptimized(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search sets by year using optimized endpoint
 * @param query - Search query string
 * @param year - Year to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ISet[]> - Array of sets from the specified year
 */
export const searchSetsByYear = async (
  query: string,
  year: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    year,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by year range using optimized endpoint
 * @param query - Search query string
 * @param minYear - Minimum year filter
 * @param maxYear - Maximum year filter
 * @param limit - Maximum number of results
 * @returns Promise<ISet[]> - Array of sets within year range
 */
export const searchSetsByYearRange = async (
  query: string,
  minYear: number,
  maxYear: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minYear,
    maxYear,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by PSA population using optimized endpoint
 * @param query - Search query string
 * @param minPsaPopulation - Minimum PSA population filter
 * @param limit - Maximum number of results
 * @returns Promise<ISet[]> - Array of sets with specified PSA population
 */
export const searchSetsByPsaPopulation = async (
  query: string,
  minPsaPopulation: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minPsaPopulation,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by card count using optimized endpoint
 * @param query - Search query string
 * @param minCardCount - Minimum card count filter
 * @param limit - Maximum number of results
 * @returns Promise<ISet[]> - Array of sets with specified card count
 */
export const searchSetsByCardCount = async (
  query: string,
  minCardCount: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minCardCount,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};
