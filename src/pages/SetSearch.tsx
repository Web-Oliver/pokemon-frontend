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

interface PaginatedSetsResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sets: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
    total: 0
  });

  const itemsPerPage = 12;

  // Fetch sets with pagination and filters
  const fetchSets = async (params: SearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = {
        page: params.page || 1,
        limit: params.limit || itemsPerPage,
        ...(params.search && { search: params.search }),
        ...(params.year && { year: params.year })
      };

      log('Fetching sets with params:', requestParams);
      
      const response: PaginatedSetsResponse = await setsApi.getPaginatedSets(requestParams);
      
      setSets(response.sets);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
        total: response.total
      });

      log('Sets fetched successfully:', response.sets.length, 'sets');
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
      ...(yearFilter && { year: parseInt(yearFilter) })
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
      ...(yearFilter && { year: parseInt(yearFilter) })
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Set Search</h1>
              <p className="mt-1 text-gray-600">
                Search and browse Pokémon card sets
              </p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Package className="w-4 h-4 mr-1" />
              {pagination.total} sets available
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Set Name Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search sets by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="e.g. 1998"
                  value={yearFilter}
                  onChange={(e) => handleYearChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
              <button
                onClick={handleClearFilters}
                disabled={loading}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <Package className="mx-auto w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Sets</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button 
                  onClick={() => fetchSets()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && sets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Package className="mx-auto w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sets Found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria to find more sets.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && sets.length > 0 && (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Search Results ({pagination.total} sets)
                  </h2>
                  <div className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                </div>

                {/* Sets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  {sets.map((set) => (
                    <div
                      key={set._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {set.setName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {set.year}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Cards:</span>
                            <span className="font-medium">{set.totalCardsInSet || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">PSA Population:</span>
                            <span className="font-medium">{set.totalPsaPopulation || 0}</span>
                          </div>
                        </div>

                        {set.setUrl && (
                          <div className="pt-2 border-t border-gray-100">
                            <a
                              href={set.setUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View on PSA
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
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
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              pageNum === pagination.currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
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
  );
};

export default SetSearch;