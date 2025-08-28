/**
 * Sealed Product Search Page Component - Unified Design System
 * Layer 4: Views/Pages (Application Screens)
 * Following CLAUDE.md principles: Beautiful design, SRP, and integration with new hierarchical product structure
 * UPDATED: Now uses SetProduct → Product hierarchy instead of CardMarketReferenceProduct
 *
 * Following CLAUDE.md principles:
 * - REFACTORED: Extracted reusable components to eliminate DRY violations
 * - ProductSearchFilters: Reusable search and filter inputs
 * - ProductCard: Reusable individual product card components
 * - PaginationControls: Reusable pagination UI with smart page number generation
 */

import { Euro, Package, Search } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import GenericLoadingState from '../../../shared/components/molecules/common/GenericLoadingState';
import ProductSearchFilters from '../../../shared/components/molecules/common/ProductSearchFilters';
import ProductCard from '../../../shared/components/molecules/common/ProductCard';
import PaginationControls from '../../../shared/components/molecules/common/PaginationControls';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer, PokemonCard } from '../../../shared/components/atoms/design-system';
import { ISetProduct } from '../../../shared/domain/models/setProduct';
import { usePaginatedSearch } from '../../../shared/hooks/usePaginatedSearch';

const ProductSearch: React.FC = () => {
  const {
    items: products,
    pagination,
    loading,
    error,
    searchProducts,
    setPage,
    clearError,
  } = usePaginatedSearch();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [setProductFilter, setSetProductFilter] = useState<ISetProduct | null>(
    null
  ); // NEW: SetProduct filter
  const [setNameFilter, setSetNameFilter] = useState(''); // Set name filter for searching
  const [availableOnly, setAvailableOnly] = useState(false);

  const itemsPerPage = 20;

  // Shared search function using the hook - no more duplicate HTTP logic
  const performProductSearch = useCallback(
    async (page: number = 1) => {
      await searchProducts({
        searchTerm: searchTerm.trim() || undefined,
        categoryFilter: categoryFilter || undefined,
        setProductId: setProductFilter?.id,
        availableOnly,
        page,
        limit: itemsPerPage,
      });
    },
    [
      searchProducts,
      searchTerm,
      categoryFilter,
      setProductFilter,
      availableOnly,
    ]
  );

  // Handle search submit
  const handleSearch = () => {
    performProductSearch(1); // Reset to page 1 when searching
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSetProductFilter(null); // Clear SetProduct filter
    setSetNameFilter(''); // Clear set name filter
    setAvailableOnly(false);
    // Fetch all products when clearing filters
    setTimeout(() => {
      performProductSearch(1); // Reset to page 1 when clearing
    }, 100);
  };

  // Handle page change using shared hook
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Enter key in search inputs
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Convert EUR to DKK (1 EUR = 7.46 DKK)
  const convertToDKK = (eurPrice: number): number => {
    return Math.round(eurPrice * 7.46);
  };

  // Initial load using shared hook - FIXED: Remove performProductSearch dependency to prevent infinite loop
  useEffect(() => {
    // Load initial data - empty query will trigger "show all" behavior in backend
    searchProducts({
      query: '', // Empty query for initial load (backend converts this to '*')
      page: 1,
      limit: itemsPerPage,
    });
  }, [searchProducts]); // Only depend on searchProducts

  const headerActions = (
    <div className="bg-gradient-to-r from-[var(--theme-status-success)]/10 via-[var(--theme-accent-secondary)]/10 to-[var(--theme-accent-secondary)]/10 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-[var(--theme-border)]">
      <Package className="w-8 h-8 text-[var(--theme-status-success)]" />
    </div>
  );

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <PokemonCard
            variant="glass"
            size="xl"
            className="text-white relative overflow-hidden"
          >
            <div className="relative z-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Product Search
                  </h1>
                  <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                    Discover CardMarket reference products with real-time pricing
                  </p>
                </div>
                <div className="flex items-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl px-6 py-3 border border-emerald-400/30 backdrop-blur-sm">
                  <Package className="w-6 h-6 mr-3 text-emerald-300" />
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{pagination.total}</div>
                    <div className="text-sm text-emerald-200">Total Products</div>
                  </div>
                </div>
              </div>
              
              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                      Error
                    </div>
                    <span className="text-red-300 font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </PokemonCard>

          {/* Loading State */}
          {loading && (
            <PokemonCard variant="glass" size="xl">
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                  <p className="mt-4 text-cyan-100/70 font-medium">
                    Loading products...
                  </p>
                </div>
              </div>
            </PokemonCard>
          )}

          {/* Search Filters */}
          {!loading && (
            <PokemonCard variant="glass" size="lg" className="relative">
              <div className="relative z-10">
                <ProductSearchFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  setProductFilter={setProductFilter}
                  setSetProductFilter={setSetProductFilter}
                  setNameFilter={setNameFilter}
                  setSetNameFilter={setSetNameFilter}
                  availableOnly={availableOnly}
                  setAvailableOnly={setAvailableOnly}
                  loading={loading}
                  handleSearch={handleSearch}
                  handleClearFilters={handleClearFilters}
                  handleKeyPress={handleKeyPress}
                />
              </div>
            </PokemonCard>
          )}

          {/* Results Section */}
          {!loading && (
            <PokemonCard variant="glass" size="xl" className="relative">
              <div className="relative z-10">
                {error && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-red-900/30 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                      <Package className="w-10 h-10 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Error Loading Products
                    </h3>
                    <p className="text-cyan-100/70 font-medium mb-6 max-w-md mx-auto">
                      {error}
                    </p>
                    <button
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!error && products.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                      <Search className="w-10 h-10 text-cyan-300/70" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      No Products Found
                    </h3>
                    <p className="text-cyan-100/70 font-medium mb-6 max-w-md mx-auto">
                      Try adjusting your search criteria to find more products.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

                {!error && products.length > 0 && (
                  <>
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Products
                          {setProductFilter && (
                            <span className="text-lg text-cyan-400 ml-2">
                              → {setProductFilter.setProductName}
                            </span>
                          )}
                        </h2>
                        <p className="text-cyan-100/70 font-medium mt-1">
                          Showing {products.length} of {pagination.total} products
                          {pagination.totalPages > 1 &&
                            ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                        </p>
                      </div>
                      <div className="flex items-center text-sm text-cyan-200 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                        <Euro className="w-4 h-4 mr-2" />
                        <span>Prices in EUR → DKK conversion</span>
                      </div>
                    </div>

                    {/* Products Grid using ProductCard component */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                          convertToDKK={convertToDKK}
                        />
                      ))}
                    </div>

                    {/* Premium Pagination using PaginationControls component */}
                    <div className="mt-8">
                      <PaginationControls
                        pagination={pagination}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </div>
            </PokemonCard>
          )}
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default ProductSearch;
