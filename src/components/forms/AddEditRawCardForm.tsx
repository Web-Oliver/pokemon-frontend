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
import { Calendar, Package } from 'lucide-react';
import { IRawCard } from '../../domain/models/card';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { useBaseForm } from '../../hooks/useBaseForm';
import { commonValidationRules } from '../../hooks/useFormValidation';
import { ProductSearchSection } from './ProductSearchSection';
import LoadingSpinner from '../common/LoadingSpinner';
import FormHeader from '../common/FormHeader';
import FormActionButtons from '../common/FormActionButtons';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';
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
  pokemonNumber: string;
  baseName: string;
  variety: string;
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
      pokemonNumber: initialData?.pokemonNumber || '',
      baseName: initialData?.baseName || '',
      variety: initialData?.variety || '',
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

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('[RAW FORM] Updating form with initialData:', initialData);

      // Access card data from nested cardId object (populated by backend API)
      const cardData = initialData.cardId as any;
      const setName = cardData?.setId?.setName || initialData.setName || '';
      const cardName = cardData?.cardName || initialData.cardName || '';
      const pokemonNumber =
        cardData?.pokemonNumber || initialData.pokemonNumber || '';
      const baseName = cardData?.baseName || initialData.baseName || '';
      const variety = cardData?.variety || initialData.variety || '';

      setValue('setName', setName);
      setValue('cardName', cardName);
      setValue('pokemonNumber', pokemonNumber);
      setValue('baseName', baseName);
      setValue('variety', variety);
      setValue('condition', initialData.condition || '');
      setValue('myPrice', initialData.myPrice?.toString() || '');
      setValue(
        'dateAdded',
        (() => {
          if (
            !initialData.dateAdded ||
            (typeof initialData.dateAdded === 'object' &&
              Object.keys(initialData.dateAdded).length === 0)
          ) {
            return new Date().toISOString().split('T')[0];
          }

          try {
            const date = new Date(initialData.dateAdded);
            if (isNaN(date.getTime())) {
              return new Date().toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
          } catch {
            return new Date().toISOString().split('T')[0];
          }
        })()
      );

      // Legacy search functions removed - form values are sufficient

      console.log('[RAW FORM] Form values updated with:', {
        setName,
        cardName,
        pokemonNumber,
        baseName,
        variety,
        condition: initialData.condition,
        myPrice: initialData.myPrice,
      });
    }
  }, [isEditing, initialData, setValue]);

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

  const handleImagesChange = (
    files: File[],
    remainingExistingUrls?: string[]
  ) => {
    imageUpload.setSelectedImages(files);
    if (remainingExistingUrls !== undefined) {
      imageUpload.setRemainingExistingImages(remainingExistingUrls);
    }
  };

  const handlePriceUpdate = (newPrice: number, _date: string) => {
    // Add new price to history using specialized hook
    priceHistory.addPriceEntry(newPrice, 'manual_update');

    // Update form field
    setValue('myPrice', newPrice.toString());
  };

  // Event handlers removed - EnhancedAutocomplete handles all interactions

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      // Upload images using specialized hook
      const imageUrls = await imageUpload.uploadImages();

      // Prepare card data
      let cardData: Partial<IRawCard>;

      if (isEditing) {
        // For editing, only update price and images
        const priceToUse =
          priceHistory.currentPrice > 0
            ? priceHistory.currentPrice
            : parseFloat(data.myPrice);
        const finalImages = [
          ...imageUpload.remainingExistingImages,
          ...imageUrls,
        ];

        cardData = {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory:
            priceHistory.priceHistory.map((entry) => ({
              price: entry.price,
              dateUpdated:
                (entry as any).dateUpdated || new Date().toISOString(),
            })).length > 0
              ? priceHistory.priceHistory.map((entry) => ({
                  price: entry.price,
                  dateUpdated:
                    (entry as any).dateUpdated || new Date().toISOString(),
                }))
              : initialData?.priceHistory,
        };
      } else {
        // For new items, validate that a card was selected from autocomplete
        if (!selectedCardId) {
          throw new Error(
            'Please select a card from the search suggestions. Manual entry is not supported for raw cards - you must select an existing card.'
          );
        }

        // Validate that the form data matches the selected card
        console.log('[RAW FORM] Validating selected card data:', {
          selectedCardId,
          formData: {
            setName: data.setName,
            cardName: data.cardName,
            pokemonNumber: data.pokemonNumber,
            baseName: data.baseName,
            variety: data.variety,
          },
        });

        // Use the selected card reference (schema requires cardId)
        cardData = {
          cardId: selectedCardId,
          condition: data.condition,
          myPrice: parseFloat(data.myPrice),
          dateAdded: data.dateAdded,
          images: imageUrls,
          priceHistory:
            priceHistory.priceHistory.map((entry) => ({
              price: entry.price,
              dateUpdated:
                (entry as any).dateUpdated || new Date().toISOString(),
            })).length > 0
              ? priceHistory.priceHistory.map((entry) => ({
                  price: entry.price,
                  dateUpdated:
                    (entry as any).dateUpdated || new Date().toISOString(),
                }))
              : [
                  {
                    price: parseFloat(data.myPrice),
                    dateUpdated: new Date().toISOString(),
                  },
                ],
        };
      }

      // Submit using collection operations hook
      if (isEditing && initialData?.id) {
        const cardId = convertObjectIdToString(initialData.id);
        await updateRawCard(cardId, cardData);
      } else {
        await addRawCard(cardData);
      }

      onSuccess();
    } catch (error) {
      // Error handling is done by specialized hooks
      console.error('Form submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !isSubmitting) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Reusable Form Header */}
      <FormHeader
        icon={Package}
        title={isEditing ? 'Edit Raw Card' : 'Add Raw Card'}
        description={
          isEditing
            ? 'Update your raw card information'
            : 'Add a new raw card to your premium collection'
        }
        primaryColorClass="emerald"
      />

      {/* Card Information Section - Maintains ALL existing functionality */}
      <ProductSearchSection
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        clearErrors={clearErrors}
        onSelectionChange={(selectedData) => {
          console.log('[RAW CARD] ===== CARD SELECTION =====');
          console.log('[RAW CARD] Card selection:', selectedData);

          // Auto-fill form fields based on selection (EXACT same logic as before)
          if (selectedData) {
            // Store the selected card ID for backend submission
            // Transform ObjectId to string to prevent buffer objects from being stored
            const rawCardId = selectedData._id || selectedData.id;
            if (rawCardId) {
              const transformedData = transformRequestData({
                cardId: rawCardId,
              });
              setSelectedCardId(transformedData.cardId);
              console.log(
                '[RAW CARD] Selected card ID:',
                transformedData.cardId
              );
            } else {
              console.error(
                '[RAW CARD] No ID found in selected data - card selection invalid'
              );
              return;
            }

            // Auto-fill set name
            const setName =
              selectedData.setInfo?.setName || selectedData.setName;
            if (setName) {
              setValue('setName', setName, { shouldValidate: true });
              clearErrors('setName');
            }

            // Auto-fill card name
            if (selectedData.cardName) {
              setValue('cardName', selectedData.cardName, {
                shouldValidate: true,
              });
              clearErrors('cardName');
            }

            // Auto-fill pokemon number
            const pokemonNumber = selectedData.pokemonNumber?.toString() || '';
            setValue('pokemonNumber', pokemonNumber, { shouldValidate: true });
            clearErrors('pokemonNumber');

            // Auto-fill base name
            const baseName =
              selectedData.baseName || selectedData.cardName || '';
            setValue('baseName', baseName, { shouldValidate: true });
            clearErrors('baseName');

            // Auto-fill variety
            const varietyValue = selectedData.variety || '';
            setValue('variety', varietyValue, { shouldValidate: true });
            clearErrors('variety');
          }
        }}
        onError={(error) => {
          console.error('[RAW CARD] Card search error:', error);
        }}
        sectionTitle="Card Information"
        sectionIcon={Calendar}
        formType="card"
      />

      {/* Condition & Pricing Section */}
      <GradingPricingSection
        register={register as any}
        errors={errors as any}
        cardType="raw"
        currentGradeOrCondition={watchedCondition}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory.priceHistory.map((entry) => ({
          price: entry.price,
          dateUpdated: (entry as any).dateUpdated || new Date().toISOString(),
        }))}
        currentPriceNumber={priceHistory.currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={false}
      />

      {/* Image Upload Section */}
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        existingImageUrls={initialData?.images || []}
        maxFiles={8}
        maxFileSize={5}
        title="Card Images"
      />

      {/* Reusable Action Buttons */}
      <FormActionButtons
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        submitButtonText={isEditing ? 'Update Card' : 'Add Card'}
        loadingSubmitText={isEditing ? 'Updating...' : 'Adding...'}
        primaryButtonColorClass="emerald"
      />
    </form>
  );
};

export default AddEditRawCardForm;
