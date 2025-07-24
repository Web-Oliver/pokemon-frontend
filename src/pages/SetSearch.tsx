/**
 * Set Search Page Component
 * Layer 4: Views/Pages (Application Screens)
 * Refactored to use CLAUDE.md consolidated components and hooks
 */

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Package,
  Search,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import * as setsApi from '../api/setsApi';
import Input from '../components/common/Input';
import { PageLayout } from '../components/layouts/PageLayout';
import { useFetchCollectionItems } from '../hooks/useFetchCollectionItems';
import { usePageLayout } from '../hooks/usePageLayout';
import { log } from '../utils/logger';
import { navigationHelper } from '../utils/navigation';

interface SearchParams {
  page?: number;
  limit?: number;
  year?: number;
  search?: string;
}

const SetSearch: React.FC = () => {
  const { loading, error, handleAsyncAction } = usePageLayout();
  const { items: sets, setItems: setSets } = useFetchCollectionItems({
    initialData: [],
  });

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

  // Fetch sets with pagination and filters
  const fetchSets = async (params: SearchParams = {}) => {
    await handleAsyncAction(async () => {
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

        const optimizedResponse =
          await setsApi.searchSetsOptimized(optimizedParams);
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
        // Use paginated API when no search term
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
      return fetchedSets;
    });
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

  // Handle key press for search
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle set click to navigate to details
  const handleSetClick = (setId: string) => {
    navigationHelper.navigateTo(`/sets/${setId}`);
  };

  const statsActions = (
    <div className="flex items-center space-x-3">
      <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-cyan-200/20">
        <Package className="w-8 h-8 text-cyan-400" />
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-zinc-100">
          {sets?.length || 0}
        </div>
        <div className="text-sm text-zinc-400 font-medium">Sets Found</div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Set Search"
      subtitle="Discover and explore Pokémon card sets with premium filtering"
      loading={loading}
      error={error}
      actions={statsActions}
      variant="default"
    >
      {/* Premium Search Filters */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5"></div>
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Set Name Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-300 mb-3 tracking-wide">
                Set Name
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors duration-300" />
                <Input
                  type="text"
                  placeholder="Search sets by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-4 text-lg font-medium bg-zinc-800/90 backdrop-blur-sm border border-zinc-600/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-zinc-800 transition-all duration-300 hover:shadow-xl text-zinc-100"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-3 tracking-wide">
                Year
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors duration-300" />
                <Input
                  type="number"
                  placeholder="e.g. 1998"
                  value={yearFilter}
                  onChange={(e) => handleYearChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-4 text-lg font-medium bg-zinc-800/90 backdrop-blur-sm border border-zinc-600/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-300 focus:bg-zinc-800 transition-all duration-300 hover:shadow-xl text-zinc-100"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-end space-y-3">
              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 font-bold tracking-wide"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-zinc-200 px-6 py-4 rounded-2xl transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 font-bold tracking-wide border border-zinc-500/50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5"></div>
        <div className="relative z-10">
          {sets && sets.length > 0 ? (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {sets.map((set: any) => (
                  <div
                    key={set._id}
                    onClick={() => handleSetClick(set._id)}
                    className="bg-zinc-800/90 backdrop-blur-sm rounded-3xl shadow-lg border border-zinc-700/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 rounded-2xl">
                          <Package className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="text-sm font-bold text-zinc-400 bg-zinc-700/80 px-3 py-1 rounded-full">
                          {set.year || 'Unknown'}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                        {set.setName}
                      </h3>
                      <div className="space-y-2 text-sm text-zinc-400">
                        {set.totalCardsInSet && (
                          <div className="flex justify-between">
                            <span>Total Cards:</span>
                            <span className="font-semibold">
                              {set.totalCardsInSet}
                            </span>
                          </div>
                        )}
                        {set.totalPsaPopulation && (
                          <div className="flex justify-between">
                            <span>PSA Population:</span>
                            <span className="font-semibold">
                              {set.totalPsaPopulation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-400 font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages} (
                    {pagination.total} total sets)
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage}
                      className="inline-flex items-center px-6 py-3 text-sm font-bold text-zinc-300 bg-zinc-800/90 border border-zinc-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage}
                      className="inline-flex items-center px-6 py-3 text-sm font-bold text-zinc-300 bg-zinc-800/90 border border-zinc-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
              <p className="text-xl text-zinc-300 font-medium">No sets found</p>
              <p className="text-sm text-zinc-400 mt-2">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SetSearch;
