/**
 * SearchResultsCards Component - Context7 Award-Winning Card Display
 *
 * Premium card-based search results with stunning visual design:
 * - Modern card layouts with advanced hover effects
 * - Responsive grid with intelligent spacing
 * - Rich result metadata with performance analytics
 * - Advanced loading and empty states
 * - Context7 award-winning animations and micro-interactions
 *
 * Following CLAUDE.md principles - separate from dropdown suggestions
 */

import React from 'react';
import { Search, Star, Calendar, Package, Hash, TrendingUp, ArrowRight } from 'lucide-react';
import { ICard } from '../../domain/models/card';

interface SearchResultsCardsProps {
  results: ICard[];
  loading: boolean;
  error: string | null;
  searchMeta?: {
    cached?: boolean;
    hitRate?: number;
    queryTime?: number;
    hierarchical?: boolean;
    contextApplied?: {
      set?: boolean;
      category?: boolean;
    };
  };
  searchTerm: string;
  onResultClick?: (result: ICard, position: number) => void;
  showResultStats?: boolean;
  sortBy?: 'relevance' | 'name' | 'popularity';
  onSortChange?: (sortBy: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const SearchResultsCards: React.FC<SearchResultsCardsProps> = ({
  results,
  loading,
  error,
  searchMeta,
  searchTerm,
  onResultClick,
  showResultStats = true,
  sortBy = 'relevance',
  onSortChange,
}) => {
  // Context7 Award-Winning Design: Track user interactions for search optimization
  const triggerClickAnalytics = (result: ICard, position: number) => {
    if (onResultClick) {
      onResultClick(result, position);
    }

    // Track click event with comprehensive metadata
    console.log(`[SEARCH ANALYTICS] Result clicked:`, {
      resultId: result.id,
      position,
      searchTerm,
      timestamp: new Date().toISOString(),
      userAction: 'result_click',
      contextFilters: searchMeta?.contextApplied,
    });
  };

  // Context7 Award-Winning Design: Premium result statistics with advanced metrics
  const renderResultStats = () => {
    if (!showResultStats || !results.length) {
      return null;
    }

    return (
      <div className='relative mb-8 p-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-lg'>
        {/* Animated background elements */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20 rounded-2xl'></div>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-2xl'></div>

        <div className='relative flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0'>
          {/* Left section: Results and performance */}
          <div className='flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8'>
            {/* Primary result count */}
            <div className='flex items-center space-x-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
                <TrendingUp className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm text-gray-600 font-medium'>Search Results</p>
                <p className='text-2xl font-bold text-gray-900'>
                  <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    {results.length.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Performance metrics */}
            <div className='flex items-center space-x-6'>
              {searchMeta?.queryTime && (
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                    <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Query Time</p>
                    <p className='text-sm font-bold text-green-700'>
                      {Math.min(searchMeta.queryTime, 9999)}ms
                    </p>
                  </div>
                </div>
              )}

              {searchMeta?.hitRate && (
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Hit Rate</p>
                    <p className='text-sm font-bold text-purple-700'>
                      {(searchMeta.hitRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {searchMeta?.cached && (
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center'>
                    <span className='text-yellow-600 text-xs'>⚡</span>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500'>Status</p>
                    <p className='text-sm font-bold text-yellow-700'>Cached</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center section: Active filters */}
          {searchMeta?.hierarchical && searchMeta.contextApplied && (
            <div className='flex flex-wrap items-center gap-3'>
              <span className='text-sm font-medium text-gray-700'>Active Filters:</span>
              {searchMeta.contextApplied.set && (
                <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-full shadow-sm'>
                  <Package className='w-4 h-4 text-emerald-600 mr-2' />
                  <span className='text-sm font-semibold text-emerald-800'>Set filtered</span>
                </div>
              )}
              {searchMeta.contextApplied.category && (
                <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full shadow-sm'>
                  <Hash className='w-4 h-4 text-purple-600 mr-2' />
                  <span className='text-sm font-semibold text-purple-800'>Category filtered</span>
                </div>
              )}
            </div>
          )}

          {/* Right section: Sort control */}
          {onSortChange && (
            <div className='flex items-center space-x-3'>
              <label className='text-sm font-semibold text-gray-700'>Sort by:</label>
              <div className='relative'>
                <select
                  value={sortBy}
                  onChange={e => onSortChange(e.target.value)}
                  className='appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer'
                >
                  <option value='relevance'>Relevance</option>
                  <option value='name'>Name A-Z</option>
                  <option value='popularity'>Most Popular</option>
                </select>
                <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                  <svg
                    className='w-4 h-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M19 9l-7 7-7-7'
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Context7 Award-Winning Design: Premium card layout with advanced interactions
  const renderResultCard = (result: ICard, index: number) => (
    <div
      key={result.id}
      onClick={() => triggerClickAnalytics(result, index)}
      className='group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-blue-300 overflow-hidden transform hover:-translate-y-1'
    >
      {/* Premium gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/40 group-hover:via-purple-50/20 group-hover:to-pink-50/40 transition-all duration-500'></div>

      {/* Animated border effect */}
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500'></div>
      <div className='absolute inset-[1px] rounded-2xl bg-white'></div>

      <div className='relative p-6'>
        {/* Header with position badge */}
        <div className='flex items-start justify-between mb-6'>
          <div className='flex-1 min-w-0'>
            {/* Card title with premium typography */}
            <h3 className='text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors duration-300 leading-tight'>
              {result.cardName}
            </h3>

            {/* Quick stats bar */}
            <div className='flex items-center space-x-4 mb-4'>
              {result.pokemonNumber && (
                <div className='flex items-center'>
                  <div className='w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-2'>
                    <Hash className='w-4 h-4 text-blue-600' />
                  </div>
                  <span className='text-sm font-semibold text-gray-700'>
                    {result.pokemonNumber}
                  </span>
                </div>
              )}

              {result.psaTotalGradedForCard > 0 && (
                <div className='flex items-center'>
                  <div className='w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mr-2'>
                    <TrendingUp className='w-4 h-4 text-purple-600' />
                  </div>
                  <span className='text-sm font-semibold text-gray-700'>
                    {result.psaTotalGradedForCard.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Premium position indicator */}
          <div className='flex flex-col items-center'>
            <div className='w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
              <span className='text-white text-xs font-bold'>#{index + 1}</span>
            </div>
            <div className='text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              Rank
            </div>
          </div>
        </div>

        {/* Enhanced metadata section */}
        <div className='space-y-3 mb-6'>
          {/* Base name if different */}
          {result.baseName && result.baseName !== result.cardName && (
            <div className='flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl'>
              <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
              <span className='text-sm text-gray-600'>Base:</span>
              <span className='text-sm font-semibold text-gray-800 ml-2'>{result.baseName}</span>
            </div>
          )}

          {/* Variety with premium styling */}
          {result.variety && (
            <div className='flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl'>
              <Star className='w-4 h-4 text-yellow-500 mr-3' />
              <span className='text-sm text-gray-600'>Variety:</span>
              <span className='text-sm font-semibold text-gray-800 ml-2 italic'>
                {result.variety}
              </span>
            </div>
          )}
        </div>

        {/* PSA Population highlight */}
        {result.psaTotalGradedForCard > 0 && (
          <div className='relative mb-6 p-4 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl border border-purple-200'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3'>
                  <TrendingUp className='w-5 h-5 text-white' />
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-800'>PSA Population</p>
                  <p className='text-lg font-bold text-purple-700'>
                    {result.psaTotalGradedForCard.toLocaleString()}
                  </p>
                </div>
              </div>

              {result.psaTotalGradedForCard > 1000 && (
                <div className='px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full'>
                  <span className='text-xs font-bold text-white'>🔥 HOT</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium set badge */}
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full border border-emerald-200'>
              <Package className='w-4 h-4 text-emerald-600 mr-2' />
              <span className='text-sm font-semibold text-emerald-800'>
                {result.setId || 'Unknown Set'}
              </span>
            </div>
          </div>

          {/* Premium CTA */}
          <div className='opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0'>
            <div className='flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white shadow-lg'>
              <span className='text-xs font-bold mr-1'>View</span>
              <ArrowRight className='w-3 h-3' />
            </div>
          </div>
        </div>

        {/* Premium footer */}
        <div className='mt-6 pt-4 border-t border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center text-xs text-gray-500'>
              <Calendar className='w-3 h-3 mr-1' />
              <span>Result #{index + 1}</span>
            </div>

            <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
              <div
                className='w-2 h-2 bg-purple-400 rounded-full animate-pulse'
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className='w-2 h-2 bg-pink-400 rounded-full animate-pulse'
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Context7 Award-Winning Design: Enhanced no results state
  const renderNoResults = () => (
    <div className='text-center py-16 px-4'>
      <div className='max-w-md mx-auto'>
        <div className='w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Search className='w-10 h-10 text-gray-400' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900 mb-2'>No results found</h3>
        <p className='text-gray-600 mb-6'>
          We couldn't find any cards matching "
          <strong className='text-gray-900'>{searchTerm}</strong>"
        </p>

        {/* Actionable suggestions */}
        <div className='bg-gray-50 rounded-lg p-4 text-left'>
          <h4 className='font-medium text-gray-900 mb-3'>Try these suggestions:</h4>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-center'>
              <div className='w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0'></div>
              Check your spelling and try again
            </li>
            <li className='flex items-center'>
              <div className='w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0'></div>
              Use different or broader search terms
            </li>
            <li className='flex items-center'>
              <div className='w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0'></div>
              Try searching for a Pokémon name or set
            </li>
            {searchMeta?.contextApplied && (
              <li className='flex items-center'>
                <div className='w-2 h-2 bg-orange-400 rounded-full mr-3 flex-shrink-0'></div>
                Remove active filters to see more results
              </li>
            )}
          </ul>
        </div>

        {/* Popular suggestions */}
        <div className='mt-6'>
          <p className='text-sm text-gray-500'>
            Popular searches: Charizard, Pikachu, Base Set, Jungle
          </p>
        </div>
      </div>
    </div>
  );

  // Context7 Award-Winning Design: Enhanced loading state
  const renderLoadingState = () => (
    <div className='space-y-6'>
      {/* Loading statistics bar */}
      <div className='p-4 bg-gray-50 rounded-lg border animate-pulse'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='w-4 h-4 bg-gray-300 rounded'></div>
            <div className='h-4 bg-gray-300 rounded w-32'></div>
            <div className='h-3 bg-gray-200 rounded w-16'></div>
          </div>
          <div className='h-8 bg-gray-300 rounded w-24'></div>
        </div>
      </div>

      {/* Loading result cards */}
      <div className='grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
        {[...Array(8)].map((_, i) => (
          <div key={i} className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='animate-pulse'>
              <div className='flex justify-between items-start mb-4'>
                <div className='flex-1'>
                  <div className='h-6 bg-gray-300 rounded w-3/4 mb-3'></div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-4 bg-gray-200 rounded w-2/3'></div>
                  </div>
                </div>
                <div className='w-8 h-6 bg-gray-200 rounded-full'></div>
              </div>

              <div className='h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mb-4'></div>

              <div className='flex space-x-2'>
                <div className='h-6 bg-gray-200 rounded-full w-20'></div>
                <div className='h-6 bg-gray-200 rounded-full w-16'></div>
              </div>

              <div className='flex justify-between items-center mt-4 pt-3 border-t border-gray-100'>
                <div className='h-3 bg-gray-200 rounded w-16'></div>
                <div className='h-3 bg-gray-200 rounded w-20'></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator with text */}
      <div className='text-center py-8'>
        <div className='inline-flex items-center space-x-2 text-gray-600'>
          <div className='animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full'></div>
          <span className='text-sm font-medium'>Searching for results...</span>
        </div>
      </div>
    </div>
  );

  // Context7 Award-Winning Design: Comprehensive error handling
  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-xl p-6 my-4'>
        <div className='flex items-start space-x-4'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
              <Search className='w-4 h-4 text-red-600' />
            </div>
          </div>
          <div className='flex-1'>
            <h3 className='text-lg font-semibold text-red-900 mb-2'>Search Error</h3>
            <p className='text-red-800 mb-4'>{error}</p>

            <div className='bg-white rounded-lg p-4 border border-red-200'>
              <h4 className='font-medium text-red-900 mb-2'>What you can try:</h4>
              <ul className='space-y-1 text-sm text-red-700'>
                <li>• Check your internet connection</li>
                <li>• Try refreshing the page</li>
                <li>• Simplify your search terms</li>
                <li>• Remove any applied filters</li>
              </ul>
            </div>

            <div className='mt-4'>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors'
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return renderLoadingState();
  }

  // Context7 Award-Winning Design: Main render with optimized layout
  return (
    <div className='space-y-6'>
      {/* Result statistics and controls */}
      {renderResultStats()}

      {/* Results grid or no results */}
      {results.length === 0 ? (
        renderNoResults()
      ) : (
        <>
          {/* Results grid with responsive layout */}
          <div className='grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
            {results.map((result, index) => renderResultCard(result, index))}
          </div>

          {/* Result summary footer */}
          <div className='text-center py-4 border-t border-gray-200'>
            <p className='text-sm text-gray-600'>
              Showing <strong>{results.length}</strong> of <strong>{results.length}</strong> results
              {searchMeta?.queryTime && (
                <span> • Search completed in {Math.min(searchMeta.queryTime, 9999)}ms</span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResultsCards;
