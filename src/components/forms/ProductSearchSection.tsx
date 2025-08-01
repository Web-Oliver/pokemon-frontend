/**
 * Product Search Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Focused replacement for CardProductInformationSection
 * Maintains ALL existing functionality with consolidated search
 */

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { LucideIcon, Search } from 'lucide-react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { SearchResult, useSearch } from '../../hooks/useSearch';
import { InformationFieldRenderer } from './fields';
import {
  AutoFillConfig,
  autoFillFromSelection,
} from '../../utils/searchHelpers';
import { useDebouncedValue } from '../../hooks/useDebounce';

interface ProductSearchSectionProps {
  /** React Hook Form functions */
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;

  /** Section configuration */
  sectionTitle: string;
  sectionIcon: LucideIcon;
  formType: 'product' | 'card';

  /** Autocomplete functionality */
  onSelectionChange: (selectedData: Record<string, unknown> | null) => void;
  onError?: (error: string) => void;

  /** Form field configuration */
  readOnlyFields?: {
    category?: boolean;
    availability?: boolean;
  };
  productCategories?: Array<{ value: string; label: string }> | string[];
  loadingOptions?: boolean;
}

/**
 * Product Search Section
 * Provides focused search functionality while maintaining all existing auto-fill behavior
 */
const ProductSearchSectionComponent: React.FC<ProductSearchSectionProps> = ({
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  sectionTitle,
  sectionIcon: SectionIcon,
  formType,
  onSelectionChange,
  onError: _onError,
  readOnlyFields = {},
  productCategories = [],
  loadingOptions = false,
}) => {
  // Watch form values
  const setName = watch('setName') || '';
  const productName = watch('productName') || '';
  const cardName = watch('cardName') || '';
  const category = watch('category') || '';

  // Centralized state management like the old autocomplete system
  const [activeField, setActiveField] = useState<
    'setName' | 'productName' | null
  >(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use centralized search hook
  const search = useSearch();

  // Debounce search queries
  const debouncedSetName = useDebouncedValue(setName, 300);
  const debouncedProductName = useDebouncedValue(
    formType === 'product' ? productName : cardName,
    300
  );

  // Sync search results to local suggestions state
  useEffect(() => {
    console.log(
      '[SEARCH SYNC] Updating suggestions from search.results:',
      search.results
    );
    setSuggestions(search.results || []);
    setIsLoading(search.loading);
  }, [search.results, search.loading]);

  // Centralized search effect - like the old autocomplete system
  useEffect(() => {
    console.log('[CENTRALIZED SEARCH] Search effect called with:', {
      activeField,
      debouncedSetName,
      debouncedProductName,
      setName,
      formType,
    });

    if (!activeField) {
      console.log('[CENTRALIZED SEARCH] No active field, clearing suggestions');
      setSuggestions([]);
      return;
    }

    const currentValue =
      activeField === 'setName' ? debouncedSetName : debouncedProductName;

    console.log('[CENTRALIZED SEARCH] Current value for search:', currentValue);

    if (!currentValue || typeof currentValue !== 'string') {
      console.log('[CENTRALIZED SEARCH] Invalid query, clearing suggestions');
      setSuggestions([]);
      return;
    }

    console.log('[CENTRALIZED SEARCH] Starting search for:', currentValue);
    // Don't set loading here - it will be synced from search hook
    switch (activeField) {
      case 'setName':
        console.log(
          '[CENTRALIZED SEARCH] Calling search.searchSets:',
          currentValue
        );
        search.searchSets(currentValue);
        break;
      case 'productName': {
        const currentSetName = watch('setName');

        // SMART SEARCH: If no query but set selected, show all from set. If query exists, filter within set.
        let searchQuery = currentValue;
        if (!currentValue || currentValue.trim() === '') {
          // No query - show all from set if set is selected
          if (currentSetName && currentSetName.trim()) {
            searchQuery = '*';
            console.log(
              '[CENTRALIZED SEARCH] No query but set selected, showing all from set'
            );
          } else {
            // No query and no set - don't search
            console.log(
              '[CENTRALIZED SEARCH] No query and no set - clearing results'
            );
            setSuggestions([]);
            return;
          }
        }

        if (formType === 'product') {
          console.log(
            '[CENTRALIZED SEARCH] Calling search.searchProducts:',
            searchQuery,
            currentSetName?.trim()
          );
          search.searchProducts(
            searchQuery,
            currentSetName?.trim() || undefined
          );
        } else {
          console.log(
            '[CENTRALIZED SEARCH] Calling search.searchCards:',
            searchQuery,
            currentSetName?.trim()
          );
          search.searchCards(searchQuery, currentSetName?.trim() || undefined);
        }
        break;
      }
    }
  }, [
    activeField,
    debouncedSetName,
    debouncedProductName,
    formType,
    watch,
    search.searchSets,
    search.searchProducts,
    search.searchCards,
  ]);

  // Context7 Pattern: Memoized configuration following React.dev best practices
  const autoFillConfig: AutoFillConfig = useMemo(
    () => ({
      setValue,
      clearErrors,
      formType,
    }),
    [setValue, clearErrors, formType]
  );

  // Context7 Pattern: Memoized event handler with stable dependencies
  const handleSetSelection = useCallback(
    (result: SearchResult) => {
      console.log('[CENTRALIZED] Set selected:', result);

      // Handle clearing - if result is empty, clear the form field
      if (!result._id || !result.displayName) {
        setValue('setName', '');
        clearErrors('setName');
        onSelectionChange(null);
        // Clear suggestions and active field
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      autoFillFromSelection(autoFillConfig, result, (data) => {
        // Call parent callback (maintains existing behavior)
        onSelectionChange({
          setName: result.data.setName,
          year: result.data.year,
          _id: result._id,
          ...result.data,
        });
      });

      // Clear suggestions after selection
      setSuggestions([]);
      setActiveField(null);
    },
    [setValue, clearErrors, onSelectionChange, autoFillConfig]
  );

  // Context7 Pattern: Memoized selection handler for optimal re-render prevention
  const handleProductCardSelection = useCallback(
    (result: SearchResult) => {
      console.log(`[CENTRALIZED] ${formType} selected:`, result);

      // Handle clearing - if result is empty, clear the form field
      if (!result._id || !result.displayName) {
        const fieldName = formType === 'product' ? 'productName' : 'cardName';
        setValue(fieldName, '');
        clearErrors(fieldName);
        onSelectionChange(null);
        // Clear suggestions and active field
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      autoFillFromSelection(autoFillConfig, result, onSelectionChange);

      // Clear suggestions after selection
      setSuggestions([]);
      setActiveField(null);
    },
    [formType, setValue, clearErrors, onSelectionChange, autoFillConfig]
  );

  return (
    <div className="relative">
      {/* Main Container with Context7 Design */}
      <div className="relative">
        {/* Context7 Background Glass Effects */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/5 via-blue-400/5 to-purple-400/5 rounded-[2.5rem] blur-xl"></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-visible">
          {/* Floating Orbs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Context7 Premium Header */}
          <div className="mb-8 relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <SectionIcon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent leading-tight mb-2">
              {sectionTitle}
            </h3>
            <p className="text-white/60 font-medium">
              Search and select from your collection database
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Context7 Premium Set Name Autocomplete */}
            <div className="relative z-50">
              <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
                  <SectionIcon className="w-3 h-3 text-emerald-400" />
                </div>
                <span>Set Name</span>
                <span className="text-red-400 ml-1 font-bold">*</span>
              </label>

              <div className="relative">
                {/* Background Glass Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-[1.2rem] blur-md opacity-60"></div>

                <div className="relative bg-black/40 backdrop-blur-3xl rounded-xl shadow-xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
                  {/* Floating Orbs */}
                  <div className="absolute -top-1 -right-1 w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-lg animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

                  <input
                    type="text"
                    value={setName}
                    onChange={(e) => setValue('setName', e.target.value)}
                    onFocus={() => {
                      console.log(
                        '[CENTRALIZED SEARCH] Set Name field focused, setting activeField to setName'
                      );
                      setActiveField('setName');
                    }}
                    onBlur={() => {
                      console.log(
                        '[CENTRALIZED SEARCH] Set Name field blurred'
                      );
                      setTimeout(() => {
                        if (activeField === 'setName') {
                          console.log(
                            '[CENTRALIZED SEARCH] Clearing activeField from setName'
                          );
                          setActiveField(null);
                        }
                      }, 150);
                    }}
                    placeholder="Search for set name..."
                    className="relative z-10 block w-full px-4 py-3 bg-transparent border-none text-white placeholder-white/50 font-medium focus:ring-0 focus:outline-none"
                  />

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

                  {/* Breathing Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-xl animate-pulse opacity-40 pointer-events-none group-focus-within:opacity-60 transition-opacity duration-300"></div>
                </div>

                {/* Set Name Dropdown - Positioned relative to this input */}
                {activeField === 'setName' && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
                    <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
                      <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent relative z-10">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion._id}
                            data-suggestion
                            onClick={() => handleSetSelection(suggestion)}
                            className="group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/10"
                            role="option"
                          >
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-lg leading-tight truncate group-hover:text-emerald-400 transition-colors duration-300">
                                  {suggestion.displayName}
                                </div>
                                {suggestion.data.year && (
                                  <div className="text-white/60 text-sm font-medium mt-1">
                                    {suggestion.data.year}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Set Name No Results */}
                {activeField === 'setName' &&
                  setName.trim().length >= 1 &&
                  suggestions.length === 0 &&
                  !isLoading && (
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

              {errors.setName && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
                    <SectionIcon className="w-3 h-3 text-red-400" />
                  </div>
                  <p className="text-sm text-red-300 font-medium">
                    {errors.setName.message}
                  </p>
                </div>
              )}
            </div>

            {/* Context7 Premium Product/Card Name Autocomplete */}
            <div className="relative z-50">
              <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10">
                  <SectionIcon className="w-3 h-3 text-blue-400" />
                </div>
                <span>{formType === 'product' ? 'Product Name' : 'Card Name'}</span>
                <span className="text-red-400 ml-1 font-bold">*</span>
              </label>

              <div className="relative">
                {/* Background Glass Effects */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-[1.2rem] blur-md opacity-60"></div>

                <div className="relative bg-black/40 backdrop-blur-3xl rounded-xl shadow-xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
                  {/* Floating Orbs */}
                  <div className="absolute -top-1 -right-1 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-lg animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>

                  <input
                    type="text"
                    value={formType === 'product' ? productName : cardName}
                    onChange={(e) => {
                      const fieldName =
                        formType === 'product' ? 'productName' : 'cardName';
                      setValue(fieldName, e.target.value);
                    }}
                    onFocus={() => {
                      console.log(
                        '[CENTRALIZED SEARCH] Product Name field focused, setting activeField to productName'
                      );
                      setActiveField('productName');

                      // AUTO-TRIGGER SEARCH: If set is selected but no product name yet, show suggestions immediately
                      const currentSetName = watch('setName');
                      const currentProductName =
                        formType === 'product' ? productName : cardName;

                      if (
                        currentSetName &&
                        currentSetName.trim() &&
                        (!currentProductName || currentProductName.trim() === '')
                      ) {
                        console.log(
                          '[AUTO-TRIGGER] Set selected, showing products/cards from set:',
                          currentSetName
                        );
                        // Trigger search with "*" as query to show all items from the set
                        if (formType === 'product') {
                          search.searchProducts('*', currentSetName.trim());
                        } else {
                          search.searchCards('*', currentSetName.trim());
                        }
                      }
                    }}
                    onBlur={() => {
                      console.log(
                        '[CENTRALIZED SEARCH] Product Name field blurred'
                      );
                      setTimeout(() => {
                        if (activeField === 'productName') {
                          console.log(
                            '[CENTRALIZED SEARCH] Clearing activeField from productName'
                          );
                          setActiveField(null);
                        }
                      }, 150);
                    }}
                    placeholder={`Search for ${formType} name...`}
                    className="relative z-10 block w-full px-4 py-3 bg-transparent border-none text-white placeholder-white/50 font-medium focus:ring-0 focus:outline-none"
                  />

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

                  {/* Breathing Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl animate-pulse opacity-40 pointer-events-none group-focus-within:opacity-60 transition-opacity duration-300"></div>
                </div>

                {/* Product/Card Name Dropdown - Positioned relative to this input */}
                {activeField === 'productName' && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-2">
                    <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
                      <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent relative z-10">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion._id}
                            data-suggestion
                            onClick={() => handleProductCardSelection(suggestion)}
                            className="group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden hover:bg-white/5 border border-transparent hover:border-white/10"
                            role="option"
                          >
                            <div className="relative z-10 flex items-center justify-between">
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="text-white font-bold text-lg leading-tight truncate group-hover:text-blue-400 transition-colors duration-300">
                                  {suggestion.displayName}
                                </div>
                                
                                {/* Premium Metadata */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {suggestion.data?.setName && suggestion.type !== 'set' && (
                                    <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold">
                                      Set: {suggestion.data.setName}
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

                {/* Product/Card Name No Results */}
                {activeField === 'productName' &&
                  (formType === 'product' ? productName : cardName).trim().length >= 2 &&
                  suggestions.length === 0 &&
                  !isLoading && (
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

              {errors[formType === 'product' ? 'productName' : 'cardName'] && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
                    <SectionIcon className="w-3 h-3 text-red-400" />
                  </div>
                  <p className="text-sm text-red-300 font-medium">
                    {errors[formType === 'product' ? 'productName' : 'cardName']?.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <InformationFieldRenderer
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              clearErrors={clearErrors}
              readOnlyFields={readOnlyFields}
              productCategories={productCategories}
              loadingOptions={loadingOptions}
              category={category}
              formType={formType}
            />
          </div>

          {/* Breathing Animation for main container */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
        </div>
      </div>

    </div>
  );
};

// Context7 Performance: Memoized export with display name
export const ProductSearchSection = memo(ProductSearchSectionComponent);
ProductSearchSection.displayName = 'ProductSearchSection';
