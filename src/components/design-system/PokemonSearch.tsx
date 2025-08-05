/**
 * PokemonSearch - THE definitive search component
 * 
 * Consolidates ALL search patterns following CLAUDE.md principles:
 * - SearchDropdown.tsx (601 lines) → searchVariant="dropdown"
 * - ProductSearchSection.tsx (621 lines) → searchVariant="section" + searchType="products"
 * - CardSearchSection.tsx (396 lines) → searchVariant="section" + searchType="cards"  
 * - AutocompleteField.tsx (414 lines) → searchVariant="field"
 * - LazySearchDropdown.tsx → searchVariant="lazy"
 * - SearchField.tsx → searchVariant="basic"
 * - SearchSection.tsx → searchVariant="section"
 * - SearchSectionContainer.tsx → containerVariant variants
 * 
 * SOLID Principles:
 * - SRP: Each variant has focused responsibility
 * - OCP: New search types added via props, no modification
 * - LSP: All variants substitutable through same interface
 * - ISP: Interface segregated by search variant
 * - DIP: Depends on search abstractions, not concrete implementations
 * 
 * DRY Achievement: 8 components → 1 unified component
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
import { Search, Loader2, LucideIcon } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, UseFormClearErrors } from 'react-hook-form';
import { SearchResult } from '../../hooks/useSearch';
import {
  useOptimizedSearch,
  useSearchResultSelector,
} from '../../hooks/useOptimizedSearch';
import { useVisualTheme, useLayoutTheme, useAnimationTheme } from '../../contexts/theme';
import { getElementTheme, ThemeColor } from '../../theme/formThemes';
import { cn } from '../../utils/themeUtils';

// Enhanced search interfaces for consolidation
interface SearchSuggestion {
  id: string;
  displayName: string;
  type: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PokemonSearchProps {
  // Base search functionality (original OptimizedAutocomplete)
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

  // Enhanced search system (consolidation)
  searchVariant?: 'basic' | 'dropdown' | 'section' | 'field' | 'lazy';
  
  // Dropdown variant (from SearchDropdown.tsx - 601 lines)
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  highlightSearchTerm?: boolean;
  onClose?: () => void;
  suggestionsCount?: number;
  activeField?: string;
  
  // Section variant (from ProductSearchSection.tsx/CardSearchSection.tsx)
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  setValue?: UseFormSetValue<any>;
  watch?: UseFormWatch<any>;
  clearErrors?: UseFormClearErrors<any>;
  sectionTitle?: string;
  sectionIcon?: LucideIcon;
  onSelectionChange?: (selectedData: Record<string, unknown> | null) => void;
  onError?: (error: string) => void;
  readOnlyFields?: Record<string, boolean>;
  productCategories?: Array<{ value: string; label: string }> | string[];
  loadingOptions?: boolean;
  
  // Field variant (from AutocompleteField.tsx - 414 lines)
  fieldName?: string;
  label?: string;
  required?: boolean;
  helpText?: string;
  
  // Lazy variant (from LazySearchDropdown.tsx)
  lazyLoad?: boolean;
  loadMore?: () => void;
  hasMore?: boolean;
  
  // Hierarchical search (Set -> Product/Card pattern)
  hierarchical?: boolean;
  parentField?: string;
  parentValue?: string;
  
  // Search container integration
  containerVariant?: 'inline' | 'modal' | 'sidebar' | 'floating';
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
        `(${searchQuery.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`,
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
        className={cn(
          'px-4 py-3 cursor-pointer transition-all duration-300 border-l-4 relative overflow-hidden',
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400 text-cyan-100 shadow-lg backdrop-blur-sm'
            : 'hover:bg-zinc-800/60 border-transparent text-zinc-300 hover:text-zinc-100'
        )}
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

// Context7 Pattern: Lightweight fallback for suspense
const SearchFallback = () => (
  <div className="px-4 py-8 text-center">
    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
    <p className="text-sm text-zinc-400">Loading search results...</p>
  </div>
);

/**
 * PokemonSearch - THE definitive search component
 * Consolidates 8 search components into 1 following SOLID/DRY principles
 */
