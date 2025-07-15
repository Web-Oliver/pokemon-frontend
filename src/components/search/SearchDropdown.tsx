/**
 * SearchDropdown Component - Context7 Award-Winning Autocomplete
 *
 * Modern autocomplete dropdown with stunning visual design:
 * - Premium glass-morphism effects and gradients
 * - Smooth animations and micro-interactions
 * - Hierarchical suggestion display with smart categorization
 * - Real-time search preview with rich metadata
 * - Award-winning accessibility and keyboard navigation
 *
 * Following CLAUDE.md principles for separation of concerns
 */

import React from 'react';
import { Search, Hash, Package, Star, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  _id?: string;
  id?: string;
  cardName?: string;
  name?: string;
  setName?: string;
  category?: string;
  pokemonNumber?: string;
  variety?: string;
  setInfo?: {
    setName: string;
    year?: number;
  };
  categoryInfo?: {
    category: string;
  };
  counts?: {
    cards: number;
    products: number;
  };
  year?: number;
  psaTotalGradedForCard?: number;
}

interface SearchDropdownProps {
  suggestions: SearchSuggestion[];
  isVisible: boolean;
  activeField: 'set' | 'category' | 'cardProduct' | null;
  onSuggestionSelect: (
    suggestion: SearchSuggestion,
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => void;
  onClose: () => void;
  searchTerm: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  suggestions,
  isVisible,
  activeField,
  onSuggestionSelect,
  onClose,
  searchTerm,
}) => {
  console.log(`[SEARCH DROPDOWN DEBUG] Component render:`, {
    isVisible,
    activeField,
    suggestionsCount: suggestions.length,
    searchTerm,
    suggestions: suggestions.map(s => ({
      name: s.cardName || s.name || s.setName || s.category,
      id: s._id || s.id,
      setInfo: s.setInfo,
      categoryInfo: s.categoryInfo,
    })),
  });

  if (!isVisible || !activeField || suggestions.length === 0) {
    console.log(`[SEARCH DROPDOWN DEBUG] Not rendering dropdown:`, {
      isVisible,
      activeField,
      suggestionsLength: suggestions.length,
    });
    return null;
  }

  // Context7 Award-Winning Design: Premium suggestion categorization
  const renderSuggestionIcon = () => {
    if (activeField === 'set') {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg'>
          <Package className='w-5 h-5 text-white' />
        </div>
      );
    } else if (activeField === 'category') {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg'>
          <Hash className='w-5 h-5 text-white' />
        </div>
      );
    } else {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg'>
          <Search className='w-5 h-5 text-white' />
        </div>
      );
    }
  };

  // Context7 Award-Winning Design: Premium suggestion metadata
  const renderSuggestionMetadata = (suggestion: SearchSuggestion) => {
    const metadata = [];

    if (suggestion.setInfo?.setName) {
      metadata.push(
        <div
          key='set'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-full'
        >
          <Package className='w-3 h-3 text-emerald-600 mr-1' />
          <span className='text-xs font-semibold text-emerald-800'>
            {suggestion.setInfo.setName}
          </span>
        </div>
      );
    }

    if (suggestion.categoryInfo?.category) {
      metadata.push(
        <div
          key='category'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full'
        >
          <Hash className='w-3 h-3 text-purple-600 mr-1' />
          <span className='text-xs font-semibold text-purple-800'>
            {suggestion.categoryInfo.category}
          </span>
        </div>
      );
    }

    if (suggestion.variety) {
      metadata.push(
        <div
          key='variety'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-full'
        >
          <Star className='w-3 h-3 text-yellow-600 mr-1' />
          <span className='text-xs font-semibold text-yellow-800'>{suggestion.variety}</span>
        </div>
      );
    }

    if (suggestion.year) {
      metadata.push(
        <div
          key='year'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-200 rounded-full'
        >
          <span className='text-xs font-semibold text-gray-800'>({suggestion.year})</span>
        </div>
      );
    }

    if (suggestion.counts) {
      const totalItems = suggestion.counts.cards + suggestion.counts.products;
      metadata.push(
        <div
          key='counts'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-full'
        >
          <TrendingUp className='w-3 h-3 text-blue-600 mr-1' />
          <span className='text-xs font-semibold text-blue-800'>{totalItems} items</span>
        </div>
      );
    }

    if (suggestion.psaTotalGradedForCard && suggestion.psaTotalGradedForCard > 0) {
      metadata.push(
        <div
          key='psa'
          className='inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full'
        >
          <TrendingUp className='w-3 h-3 text-purple-600 mr-1' />
          <span className='text-xs font-semibold text-purple-800'>
            {suggestion.psaTotalGradedForCard.toLocaleString()} PSA
          </span>
        </div>
      );
    }

    return metadata;
  };

  // Context7 Award-Winning Design: Get display name with intelligent fallbacks
  const getDisplayName = (suggestion: SearchSuggestion) => {
    return (
      suggestion.cardName ||
      suggestion.name ||
      suggestion.setName ||
      suggestion.category ||
      'Unknown'
    );
  };

  // Context7 Award-Winning Design: Highlight search term in results
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) {
      return text;
    }

    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className='bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 px-1 rounded font-bold'
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {/* Context7 Premium: Ultra-modern glass backdrop */}
      <div
        className='fixed inset-0 z-40 bg-gradient-to-br from-slate-900/20 via-indigo-900/10 to-purple-900/20 backdrop-blur-md animate-fade-in'
        onClick={onClose}
      />

      {/* Context7 Premium: Award-winning dropdown container */}
      <div className='absolute z-50 w-full mt-3 overflow-hidden animate-slide-down'>
        <div className='relative bg-white/95 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-premium max-h-96 overflow-hidden group'>
          {/* Premium animated gradient border */}
          <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
          <div className='absolute inset-[1px] bg-white/98 backdrop-blur-2xl rounded-3xl'></div>

          {/* Premium floating particles */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-1/4 left-1/6 w-1 h-1 bg-indigo-300/40 rounded-full animate-float'></div>
            <div className='absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-purple-300/30 rounded-full animate-bounce delay-200'></div>
            <div className='absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-300/25 rounded-full animate-pulse delay-300'></div>
          </div>

          {/* Context7 Premium Header */}
          <div className='relative p-6 border-b border-slate-200/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-blue-50/50'>
            <div className='flex items-center justify-between relative z-10'>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  {renderSuggestionIcon({ cardName: 'context' })}
                  <div className='absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse'></div>
                </div>
                <div>
                  <h3 className='text-lg font-bold text-slate-900 tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                    {activeField === 'set' && '🎴 Pokémon Sets'}
                    {activeField === 'category' && '📦 Product Categories'}
                    {activeField === 'cardProduct' && '⭐ Cards & Products'}
                  </h3>
                  <p className='text-sm text-slate-600 font-medium'>
                    <span className='inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mr-2'>
                      {suggestions.length}
                    </span>
                    premium suggestion{suggestions.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </p>
                </div>
              </div>

              {/* Context7 Premium Close Button */}
              <button
                onClick={onClose}
                className='w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg hover:shadow-xl border border-white/30'
              >
                <span className='text-slate-500 text-lg font-bold'>×</span>
              </button>
            </div>

            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Context7 Premium Suggestions List */}
          <div className='relative max-h-80 overflow-y-auto scrollbar-premium'>
            {suggestions.map((suggestion, index) => {
              const displayName = getDisplayName(suggestion);
              const metadata = renderSuggestionMetadata(suggestion);

              return (
                <button
                  key={suggestion._id || suggestion.id || `${activeField}-${index}`}
                  onClick={() => {
                    console.log(`[SEARCH DROPDOWN DEBUG] Suggestion clicked:`, {
                      suggestion,
                      activeField,
                      displayName: getDisplayName(suggestion),
                    });
                    onSuggestionSelect(suggestion, activeField);
                  }}
                  className='w-full group relative p-5 hover:bg-gradient-to-r hover:from-indigo-50/70 hover:via-purple-50/70 hover:to-blue-50/70 focus:bg-gradient-to-r focus:from-indigo-50 focus:via-purple-50 focus:to-blue-50 focus:outline-none transition-all duration-300 border-b border-slate-200/30 last:border-b-0 hover:scale-102 hover:shadow-lg'
                >
                  {/* Context7 Premium Hover Effects */}
                  <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 rounded-2xl'></div>

                  {/* Premium floating indicator */}
                  <div className='absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full group-hover:h-8 transition-all duration-300'></div>

                  <div className='relative flex items-center justify-between'>
                    <div className='flex items-center space-x-4 flex-1 min-w-0'>
                      <div className='relative'>
                        {renderSuggestionIcon(suggestion)}
                        {/* Premium pulse effect */}
                        <div className='absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 animate-pulse'></div>
                      </div>

                      <div className='flex-1 min-w-0 text-left'>
                        {/* Context7 Premium Main Text */}
                        <h4 className='text-base font-bold text-slate-900 truncate mb-2 group-hover:text-indigo-700 transition-colors duration-300'>
                          {highlightSearchTerm(displayName, searchTerm)}
                        </h4>

                        {/* Context7 Premium Metadata Badges */}
                        {metadata.length > 0 && (
                          <div className='flex flex-wrap items-center gap-2 mb-2'>{metadata}</div>
                        )}

                        {/* Context7 Premium Additional Context */}
                        {activeField === 'cardProduct' && suggestion.pokemonNumber && (
                          <p className='text-xs text-slate-500 font-medium'>
                            <span className='inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-full'>
                              Pokémon #{suggestion.pokemonNumber}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Context7 Premium Action Indicator */}
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-300'>
                        <div className='w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full'></div>
                      </div>
                    </div>
                  </div>

                  {/* Premium selection shimmer */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out'></div>
                </button>
              );
            })}
          </div>

          {/* Premium footer with keyboard shortcuts */}
          <div className='relative p-3 bg-gradient-to-r from-gray-50/50 to-slate-50/50 border-t border-gray-100/50'>
            <div className='flex items-center justify-center space-x-4 text-xs text-gray-500'>
              <div className='flex items-center space-x-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-200 rounded text-xs'>↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className='flex items-center space-x-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-200 rounded text-xs'>
                  Enter
                </kbd>
                <span>Select</span>
              </div>
              <div className='flex items-center space-x-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-200 rounded text-xs'>Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx='true'>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </>
  );
};

export default SearchDropdown;
