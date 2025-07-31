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
  formType: 'cards' | 'products';
  onSetSelection?: (result: SearchResult) => void;
  onItemSelection?: (result: SearchResult) => void;
  selectedSet?: string;
  selectedItem?: string;
  setFieldError?: string;
  itemFieldError?: string;
  disabled?: boolean;
}

/**
 * Search Section Component
 * Provides set and item search fields for forms
 */
export const SearchSection: React.FC<SearchSectionProps> = ({
  formType,
  onSetSelection,
  onItemSelection,
  selectedSet = '',
  selectedItem = '',
  setFieldError,
  itemFieldError,
  disabled = false,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <Package className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Search Information
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set Search */}
        <AutocompleteField
          searchType="sets"
          label="Set Name"
          placeholder="Search for a set..."
          value={selectedSet}
          onSelect={onSetSelection || (() => {})}
          error={setFieldError}
          disabled={disabled}
          required
        />

        {/* Item Search (Card or Product) */}
        <AutocompleteField
          searchType={formType}
          label={formType === 'cards' ? 'Card Name' : 'Product Name'}
          placeholder={formType === 'cards' ? 'Search for a card...' : 'Search for a product...'}
          value={selectedItem}
          onSelect={onItemSelection || (() => {})}
          filters={{ setName: selectedSet || undefined }}
          error={itemFieldError}
          disabled={disabled}
          required
        />
      </div>

      {selectedSet && (
        <div className="mt-4 text-sm text-green-600 dark:text-green-400">
          ✓ Set selected: {selectedSet}
        </div>
      )}
    </div>
  );
};