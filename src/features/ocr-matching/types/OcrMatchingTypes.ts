// OCR Matching Types - Single Responsibility: Type definitions only

export interface ExtractedData {
  pokemonName?: string;
  cardNumber?: string;
}

export interface CardData {
  _id: string;
  cardName: string;
  cardNumber: string;
  setName?: string;
  setId?: string;
  variety?: string;
  rarity?: string;
}

export interface MatchData {
  card: CardData;
  confidence?: number;
  matchScore?: number;
  searchStrategy?: string;
  reasons?: string[];
}

export interface SetRecommendation {
  _id: string;
  setName: string;
  year?: number;
  confidence?: number;
  strategy?: string;
  matchingCards?: number;
}

export interface PsaLabelResult {
  psaLabelId: string;
  labelImage?: string;
  ocrText: string;
  extractedData?: ExtractedData;
  matches?: MatchData[];
  confidence?: number;
  certificationNumber?: string;
  alreadyProcessed?: boolean;
}

export interface OcrMatchingState {
  // Image and processing
  selectedImage: File | null;
  isProcessing: boolean;
  
  // OCR results
  ocrText: string;
  extractedData: ExtractedData | null;
  
  // Matches and recommendations
  matches: MatchData[];
  setRecommendations: SetRecommendation[];
  confidence: number;
  
  // Selection state
  selectedMatch: MatchData | null;
  selectedSetName: string | null;
  filteredMatches: MatchData[] | null;
  
  // PSA label processing
  showPsaLabelProcessing: boolean;
  psaLabelResults: PsaLabelResult[];
  selectedPsaLabel: PsaLabelResult | null;
  
  // Editing state
  isEditingCard: boolean;
  isEditing: boolean;
  editingCardImage: string | null;
  showCardSelector: boolean;
  
  // Approval form
  showApprovalForm: boolean;
  gradeValue: string;
  priceValue: number;
  dateValue: string;
}

export interface OcrApiResponse {
  text: string;
  extractedData: ExtractedData;
  matches: MatchData[];
  setRecommendations: SetRecommendation[];
  confidence: number;
}

export interface PsaCardApprovalData {
  cardId: string;
  grade: string;
  myPrice: number;
  dateAdded: Date;
  images?: string[];
  psaLabelId?: string;
}

// Component Props Interfaces
export interface OcrImageUploadProps {
  selectedImage: File | null;
  isProcessing: boolean;
  onImageSelect: (file: File) => void;
  onProcessImage: () => void;
  onUseDemo: () => void;
}

export interface ExtractedDataDisplayProps {
  extractedData: ExtractedData;
}

export interface MatchCardProps {
  match: MatchData;
  index: number;
  isSelected: boolean;
  setRecommendations?: SetRecommendation[];
  onSelect: (match: MatchData) => void;
  onEdit: (match: MatchData) => void;
}

export interface SetRecommendationsProps {
  setRecommendations: SetRecommendation[];
  matches: MatchData[];
  selectedSetName: string | null;
  onSetSelect: (setName: string, filteredMatches: MatchData[]) => void;
  onShowAllSets: () => void;
}

export interface MatchResultsProps {
  matches: MatchData[];
  filteredMatches: MatchData[] | null;
  selectedMatch: MatchData | null;
  selectedSetName: string | null;
  confidence: number;
  setRecommendations: SetRecommendation[];
  onMatchSelect: (match: MatchData) => void;
  onEditMatch: (match: MatchData) => void;
  onManualSelection: () => void;
}

export interface PsaLabelResultsProps {
  psaLabelResults: PsaLabelResult[];
  selectedPsaLabel: PsaLabelResult | null;
  onSelectPsaLabel: (result: PsaLabelResult) => void;
  onEditPsaLabel: (result: PsaLabelResult) => void;
  onDeletePsaLabel: (psaLabelId: string) => void;
}