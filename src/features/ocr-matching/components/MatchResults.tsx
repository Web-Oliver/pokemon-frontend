import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { CheckCircle, Search } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { MatchCard } from './MatchCard';
import { MatchData, SetRecommendation } from '../types/OcrMatchingTypes';

interface MatchResultsProps {
  matches: MatchData[];
  filteredMatches: MatchData[] | null;
  selectedMatch: MatchData | null;
  selectedSetName: string | null;
  confidence: number;
  setRecommendations: SetRecommendation[];
  onMatchSelect: (match: MatchData) => void;
  onEditMatch: (match: MatchData) => void;
  onManualSelection: () => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  filteredMatches,
  selectedMatch,
  selectedSetName,
  confidence,
  setRecommendations,
  onMatchSelect,
  onEditMatch,
  onManualSelection,
}) => {
  if (matches.length === 0) return null;

  const displayMatches = filteredMatches || matches;

  return (
    <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
      <div className="relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-black flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            <CheckCircle className="w-6 h-6 text-cyan-400" />
            {selectedSetName ? `Cards from ${selectedSetName}` : `All Match Results`} 
            ({displayMatches.length})
          </h4>
          <ConfidenceIndicator confidence={confidence} />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayMatches.map((match, index) => (
            <MatchCard
              key={index}
              match={match}
              index={index}
              isSelected={selectedMatch === match}
              setRecommendations={setRecommendations}
              onSelect={onMatchSelect}
              onEdit={onEditMatch}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <PokemonButton
            variant="outline"
            onClick={onManualSelection}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Manual Selection
          </PokemonButton>
        </div>
      </div>
    </PokemonCard>
  );
};