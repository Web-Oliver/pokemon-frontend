import React, { useState, useEffect, useMemo } from 'react';
import { Star, Check, X, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { CardSuggestion, ExtractedCardData } from '../../../types/ocr';

// 🔧 ENHANCED SET INFO EXTRACTION - Handles multiple data structures with PROPER PRIORITY
const getSetInfo = (card: any) => {
  // FIXED: Priority order for set name extraction - setDisplayName should be FIRST when setId is null
  const setName = 
    card?.setId?.setName ||           // Populated setId (preferred)
    card?.setDisplayName ||           // Fallback display name (CRITICAL for uniqueSetId cases)
    card?.fallbackSetName ||          // Explicit fallback
    card?.setName ||                  // Direct setName field
    'Unknown Set';                    // Last resort
  
  // FIXED: Priority order for year extraction with proper fallback
  const year = 
    card?.setId?.year ||              // Populated setId year (preferred)
    card?.year ||                     // Direct year field
    'Unknown Year';                   // Fallback
    
  return { setName, year };
};

/**
 * Card Suggestions Component
 * 
 * Displays OCR-detected card suggestions with intelligent ranking and selection
 * Follows existing component patterns with proper error handling and accessibility
 */

interface CardSuggestionsProps {
  suggestions: CardSuggestion[];
  onSelectCard: (card: CardSuggestion) => void;
  onDismiss: () => void;
  extractedData?: ExtractedCardData;
  isLoading?: boolean;
  error?: string;
  maxHeight?: string;
  showConfidence?: boolean;
  allowMultiSelect?: boolean;
}

export const CardSuggestions: React.FC<CardSuggestionsProps> = ({
  suggestions,
  onSelectCard,
  onDismiss,
  extractedData,
  isLoading = false,
  error,
  maxHeight = '64',
  showConfidence = true,
  allowMultiSelect = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
    setSelectedCards(new Set());
  }, [suggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!suggestions.length) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelectCard(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onDismiss();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [suggestions, selectedIndex, onSelectCard, onDismiss]);

  // Grouped suggestions by confidence level
  const groupedSuggestions = useMemo(() => {
    if (!suggestions.length) return { high: [], medium: [], low: [] };

    return suggestions.reduce((groups, suggestion) => {
      const score = suggestion.matchScore;
      if (score >= 80) groups.high.push(suggestion);
      else if (score >= 60) groups.medium.push(suggestion);
      else groups.low.push(suggestion);
      return groups;
    }, { high: [] as CardSuggestion[], medium: [] as CardSuggestion[], low: [] as CardSuggestion[] });
  }, [suggestions]);

  const handleCardSelect = (card: CardSuggestion, index: number) => {
    if (allowMultiSelect) {
      const newSelected = new Set(selectedCards);
      if (newSelected.has(card._id)) {
        newSelected.delete(card._id);
      } else {
        newSelected.add(card._id);
      }
      setSelectedCards(newSelected);
    } else {
      setSelectedIndex(index);
      onSelectCard(card);
    }
  };

  const formatGradeInfo = (grades?: CardSuggestion['grades']) => {
    if (!grades) return null;
    
    const { grade_total, grade_10, grade_9, grade_8 } = grades;
    if (!grade_total) return null;

    return (
      <div className="text-xs text-gray-500 mt-1">
        <span className="font-medium">PSA Pop:</span> {grade_total.toLocaleString()}
        {grade_10 > 0 && <span className="ml-2">PSA 10: {grade_10.toLocaleString()}</span>}
      </div>
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-blue-200 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">Detecting cards...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Detection Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <button
          onClick={onDismiss}
          className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
        >
          Continue with manual entry
        </button>
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">No Cards Found</h3>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close suggestions"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          No matching cards were found in the database. Try manual entry or adjust the image.
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
        >
          Manual Entry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-lg max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-blue-900">
            Card Detection Results
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {suggestions.length} match{suggestions.length !== 1 ? 'es' : ''}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Close suggestions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Extracted Information */}
      {extractedData && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-2">Detected Information:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {extractedData.cardName && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Card:</span>
                <span className="text-gray-900">{extractedData.cardName}</span>
              </div>
            )}
            {extractedData.setName && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Set:</span>
                <span className="text-gray-900">{extractedData.setName}</span>
              </div>
            )}
            {extractedData.year && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Year:</span>
                <span className="text-gray-900">{extractedData.year}</span>
              </div>
            )}
            {extractedData.cardNumber && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Number:</span>
                <span className="text-gray-900">#{extractedData.cardNumber}</span>
              </div>
            )}
            {extractedData.grade && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Grade:</span>
                <span className="text-gray-900">{extractedData.grade}</span>
              </div>
            )}
            {extractedData.certificationNumber && (
              <div className="flex">
                <span className="font-medium text-gray-600 w-16">Cert:</span>
                <span className="text-gray-900">{extractedData.certificationNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Suggestions */}
      <div className={`space-y-1 max-h-${maxHeight} overflow-y-auto p-2`}>
        {/* High Confidence Matches */}
        {groupedSuggestions.high.length > 0 && (
          <div>
            <div className="text-xs font-medium text-green-700 px-2 py-1">
              High Confidence Matches
            </div>
            {groupedSuggestions.high.map((card, groupIndex) => {
              const globalIndex = groupIndex;
              return (
                <SuggestionCard
                  key={card._id}
                  card={card}
                  index={globalIndex}
                  isSelected={selectedIndex === globalIndex}
                  isMultiSelected={selectedCards.has(card._id)}
                  onSelect={() => handleCardSelect(card, globalIndex)}
                  showConfidence={showConfidence}
                  getConfidenceColor={getConfidenceColor}
                  getConfidenceLabel={getConfidenceLabel}
                  formatGradeInfo={formatGradeInfo}
                />
              );
            })}
          </div>
        )}

        {/* Medium Confidence Matches */}
        {groupedSuggestions.medium.length > 0 && (
          <div>
            <div className="text-xs font-medium text-yellow-700 px-2 py-1">
              Medium Confidence Matches
            </div>
            {groupedSuggestions.medium.map((card, groupIndex) => {
              const globalIndex = groupedSuggestions.high.length + groupIndex;
              return (
                <SuggestionCard
                  key={card._id}
                  card={card}
                  index={globalIndex}
                  isSelected={selectedIndex === globalIndex}
                  isMultiSelected={selectedCards.has(card._id)}
                  onSelect={() => handleCardSelect(card, globalIndex)}
                  showConfidence={showConfidence}
                  getConfidenceColor={getConfidenceColor}
                  getConfidenceLabel={getConfidenceLabel}
                  formatGradeInfo={formatGradeInfo}
                />
              );
            })}
          </div>
        )}

        {/* Low Confidence Matches */}
        {groupedSuggestions.low.length > 0 && (
          <div>
            <div className="text-xs font-medium text-red-700 px-2 py-1">
              Low Confidence Matches
            </div>
            {groupedSuggestions.low.map((card, groupIndex) => {
              const globalIndex = groupedSuggestions.high.length + groupedSuggestions.medium.length + groupIndex;
              return (
                <SuggestionCard
                  key={card._id}
                  card={card}
                  index={globalIndex}
                  isSelected={selectedIndex === globalIndex}
                  isMultiSelected={selectedCards.has(card._id)}
                  onSelect={() => handleCardSelect(card, globalIndex)}
                  showConfidence={showConfidence}
                  getConfidenceColor={getConfidenceColor}
                  getConfidenceLabel={getConfidenceLabel}
                  formatGradeInfo={formatGradeInfo}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => {
            if (allowMultiSelect && selectedCards.size > 0) {
              // Handle multi-select logic
              const firstSelectedCard = suggestions.find(s => selectedCards.has(s._id));
              if (firstSelectedCard) onSelectCard(firstSelectedCard);
            } else if (suggestions[selectedIndex]) {
              onSelectCard(suggestions[selectedIndex]);
            }
          }}
          disabled={!suggestions[selectedIndex] && (!allowMultiSelect || selectedCards.size === 0)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Use Selected Card{allowMultiSelect && selectedCards.size > 1 ? 's' : ''}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          Manual Entry
        </button>
      </div>
    </div>
  );
};

/**
 * Individual Suggestion Card Component
 */
interface SuggestionCardProps {
  card: CardSuggestion;
  index: number;
  isSelected: boolean;
  isMultiSelected: boolean;
  onSelect: () => void;
  showConfidence: boolean;
  getConfidenceColor: (score: number) => string;
  getConfidenceLabel: (score: number) => string;
  formatGradeInfo: (grades?: CardSuggestion['grades']) => React.ReactNode;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  card,
  index,
  isSelected,
  isMultiSelected,
  onSelect,
  showConfidence,
  getConfidenceColor,
  getConfidenceLabel,
  formatGradeInfo
}) => {
  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-sm' 
          : isMultiSelected
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect()}
      aria-label={`Select ${card.cardName} from ${getSetInfo(card).setName}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {card.cardName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            <span className="font-medium">{getSetInfo(card).setName}</span>
            {getSetInfo(card).year !== 'Unknown Year' && (
              <span className="text-gray-500"> ({getSetInfo(card).year})</span>
            )}
            {getSetInfo(card).setName === 'Unknown Set' && (
              <span className="text-red-500 ml-1">⚠️ Set data missing</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
            <span>#{card.cardNumber}</span>
            {card.variety && (
              <>
                <span>•</span>
                <span>{card.variety}</span>
              </>
            )}
          </div>
          {formatGradeInfo(card.grades)}
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {showConfidence && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getConfidenceColor(card.matchScore)}`}>
              <Star className="h-3 w-3" />
              <span className="font-medium">
                {card.matchScore && !isNaN(card.matchScore) ? Math.round(card.matchScore) : 0}%
              </span>
            </div>
          )}
          <div className="text-blue-600 hover:text-blue-800">
            <Check className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardSuggestions;