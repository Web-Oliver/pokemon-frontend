/**
 * Sealed Product Search Page Component - CardMarket Reference Products
 * Layer 4: Views/Pages (Application Screens)
 * Following CLAUDE.md principles: Beautiful design, SRP, and integration with CardMarket reference data
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Filter,
  ExternalLink,
  Euro,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as cardMarketRefProductsApi from '../api/cardMarketRefProductsApi';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';

const SealedProductSearch: React.FC = () => {
  const [products, setProducts] = useState<ICardMarketReferenceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [setNameFilter, setSetNameFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0,
  });

  const itemsPerPage = 20;

  // Available categories from your backend enum
  const categories = [
    'Blisters',
    'Booster-Boxes',
    'Boosters',
    'Bundle',
    'Collection-Boxes',
    'Elite-Trainer-Boxes',
    'Starter-Decks',
    'Theme-Decks',
    'Tins',
  ];

  // Fetch CardMarket reference products with pagination using optimized search
  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      log('Fetching CardMarket reference products with params:', {
        page,
        limit: itemsPerPage,
        categoryFilter,
        setNameFilter,
        availableOnly,
        searchTerm,
      });

      let fetchedProducts: ICardMarketReferenceProduct[] = [];
      let paginationData = {
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
      };

      if (searchTerm.trim()) {
        // Use optimized search when there's a search term
        const optimizedParams: cardMarketRefProductsApi.OptimizedProductSearchParams = {
          query: searchTerm.trim(),
          page,
          limit: itemsPerPage,
          ...(categoryFilter && { category: categoryFilter }),
          ...(setNameFilter && { setName: setNameFilter }),
          ...(availableOnly && { availableOnly: true }),
        };

        const optimizedResponse =
          await cardMarketRefProductsApi.searchProductsOptimized(optimizedParams);
        fetchedProducts = optimizedResponse.data;

        // Calculate pagination for optimized search
        const totalResults = optimizedResponse.count;
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        paginationData = {
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          total: totalResults,
        };
      } else {
        // Use paginated API when no search term (browsing/filtering)
        const params: cardMarketRefProductsApi.CardMarketRefProductsParams = {
          page,
          limit: itemsPerPage,
          ...(categoryFilter && { category: categoryFilter }),
          ...(setNameFilter && { setName: setNameFilter }),
          ...(availableOnly && { available: true }),
        };

        const response: cardMarketRefProductsApi.PaginatedCardMarketRefProductsResponse =
          await cardMarketRefProductsApi.getPaginatedCardMarketRefProducts(params);
        fetchedProducts = response.products;
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
        'CardMarket reference products fetched successfully:',
        fetchedProducts.length,
        'products',
        'page',
        paginationData.currentPage
      );
    } catch (error) {
      const errorMessage = 'Failed to fetch CardMarket reference products';
      setError(errorMessage);
      handleApiError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit
  const handleSearch = () => {
    fetchProducts(1); // Reset to page 1 when searching
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSetNameFilter('');
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
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Premium Page Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-4xl font-bold text-slate-900 tracking-wide mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                    Sealed Products Search
                  </h1>
                  <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                    Browse CardMarket reference products and pricing
                  </p>
                </div>
                <div className='flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl px-6 py-3 text-white shadow-xl'>
                  <Package className='w-6 h-6 mr-3' />
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>{pagination.total}</div>
                    <div className='text-sm opacity-90'>Total Products</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Premium Search Filters */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-teal-500/5'></div>
            <div className='relative z-10'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
                {/* Product Name Search */}
                <div className='lg:col-span-4'>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Product Name
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors duration-300 z-10' />
                    <input
                      type='text'
                      placeholder='Search product names...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='w-full pl-10 pr-4 py-3 text-base font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 focus:bg-white transition-all duration-300 hover:shadow-xl'
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className='lg:col-span-3'>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Category
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-teal-600 transition-colors duration-300 z-10' />
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className='w-full pl-10 pr-10 py-3 text-base font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-300 focus:bg-white transition-all duration-300 hover:shadow-xl appearance-none cursor-pointer'
                    >
                      <option value=''>All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.replace(/-/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10'>
                      <svg
                        className='w-5 h-5 text-slate-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Set Name Filter */}
                <div className='lg:col-span-3'>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Set Name
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <Package className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-600 transition-colors duration-300 z-10' />
                    <input
                      type='text'
                      placeholder='Filter by set name...'
                      value={setNameFilter}
                      onChange={e => setSetNameFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='w-full pl-10 pr-4 py-3 text-base font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-white transition-all duration-300 hover:shadow-xl'
                    />
                  </div>
                </div>

                {/* Action Buttons and Available Filter */}
                <div className='lg:col-span-2 flex flex-col gap-4'>
                  {/* Available Only Filter */}
                  <div className='flex flex-col justify-center'>
                    <label className='flex items-center space-x-3 cursor-pointer group'>
                      <div className='relative'>
                        <input
                          type='checkbox'
                          checked={availableOnly}
                          onChange={e => setAvailableOnly(e.target.checked)}
                          className='sr-only'
                        />
                        <div
                          className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                            availableOnly
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500'
                              : 'border-slate-300 bg-white group-hover:border-emerald-400'
                          }`}
                        >
                          {availableOnly && (
                            <svg
                              className='w-4 h-4 text-white absolute top-0.5 left-0.5'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className='text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors duration-300'>
                        Available Only
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-col gap-3'>
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className='w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                    >
                      {loading ? (
                        <div className='flex items-center justify-center'>
                          <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                          Searching...
                        </div>
                      ) : (
                        'Search'
                      )}
                    </button>
                    <button
                      onClick={handleClearFilters}
                      disabled={loading}
                      className='w-full bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Search Results */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-emerald-50/50'></div>
            <div className='p-8 relative z-10'>
              {loading && (
                <div className='flex justify-center items-center py-20'>
                  <div className='text-center'>
                    <LoadingSpinner size='lg' />
                    <p className='mt-4 text-slate-600 font-medium'>
                      Loading CardMarket products...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                    <Package className='w-10 h-10 text-red-500' />
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-3'>Error Loading Products</h3>
                  <p className='text-slate-600 font-medium mb-6 max-w-md mx-auto'>{error}</p>
                  <button
                    onClick={handleSearch}
                    className='bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300'
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && products.length === 0 && (
                <div className='text-center py-20'>
                  <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                    <Search className='w-10 h-10 text-slate-400' />
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-3'>No Products Found</h3>
                  <p className='text-slate-600 font-medium mb-6 max-w-md mx-auto'>
                    Try adjusting your search criteria to find more products.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className='bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300'
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {!loading && !error && products.length > 0 && (
                <>
                  {/* Results Header */}
                  <div className='flex items-center justify-between mb-8'>
                    <div>
                      <h2 className='text-2xl font-bold text-slate-900'>CardMarket Products</h2>
                      <p className='text-slate-600 font-medium mt-1'>
                        Showing {products.length} of {pagination.total} products
                        {pagination.totalPages > 1 &&
                          ` • Page ${pagination.currentPage} of ${pagination.totalPages}`}
                      </p>
                    </div>
                    <div className='flex items-center text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-xl'>
                      <Euro className='w-4 h-4 mr-2' />
                      <span>Prices in EUR → DKK conversion</span>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {products.map(product => (
                      <div
                        key={product._id}
                        className='bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden'
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                        <div className='relative z-10 space-y-4'>
                          <div>
                            <h3 className='font-bold text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300'>
                              {product.name}
                            </h3>
                            <p className='text-slate-600 font-medium mt-1'>{product.setName}</p>
                            <span className='inline-block px-3 py-1 text-xs font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full mt-2'>
                              {product.category?.replace('-', ' ') || 'Unknown'}
                            </span>
                          </div>

                          <div className='space-y-3 pt-3 border-t border-slate-200/50'>
                            {product.price && (
                              <div className='flex justify-between items-center'>
                                <span className='text-slate-600 font-medium'>Price:</span>
                                <div className='text-right'>
                                  <div className='font-bold text-slate-900'>
                                    {convertToDKK(parseFloat(product.price))} DKK
                                  </div>
                                  <div className='text-xs text-slate-500'>€{product.price}</div>
                                </div>
                              </div>
                            )}

                            <div className='flex justify-between items-center'>
                              <span className='text-slate-600 font-medium'>Available:</span>
                              <span
                                className={`font-bold px-2 py-1 rounded-lg text-sm ${
                                  product.available > 0
                                    ? 'text-emerald-700 bg-emerald-100'
                                    : 'text-red-700 bg-red-100'
                                }`}
                              >
                                {product.available > 0
                                  ? `${product.available} in stock`
                                  : 'Out of stock'}
                              </span>
                            </div>

                            {product.lastUpdated && (
                              <div className='text-xs text-slate-500 text-center pt-2'>
                                Updated: {new Date(product.lastUpdated).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {/* External Link */}
                          {product.url && (
                            <div className='pt-3 border-t border-slate-200/50'>
                              <a
                                href={product.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group/link'
                              >
                                <ExternalLink className='w-4 h-4 mr-2 group-hover/link:scale-110 transition-transform duration-300' />
                                View on CardMarket
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Premium Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className='mt-12 flex items-center justify-center'>
                      <div className='bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6'>
                        <div className='flex items-center space-x-4'>
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className='flex items-center px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg'
                          >
                            <ChevronLeft className='w-5 h-5 mr-2' />
                            Previous
                          </button>

                          <div className='flex items-center space-x-2'>
                            {/* Page numbers */}
                            {Array.from(
                              { length: Math.min(7, pagination.totalPages) },
                              (_, index) => {
                                let pageNumber;
                                if (pagination.totalPages <= 7) {
                                  pageNumber = index + 1;
                                } else if (pagination.currentPage <= 4) {
                                  pageNumber = index + 1;
                                } else if (pagination.currentPage >= pagination.totalPages - 3) {
                                  pageNumber = pagination.totalPages - 6 + index;
                                } else {
                                  pageNumber = pagination.currentPage - 3 + index;
                                }

                                const isCurrentPage = pageNumber === pagination.currentPage;
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => handlePageChange(pageNumber)}
                                    className={`w-12 h-12 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                                      isCurrentPage
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                                        : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className='flex items-center px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg'
                          >
                            Next
                            <ChevronRight className='w-5 h-5 ml-2' />
                          </button>
                        </div>

                        <div className='mt-4 text-center text-sm text-slate-600'>
                          Page {pagination.currentPage} of {pagination.totalPages} •{' '}
                          {pagination.total} total products
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SealedProductSearch;
