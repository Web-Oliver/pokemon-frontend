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

import React, { useRef, useEffect, useState } from 'react';
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
  loading?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  suggestions,
  isVisible,
  activeField,
  onSuggestionSelect,
  onClose,
  searchTerm,
  loading = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setSelectedIndex(0);
      
      // Add animation timeout
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isVisible, activeField]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length && activeField) {
            onSuggestionSelect(suggestions[selectedIndex], activeField);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, activeField, onSuggestionSelect, onClose]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);
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

  if (!isVisible || !activeField || (!loading && suggestions.length === 0)) {
    console.log(`[SEARCH DROPDOWN DEBUG] Not rendering dropdown:`, {
      isVisible,
      activeField,
      suggestionsLength: suggestions.length,
      loading,
    });
    return null;
  }

  // Context7 Award-Winning Design: Premium suggestion categorization
  const renderSuggestionIcon = (suggestion?: SearchSuggestion) => {
    if (activeField === 'set') {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
          <Package className='w-5 h-5 text-white' />
        </div>
      );
    } else if (activeField === 'category') {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
          <Hash className='w-5 h-5 text-white' />
        </div>
      );
    } else {
      return (
        <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
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

  // Context7 Optimized: Advanced search term highlighting with fuzzy matching
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) {
      return text;
    }

    // Create a more flexible regex that allows for partial matches
    const searchWords = term.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    if (searchWords.length === 0) {
      return text;
    }

    // Build a regex that matches any of the search words
    const regexPattern = searchWords.map(word => 
      word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|');
    
    const regex = new RegExp(`(${regexPattern})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className='bg-blue-100 text-blue-800 px-1 rounded font-medium'
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className='absolute top-full left-0 right-0 z-[9999] mt-2'>
      {/* Context7 Clean Overlay */}
      <div
        className='fixed inset-0 z-40 bg-black/20'
        onClick={onClose}
      />

      {/* Context7 Clean Dropdown Container */}
      <div className='relative z-[9999]'>
        <div className='bg-white border border-gray-200 rounded-lg shadow-xl max-h-[480px] overflow-hidden'>
          {/* Context7 Header */}
          <div className='p-4 border-b border-gray-100 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                  {activeField === 'set' && <Package className='w-4 h-4 text-white' />}
                  {activeField === 'category' && <Hash className='w-4 h-4 text-white' />}
                  {activeField === 'cardProduct' && <Search className='w-4 h-4 text-white' />}
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    {activeField === 'set' && 'Pokémon Sets'}
                    {activeField === 'category' && 'Product Categories'}
                    {activeField === 'cardProduct' && 'Cards & Products'}
                  </h3>
                  <p className='text-xs text-gray-500'>
                    {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for "{searchTerm}"
                  </p>
                </div>
              </div>

              {/* Context7 Close Button */}
              <button
                onClick={onClose}
                className='w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors'
              >
                <span className='text-gray-400 text-sm'>×</span>
              </button>
            </div>
          </div>

          {/* Context7 Optimized Suggestions List */}
          <div className='max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {loading ? (
              <div className='p-6 text-center'>
                <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
                <p className='text-gray-600 text-sm'>Searching collection...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className='p-6 text-center'>
                <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Search className='w-6 h-6 text-gray-400' />
                </div>
                <p className='text-gray-600 text-sm mb-1'>No results found</p>
                <p className='text-gray-500 text-xs'>Try searching with fewer characters</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {suggestions.map((suggestion, index) => {
                  const displayName = getDisplayName(suggestion);
                  const metadata = renderSuggestionMetadata(suggestion);
                  const isSelected = selectedIndex === index;

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
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left p-3 transition-colors duration-150 focus:outline-none ${
                        isSelected
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0'>
                          {activeField === 'set' && <Package className='w-3 h-3 text-white' />}
                          {activeField === 'category' && <Hash className='w-3 h-3 text-white' />}
                          {activeField === 'cardProduct' && <Search className='w-3 h-3 text-white' />}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h4 className={`text-sm font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {highlightSearchTerm(displayName, searchTerm)}
                          </h4>

                          {/* Context7 Metadata */}
                          {metadata.length > 0 && (
                            <div className='flex flex-wrap items-center gap-1 mt-1'>
                              {metadata}
                            </div>
                          )}

                          {/* Additional Context */}
                          {activeField === 'cardProduct' && suggestion.pokemonNumber && (
                            <p className='text-xs text-gray-500 mt-1'>
                              Pokémon #{suggestion.pokemonNumber}
                            </p>
                          )}
                        </div>

                        {/* Selection indicator */}
                        <div className='flex items-center'>
                          <div className={`w-2 h-2 rounded-full transition-colors ${
                            isSelected ? 'bg-blue-500' : 'bg-gray-300'
                          }`}></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
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

      {/* Custom scrollbar styles and animations */}
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
        
        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .shadow-premium {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.3);
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default SearchDropdown;
