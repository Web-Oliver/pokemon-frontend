/**
 * Search Hooks - Modular Search System
 * Replaces the monolithic 822-line useSearch hook with focused, composable hooks
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Each hook handles one aspect of search
 * - Open/Closed: Extensible by composing different hook combinations
 * - Interface Segregation: Import only the hooks you need
 * - Dependency Inversion: Hooks depend on abstractions, not implementations
 * - DRY: Eliminates duplicate search logic across different contexts
 */

// Export individual hooks for fine-grained control
export { useBasicSearch } from './useBasicSearch';
export { useSearchCache } from './useSearchCache';
export { useSearchSuggestions } from './useSearchSuggestions';
export { useHierarchicalSearch } from './useHierarchicalSearch';

// Export types
export type { BasicSearchState, UseBasicSearchReturn } from './useBasicSearch';
export type { UseSearchCacheReturn } from './useSearchCache';
export type { SuggestionsState, UseSearchSuggestionsReturn } from './useSearchSuggestions';
export type { HierarchicalSearchState, UseHierarchicalSearchReturn } from './useHierarchicalSearch';

// Re-export common types from the original useSearch
export type { SearchState, UseSearchReturn } from '../useSearch';

/**
 * Composed Search Hook
 * Provides backward compatibility with the original useSearch interface
 * Combines all the split hooks into a single interface
 * 
 * Use this if you need all search functionality, or use individual hooks for specific needs
 */
export const useComposedSearch = () => {
  const basicSearch = useBasicSearch();
  const cache = useSearchCache();
  const suggestions = useSearchSuggestions();
  const hierarchical = useHierarchicalSearch();

  // Combine all functionality into a single interface
  return {
    // Basic search
    ...basicSearch,
    
    // Suggestions
    suggestions: suggestions.suggestions,
    searchMeta: suggestions.searchMeta,
    searchSuggestions: suggestions.searchSuggestions,
    clearSuggestions: suggestions.clearSuggestions,
    getSuggestionDisplayText: suggestions.getSuggestionDisplayText,
    
    // Hierarchical search
    ...hierarchical,
    
    // Cache management
    getCacheStats: cache.getCacheStats,
    getCacheSize: cache.getCacheSize,
    clearCache: cache.clearCache,
    cleanupExpiredEntries: cache.cleanupExpiredEntries,
    
    // Combined operations
    handleSuggestionSelect: (
      suggestion: any,
      fieldType: 'set' | 'category' | 'cardProduct'
    ) => {
      // Use hierarchical selection logic
      hierarchical.handleHierarchicalSelection(suggestion, fieldType);
    },
  };
};

/**
 * Lightweight Search Hook
 * For components that only need basic search without hierarchical features
 * Reduces bundle size and complexity
 */
export const useLightweightSearch = () => {
  const basicSearch = useBasicSearch();
  const suggestions = useSearchSuggestions();
  
  return {
    ...basicSearch,
    suggestions: suggestions.suggestions,
    searchSuggestions: suggestions.searchSuggestions,
    clearSuggestions: suggestions.clearSuggestions,
    getSuggestionDisplayText: suggestions.getSuggestionDisplayText,
  };
};

/**
 * Advanced Search Hook
 * For components that need full hierarchical search capabilities
 * Includes caching and performance monitoring
 */
export const useAdvancedSearch = () => {
  return useComposedSearch();
};

// Default export for backward compatibility
export default useComposedSearch;