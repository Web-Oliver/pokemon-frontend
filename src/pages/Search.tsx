/**
 * Search Page Component
 * 
 * Global search and discovery page for Pokémon cards and products.
 * Placeholder implementation for Phase 4.2 routing setup.
 * 
 * Following CLAUDE.md principles for beautiful, award-winning design.
 */

import React from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';

const Search: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search & Discovery</h1>
          
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for Pokémon cards, sets, or products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Results Placeholder */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <SearchIcon className="mx-auto w-12 h-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Start your search</h3>
              <p className="mt-2 text-gray-500">
                Enter a search term to find Pokémon cards, sets, or products.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Search;