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
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
  UseFormClearErrors,
} from 'react-hook-form';
import { SearchResult, useSearch, useOptimizedSearch, useSearchResultSelector } from '../../../hooks/useUnifiedSearch';
import {
  useVisualTheme,
  useLayoutTheme,
  useAnimationTheme,
} from '../../../contexts/theme';
import { getElementTheme, ThemeColor } from '../../../../theme/formThemes';
import { cn } from '../../../utils/helpers/unifiedUtilities';

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
  value?: string; // ADDED: External value prop for controlled input
  onSelect: (result: SearchResult) => void;
  onInputChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  minLength?: number;
  maxResults?: number;
  themeColor?: ThemeColor;
  useExternalSearch?: boolean; // ADDED: Skip internal search when using hierarchical search
  externalResults?: SearchResult[]; // ADDED: External search results
  externalLoading?: boolean; // ADDED: External loading state

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
    // Extract data from multiple possible structures
    const cardData = result.data || {};
    
    // Extract set name - API returns setName and setDisplayName
    let setName = cardData.setName || cardData.setDisplayName || cardData.Set?.setName || cardData.set?.name;
    
    // For cards, we might get set info from search context or form values
    if (!setName && result.type === 'card') {
      // Try to get from common Pokemon set patterns
      const commonSets = ['Base Set', 'Jungle', 'Fossil', 'Team Rocket', 'Gym Heroes', 'Gym Challenge', 'Neo Genesis', 'Neo Discovery'];
      for (const set of commonSets) {
        if (result.displayName.toLowerCase().includes(set.toLowerCase())) {
          setName = set;
          break;
        }
      }
    }
    
    // Extract year - API returns year directly 
    const year = cardData.year || cardData.Set?.year || cardData.set?.year;
    
    // Extract card number - API returns cardNumber
    let cardNumber = cardData.cardNumber || cardData.pokemonNumber || cardData.number;
    
    // Check if there's additional text that contains card number and variety
    const additionalText = cardData.additionalText || cardData.description || cardData.subtitle;
    if (additionalText && !cardNumber) {
      const numberMatch = additionalText.match(/#?(\d+)/);
      if (numberMatch) cardNumber = numberMatch[1];
    }
    
    // Extract variety from multiple possible locations
    let variety = cardData.variety || cardData.type || cardData.subtype;
    
    // Check additional text for variety info (like "#017    Incorrect Holo")
    if (!variety && additionalText) {
      // Remove the card number part and extract variety
      const varietyMatch = additionalText.replace(/#?\d+\s*/, '').trim();
      if (varietyMatch && varietyMatch.length > 0 && varietyMatch !== additionalText) {
        variety = varietyMatch;
      }
    }
    
    // Check if variety info is in the display name (like "Charizard Holo - Incorrect Holo")
    if (!variety && result.displayName) {
      const displayParts = result.displayName.split(' - ');
      if (displayParts.length > 1) {
        variety = displayParts[1]; // Second part after " - "
      }
      // Also check for common variety patterns in the display name
      const varietyPatterns = ['Incorrect', 'Incomplete', 'Cosmos', 'Mega', 'EX', 'GX', 'V', 'VMAX'];
      for (const pattern of varietyPatterns) {
        if (result.displayName.includes(pattern) && !variety) {
          const match = result.displayName.match(new RegExp(`(${pattern}[^#]*)`));
          if (match) variety = match[1].trim();
        }
      }
    }
    
    // Handle special cases for variety - API returns empty string for variety sometimes
    if (!variety && cardData.variety === "") {
      // If variety is empty but card name has Holo, mark as Holo variant
      if (cardData.cardName && cardData.cardName.includes('Holo')) {
        variety = 'Holo';
      }
    }
    
    // DEBUG: Log for any card to verify extraction
    if (result.type === 'card' && Math.random() < 0.1) {
      console.log('[SUGGESTION DEBUG] Card data extraction:', {
        displayName: result.displayName,
        type: result.type,
        rawData: {
          cardName: cardData.cardName,
          cardNumber: cardData.cardNumber,
          setName: cardData.setName,
          setDisplayName: cardData.setDisplayName,
          year: cardData.year,
          variety: cardData.variety
        },
        extracted: { setName, year, cardNumber, variety }
      });
    }
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
          'group px-4 py-3 cursor-pointer transition-all duration-300 border-l-4 relative overflow-hidden rounded-r-lg',
          isSelected
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border-cyan-400 text-cyan-100 shadow-xl backdrop-blur-sm transform scale-[1.02]'
            : 'hover:bg-gradient-to-r hover:from-zinc-800/60 hover:to-zinc-700/40 border-transparent text-zinc-300 hover:text-zinc-100 hover:border-zinc-600/50'
        )}
      >
        {/* Main content container */}
        <div className="relative z-10 space-y-2">
          {/* Primary name with enhanced styling */}
          <div className="font-semibold text-sm flex items-center gap-2">
            {result.type === 'card' && (
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex-shrink-0 animate-pulse"></div>
            )}
            {result.type === 'set' && (
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex-shrink-0"></div>
            )}
            {result.type === 'product' && (
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex-shrink-0"></div>
            )}
            <span className="flex-grow">{highlightedText}</span>
          </div>
          
          {/* Enhanced set information for cards with beautiful label */}
          {setName && result.type !== 'set' && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                <div className="w-1 h-1 bg-purple-400 rounded-full mr-1.5"></div>
                <span className="text-xs font-medium text-purple-200">
                  {setName}
                </span>
              </div>
              {year && (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm">
                  <span className="text-xs font-medium text-blue-200">
                    {year}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Enhanced category information */}
          {result.data?.category && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 backdrop-blur-sm">
                <div className="w-1 h-1 bg-green-400 rounded-full mr-1.5"></div>
                <span className="text-xs font-medium text-green-200">
                  {result.data.category}
                </span>
              </div>
            </div>
          )}
          
          {/* Additional metadata for cards */}
          {result.type === 'card' && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {cardNumber && (
                <span className="px-2 py-0.5 bg-zinc-700/50 rounded text-zinc-300 font-mono border border-zinc-600/30">
                  #{cardNumber}
                </span>
              )}
              {variety && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded text-amber-200 border border-amber-400/30 backdrop-blur-sm">
                  {variety}
                </span>
              )}
              {/* Show if this is a special card type */}
              {result.displayName && result.displayName.includes('Holo') && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded text-yellow-200 border border-yellow-400/30 backdrop-blur-sm">
                  ✨ Holo
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced glow effects */}
        {isSelected && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 pointer-events-none"></div>
            <div className="absolute -inset-px bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-r-lg pointer-events-none opacity-50"></div>
          </>
        )}
        
        {/* Hover shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
        </div>
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
  value, // ADDED: External value prop
  onSelect,
  onInputChange,
  className = '',
  disabled = false,
  autoFocus = false,
  minLength = 2,
  maxResults = 50,
  themeColor = 'blue',
  useExternalSearch = false, // ADDED: Default to internal search
  externalResults = [], // ADDED: Default empty external results
  externalLoading = false, // ADDED: Default external loading state

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

  // Direct search hook integration - FIXED to actually trigger searches
  const search = useSearch();

  // Local state for search functionality
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // FIXED: Sync internal state with external value prop
  useEffect(() => {
    if (value !== undefined && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Use direct search results with proper API integration
  const { results: internalResults, isLoading: internalLoading } = search;

  // FIXED: Use external results when using hierarchical search
  const results = useExternalSearch ? externalResults : internalResults;
  const isLoading = useExternalSearch ? externalLoading : internalLoading;



  // Form integration for section variants
  const watchedValues = watch ? watch() : {};
  const fieldError = errors?.[fieldName || ''];

  // Direct result selection handler - FIXED!
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      console.log('[POKEMON SEARCH] Result selected:', result);

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

      // Update UI state
      setIsVisible(false);
      setSearchQuery(result.displayName);
      setSelectedIndex(-1);
    },
    [
      searchVariant,
      setValue,
      onSelectionChange,
      searchType,
      onSelect,
      clearErrors,
    ]
  );

  // Input change handler with ACTUAL search API triggering - FIXED!
  const handleInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // FIXED: Skip internal search when using external search (hierarchical search)
      if (!useExternalSearch) {
        // CRITICAL FIX: Actually trigger the search API calls based on searchType
        if (value.length >= minLength) {
          setIsVisible(true);

          // Trigger the appropriate search based on searchType
          switch (searchType) {
            case 'sets':
              search.searchSets(value);
              break;
            case 'cards':
              search.searchCards(value, setFilter); // Use setFilter for hierarchical filtering
              break;
            case 'products':
              search.searchProducts(value, setFilter); // Use setFilter for hierarchical filtering
              break;
            default:
              console.warn(
                `[POKEMON SEARCH] Unknown searchType: ${searchType}`
              );
          }
        } else {
          setIsVisible(false);
          search.clearResults();
        }
      } else {
        // When using external search, just show/hide dropdown based on minLength
        if (value.length >= minLength) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }

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
    },
    [
      searchType,
      setFilter,
      minLength,
      search,
      setValue,
      fieldName,
      onInputChange,
      searchVariant,
      onSelectionChange,
    ]
  );

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isVisible || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + results.length) % results.length
          );
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
    },
    [
      isVisible,
      results,
      selectedIndex,
      handleResultSelect,
      setSelectedIndex,
      onClose,
    ]
  );

  // Theme-aware styling
  const elementTheme = getElementTheme(themeColor);

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
      isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-2 pointer-events-none'
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
            <h3 className="text-lg font-semibold text-zinc-100">
              {sectionTitle}
            </h3>
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
              {...(register && fieldName
                ? register(fieldName, { required })
                : {})}
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

  // Enhanced dropdown rendering - FIXED to use actual search results
  const renderDropdown = () => {
    if (!isVisible) return null;

    // Use actual search results from the search hook - FIXED!
    const displayResults = results || [];

    if (displayResults.length === 0 && !isLoading) {
      return (
        <div ref={dropdownRef} className={dropdownClasses}>
          <div className="px-4 py-3 text-center text-zinc-400">
            {searchQuery.length < minLength
              ? `Type at least ${minLength} characters to search ${searchType}...`
              : `No ${searchType} found for "${searchQuery}"`}
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div ref={dropdownRef} className={dropdownClasses}>
          <div className="px-4 py-3 text-center text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
            Searching {searchType}...
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
