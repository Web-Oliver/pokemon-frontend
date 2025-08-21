/**
 * SOLID/DRY Implementation: Card Detail View Section
 * Single Responsibility: Display selected card details for confirmation
 * Open/Closed: Extensible through props
 * DRY: Reusable card detail pattern
 */

import React from 'react';
import { Edit3 } from 'lucide-react';
import { PokemonCard, PokemonButton } from '../../../../shared/components/atoms/design-system';
// Removed StatusIndicator import - using inline status display instead

export interface CardDetailViewProps {
  selectedCard: any;
  onEdit: () => void;
  onProceedToGrading: () => void;
}

export const CardDetailView: React.FC<CardDetailViewProps> = ({
  selectedCard,
  onEdit,
  onProceedToGrading
}) => {
  if (!selectedCard) return null;

  return (
    <PokemonCard variant="elevated" className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 backdrop-blur-xl border-emerald-400/30">
      <div className="p-10">
        <div className="text-center mb-8">
          <h4 className="text-3xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            ✅ Card Confirmed!
          </h4>
          <p className="text-xl text-emerald-300">
            Ready to add this card to your collection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PSA Label Image */}
          <div className="text-center">
            <h5 className="text-xl font-bold mb-4 text-cyan-400">PSA Label</h5>
            <div className="relative mx-auto max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-2xl blur-lg"></div>
              <div className="relative backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-4 shadow-xl">
                <img
                  src={`http://localhost:3000/api/ocr/psa-label/${selectedCard.psaLabel?.psaLabelId}/image`}
                  alt="PSA Label"
                  className="w-full h-auto max-h-80 object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2MEg4OFY4MEg0MFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                  }}
                />
              </div>
            </div>
            <div className="mt-6">
              <PokemonButton
                variant="secondary"
                size="sm"
                onClick={onEdit}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Card
              </PokemonButton>
            </div>
          </div>

          {/* Card Details */}
          <div>
            <h5 className="text-xl font-bold mb-6 text-emerald-400">Card Information</h5>
            
            {/* Card Details Status */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-400/30 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-emerald-300">Card Details Confirmed</h3>
                  <p className="text-emerald-400/80 mt-1">All information has been verified and is ready for processing</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-emerald-200 font-medium">Card Name:</span>
                  <div className="text-white font-semibold">{selectedCard.card?.cardName || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-emerald-200 font-medium">Set:</span>
                  <div className="text-white font-semibold">{selectedCard.card?.setName || 'Unknown'}</div>
                </div>
                <div>
                  <span className="text-emerald-200 font-medium">Card Number:</span>
                  <div className="text-white font-semibold">{selectedCard.card?.cardNumber ? `#${selectedCard.card.cardNumber}` : 'N/A'}</div>
                </div>
                {selectedCard.card?.variety && (
                  <div>
                    <span className="text-emerald-200 font-medium">Variety:</span>
                    <div className="text-white font-semibold">{selectedCard.card.variety}</div>
                  </div>
                )}
                {selectedCard.card?.rarity && (
                  <div>
                    <span className="text-emerald-200 font-medium">Rarity:</span>
                    <div className="text-white font-semibold">{selectedCard.card.rarity}</div>
                  </div>
                )}
              </div>
              
              <PokemonButton
                variant="primary"
                size="lg"
                onClick={onProceedToGrading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ✅ CONFIRM & SET GRADE
              </PokemonButton>
            </div>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};