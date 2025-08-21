/**
 * Hierarchical Card Selector - Set -> Card selection component
 * 
 * Uses existing shared components and follows the established architecture
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowRight, X, Package, Hash } from 'lucide-react';
import { 
  PokemonInput, 
  PokemonButton, 
  PokemonCard 
} from '../../../shared/components/atoms/design-system';

interface HierarchicalCardSelectorProps {
  onSelect: (card: any) => void;
  onClose: () => void;
  searchSets: (query: string) => Promise<{ sets: any[] }>;
  searchCards: (query: string, filters: any) => Promise<{ cards: any[] }>;
  psaLabelImage?: string;
  ocrText?: string;
}

export const HierarchicalCardSelector: React.FC<HierarchicalCardSelectorProps> = ({
  onSelect,
  onClose,
  searchSets,
  searchCards,
  psaLabelImage,
  ocrText,
}) => {
  const [step, setStep] = useState<'sets' | 'cards'>('sets');
  const [selectedSet, setSelectedSet] = useState<any>(null);
  const [setQuery, setSetQuery] = useState('');
  const [cardQuery, setCardQuery] = useState('');
  const [sets, setSets] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search sets
  const performSetSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const result = await searchSets(query);
      setSets(result.sets || []);
    } catch (error) {
      console.error('Set search error:', error);
      setSets([]);
    } finally {
      setLoading(false);
    }
  }, [searchSets]);

  // Search cards within selected set
  const performCardSearch = useCallback(async (query: string) => {
    if (!selectedSet) return;
    
    setLoading(true);
    try {
      const result = await searchCards(query, {
        setId: selectedSet._id,
        setName: selectedSet.setName,
      });
      setCards(result.cards || []);
    } catch (error) {
      console.error('Card search error:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [searchCards, selectedSet]);

  // Initial set search
  useEffect(() => {
    performSetSearch('');
  }, [performSetSearch]);

  // Search cards when set is selected
  useEffect(() => {
    if (selectedSet && step === 'cards') {
      performCardSearch('');
    }
  }, [selectedSet, step, performCardSearch]);

  const handleSetSelect = (set: any) => {
    setSelectedSet(set);
    setStep('cards');
    setCardQuery('');
  };

  const handleCardSelect = (card: any) => {
    onSelect({
      ...card,
      setName: selectedSet.setName,
      setId: selectedSet._id,
    });
  };

  const handleBackToSets = () => {
    setStep('sets');
    setSelectedSet(null);
    setCards([]);
    setCardQuery('');
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header with PSA Image */}
      <div className="border-b">
        {psaLabelImage && (
          <div className="flex items-center gap-4 p-4 bg-gray-50">
            <img
              src={`http://localhost:3000/uploads/full-images/${psaLabelImage}`}
              alt="PSA Label"
              className="w-16 h-20 object-cover rounded border border-gray-300 shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Finding correct match for:</p>
              {ocrText && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {ocrText.substring(0, 100)}...
                </p>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">
              {step === 'sets' ? 'Select Set' : `Select Card from ${selectedSet?.setName}`}
            </h3>
            {step === 'cards' && (
              <PokemonButton
                variant="outline"
                size="sm"
                onClick={handleBackToSets}
                className="flex items-center gap-1"
              >
                ← Back to Sets
              </PokemonButton>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-6 border-b">
        <PokemonInput
          type="text"
          placeholder={step === 'sets' ? 'Search sets...' : 'Search cards...'}
          value={step === 'sets' ? setQuery : cardQuery}
          onChange={(e) => {
            const value = e.target.value;
            if (step === 'sets') {
              setSetQuery(value);
              performSetSearch(value);
            } else {
              setCardQuery(value);
              performCardSearch(value);
            }
          }}
          className="w-full"
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Searching...
          </div>
        )}

        {/* Set Results */}
        {step === 'sets' && !loading && (
          <div className="grid gap-3">
            {sets.length > 0 ? (
              sets.map((set) => (
                <PokemonCard
                  key={set._id}
                  className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                  onClick={() => handleSetSelect(set)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {set.setName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {set.year && <span>{set.year}</span>}
                          {set.seriesName && <span>{set.seriesName}</span>}
                          {set.cardCount && <span>{set.cardCount} cards</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </PokemonCard>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sets found
              </div>
            )}
          </div>
        )}

        {/* Card Results */}
        {step === 'cards' && !loading && (
          <div className="grid gap-3">
            {cards.length > 0 ? (
              cards.map((card) => (
                <PokemonCard
                  key={card._id}
                  className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-green-300"
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {card.cardName}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span>{card.cardNumber}</span>
                        </div>
                        {card.variety && <span>{card.variety}</span>}
                        {card.rarity && <span>{card.rarity}</span>}
                      </div>
                    </div>
                    <PokemonButton size="sm">
                      Select
                    </PokemonButton>
                  </div>
                </PokemonCard>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedSet ? 'No cards found in this set' : 'Please select a set first'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};