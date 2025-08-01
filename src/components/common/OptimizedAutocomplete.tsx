/**
 * Optimized Autocomplete Component - Context7 Performance Patterns
 * 
 * Following Context7 React.dev documentation for optimal autocomplete performance:
 * - React.memo for preventing unnecessary re-renders
 * - useMemo for expensive computations
 * - useCallback for stable event handlers
 * - Suspense boundaries for async operations
 * - React Compiler optimization ready
 */

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useState, 
  useRef, 
  useEffect,
  Suspense,
  startTransition,
} from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchResult } from '../../hooks/useSearch';
import { useOptimizedSearch, useSearchResultSelector } from '../../hooks/useOptimizedSearch';

interface OptimizedAutocompleteProps {
  placeholder?: string;
  searchType: 'sets' | 'products' | 'cards';
  setFilter?: string;
  onSelect: (result: SearchResult) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minLength?: number;
  maxResults?: number;
}

// Context7 Pattern: Memoized suggestion item for optimal rendering
const SuggestionItem = memo(function SuggestionItem({
  result,
  isSelected,
  onSelect,
  searchQuery,
}: {
  result: SearchResult;
  isSelected: boolean;
  onSelect: (result: SearchResult) => void;
  searchQuery: string;
}) {
  // Context7 Pattern: Memoized highlighted text
  const highlightedText = useMemo(() => {
    const text = result.displayName;
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-blue-200 text-blue-900 rounded px-1">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  }, [result.displayName, searchQuery]);

  // Context7 Pattern: Memoized click handler
  const handleClick = useCallback(() => {
    onSelect(result);
  }, [onSelect, result]);

  return (
    <div
      onClick={handleClick}
      className={`
        px-4 py-3 cursor-pointer transition-all duration-150 border-l-4
        ${isSelected 
          ? 'bg-blue-50 border-blue-500 text-blue-900' 
          : 'hover:bg-gray-50 border-transparent'
        }
      `}
    >
      <div className="font-medium text-sm">
        {highlightedText}
      </div>
      {result.data?.setName && result.type !== 'set' && (
        <div className="text-xs text-gray-500 mt-1">
          Set: {result.data.setName}
        </div>
      )}
      {result.data?.category && (
        <div className="text-xs text-gray-500 mt-1">
          Category: {result.data.category}
        </div>
      )}
    </div>
  );
});

// Context7 Pattern: Memoized loading fallback component
const SearchFallback = memo(function SearchFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span className="ml-2 text-sm text-gray-600">Searching...</span>
    </div>
  );
});

// Context7 Pattern: Main autocomplete component with comprehensive optimization
export const OptimizedAutocomplete = memo(function OptimizedAutocomplete({
  placeholder = "Search...",
  searchType,
  setFilter,
  onSelect,
  onInputChange,
  className = "",
  disabled = false,
  autoFocus = false,
  minLength = 1,
  maxResults = 10,
}: OptimizedAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Context7 Pattern: Optimized search hook with transitions
  const searchHook = useOptimizedSearch({
    minLength,
    debounceMs: 300,
    enableTransitions: true,
  });

  // Context7 Pattern: Memoized filtered results
  const filteredResults = useSearchResultSelector(
    searchHook.results,
    useCallback((result: SearchResult) => result, []),
    [maxResults]
  ).slice(0, maxResults);

  // Context7 Pattern: Memoized search trigger
  const triggerSearch = useCallback((query: string) => {
    if (!query || query.length < minLength) {
      setIsOpen(false);
      return;
    }

    switch (searchType) {
      case 'sets':
        searchHook.searchSets(query);
        break;
      case 'products':
        searchHook.searchProducts(query, setFilter);
        break;
      case 'cards':
        searchHook.searchCards(query, setFilter);
        break;
    }
    setIsOpen(true);
  }, [searchType, setFilter, searchHook, minLength]);

  // Context7 Pattern: Optimized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(0);
    
    // Use startTransition for non-urgent updates
    startTransition(() => {
      onInputChange?.(value);
      triggerSearch(value);
    });
  }, [onInputChange, triggerSearch]);

  // Context7 Pattern: Memoized selection handler
  const handleSelect = useCallback((result: SearchResult) => {
    setInputValue(result.displayName);
    setIsOpen(false);
    onSelect(result);
  }, [onSelect]);

  // Context7 Pattern: Memoized keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || filteredResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, filteredResults, selectedIndex, handleSelect]);

  // Context7 Pattern: Effect with cleanup
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Context7 Pattern: Memoized suggestions list
  const suggestionsList = useMemo(() => {
    if (!isOpen || (!searchHook.isSearching && filteredResults.length === 0)) {
      return null;
    }

    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-auto">
        <Suspense fallback={<SearchFallback />}>
          {searchHook.isSearching ? (
            <SearchFallback />
          ) : filteredResults.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredResults.map((result, index) => (
                <SuggestionItem
                  key={result._id || `${result.type}-${index}`}
                  result={result}
                  isSelected={selectedIndex === index}
                  onSelect={handleSelect}
                  searchQuery={inputValue}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div>No results found</div>
              <div className="text-xs mt-1">Try different keywords</div>
            </div>
          )}
        </Suspense>
      </div>
    );
  }, [isOpen, searchHook.isSearching, filteredResults, selectedIndex, handleSelect, inputValue]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (inputValue.length >= minLength) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing to allow selection
            setTimeout(() => setIsOpen(false), 150);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {searchHook.isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {suggestionsList}
    </div>
  );
});

// Context7 Performance: Display name for debugging
OptimizedAutocomplete.displayName = 'OptimizedAutocomplete';

export default OptimizedAutocomplete;