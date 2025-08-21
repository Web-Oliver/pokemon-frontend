/**
 * OCR Types and Interfaces
 * Comprehensive type definitions for OCR functionality
 */

export enum CardType {
  PSA_LABEL = 'psa-label',
  ENGLISH_POKEMON = 'english-pokemon',
  JAPANESE_POKEMON = 'japanese-pokemon',
  UNKNOWN = 'unknown',
  GENERIC = 'generic'
}

export interface CardTypeDetection {
  type: CardType;
  confidence: number;
  features: string[];
}

export interface OcrOptions {
  preprocessImage?: boolean;
  targetRegion?: string;
  language?: string;
  psaMode?: boolean;
}

export interface ComprehensiveOcrOptions extends OcrOptions {
  enableMultiCardDetection?: boolean;
  enableBatchProcessing?: boolean;
  enableImageStitching?: boolean;
  enableAdvancedOcr?: boolean;
  enableAsyncProcessing?: boolean;
  enableConcurrentProcessing?: boolean;
  cardType?: CardType;
  maxResults?: number;
  computeStyleInfo?: boolean;
  stitchingOptions?: {
    maxWidth?: number;
    maxHeight?: number;
    spacing?: number;
    backgroundColor?: string;
    labelHeight?: number;
    cropToLabel?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'grid';
    compressionQuality?: number;
  };
}

export interface OcrResult {
  text: string;
  confidence: number;
  source: 'google-vision' | 'google-vision-batch' | 'google-vision-async' | 'tesseract' | 'hybrid' | 'error';
  processingTime: number;
  cardType?: CardTypeDetection;
  verification?: UsageVerification;
}

export interface UsageVerification {
  tracked: boolean;
  requestId: string;
  timestamp: string;
  remainingCredits?: number;
}

// Card Detection Types
export interface CardSuggestion {
  _id: string;
  cardName: string;
  cardNumber: string;
  variety?: string;
  setId: {
    _id: string;
    setName: string;
    year: number;
    totalCardsInSet?: number;
  };
  matchScore: number;
  grades?: {
    grade_total: number;
    grade_10: number;
    grade_9?: number;
    grade_8?: number;
  };
  uniquePokemonId?: number;
  uniqueSetId?: number;
}

export interface ExtractedCardData {
  // PSA Card specific
  cardName?: string;
  setName?: string;
  year?: number;
  cardNumber?: string;
  grade?: string;
  certificationNumber?: string;
  
  // English Pokemon Card specific
  setIndicators?: string[];
  numbers?: string[];
  attacks?: string[];
  hp?: string;
  
  // Japanese Pokemon Card specific
  scripts?: {
    hasHiragana: boolean;
    hasKatakana: boolean;
    hasKanji: boolean;
  };
  possibleNames?: string[];
  
  // Generic
  words?: string[];
  potentialNames?: string[];
  length?: number;
}

export interface CardDetectionResult {
  type: string;
  extracted: ExtractedCardData;
  suggestions: CardSuggestion[];
  confidence: number;
}

export interface EnhancedOcrResult extends OcrResult {
  cardDetection?: CardDetectionResult;
}

// API Response Types
export interface OcrApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    suggestionsCount?: number;
    processingTime?: number;
    requested?: number;
    processed?: number;
    totalSuggestions?: number;
  };
}

export interface DetectionApiData {
  detection: CardDetectionResult;
}

export interface BatchDetectionApiData {
  detections: (CardDetectionResult | null)[];
}

export interface TextValidationResult {
  analysis: {
    length: number;
    wordCount: number;
    hasNumbers: boolean;
    hasUppercase: boolean;
    hasSpecialChars: boolean;
    potentialCardNames: string[];
    potentialYears: string[];
    potentialGrades: string[];
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  };
  recommendations: Array<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    action?: string;
  }>;
}

// Error Types
export class OcrError extends Error {
  public readonly code: string;
  public readonly context?: any;

  constructor(message: string, code: string = 'OCR_ERROR', context?: any) {
    super(message);
    this.name = 'OcrError';
    this.code = code;
    this.context = context;
  }
}

export class CardDetectionError extends OcrError {
  public readonly ocrText: string;
  public readonly cardType: CardType;

  constructor(message: string, ocrText: string, cardType: CardType) {
    super(message, 'CARD_DETECTION_ERROR', { ocrText, cardType });
    this.name = 'CardDetectionError';
    this.ocrText = ocrText;
    this.cardType = cardType;
  }
}