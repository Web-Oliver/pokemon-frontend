/**
 * useFormSubmission Hook
 * Eliminates form submission code duplication across Add/Edit form components
 * 
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Handles form submission orchestration
 * - Open/Closed: Extensible through configuration
 * - Dependency Inversion: Abstracts submission logic through interfaces
 * - DRY: Eliminates ~100 lines of duplicate code per form component
 */

import { useState, useCallback } from 'react';
import { UseFormHandleSubmit } from 'react-hook-form';

interface ImageUploadHook {
  uploadImages: () => Promise<string[]>;
  remainingExistingImages: string[];
}

interface PriceHistoryHook {
  currentPrice: number;
  priceHistory: Array<{ price: number; dateUpdated?: string }>;
}

interface FormSubmissionConfig<T> {
  isEditing: boolean;
  initialData?: Partial<T>;
  imageUpload: ImageUploadHook;
  priceHistory?: PriceHistoryHook;
  selectedCardId?: string;
  onSuccess: () => void;
  submitFunction: (data: Partial<T>) => Promise<T>;
  updateFunction?: (id: string, data: Partial<T>) => Promise<T>;
  prepareFormData: (
    formData: any,
    uploadedImages: string[],
    config: {
      isEditing: boolean;
      initialData?: Partial<T>;
      selectedCardId?: string;
      currentPrice?: number;
      priceHistory?: Array<{ price: number; dateUpdated?: string }>;
      remainingImages: string[];
    }
  ) => Partial<T>;
}

interface UseFormSubmissionReturn<FormData> {
  isSubmitting: boolean;
  handleSubmit: (handleSubmit: UseFormHandleSubmit<FormData>) => (onSubmit: (data: FormData) => Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  submitError: string | null;
  clearSubmitError: () => void;
}

/**
 * Generic form submission hook
 * Consolidates image upload, data preparation, and submission logic
 * Reduces form component complexity by ~100 lines each
 * 
 * @param config - Configuration object containing submission logic and dependencies
 * @returns Form submission state and handlers
 */
export const useFormSubmission = <T, FormData = any>(
  config: FormSubmissionConfig<T>
): UseFormSubmissionReturn<FormData> => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    (reactHookFormHandleSubmit: UseFormHandleSubmit<FormData>) => {
      return (onSubmit: (data: FormData) => Promise<void>) => {
        // Memoize the actual submission handler to prevent unnecessary re-renders
        const memoizedSubmissionHandler = async (data: FormData) => {
          setIsSubmitting(true);
          setSubmitError(null);

          try {
            await onSubmit(data);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Form submission failed';
            setSubmitError(errorMessage);
            console.error('Form submission failed:', error);
          } finally {
            setIsSubmitting(false);
          }
        };
        
        return reactHookFormHandleSubmit(memoizedSubmissionHandler);
      };
    },
    [setIsSubmitting, setSubmitError]
  );

  const createSubmitHandler = useCallback(
    async (formData: FormData): Promise<void> => {
      const {
        isEditing,
        initialData,
        imageUpload,
        priceHistory,
        selectedCardId,
        onSuccess,
        submitFunction,
        updateFunction,
        prepareFormData,
      } = config;

      // Upload images using specialized hook
      const uploadedImages = await imageUpload.uploadImages();

      // Prepare submission data using the provided function
      const submissionData = prepareFormData(formData, uploadedImages, {
        isEditing,
        initialData,
        selectedCardId,
        currentPrice: priceHistory?.currentPrice,
        priceHistory: priceHistory?.priceHistory,
        remainingImages: imageUpload.remainingExistingImages,
      });

      // Submit using the appropriate function
      if (isEditing && initialData?.id && updateFunction) {
        await updateFunction(initialData.id as string, submissionData);
      } else {
        await submitFunction(submissionData);
      }

      onSuccess();
    },
    [config]
  );

  return {
    isSubmitting,
    handleSubmit,
    submitError,
    clearSubmitError,
  };
};

/**
 * Helper function to create standard price history entry
 * Common pattern across all form submissions
 */
export const createPriceHistoryEntry = (
  price: number,
  date?: string
): { price: number; dateUpdated: string } => ({
  price,
  dateUpdated: date || new Date().toISOString(),
});

/**
 * Helper function to prepare sale details
 * Common pattern across PSA/Raw card forms
 */
export const prepareSaleDetails = (formData: any) => ({
  paymentMethod: formData.paymentMethod as 'CASH' | 'Mobilepay' | 'BankTransfer' | undefined,
  actualSoldPrice: formData.actualSoldPrice ? parseFloat(formData.actualSoldPrice) : undefined,
  deliveryMethod: formData.deliveryMethod as 'Sent' | 'Local Meetup' | undefined,
  source: formData.source as 'Facebook' | 'DBA' | undefined,
  dateSold: formData.dateSold ? new Date(formData.dateSold).toISOString() : undefined,
  buyerFullName: formData.buyerFullName?.trim() || '',
  buyerPhoneNumber: formData.buyerPhoneNumber?.trim() || '',
  buyerEmail: formData.buyerEmail?.trim() || '',
  trackingNumber: formData.trackingNumber?.trim() || '',
  buyerAddress: {
    streetName: formData.streetName?.trim() || '',
    postnr: formData.postnr?.trim() || '',
    city: formData.city?.trim() || '',
  },
});

export default useFormSubmission;