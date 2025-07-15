/**
 * Search Page Component
 * 
 * Global search and discovery page for Pokémon cards and products.
 * Integrates with useSearch hook for real-time search functionality.
 * 
 * Following CLAUDE.md principles for beautiful, award-winning design.
 */

import React, { useEffect, useState } from 'react';
import { Search as SearchIcon, Filter, Star, Hash } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { ICardDocument } from '../domain/models/card';

interface ISearchCard extends ICardDocument {
  score?: number;
}
import LoadingSpinner from '../components/common/LoadingSpinner';

const Search: React.FC = () => {
  const {
    cardProductName,
    searchResults,
    suggestions,
    loading,
    searchMeta,
    error,
    updateCardProductName,
    handleSearch,
    handleSuggestionSelect,
    setActiveField,
    activeField,
    clearError
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'name' | 'popularity'>('relevance');

  // Parse URL query parameter on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query && query !== cardProductName) {
      updateCardProductName(query);
      handleSearch(query);
    }
  }, [cardProductName, handleSearch, updateCardProductName]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardProductName.trim()) {
      handleSearch(cardProductName.trim());
      // Update URL with search query
      const newUrl = `/search?q=${encodeURIComponent(cardProductName.trim())}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    handleSuggestionSelect(suggestion, 'cardProduct');
    handleSearch(suggestion);
    // Update URL with selected suggestion
    const newUrl = `/search?q=${encodeURIComponent(suggestion)}`;
    window.history.pushState({}, '', newUrl);
  };

  // Sort search results
  const sortedResults = React.useMemo(() => {
    if (!searchResults.length) return [];
    
    const sorted = [...searchResults];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.cardName.localeCompare(b.cardName));
      case 'popularity':
        return sorted.sort((a, b) => (b.psaTotalGradedForCard || 0) - (a.psaTotalGradedForCard || 0));
      case 'relevance':
      default:
        return sorted; // Assume backend returns results sorted by relevance
    }
  }, [searchResults, sortBy]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search & Discovery</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for Pokémon cards, sets, or products..."
                value={cardProductName}
                onChange={(e) => updateCardProductName(e.target.value)}
                onFocus={() => setActiveField('cardProduct')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Search Suggestions Dropdown */}
              {activeField === 'cardProduct' && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <SearchIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
            
            <button 
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-red-800">{error}</span>
                <button onClick={clearError} className="text-red-600 hover:text-red-800">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'name' | 'popularity')}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Search Results 
                {searchResults.length > 0 && (
                  <span className="text-gray-500 font-normal ml-2">
                    ({searchResults.length} results)
                  </span>
                )}
              </h2>
              {searchMeta && (
                <div className="text-sm text-gray-500">
                  {searchMeta.cached && '⚡ Cached'} 
                  {searchMeta.queryTime && ` • ${Date.now() - searchMeta.queryTime}ms`}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : sortedResults.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sortedResults.map((card) => {
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  return <CardSearchResult key={card.id || (card as any)._id} card={card as ISearchCard} />;
                })}
              </div>
            ) : cardProductName ? (
              <div className="text-center py-12">
                <SearchIcon className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your search terms or check the spelling.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Start your search</h3>
                <p className="mt-2 text-gray-500">
                  Enter a search term to find Pokémon cards, sets, or products.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Card Search Result Component
interface CardSearchResultProps {
  card: ISearchCard;
}

const CardSearchResult: React.FC<CardSearchResultProps> = ({ card }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Card Name and Variety */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{card.cardName}</h3>
          {card.variety && (
            <p className="text-xs text-gray-500">{card.variety}</p>
          )}
        </div>

        {/* Card Details */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <Hash className="w-3 h-3 mr-1" />
            #{card.pokemonNumber || 'N/A'}
          </div>
          {card.psaTotalGradedForCard && (
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {card.psaTotalGradedForCard.toLocaleString()}
            </div>
          )}
        </div>

        {/* PSA Grade Distribution (Top 3) */}
        {card.psaGrades && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Top PSA Grades:</p>
            <div className="flex space-x-2 text-xs">
              {Object.entries(card.psaGrades)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([grade, count]) => (
                  <span key={grade} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {grade.replace('psa_', 'PSA ')}: {count || 0}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Search Score (if available) */}
        {(card as ISearchCard).score && (
          <div className="text-xs text-gray-500">
            Relevance: {(((card as ISearchCard).score || 0) * 100 / 25).toFixed(0)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;