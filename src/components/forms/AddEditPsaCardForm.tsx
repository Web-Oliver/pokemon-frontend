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
import { ProductSearchSection } from './ProductSearchSection';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Input from '../common/Input';
import { ButtonLoading } from '../common/LoadingStates';
import FormHeader from '../common/FormHeader';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';
import SaleDetailsSection from './sections/SaleDetailsSection';
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
  pokemonNumber: string;
  baseName: string;
  variety: string;
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
      pokemonNumber: initialData?.pokemonNumber || '',
      baseName: initialData?.baseName || '',
      variety: initialData?.variety || '',
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

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PSA FORM] Updating form with initialData:', initialData);
      }

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
      setValue('grade', initialData.grade || '');
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

      // Data has been updated in form values above

      if (process.env.NODE_ENV === 'development') {
        console.log('[PSA FORM] Form values updated with:', {
          setName,
          cardName,
          pokemonNumber,
          baseName,
          variety,
          grade: initialData.grade,
          myPrice: initialData.myPrice,
        });
      }
    }
  }, [isEditing, initialData, setValue]);

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

  // Note: Event handlers removed - EnhancedAutocomplete component handles all autocomplete functionality

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      // Upload images using specialized hook
      const imageUrls = await imageUpload.uploadImages();

      // Prepare card data based on item status
      let cardData: Partial<IPsaGradedCard>;

      if (isEditing && initialData?.sold) {
        // For sold items, only update sale details
        cardData = {
          saleDetails: {
            ...initialData.saleDetails,
            paymentMethod: data.paymentMethod as
              | 'CASH'
              | 'Mobilepay'
              | 'BankTransfer'
              | undefined,
            actualSoldPrice: data.actualSoldPrice
              ? parseFloat(data.actualSoldPrice)
              : undefined,
            deliveryMethod: data.deliveryMethod as
              | 'Sent'
              | 'Local Meetup'
              | undefined,
            source: data.source as 'Facebook' | 'DBA' | undefined,
            dateSold: data.dateSold
              ? new Date(data.dateSold).toISOString()
              : undefined,
            buyerFullName: data.buyerFullName?.trim() || '',
            buyerPhoneNumber: data.buyerPhoneNumber?.trim() || '',
            buyerEmail: data.buyerEmail?.trim() || '',
            trackingNumber: data.trackingNumber?.trim() || '',
            buyerAddress: {
              streetName: data.streetName?.trim() || '',
              postnr: data.postnr?.trim() || '',
              city: data.city?.trim() || '',
            },
          },
        };
      } else if (isEditing) {
        // For editing unsold items, only update price and images
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
            priceHistory.priceHistory.length > 0
              ? priceHistory.priceHistory.map((entry, _index) => {
                  const dateValue = entry.date;
                  let finalDate;

                  if (dateValue && typeof dateValue === 'string') {
                    finalDate = dateValue;
                  } else if (dateValue instanceof Date) {
                    finalDate = dateValue.toISOString();
                  } else {
                    finalDate = new Date().toISOString();
                  }

                  // Only return the fields the backend expects, no extra ObjectId fields
                  return {
                    price: entry.price,
                    dateUpdated: finalDate,
                  };
                })
              : initialData?.priceHistory,
        };
      } else {
        // For new items, validate that a card was selected from autocomplete
        if (!selectedCardId) {
          throw new Error(
            'Please select a card from the search suggestions. Manual entry is not supported for PSA cards - you must select an existing card.'
          );
        }

        // Validate that the form data matches the selected card
        if (process.env.NODE_ENV === 'development') {
          console.log('[PSA FORM] Validating selected card data:', {
            selectedCardId,
            formData: {
              setName: data.setName,
              cardName: data.cardName,
              pokemonNumber: data.pokemonNumber,
              baseName: data.baseName,
              variety: data.variety,
            },
          });
        }

        // Use the selected card reference (schema requires cardId)
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[PSA FORM] Submitting with cardId:',
            selectedCardId,
            typeof selectedCardId
          );
        }
        cardData = {
          cardId: selectedCardId,
          grade: data.grade,
          myPrice: parseFloat(data.myPrice),
          dateAdded: new Date(data.dateAdded).toISOString(),
          images: imageUrls,
          priceHistory:
            priceHistory.priceHistory.length > 0
              ? priceHistory.priceHistory.map((entry) => {
                  const dateValue = entry.date;
                  let finalDate;

                  if (dateValue && typeof dateValue === 'string') {
                    finalDate = dateValue;
                  } else if (dateValue instanceof Date) {
                    finalDate = dateValue.toISOString();
                  } else {
                    finalDate = new Date().toISOString();
                  }

                  // Only return the fields the backend expects, no extra ObjectId fields
                  return {
                    price: entry.price,
                    dateUpdated: finalDate,
                  };
                })
              : [
                  {
                    price: parseFloat(data.myPrice),
                    dateUpdated: new Date().toISOString(),
                  },
                ],
        };
      }

      // Data is already clean and properly formatted
      const cleanedCardData = cardData;

      // Submit using collection operations hook
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[PSA FORM] Final cardData before API call:',
          JSON.stringify(cleanedCardData, null, 2)
        );
      }

      if (isEditing && initialData?.id) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[PSA FORM] Raw initialData.id:',
            initialData.id,
            typeof initialData.id
          );
        }

        // Ensure ID is a string and validate MongoDB ObjectId format
        const cardId =
          typeof initialData.id === 'string'
            ? initialData.id
            : String(initialData.id);
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[PSA FORM] Processed cardId for update:',
            cardId,
            typeof cardId
          );
        }

        // Validate MongoDB ObjectId format
        if (!cardId || cardId.length !== 24 || !/^[a-f\d]{24}$/i.test(cardId)) {
          throw new Error(
            `Invalid ObjectId format: ${cardId}. Expected 24 character hexadecimal string.`
          );
        }

        await updatePsaCard(cardId, cleanedCardData);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[PSA FORM] Creating new PSA card');
        }
        await addPsaCard(cleanedCardData);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Reusable Form Header */}
      <FormHeader
        icon={Award}
        title={isEditing ? 'Edit PSA Graded Card' : 'Add PSA Graded Card'}
        description={
          isEditing
            ? initialData?.sold
              ? 'Update buyer information and tracking details'
              : 'Update price and images (card info is locked after adding)'
            : 'Add a new PSA graded card to your collection'
        }
        primaryColorClass="blue"
      />

      {/* Card Information Section - Standard Autocomplete Integration */}
      {!(isEditing && initialData?.sold) && (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>
          <h4 className="text-lg font-medium text-zinc-100 mb-4 flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2 text-zinc-300" />
              Card Information
            </div>
            {watch('setName') && (
              <div className="flex items-center text-sm text-blue-300 bg-blue-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-600/30">
                <Award className="w-4 h-4 mr-1" />
                Filtering by: {watch('setName')}
              </div>
            )}
          </h4>

          {/* Card Search Section - Maintains ALL existing functionality */}
          <div className="mb-6 relative z-10">
            <ProductSearchSection
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
              clearErrors={clearErrors}
              onSelectionChange={(selectedData) => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[PSA CARD] ===== CARD SELECTION =====');
                  console.log('[PSA CARD] Card selection:', selectedData);
                }

                // Auto-fill form fields based on selection (EXACT same logic as before)
                if (selectedData) {
                  // The selectedData contains the raw card data from the search API
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[PSA CARD] Raw selected data:', selectedData);
                  }

                  // Store the selected card ID for backend submission
                  // Transform ObjectId to string to prevent buffer objects from being stored
                  const rawCardId = selectedData._id || selectedData.id;
                  if (rawCardId) {
                    const transformedData = transformRequestData({
                      cardId: rawCardId,
                    });
                    setSelectedCardId(transformedData.cardId || rawCardId);
                    if (process.env.NODE_ENV === 'development') {
                      console.log(
                        '[PSA CARD] Selected card ID:',
                        transformedData.cardId
                      );
                    }
                  } else {
                    console.error(
                      '[PSA CARD] No ID found in selected data - card selection invalid'
                    );
                    return;
                  }

                  // Auto-fill set name from setInfo or direct setName
                  const setName =
                    selectedData.setInfo?.setName || selectedData.setName;
                  if (setName) {
                    setValue('setName', setName, { shouldValidate: true });
                    clearErrors('setName'); // Clear any validation errors
                  } else {
                    console.warn(
                      '[PSA CARD] No setName found in selected card data'
                    );
                  }

                  // Auto-fill card name (required)
                  if (selectedData.cardName) {
                    setValue('cardName', selectedData.cardName, {
                      shouldValidate: true,
                    });
                    clearErrors('cardName'); // Clear any validation errors
                  } else {
                    console.warn(
                      '[PSA CARD] No cardName found in selected card data'
                    );
                  }

                  // Auto-fill pokemon number
                  const pokemonNumber =
                    selectedData.pokemonNumber?.toString() || '';
                  if (process.env.NODE_ENV === 'development') {
                    console.log(
                      '[PSA CARD] Setting Pokemon Number:',
                      pokemonNumber
                    );
                  }
                  setValue('pokemonNumber', pokemonNumber, {
                    shouldValidate: true,
                  });
                  clearErrors('pokemonNumber');

                  // Auto-fill base name (required)
                  const baseName =
                    selectedData.baseName || selectedData.cardName || '';
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[PSA CARD] Setting Base Name:', baseName);
                  }
                  setValue('baseName', baseName, { shouldValidate: true });
                  clearErrors('baseName');

                  // Auto-fill variety (always set, even if empty)
                  const varietyValue = selectedData.variety || '';
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[PSA CARD] Setting Variety:', varietyValue);
                  }
                  setValue('variety', varietyValue, { shouldValidate: true });
                  clearErrors('variety');

                  if (process.env.NODE_ENV === 'development') {
                    console.log(
                      '[PSA CARD] Card selection complete - all fields populated from card reference:',
                      {
                        cardId: selectedCardId,
                        setName,
                        cardName: selectedData.cardName,
                        pokemonNumber,
                        baseName,
                        variety: varietyValue,
                      }
                    );
                  }

                  // Validate that all required card data is present
                  if (
                    !selectedData.id ||
                    !selectedData.cardName ||
                    !selectedData.baseName
                  ) {
                    console.error(
                      '[PSA CARD] Invalid card selection - missing required fields:',
                      {
                        hasId: !!selectedData.id,
                        hasCardName: !!selectedData.cardName,
                        hasBaseName: !!selectedData.baseName,
                      }
                    );
                  }
                }
              }}
              onError={(error) => {
                console.error('[PSA CARD] Card search error:', error);
              }}
              sectionTitle=""
              sectionIcon={Award}
              formType="card"
            />
          </div>

          {/* Additional Card Fields - Read-Only when card is selected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pokemon Number */}
            <div>
              <Input
                label="Pokémon Number"
                {...register('pokemonNumber')}
                error={errors.pokemonNumber?.message}
                placeholder="e.g., 006, 025, 150"
                disabled={true}
                value={watch('pokemonNumber') || ''}
                className="text-center bg-gray-50 dark:bg-zinc-900/50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            {/* Base Name */}
            <div>
              <Input
                label="Base Name"
                {...register('baseName')}
                error={errors.baseName?.message}
                placeholder="e.g., Charizard, Pikachu, Mew"
                disabled={true}
                value={watch('baseName') || ''}
                className="text-center bg-gray-50 dark:bg-zinc-900/50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>

            {/* Variety */}
            <div className="md:col-span-2">
              <Input
                label="Variety"
                {...register('variety')}
                error={errors.variety?.message}
                placeholder="e.g., Holo, Shadowless, 1st Edition"
                disabled={true}
                value={watch('variety') || ''}
                className="text-center bg-gray-50 dark:bg-zinc-900/50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Hidden form registrations for autocomplete fields only */}
          <div className="hidden">
            <input
              {...register('setName', {
                required: 'Set name is required',
                minLength: {
                  value: 2,
                  message: 'Set name must be at least 2 characters',
                },
              })}
              value={watch('setName') || ''}
              readOnly
            />
            <input
              {...register('cardName', {
                required: 'Card name is required',
                minLength: {
                  value: 2,
                  message: 'Card name must be at least 2 characters',
                },
              })}
              value={watch('cardName') || ''}
              readOnly
            />
            <input
              {...register('pokemonNumber')}
              value={watch('pokemonNumber') || ''}
              readOnly
            />
            <input
              {...register('baseName')}
              value={watch('baseName') || ''}
              readOnly
            />
            <input
              {...register('variety')}
              value={watch('variety') || ''}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Grading & Pricing Section - Hidden for sold items */}
      <GradingPricingSection
        register={register as any}
        errors={errors as any}
        cardType="psa"
        currentGradeOrCondition={watchedGrade}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory.priceHistory.map((entry) => ({
          price: entry.price,
          dateUpdated: entry.date || new Date().toISOString(),
        }))}
        currentPriceNumber={priceHistory.currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={isEditing}
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Image Upload Section - Available for unsold items only */}
      <ImageUploadSection
        onImagesChange={imageUpload.handleImagesChange}
        existingImageUrls={imageUpload.remainingExistingImages}
        maxFiles={8}
        maxFileSize={5}
        title="Card Images"
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Sold Item Edit Section - Only for sold items */}
      <SaleDetailsSection
        register={register as any}
        errors={errors as any}
        watch={watch as any}
        isVisible={isEditing && initialData?.sold}
        itemName="card"
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-zinc-700 dark:border-zinc-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <ButtonLoading text={isEditing ? 'Updating...' : 'Adding...'} />
          ) : isEditing ? (
            'Update Card'
          ) : (
            'Add Card'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddEditPsaCardForm;
