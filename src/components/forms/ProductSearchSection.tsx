/**
 * Product Search Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Focused replacement for CardProductInformationSection
 * Maintains ALL existing functionality with consolidated search
 */

import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  UseFormClearErrors,
} from 'react-hook-form';
import { AutocompleteField } from '../search/AutocompleteField';
import { SearchResult, useSearch } from '../../hooks/useSearch';
import { InformationFieldRenderer } from './fields';
import {
  autoFillFromSelection,
  AutoFillConfig,
  mapSetNameForProducts,
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
export const ProductSearchSection: React.FC<ProductSearchSectionProps> = ({
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

    if (
      !currentValue ||
      typeof currentValue !== 'string' ||
      currentValue.trim().length < 2
    ) {
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
      case 'productName':
        if (formType === 'product') {
          console.log(
            '[CENTRALIZED SEARCH] Calling search.searchProducts:',
            currentValue,
            setName?.trim()
          );
          search.searchProducts(currentValue, setName?.trim() || undefined);
        } else {
          console.log(
            '[CENTRALIZED SEARCH] Calling search.searchCards:',
            currentValue,
            setName?.trim()
          );
          search.searchCards(currentValue, setName?.trim() || undefined);
        }
        break;
    }
  }, [
    activeField,
    debouncedSetName,
    debouncedProductName,
    setName,
    formType,
    search,
  ]);

  // Create auto-fill configuration
  const autoFillConfig: AutoFillConfig = {
    setValue,
    clearErrors,
    formType,
  };

  // Handle set selection using centralized system
  const handleSetSelection = (result: SearchResult) => {
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
  };

  // Handle product/card selection using centralized system
  const handleProductCardSelection = (result: SearchResult) => {
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
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-blue-900/50 pointer-events-none"></div>

      <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center relative">
        <SectionIcon className="w-6 h-6 mr-3 text-zinc-300" />
        {sectionTitle}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Set Name Autocomplete - Centralized */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Set Name
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative">
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
                console.log('[CENTRALIZED SEARCH] Set Name field blurred');
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
              className="block w-full pl-3 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {errors.setName && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.setName.message}
            </p>
          )}

          {/* Set Name Dropdown */}
          {activeField === 'setName' && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/40 shadow-2xl">
              {suggestions.map((result) => (
                <div
                  key={result._id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSetSelection(result);
                  }}
                  className="cursor-pointer select-none relative py-4 pl-4 pr-4 hover:bg-zinc-800/80 transition-colors duration-150 border-b border-zinc-700/30 last:border-b-0"
                >
                  <div className="font-medium text-zinc-100">
                    {result.displayName}
                  </div>
                  {result.data?.year && (
                    <div className="text-sm text-zinc-400">
                      Year: {result.data.year}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Set Name No Results */}
          {activeField === 'setName' &&
            setName.trim().length >= 2 &&
            suggestions.length === 0 &&
            !isLoading && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/40 shadow-2xl py-4">
                <div className="text-center text-zinc-400 px-4">
                  <div className="font-medium mb-1">No results found</div>
                  <div className="text-sm">Try adjusting your search terms</div>
                </div>
              </div>
            )}
        </div>

        {/* Product/Card Name Autocomplete - Centralized */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {formType === 'product' ? 'Product Name' : 'Card Name'}
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="relative">
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
              }}
              onBlur={() => {
                console.log('[CENTRALIZED SEARCH] Product Name field blurred');
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
              className="block w-full pl-3 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {errors[formType === 'product' ? 'productName' : 'cardName'] && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {
                errors[formType === 'product' ? 'productName' : 'cardName']
                  ?.message
              }
            </p>
          )}

          {/* Product Name Dropdown */}
          {activeField === 'productName' && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/40 shadow-2xl">
              {suggestions.map((result) => (
                <div
                  key={result._id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleProductCardSelection(result);
                  }}
                  className="cursor-pointer select-none relative py-4 pl-4 pr-4 hover:bg-zinc-800/80 transition-colors duration-150 border-b border-zinc-700/30 last:border-b-0"
                >
                  <div className="font-medium text-zinc-100">
                    {result.displayName}
                  </div>
                  {result.data?.setName && result.type !== 'set' && (
                    <div className="text-sm text-zinc-400">
                      Set: {result.data.setName}
                    </div>
                  )}
                  {result.data?.category && (
                    <div className="text-sm text-zinc-400">
                      Category: {result.data.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Product Name No Results */}
          {activeField === 'productName' &&
            (formType === 'product' ? productName : cardName).trim().length >=
              2 &&
            suggestions.length === 0 &&
            !isLoading && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/40 shadow-2xl py-4">
                <div className="text-center text-zinc-400 px-4">
                  <div className="font-medium mb-1">No results found</div>
                  <div className="text-sm">Try adjusting your search terms</div>
                </div>
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
    </div>
  );
};
