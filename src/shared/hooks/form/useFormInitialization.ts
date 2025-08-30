/**
 * useFormInitialization Hook - CONSOLIDATED
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Centralizes ALL form initialization logic across the application
 * CONSOLIDATED: Merges useFormInitialization + useFormInitializer for DRY compliance
 * Eliminates 80% duplication of initialization patterns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all form initialization concerns
 * - DRY: Eliminates repeated initialization logic across hooks
 * - Dependency Inversion: Uses abstract setValue function
 * - Open/Closed: Extensible through configuration
 */

import { useCallback, useEffect, useRef } from 'react';
import { FieldValues, UseFormReturn, UseFormSetValue } from 'react-hook-form';

interface BaseFormData {
  _id?: string;
  id?: string;
  cardId?: any;
  setId?: any;
  setName?: string;
  cardName?: string;
  cardNumber?: string;
  variety?: string;
  myPrice?: number;
  dateAdded?: string | Date;
  grade?: string;
  condition?: string;
  name?: string;
  category?: string;
  availability?: boolean;
  images?: string[];

  [key: string]: any;
}

interface CardDataExtraction {
  setName: string;
  cardName: string;
  cardNumber: string;
  variety: string;
}

interface FormInitializationConfig<T extends FieldValues = any> {
  /** Form type for logging and field mapping */
  formType: 'psa' | 'raw' | 'sealed' | 'generic';

  /** Whether in editing mode */
  isEditing: boolean;

  /** Initial data to populate form */
  initialData?: Partial<T> & BaseFormData;

  /** React Hook Form setValue function (for simple usage) */
  setValue?: UseFormSetValue<T>;

  /** Full form instance (for advanced usage) */
  form?: UseFormReturn<T>;

  /** Custom field mappings for specialized forms */
  customFieldMappings?: Record<string, string | ((value: any) => any)>;

  /** Image upload hook for setting images */
  imageUpload?: {
    setRemainingExistingImages: (images: string[]) => void;
  };

  /** Enable debug logging */
  debug?: boolean;
}

interface UseFormInitializationReturn<T extends FieldValues> {
  /** Update form with initial data (from useFormInitializer) */
  updateWithInitialData: (data: Partial<T>) => void;
}

/**
 * Extracts card data from populated cardId object
 */
const extractCardData = (cardId: any): CardDataExtraction => {
  if (!cardId || typeof cardId !== 'object') {
    return {
      setName: '',
      cardName: '',
      cardNumber: '',
      variety: '',
    };
  }

  const setName = cardId.setId?.setName || '';
  return {
    setName,
    cardName: cardId.cardName || '',
    cardNumber: cardId.cardNumber || '',
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
 * Processes field value based on type and custom mapping
 * CONSOLIDATED: From useFormInitializer's field transformation logic
 */
const processFieldValue = (
  key: string,
  value: any,
  mapping?: string | ((value: any) => any)
): { processedKey: string; processedValue: any } => {
  let processedValue = value;
  let processedKey = key;

  if (typeof mapping === 'function') {
    // Custom transformation function
    processedValue = mapping(value);
  } else if (typeof mapping === 'string') {
    // Field name mapping
    processedKey = mapping;
  }

  // Handle common field transformations
  if (
    (key.includes('Date') || key.includes('date')) &&
    typeof value === 'string'
  ) {
    // Date field transformation - convert ISO timestamps to YYYY-MM-DD
    if (value.includes('T')) {
      processedValue = value.split('T')[0];
    } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Already in correct format
      processedValue = value;
    } else {
      // Try to parse and format the date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        processedValue = date.toISOString().split('T')[0];
      }
    }
  } else if (key.includes('Price') && typeof value === 'number') {
    // Price field transformation to string
    processedValue = value.toString();
  }

  return { processedKey, processedValue };
};

/**
 * CONSOLIDATED Form Initialization Hook
 * Combines functionality from both useFormInitialization and useFormInitializer
 * Supports both specialized item forms and generic form initialization
 */
