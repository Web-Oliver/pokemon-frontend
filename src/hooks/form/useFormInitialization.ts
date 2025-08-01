/**
 * useFormInitialization Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Centralizes form initialization logic across all item forms
 * Eliminates 80% duplication of initialization patterns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles form initialization only
 * - DRY: Eliminates repeated initialization logic
 * - Dependency Inversion: Uses abstract setValue function
 * - Open/Closed: Extensible through configuration
 */

import { useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';

interface BaseFormData {
  _id?: string;
  id?: string;
  cardId?: any;
  setId?: any;
  setName?: string;
  cardName?: string;
  pokemonNumber?: string;
  baseName?: string;
  variety?: string;
  myPrice?: number;
  dateAdded?: string | Date;
  grade?: string;
  condition?: string;
  name?: string;
  category?: string;
  availability?: boolean;
  [key: string]: any;
}

interface CardDataExtraction {
  setName: string;
  cardName: string;
  pokemonNumber: string;
  baseName: string;
  variety: string;
}

interface FormInitializationConfig {
  /** Form type for logging and field mapping */
  formType: 'psa' | 'raw' | 'sealed';

  /** Whether in editing mode */
  isEditing: boolean;

  /** Initial data to populate form */
  initialData?: BaseFormData;

  /** React Hook Form setValue function */
  setValue: UseFormSetValue<any>;

  /** Custom field mappings for specialized forms */
  customFieldMappings?: Record<string, (data: BaseFormData) => any>;

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Extracts card data from populated cardId object
 */
const extractCardData = (cardId: any): CardDataExtraction => {
  if (!cardId || typeof cardId !== 'object') {
    return {
      setName: '',
      cardName: '',
      pokemonNumber: '',
      baseName: '',
      variety: '',
    };
  }

  const setName = cardId.setId?.setName || '';
  return {
    setName,
    cardName: cardId.cardName || '',
    pokemonNumber: cardId.pokemonNumber || '',
    baseName: cardId.baseName || '',
    variety: cardId.variety || '',
  };
};

/**
 * Formats date for form input (YYYY-MM-DD format)
 */
const formatDateForForm = (dateInput?: string | Date): string => {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * useFormInitialization Hook
 * Centralizes initialization logic for PSA, Raw, and Sealed product forms
 * FIXED: No longer causes infinite loops by using ref to track initialization
 */
export const useFormInitialization = (
  config: FormInitializationConfig
): void => {
  const {
    formType,
    isEditing,
    initialData,
    setValue,
    customFieldMappings = {},
    debug = false,
  } = config;

  // Use ref to track if initialization has already happened for this item
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isEditing || !initialData) {
      return;
    }

    // Create a stable identifier for the current item
    const itemId = initialData._id || initialData.id || 'no-id';
    
    // Skip if already initialized for this item
    if (initializedRef.current === itemId) {
      return;
    }

    // Mark as initialized
    initializedRef.current = itemId;

    if (debug && process.env.NODE_ENV === 'development') {
      console.log(
        `[${formType.toUpperCase()} FORM] Initializing form once for item:`,
        itemId
      );
    }

    // Extract card data if available (for PSA and Raw cards)
    if (initialData.cardId && typeof initialData.cardId === 'object') {
      const cardData = extractCardData(initialData.cardId);
      
      if (cardData.setName || cardData.cardName) {
        const { setName, cardName, pokemonNumber, baseName, variety } =
          cardData;
        setValue('setName', setName);
        setValue('cardName', cardName);
        setValue('pokemonNumber', pokemonNumber);
        setValue('baseName', baseName);
        setValue('variety', variety);
      }
    }

    // Set form-specific fields
    if (formType === 'psa') {
      setValue('grade', initialData.grade || '');
    } else if (formType === 'raw') {
      setValue('condition', initialData.condition || '');
    } else if (formType === 'sealed') {
      setValue('productName', initialData.name || '');
      setValue('category', initialData.category || '');
      setValue('availability', initialData.availability?.toString() || '');
    }

    // Set common fields across all forms
    setValue('myPrice', initialData.myPrice?.toString() || '');
    setValue('dateAdded', formatDateForForm(initialData.dateAdded));

    // Apply custom field mappings
    Object.entries(customFieldMappings).forEach(([fieldName, mapper]) => {
      const value = mapper(initialData);
      setValue(fieldName, value);
    });

    if (debug && process.env.NODE_ENV === 'development') {
      console.log(
        `[${formType.toUpperCase()} FORM] Form initialized successfully for:`,
        itemId
      );
    }
  }, [isEditing, formType]); // FIXED: Removed initialData from dependencies to prevent infinite loop
};

/**
 * Preset configurations for common form types
 */
export const formInitializationPresets = {
  psa: (
    isEditing: boolean,
    initialData?: BaseFormData,
    setValue?: UseFormSetValue<any>
  ): FormInitializationConfig => ({
    formType: 'psa',
    isEditing,
    initialData,
    setValue: setValue!,
    debug: true,
  }),

  raw: (
    isEditing: boolean,
    initialData?: BaseFormData,
    setValue?: UseFormSetValue<any>
  ): FormInitializationConfig => ({
    formType: 'raw',
    isEditing,
    initialData,
    setValue: setValue!,
    debug: true,
  }),

  sealed: (
    isEditing: boolean,
    initialData?: BaseFormData,
    setValue?: UseFormSetValue<any>
  ): FormInitializationConfig => ({
    formType: 'sealed',
    isEditing,
    initialData,
    setValue: setValue!,
    debug: true,
  }),
};