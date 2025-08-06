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
import React, { useEffect, useState, useCallback } from 'react';
import { searchProducts, getPaginatedProducts } from '../../../shared/api/productsApi';
import LoadingSpinner from '../../../shared/components/molecules/common/LoadingSpinner';
import ProductSearchFilters from '../../../shared/components/molecules/common/ProductSearchFilters';
import ProductCard from '../../../shared/components/molecules/common/ProductCard';
import PaginationControls from '../../../shared/components/molecules/common/PaginationControls';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { IProduct, ProductCategory } from '../../../shared/domain/models/product';
import { ISetProduct } from '../../../shared/domain/models/setProduct';
import { handleApiError } from '../../../shared/utils/helpers/errorHandler';
import { log } from '../../../shared/utils/performance/logger';

const ProductSearch: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [setProductFilter, setSetProductFilter] = useState<ISetProduct | null>(
    null
  ); // NEW: SetProduct filter
  const [setNameFilter, setSetNameFilter] = useState(''); // Set name filter for searching
  const [availableOnly, setAvailableOnly] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0,
  });

  const itemsPerPage = 20;

  // Fetch products with pagination using new SetProduct → Product hierarchy
  const fetchProducts = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        log('Fetching products with params:', {
          page,
          limit: itemsPerPage,
          categoryFilter,
          setProductFilter: setProductFilter?.setProductName,
          availableOnly,
          searchTerm,
        });

        let fetchedProducts: IProduct[] = [];
        let paginationData = {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          total: 0,
        };

        if (searchTerm.trim()) {
          // Use consolidated search API when there's a search term
          const searchParams = {
            query: searchTerm.trim(),
            page,
            limit: itemsPerPage,
            ...(categoryFilter && { category: categoryFilter }),
            ...(setProductFilter && { setProductId: setProductFilter.id }),
            ...(availableOnly && { availableOnly: true }),
          };

          const searchResponse = await searchProducts(searchParams);
          fetchedProducts = searchResponse.data || [];

          // Calculate pagination for search results
          const totalResults = searchResponse.count || 0;
          const totalPages = Math.ceil(totalResults / itemsPerPage);
          paginationData = {
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            total: totalResults,
          };
        } else {
          // Use paginated products API for browsing
          const response = await getPaginatedProducts({
            page,
            limit: itemsPerPage,
            ...(categoryFilter && { category: categoryFilter }),
            ...(setProductFilter && { setProductId: setProductFilter.id }),
            ...(availableOnly && { available: availableOnly }),
          });

          fetchedProducts = response.products || [];
          paginationData = {
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage,
            total: response.total,
          };
        }

        setProducts(fetchedProducts);
        setPagination(paginationData);

        log(
          'Products fetched successfully:',
          fetchedProducts.length,
          'products',
          'page',
          paginationData.currentPage
        );
      } catch (error) {
        const errorMessage = 'Failed to fetch products';
        setError(errorMessage);
        handleApiError(error, errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, categoryFilter, setProductFilter, availableOnly]
  );

  // Handle search submit
  const handleSearch = () => {
    fetchProducts(1); // Reset to page 1 when searching
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
      fetchProducts(1); // Reset to page 1 when clearing
    }, 100);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage);
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

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const headerActions = (
    <div className="bg-gradient-to-r from-[var(--theme-status-success)]/10 via-[var(--theme-accent-secondary)]/10 to-[var(--theme-accent-secondary)]/10 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-[var(--theme-border)]">
      <Package className="w-8 h-8 text-[var(--theme-status-success)]" />
    </div>
  );

  return (
    <PageLayout
      title="Product Search"
      subtitle="Discover CardMarket reference products with real-time pricing"
      loading={loading}
      error={error}
      actions={headerActions}
      variant="emerald"
    >
      {/* Premium Page Header */}
      <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-success)]/5 via-teal-500/5 to-[var(--theme-accent-primary)]/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[var(--theme-text-primary)] tracking-wide mb-3 bg-gradient-to-r from-[var(--theme-status-success)] to-teal-400 bg-clip-text text-transparent">
                Product Search
              </h1>
              <p className="text-xl text-[var(--theme-text-secondary)] font-medium leading-relaxed">
                Browse CardMarket reference products and pricing
              </p>
            </div>
            <div className="flex items-center bg-gradient-to-r from-[var(--theme-status-success)] to-teal-600 rounded-2xl px-6 py-3 text-white shadow-xl">
              <Package className="w-6 h-6 mr-3" />
              <div className="text-right">
                <div className="text-2xl font-bold">{pagination.total}</div>
                <div className="text-sm opacity-90">Total Products</div>
              </div>
            </div>
          </div>
        </div>
        {/* Premium shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-text-primary)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>

      {/* Premium Search Filters using ProductSearchFilters component */}
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

      {/* Premium Search Results */}
      <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-surface-secondary)]/30 to-[var(--theme-status-success)]/10"></div>
        <div className="p-8 relative z-10">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-[var(--theme-text-secondary)] font-medium">
                  Loading products...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-status-error)]/50 to-pink-900/50 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-[var(--theme-status-error)]/30">
                <Package className="w-10 h-10 text-[var(--theme-status-error)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-3">
                Error Loading Products
              </h3>
              <p className="text-[var(--theme-text-secondary)] font-medium mb-6 max-w-md mx-auto">
                {error}
              </p>
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-[var(--theme-status-error)] to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-[var(--theme-border)]">
                <Search className="w-10 h-10 text-[var(--theme-text-muted)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-3">
                No Products Found
              </h3>
              <p className="text-[var(--theme-text-secondary)] font-medium mb-6 max-w-md mx-auto">
                Try adjusting your search criteria to find more products.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-gradient-to-r from-[var(--theme-status-success)] to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">
                    Products
                    {setProductFilter && (
                      <span className="text-lg text-[var(--theme-accent-primary)] ml-2">
                        → {setProductFilter.setProductName}
                      </span>
                    )}
                  </h2>
                  <p className="text-[var(--theme-text-secondary)] font-medium mt-1">
                    Showing {products.length} of {pagination.total} products
                    {pagination.totalPages > 1 &&
                      ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                  </p>
                </div>
                <div className="flex items-center text-sm text-[var(--theme-text-secondary)] bg-[var(--theme-surface-secondary)]/50 px-4 py-2 rounded-xl border border-[var(--theme-border)]">
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
              <PaginationControls
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductSearch;
