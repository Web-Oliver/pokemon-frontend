/**
 * SOLID/DRY Implementation: OCR Data State Management Hook
 * Single Responsibility: Manage OCR data state (results, images, processing)
 * Interface Segregation: Separate data concerns from workflow concerns
 * DRY: Centralized data state eliminates duplication across components
 */

import { useState, useCallback } from 'react';
import { OcrMatchingState, MatchData, PsaLabelResult } from '../components';

export interface OcrDataState {
  selectedImage: File | null;
  isProcessing: boolean;
  ocrText: string;
  extractedData: any | null;
  matches: MatchData[];
  setRecommendations: any[];
  confidence: number;
  selectedMatch: MatchData | null;
  selectedSetName: string | null;
  filteredMatches: MatchData[] | null;
  showPsaLabelProcessing: boolean;
  psaLabelResults: PsaLabelResult[];
  selectedPsaLabel: PsaLabelResult | null;
  editingCardImage: string | null;
  showCardSelector: boolean;
  showApprovalForm: boolean;
  gradeValue: string;
  priceValue: number;
  dateValue: string;
}

export interface OcrDataActions {
  setSelectedImage: (file: File | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setOcrText: (text: string) => void;
  setExtractedData: (data: any | null) => void;
  setMatches: (matches: MatchData[]) => void;
  setSetRecommendations: (recommendations: any[]) => void;
  setConfidence: (confidence: number) => void;
  setSelectedMatch: (match: MatchData | null) => void;
  setSelectedSetName: (setName: string | null) => void;
  setFilteredMatches: (matches: MatchData[] | null) => void;
  setPsaLabelResults: (results: PsaLabelResult[]) => void;
  setSelectedPsaLabel: (label: PsaLabelResult | null) => void;
  setEditingCardImage: (image: string | null) => void;
  setGradeValue: (grade: string) => void;
  setPriceValue: (price: number) => void;
  setDateValue: (date: string) => void;
  resetData: () => void;
  updateProcessingResults: (results: any) => void;
}

const initialDataState: OcrDataState = {
  selectedImage: null,
  isProcessing: false,
  ocrText: '',
  extractedData: null,
  matches: [],
  setRecommendations: [],
  confidence: 0,
  selectedMatch: null,
  selectedSetName: null,
  filteredMatches: null,
  showPsaLabelProcessing: false,
  psaLabelResults: [],
  selectedPsaLabel: null,
  editingCardImage: null,
  showCardSelector: false,
  showApprovalForm: false,
  gradeValue: '10',
  priceValue: 0,
  dateValue: new Date().toISOString().split('T')[0],
};

export const useOcrDataState = () => {
  const [state, setState] = useState<OcrDataState>(initialDataState);

  // Individual setters (following Interface Segregation)
  const setSelectedImage = useCallback((file: File | null) => {
    setState(prev => ({ ...prev, selectedImage: file }));
  }, []);

  const setIsProcessing = useCallback((processing: boolean) => {
    setState(prev => ({ ...prev, isProcessing: processing }));
  }, []);

  const setOcrText = useCallback((text: string) => {
    setState(prev => ({ ...prev, ocrText: text }));
  }, []);

  const setExtractedData = useCallback((data: any | null) => {
    setState(prev => ({ ...prev, extractedData: data }));
  }, []);

  const setMatches = useCallback((matches: MatchData[]) => {
    setState(prev => ({ ...prev, matches }));
  }, []);

  const setSetRecommendations = useCallback((recommendations: any[]) => {
    setState(prev => ({ ...prev, setRecommendations: recommendations }));
  }, []);

  const setConfidence = useCallback((confidence: number) => {
    setState(prev => ({ ...prev, confidence }));
  }, []);

  const setSelectedMatch = useCallback((match: MatchData | null) => {
    setState(prev => ({ ...prev, selectedMatch: match }));
  }, []);

  const setSelectedSetName = useCallback((setName: string | null) => {
    setState(prev => ({ ...prev, selectedSetName: setName }));
  }, []);

  const setFilteredMatches = useCallback((matches: MatchData[] | null) => {
    setState(prev => ({ ...prev, filteredMatches: matches }));
  }, []);

  const setPsaLabelResults = useCallback((results: PsaLabelResult[]) => {
    setState(prev => ({ ...prev, psaLabelResults: results }));
  }, []);

  const setSelectedPsaLabel = useCallback((label: PsaLabelResult | null) => {
    setState(prev => ({ ...prev, selectedPsaLabel: label }));
  }, []);

  const setEditingCardImage = useCallback((image: string | null) => {
    setState(prev => ({ ...prev, editingCardImage: image }));
  }, []);

  const setGradeValue = useCallback((grade: string) => {
    setState(prev => ({ ...prev, gradeValue: grade }));
  }, []);

  const setPriceValue = useCallback((price: number) => {
    setState(prev => ({ ...prev, priceValue: price }));
  }, []);

  const setDateValue = useCallback((date: string) => {
    setState(prev => ({ ...prev, dateValue: date }));
  }, []);

  // Complex operations
  const resetData = useCallback(() => {
    setState(initialDataState);
  }, []);

  const updateProcessingResults = useCallback((results: any) => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
      ocrText: results.text || prev.ocrText,
      extractedData: results.extractedData || null,
      matches: results.matches || [],
      setRecommendations: results.setRecommendations || [],
      confidence: results.confidence || 0
    }));
  }, []);

  // Computed values
  const showNoResults = state.ocrText && !state.isProcessing && state.matches.length === 0 && state.extractedData;
  const hasResults = state.extractedData || state.matches.length > 0;

  const actions: OcrDataActions = {
    setSelectedImage,
    setIsProcessing,
    setOcrText,
    setExtractedData,
    setMatches,
    setSetRecommendations,
    setConfidence,
    setSelectedMatch,
    setSelectedSetName,
    setFilteredMatches,
    setPsaLabelResults,
    setSelectedPsaLabel,
    setEditingCardImage,
    setGradeValue,
    setPriceValue,
    setDateValue,
    resetData,
    updateProcessingResults
  };

  return {
    ...state,
    ...actions,
    showNoResults,
    hasResults
  };
};