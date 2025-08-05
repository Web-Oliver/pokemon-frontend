/**
 * Optimized Autocomplete Component - Context7 Performance Patterns with Theme Integration
 *
 * Following Context7 React.dev documentation for optimal autocomplete performance:
 * - React.memo for preventing unnecessary re-renders
 * - useMemo for expensive computations
 * - useCallback for stable event handlers
 * - Suspense boundaries for async operations
 * - React Compiler optimization ready
 * - Unified theme system integration with performance patterns maintained
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
import {
  useOptimizedSearch,
  useSearchResultSelector,
} from '../../hooks/useOptimizedSearch';
import { useTheme } from '../../contexts/ThemeContext';
import { getElementTheme, ThemeColor } from '../../theme/formThemes';

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
  themeColor?: ThemeColor;
}

// Context7 Pattern: Memoized suggestion item for optimal rendering
const SuggestionItem = memo(
  ({
    result,
    isSelected,
    onSelect,
    searchQuery,
  }: {
    result: SearchResult;
    isSelected: boolean;
    onSelect: (result: SearchResult) => void;
    searchQuery: string;
  }) => {
    // Context7 Pattern: Memoized highlighted text with theme integration
    const highlightedText = useMemo(() => {
      const text = result.displayName;
      if (!searchQuery) {
        return text;
      }

      const regex = new RegExp(
        `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
      );
      const parts = text.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 rounded px-1 font-medium"
          >
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
        px-4 py-3 cursor-pointer transition-all duration-300 border-l-4 relative overflow-hidden
        ${
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400 text-cyan-100 shadow-lg backdrop-blur-sm'
            : 'hover:bg-zinc-800/60 border-transparent text-zinc-300 hover:text-zinc-100'
        }
      `}
      >
        <div className="font-medium text-sm relative z-10">
          {highlightedText}
        </div>
        {result.data?.setName && result.type !== 'set' && (
          <div className="text-xs text-zinc-400 mt-1 relative z-10">
            Set: {result.data.setName}
          </div>
        )}
        {result.data?.category && (
          <div className="text-xs text-zinc-400 mt-1 relative z-10">
            Category: {result.data.category}
          </div>
        )}
        {/* Subtle glow effect for selected items */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 pointer-events-none"></div>
        )}
      </div>
    );
  }
);

// Context7 Pattern: Memoized loading fallback component with theme integration
const SearchFallback = memo(() => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      <span className="ml-2 text-sm text-zinc-300">Searching...</span>
    </div>
  );
});

// Context7 Pattern: Main autocomplete component with comprehensive optimization and theme integration
export const OptimizedAutocomplete = memo(
  ({
    placeholder = 'Search...',
    searchType,
    setFilter,
    onSelect,
    onInputChange,
    className = '',
    disabled = false,
    autoFocus = false,
    minLength = 1,
    maxResults = 10,
    themeColor = 'dark',
  }: OptimizedAutocompleteProps) => {
    const {} = useTheme();
    const elementTheme = getElementTheme(themeColor);
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
    const triggerSearch = useCallback(
      (query: string) => {
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
      },
      [searchType, setFilter, searchHook, minLength]
    );

    // Context7 Pattern: Optimized input change handler
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setSelectedIndex(0);

        // Use startTransition for non-urgent updates
        startTransition(() => {
          onInputChange?.(value);
          triggerSearch(value);
        });
      },
      [onInputChange, triggerSearch]
    );

    // Context7 Pattern: Memoized selection handler
    const handleSelect = useCallback(
      (result: SearchResult) => {
        setInputValue(result.displayName);
        setIsOpen(false);
        onSelect(result);
      },
      [onSelect]
    );

    // Context7 Pattern: Memoized keyboard handler
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen || filteredResults.length === 0) {
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(
              (prev) =>
                (prev - 1 + filteredResults.length) % filteredResults.length
            );
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
      },
      [isOpen, filteredResults, selectedIndex, handleSelect]
    );

    // Context7 Pattern: Effect with cleanup
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    // Context7 Pattern: Memoized suggestions list
    const suggestionsList = useMemo(() => {
      if (
        !isOpen ||
        (!searchHook.isSearching && filteredResults.length === 0)
      ) {
        return null;
      }

      return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl max-h-96 overflow-auto">
          <Suspense fallback={<SearchFallback />}>
            {searchHook.isSearching ? (
              <SearchFallback />
            ) : filteredResults.length > 0 ? (
              <div className="divide-y divide-zinc-700/30">
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
              <div className="px-4 py-6 text-center text-zinc-400 text-sm">
                <Search className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
                <div>No results found</div>
                <div className="text-xs mt-1 text-zinc-500">
                  Try different keywords
                </div>
              </div>
            )}
          </Suspense>
        </div>
      );
    }, [
      isOpen,
      searchHook.isSearching,
      filteredResults,
      selectedIndex,
      handleSelect,
      inputValue,
    ]);

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
            w-full px-4 py-3 pr-10 bg-zinc-800/90 backdrop-blur-sm border ${elementTheme.border} rounded-2xl
            text-zinc-100 placeholder-zinc-400
            ${elementTheme.focus} shadow-lg hover:shadow-xl
            disabled:bg-zinc-800/50 disabled:cursor-not-allowed
            transition-all duration-300
            ${isFocused ? 'ring-2 ring-cyan-500/50 border-cyan-300' : ''}
          `}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {searchHook.isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Search className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </div>

        {suggestionsList}
      </div>
    );
  }
);

// Context7 Performance: Display name for debugging
OptimizedAutocomplete.displayName = 'OptimizedAutocomplete';

export default OptimizedAutocomplete;
