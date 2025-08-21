import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { AlertCircle, Search } from 'lucide-react';

interface NoResultsProps {
  onManualSearch: () => void;
}

export const NoResults: React.FC<NoResultsProps> = ({ onManualSearch }) => {
  return (
    <PokemonCard variant="glass" size="lg" className="text-center text-white relative overflow-hidden">
      <div className="relative z-20">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h4 className="text-lg font-black mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          No Matches Found
        </h4>
        <p className="text-cyan-100/90 mb-4">
          Couldn't find matching cards for the extracted data. Try manual selection.
        </p>
        <PokemonButton
          variant="primary"
          onClick={onManualSearch}
          className="flex items-center gap-2 mx-auto"
        >
          <Search className="w-4 h-4" />
          Search Manually
        </PokemonButton>
      </div>
    </PokemonCard>
  );
};