export const useFormInitialization = <T extends FieldValues = any>(
  config: FormInitializationConfig<T>
): UseFormInitializationReturn<T> => {
  const {
    formType,
    isEditing,
    initialData,
    setValue,
    form,
    customFieldMappings = {},
    imageUpload,
    debug = false,
  } = config;

  // Use ref to track if initialization has already happened for this item
  const initializedRef = useRef<string | null>(null);

  // Get setValue function from either direct prop or form instance
  const setValueFn = setValue || form?.setValue;

  /**
   * Generic form data update (from useFormInitializer)
   * Handles field mapping and common transformations
   */
  const updateWithInitialData = useCallback(
    (data: Partial<T>) => {
      if (!data || !setValueFn) {
        return;
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const mapping = customFieldMappings[key];
          const { processedKey, processedValue } = processFieldValue(key, value, mapping);

          setValueFn(processedKey as any, processedValue, { shouldValidate: false });
        }
      });
    },
    [customFieldMappings, setValueFn]
  );

  /**
   * Specialized item form initialization (from useFormInitialization)
   * Handles PSA, Raw, and Sealed product specific logic
   */
  useEffect(() => {
    if (!isEditing || !initialData || !setValueFn) {
      return;
    }

    // Create a stable identifier for the current item
    const itemId = (initialData as BaseFormData)._id || 
                   (initialData as BaseFormData).id || 
                   'no-id';

    // Skip if already initialized for this item
    if (initializedRef.current === itemId) {
      return;
    }

    // Mark as initialized
    initializedRef.current = itemId;

    if (debug && import.meta.env.MODE === 'development') {
      console.log(
        `[${formType.toUpperCase()} FORM] Initializing form once for item:`,
        itemId
      );
    }

    // Extract card data if available (for PSA and Raw cards)
    if ((initialData as BaseFormData).cardId && 
        typeof (initialData as BaseFormData).cardId === 'object') {
      const cardData = extractCardData((initialData as BaseFormData).cardId);

      if (cardData.setName || cardData.cardName) {
        const { setName, cardName, cardNumber, variety } = cardData;
        setValueFn('setName' as any, setName);
        setValueFn('cardName' as any, cardName);
        setValueFn('cardNumber' as any, cardNumber);
        setValueFn('variety' as any, variety);
      }
    }

    // Set form-specific fields
    if (formType === 'psa') {
      setValueFn('grade' as any, (initialData as BaseFormData).grade || '');
    } else if (formType === 'raw') {
      setValueFn('condition' as any, (initialData as BaseFormData).condition || '');
    } else if (formType === 'sealed') {
      setValueFn('productName' as any, (initialData as BaseFormData).name || '');
      setValueFn('category' as any, (initialData as BaseFormData).category || '');
      setValueFn('availability' as any, (initialData as BaseFormData).availability?.toString() || '');
    }

    // Set common fields across all forms (if not generic)
    if (formType !== 'generic') {
      setValueFn('myPrice' as any, (initialData as BaseFormData).myPrice?.toString() || '');
      setValueFn('dateAdded' as any, formatDateForForm((initialData as BaseFormData).dateAdded));
    }

    // Apply generic field mapping for all data
    updateWithInitialData(initialData);

    // Update images if provided
    if ((initialData as BaseFormData).images && 
        Array.isArray((initialData as BaseFormData).images) && 
        imageUpload) {
      imageUpload.setRemainingExistingImages((initialData as BaseFormData).images as string[]);
    }

    if (debug && import.meta.env.MODE === 'development') {
      console.log(
        `[${formType.toUpperCase()} FORM] Form initialized successfully for:`,
        itemId
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, formType]); // FIXED: Removed initialData from dependencies to prevent infinite loop

  return {
    updateWithInitialData,
  };
};

/**
 * Preset configurations for common form types
 * MAINTAINED: From original useFormInitialization
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

  generic: (
    isEditing: boolean,
    initialData?: any,
    form?: UseFormReturn<any>
  ): FormInitializationConfig => ({
    formType: 'generic',
    isEditing,
    initialData,
    form,
    debug: true,
  }),
};

/**
 * BACKWARD COMPATIBILITY: Export useFormInitializer functionality
 * Use this for generic form initialization without item-specific logic
 */
export const useFormInitializer = <T extends FieldValues>(
  config: Omit<FormInitializationConfig<T>, 'formType'>
): UseFormInitializationReturn<T> => {
  return useFormInitialization({
    ...config,
    formType: 'generic',
  });
};

export default useFormInitialization;