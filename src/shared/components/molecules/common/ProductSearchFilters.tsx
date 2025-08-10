/**
 * ProductSearchFilters Component - DRY Violation Fix
 *
 * Reusable product search filters component extracted from SealedProductSearch.tsx
 * to prevent JSX duplication for search inputs, filter dropdowns, and action buttons.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all product search filtering UI and logic
 * - DRY: Eliminates repeated search/filter input field JSX structures
 * - Reusability: Can be used across different product search displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { Filter, Package, Search } from 'lucide-react';
import { ProductCategory } from '../../../domain/models/product';
import { ISetProduct } from '../../../domain/models/setProduct';

interface ProductSearchFiltersProps {
  /** Current search term */
  searchTerm: string;
  /** Function to update search term */
  setSearchTerm: (term: string) => void;
  /** Current category filter */
  categoryFilter: string;
  /** Function to update category filter */
  setCategoryFilter: (category: string) => void;
  /** Current set product filter */
  setProductFilter: ISetProduct | null;
  /** Function to update set product filter */
  setSetProductFilter: (setProduct: ISetProduct | null) => void;
  /** Current set name filter */
  setNameFilter: string;
  /** Function to update set name filter */
  setSetNameFilter: (setName: string) => void;
  /** Available only checkbox state */
  availableOnly: boolean;
  /** Function to update available only state */
  setAvailableOnly: (available: boolean) => void;
  /** Loading state */
  loading: boolean;
  /** Function to handle search */
  handleSearch: () => void;
  /** Function to handle clear filters */
  handleClearFilters: () => void;
  /** Function to handle key press */
  handleKeyPress: (event: React.KeyboardEvent) => void;
  /** Additional CSS classes */
  className?: string;
}

const ProductSearchFilters: React.FC<ProductSearchFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  setProductFilter,
  setSetProductFilter,
  setNameFilter,
  setSetNameFilter,
  availableOnly,
  setAvailableOnly,
  loading,
  handleSearch,
  handleClearFilters,
  handleKeyPress,
  className = '',
}) => {
  // Available categories from ProductCategory enum
  const categories = Object.values(ProductCategory);

  return (
    <div
      className={`bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent-primary)]/5 via-[var(--theme-status-success)]/5 to-teal-500/5"></div>
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Name Search */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-3 tracking-wide">
              Product Name
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-muted)] w-5 h-5 group-focus-within:text-[var(--theme-status-success)] transition-colors duration-300 z-10" />
              <input
                type="text"
                placeholder="Search product names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 text-base font-medium bg-[var(--theme-surface-secondary)] backdrop-blur-sm border border-[var(--theme-border)] rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-status-success)]/50 focus:border-[var(--theme-status-success)] focus:bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] transition-all duration-300 hover:shadow-xl"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-3 tracking-wide">
              Category
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-muted)] w-5 h-5 group-focus-within:text-teal-400 transition-colors duration-300 z-10" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-base font-medium bg-[var(--theme-surface-secondary)] backdrop-blur-sm border border-[var(--theme-border)] rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 focus:bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)] transition-all duration-300 hover:shadow-xl appearance-none cursor-pointer"
              >
                <option
                  value=""
                  className="bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
                >
                  All Categories
                </option>
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
                  >
                    {category.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10">
                <svg
                  className="w-5 h-5 text-[var(--theme-text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Set Name Filter */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-bold text-[var(--theme-text-secondary)] mb-3 tracking-wide">
              Set Name
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-text-muted)] w-5 h-5 group-focus-within:text-[var(--theme-accent-primary)] transition-colors duration-300 z-10" />
              <input
                type="text"
                placeholder="Filter by set name..."
                value={setNameFilter}
                onChange={(e) => setSetNameFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 text-base font-medium bg-[var(--theme-surface-secondary)] backdrop-blur-sm border border-[var(--theme-border)] rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-primary)]/50 focus:border-[var(--theme-accent-primary)] focus:bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] transition-all duration-300 hover:shadow-xl"
              />
            </div>
          </div>

          {/* Action Buttons and Available Filter */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Available Only Filter */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                      availableOnly
                        ? 'bg-gradient-to-r from-[var(--theme-status-success)] to-teal-600 border-[var(--theme-status-success)]'
                        : 'border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] group-hover:border-[var(--theme-status-success)]'
                    }`}
                  >
                    {availableOnly && (
                      <svg
                        className="w-4 h-4 text-white absolute top-0.5 left-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-status-success)] transition-colors duration-300">
                  Available Only
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--theme-status-success)] to-teal-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--theme-status-success)]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[var(--theme-text-secondary)]/30 border-t-[var(--theme-text-secondary)] rounded-full animate-spin mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 text-[var(--theme-text-secondary)] px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 hover:text-[var(--theme-text-primary)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--theme-border)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchFilters;
