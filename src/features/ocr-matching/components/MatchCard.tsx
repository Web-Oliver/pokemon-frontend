import React from 'react';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { CheckCircle, Hash, Star, Award, ThumbsUp, Edit3 } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface MatchCardData {
  card: {
    cardName: string;
    cardNumber: string;
    setName?: string;
    variety?: string;
    rarity?: string;
    _id: string;
  };
  confidence?: number;
  matchScore?: number;
  searchStrategy?: string;
  reasons?: string[];
}

interface MatchCardProps {
  match: MatchCardData;
  index: number;
  isSelected: boolean;
  setRecommendations?: any[];
  onSelect: (match: MatchCardData) => void;
  onEdit: (match: MatchCardData) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  index,
  isSelected,
  setRecommendations = [],
  onSelect,
  onEdit,
}) => {
  const getSetName = () => {
    // Try multiple matching strategies to get proper set name
    if (setRecommendations && setRecommendations.length > 0) {
      let matchingSetRec = null;
      
      // Strategy 1: Match by setId
      if (match.card.setId) {
        matchingSetRec = setRecommendations.find(setRec => 
          setRec._id === match.card.setId || 
          setRec._id?.toString() === match.card.setId?.toString()
        );
      }
      
      // Strategy 2: Match by setName
      if (!matchingSetRec && match.card.setName) {
        matchingSetRec = setRecommendations.find(setRec => 
          setRec.setName === match.card.setName
        );
      }
      
      // Strategy 3: Use highest confidence set recommendation as fallback
      if (!matchingSetRec && setRecommendations.length > 0) {
        matchingSetRec = setRecommendations[0]; // Highest confidence
      }
      
      if (matchingSetRec) {
        return matchingSetRec.setName;
      }
    }
    
    return match.card.setName || `NO SET DATA (Card ${index})`;
  };

  const getSetStrategy = () => {
    const matchingSetRec = setRecommendations.find(setRec => 
      setRec._id === match.card.setId || setRec.setName === match.card.setName
    );
    return matchingSetRec?.strategy;
  };

  return (
    <div
      className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
        isSelected
          ? 'ring-2 ring-cyan-500/60 border-cyan-400/50 bg-cyan-500/20 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
          : 'hover:border-cyan-400/30 border-zinc-700/50 bg-zinc-900/50 hover:bg-cyan-500/10'
      }`}
      onClick={() => onSelect(match)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Card Information */}
          <div className="flex items-start gap-3 mb-3">
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h4 className="font-black text-lg text-white mb-1">
                {match.card.cardName}
              </h4>
              
              <div className="flex items-center gap-4 text-sm text-cyan-100/90 mb-2">
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-cyan-300">{match.card.cardNumber}</span>
                </div>
                
                {match.card.variety && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">{match.card.variety}</span>
                  </div>
                )}
                
                {match.card.rarity && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">{match.card.rarity}</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-white mb-3 flex items-center gap-2">
                <span>{getSetName()}</span>
                {getSetStrategy() && (
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                    {getSetStrategy().replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <ConfidenceIndicator confidence={match.confidence || 0} size="sm" />
              
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {((match.confidence || match.matchScore || 0) * 100).toFixed(0)}% Match
              </div>
              
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/50">
                {match.searchStrategy}
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {match.reasons && match.reasons.length > 0 && (
            <div className="mb-3 pt-2 border-t border-zinc-700/50">
              <div className="flex flex-wrap gap-2">
                {match.reasons.map((reason, reasonIndex) => (
                  <span
                    key={reasonIndex}
                    className="px-2 py-1 bg-zinc-700/50 text-zinc-300 text-xs rounded-full border border-zinc-600/50"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-zinc-700/50">
            <PokemonButton
              variant="success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(match);
              }}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Select This Card
            </PokemonButton>
            
            <PokemonButton
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(match);
              }}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Selection
            </PokemonButton>
          </div>
        </div>
      </div>
    </div>
  );
};