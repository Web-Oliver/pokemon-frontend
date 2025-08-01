/**
 * useCardSelection Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Centralizes card selection and auto-fill logic across PSA and Raw card forms
 * Eliminates 90% duplication of selection and auto-fill patterns
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles card selection logic only
 * - DRY: Eliminates repeated auto-fill code
 * - Dependency Inversion: Uses abstract form functions
 * - Open/Closed: Extensible through configuration
 */

import { useCallback } from 'react';
import { UseFormSetValue, UseFormClearErrors } from 'react-hook-form';
import { transformRequestData } from '../../utils/responseTransformer';

interface SelectedCardData {
  _id?: string;
  id?: string;
  setInfo?: {
    setName: string;
  };
  setName?: string;
  cardName?: string;
  pokemonNumber?: string | number;
  baseName?: string;
  variety?: string;
  [key: string]: any;
}

interface CardSelectionConfig {
  /** Form type for logging and validation */
  formType: 'psa' | 'raw';
  
  /** React Hook Form functions */
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
  
  /** Callback for storing selected card ID */
  onCardIdSelected: (cardId: string) => void;
  
  /** Callback for additional processing */
  onSelectionComplete?: (selectedData: SelectedCardData) => void;
  
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * useCardSelection Hook
 * Provides a standardized card selection handler with auto-fill functionality
 */
export const useCardSelection = (config: CardSelectionConfig) => {
  const { 
    formType, 
    setValue, 
    clearErrors, 
    onCardIdSelected, 
    onSelectionComplete,
    debug = false 
  } = config;

  const handleCardSelection = useCallback((selectedData: SelectedCardData | null) => {
    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} CARD] ===== CARD SELECTION =====`);
      console.log(`[${formType.toUpperCase()} CARD] Card selection:`, selectedData);
    }

    // Handle null selection (clearing)
    if (!selectedData) {
      // Clear form fields when selection is cleared
      setValue('setName', '');
      setValue('cardName', '');
      setValue('pokemonNumber', '');
      setValue('baseName', '');
      setValue('variety', '');
      clearErrors('setName');
      clearErrors('cardName');
      return;
    }

    // Extract and store card ID
    const rawCardId = selectedData._id || selectedData.id;
    if (!rawCardId) {
      console.error(
        `[${formType.toUpperCase()} CARD] No ID found in selected data - card selection invalid`
      );
      return;
    }

    try {
      // Transform ObjectId to string to prevent buffer objects
      const transformedData = transformRequestData({
        cardId: rawCardId,
      });
      const cardId = transformedData.cardId || rawCardId;
      
      if (debug && process.env.NODE_ENV === 'development') {
        console.log(`[${formType.toUpperCase()} CARD] Selected card ID:`, cardId);
      }
      
      onCardIdSelected(cardId);
    } catch (error) {
      console.error(`[${formType.toUpperCase()} CARD] Error processing card ID:`, error);
      return;
    }

    // Auto-fill set name
    const setName = selectedData.setInfo?.setName || selectedData.setName;
    if (setName) {
      setValue('setName', setName, { shouldValidate: true });
      clearErrors('setName');
    } else if (debug && process.env.NODE_ENV === 'development') {
      console.warn(`[${formType.toUpperCase()} CARD] No setName found in selected card data`);
    }

    // Auto-fill card name
    if (selectedData.cardName) {
      setValue('cardName', selectedData.cardName, { shouldValidate: true });
      clearErrors('cardName');
    } else if (debug && process.env.NODE_ENV === 'development') {
      console.warn(`[${formType.toUpperCase()} CARD] No cardName found in selected card data`);
    }

    // Auto-fill pokemon number
    const pokemonNumber = selectedData.pokemonNumber?.toString() || '';
    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} CARD] Setting Pokemon Number:`, pokemonNumber);
    }
    setValue('pokemonNumber', pokemonNumber, { shouldValidate: true });
    clearErrors('pokemonNumber');

    // Auto-fill base name
    const baseName = selectedData.baseName || selectedData.cardName || '';
    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} CARD] Setting Base Name:`, baseName);
    }
    setValue('baseName', baseName, { shouldValidate: true });
    clearErrors('baseName');

    // Auto-fill variety
    const varietyValue = selectedData.variety || '';
    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} CARD] Setting Variety:`, varietyValue);
    }
    setValue('variety', varietyValue, { shouldValidate: true });
    clearErrors('variety');

    // Call completion callback if provided
    if (onSelectionComplete) {
      onSelectionComplete(selectedData);
    }

    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} CARD] Card selection complete - all fields populated from card reference:`, {
        cardId: rawCardId,
        setName,
        cardName: selectedData.cardName,
        pokemonNumber,
        baseName,
        variety: varietyValue,
      });
    }

  }, [formType, setValue, clearErrors, onCardIdSelected, onSelectionComplete, debug]);

  return {
    handleCardSelection,
  };
};

/**
 * Preset configurations for common card selection patterns
 */
export const cardSelectionPresets = {
  psa: (
    setValue: UseFormSetValue<any>,
    clearErrors: UseFormClearErrors<any>,
    onCardIdSelected: (cardId: string) => void,
    onSelectionComplete?: (data: SelectedCardData) => void
  ): CardSelectionConfig => ({
    formType: 'psa' as const,
    setValue,
    clearErrors,
    onCardIdSelected,
    onSelectionComplete,
    debug: process.env.NODE_ENV === 'development',
  }),

  raw: (
    setValue: UseFormSetValue<any>,
    clearErrors: UseFormClearErrors<any>,
    onCardIdSelected: (cardId: string) => void,
    onSelectionComplete?: (data: SelectedCardData) => void
  ): CardSelectionConfig => ({
    formType: 'raw' as const,
    setValue,
    clearErrors,
    onCardIdSelected,
    onSelectionComplete,
    debug: process.env.NODE_ENV === 'development',
  }),
};

export default useCardSelection;