/**
 * OCR Matching Page - Main interface for OCR card matching workflow
 * 
 * Features:
 * - OCR text input and automatic matching
 * - Confidence scores and match visualization
 * - Hierarchical search and manual selection
 * - Approval workflow for adding to collection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';

// Comprehensive debugging utility for OCR matching page
const debugLog = (context: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [OCR-PAGE-${context}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Upload,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Database,
  Play,
  Image as ImageIcon,
  Trash2,
  Clock,
  Hash,
  Star,
  Award
} from 'lucide-react';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { 
  PokemonPageContainer, 
  PokemonCard, 
  PokemonButton, 
  PokemonInput 
} from '../../../shared/components/atoms/design-system';
import { useOcrMatching } from '../hooks/useOcrMatching';
import { OcrMatchResult } from '../components/OcrMatchResult';
import HierarchicalCardSearch from '../../../shared/components/forms/sections/HierarchicalCardSearch';
import { ConfidenceIndicator } from '../components/ConfidenceIndicator';
import { MatchApprovalPanel } from '../components/MatchApprovalPanel';

interface OcrMatchingState {
  ocrText: string;
  matches: any[];
  setRecommendations: any[]; // Add setRecommendations from hierarchical search
  selectedMatch: any | null;
  isEditing: boolean;
  showCardSelector: boolean;
  extractedData: any;
  confidence: number;
  isProcessing: boolean;
  // New state for PSA label processing
  psaLabelResults: any[];
  selectedPsaLabel: any | null;
  showPsaLabelProcessing: boolean;
  psaProcessingStats: any;
  // Form editing state
  isEditingCard: boolean;
  editingCardImage: string | null;
  // Approval form state
  gradeValue?: string;
  priceValue?: number;
  dateValue?: string;
  // Set filtering state
  selectedSetName?: string | null;
  filteredMatches?: any[] | null;
  // Approval form state
  showApprovalForm?: boolean;
}

const OcrMatching: React.FC = () => {
  const [state, setState] = useState<OcrMatchingState>({
    ocrText: '',
    matches: [],
    setRecommendations: [], // Initialize setRecommendations
    selectedMatch: null,
    isEditing: false,
    showCardSelector: false,
    extractedData: null,
    confidence: 0,
    isProcessing: false,
    // New state for PSA label processing
    psaLabelResults: [],
    selectedPsaLabel: null,
    showPsaLabelProcessing: false,
    psaProcessingStats: null,
    // Form editing state
    isEditingCard: false,
    editingCardImage: null,
    // Approval form state
    gradeValue: '10',
    priceValue: 0,
    dateValue: new Date().toISOString().split('T')[0],
    // Set filtering state
    selectedSetName: null,
    filteredMatches: null,
    // Approval form state
    showApprovalForm: false
  });

  const { 
    matchOcrText, 
    processAllPsaLabels,
    deletePsaLabel,
    searchSets, 
    searchCards, 
    approveMatch,
    editExtractedData,
    loading,
    error 
  } = useOcrMatching();

  // Form management for hierarchical card search
  const form = useForm({
    defaultValues: {
      setName: '',
      cardName: '',
      cardId: '',
      cardNumber: '',
      variety: ''
    }
  });

  // Handle OCR text submission
  const handleOcrSubmit = useCallback(async () => {
    if (!state.ocrText.trim()) {
      debugLog('SUBMIT_ERROR', 'No OCR text provided');
      return;
    }

    debugLog('SUBMIT_START', 'Starting OCR text submission', {
      ocrTextLength: state.ocrText.length,
      ocrTextPreview: state.ocrText.substring(0, 50) + '...'
    });

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await matchOcrText(state.ocrText);
      
      debugLog('SUBMIT_SUCCESS', 'OCR matching completed successfully', {
        matchCount: result.matches?.length || 0,
        setRecommendationsCount: result.setRecommendations?.length || 0,
        confidence: result.confidence || 0,
        hasExtractedData: !!result.extractedData,
        bestMatch: result.matches?.[0]?.card?.cardName,
        topSetRecommendation: result.setRecommendations?.[0]?.setName
      });
      
      // CRITICAL DEBUG: Log complete setRecommendations data
      console.log('🔍 [FRONTEND-DEBUG] Complete API Response:', result);
      console.log('🔍 [FRONTEND-DEBUG] SetRecommendations:', result.setRecommendations);
      console.log('🔍 [FRONTEND-DEBUG] Matches with setNames:', result.matches?.map(m => ({
        cardName: m.card.cardName,
        setName: m.card.setName,
        setId: m.card.setId
      })));

      console.log('🔍 [FRONTEND-DEBUG] Setting state with matches:', result.matches);
      console.log('🔍 [FRONTEND-DEBUG] Matches length:', result.matches?.length);
      console.log('🔍 [FRONTEND-DEBUG] First match:', result.matches?.[0]);
      
      setState(prev => {
        const newState = {
          ...prev,
          matches: result.matches || [],
          setRecommendations: result.setRecommendations || [], // Store setRecommendations from API
          extractedData: result.extractedData,
          confidence: result.matches && result.matches.length > 0 ? result.matches[0].confidence : 0,
          selectedMatch: result.matches && result.matches.length > 0 ? result.matches[0] : null,
          isProcessing: false
        };
        console.log('🔍 [FRONTEND-DEBUG] New state matches length:', newState.matches.length);
        console.log('🔍 [FRONTEND-DEBUG] New state:', newState);
        return newState;
      });
    } catch (err) {
      debugLog('SUBMIT_ERROR', 'OCR matching failed', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('OCR matching error:', err);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.ocrText, matchOcrText]);

  // Legacy manual selection - replaced by hierarchical search
  // This callback is no longer used but kept for compatibility

  // Handle match approval
  const handleApproveMatch = useCallback(async (approvalData: { grade?: string; myPrice?: number }) => {
    // FIXED: Better validation with fallback OCR text from selected PSA label
    const ocrTextToUse = state.ocrText || state.selectedPsaLabel?.ocrText || '';
    
    if (!state.selectedMatch) {
      debugLog('APPROVE_ERROR', 'Missing selected match for approval', {
        hasSelectedMatch: !!state.selectedMatch,
        hasOcrText: !!state.ocrText,
        hasPsaLabel: !!state.selectedPsaLabel,
        psaLabelOcrText: !!state.selectedPsaLabel?.ocrText
      });
      alert('Please select a card match first');
      return;
    }
    
    if (!ocrTextToUse) {
      debugLog('APPROVE_ERROR', 'Missing OCR text for approval', {
        hasSelectedMatch: !!state.selectedMatch,
        hasOcrText: !!state.ocrText,
        hasPsaLabel: !!state.selectedPsaLabel,
        psaLabelOcrText: !!state.selectedPsaLabel?.ocrText
      });
      alert('Missing OCR text. Please process the PSA label again.');
      return;
    }

    debugLog('APPROVE_START', 'Starting match approval', {
      cardName: state.selectedMatch.card.cardName,
      cardNumber: state.selectedMatch.card.cardNumber,
      grade: approvalData.grade,
      myPrice: approvalData.myPrice,
      confidence: state.confidence,
      ocrTextSource: state.ocrText ? 'direct' : 'psaLabel',
      ocrTextLength: ocrTextToUse.length
    });

    try {
      const result = await approveMatch({
        ocrText: ocrTextToUse, // Use fallback OCR text
        selectedCard: state.selectedMatch.card,
        extractedData: state.extractedData || state.selectedPsaLabel?.extractedData,
        confidence: state.confidence || state.selectedPsaLabel?.confidence || 0,
        grade: approvalData.grade,
        myPrice: approvalData.myPrice
      });

      debugLog('APPROVE_SUCCESS', 'Match approval completed successfully', {
        psaCardId: result.psaCard?._id,
        cardName: result.psaCard?.cardInfo?.cardName,
        grade: result.psaCard?.grade,
        hasImage: result.psaCard?.images?.length > 0
      });

      // Reset form after successful approval
      setState({
        ocrText: '',
        matches: [],
        setRecommendations: [], // Reset setRecommendations
        selectedMatch: null,
        isEditing: false,
        showCardSelector: false,
        extractedData: null,
        confidence: 0,
        isProcessing: false,
        psaLabelResults: [],
        selectedPsaLabel: null,
        showPsaLabelProcessing: false,
        psaProcessingStats: null,
        isEditingCard: false,
        editingCardImage: null,
        gradeValue: '10',
        priceValue: 0,
        dateValue: new Date().toISOString().split('T')[0],
        selectedSetName: null,
        filteredMatches: null,
        showApprovalForm: false
      });

      // Show success message with PSA card details
      const cardInfo = result.psaCard?.cardInfo || state.selectedMatch.card;
      alert(`PSA card added successfully!\n${cardInfo.cardName} (${cardInfo.cardNumber}) - Grade ${approvalData.grade}`);
    } catch (err) {
      debugLog('APPROVE_ERROR', 'Match approval failed', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('Approval error:', err);
      alert('Failed to approve match and create PSA card. Please try again.');
    }
  }, [state.selectedMatch, state.ocrText, state.extractedData, state.confidence, approveMatch]);

  // Handle extracted data editing
  const handleEditExtraction = useCallback(async (corrections: any) => {
    try {
      const result = await editExtractedData(state.ocrText, corrections);
      
      setState(prev => ({
        ...prev,
        matches: result.newMatches || [],
        extractedData: result.correctedData,
        confidence: result.confidence || 0,
        selectedMatch: result.newMatches && result.newMatches.length > 0 ? result.newMatches[0] : null,
        isEditing: false
      }));
    } catch (err) {
      console.error('Edit extraction error:', err);
    }
  }, [state.ocrText, editExtractedData]);

  // Handle PSA label processing
  const handleProcessAllPsaLabels = useCallback(async () => {
    debugLog('PSA_PROCESS_START', 'Starting PSA labels processing');

    setState(prev => ({ ...prev, isProcessing: true, showPsaLabelProcessing: true }));

    try {
      const result = await processAllPsaLabels({ limit: 50 });
      
      debugLog('PSA_PROCESS_SUCCESS', 'PSA labels processing completed', {
        totalResults: result.results?.length || 0,
        successfulMatches: result.summary?.successful || 0,
        failedMatches: result.summary?.failed || 0,
        averageConfidence: result.summary?.averageConfidence || 0
      });
      
      setState(prev => ({
        ...prev,
        psaLabelResults: result.results || [],
        psaProcessingStats: result.summary,
        isProcessing: false
      }));
    } catch (err) {
      debugLog('PSA_PROCESS_ERROR', 'PSA labels processing failed', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('PSA label processing error:', err);
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [processAllPsaLabels]);

  // Handle selecting a PSA label result for approval
  const handleSelectPsaLabel = useCallback((psaLabelResult: any) => {
    debugLog('PSA_LABEL_SELECT', 'Selecting PSA label for approval', {
      psaLabelId: psaLabelResult.psaLabelId,
      hasMatches: !!psaLabelResult.matches?.length,
      matchesCount: psaLabelResult.matches?.length || 0,
      hasOcrText: !!psaLabelResult.ocrText,
      hasSetRecommendations: !!psaLabelResult.setRecommendations?.length,
      setRecommendationsCount: psaLabelResult.setRecommendations?.length || 0
    });

    if (psaLabelResult.matches && psaLabelResult.matches.length > 0) {
      setState(prev => ({
        ...prev,
        selectedPsaLabel: psaLabelResult,
        ocrText: psaLabelResult.ocrText || '',
        matches: psaLabelResult.matches,
        setRecommendations: psaLabelResult.setRecommendations || [], // Include setRecommendations
        extractedData: psaLabelResult.extractedData,
        confidence: psaLabelResult.confidence || 0,
        selectedMatch: psaLabelResult.matches[0], // Pre-select best match
        filteredMatches: null, // Reset any filtering
        selectedSetName: null // Reset set selection
      }));
    } else {
      debugLog('PSA_LABEL_SELECT_ERROR', 'PSA label has no matches', {
        psaLabelId: psaLabelResult.psaLabelId,
        matches: psaLabelResult.matches
      });
      alert('This PSA label has no card matches. Please try a different label.');
    }
  }, []);

  // Handle deleting a PSA label
  const handleDeletePsaLabel = useCallback(async (psaLabelId: string) => {
    if (!confirm('Are you sure you want to delete this PSA label? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting PSA Label:', psaLabelId);
      const result = await deletePsaLabel(psaLabelId);
      console.log('Delete result:', result);
      
      // Remove from results immediately
      setState(prev => ({
        ...prev,
        psaLabelResults: prev.psaLabelResults.filter(result => result.psaLabelId !== psaLabelId)
      }));
      
      // Update stats to reflect deletion
      if (state.psaProcessingStats) {
        setState(prev => ({
          ...prev,
          psaProcessingStats: {
            ...prev.psaProcessingStats,
            totalProcessed: prev.psaProcessingStats.totalProcessed - 1
          }
        }));
      }
      
      alert(`PSA label deleted successfully!\n\nLabel ID: ${psaLabelId}\nRemoved from database and display.`);
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Failed to delete PSA label: ${err instanceof Error ? err.message : 'Unknown error'}\n\nPlease try again.`);
    }
  }, [deletePsaLabel, state.psaProcessingStats]);

  // Handle card selection from hierarchical search
  const handleHierarchicalCardSelection = useCallback((selectedData: any) => {
    debugLog('HIERARCHICAL_SELECT', 'Card selected from hierarchical search', {
      cardId: selectedData.cardId,
      cardName: selectedData.cardName,
      setName: selectedData.setName,
      cardNumber: selectedData.cardNumber
    });

    // Create a match object similar to the OCR matching format
    const manualMatch = {
      card: {
        _id: selectedData.cardId,
        cardName: selectedData.cardName,
        cardNumber: selectedData.cardNumber,
        setName: selectedData.setName,
        variety: selectedData.variety,
        rarity: selectedData.rarity
      },
      matchScore: 1.0,
      confidence: 0.95,
      searchStrategy: 'hierarchical_manual',
      reasons: ['Manually selected via hierarchical search']
    };

    setState(prev => ({
      ...prev,
      selectedMatch: manualMatch,
      isEditingCard: false,
      showCardSelector: false
    }));
  }, []);

  return (
    <PageLayout
      title="OCR Card Matching"
      subtitle="Extract and match Pokemon cards from OCR text with AI-powered precision"
    >
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Main Header */}
        <PokemonCard
          variant="glass"
          size="xl"
          className="text-white relative overflow-hidden"
        >
          <div className="relative z-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  OCR Card Matching
                </h1>
                <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                  Extract and match Pokemon cards from OCR text with AI-powered precision
                </p>
              </div>
            </div>
          </div>
        </PokemonCard>
        
        {/* PSA Label Processing Section */}
        <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
          <div className="relative z-20">
            <h3 className="text-xl font-black mb-4 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              <Database className="w-6 h-6 text-cyan-400" />
              Process All PSA Labels
            </h3>
            
            <p className="text-cyan-100/90 text-lg font-medium mb-6">
              Process all PSA labels from your database through the OCR matching system. 
              This will run the validation script on all available PSA labels and show matching results.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <PokemonButton
                onClick={handleProcessAllPsaLabels}
                disabled={state.isProcessing}
                variant="primary"
                size="lg"
                className="flex items-center gap-2 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]"
              >
                <Play className="w-5 h-5" />
                {state.isProcessing ? 'Processing PSA Labels...' : 'Process All PSA Labels'}
              </PokemonButton>

              {state.showPsaLabelProcessing && (
                <>
                  <PokemonButton
                    variant="glass"
                    size="lg"
                    onClick={() => {
                      // Refresh the PSA labels list
                      handleProcessAllPsaLabels();
                    }}
                    disabled={state.isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-5 h-5" />
                    Refresh PSA Labels
                  </PokemonButton>
                  
                  <PokemonButton
                    variant="secondary"
                    size="lg"
                    onClick={() => setState(prev => ({ ...prev, showPsaLabelProcessing: false }))}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Show Manual Input
                  </PokemonButton>
                </>
              )}
            </div>
          </div>
        </PokemonCard>

        {state.psaProcessingStats && (
          <PokemonCard variant="glass" size="lg" className="text-white relative overflow-hidden">
            <div className="relative z-20">
              <h4 className="text-lg font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Processing Results
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <span className="text-cyan-100/70 text-sm font-medium block mb-2">Total Processed</span>
                  <div className="text-2xl font-black text-white">{state.psaProcessingStats.totalProcessed}</div>
                </div>
                <div className="text-center">
                  <span className="text-cyan-100/70 text-sm font-medium block mb-2">Successful</span>
                  <div className="text-2xl font-black text-emerald-400">{state.psaProcessingStats.successful}</div>
                </div>
                <div className="text-center">
                  <span className="text-cyan-100/70 text-sm font-medium block mb-2">Failed</span>
                  <div className="text-2xl font-black text-red-400">{state.psaProcessingStats.failed}</div>
                </div>
              </div>
            </div>
          </PokemonCard>
        )}

        {!state.showPsaLabelProcessing && (
          <>
            {/* OCR Input Section */}
            <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
              <div className="relative z-20">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  <Upload className="w-6 h-6 text-purple-400" />
                  Manual OCR Text Input
                </h3>
            
                <div className="space-y-6">
                  <div>
                    <label className="block text-cyan-100/90 text-sm font-medium mb-3">
                      Paste OCR text from PSA label:
                    </label>
                    <textarea
                      value={state.ocrText}
                      onChange={(e) => setState(prev => ({ ...prev, ocrText: e.target.value }))}
                      className="w-full h-32 p-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-xl resize-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/50 text-white placeholder-zinc-400 shadow-lg transition-all duration-300"
                      placeholder="2003 POKEMON JAPANESE # 025 AMPHAROS EX - HOLO NM - MT RULERS / HEAVENS 1ST ED . 8 70496958"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <PokemonButton
                      onClick={handleOcrSubmit}
                      disabled={!state.ocrText.trim() || state.isProcessing}
                      variant="primary"
                      size="lg"
                      className="flex items-center gap-2 shadow-[0_4px_14px_0_rgba(168,85,247,0.4)]"
                    >
                      <Search className="w-5 h-5" />
                      {state.isProcessing ? 'Processing...' : 'Match Cards'}
                    </PokemonButton>

                    {state.extractedData && (
                      <PokemonButton
                        variant="glass"
                        size="lg"
                        onClick={() => setState(prev => ({ ...prev, isEditing: true }))}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="w-5 h-5" />
                        Edit Extraction
                      </PokemonButton>
                    )}
                  </div>
                </div>
              </div>
            </PokemonCard>

        {/* Extracted Data Display */}
        {state.extractedData && (
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
                    {state.extractedData.pokemonName || 'Not detected'}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-cyan-100/70 text-sm font-medium block mb-2">Card Number</span>
                  <div className="px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300 font-medium">
                    {state.extractedData.cardNumber || 'Not detected'}
                  </div>
                </div>
              </div>
            </div>
          </PokemonCard>
        )}

        {/* Recommended Sets - Use hierarchical search setRecommendations from API */}
        {state.setRecommendations.length > 0 && (
          <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
            <div className="relative z-20">
              <h4 className="text-xl font-black mb-4 flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                <Database className="w-6 h-6 text-cyan-400" />
                Recommended Sets (Hierarchical Search)
              </h4>
              <p className="text-cyan-100/90 text-lg font-medium mb-6">
                Based on hierarchical search analysis: CARD NAME + POKEMON NUMBER → FIND SETS. Click on a set to filter cards.
              </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.setRecommendations.map((setRec: any, index: number) => {
                // FIXED: Count matching cards for this set with debugging
                const cardsInSet = state.matches.filter(match => {
                  const setIdMatch = match.card.setId === setRec._id || match.card.setId?.toString() === setRec._id?.toString();
                  const setNameMatch = match.card.setName === setRec.setName;
                  const cardNameMatch = match.card.cardName && setRec.setName && 
                    match.card.cardName.toLowerCase().includes(setRec.setName.toLowerCase().split(' ')[0]);
                  
                  console.log(`🔍 [SET-FILTER-DEBUG] Checking card for set "${setRec.setName}":`, {
                    cardName: match.card.cardName,
                    cardSetId: match.card.setId,
                    cardSetName: match.card.setName,
                    setRecId: setRec._id,
                    setRecName: setRec.setName,
                    setIdMatch,
                    setNameMatch,
                    cardNameMatch,
                    willInclude: setIdMatch || setNameMatch || cardNameMatch
                  });
                  
                  return setIdMatch || setNameMatch || cardNameMatch;
                });
                
                return (
                  <PokemonButton
                    key={setRec._id || index}
                    variant="glass"
                    size="lg"
                    onClick={() => {
                      // Show cards from this set
                      setState(prev => ({
                        ...prev,
                        selectedSetName: setRec.setName,
                        filteredMatches: cardsInSet
                      }));
                    }}
                    className={`p-4 h-auto text-left flex flex-col items-start gap-3 transition-all duration-300 ${
                      state.selectedSetName === setRec.setName
                        ? 'ring-2 ring-cyan-500/60 border-cyan-400/50 bg-cyan-500/20 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
                        : 'hover:border-cyan-400/30 hover:bg-cyan-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-black text-sm text-white">{setRec.setName}</span>
                      <div className="flex gap-2">
                        {setRec.year && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                            {setRec.year}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                          {cardsInSet.length} cards
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {(() => {
                          console.log(`🔍 [SET-CONFIDENCE-FRONTEND] Set "${setRec.setName}" confidence:`, {
                            confidence: setRec.confidence,
                            confidenceType: typeof setRec.confidence,
                            isUndefined: setRec.confidence === undefined,
                            isNull: setRec.confidence === null,
                            fullSetRec: setRec
                          });
                          const confidence = setRec.confidence || 0;
                          return (
                            <>
                              <ConfidenceIndicator confidence={confidence} size="sm" />
                              <span className="text-xs text-cyan-100/90 font-medium">
                                {(confidence * 100).toFixed(0)}% confidence
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      {setRec.strategy && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30 font-medium">
                          {setRec.strategy.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {setRec.matchingCards && (
                      <span className="text-xs text-emerald-300 font-medium">
                        {setRec.matchingCards} matching cards found
                      </span>
                    )}
                  </PokemonButton>
                );
              })}
            </div>
            
              {state.selectedSetName && (
                <div className="mt-6 pt-4 border-t border-cyan-500/20">
                  <PokemonButton
                    variant="glass"
                    size="md"
                    onClick={() => setState(prev => ({ ...prev, selectedSetName: null, filteredMatches: null }))}
                    className="flex items-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    Show All Sets
                  </PokemonButton>
                </div>
              )}
            </div>
          </PokemonCard>
        )}

        {/* Match Results */}
        {state.matches.length > 0 && (
          <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
            <div className="relative z-20">
              <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
                {state.selectedSetName ? `Cards from ${state.selectedSetName}` : `All Match Results`} 
                ({(() => {
                  const displayMatches = state.filteredMatches ? state.filteredMatches : state.matches;
                  console.log(`🔍 [RENDER-COUNT-DEBUG] Match count display:`, {
                    totalMatches: state.matches.length,
                    filteredMatches: state.filteredMatches?.length || 0,
                    selectedSetName: state.selectedSetName,
                    displayCount: displayMatches.length,
                    displayMatches: displayMatches
                  });
                  return displayMatches.length;
                })()})
              </h4>
              <ConfidenceIndicator confidence={state.confidence} />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(() => {
                const displayMatches = state.filteredMatches ? state.filteredMatches : state.matches;
                console.log(`🔍 [RENDER-MATCHES-DEBUG] About to render matches:`, {
                  displayMatchesLength: displayMatches.length,
                  displayMatches: displayMatches,
                  totalMatches: state.matches.length,
                  filteredMatches: state.filteredMatches?.length || 0
                });
                return displayMatches;
              })().map((match, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                    state.selectedMatch === match
                      ? 'ring-2 ring-cyan-500/60 border-cyan-400/50 bg-cyan-500/20 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
                      : 'hover:border-cyan-400/30 border-zinc-700/50 bg-zinc-900/50 hover:bg-cyan-500/10'
                  }`}
                  onClick={() => {
                    // Auto-select this match like hierarchical search
                    setState(prev => ({ ...prev, selectedMatch: match }));
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Card Information */}
                      <div className="flex items-start gap-3 mb-3">
                        {state.selectedMatch === match && (
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
                            <span>
                              {(() => {
                                // DEBUG: Log the matching process
                                console.log(`🔍 [SET-NAME-DEBUG] Card ${index}:`, {
                                  cardName: match.card.cardName,
                                  cardSetId: match.card.setId,
                                  cardSetName: match.card.setName,
                                  setRecommendationsCount: state.setRecommendations?.length || 0,
                                  setRecommendations: state.setRecommendations
                                });

                                // FIXED: Use hierarchical search setRecommendations to get proper set name
                                if (state.setRecommendations && state.setRecommendations.length > 0) {
                                  // Try multiple matching strategies
                                  let matchingSetRec = null;
                                  
                                  // Strategy 1: Match by setId (if exists)
                                  if (match.card.setId) {
                                    matchingSetRec = state.setRecommendations.find(setRec => 
                                      setRec._id === match.card.setId || 
                                      setRec._id?.toString() === match.card.setId?.toString()
                                    );
                                  }
                                  
                                  // Strategy 2: Match by setName (if exists)
                                  if (!matchingSetRec && match.card.setName) {
                                    matchingSetRec = state.setRecommendations.find(setRec => 
                                      setRec.setName === match.card.setName
                                    );
                                  }
                                  
                                  // Strategy 3: Use highest confidence set recommendation as fallback
                                  if (!matchingSetRec && state.setRecommendations.length > 0) {
                                    matchingSetRec = state.setRecommendations[0]; // Highest confidence
                                    console.log(`🔍 [SET-FALLBACK] Using highest confidence set:`, matchingSetRec.setName);
                                  }
                                  
                                  if (matchingSetRec) {
                                    console.log(`✅ [SET-MATCH-FOUND] Using set:`, matchingSetRec.setName);
                                    return matchingSetRec.setName;
                                  }
                                }
                                
                                // Fallback to card's own setName or show debugging info
                                const fallback = match.card.setName || `NO SET DATA (Card ${index})`;
                                console.warn(`❌ [SET-FALLBACK] No hierarchical match found, using:`, fallback);
                                return fallback;
                              })()}
                            </span>
                            {(() => {
                              const matchingSetRec = state.setRecommendations.find(setRec => 
                                setRec._id === match.card.setId || setRec.setName === match.card.setName
                              );
                              if (matchingSetRec && matchingSetRec.strategy) {
                                return (
                                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30">
                                    {matchingSetRec.strategy.replace('_', ' ')}
                                  </span>
                                );
                              }
                              return null;
                            })()}
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
      
                      {/* Action Buttons - LIKE HIERARCHICAL SEARCH */}
                      <div className="flex gap-3 pt-3 border-t border-zinc-700/50">
                        <PokemonButton
                          variant="success"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Auto-select this match and show approval panel
                            setState(prev => ({ ...prev, selectedMatch: match }));
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
                            setState(prev => ({
                              ...prev,
                              selectedMatch: match,
                              isEditingCard: true,
                              editingCardImage: null
                            }));
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
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <PokemonButton
                variant="outline"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  isEditingCard: true,
                  editingCardImage: null
                }))}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Manual Selection
              </PokemonButton>
            </div>
            </div>
          </PokemonCard>
        )}

        {/* No Results Message */}
        {state.ocrText && !state.isProcessing && state.matches.length === 0 && state.extractedData && (
          <PokemonCard variant="glass" size="lg" className="text-center text-white relative overflow-hidden">
            <div className="relative z-20">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h4 className="text-lg font-black mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">No Matches Found</h4>
              <p className="text-cyan-100/90 mb-4">
                Couldn't find matching cards for the extracted data. Try manual selection.
              </p>
              <PokemonButton
                variant="primary"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  isEditingCard: true,
                  editingCardImage: null
                }))}
                className="flex items-center gap-2 mx-auto"
              >
                <Search className="w-4 h-4" />
                Search Manually
              </PokemonButton>
            </div>
          </PokemonCard>
        )}
          </>
        )}

        {/* PSA Label Results */}
        {state.showPsaLabelProcessing && state.psaLabelResults.length > 0 && (
          <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
            <div className="relative z-20">
              <h4 className="text-xl font-black mb-4 flex items-center gap-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <ImageIcon className="w-6 h-6 text-purple-400" />
                PSA Label Processing Results ({state.psaLabelResults.length})
              </h4>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {state.psaLabelResults.map((result, index) => (
                <div
                  key={result.psaLabelId}
                  className={`p-4 border rounded-xl transition-all duration-300 backdrop-blur-sm ${
                    state.selectedPsaLabel?.psaLabelId === result.psaLabelId
                      ? 'border-cyan-400/50 bg-cyan-500/20 ring-2 ring-cyan-500/60 shadow-[0_4px_14px_0_rgba(6,182,212,0.4)]'
                      : result.matches?.length > 0
                        ? 'border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/30'
                        : 'border-red-400/50 bg-red-500/20 hover:bg-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-2">
                    {/* PSA Label Image - LARGER AND MORE VISIBLE */}
                    {result.labelImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={`http://localhost:3000/api/ocr/psa-label/${result.psaLabelId}/image`}
                          alt={`PSA Label ${index + 1}`}
                          className="w-32 h-40 object-cover rounded-lg border-2 border-zinc-600/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer backdrop-blur-sm"
                          onClick={() => {
                            // Open full size image in new tab
                            window.open(`http://localhost:3000/api/ocr/psa-label/${result.psaLabelId}/image`, '_blank');
                          }}
                          onError={(e) => {
                            console.error(`Failed to load image: ${result.labelImage}`);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDEyOCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2MEg4OFY4MEg0MFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                            e.currentTarget.className = "w-32 h-40 object-cover rounded-lg border-2 border-red-400/50 bg-zinc-800/90 flex items-center justify-center";
                          }}
                        />
                        <p className="text-xs text-cyan-100/70 mt-1 text-center">Click to view full size</p>
                      </div>
                    )}
                    
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => result.matches?.length > 0 && handleSelectPsaLabel(result)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-sm text-white">
                          PSA Label {index + 1}
                          {result.certificationNumber && (
                            <span className="ml-2 text-cyan-100/70">#{result.certificationNumber}</span>
                          )}
                        </p>
                        {result.alreadyProcessed && (
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full flex items-center gap-1 border border-cyan-400/30">
                            <Clock className="w-3 h-3" />
                            Processed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-100/90 mt-1 line-clamp-2">
                        {result.ocrText.substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {result.matches?.length > 0 ? (
                          <>
                            <ConfidenceIndicator confidence={result.confidence} size="sm" />
                            <span className="text-xs text-emerald-300 font-medium">
                              {result.matches.length} matches
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-red-300 font-medium">No matches</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <PokemonButton
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Set editing state for this PSA label
                            setState(prev => ({
                              ...prev,
                              selectedPsaLabel: result,
                              ocrText: result.ocrText,
                              matches: result.matches || [],
                              extractedData: result.extractedData,
                              confidence: result.confidence || 0,
                              isEditingCard: true,
                              editingCardImage: result.labelImage,
                              showCardSelector: false
                            }));
                          }}
                          className="text-xs px-2 py-1"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </PokemonButton>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePsaLabel(result.psaLabelId);
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete PSA Label"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* TOP RECOMMENDATIONS - DIRECT CLICKABLE BUTTONS */}
                  {result.matches?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/50">
                      <p className="text-xs font-medium text-cyan-100/90 mb-2">
                        🎯 TOP RECOMMENDATIONS (Click to Select):
                      </p>
                      
                      {/* Show top 3 matches as clickable buttons */}
                      <div className="space-y-2">
                        {result.matches.slice(0, 3).map((match, matchIndex) => (
                          <div key={matchIndex} className="bg-zinc-800/50 rounded-xl p-3 border border-zinc-700/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-400/30">
                                #{matchIndex + 1} - {((match.confidence || 0) * 100).toFixed(0)}% confidence
                              </span>
                            </div>
                            
                            {/* SET NAME BUTTON */}
                            <div className="mb-2">
                              <label className="block text-xs font-medium text-zinc-400 mb-1">SET:</label>
                              <PokemonButton
                                size="sm"
                                onClick={() => {
                                  // Auto-select this set
                                  setState(prev => ({
                                    ...prev,
                                    selectedPsaLabel: result,
                                    selectedMatch: match,
                                    selectedSetName: match.card.setName,
                                    isEditingCard: false
                                  }));
                                  
                                  // Show success message
                                  alert(`SET SELECTED: ${match.card.setName}\n\nNow click the CARD button below to complete the selection.`);
                                }}
                                className="w-full text-left text-xs p-2"
                                variant="primary"
                              >
                                📁 {match.card.setName}
                              </PokemonButton>
                            </div>
                            
                            {/* CARD NAME BUTTON */}
                            <div className="mb-2">
                              <label className="block text-xs font-medium text-zinc-400 mb-1">CARD:</label>
                              <PokemonButton
                                size="sm"
                                onClick={() => {
                                  // Auto-select this complete card match
                                  setState(prev => ({
                                    ...prev,
                                    selectedPsaLabel: result,
                                    selectedMatch: match,
                                    selectedSetName: match.card.setName,
                                    isEditingCard: false
                                  }));
                                  
                                  // Show success message
                                  alert(`CARD SELECTED: ${match.card.cardName}\n\nCard Number: ${match.card.cardNumber}\nSet: ${match.card.setName}\n\nReady for approval! Set your grade and price below.`);
                                }}
                                variant="success"
                                className="w-full text-left text-xs p-2"
                              >
                                🎴 {match.card.cardName} (#{match.card.cardNumber})
                                {match.card.variety && (
                                  <span className="block text-xs opacity-90 mt-1">
                                    Variety: {match.card.variety}
                                  </span>
                                )}
                              </PokemonButton>
                            </div>
                            
                            {/* QUICK APPROVE BUTTON */}
                            <PokemonButton
                              size="sm"
                              onClick={() => {
                                // Auto-select and immediately show approval form
                                setState(prev => ({
                                  ...prev,
                                  selectedPsaLabel: result,
                                  selectedMatch: match,
                                  selectedSetName: match.card.setName,
                                  isEditingCard: false,
                                  showApprovalForm: true,
                                  gradeValue: '10',
                                  priceValue: 0
                                }));
                              }}
                              variant="warning"
                              className="w-full font-bold text-xs p-2"
                            >
                              ⚡ INSTANT SELECT & APPROVE
                            </PokemonButton>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PokemonCard>
        )}

        {/* PSA GRADED CARD APPROVAL FORM - Show when card is selected from PSA label */}
        {(state.selectedMatch || state.showApprovalForm) && !state.isEditingCard && (
          <PokemonCard variant="glass" size="xl" className="text-white relative overflow-hidden">
            <div className="relative z-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-black flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  CREATE PSA GRADED CARD
                </h4>
                <p className="text-cyan-100/90 text-sm mt-1">
                  Add this card to your collection as a PSA graded card. Set the grade, price, and date below.
                </p>
                {state.selectedPsaLabel && (
                  <p className="text-xs text-cyan-300 mt-2">
                    Source: PSA Label #{state.selectedPsaLabel.psaLabelId}
                  </p>
                )}
              </div>
              <PokemonButton
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  selectedMatch: null, 
                  selectedPsaLabel: null,
                  showApprovalForm: false 
                }))}
              >
                Cancel
              </PokemonButton>
            </div>

            {/* Selected Card Details */}
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-emerald-400/30 mb-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h5 className="font-black text-lg text-white mb-2">
                    {state.selectedMatch.card.cardName}
                  </h5>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium text-cyan-100/90">Card Number:</span>
                      <span className="ml-2 px-2 py-1 bg-cyan-500/20 rounded border border-cyan-400/30 text-cyan-300">
                        {state.selectedMatch.card.cardNumber}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-cyan-100/90">Set:</span>
                      <span className="ml-2 text-white">{state.selectedMatch.card.setName}</span>
                    </div>
                    {state.selectedMatch.card.variety && (
                      <div>
                        <span className="font-medium text-cyan-100/90">Variety:</span>
                        <span className="ml-2 text-white">{state.selectedMatch.card.variety}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-cyan-100/90">Confidence:</span>
                      <span className="ml-2 px-2 py-1 bg-emerald-500/20 rounded border border-emerald-400/30 text-emerald-300">
                        {((state.selectedMatch.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PSA Grade, Price and Date Input */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-cyan-100/90 mb-2">
                  PSA Grade *
                </label>
                <select 
                  className="w-full p-3 border border-zinc-600/50 bg-zinc-800/90 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm"
                  value={state.gradeValue || '10'}
                  onChange={(e) => {
                    setState(prev => ({
                      ...prev,
                      gradeValue: e.target.value
                    }));
                  }}
                >
                  <option value="10">PSA 10 - Gem Mint</option>
                  <option value="9">PSA 9 - Mint</option>
                  <option value="8">PSA 8 - Near Mint-Mint</option>
                  <option value="7">PSA 7 - Near Mint</option>
                  <option value="6">PSA 6 - Excellent-Mint</option>
                  <option value="5">PSA 5 - Excellent</option>
                  <option value="4">PSA 4 - Very Good-Excellent</option>
                  <option value="3">PSA 3 - Very Good</option>
                  <option value="2">PSA 2 - Good</option>
                  <option value="1">PSA 1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100/90 mb-2">
                  My Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.priceValue || ''}
                  className="w-full p-3 border border-zinc-600/50 bg-zinc-800/90 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm"
                  placeholder="0.00"
                  onChange={(e) => {
                    setState(prev => ({
                      ...prev,
                      priceValue: parseFloat(e.target.value) || 0
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-100/90 mb-2">
                  Date Added
                </label>
                <input
                  type="date"
                  value={state.dateValue || new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-zinc-600/50 bg-zinc-800/90 text-white rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm"
                  onChange={(e) => {
                    setState(prev => ({
                      ...prev,
                      dateValue: e.target.value
                    }));
                  }}
                />
              </div>
            </div>

            {/* Approval Actions */}
            <div className="flex gap-4 justify-end">
              <PokemonButton
                variant="outline"
                onClick={() => setState(prev => ({
                  ...prev,
                  isEditingCard: true,
                  editingCardImage: null
                }))}
                className="flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Selection
              </PokemonButton>
              
              <PokemonButton
                onClick={() => {
                  // Create PSA graded card from selected match
                  const psaCardData = {
                    cardId: state.selectedMatch.card._id,
                    grade: state.gradeValue || '10',
                    myPrice: state.priceValue || 0,
                    dateAdded: state.dateValue ? new Date(state.dateValue) : new Date(),
                    images: state.selectedPsaLabel?.labelImage ? [state.selectedPsaLabel.labelImage] : [],
                    psaLabelId: state.selectedPsaLabel?.psaLabelId
                  };
                  
                  // Call the approval handler
                  handleApproveMatch(psaCardData);
                }}
                variant="success"
                className="flex items-center gap-2 font-bold py-3"
              >
                <ThumbsUp className="w-5 h-5" />
                CREATE PSA GRADED CARD
              </PokemonButton>
            </div>
            </div>
          </PokemonCard>
        )}

        {/* Hierarchical Card Search - Dropdown Style (like AddEditItem page) */}
        {state.isEditingCard && (
          <PokemonCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {state.editingCardImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={`http://localhost:3000/api/images/psa-labels/${state.editingCardImage}`}
                      alt="PSA Label"
                      className="w-24 h-30 object-cover rounded-lg border-2 border-blue-300 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgOTYgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEg2NEg2MEgzMlY0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                      }}
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Card Selection
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Use the hierarchical search below to find and select the correct card for this PSA label
                  </p>
                  {state.ocrText && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      OCR: {state.ocrText.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
              <PokemonButton
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  isEditingCard: false,
                  editingCardImage: null
                }))}
              >
                Cancel
              </PokemonButton>
            </div>

            {/* Hierarchical Card Search Component */}
            <HierarchicalCardSearch
              register={form.register}
              errors={form.formState.errors}
              setValue={form.setValue}
              watch={form.watch}
              clearErrors={form.clearErrors}
              onSelectionChange={handleHierarchicalCardSelection}
              isSubmitting={false}
              isEditing={false}
            />
          </PokemonCard>
        )}

        {/* Error Display */}
        {error && (
          <PokemonCard className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </PokemonCard>
        )}

        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default OcrMatching;