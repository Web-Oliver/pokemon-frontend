/**
 * OCR Match Result Component - Displays individual match results with confidence scores
 */

import React from 'react';
import { CheckCircle, Star, Award, Hash, Calendar, ThumbsUp, Edit3 } from 'lucide-react';
import { PokemonCard, PokemonButton } from '../../../shared/components/atoms/design-system';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface OcrMatchResultProps {
  match: {
    card: {
      _id: string;
      cardName: string;
      cardNumber: string;
      setName: string;
      variety?: string;
      rarity?: string;
    };
    matchScore: number;
    confidence: number;
    searchStrategy: string;
    reasons: string[];
    totalScore: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  onApprove?: (match: any) => void;
  onEdit?: (match: any) => void;
  psaLabelId?: string;
  ocrText?: string;
}

export const OcrMatchResult: React.FC<OcrMatchResultProps> = ({
  match,
  isSelected,
  onSelect,
  onApprove,
  onEdit,
  psaLabelId,
  ocrText,
}) => {
  const { card, confidence, searchStrategy, reasons, totalScore, matchScore } = match;

  const strategyLabels = {
    combined: 'Combined Search',
    formatted: 'Formatted Search',
    fulltext: 'Full Text Search',
    pokemon_only: 'Pokemon Only',
    manual: 'Manual Selection',
  };

  const strategyColors = {
    combined: 'bg-green-100 text-green-800',
    formatted: 'bg-blue-100 text-blue-800',
    fulltext: 'bg-purple-100 text-purple-800',
    pokemon_only: 'bg-yellow-100 text-yellow-800',
    manual: 'bg-gray-100 text-gray-800',
  };

  return (
    <PokemonCard
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' 
          : 'hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Card Information */}
          <div className="flex items-start gap-3 mb-3">
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-gray-900 mb-1">
                {card.cardName}
              </h4>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  <span className="font-medium">{card.cardNumber}</span>
                </div>
                
                {card.variety && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{card.variety}</span>
                  </div>
                )}
                
                {card.rarity && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{card.rarity}</span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {card.setName}
              </p>
            </div>
          </div>

          {/* Match Details */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ConfidenceIndicator confidence={confidence} size="sm" />
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                strategyColors[searchStrategy as keyof typeof strategyColors] || 
                'bg-gray-100 text-gray-800'
              }`}>
                {strategyLabels[searchStrategy as keyof typeof strategyLabels] || searchStrategy}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Score: {((totalScore || matchScore || confidence || 0) * 100).toFixed(0)}%
            </div>
          </div>

          {/* Match Reasons */}
          {reasons && reasons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {reasons.map((reason, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(onApprove || onEdit) && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex gap-3 justify-end">
                {onEdit && (
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
                    Edit Match
                  </PokemonButton>
                )}
                
                {onApprove && (
                  <PokemonButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // This should work like hierarchical search - auto-select this card
                      onSelect(); // Select this match first
                      // Then trigger approval flow
                      setTimeout(() => {
                        onApprove({ grade: '10', myPrice: 0 }); // Default values
                      }, 100);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Select & Approve
                  </PokemonButton>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PokemonCard>
  );
};