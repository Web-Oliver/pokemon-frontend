/**
 * Simple Hierarchical Card Search Component - Updated for New Backend
 * Provides hierarchical search with MongoDB ObjectId relationships
 * Uses UnifiedApiService with bidirectional search capabilities
 */

import React, { useState, useEffect } from 'react';
import { useSearch, useCardWithContext } from '../../../hooks';
import { ICard } from '../../../domain/models/card';

// Using proper ICard interface from domain models

interface SimpleHierarchicalCardSearchProps {
  selectedCard: ICard | null;
  onCardSelect: (card: ICard | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  setId?: string; // For hierarchical filtering by set
}

export const SimpleHierarchicalCardSearch: React.FC<
  SimpleHierarchicalCardSearchProps
> = ({
  selectedCard,
  onCardSelect,
  searchQuery,
  onSearchChange,
  isLoading: parentLoading,
  disabled = false,
  setId, // For hierarchical filtering
}) => {
  const [suggestions, setSuggestions] = useState<ICard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Use new hierarchical search hook
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery, {
    searchType: 'cards',
    parentId: setId, // Filter by set if provided
    minLength: 2,
  });
  
  // Get context for selected card if available
  const { data: cardContext } = useCardWithContext(selectedCard?._id || '');
  
  const isLoading = parentLoading || searchLoading;
  
  // Update suggestions when search results change
  useEffect(() => {
    if (searchResults && searchQuery.length >= 2) {
      setSuggestions(searchResults.map(r => r.data));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchResults, searchQuery]);
  
  const handleCardSelect = (card: ICard) => {
    onCardSelect(card);
    setShowSuggestions(false);
    onSearchChange(''); // Clear search after selection
  };
  if (disabled) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-900/30 backdrop-blur-sm border border-amber-500/50 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <div className="text-amber-400 text-sm font-medium bg-amber-900/50 px-3 py-1 rounded-lg border border-amber-500/30">
              Editing Mode
            </div>
            <span className="text-amber-300 font-medium">
              Card information cannot be changed when editing
            </span>
          </div>
        </div>

        {selectedCard && (
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-600/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Selected Card</h4>
            <p className="text-zinc-300">{selectedCard.cardName}</p>
            {(selectedCard.setId?.setName || selectedCard.setName) && (
              <p className="text-zinc-400 text-sm">
                {selectedCard.setId?.setName || selectedCard.setName}
              </p>
            )}
            {cardContext?.relatedCards?.length > 0 && (
              <p className="text-cyan-400 text-xs mt-1">
                +{cardContext.relatedCards.length} other cards in this set
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-white/90 mb-2">
          {setId ? 'Search cards in selected set' : 'Search for Card'}
          {setId && <span className="text-cyan-400 ml-1">(filtered by set)</span>}
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={setId ? "Search cards in this set..." : "Type card name to search..."}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
          disabled={isLoading}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        
        {/* Search suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((card) => (
              <button
                key={card._id}
                onClick={() => handleCardSelect(card)}
                className="w-full px-3 py-2 text-left hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-b-0"
              >
                <div className="text-white font-medium">{card.cardName}</div>
                <div className="text-zinc-400 text-sm">
                  {card.setId?.setName || 'Unknown Set'} #{card.cardNumber || '???'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="text-white/70 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}

      {selectedCard && (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-600/50 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-semibold">
                {selectedCard.cardName}
              </h4>
              {(selectedCard.setId?.setName || selectedCard.setName) && (
                <p className="text-zinc-400 text-sm">
                  {selectedCard.setId?.setName || selectedCard.setName}
                </p>
              )}
              {selectedCard.cardNumber && (
                <p className="text-zinc-400 text-sm">
                  #{selectedCard.cardNumber}
                </p>
              )}
              {cardContext?.relatedCards?.length > 0 && (
                <p className="text-cyan-400 text-xs mt-1">
                  +{cardContext.relatedCards.length} other cards in this set
                </p>
              )}
            </div>
            <button
              onClick={() => onCardSelect(null)}
              className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleHierarchicalCardSearch;
