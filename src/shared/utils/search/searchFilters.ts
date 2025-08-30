/**
 * Search Filter Utilities
 * Following CLAUDE.md SOLID principles - SRP: Single responsibility for search data filtering
 *
 * Extracted from SearchService to separate API concerns from data transformation
 */

import { SearchResponse } from '@/types/search';

/**
 * Filter search results by MongoDB ObjectId for hierarchical search
 * Handles both direct ObjectId matches and populated object matches
 */
export const filterByObjectId = <T extends Record<string, any>>(
  searchResponse: SearchResponse<T>,
  filterField: keyof T,
  targetId: string,
  populatedField?: string
): SearchResponse<T> => {
  if (!targetId || !Array.isArray(searchResponse.data)) {
    return searchResponse;
  }

  const filteredData = searchResponse.data.filter((item: T) => {
    // Direct field match
    if (item[filterField] === targetId) {
      return true;
    }

    // Populated object match (e.g., card.set._id === targetId)
    if (populatedField && item[populatedField]?._id === targetId) {
      return true;
    }

    return false;
  });

  return {
    ...searchResponse,
    data: filteredData,
    count: filteredData.length,
  };
};

/**
 * Specific filter for card search by setId (most common use case)
 * Handles both setId direct matches and set._id populated matches
 */
export const filterCardsBySetId = <T extends Record<string, any>>(
  searchResponse: SearchResponse<T>,
  setId: string
): SearchResponse<T> => {
  return filterByObjectId(searchResponse, 'setId', setId, 'set');
};

/**
 * Generic search result post-processor
 * Applies multiple filters and transformations to search results
 */
export interface SearchFilter<T> {
  field: keyof T;
  value: any;
  populatedField?: string;
}

export const applySearchFilters = <T extends Record<string, any>>(
  searchResponse: SearchResponse<T>,
  filters: SearchFilter<T>[]
): SearchResponse<T> => {
  let result = searchResponse;

  for (const filter of filters) {
    result = filterByObjectId(
      result,
      filter.field,
      filter.value,
      filter.populatedField
    );
  }

  return result;
};