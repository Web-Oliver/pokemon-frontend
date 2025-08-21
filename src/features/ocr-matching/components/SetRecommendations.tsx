import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { Database } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { SetRecommendation, MatchData } from '../types/OcrMatchingTypes';

interface SetRecommendationsProps {
  setRecommendations: SetRecommendation[];
  matches: MatchData[];
  selectedSetName: string | null;
  onSetSelect: (setName: string, filteredMatches: MatchData[]) => void;
  onShowAllSets: () => void;
}

export const SetRecommendations: React.FC<SetRecommendationsProps> = ({
  setRecommendations,
  matches,
  selectedSetName,
  onSetSelect,
  onShowAllSets,
}) => {
  if (setRecommendations.length === 0) return null;

  return (
    <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
      <div className="relative z-20">
        <h4 className="text-xl font-black mb-4 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          <Database className="w-6 h-6 text-cyan-400" />
          Recommended Sets (Hierarchical Search)
        </h4>
        <p className="text-cyan-100/90 text-lg font-medium mb-6">
          Based on hierarchical search analysis: CARD NAME + POKEMON NUMBER → FIND SETS. Click on a set to filter cards.
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {setRecommendations.map((setRec: SetRecommendation, index: number) => {
            // Count matching cards for this set
            const cardsInSet = matches.filter(match => {
              const setIdMatch = match.card.setId === setRec._id || match.card.setId?.toString() === setRec._id?.toString();
              const setNameMatch = match.card.setName === setRec.setName;
              const cardNameMatch = match.card.cardName && setRec.setName && 
                match.card.cardName.toLowerCase().includes(setRec.setName.toLowerCase().split(' ')[0]);
              
              return setIdMatch || setNameMatch || cardNameMatch;
            });
            
            return (
              <PokemonButton
                key={setRec._id || index}
                variant="glass"
                size="lg"
                onClick={() => onSetSelect(setRec.setName, cardsInSet)}
                className={`p-4 h-auto text-left flex flex-col items-start gap-3 transition-all duration-300 ${
                  selectedSetName === setRec.setName
                    ? 'ring-2 ring-cyan-500/60 border-cyan-400/50 bg-cyan-500/20 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
                    : 'hover:border-cyan-400/30 hover:bg-cyan-500/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-black text-sm text-white">{setRec.setName}</span>
                  <div className="flex gap-2">
                    {setRec.year && (
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                        {setRec.year}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                      {cardsInSet.length} cards
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <ConfidenceIndicator confidence={setRec.confidence || 0} size="sm" />
                    <span className="text-xs text-cyan-100/90 font-medium">
                      {((setRec.confidence || 0) * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  {setRec.strategy && (
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30 font-medium">
                      {setRec.strategy.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {setRec.matchingCards && (
                  <span className="text-xs text-emerald-300 font-medium">
                    {setRec.matchingCards} matching cards found
                  </span>
                )}
              </PokemonButton>
            );
          })}
        </div>
        
        {selectedSetName && (
          <div className="mt-6 pt-4 border-t border-cyan-500/20">
            <PokemonButton
              variant="glass"
              size="md"
              onClick={onShowAllSets}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Show All Sets
            </PokemonButton>
          </div>
        )}
      </div>
    </PokemonCard>
  );
};