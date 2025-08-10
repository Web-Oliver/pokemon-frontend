/**
 * SIMPLE SEARCH HOOK - RADICAL SIMPLIFICATION
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: 4 search hooks, 1100+ lines, strategy patterns, debug spam
 * AFTER: 1 search hook, 100 lines, direct API calls
 */

import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from './useDebounce';
import { apiService } from '../services/ApiService';

export type SearchType = 'sets' | 'cards' | 'products' | 'setproducts';

interface SearchResult {
  id: string;
  displayName: string;
  data: any;
  type: SearchType;
}

interface SearchConfig {
  searchType: SearchType;
  minLength?: number;
  debounceMs?: number;
  parentId?: string; // For hierarchical search (e.g., setId for cards)
}

export const useSearch = (query: string, config: SearchConfig) => {
  const {
    searchType,
    minLength = 2,
    debounceMs = 300,
    parentId
  } = config;

  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const enabled = debouncedQuery.length >= minLength;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['search', searchType, debouncedQuery, parentId],
    queryFn: async () => {
      let apiResponse;

      switch (searchType) {
        case 'sets':
          apiResponse = await apiService.searchSets(debouncedQuery);
          break;
        case 'cards':
          apiResponse = await apiService.searchCards(debouncedQuery, parentId);
          break;
        case 'products':
          apiResponse = await apiService.searchProducts(debouncedQuery);
          break;
        case 'setproducts':
          apiResponse = await apiService.searchSetProducts(debouncedQuery);
          break;
        default:
          throw new Error(`Unknown search type: ${searchType}`);
      }

      // Transform to SearchResult format
      return apiResponse.data.map((item: any): SearchResult => ({
        id: item._id || item.id,
        displayName: item.setName || item.setProductName || item.productName || 
                    item.cardName || item.name || 'Unknown',
        data: item,
        type: searchType === 'setproducts' ? 'setProduct' : 
              searchType === 'products' ? 'product' :
              searchType === 'cards' ? 'card' : 'set'
      }));
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    results: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
    query: debouncedQuery,
    enabled
  };
};

// Specialized hooks for common patterns
export const useSetSearch = (query: string) => 
  useSearch(query, { searchType: 'sets' });

export const useCardSearch = (query: string, setId?: string) => 
  useSearch(query, { searchType: 'cards', parentId: setId });

export const useProductSearch = (query: string) => 
  useSearch(query, { searchType: 'products' });

export const useSetProductSearch = (query: string) => 
  useSearch(query, { searchType: 'setproducts' });

// Hierarchical search hook
export const useHierarchicalSearch = (
  parentQuery: string,
  childQuery: string,
  mode: 'set-card' | 'setproduct-product'
) => {
  const parentConfig = mode === 'set-card' 
    ? { searchType: 'sets' as const }
    : { searchType: 'setproducts' as const };

  const parent = useSearch(parentQuery, parentConfig);
  
  const selectedParentId = parent.results.length === 1 ? parent.results[0].id : undefined;
  
  const childConfig = mode === 'set-card'
    ? { searchType: 'cards' as const, parentId: selectedParentId }
    : { searchType: 'products' as const, parentId: selectedParentId };

  const child = useSearch(childQuery, childConfig);

  return {
    parent,
    child,
    isHierarchical: true,
    selectedParentId
  };
};