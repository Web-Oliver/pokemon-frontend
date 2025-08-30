// ICR Matching Types - New Implementation for ICR Pipeline

/**
 * ICR Extracted Data from PSA label parsing
 */
export interface IcrExtractedData {
  certificationNumber?: string;
  grade?: number;
  year?: number;
  cardName?: string;
  setName?: string;
  language?: string;
  possibleCardNumbers?: string[];
  possiblePokemonNames?: string[];
  modifiers?: string[];
}

/**
 * ICR Card Match with detailed scoring
 */
export interface IcrCardMatch {
  cardId: string;
  cardName: string;
  cardNumber: string;
  setName: string;
  year?: number;
  confidence: number;
  scores: {
    yearMatch: number;
    pokemonMatch: number;
    cardNumberMatch: number;
    modifierMatch: number;
    setVerification: number;
  };
}

/**
 * ICR Best Match summary
 */
export interface IcrBestMatch {
  cardName: string;
  cardNumber: string;
  setName: string;
  confidence: number;
}






/**
 * PSA Card Creation Data for ICR
 */
export interface IcrPsaCardCreationData {
  myPrice: number;
  grade?: string;
  dateAdded?: Date;
}

// ICR Component Props Interfaces

/**
 * ICR Image Upload Component Props
 */
export interface IcrImageUploadProps {
  selectedImages: File[];
  isProcessing: boolean;
  onImagesSelect: (files: File[]) => void;
  onProcessImages: () => void;
  onClearImages: () => void;
}

/**
 * ICR Batch Results Component Props
 */
export interface IcrBatchResultsProps {
  batchResults: IcrBatchResult[];
  batchStatus: IcrBatchStatus | null;
  selectedScan: IcrBatchResult | null;
  expandedScanId: string | null;
  onScanSelect: (scan: IcrBatchResult) => void;
  onScanExpand: (scanId: string) => void;
  onCardMatchSelect: (scanId: string, cardId: string) => void;
  onPsaCreate: (scanId: string) => void;
}

/**
 * ICR Scan Detail Component Props
 */
export interface IcrScanDetailProps {
  scan: IcrBatchResult;
  isExpanded: boolean;
  selectedCardMatch: IcrCardMatch | null;
  onCardMatchSelect: (cardId: string) => void;
  onPsaCreate: () => void;
}

/**
 * ICR Card Match Component Props
 */
export interface IcrCardMatchProps {
  cardMatch: IcrCardMatch;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
}

/**
 * ICR PSA Creation Form Props
 */
export interface IcrPsaCreationFormProps {
  scanId: string;
  isVisible: boolean;
  onSubmit: (data: IcrPsaCardCreationData) => void;
  onCancel: () => void;
  loading: boolean;
}

/**
 * ICR Action Buttons Props
 */
export interface IcrActionButtonsProps {
  scanId: string;
  matchingStatus: string;
  onManualSelect: () => void;
  onCreatePsa: () => void;
  disabled?: boolean;
  loading?: boolean;
}