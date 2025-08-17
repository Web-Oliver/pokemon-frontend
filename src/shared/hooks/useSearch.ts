/**
 * UNIFIED SEARCH HOOK - Updated for New Backend Architecture
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * Updated to use UnifiedApiService with hierarchical search support
 * Supports MongoDB ObjectId relationships for Set->Cards and SetProduct->Products
 */

import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from './useDebounce';
import { unifiedApiService } from '../services/UnifiedApiService';

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
    queryKey: ['unified-search', searchType, debouncedQuery, parentId],
    queryFn: async () => {
      let apiResponse;

      switch (searchType) {
        case 'sets':
          apiResponse = await unifiedApiService.search.searchSets({ 
            query: debouncedQuery,
            limit: 10 
          });
          break;
        case 'cards':
          // Use hierarchical search if parentId (setId) is provided
          if (parentId) {
            console.log('[HIERARCHICAL SEARCH] Filtering cards by setId:', parentId, 'query:', debouncedQuery);
            console.log('[API DEBUG] About to call searchCards with setId filter');
            apiResponse = await unifiedApiService.search.searchCards({ 
              query: debouncedQuery || '',
              setId: parentId, // Direct filtering by setId
              limit: 20,
              populate: 'setId'
            });
            console.log('[API DEBUG] Cards response for setId filter:', apiResponse);
          } else {
            apiResponse = await unifiedApiService.search.searchCards({ 
              query: debouncedQuery,
              limit: 10,
              populate: 'setId' // Always populate set info for context
            });
          }
          break;
        case 'products':
          // Use hierarchical search if parentId (setProductId) is provided
          if (parentId) {
            console.log('[HIERARCHICAL SEARCH] Filtering products by setProductId:', parentId, 'query:', debouncedQuery);
            console.log('[API DEBUG] About to call searchProducts with setProductId filter');
            apiResponse = await unifiedApiService.search.searchProducts({ 
              query: debouncedQuery || '',
              setProductId: parentId, // Direct filtering by setProductId
              limit: 20,
              populate: 'setProductId'
            });
            console.log('[API DEBUG] Products response for setProductId filter:', apiResponse);
          } else {
            apiResponse = await unifiedApiService.search.searchProducts({ 
              query: debouncedQuery,
              limit: 10,
              populate: 'setProductId' // Always populate set product info for context
            });
          }
          break;
        case 'setproducts':
          apiResponse = await unifiedApiService.search.searchSetProducts({ 
            query: debouncedQuery,
            limit: 10 
          });
          break;
        default:
          throw new Error(`Unknown search type: ${searchType}`);
      }

      // Transform to SearchResult format with enhanced context display
      return apiResponse.data.map((item: any): SearchResult => {
        let displayName = 'Unknown';
        
        if (searchType === 'sets') {
          displayName = `${item.setName} (${item.year || 'Unknown Year'})`;
        } else if (searchType === 'cards') {
          const cardName = item.cardName || 'Unknown Card';
          
          // Create clean display name WITHOUT card number - number will be shown in badge
          displayName = cardName;
          
          // Still extract set name for the component to display separately
          try {
            // Backend can return set name in multiple ways:
            // 1. Populated setId object with setName
            // 2. Direct setDisplayName field (from MongoDB query)
            // 3. Direct setName field
            if (item.setDisplayName && typeof item.setDisplayName === 'string') {
              // Store set name in data for component to access
              item.setName = String(item.setDisplayName);
            } else if (item.setId && typeof item.setId === 'object' && item.setId.setName) {
              item.setName = String(item.setId.setName);
            } else if (item.setName && typeof item.setName === 'string') {
              // Set name already exists, keep it
            } else if (typeof item.setId === 'string') {
              item.setName = item.setId;
            }
          } catch (error) {
            console.warn('[SEARCH] Error accessing set name:', error);
          }
        } else if (searchType === 'products') {
          const productName = item.productName || item.name || 'Unknown Product';
          const category = item.category || '';
          // Safe property access to prevent circular references
          let setProductName = '';
          try {
            if (item.setProductId && typeof item.setProductId === 'object' && item.setProductId.setProductName) {
              setProductName = String(item.setProductId.setProductName);
            } else if (typeof item.setProductId === 'string') {
              setProductName = item.setProductId;
            } else if (item.setProductName) {
              setProductName = String(item.setProductName);
            }
          } catch (error) {
            console.warn('[SEARCH] Error accessing set product name:', error);
            setProductName = '';
          }
          
          // Improve category display with more descriptive names
          const getCategoryDisplayName = (cat: string): string => {
            switch (cat) {
              case 'Booster-Boxes': return 'Booster Box';
              case 'Boosters': return 'Booster Pack';
              case 'Elite-Trainer-Boxes': return 'Elite Trainer Box';
              case 'Theme-Decks': return 'Theme Deck';
              case 'Box-Sets': return 'Box Set';
              case 'Trainer-Kits': return 'Trainer Kit';
              case 'Blisters': return 'Blister Pack';
              case 'Tins': return 'Tin';
              default: return cat;
            }
          };
          
          const categoryDisplay = category ? ` [${getCategoryDisplayName(category)}]` : '';
          displayName = setProductName ? `${productName}${categoryDisplay} - ${setProductName}` : `${productName}${categoryDisplay}`;
        } else if (searchType === 'setproducts') {
          displayName = item.setProductName || item.name || 'Unknown Set Product';
        }
        
        return {
          id: item._id || item.id,
          displayName,
          data: item,
          type: searchType === 'setproducts' ? 'setProduct' as SearchType : 
                searchType === 'products' ? 'product' as SearchType :
                searchType === 'cards' ? 'card' as SearchType : 'set' as SearchType
        };
      });
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