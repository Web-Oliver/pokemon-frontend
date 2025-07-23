/**
 * Set Search Page Component
 * Layer 4: Views/Pages (Application Screens)
 * Following CLAUDE.md principles: Beautiful design, SRP, and integration with domain layer
 */

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import * as setsApi from '../api/setsApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Input from '../components/common/Input';

interface SearchParams {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}

const SetSearch: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0,
  });

  const itemsPerPage = 12;

  // Fetch sets with pagination and filters using optimized search when available
  const fetchSets = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const page = params.page || 1;
      const limit = params.limit || itemsPerPage;

      log('Fetching sets with params:', {
        page,
        limit,
        search: params.search,
        year: params.year,
      });

      let fetchedSets: any[] = [];
      let paginationData = {
        currentPage: page,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
      };

      if (params.search?.trim()) {
        // Use optimized search when there's a search term
        const optimizedParams: setsApi.OptimizedSetSearchParams = {
          query: params.search.trim(),
          page,
          limit,
          ...(params.year && { year: params.year }),
        };

        const optimizedResponse = await setsApi.searchSetsOptimized(optimizedParams);
        fetchedSets = optimizedResponse.data;

        // Calculate pagination for optimized search
        const totalResults = optimizedResponse.count;
        const totalPages = Math.ceil(totalResults / limit);
        paginationData = {
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          total: totalResults,
        };
      } else {
        // Use paginated API when no search term (browsing/filtering)
        const requestParams = {
          page,
          limit,
          ...(params.year && { year: params.year }),
        };

        const response: setsApi.PaginatedSetsResponse =
          await setsApi.getPaginatedSets(requestParams);
        fetchedSets = response.sets;
        paginationData = {
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage,
          total: response.total,
        };
      }

      setSets(fetchedSets);
      setPagination(paginationData);

      log('Sets fetched successfully:', fetchedSets.length, 'sets');
    } catch (error) {
      const errorMessage = 'Failed to fetch sets';
      setError(errorMessage);
      handleApiError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSets();
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Handle year filter change
  const handleYearChange = (value: string) => {
    setYearFilter(value);
  };

  // Handle search submit
  const handleSearch = () => {
    const params: SearchParams = {
      page: 1,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(yearFilter && { year: parseInt(yearFilter) }),
    };

    fetchSets(params);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setYearFilter('');
    fetchSets({ page: 1, limit: itemsPerPage });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const params: SearchParams = {
      page,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
      ...(yearFilter && { year: parseInt(yearFilter) }),
    };

    fetchSets(params);
  };

  // Handle Enter key in search inputs
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Premium Page Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-4xl font-bold text-slate-900 tracking-wide mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                    Set Search
                  </h1>
                  <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                    Discover and explore Pokémon card sets
                  </p>
                </div>
                <div className='flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl px-6 py-3 text-white shadow-xl'>
                  <Package className='w-6 h-6 mr-3' />
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>{pagination.total}</div>
                    <div className='text-sm opacity-90'>Sets Available</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Premium Search Filters */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-indigo-500/5'></div>
            <div className='relative z-10'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                {/* Set Name Search */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Set Name
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors duration-300' />
                    <Input
                      type='text'
                      placeholder='Search sets by name...'
                      value={searchTerm}
                      onChange={e => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='pl-12 pr-4 py-4 text-lg font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 focus:bg-white transition-all duration-300 hover:shadow-xl'
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Year
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300'></div>
                    <Calendar className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-600 transition-colors duration-300' />
                    <Input
                      type='number'
                      placeholder='e.g. 1998'
                      value={yearFilter}
                      onChange={e => handleYearChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='pl-12 pr-4 py-4 text-lg font-medium bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-300 focus:bg-white transition-all duration-300 hover:shadow-xl'
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3'>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className='w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
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
                    className='w-full bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Search Results */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5'></div>
            <div className='relative z-10 p-8'>
              {loading && (
                <div className='flex flex-col items-center py-16'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 flex items-center justify-center animate-pulse'>
                    <Package className='w-8 h-8 text-white' />
                  </div>
                  <LoadingSpinner size='lg' />
                  <p className='text-slate-600 font-medium mt-4'>Searching sets...</p>
                </div>
              )}

              {error && (
                <div className='text-center py-16'>
                  <div className='w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                    <Package className='w-8 h-8 text-white' />
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-3'>Error Loading Sets</h3>
                  <p className='text-slate-600 mb-6 max-w-md mx-auto'>{error}</p>
                  <button
                    onClick={() => fetchSets()}
                    className='bg-gradient-to-r from-red-600 to-rose-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300'
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && sets.length === 0 && (
                <div className='text-center py-16'>
                  <div className='w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl mx-auto mb-6 flex items-center justify-center'>
                    <Package className='w-8 h-8 text-white' />
                  </div>
                  <h3 className='text-2xl font-bold text-slate-900 mb-3'>No Sets Found</h3>
                  <p className='text-slate-600 mb-6 max-w-md mx-auto'>
                    Try adjusting your search criteria to discover more sets.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className='bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300'
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {!loading && !error && sets.length > 0 && (
                <>
                  {/* Premium Results Header */}
                  <div className='flex items-center justify-between mb-8'>
                    <h2 className='text-2xl font-bold text-slate-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                      Search Results ({pagination.total} sets)
                    </h2>
                    <div className='flex items-center bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl px-4 py-2'>
                      <span className='text-sm font-medium text-slate-600'>
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                    </div>
                  </div>

                  {/* Premium Sets Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8'>
                    {sets.map(set => (
                      <div
                        key={set._id}
                        className='group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden'
                      >
                        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                        <div className='relative z-10 space-y-4'>
                          <div className='border-b border-slate-200/50 pb-3'>
                            <h3 className='text-xl font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors duration-300'>
                              {set.setName}
                            </h3>
                            <p className='text-sm font-medium text-slate-500 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg px-3 py-1 inline-block mt-2'>
                              {set.year}
                            </p>
                          </div>

                          <div className='space-y-3'>
                            <div className='flex justify-between items-center py-2 px-3 bg-slate-50/80 rounded-lg'>
                              <span className='text-sm font-medium text-slate-600'>
                                Total Cards
                              </span>
                              <span className='text-lg font-bold text-slate-900'>
                                {set.totalCardsInSet || 0}
                              </span>
                            </div>
                            <div className='flex justify-between items-center py-2 px-3 bg-blue-50/80 rounded-lg'>
                              <span className='text-sm font-medium text-blue-600'>
                                PSA Population
                              </span>
                              <span className='text-lg font-bold text-blue-700'>
                                {set.totalPsaPopulation || 0}
                              </span>
                            </div>
                          </div>

                          {set.setUrl && (
                            <div className='pt-3 border-t border-slate-200/50'>
                              <a
                                href={set.setUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors duration-300'
                                onClick={e => e.stopPropagation()}
                              >
                                View on PSA
                                <Package className='w-4 h-4 ml-2' />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Premium Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className='flex items-center justify-between border-t border-slate-200/50 pt-8'>
                      <div className='flex items-center'>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPrevPage}
                          className='inline-flex items-center px-6 py-3 text-sm font-bold text-slate-600 bg-white/90 border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                        >
                          <ChevronLeft className='w-4 h-4 mr-2' />
                          Previous
                        </button>
                      </div>

                      <div className='flex items-center space-x-3'>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = pagination.currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-3 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${
                                pageNum === pagination.currentPage
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                                  : 'text-slate-600 bg-white/90 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <div className='flex items-center'>
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className='inline-flex items-center px-6 py-3 text-sm font-bold text-slate-600 bg-white/90 border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                        >
                          Next
                          <ChevronRight className='w-4 h-4 ml-2' />
                        </button>
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

export default SetSearch;
