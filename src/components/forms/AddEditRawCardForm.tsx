/**
 * Add/Edit Raw Card Form Component
 * Refactored to follow SOLID principles
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Form orchestration only
 * - Dependency Inversion: Uses abstract hooks instead of concrete APIs
 * - Interface Segregation: Uses specialized hooks for specific concerns
 * - Open/Closed: Extensible through hook composition
 * - DRY: Reuses common form patterns
 */

import React, { useEffect } from 'react';
import { Package } from 'lucide-react';
import { IRawCard } from '../../domain/models/card';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { useBaseForm } from '../../hooks/useBaseForm';
import { commonValidationRules } from '../../hooks/useFormValidation';
import {
  useFormInitialization,
  formInitializationPresets,
} from '../../hooks/form/useFormInitialization';
import {
  useCardSelection,
  cardSelectionPresets,
} from '../../hooks/form/useCardSelection';
import {
  useFormSubmission,
  FormSubmissionPatterns,
} from './wrappers/FormSubmissionWrapper';
import LoadingSpinner from '../common/LoadingSpinner';
import CardFormContainer from './containers/CardFormContainer';
import {
  convertObjectIdToString,
  transformRequestData,
} from '../../utils/responseTransformer';

interface AddEditRawCardFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<IRawCard>;
  isEditing?: boolean;
}

interface FormData {
  setName: string;
  cardName: string;
  cardNumber: string; // UPDATED: pokemonNumber → cardNumber
  variety: string; // REMOVED: baseName (deprecated field per user feedback)
  condition: string;
  myPrice: string;
  dateAdded: string;
}

const AddEditRawCardForm: React.FC<AddEditRawCardFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addRawCard, updateRawCard, loading } = useCollectionOperations();

  // Validation rules for Raw card form
  const validationRules = {
    setName: { required: true },
    cardName: { required: true },
    condition: { required: true },
    myPrice: { ...commonValidationRules.price, required: true },
  };

  // Initialize base form with specialized hooks
  const baseForm = useBaseForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      cardName: initialData?.cardName || '',
      cardNumber: initialData?.cardNumber || '', // UPDATED: pokemonNumber → cardNumber
      variety: initialData?.variety || '',
      // REMOVED: baseName (deprecated field per user feedback)
      condition: initialData?.condition || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded:
        initialData?.dateAdded || new Date().toISOString().split('T')[0],
    },
    validationRules,
    initialImages: initialData?.images || [],
    initialPriceHistory: initialData?.priceHistory || [],
    initialPrice: initialData?.myPrice || 0,
  });

  const { form, isSubmitting, imageUpload, priceHistory, setSubmitting } =
    baseForm;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = form;

  // State for card selection (separate from form hooks for business logic)
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(
    () => {
      if (!initialData?.cardId) {
        return null;
      }

      // Use centralized ObjectId conversion for consistent string handling
      const transformedData = transformRequestData({
        cardId: initialData.cardId,
      });
      return transformedData.cardId || null;
    }
  );

  // Removed over-engineered autocomplete configuration

  // Centralized form initialization using reusable hook
  useFormInitialization(
    formInitializationPresets.raw(isEditing, initialData, setValue)
  );

  // Centralized card selection logic using reusable hook
  const { handleCardSelection } = useCardSelection(
    cardSelectionPresets.raw(setValue, clearErrors, setSelectedCardId)
  );

  // Legacy search sync removed - EnhancedAutocomplete handles all search state

  // Auto-fill functionality moved to EnhancedAutocomplete onSelectionChange

  // Watch form fields for validation
  const watchedCondition = watch('condition');
  const watchedPrice = watch('myPrice');

  // Update current price when form price changes
  useEffect(() => {
    if (watchedPrice) {
      const price = parseFloat(watchedPrice);
      if (!isNaN(price)) {
        priceHistory.updateCurrentPrice(price);
      }
    }
  }, [watchedPrice, priceHistory]);

  const handlePriceUpdate = (newPrice: number, _date: string) => {
    // Add new price to history using specialized hook
    priceHistory.addPriceEntry(newPrice, 'manual_update');

    // Update form field
    setValue('myPrice', newPrice.toString());
  };

  // Standardized submission handling using FormSubmissionWrapper
  const { handleSubmission } = useFormSubmission<FormData, Partial<IRawCard>>({
    setSubmitting,
    onSuccess,
    imageUpload,
    priceHistory,
    logContext: 'RAW CARD',
    validateBeforeSubmission: (data) => {
      if (!selectedCardId) {
        throw FormSubmissionPatterns.createSelectionRequiredError(
          'raw cards',
          'card'
        );
      }
    },
    prepareSubmissionData: async ({ formData, imageUrls, isEditing }) => {
      if (isEditing) {
        const priceToUse =
          priceHistory.currentPrice > 0
            ? priceHistory.currentPrice
            : parseFloat(formData.myPrice);
        const finalImages = FormSubmissionPatterns.combineImages(
          imageUpload.remainingExistingImages,
          imageUrls
        );

        return {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory:
            FormSubmissionPatterns.transformPriceHistory(
              priceHistory.priceHistory,
              undefined
            ) || initialData?.priceHistory,
        };
      } else {
        return {
          cardId: selectedCardId,
          condition: formData.condition,
          myPrice: parseFloat(formData.myPrice),
          dateAdded: formData.dateAdded,
          images: imageUrls,
          priceHistory: FormSubmissionPatterns.transformPriceHistory(
            priceHistory.priceHistory,
            parseFloat(formData.myPrice)
          ),
        };
      }
    },
    submitToApi: async (cardData, isEditing, itemId) => {
      if (isEditing && initialData?.id) {
        const cardId = convertObjectIdToString(initialData.id);
        await updateRawCard(cardId, cardData);
      } else {
        await addRawCard(cardData);
      }
    },
  });

  const onSubmit = (data: FormData) =>
    handleSubmission(data, { isEditing, itemId: initialData?.id });

  if (loading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <CardFormContainer
      cardType="raw"
      isEditing={isEditing}
      isSubmitting={isSubmitting}
      title={isEditing ? 'Edit Raw Card' : 'Add Raw Card'}
      description={
        isEditing
          ? 'Update your raw card information'
          : 'Add a new raw card to your premium collection'
      }
      icon={Package}
      primaryColorClass="emerald"
      register={register}
      errors={errors}
      setValue={setValue}
      watch={watch}
      clearErrors={clearErrors}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onSelectionChange={handleCardSelection}
      showCardInformation={!isEditing}
      showSaleDetails={false}
      isSoldItem={false}
      currentGradeOrCondition={watchedCondition}
      currentPrice={watchedPrice}
      currentPriceNumber={priceHistory.currentPrice}
      priceHistory={priceHistory.priceHistory.map((entry) => ({
        price: entry.price,
        dateUpdated: (entry as any).dateUpdated || new Date().toISOString(),
      }))}
      onPriceUpdate={handlePriceUpdate}
      onImagesChange={imageUpload.handleImagesChange}
      existingImageUrls={imageUpload.remainingExistingImages}
    />
  );
};

export default AddEditRawCardForm;
