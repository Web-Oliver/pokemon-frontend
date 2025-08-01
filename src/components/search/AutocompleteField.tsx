/**
 * Autocomplete Field Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Focused autocomplete component using consolidated search hook
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { SearchResult } from '../../hooks/useSearch';

export interface AutocompleteFieldProps {
  searchType: 'sets' | 'products' | 'cards';
  placeholder?: string;
  value?: string;
  onSelect: (result: SearchResult) => void;
  filters?: { setName?: string; category?: string };
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

/**
 * Autocomplete Field Component
 * Provides focused autocomplete functionality with clean UI
 */
export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  searchType,
  placeholder = 'Search...',
  value = '',
  onSelect,
  filters,
  disabled = false,
  className = '',
  label,
  error,
  required = false,
  onFocusChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocomplete = useAutocomplete(searchType, onSelect, filters, disabled);

  // Sync external value with internal state - avoid infinite loops
  useEffect(() => {
    if (value !== autocomplete.value) {
      autocomplete.setValue(value);
    }
  }, [value]); // Only depend on external value prop

  // Handle keyboard navigation - memoized for performance
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!autocomplete.isOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        autocomplete.moveDown();
        break;
      case 'ArrowUp':
        e.preventDefault();
        autocomplete.moveUp();
        break;
      case 'Enter':
        e.preventDefault();
        autocomplete.selectActive();
        break;
      case 'Escape':
        e.preventDefault();
        autocomplete.close();
        inputRef.current?.blur();
        break;
    }
  }, [autocomplete.isOpen, autocomplete.moveDown, autocomplete.moveUp, autocomplete.selectActive, autocomplete.close]);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={autocomplete.value}
          onChange={(e) => autocomplete.setValue(e.target.value)}
          onFocus={useCallback((e) => {
            autocomplete.onFocus();
            onFocusChange?.(true);
          }, [autocomplete.onFocus, onFocusChange])}
          onBlur={useCallback((e) => {
            autocomplete.onBlur();
            onFocusChange?.(false);
          }, [autocomplete.onBlur, onFocusChange])}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-3 border rounded-lg
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        />

        {/* Clear Button */}
        {autocomplete.value && !disabled && (
          <button
            type="button"
            onClick={useCallback(() => {
              autocomplete.clear();
              // Notify parent that field was cleared by calling onSelect with null/empty
              onSelect({
                _id: '',
                displayName: '',
                type:
                  searchType === 'sets'
                    ? 'set'
                    : searchType === 'products'
                      ? 'product'
                      : 'card',
                data: {},
              } as SearchResult);
            }, [autocomplete.clear, onSelect, searchType])}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}

        {/* Loading Indicator */}
        {autocomplete.loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Dropdown Indicator */}
        {!autocomplete.loading && autocomplete.results.length > 0 && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Search Error */}
      {autocomplete.error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {autocomplete.error}
        </p>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-1 text-xs text-gray-500">
          Debug: isOpen={String(autocomplete.isOpen)}, results=
          {autocomplete.results.length}, loading={String(autocomplete.loading)},
          error={autocomplete.error || 'none'}
        </div>
      )}

      {/* Dropdown */}
      {autocomplete.isOpen && autocomplete.results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-lg bg-white py-2 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
          {autocomplete.results.map((result, index) => (
            <div
              key={result._id}
              onMouseDown={useCallback((e) => {
                e.preventDefault(); // Prevent input from losing focus
                autocomplete.selectResult(result);
              }, [autocomplete.selectResult, result])}
              className={`
                cursor-pointer select-none relative py-4 pl-4 pr-20 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150
                ${index === autocomplete.activeIndex ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : ''}
              `}
            >
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-base text-gray-900 dark:text-gray-100 truncate pr-4">
                  {result.displayName}
                </span>
                {result.data?.setName && result.type !== 'set' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Set: {result.data.setName}
                  </span>
                )}
                {result.data?.category && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Category: {result.data.category}
                  </span>
                )}
                {result.data?.year && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Year: {result.data.year}
                  </span>
                )}
              </div>

              {/* Type Badge */}
              <span
                className={`
                absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium
                ${result.type === 'set' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                ${result.type === 'product' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                ${result.type === 'card' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
              `}
              >
                {result.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {autocomplete.isOpen &&
        autocomplete.value.trim().length >= 1 &&
        autocomplete.results.length === 0 &&
        !autocomplete.loading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg bg-white py-4 text-base shadow-2xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <div className="cursor-default select-none relative py-4 pl-4 pr-4 text-gray-500 dark:text-gray-400 text-center">
              <div className="text-base font-medium mb-1">No results found</div>
              <div className="text-sm">Try adjusting your search terms</div>
            </div>
          </div>
        )}
    </div>
  );
};
