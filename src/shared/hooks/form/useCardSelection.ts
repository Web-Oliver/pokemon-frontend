/**
 * useCardSelection Hook - CONSOLIDATED
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Centralizes card selection, state management, and auto-fill logic
 * CONSOLIDATED: Merges useCardSelection + useCardSelectionState for DRY compliance
 * Eliminates 90% duplication of selection and auto-fill patterns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all card selection concerns
 * - DRY: Eliminates repeated auto-fill and state code
 * - Dependency Inversion: Uses abstract form functions
 * - Open/Closed: Extensible through configuration
 */

import { useCallback, useState } from 'react';
import { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { transformRequestData } from '../../utils/transformers/responseTransformer';
import { useApiErrorHandler } from '../error/useErrorHandler';

interface SelectedCardData {
  _id?: string;
  id?: string;
  setInfo?: {
    setName: string;
  };
  // For card objects, setName comes from setId.setName
  setId?: {
    setName: string;
    year?: number;
  };
  setName?: string;
  cardName?: string;
  cardNumber?: string | number;
  variety?: string;

  [key: string]: any;
}

interface CardSelectionConfig {
  /** Form type for logging and validation */
  formType: 'psa' | 'raw';

  /** React Hook Form functions (optional for state-only mode) */
  setValue?: UseFormSetValue<any>;
  clearErrors?: UseFormClearErrors<any>;

  /** Callback for storing selected card ID (optional for state-only mode) */
  onCardIdSelected?: (cardId: string) => void;

  /** Callback for additional processing */
  onCardSelected?: (cardData: SelectedCardData) => void;

  /** Field mapping for auto-fill */
  fieldMapping?: {
    setName: string;
    cardName: string;
    cardNumber?: string;
    variety?: string;
    [key: string]: string | undefined;
  };

  /** Enable state management mode */
  enableStateManagement?: boolean;
}

interface UseCardSelectionReturn {
  // State management (when enableStateManagement = true)
  selectedCard: SelectedCardData | null;
  setSelectedCard: (card: SelectedCardData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearSelection: () => void;
  
  // Business logic (always available)
  handleCardSelection: (cardData: SelectedCardData) => void;
  autoFillFormFromCard: (cardData: SelectedCardData) => void;
}

/**
 * Default field mappings for different form types
 */
const DEFAULT_FIELD_MAPPINGS = {
  psa: {
    setName: 'setName',
    cardName: 'cardName',
    cardNumber: 'cardNumber',
    variety: 'variety',
  },
  raw: {
    setName: 'setName',
    cardName: 'cardName',
    cardNumber: 'cardNumber',
    variety: 'variety',
  },
} as const;

/**
 * Consolidated Card Selection Hook
 * Provides both state management and business logic for card selection
 */
export const useCardSelection = (
  config: CardSelectionConfig
): UseCardSelectionReturn => {
  const {
    formType,
    setValue,
    clearErrors,
    onCardIdSelected,
    onCardSelected,
    fieldMapping = DEFAULT_FIELD_MAPPINGS[formType],
    enableStateManagement = false,
  } = config;

  // State management (only when enabled)
  const [selectedCard, setSelectedCard] = useState<SelectedCardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const errorHandler = useApiErrorHandler(`CARD_SELECTION_${formType.toUpperCase()}`);

  const clearSelection = useCallback(() => {
    if (enableStateManagement) {
      setSelectedCard(null);
      setSearchQuery('');
    }
  }, [enableStateManagement]);

  /**
   * Auto-fill form fields from selected card data
   */
  const autoFillFormFromCard = useCallback((cardData: SelectedCardData) => {
    if (!setValue || !fieldMapping) return;

    try {
      const transformedData = transformRequestData(cardData);
      
      // Extract set name from various possible sources
      let setName = '';
      if (transformedData.setInfo?.setName) {
        setName = transformedData.setInfo.setName;
      } else if (transformedData.setId?.setName) {
        setName = transformedData.setId.setName;
      } else if (transformedData.setName) {
        setName = transformedData.setName;
      }

      // Auto-fill core fields
      if (setName && fieldMapping.setName) {
        setValue(fieldMapping.setName, setName);
      }
      
      if (transformedData.cardName && fieldMapping.cardName) {
        setValue(fieldMapping.cardName, transformedData.cardName);
      }
      
      if (transformedData.cardNumber && fieldMapping.cardNumber) {
        setValue(fieldMapping.cardNumber, String(transformedData.cardNumber));
      }
      
      if (transformedData.variety && fieldMapping.variety) {
        setValue(fieldMapping.variety, transformedData.variety);
      }

      // Auto-fill additional mapped fields
      Object.entries(fieldMapping).forEach(([sourceKey, formField]) => {
        if (formField && transformedData[sourceKey] && !['setName', 'cardName', 'cardNumber', 'variety'].includes(sourceKey)) {
          setValue(formField, transformedData[sourceKey]);
        }
      });

      // Clear any existing errors
      if (clearErrors) {
        clearErrors();
      }
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'CARD_AUTO_FILL',
        showToast: true,
      });
    }
  }, [setValue, fieldMapping, clearErrors, errorHandler]);

  /**
   * Handle card selection with integrated business logic
   */
  const handleCardSelection = useCallback((cardData: SelectedCardData) => {
    try {
      // Extract card ID
      const cardId = cardData.id || cardData._id;
      if (!cardId) {
        errorHandler.handleError(new Error('No ID found in selected data'), {
          context: 'CARD_SELECTION',
          showToast: true,
        });
        return;
      }

      // Update state if state management is enabled
      if (enableStateManagement) {
        setSelectedCard(cardData);
      }

      // Store card ID
      if (onCardIdSelected) {
        onCardIdSelected(cardId);
      }

      // Auto-fill form
      autoFillFormFromCard(cardData);

      // Call additional processing callback
      if (onCardSelected) {
        onCardSelected(cardData);
      }
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'CARD_SELECTION',
        showToast: true,
      });
    }
  }, [enableStateManagement, onCardIdSelected, autoFillFormFromCard, onCardSelected, errorHandler]);

  return {
    // State management (for backward compatibility with useCardSelectionState)
    selectedCard,
    setSelectedCard,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    clearSelection,
    
    // Business logic (main functionality)
    handleCardSelection,
    autoFillFormFromCard,
  };
};

/**
 * Preset configurations for card selection patterns
 * MIGRATED: From useCardSelectionState for backward compatibility
 */
export const cardSelectionPresets = {
  rawCard: 'rawCard' as const,
  psaCard: 'psaCard' as const,
};

/**
 * Helper hook for state-only card selection (backward compatibility)
 * Use this when you only need state management without form integration
 */
export const useCardSelectionState = (preset: 'rawCard' | 'psaCard') => {
  return useCardSelection({
    formType: preset === 'psaCard' ? 'psa' : 'raw',
    enableStateManagement: true,
  });
};

export default useCardSelection;