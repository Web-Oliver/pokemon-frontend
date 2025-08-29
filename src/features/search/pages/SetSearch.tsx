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
import React, { useCallback, useEffect, useState } from 'react';
import { PokemonInput } from '../../../shared/components/atoms/design-system/PokemonInput';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer, PokemonCard, PokemonButton } from '../../../shared/components/atoms/design-system';
import { usePaginatedSearch } from '../../../shared/hooks/usePaginatedSearch';
import { navigationHelper } from '../../../shared/utils/navigation';

// Search parameters interface now handled by usePaginatedSearch

const SetSearch: React.FC = () => {
  const {
    items: sets,
    pagination,
    loading,
    error,
    searchSets,
    setPage,
    clearError,
  } = usePaginatedSearch();

  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const itemsPerPage = 12;

  // SRP: Search operation using shared hook - no more duplicate HTTP logic
  const performSearch = useCallback(
    async (params: any) => {
      await searchSets({
        query: params.search || '', // Pass query parameter as expected by API
        search: params.search,
        year: params.year?.toString(),
        page: params.page || 1,
        limit: params.limit || itemsPerPage,
      });
    },
    [searchSets]
  );

  // Initial load using shared hook - FIXED: Remove performSearch dependency to prevent infinite loop
  useEffect(() => {
    // Load initial data - empty query will trigger "show all" behavior in backend
    searchSets({
      query: '', // Empty query for initial load (backend converts this to '*')
      page: 1,
      limit: itemsPerPage,
    });
  }, [searchSets]); // Only depend on searchSets

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
    const params: any = {
      page: 1,
      limit: itemsPerPage,
      ...(searchTerm && { search: searchTerm }),
    };

    // Add year filter with validation
    if (yearFilter) {
      const year = parseInt(yearFilter);
      if (year >= 1900 && year <= 2035) {
        params.year = year;
      }
    }

    performSearch(params);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setYearFilter('');
    performSearch({ page: 1, limit: itemsPerPage });
  };

  // Handle pagination using shared hook
  const handlePageChange = (page: number) => {
    setPage(page);
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
      <div className="bg-gradient-to-r from-[var(--theme-accent-primary)]/10 via-[var(--theme-accent-secondary)]/10 to-[var(--theme-accent-primary)]/10 p-4 rounded-3xl shadow-lg backdrop-blur-sm border border-[var(--theme-accent-primary)]/20">
        <Package className="w-8 h-8 text-[var(--theme-accent-primary)]" />
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-[var(--theme-text-primary)]">
          {sets?.length || 0}
        </div>
        <div className="text-sm text-[var(--theme-text-muted)] font-medium">
          Sets Found
        </div>
      </div>
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
                    Set Search
                  </h1>
                  <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                    Discover and explore Pokémon card sets with premium filtering
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {statsActions}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            </PokemonCard>
          )}

          {/* Search Filters */}
          {!loading && (
            <PokemonCard variant="glass" size="lg" className="relative">
              <div className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Set Name Search */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-cyan-200 mb-3 tracking-wide">
                      Set Name
                    </label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/70 w-5 h-5 group-focus-within:text-cyan-300 transition-colors duration-300" />
                      <PokemonInput
                        type="text"
                        placeholder="Search sets by name..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-12 pr-4 py-4 text-lg font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 hover:shadow-xl text-white placeholder-cyan-200/50"
                      />
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-200 mb-3 tracking-wide">
                      Year
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-300/70 w-5 h-5 group-focus-within:text-cyan-300 transition-colors duration-300" />
                      <PokemonInput
                        type="number"
                        placeholder="e.g. 1998"
                        value={yearFilter}
                        onChange={(e) => handleYearChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-12 pr-4 py-4 text-lg font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 hover:shadow-xl text-white placeholder-cyan-200/50"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col justify-end space-y-3">
                    <PokemonButton
                      variant="primary"
                      size="default"
                      onClick={handleSearch}
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search
                    </PokemonButton>
                    <PokemonButton
                      variant="glass"
                      size="default"
                      onClick={handleClearFilters}
                    >
                      Clear
                    </PokemonButton>
                  </div>
                </div>
              </div>
            </PokemonCard>
          )}

          {/* Results Section */}
          {!loading && (
            <PokemonCard variant="glass" size="xl" className="relative">
              <div className="relative z-10">
                {sets && sets.length > 0 ? (
                  <>
                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                      {sets.map((set: any) => (
                        <PokemonCard
                          key={set._id}
                          variant="glass"
                          size="default"
                          interactive
                          onClick={() => handleSetClick(set._id)}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-3 rounded-2xl">
                              <Package className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div className="text-sm font-bold text-cyan-200/70 bg-white/10 px-3 py-1 rounded-full">
                              {set.year || 'Unknown'}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                            {set.setName}
                          </h3>
                          <div className="space-y-2 text-sm text-cyan-100/70">
                            {set.totalCardsInSet && (
                              <div className="flex justify-between">
                                <span>Total Cards:</span>
                                <span className="font-semibold">
                                  {set.totalCardsInSet}
                                </span>
                              </div>
                            )}
                            {set.total_grades?.total_graded && (
                              <div className="flex justify-between">
                                <span>PSA Population:</span>
                                <span className="font-semibold">
                                  {set.total_grades.total_graded}
                                </span>
                              </div>
                            )}
                          </div>
                        </PokemonCard>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-cyan-100/70 font-medium">
                          Page {pagination.currentPage} of {pagination.totalPages} (
                          {pagination.total} total sets)
                        </div>
                        <div className="flex items-center space-x-3">
                          <PokemonButton
                            variant="glass"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPrevPage}
                          >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </PokemonButton>
                          <PokemonButton
                            variant="glass"
                            size="sm"
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={!pagination.hasNextPage}
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </PokemonButton>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-cyan-300/50 mx-auto mb-4" />
                    <p className="text-xl text-white font-medium">
                      No sets found
                    </p>
                    <p className="text-sm text-cyan-100/70 mt-2">
                      Try adjusting your search criteria
                    </p>
                  </div>
                )}
              </div>
            </PokemonCard>
          )}
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default SetSearch;
