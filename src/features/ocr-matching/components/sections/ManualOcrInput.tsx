/**
 * SOLID/DRY Implementation: Manual OCR Input Section
 * Single Responsibility: Handle manual OCR text input and submission
 * Open/Closed: Extensible through props
 * DRY: Reusable OCR input pattern
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { PokemonCard, PokemonButton, PokemonInput } from '../../../../shared/components/atoms/design-system';

export interface ManualOcrInputProps {
  ocrText: string;
  isProcessing: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export const ManualOcrInput: React.FC<ManualOcrInputProps> = ({
  ocrText,
  isProcessing,
  onTextChange,
  onSubmit,
  onClear
}) => {
  return (
    <PokemonCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-purple-400/30">
      <div className="p-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-300/30 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-purple-300" />
          </div>
          <div>
            <h3 className="text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
              Manual OCR Text Input
            </h3>
            <p className="text-purple-200/70 text-lg">Direct text processing for advanced users</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Enhanced input container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl blur-lg"></div>
            <div className="relative backdrop-blur-sm bg-black/10 border border-white/10 rounded-2xl p-6">
              <PokemonInput
                label="OCR Text"
                value={ocrText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Paste or type the extracted OCR text from your Pokemon card..."
                helper="💡 Tip: Higher quality OCR text leads to more accurate card matches"
              />
            </div>
          </div>
          
          {/* Enhanced button group */}
          <div className="flex flex-col sm:flex-row gap-4">
            <PokemonButton
              variant="primary"
              size="lg"
              onClick={onSubmit}
              disabled={!ocrText.trim() || isProcessing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {isProcessing ? 'Processing...' : 'Process OCR Text'}
            </PokemonButton>
            
            <PokemonButton
              variant="secondary"
              size="lg"
              onClick={onClear}
              disabled={isProcessing}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </PokemonButton>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};