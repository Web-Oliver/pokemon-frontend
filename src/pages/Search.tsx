/**
 * Search Page Component - Context7 Award-Winning Design
 *
 * Ultra-premium search and discovery experience with stunning visual hierarchy.
 * Features real-time search, glass-morphism, and award-winning Context7 patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning search experience with micro-interactions
 * - Premium glass-morphism and depth effects
 * - Context7 design system compliance
 * - Stunning animations and hover states
 */

import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import SearchDropdown from '../components/search/SearchDropdown';
import SearchResultsCards from '../components/search/SearchResultsCards';

const Search: React.FC = () => {
  const {
    cardProductName,
    searchResults,
    suggestions,
    loading,
    searchMeta,
    error,
    selectedSet,
    selectedCategory,
    updateCardProductName,
    handleSearch,
    handleSuggestionSelect,
    setActiveField,
    activeField,
    clearError,
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'popularity'>('relevance');
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Parse URL query parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query && query !== cardProductName) {
      updateCardProductName(query);
      handleSearch(query);
      setHasSearched(true);
      setShowDropdown(false);
    }
  }, [cardProductName, handleSearch, updateCardProductName]);

  // Handle input focus for dropdown
  const handleInputFocus = () => {
    setActiveField('cardProduct');
    setShowDropdown(true);
  };

  // Handle input blur for dropdown
  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
      setActiveField(null);
    }, 200);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateCardProductName(value);

    // Show dropdown when typing, hide search results if no search has been performed
    if (value.length > 0) {
      setShowDropdown(true);
      setActiveField('cardProduct');
    } else {
      setShowDropdown(false);
      setActiveField(null);
      setHasSearched(false); // Reset search state when input is cleared
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardProductName.trim()) {
      handleSearch(cardProductName.trim());
      setHasSearched(true);
      setShowDropdown(false); // Hide dropdown when searching
      setActiveField(null); // Clear active field
      // Update URL with search query
      const newUrl = `/search?q=${encodeURIComponent(cardProductName.trim())}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  // Handle suggestion selection - Context7 pattern
  const handleSuggestionClick = (suggestion: { cardName?: string; name?: string } | string) => {
    const searchTerm =
      typeof suggestion === 'string' ? suggestion : suggestion.cardName || suggestion.name || '';
    handleSuggestionSelect(suggestion, 'cardProduct');
    handleSearch(searchTerm);
    setHasSearched(true);
    setShowDropdown(false); // Hide dropdown when selecting
    setActiveField(null); // Clear active field
    // Update URL with selected suggestion
    const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Sort search results
  const sortedResults = React.useMemo(() => {
    if (!searchResults.length) {
      return [];
    }

    const sorted = [...searchResults];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.cardName.localeCompare(b.cardName));
      case 'popularity':
        return sorted.sort(
          (a, b) => (b.psaTotalGradedForCard || 0) - (a.psaTotalGradedForCard || 0)
        );
      case 'relevance':
      default:
        return sorted; // Assume backend returns results sorted by relevance
    }
  }, [searchResults, sortBy]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.04'%3E%3Cpath d='M50 50c0-27.614-22.386-50-50-50s-50 22.386-50 50 22.386 50 50 50 50-22.386 50-50zm50-50c0-27.614-22.386-50-50-50s-50 22.386-50 50 22.386 50 50 50 50-22.386 50-50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-8'>
          {/* Context7 Premium Search Header */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5'></div>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500'></div>

            <div className='relative z-10'>
              <div className='flex items-center mb-6'>
                <div className='w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center mr-4'>
                  <SearchIcon className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent'>
                    Search & Discovery
                  </h1>
                  <p className='text-slate-600 font-medium'>
                    Find your perfect Pokémon cards and products
                  </p>
                </div>
              </div>

              {/* Context7 Premium Search Bar */}
              <form onSubmit={handleSearchSubmit} className='flex space-x-6'>
                <div className='flex-1 relative group'>
                  <div className='absolute left-4 top-1/2 transform -translate-y-1/2 z-10'>
                    <SearchIcon className='text-slate-400 w-6 h-6 group-focus-within:text-indigo-500 transition-colors duration-300' />
                  </div>
                  <input
                    type='text'
                    placeholder='Search for Pokémon cards, sets, or products...'
                    value={cardProductName}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className='w-full pl-14 pr-6 py-4 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white outline-none transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium text-lg'
                  />
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none'></div>

                  {/* Context7 Award-Winning Search Dropdown */}
                  <SearchDropdown
                    suggestions={suggestions}
                    isVisible={showDropdown && !hasSearched}
                    activeField={activeField}
                    onSuggestionSelect={handleSuggestionClick}
                    onClose={() => {
                      setShowDropdown(false);
                      setActiveField(null);
                    }}
                    searchTerm={cardProductName}
                  />
                </div>

                <button
                  type='submit'
                  className='px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg group'
                >
                  <span className='group-hover:scale-105 transition-transform duration-300'>
                    Search
                  </span>
                </button>

                <button
                  type='button'
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center px-6 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group'
                >
                  <Filter className='w-5 h-5 mr-2 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300' />
                  <span className='font-semibold text-slate-700 group-hover:text-slate-900'>
                    Filters
                  </span>
                </button>
              </form>

              {/* Context7 Premium Error Display */}
              {error && (
                <div className='mt-6 p-6 bg-gradient-to-r from-red-50/80 to-pink-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl relative overflow-hidden'>
                  <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500'></div>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center'>
                      <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg flex items-center justify-center mr-3'>
                        <span className='text-white font-bold text-sm'>!</span>
                      </div>
                      <span className='text-red-800 font-medium'>{error}</span>
                    </div>
                    <button
                      onClick={clearError}
                      className='w-8 h-8 text-red-600 hover:text-red-800 hover:bg-white/60 rounded-xl transition-all duration-300 flex items-center justify-center'
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Context7 Premium Filters Panel */}
              {showFilters && (
                <div className='mt-6 p-6 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl border border-slate-200/50'>
                  <div className='flex items-center space-x-6'>
                    <label className='text-sm font-bold text-slate-700 tracking-wide'>
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={e =>
                        setSortBy(e.target.value as 'relevance' | 'name' | 'popularity')
                      }
                      className='px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 outline-none transition-all duration-300 font-medium text-slate-700'
                    >
                      <option value='relevance'>Relevance</option>
                      <option value='name'>Name</option>
                      <option value='popularity'>Popularity</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context7 Premium Search Results Cards - Only show when search has been performed */}
          {hasSearched && (
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
              <div className='p-8 relative z-10'>
                <SearchResultsCards
                  results={sortedResults}
                  loading={loading}
                  error={error}
                  searchMeta={{
                    ...searchMeta,
                    hierarchical: !!(selectedSet || selectedCategory),
                    contextApplied: {
                      set: !!selectedSet,
                      category: !!selectedCategory,
                    },
                  }}
                  searchTerm={cardProductName}
                  onResultClick={(result, position) => {
                    // Context7 pattern: Track click analytics
                    console.log(`[SEARCH ANALYTICS] Result clicked:`, {
                      resultId: result.id,
                      position,
                      searchTerm: cardProductName,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  showResultStats={true}
                  sortBy={sortBy}
                  onSortChange={newSortBy =>
                    setSortBy(newSortBy as 'relevance' | 'name' | 'popularity')
                  }
                  currentPage={1}
                  totalPages={1}
                  onPageChange={page => {
                    // Pagination logic would go here
                    console.log('Page changed to:', page);
                  }}
                />
              </div>
            </div>
          )}

          {/* Context7 Premium Landing State - Show when no search has been performed */}
          {!hasSearched && !showDropdown && (
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-indigo-50/50'></div>
              <div className='p-16 text-center relative z-10'>
                <div className='w-24 h-24 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8 relative'>
                  <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl animate-pulse'></div>
                  <SearchIcon className='w-12 h-12 text-indigo-500 relative z-10' />
                </div>

                <h3 className='text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4'>
                  Discover Your Collection
                </h3>
                <p className='text-slate-600 font-medium mb-8 max-w-lg mx-auto text-lg leading-relaxed'>
                  Search through thousands of premium Pokémon cards, sets, and products. Use the
                  search bar above to get started.
                </p>

                {/* Context7 Premium Quick Search Suggestions */}
                <div className='flex flex-wrap justify-center gap-4'>
                  {['Charizard', 'Base Set', 'Pikachu', 'Jungle', 'Fossil'].map((term, index) => (
                    <button
                      key={term}
                      onClick={() => {
                        updateCardProductName(term);
                        handleSearch(term);
                        setHasSearched(true);
                      }}
                      className='px-6 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/50 hover:border-indigo-300 rounded-2xl text-sm font-bold text-indigo-700 hover:text-indigo-800 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm group relative overflow-hidden'
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      <span className='relative z-10'>{term}</span>
                    </button>
                  ))}
                </div>

                {/* Premium stats display */}
                <div className='mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-slate-900'>10K+</div>
                    <div className='text-sm text-slate-600 font-medium'>Cards</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-slate-900'>500+</div>
                    <div className='text-sm text-slate-600 font-medium'>Sets</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-slate-900'>1K+</div>
                    <div className='text-sm text-slate-600 font-medium'>Products</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