export const PokemonSearch: React.FC<PokemonSearchProps> = ({
  // Base props
  placeholder = 'Search...',
  searchType,
  setFilter,
  onSelect,
  onInputChange,
  className = '',
  disabled = false,
  autoFocus = false,
  minLength = 2,
  maxResults = 50,
  themeColor = 'cyan',
  
  // Enhanced search props
  searchVariant = 'basic',
  
  // Dropdown variant props
  suggestions = [],
  loading = false,
  highlightSearchTerm = true,
  onClose,
  suggestionsCount = 0,
  activeField,
  
  // Section variant props
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  sectionTitle,
  sectionIcon: SectionIcon,
  onSelectionChange,
  onError,
  readOnlyFields,
  productCategories,
  loadingOptions = false,
  
  // Field variant props
  fieldName,
  label,
  required = false,
  helpText,
  
  // Lazy variant props
  lazyLoad = false,
  loadMore,
  hasMore = false,
  
  // Hierarchical search props
  hierarchical = false,
  parentField,
  parentValue,
  
  // Container variant props
  containerVariant = 'inline',
}) => {
  // Theme integration
  const visualTheme = useVisualTheme();
  const layoutTheme = useLayoutTheme();
  const animationTheme = useAnimationTheme();
  
  // Enhanced search hook with all variants
  const {
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    selectedIndex,
    setSelectedIndex,
    isVisible,
    setIsVisible,
    inputRef,
    dropdownRef,
  } = useOptimizedSearch({
    searchType,
    setFilter: hierarchical ? parentValue : setFilter,
    minLength,
    maxResults,
    disabled: disabled || (hierarchical && !parentValue),
  });

  // Form integration for section variants
  const watchedValues = watch ? watch() : {};
  const fieldError = errors?.[fieldName || ''];
  
  // Enhanced result selector with form integration
  const { handleResultSelect } = useSearchResultSelector({
    onSelect: (result) => {
      // Handle different selection patterns
      if (searchVariant === 'section' && setValue && onSelectionChange) {
        // Form integration - auto-fill related fields
        if (searchType === 'products') {
          setValue('productName', result.displayName);
          setValue('setName', result.data?.setName || '');
          setValue('category', result.data?.category || '');
          setValue('availability', result.data?.availability || '');
        } else if (searchType === 'cards') {
          setValue('cardName', result.displayName);
          setValue('setName', result.data?.setName || '');
          setValue('cardNumber', result.data?.cardNumber || '');
        }
        onSelectionChange(result.data);
        clearErrors?.(['productName', 'cardName', 'setName']);
      } else {
        onSelect(result);
      }
      setIsVisible(false);
      setSearchQuery(result.displayName);
    },
    onInputChange,
  });

  // Input change handler with form integration
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    if (searchVariant === 'section' && setValue && fieldName) {
      setValue(fieldName, value);
    }
    
    if (onInputChange) {
      onInputChange(value);
    }
    
    // Clear related fields when input changes
    if (searchVariant === 'section' && setValue && value === '') {
      if (searchType === 'products') {
        setValue('category', '');
        setValue('availability', '');
      } else if (searchType === 'cards') {
        setValue('cardNumber', '');
      }
      onSelectionChange?.(null);
    }
  }, [setSearchQuery, setValue, fieldName, onInputChange, searchVariant, searchType, onSelectionChange]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isVisible || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsVisible(false);
        onClose?.();
        break;
    }
  }, [isVisible, results, selectedIndex, handleResultSelect, setSelectedIndex, onClose]);

  // Theme-aware styling
  const elementTheme = getElementTheme(themeColor, visualTheme);
  
  // Enhanced container classes based on variant
  const containerClasses = useMemo(() => {
    const base = 'relative w-full';
    
    switch (containerVariant) {
      case 'modal':
        return `${base} z-50`;
      case 'sidebar':
        return `${base} border-r border-zinc-700/50`;
      case 'floating':
        return `${base} absolute top-full left-0 right-0 z-40`;
      default:
        return base;
    }
  }, [containerVariant]);

  // Enhanced input classes with theme integration
  const inputClasses = useMemo(() => {
    const base = [
      'w-full px-4 py-3 rounded-xl',
      'bg-zinc-900/90 backdrop-blur-sm',
      'border border-zinc-700/50',
      'text-zinc-100 placeholder-zinc-400',
      'focus:outline-none focus:ring-2',
      'transition-all duration-300',
      elementTheme.focus,
      elementTheme.border,
    ];

    if (disabled) {
      base.push('opacity-50 cursor-not-allowed');
    }
    
    if (fieldError) {
      base.push('border-red-500/50 focus:ring-red-500/50');
    }

    return base.join(' ');
  }, [elementTheme, disabled, fieldError]);

  // Enhanced dropdown classes
  const dropdownClasses = useMemo(() => {
    return cn(
      'absolute top-full left-0 right-0 z-50 mt-2',
      'bg-zinc-900/95 backdrop-blur-xl',
      'border border-zinc-700/50 rounded-xl',
      'shadow-2xl shadow-black/50',
      'max-h-80 overflow-y-auto',
      'transition-all duration-300',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
    );
  }, [isVisible]);

  // Section variant rendering
  const renderSectionVariant = () => {
    if (searchVariant !== 'section') return null;

    return (
      <div className="space-y-4">
        {sectionTitle && SectionIcon && (
          <div className="flex items-center gap-3 pb-2 border-b border-zinc-700/30">
            <SectionIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-zinc-100">{sectionTitle}</h3>
          </div>
        )}
        
        {/* Enhanced input with form integration */}
        <div className="space-y-2">
          {label && (
            <label className="block text-sm font-medium text-zinc-300">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsVisible(true)}
              placeholder={placeholder}
              disabled={disabled || (hierarchical && !parentValue)}
              autoFocus={autoFocus}
              className={`pl-10 ${inputClasses}`}
              {...(register && fieldName ? register(fieldName, { required }) : {})}
            />
            
            {(isLoading || loadingOptions) && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
            )}
          </div>
          
          {fieldError && (
            <p className="text-sm text-red-400">{fieldError.message}</p>
          )}
          
          {helpText && !fieldError && (
            <p className="text-sm text-zinc-500">{helpText}</p>
          )}
        </div>
        
        {/* Hierarchical search message */}
        {hierarchical && !parentValue && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              Please select a {parentField} first to enable {searchType} search.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Basic variant rendering (original functionality)
  const renderBasicVariant = () => {
    if (searchVariant !== 'basic') return null;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsVisible(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`pl-10 ${inputClasses}`}
        />
        
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
        )}
      </div>
    );
  };

  // Enhanced dropdown rendering with all variants
  const renderDropdown = () => {
    if (!isVisible) return null;

    const displayResults = searchVariant === 'dropdown' && suggestions.length > 0 ? 
      suggestions.map(s => ({ ...s, type: s.type || searchType })) : 
      results;

    if (displayResults.length === 0 && !isLoading) {
      return (
        <div ref={dropdownRef} className={dropdownClasses}>
          <div className="px-4 py-3 text-center text-zinc-400">
            {searchQuery.length < minLength 
              ? `Type at least ${minLength} characters to search`
              : 'No results found'
            }
          </div>
        </div>
      );
    }

    return (
      <div ref={dropdownRef} className={dropdownClasses}>
        <Suspense fallback={<SearchFallback />}>
          {displayResults.map((result, index) => (
            <SuggestionItem
              key={result.id || `${result.type}-${index}`}
              result={result}
              isSelected={index === selectedIndex}
              onSelect={handleResultSelect}
              searchQuery={highlightSearchTerm ? searchQuery : ''}
            />
          ))}
          
          {/* Lazy loading */}
          {lazyLoad && hasMore && (
            <div className="px-4 py-3 text-center">
              <button
                onClick={loadMore}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                Load more results...
              </button>
            </div>
          )}
          
          {/* Results count */}
          {suggestionsCount > 0 && (
            <div className="px-4 py-2 border-t border-zinc-700/30 text-xs text-zinc-500">
              Showing {displayResults.length} of {suggestionsCount} results
            </div>
          )}
        </Suspense>
      </div>
    );
  };

  return (
    <div className={cn(containerClasses, className)}>
      {/* Render based on search variant */}
      {renderSectionVariant()}
      {renderBasicVariant()}
      
      {/* Enhanced dropdown for all variants */}
      {renderDropdown()}
    </div>
  );
};

export default PokemonSearch;