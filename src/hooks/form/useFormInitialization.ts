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

import { useEffect } from 'react';
import { UseFormSetValue } from 'react-hook-form';

interface BaseFormData {
  cardId?: any;
  setId?: any;
  setName?: string;
  cardName?: string;
  pokemonNumber?: string;
  baseName?: string;
  variety?: string;
  myPrice?: number;
  dateAdded?: string | Date;
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
  
  /** Additional field mappings specific to form type */
  customFieldMappings?: Record<string, (data: BaseFormData) => any>;
  
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Extracts card data from nested cardId object structure
 * Handles the common pattern where card data is nested in cardId.setId hierarchy
 */
const extractCardData = (initialData: BaseFormData): CardDataExtraction => {
  const cardData = initialData.cardId as any;
  
  return {
    setName: cardData?.setId?.setName || initialData.setName || '',
    cardName: cardData?.cardName || initialData.cardName || '',
    pokemonNumber: cardData?.pokemonNumber || initialData.pokemonNumber || '',
    baseName: cardData?.baseName || initialData.baseName || '',
    variety: cardData?.variety || initialData.variety || '',
  };
};

/**
 * Safely formats date for form input
 * Handles various date formats and provides fallback to current date
 */
const formatDateForForm = (dateValue?: string | Date): string => {
  if (!dateValue || (typeof dateValue === 'object' && Object.keys(dateValue).length === 0)) {
    return new Date().toISOString().split('T')[0];
  }

  try {
    const date = new Date(dateValue);
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
 */
export const useFormInitialization = (config: FormInitializationConfig): void => {
  const { formType, isEditing, initialData, setValue, customFieldMappings = {}, debug = false } = config;

  useEffect(() => {
    if (!isEditing || !initialData) {
      return;
    }

    if (debug && process.env.NODE_ENV === 'development') {
      console.log(`[${formType.toUpperCase()} FORM] Updating form with initialData:`, initialData);
    }

    // Extract common card data (for PSA and Raw forms)
    if (formType === 'psa' || formType === 'raw') {
      const { setName, cardName, pokemonNumber, baseName, variety } = extractCardData(initialData);

      // Set common card fields
      setValue('setName', setName);
      setValue('cardName', cardName);
      setValue('pokemonNumber', pokemonNumber);
      setValue('baseName', baseName);
      setValue('variety', variety);

      if (debug && process.env.NODE_ENV === 'development') {
        console.log(`[${formType.toUpperCase()} FORM] Card data extracted:`, {
          setName,
          cardName,
          pokemonNumber,
          baseName,
          variety,
        });
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
      const logData: Record<string, any> = {
        myPrice: initialData.myPrice,
        dateAdded: initialData.dateAdded,
      };

      if (formType === 'psa') {
        logData.grade = initialData.grade;
      } else if (formType === 'raw') {
        logData.condition = initialData.condition;
      } else if (formType === 'sealed') {
        logData.productName = initialData.name;
        logData.category = initialData.category;
        logData.availability = initialData.availability;
      }

      console.log(`[${formType.toUpperCase()} FORM] Form values updated with:`, logData);
    }

  }, [isEditing, initialData, setValue, formType, customFieldMappings, debug]);
};

/**
 * Preset configurations for common form types
 */
export const formInitializationPresets = {
  psa: (isEditing: boolean, initialData: any, setValue: UseFormSetValue<any>): FormInitializationConfig => ({
    formType: 'psa' as const,
    isEditing,
    initialData,
    setValue,
    debug: process.env.NODE_ENV === 'development',
  }),

  raw: (isEditing: boolean, initialData: any, setValue: UseFormSetValue<any>): FormInitializationConfig => ({
    formType: 'raw' as const,
    isEditing,
    initialData,
    setValue,
    debug: process.env.NODE_ENV === 'development',
  }),

  sealed: (isEditing: boolean, initialData: any, setValue: UseFormSetValue<any>): FormInitializationConfig => ({
    formType: 'sealed' as const,
    isEditing,
    initialData,
    setValue,
    debug: process.env.NODE_ENV === 'development',
  }),
};

export default useFormInitialization;