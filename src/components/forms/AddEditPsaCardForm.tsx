/**
 * Add/Edit PSA Graded Card Form Component
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
import { Award } from 'lucide-react';
import { IPsaGradedCard } from '../../domain/models/card';
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
import { transformRequestData } from '../../utils/responseTransformer';

interface AddEditPsaCardFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  initialData?: Partial<IPsaGradedCard>;
  isEditing?: boolean;
}

interface FormData {
  setName: string;
  cardName: string;
  cardNumber: string; // UPDATED: pokemonNumber → cardNumber
  variety: string; // REMOVED: baseName (deprecated field per user feedback)
  grade: string;
  myPrice: string;
  dateAdded: string;
  // Sale details fields (for sold items)
  paymentMethod?: string;
  actualSoldPrice?: string;
  deliveryMethod?: string;
  source?: string;
  dateSold?: string;
  buyerFullName?: string;
  buyerPhoneNumber?: string;
  buyerEmail?: string;
  trackingNumber?: string;
  // Buyer address fields
  streetName?: string;
  postnr?: string;
  city?: string;
}

const AddEditPsaCardForm: React.FC<AddEditPsaCardFormProps> = ({
  onCancel,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const { addPsaCard, updatePsaCard, loading } = useCollectionOperations();

  // Validation rules for PSA card form
  const validationRules = {
    setName: { required: true },
    cardName: { required: true },
    grade: { ...commonValidationRules.grade, required: true },
    myPrice: { ...commonValidationRules.price, required: true },
    buyerEmail: commonValidationRules.email,
    buyerPhoneNumber: commonValidationRules.phone,
    postnr: commonValidationRules.postalCode,
  };

  // Initialize base form with specialized hooks
  const baseForm = useBaseForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      cardName: initialData?.cardName || '',
      cardNumber: initialData?.cardNumber || '', // UPDATED: pokemonNumber → cardNumber
      variety: initialData?.variety || '',
      // REMOVED: baseName (deprecated field per user feedback)
      grade: initialData?.grade || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded:
        initialData?.dateAdded || new Date().toISOString().split('T')[0],
      // Sale details for sold items
      paymentMethod: initialData?.saleDetails?.paymentMethod || '',
      actualSoldPrice:
        initialData?.saleDetails?.actualSoldPrice?.toString() || '',
      deliveryMethod: initialData?.saleDetails?.deliveryMethod || '',
      source: initialData?.saleDetails?.source || '',
      dateSold: (() => {
        const dateSold = initialData?.saleDetails?.dateSold;
        if (!dateSold) {
          return '';
        }

        if (typeof dateSold === 'string') {
          return dateSold.split('T')[0];
        }

        try {
          const date = new Date(dateSold);
          if (isNaN(date.getTime())) {
            return '';
          }
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      })(),
      buyerFullName: initialData?.saleDetails?.buyerFullName || '',
      buyerPhoneNumber: initialData?.saleDetails?.buyerPhoneNumber || '',
      buyerEmail: initialData?.saleDetails?.buyerEmail || '',
      trackingNumber: initialData?.saleDetails?.trackingNumber || '',
      // Buyer address fields
      streetName: initialData?.saleDetails?.buyerAddress?.streetName || '',
      postnr: initialData?.saleDetails?.buyerAddress?.postnr || '',
      city: initialData?.saleDetails?.buyerAddress?.city || '',
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
    formInitializationPresets.psa(isEditing, initialData, setValue)
  );

  // Centralized card selection logic using reusable hook
  const { handleCardSelection } = useCardSelection(
    cardSelectionPresets.psa(setValue, clearErrors, setSelectedCardId)
  );

  // Form values are managed by the Standard Autocomplete component

  // Auto-fill logic is now handled by Standard Autocomplete component

  // Watch form fields for validation
  const watchedGrade = watch('grade');
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
  const { handleSubmission } = useFormSubmission<
    FormData,
    Partial<IPsaGradedCard>
  >({
    setSubmitting,
    onSuccess,
    imageUpload,
    priceHistory,
    logContext: 'PSA CARD',
    validateBeforeSubmission: (data) => {
      if (!selectedCardId && !isEditing) {
        throw FormSubmissionPatterns.createSelectionRequiredError(
          'PSA cards',
          'card'
        );
      }
    },
    prepareSubmissionData: async ({ formData, imageUrls, isEditing }) => {
      if (isEditing && initialData?.sold) {
        return {
          saleDetails: {
            ...initialData.saleDetails,
            paymentMethod: formData.paymentMethod as
              | 'CASH'
              | 'Mobilepay'
              | 'BankTransfer'
              | undefined,
            actualSoldPrice: formData.actualSoldPrice
              ? parseFloat(formData.actualSoldPrice)
              : undefined,
            deliveryMethod: formData.deliveryMethod as
              | 'Sent'
              | 'Local Meetup'
              | undefined,
            source: formData.source as 'Facebook' | 'DBA' | undefined,
            dateSold: formData.dateSold
              ? new Date(formData.dateSold).toISOString()
              : undefined,
            buyerFullName: formData.buyerFullName?.trim() || '',
            buyerPhoneNumber: formData.buyerPhoneNumber?.trim() || '',
            buyerEmail: formData.buyerEmail?.trim() || '',
            trackingNumber: formData.trackingNumber?.trim() || '',
            buyerAddress: {
              streetName: formData.streetName?.trim() || '',
              postnr: formData.postnr?.trim() || '',
              city: formData.city?.trim() || '',
            },
          },
        };
      } else if (isEditing) {
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
          grade: formData.grade,
          myPrice: parseFloat(formData.myPrice),
          dateAdded: new Date(formData.dateAdded).toISOString(),
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
        const cardId =
          typeof initialData.id === 'string'
            ? initialData.id
            : String(initialData.id);
        FormSubmissionPatterns.validateObjectId(cardId, 'PSA card');
        await updatePsaCard(cardId, cardData);
      } else {
        await addPsaCard(cardData);
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
      cardType="psa"
      isEditing={isEditing}
      isSubmitting={isSubmitting}
      title={isEditing ? 'Edit PSA Graded Card' : 'Add PSA Graded Card'}
      description={
        isEditing
          ? initialData?.sold
            ? 'Update buyer information and tracking details'
            : 'Update price and images (card info is locked after adding)'
          : 'Add a new PSA graded card to your collection'
      }
      icon={Award}
      primaryColorClass="blue"
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
      showSaleDetails={isEditing && initialData?.sold}
      isSoldItem={isEditing && initialData?.sold}
      currentGradeOrCondition={watchedGrade}
      currentPrice={watchedPrice}
      currentPriceNumber={priceHistory.currentPrice}
      priceHistory={priceHistory.priceHistory.map((entry) => ({
        price: entry.price,
        dateUpdated: entry.date || new Date().toISOString(),
      }))}
      onPriceUpdate={handlePriceUpdate}
      onImagesChange={imageUpload.handleImagesChange}
      existingImageUrls={imageUpload.remainingExistingImages}
    />
  );
};

export default AddEditPsaCardForm;
