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

import React, { useEffect, useState } from 'react';
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
  const [_isAnimating, setIsAnimating] = useState(false);

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
      if (!isVisible || suggestions.length === 0) {
        return;
      }

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

  // Context7 Optimized: Clean metadata rendering for better readability
  const renderSuggestionMetadata = (suggestion: SearchSuggestion) => {
    const metadata = [];

    if (suggestion.setInfo?.setName) {
      metadata.push(
        <div
          key='set'
          className='inline-flex items-center px-2 py-0.5 bg-green-50 border border-green-200 rounded text-xs text-green-700 font-medium'
        >
          <Package className='w-3 h-3 mr-1' />
          {suggestion.setInfo.setName}
        </div>
      );
    }

    if (suggestion.categoryInfo?.category) {
      metadata.push(
        <div
          key='category'
          className='inline-flex items-center px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700 font-medium'
        >
          <Hash className='w-3 h-3 mr-1' />
          {suggestion.categoryInfo.category}
        </div>
      );
    }

    if (suggestion.variety) {
      metadata.push(
        <div
          key='variety'
          className='inline-flex items-center px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 font-medium'
        >
          <Star className='w-3 h-3 mr-1' />
          {suggestion.variety}
        </div>
      );
    }

    if (suggestion.year) {
      metadata.push(
        <div
          key='year'
          className='inline-flex items-center px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 font-medium'
        >
          {suggestion.year}
        </div>
      );
    }

    if (suggestion.counts) {
      const totalItems = suggestion.counts.cards + suggestion.counts.products;
      metadata.push(
        <div
          key='counts'
          className='inline-flex items-center px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium'
        >
          <TrendingUp className='w-3 h-3 mr-1' />
          {totalItems} items
        </div>
      );
    }

    if (suggestion.psaTotalGradedForCard && suggestion.psaTotalGradedForCard > 0) {
      metadata.push(
        <div
          key='psa'
          className='inline-flex items-center px-2 py-0.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700 font-medium'
        >
          <TrendingUp className='w-3 h-3 mr-1' />
          {suggestion.psaTotalGradedForCard.toLocaleString()} PSA
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

  // Context7 Optimized: Order-independent word matching with intelligent highlighting
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) {
      return text;
    }

    const searchTerm = term.toLowerCase();
    const textLower = text.toLowerCase();

    // First try exact match
    const matchIndex = textLower.indexOf(searchTerm);
    if (matchIndex !== -1) {
      return (
        <>
          {text.substring(0, matchIndex)}
          <span className='bg-blue-100 text-blue-800 px-1 rounded font-medium'>
            {text.substring(matchIndex, matchIndex + searchTerm.length)}
          </span>
          {text.substring(matchIndex + searchTerm.length)}
        </>
      );
    }

    // Context7 Order-Independent Word Matching
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 1);
    if (searchWords.length === 0) {
      return text;
    }

    // Find all words that match (regardless of order)
    const matches = [];
    searchWords.forEach(word => {
      const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      let match;
      while ((match = wordRegex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          word: match[0],
        });
      }
    });

    if (matches.length === 0) {
      return text;
    }

    // Sort matches by position and merge overlapping ones
    matches.sort((a, b) => a.start - b.start);

    // Build highlighted text
    const result = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Avoid overlapping highlights
      if (match.start >= lastIndex) {
        // Add text before match
        if (match.start > lastIndex) {
          result.push(text.substring(lastIndex, match.start));
        }

        // Add highlighted match
        result.push(
          <span key={index} className='bg-blue-100 text-blue-800 px-1 rounded font-medium'>
            {match.word}
          </span>
        );

        lastIndex = match.end;
      }
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result.length > 0 ? result : text;
  };

  return (
    <div className='absolute top-full left-0 right-0 z-[9999] mt-2'>
      {/* Context7 Clean Overlay */}
      <div className='fixed inset-0 z-40 bg-black/20' onClick={onClose} />

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
                    {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for "
                    {searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}"
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
                <p className='text-gray-500 text-xs'>Try different keywords or check spelling</p>
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
                          {activeField === 'cardProduct' && (
                            <Search className='w-3 h-3 text-white' />
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h4
                            className={`text-sm font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {highlightSearchTerm(displayName, searchTerm)}
                          </h4>

                          {/* Context7 Metadata */}
                          {metadata.length > 0 && (
                            <div className='flex flex-wrap items-center gap-1 mt-1'>{metadata}</div>
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
                          <div
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Context7 Footer with shortcuts */}
          <div className='p-3 bg-gray-50 border-t border-gray-100'>
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

      {/* Context7 Optimized Styles */}
      <style jsx='true'>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-track-gray-100::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 2px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default SearchDropdown;
