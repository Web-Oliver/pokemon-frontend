/**
 * Search Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Focused search section for forms using consolidated search
 */

import React from 'react';
import { Package } from 'lucide-react';
import { AutocompleteField } from '../search/AutocompleteField';
import { SearchResult } from '../../hooks/useSearch';

export interface SearchSectionProps {
  formType: 'cards' | 'products' | 'setProducts'; // UPDATED: Added setProducts
  onSetSelection?: (result: SearchResult) => void;
  onItemSelection?: (result: SearchResult) => void;
  onSetProductSelection?: (result: SearchResult) => void; // NEW: SetProduct selection
  selectedSet?: string;
  selectedSetProduct?: string; // NEW: Selected SetProduct
  selectedItem?: string;
  setFieldError?: string;
  setProductFieldError?: string; // NEW: SetProduct field error
  itemFieldError?: string;
  disabled?: boolean;
  // NEW: Hierarchical configuration
  hierarchicalMode?: boolean;
  onAutofill?: (autofillData: any) => void;
}

/**
 * Search Section Component
 * Provides set and item search fields for forms
 */
export const SearchSection: React.FC<SearchSectionProps> = ({
  formType,
  onSetSelection,
  onItemSelection,
  onSetProductSelection,
  selectedSet = '',
  selectedSetProduct = '',
  selectedItem = '',
  setFieldError,
  setProductFieldError,
  itemFieldError,
  disabled = false,
  hierarchicalMode = false,
  onAutofill,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <Package className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Search Information
        </h4>
      </div>

      <div className={`grid grid-cols-1 ${formType === 'setProducts' ? 'md:grid-cols-2' : 'md:grid-cols-2'} gap-6`}>
        {/* Hierarchical Search: SetProduct → Product OR Traditional Search: Set → Card/Product */}
        {formType === 'setProducts' ? (
          <>
            {/* SetProduct Search */}
            <AutocompleteField
              searchType="setProducts"
              label="Set Product"
              placeholder="Search for a set product..."
              value={selectedSetProduct}
              onSelect={onSetProductSelection || (() => {})}
              error={setProductFieldError}
              disabled={disabled}
              required
              hierarchicalConfig={{
                enableHierarchical: hierarchicalMode,
                fieldType: 'setProduct',
                onAutofill,
              }}
            />

            {/* Product Search (filtered by SetProduct) */}
            <AutocompleteField
              searchType="products"
              label="Product Name"
              placeholder="Search for a product..."
              value={selectedItem}
              onSelect={onItemSelection || (() => {})}
              filters={{ setProductId: selectedSetProduct || undefined }}
              error={itemFieldError}
              disabled={disabled}
              required
              hierarchicalConfig={{
                enableHierarchical: hierarchicalMode,
                fieldType: 'product',
                onAutofill,
              }}
            />
          </>
        ) : (
          <>
            {/* Traditional Set Search */}
            <AutocompleteField
              searchType="sets"
              label="Set Name"
              placeholder="Search for a set..."
              value={selectedSet}
              onSelect={onSetSelection || (() => {})}
              error={setFieldError}
              disabled={disabled}
              required
              hierarchicalConfig={{
                enableHierarchical: hierarchicalMode,
                fieldType: 'set',
                onAutofill,
              }}
            />

            {/* Item Search (Card or Product filtered by Set) */}
            <AutocompleteField
              searchType={formType as 'cards' | 'products'}
              label={formType === 'cards' ? 'Card Name' : 'Product Name'}
              placeholder={
                formType === 'cards'
                  ? 'Search for a card...'
                  : 'Search for a product...'
              }
              value={selectedItem}
              onSelect={onItemSelection || (() => {})}
              filters={{ setName: selectedSet || undefined }}
              error={itemFieldError}
              disabled={disabled}
              required
              hierarchicalConfig={{
                enableHierarchical: hierarchicalMode,
                fieldType: formType === 'cards' ? 'card' : 'product',
                onAutofill,
              }}
            />
          </>
        )}
      </div>

      {/* Success Messages */}
      {formType === 'setProducts' && selectedSetProduct && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          ✓ Set Product selected: {selectedSetProduct}
        </div>
      )}
      {formType !== 'setProducts' && selectedSet && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          ✓ Set selected: {selectedSet}
        </div>
      )}
    </div>
  );
};
