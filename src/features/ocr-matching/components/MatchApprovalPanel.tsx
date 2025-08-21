/**
 * Match Approval Panel - Final review and approval interface
 */

import React, { useState } from 'react';
import { CheckCircle, XCircle, Hash, Package, Star, Award, DollarSign } from 'lucide-react';
import { 
  PokemonCard, 
  PokemonButton,
  PokemonInput 
} from '../../../shared/components/atoms/design-system';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface MatchApprovalPanelProps {
  match: {
    card: {
      _id: string;
      cardName: string;
      cardNumber: string;
      setName: string;
      variety?: string;
      rarity?: string;
    };
    confidence: number;
    searchStrategy: string;
    reasons: string[];
  };
  ocrText: string;
  extractedData: {
    pokemonName?: string;
    cardNumber?: string;
  };
  onApprove: (approvalData: { grade?: string; myPrice?: number }) => void;
  onReject: () => void;
}

export const MatchApprovalPanel: React.FC<MatchApprovalPanelProps> = ({
  match,
  ocrText,
  extractedData,
  onApprove,
  onReject,
}) => {
  const { card, confidence, searchStrategy, reasons } = match;
  const [grade, setGrade] = useState('10'); // Default PSA 10
  const [myPrice, setMyPrice] = useState(0);

  const handleApprove = () => {
    onApprove({ 
      grade: grade || '10', 
      myPrice: parseFloat(myPrice.toString()) || 0 
    });
  };

  return (
    <PokemonCard className="p-6 border-green-200 bg-green-50">
      <div className="flex items-start justify-between mb-6">
        <h4 className="text-lg font-semibold text-green-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          Review Selected Match
        </h4>
        <ConfidenceIndicator confidence={confidence} size="lg" />
      </div>

      {/* Card Details */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h5 className="text-xl font-bold text-gray-900 mb-4">
          {card.cardName}
        </h5>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Card Number:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">
                {card.cardNumber}
              </span>
            </div>

            {card.variety && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Variety:</span>
                <span className="text-gray-700">{card.variety}</span>
              </div>
            )}

            {card.rarity && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Rarity:</span>
                <span className="text-gray-700">{card.rarity}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Set:</span>
              <span className="text-gray-700">
                {card.setName || 'MISSING SET NAME - CHECK HIERARCHICAL SEARCH'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Strategy:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm capitalize">
                {searchStrategy.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {reasons && reasons.length > 0 && (
          <div className="border-t pt-4">
            <span className="font-medium text-gray-700 mb-2 block">Match Reasons:</span>
            <div className="flex flex-wrap gap-2">
              {reasons.map((reason, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comparison */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <h6 className="font-semibold text-gray-900 mb-4">OCR vs Selected Card</h6>
        
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h7 className="font-medium text-gray-600 mb-2">Extracted from OCR:</h7>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Pokemon Name:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
                  {extractedData.pokemonName || 'Not detected'}
                </span>
              </div>
              <div>
                <span className="font-medium">Card Number:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 rounded">
                  {extractedData.cardNumber || 'Not detected'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h7 className="font-medium text-gray-600 mb-2">Selected Card:</h7>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Card Name:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 rounded">
                  {card.cardName}
                </span>
              </div>
              <div>
                <span className="font-medium">Card Number:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 rounded">
                  {card.cardNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Text Preview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h6 className="font-medium text-gray-700 mb-2">Original OCR Text:</h6>
        <p className="text-sm text-gray-600 font-mono leading-relaxed">
          {ocrText.length > 200 ? `${ocrText.substring(0, 200)}...` : ocrText}
        </p>
      </div>

      {/* PSA Card Details for Collection */}
      <div className="bg-white rounded-lg p-6 mb-6 border-2 border-blue-200">
        <h6 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          PSA Card Collection Details
        </h6>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PSA Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">PSA 10 (Gem Mint)</option>
              <option value="9">PSA 9 (Mint)</option>
              <option value="8">PSA 8 (Near Mint-Mint)</option>
              <option value="7">PSA 7 (Near Mint)</option>
              <option value="6">PSA 6 (Excellent-Mint)</option>
              <option value="5">PSA 5 (Excellent)</option>
              <option value="4">PSA 4 (Very Good-Excellent)</option>
              <option value="3">PSA 3 (Very Good)</option>
              <option value="2">PSA 2 (Good)</option>
              <option value="1">PSA 1 (Poor)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              My Price ($)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={myPrice}
                onChange={(e) => setMyPrice(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <PokemonButton
          variant="outline"
          onClick={onReject}
          className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4" />
          Reject & Try Again
        </PokemonButton>

        <PokemonButton
          onClick={handleApprove}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4" />
          Approve & Add PSA Card
        </PokemonButton>
      </div>
    </PokemonCard>
  );
};