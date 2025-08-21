import React from 'react';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { ImageIcon, Clock, Edit3, Trash2, CheckCircle, Star, Hash, Award } from 'lucide-react';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { PsaLabelResult } from '../types/OcrMatchingTypes';

interface PsaLabelResultsProps {
  psaLabelResults: PsaLabelResult[];
  selectedPsaLabel: PsaLabelResult | null;
  onSelectPsaLabel: (result: PsaLabelResult) => void;
  onEditPsaLabel: (result: PsaLabelResult) => void;
  onDeletePsaLabel: (psaLabelId: string) => void;
}

export const PsaLabelResults: React.FC<PsaLabelResultsProps> = ({
  psaLabelResults,
  selectedPsaLabel,
  onSelectPsaLabel,
  onEditPsaLabel,
  onDeletePsaLabel,
}) => {
  // Add safety checks for undefined props
  if (!psaLabelResults || psaLabelResults.length === 0) return null;

  return (
    <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
      <div className="relative z-20 p-8">
        <h4 className="text-3xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          <ImageIcon className="w-8 h-8 text-purple-400" />
          PSA Label Processing Results ({psaLabelResults.length})
        </h4>
        
        <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-4">
          {psaLabelResults.map((result, index) => (
            <div
              key={result.psaLabelId}
              className={`p-8 border rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                selectedPsaLabel?.psaLabelId === result.psaLabelId
                  ? 'border-cyan-400/50 bg-cyan-500/20 ring-2 ring-cyan-500/60 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
                  : (result.matches && result.matches.length > 0)
                    ? 'border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30'
                    : 'border-red-400/50 bg-red-500/20 hover:bg-red-500/30'
              }`}
            >
              <div className="flex items-start gap-8 mb-6">
                {/* PSA Label Image */}
                {result.labelImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={`http://localhost:3000/api/ocr/psa-label/${result.psaLabelId}/image`}
                      alt={`PSA Label ${index + 1}`}
                      className="w-48 h-60 object-cover rounded-xl border-2 border-zinc-600/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer backdrop-blur-sm"
                      onClick={() => {
                        window.open(`http://localhost:3000/api/ocr/psa-label/${result.psaLabelId}/image`, '_blank');
                      }}
                      onError={(e) => {
                        console.error(`Failed to load image: ${result.labelImage}`);
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2MEg4OFY4MEg0MFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                        e.currentTarget.className = "w-48 h-60 object-cover rounded-xl border-2 border-red-400/50 bg-zinc-800/90 flex items-center justify-center";
                      }}
                    />
                    <p className="text-sm text-cyan-100/70 mt-2 text-center font-medium">Click to view full size</p>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-black text-lg text-white">
                      PSA Label {index + 1}
                      {result.certificationNumber && (
                        <span className="ml-3 text-cyan-100/70 text-base">#{result.certificationNumber}</span>
                      )}
                    </p>
                    {result.alreadyProcessed && (
                      <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full flex items-center gap-2 border border-cyan-400/30 font-medium">
                        <Clock className="w-4 h-4" />
                        Processed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-cyan-100/90 mt-3 line-clamp-3 leading-relaxed">
                    {result.ocrText.substring(0, 200)}...
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2">
                    {(result.matches && result.matches.length > 0) ? (
                      <>
                        <ConfidenceIndicator confidence={result.confidence || 0} size="sm" />
                        <span className="text-sm text-emerald-300 font-medium">
                          {result.matches.length} matches
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-red-300 font-medium">No matches</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Single Edit Action */}
                    {(result.matches && result.matches.length > 0) ? (
                      <PokemonButton
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPsaLabel(result);
                        }}
                        className="text-xs px-3 py-1 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Selection
                      </PokemonButton>
                    ) : (
                      <PokemonButton
                        size="sm"
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPsaLabel(result);
                        }}
                        className="text-xs px-3 py-1 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Find Match
                      </PokemonButton>
                    )}
                    
                    {/* Delete Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePsaLabel(result.psaLabelId);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
                      title="Delete this PSA label"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* MATCHED CARDS DISPLAY */}
              {(result.matches && result.matches.length > 0) && (
                <div className="mt-8 pt-8 border-t border-zinc-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Match Results ({result.matches.length} found)
                    </h5>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30">
                      Ranked by Relevance
                    </span>
                  </div>
                  
                  <div className="space-y-6">
                    {(result.matches || []).slice(0, 2).map((match, matchIndex) => (
                      <div 
                        key={matchIndex} 
                        className={`group relative bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                          matchIndex === 0 
                            ? 'border-emerald-400/50 hover:border-emerald-400/70 hover:shadow-lg hover:shadow-emerald-400/20' 
                            : 'border-zinc-700/50 hover:border-cyan-400/50'
                        }`}
                        onClick={() => onSelectPsaLabel(result)}
                      >
                        {matchIndex === 0 && (
                          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
                            <Star className="w-3 h-3" />
                            #1
                          </div>
                        )}
                        {matchIndex === 1 && (
                          <div className="absolute -top-2 -left-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
                            #2
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h6 className="font-black text-white text-sm mb-1">
                              {match.card.cardName}
                            </h6>
                            <div className="flex items-center gap-4 text-xs text-cyan-100/90 mb-2">
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3 text-cyan-400" />
                                <span className="text-cyan-300 font-medium">{match.card.cardNumber}</span>
                              </div>
                              {match.card.variety && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-purple-400" />
                                  <span className="text-purple-300">{match.card.variety}</span>
                                </div>
                              )}
                              {match.card.rarity && (
                                <div className="flex items-center gap-1">
                                  <Award className="w-3 h-3 text-yellow-400" />
                                  <span className="text-yellow-300">{match.card.rarity}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-white/90 font-medium mb-2">
                              📁 {match.card.setName}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <ConfidenceIndicator confidence={match.confidence || 0} size="sm" />
                            <span className="text-sm px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-400/30 font-medium">
                              {match.confidence ? `${(match.confidence * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                            {match.searchStrategy && (
                              <span className="text-sm px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-400/30 font-medium">
                                {match.searchStrategy.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Single Primary Action */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-cyan-100/70">
                            {matchIndex === 0 ? 'Best match - Click to select' : 'Alternative match - Click to select'}
                          </span>
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Select This Card</span>
                          </div>
                        </div>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    ))}
                    
                    {(result.matches && result.matches.length > 2) && (
                      <button 
                        onClick={() => onEditPsaLabel(result)}
                        className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 py-4 border border-dashed border-cyan-400/30 rounded-xl hover:border-cyan-400/50 transition-colors font-medium"
                      >
                        View {(result.matches?.length || 0) - 2} more matches...
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PokemonCard>
  );
};