/**
 * Form Initialization Hook
 * Following CLAUDE.md SRP principle - handles ONLY form initialization
 * 
 * Extracted from useBaseForm to separate initialization concerns
 */

import { useCallback, useEffect } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export interface FormInitializerConfig<T extends FieldValues> {
  /** Initial data to populate form fields (for editing) */
  initialData?: Partial<T>;
  /** Whether form is in editing mode */
  isEditing?: boolean;
  /** Custom field mapping for initialData */
  fieldMapping?: Record<string, string | ((value: any) => any)>;
  /** Form instance for setting values */
  form: UseFormReturn<T>;
  /** Image upload hook for setting images */
  imageUpload?: {
    setRemainingExistingImages: (images: string[]) => void;
  };
}

export interface UseFormInitializerReturn<T extends FieldValues> {
  /** Update form with initial data */
  updateWithInitialData: (data: Partial<T>) => void;
}

/**
 * Focused hook for form initialization only
 * Single Responsibility: Initialize form with initial data and handle field mapping
 */
export const useFormInitializer = <T extends FieldValues>(
  config: FormInitializerConfig<T>
): UseFormInitializerReturn<T> => {
  const { initialData, isEditing, fieldMapping = {}, form, imageUpload } = config;

  // Centralized initialData handling following CLAUDE.md SRP principle
  const updateWithInitialData = useCallback(
    (data: Partial<T>) => {
      if (!data) {
        return;
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Check if there's a custom field mapping
          const mapping = fieldMapping[key];

          let processedValue = value;

          if (typeof mapping === 'function') {
            // Custom transformation function
            processedValue = mapping(value);
          } else if (typeof mapping === 'string') {
            // Field name mapping
            form.setValue(mapping as any, value);
            return;
          }

          // Handle common field transformations
          if (
            (key.includes('Date') || key.includes('date')) &&
            typeof value === 'string'
          ) {
            // Date field transformation - convert ISO timestamps to YYYY-MM-DD
            if (value.includes('T')) {
              processedValue = value.split('T')[0];
            } else if (value.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
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

          form.setValue(key as any, processedValue, { shouldValidate: false });
        }
      });
    },
    [fieldMapping, form]
  );

  // Handle initialData on mount and when it changes (for async loading)
  useEffect(() => {
    if (isEditing && initialData) {
      updateWithInitialData(initialData);

      // Update images if provided
      if (initialData.images && Array.isArray(initialData.images) && imageUpload) {
        imageUpload.setRemainingExistingImages(initialData.images as string[]);
      }

      // Update price history if provided - would need to be implemented in usePriceHistory if needed
    }
  }, [isEditing, initialData, updateWithInitialData, imageUpload]);

  return {
    updateWithInitialData,
  };
};