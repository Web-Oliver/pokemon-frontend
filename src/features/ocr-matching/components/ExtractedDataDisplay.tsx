import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { Eye } from 'lucide-react';

interface ExtractedData {
  pokemonName?: string;
  cardNumber?: string;
}

interface ExtractedDataDisplayProps {
  extractedData: ExtractedData;
}

export const ExtractedDataDisplay: React.FC<ExtractedDataDisplayProps> = ({
  extractedData,
}) => {
  return (
    <PokemonCard variant="glass" size="lg" className="text-white relative overflow-hidden">
      <div className="relative z-20">
        <h4 className="text-lg font-black mb-4 flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          <Eye className="w-6 h-6 text-emerald-400" />
          Extracted Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <span className="text-cyan-100/70 text-sm font-medium block mb-2">Pokemon Name</span>
            <div className="px-3 py-2 bg-cyan-500/20 rounded-xl border border-cyan-400/30 text-cyan-300 font-medium">
              {extractedData.pokemonName || 'Not detected'}
            </div>
          </div>
          <div className="text-center">
            <span className="text-cyan-100/70 text-sm font-medium block mb-2">Card Number</span>
            <div className="px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300 font-medium">
              {extractedData.cardNumber || 'Not detected'}
            </div>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};