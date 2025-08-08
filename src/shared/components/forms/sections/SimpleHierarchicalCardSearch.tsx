/**
 * Simple Hierarchical Card Search Component
 * Provides the interface that AddEditCardForm expects
 */

import React from 'react';

interface Card {
  id: string;
  cardName: string;
  setId?: {
    setName: string;
  };
  setName?: string;
  cardNumber?: string;
  baseName?: string;
  variety?: string;
}

interface SimpleHierarchicalCardSearchProps {
  selectedCard: Card | null;
  onCardSelect: (card: Card | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SimpleHierarchicalCardSearch: React.FC<SimpleHierarchicalCardSearchProps> = ({
  selectedCard,
  onCardSelect,
  searchQuery,
  onSearchChange,
  isLoading,
  disabled = false,
}) => {
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
            {selectedCard.setName && (
              <p className="text-zinc-400 text-sm">{selectedCard.setName}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Search for Card
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type card name to search..."
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
          disabled={isLoading}
        />
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-white/70">Searching...</div>
        </div>
      )}
      
      {selectedCard && (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-600/50 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-white font-semibold">{selectedCard.cardName}</h4>
              {selectedCard.setName && (
                <p className="text-zinc-400 text-sm">{selectedCard.setName}</p>
              )}
              {selectedCard.cardNumber && (
                <p className="text-zinc-400 text-sm">#{selectedCard.cardNumber}</p>
              )}
            </div>
            <button
              onClick={() => onCardSelect(null)}
              className="text-red-400 hover:text-red-300 text-sm"
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