/**
 * SearchField Component
 * Layer 3: Components (UI Building Blocks)
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Handles autocomplete search with hierarchical filtering
 * - DRY: Eliminates duplication between CardSearchSection + ProductSearchSection
 * - Interface Segregation: Focused interface for search functionality
 * - Open/Closed: Extensible search types without modification
 * - NOT over-engineered: Simple, focused search field component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { FieldError } from 'react-hook-form';
import { SearchResult, useSearch } from '../../../hooks/useSearch';
import { useDebouncedValue } from '../../../hooks/useDebounce';

export type SearchFieldType = 'card' | 'product';

interface SearchFieldProps {
  /** Field configuration */
  name: string;
  label: string;
  searchType: SearchFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  
  /** Form integration */
  value: string;
  onChange: (value: string) => void;
  error?: FieldError;
  
  /** Hierarchical search */
  parentFieldValue?: string; // For filtering (e.g., setName for card search)
  
  /** Selection callback */
  onSelection: (result: SearchResult | null) => void;
  
  /** Styling */
  icon?: LucideIcon;
  className?: string;
}

/**
 * SearchField Component
 * Handles both 'card' and 'product' search types with hierarchical filtering
 * Maintains current search functionality while eliminating duplication
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  name,
  label,
  searchType,
  placeholder,
  required = false,
  disabled = false,
  value,
  onChange,
  error,
  parentFieldValue,
  onSelection,
  icon: Icon = Search,
  className,
}) => {
  // State management
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  
  // Use centralized search hook
  const search = useSearch();
  
  // Debounce search query
  const debouncedValue = useDebouncedValue(value, 300);
  
  // Sync search results to local suggestions state
  useEffect(() => {
    setSuggestions(search.results || []);
  }, [search.results]);
  
  // Centralized search effect
  useEffect(() => {
    if (!isActive) {
      setSuggestions([]);
      return;
    }
    
    if (!debouncedValue || typeof debouncedValue !== 'string') {
      setSuggestions([]);
      return;
    }
    
    // Execute search based on type
    switch (searchType) {
      case 'card':
        // Smart search: If no query but set selected, show all from set
        let cardSearchQuery = debouncedValue;
        if (!debouncedValue.trim()) {
          if (parentFieldValue?.trim()) {
            cardSearchQuery = '*';
          } else {
            setSuggestions([]);
            return;
          }
        }
        search.searchCards(cardSearchQuery, parentFieldValue?.trim() || undefined);
        break;
        
      case 'product':
        // Smart search: If no query but set selected, show all from set
        let productSearchQuery = debouncedValue;
        if (!debouncedValue.trim()) {
          if (parentFieldValue?.trim()) {
            productSearchQuery = '*';
          } else {
            setSuggestions([]);
            return;
          }
        }
        search.searchProducts(productSearchQuery, parentFieldValue?.trim() || undefined);
        break;
    }
  }, [isActive, debouncedValue, parentFieldValue, searchType, search]);
  
  // Handle selection
  const handleSelection = useCallback(
    (result: SearchResult) => {
      if (!result.id || !result.displayName) {
        onChange('');
        onSelection(null);
        setSuggestions([]);
        setIsActive(false);
        return;
      }
      
      // Update field value
      onChange(result.displayName);
      
      // Call selection callback
      onSelection({
        ...result,
        data: {
          _id: result.id,
          ...result.data,
        },
      });
      
      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setIsActive(false);
      }, 10);
    },
    [onChange, onSelection]
  );
  
  // Handle focus with auto-trigger for hierarchical search
  const handleFocus = useCallback(() => {
    setIsActive(true);
    
    // Auto-trigger search if parent field is selected but current field is empty
    if (
      parentFieldValue &&
      parentFieldValue.trim() &&
      (!value || value.trim() === '')
    ) {
      // Trigger search with wildcard to show all items from parent
      switch (searchType) {
        case 'card':
          search.searchCards('*', parentFieldValue.trim());
          break;
        case 'product':
          search.searchProducts('*', parentFieldValue.trim());
          break;
      }
    }
  }, [parentFieldValue, value, searchType, search]);
  
  // Handle blur
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsActive(false);
    }, 150);
  }, []);
  
  return (
    <div className="relative z-50">
      <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
        <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10">
          <Icon className="w-3 h-3 text-blue-400" />
        </div>
        <span>{label}</span>
        {required && <span className="text-red-400 ml-1 font-bold">*</span>}
      </label>

      <div className="relative">
        {/* Background Glass Effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-[1.2rem] blur-md opacity-60"></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-xl shadow-xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
          {/* Floating Orbs */}
          <div className="absolute -top-1 -right-1 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-lg animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || `Search for ${label.toLowerCase()}...`}
            disabled={disabled}
            className={`relative z-10 block w-full px-4 py-3 bg-transparent border-none text-white placeholder-white/50 font-medium focus:ring-0 focus:outline-none ${className || ''}`}
          />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

          {/* Breathing Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl animate-pulse opacity-40 pointer-events-none group-focus-within:opacity-60 transition-opacity duration-300"></div>
        </div>

        {/* Suggestions Dropdown */}
        {isActive && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
            <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent relative z-10">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id || `${searchType}-suggestion-${index}`}
                    onClick={() => handleSelection(suggestion)}
                    className="group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/10"
                    role="option"
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-white font-bold text-lg leading-tight truncate group-hover:text-blue-400 transition-colors duration-300">
                          {suggestion.displayName}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2">
                          {parentFieldValue && parentFieldValue.trim() && (
                            <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold">
                              Set: {parentFieldValue}
                            </div>
                          )}
                          {suggestion.data?.cardNumber && (
                            <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold">
                              #{suggestion.data.cardNumber}
                            </div>
                          )}
                          {suggestion.data?.category && (
                            <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold">
                              {suggestion.data.category}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {isActive &&
          value.trim().length >= 2 &&
          suggestions.length === 0 &&
          !search.isLoading && (
            <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
              <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden">
                <div className="p-8 text-center relative z-10">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                      <Search className="w-8 h-8 text-white/60" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-white/60 text-sm font-medium">
                    Try adjusting your search terms
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
            <Icon className="w-3 h-3 text-red-400" />
          </div>
          <p className="text-sm text-red-300 font-medium">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchField;