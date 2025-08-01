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

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { Hash, Package, Search, Star, TrendingUp } from 'lucide-react';
import { getDisplayName as getDisplayNameHelper } from '../../utils/searchHelpers.optimized';

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

const SearchDropdown: React.FC<SearchDropdownProps> = memo(({
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
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + suggestions.length) % suggestions.length
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (
            selectedIndex >= 0 &&
            selectedIndex < suggestions.length &&
            activeField
          ) {
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
  }, [
    isVisible,
    suggestions,
    selectedIndex,
    activeField,
    onSuggestionSelect,
    onClose,
  ]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);
  // Conditional debug logging for development only
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SEARCH DROPDOWN DEBUG] Component render:`, {
      isVisible,
      activeField,
      suggestionsCount: suggestions.length,
      searchTerm,
      suggestions: suggestions.map((s) => ({
        name: s.cardName || s.name || s.setName || s.category,
        id: s._id || s.id,
        setInfo: s.setInfo,
        categoryInfo: s.categoryInfo,
      })),
    });
  }

  if (!isVisible || !activeField || (!loading && suggestions.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SEARCH DROPDOWN DEBUG] Not rendering dropdown:`, {
        isVisible,
        activeField,
        suggestionsLength: suggestions.length,
        loading,
      });
    }
    return null;
  }

  // Context7 Award-Winning Design: Premium suggestion categorization
  const renderSuggestionIcon = (suggestion?: SearchSuggestion) => {
    if (activeField === 'set') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Package className="w-5 h-5 text-white" />
        </div>
      );
    } else if (activeField === 'category') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Hash className="w-5 h-5 text-white" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Search className="w-5 h-5 text-white" />
        </div>
      );
    }
  };

  // Context7 Premium: Award-winning metadata badges with glass morphism
  const renderSuggestionMetadata = useCallback((suggestion: SearchSuggestion) => {
    const metadata = [];

    if (suggestion.setInfo?.setName) {
      metadata.push(
        <div
          key="set"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold shadow-lg"
        >
          <Package className="w-3 h-3 mr-1" />
          {suggestion.setInfo.setName}
        </div>
      );
    }

    if (suggestion.categoryInfo?.category) {
      metadata.push(
        <div
          key="category"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold shadow-lg"
        >
          <Hash className="w-3 h-3 mr-1" />
          {suggestion.categoryInfo.category}
        </div>
      );
    }

    if (suggestion.variety) {
      metadata.push(
        <div
          key="variety"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/30 rounded-lg text-xs text-amber-300 font-semibold shadow-lg"
        >
          <Star className="w-3 h-3 mr-1" />
          {suggestion.variety}
        </div>
      );
    }

    if (suggestion.year) {
      metadata.push(
        <div
          key="year"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-slate-500/20 to-zinc-600/20 backdrop-blur-xl border border-slate-500/30 rounded-lg text-xs text-slate-300 font-semibold shadow-lg"
        >
          {suggestion.year}
        </div>
      );
    }

    if (suggestion.counts) {
      const totalItems = suggestion.counts.cards + suggestion.counts.products;
      metadata.push(
        <div
          key="counts"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-lg text-xs text-blue-300 font-semibold shadow-lg"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {totalItems} items
        </div>
      );
    }

    if (suggestion.psaTotalGradedForCard && suggestion.psaTotalGradedForCard > 0) {
      metadata.push(
        <div
          key="psa"
          className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-xl border border-indigo-500/30 rounded-lg text-xs text-indigo-300 font-semibold shadow-lg"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {suggestion.psaTotalGradedForCard.toLocaleString()} PSA
        </div>
      );
    }

    return metadata;
  }, []);

  // Context7 Pattern: Memoized display name calculation with stable dependencies
  const getDisplayName = useCallback((suggestion: SearchSuggestion) => {
    return getDisplayNameHelper({
      _id: suggestion._id || suggestion.id || '',
      displayName: '',
      data: suggestion,
      type:
        activeField === 'set'
          ? 'set'
          : activeField === 'category'
            ? 'category'
            : 'card',
    } as any);
  }, [activeField]);

  // Context7 Pattern: Memoized highlighting function for performance
  const highlightSearchTerm = useCallback((text: string, term: string) => {
    if (!term) {
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
          <span className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 px-2 py-0.5 rounded-lg font-bold backdrop-blur-xl shadow-lg border border-blue-500/30">
            {text.substring(matchIndex, matchIndex + searchTerm.length)}
          </span>
          {text.substring(matchIndex + searchTerm.length)}
        </>
      );
    }

    // Order-Independent Word Matching
    const searchWords = searchTerm.split(/\s+/).filter((w) => w.length > 1);
    if (searchWords.length === 0) {
      return text;
    }

    // Find all words that match (regardless of order)
    const matches = [];
    searchWords.forEach((word) => {
      const wordRegex = new RegExp(
        `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'gi'
      );
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

        // Add highlighted match with premium styling
        result.push(
          <span
            key={index}
            className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 px-2 py-0.5 rounded-lg font-bold backdrop-blur-xl shadow-lg border border-blue-500/30"
          >
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
  }, []);

  return (
    <div className="absolute top-full left-0 right-0 z-[9999] mt-3">
      {/* Context7 Premium Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Context7 Award-Winning Dropdown Container */}
      <div className="relative z-[9999]">
        {/* Background Glass Effects */}
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-[2rem] blur-2xl opacity-60"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-cyan-400/5 rounded-[1.5rem] blur-xl"></div>
        
        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-[500px]">
          {/* Floating Orbs */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>

          {/* Context7 Premium Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                  {activeField === 'set' && (
                    <Package className="w-6 h-6 text-blue-400" />
                  )}
                  {activeField === 'category' && (
                    <Hash className="w-6 h-6 text-purple-400" />
                  )}
                  {activeField === 'cardProduct' && (
                    <Search className="w-6 h-6 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    {activeField === 'set' && 'Pokémon Sets'}
                    {activeField === 'category' && 'Product Categories'}
                    {activeField === 'cardProduct' && 'Cards & Products'}
                  </h3>
                  <p className="text-sm text-white/60 font-medium">
                    {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} for "{searchTerm.length > 20 ? `${searchTerm.substring(0, 20)}...` : searchTerm}"
                  </p>
                </div>
              </div>

              {/* Premium Close Button */}
              <button
                onClick={onClose}
                className="group relative overflow-hidden p-3 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-lg font-bold">×</span>
              </button>
            </div>
          </div>

          {/* Context7 Premium Suggestions List */}
          <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent relative z-10">
            {loading ? (
              <div className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-12 h-12 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="absolute inset-0 w-12 h-12 mx-auto bg-blue-500/10 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white font-semibold mb-2">Searching collection...</p>
                <p className="text-white/60 text-sm">Finding the perfect matches</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                    <Search className="w-8 h-8 text-white/60" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-xl opacity-50"></div>
                </div>
                <p className="text-white font-semibold mb-2">No results found</p>
                <p className="text-white/60 text-sm">Try different keywords or check spelling</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {suggestions.map((suggestion, index) => {
                  const displayName = getDisplayName(suggestion);
                  const metadata = renderSuggestionMetadata(suggestion);
                  const isSelected = selectedIndex === index;

                  return (
                    <button
                      key={suggestion._id || suggestion.id || `${activeField}-${index}`}
                      onClick={() => {
                        if (process.env.NODE_ENV === 'development') {
                          console.log(`[SEARCH DROPDOWN DEBUG] Suggestion clicked:`, {
                            suggestion,
                            activeField,
                            displayName: getDisplayName(suggestion),
                          });
                        }
                        onSuggestionSelect(suggestion, activeField);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group w-full text-left p-4 rounded-xl transition-all duration-300 focus:outline-none transform hover:scale-102 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg' 
                          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`}
                    >
                      {/* Premium Gradient Overlay for Selected */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                      )}
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                      <div className="relative z-10 flex items-center space-x-4">
                        {/* Premium Icon */}
                        <div className={`p-2 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                          activeField === 'set' 
                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30' 
                            : activeField === 'category'
                            ? 'bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30'
                            : 'bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30'
                        }`}>
                          {activeField === 'set' && <Package className="w-5 h-5 text-emerald-400" />}
                          {activeField === 'category' && <Hash className="w-5 h-5 text-purple-400" />}
                          {activeField === 'cardProduct' && <Search className="w-5 h-5 text-blue-400" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-white/90'}`}>
                            {highlightSearchTerm(displayName, searchTerm)}
                          </h4>

                          {/* Context7 Premium Metadata */}
                          {metadata.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mb-1">
                              {metadata}
                            </div>
                          )}

                          {/* Additional Context */}
                          {activeField === 'cardProduct' && suggestion.pokemonNumber && (
                            <p className="text-xs text-white/60 font-medium">
                              Pokémon #{suggestion.pokemonNumber}
                            </p>
                          )}
                        </div>

                        {/* Premium Selection Indicator */}
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isSelected 
                              ? 'bg-blue-400 shadow-lg shadow-blue-400/50 animate-pulse' 
                              : 'bg-white/20 group-hover:bg-white/40'
                          }`}></div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Context7 Premium Footer with shortcuts */}
          <div className="p-4 bg-gradient-to-r from-white/5 to-white/2 backdrop-blur-xl border-t border-white/10 relative z-10">
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <kbd className="px-3 py-1.5 bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-white/20 rounded-lg text-xs text-white font-semibold shadow-lg">
                  ↑↓
                </kbd>
                <span className="text-white/70 font-medium">Navigate</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-3 py-1.5 bg-gradient-to-br from-blue-600/80 to-purple-600/80 border border-white/20 rounded-lg text-xs text-white font-semibold shadow-lg">
                  Enter
                </kbd>
                <span className="text-white/70 font-medium">Select</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-3 py-1.5 bg-gradient-to-br from-red-600/80 to-pink-600/80 border border-white/20 rounded-lg text-xs text-white font-semibold shadow-lg">
                  Esc
                </kbd>
                <span className="text-white/70 font-medium">Close</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Optimized Styles */}
      <style jsx="true">{`
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
});

// Context7 Performance: Export memoized component with display name
SearchDropdown.displayName = 'SearchDropdown';
export default SearchDropdown;
