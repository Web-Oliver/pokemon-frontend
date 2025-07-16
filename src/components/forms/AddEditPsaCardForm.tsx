/**
 * Add/Edit PSA Graded Card Form Component
 * Phase 4.6: Initial PSA card form with API integration
 *
 * Following CLAUDE.md principles:
 * - Beautiful, award-winning design with modern aesthetics
 * - Single Responsibility: PSA card form management
 * - React Hook Form integration for state management
 * - Real backend API integration (no mocking)
 * - Responsive layout for all device sizes
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Award } from 'lucide-react';
import { IPsaGradedCard } from '../../domain/models/card';
import { useCollection } from '../../hooks/useCollection';
import { AutocompleteField, createAutocompleteConfig } from '../../hooks/useEnhancedAutocomplete';
import { uploadMultipleImages } from '../../api/uploadApi';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import GradingPricingSection from './sections/GradingPricingSection';
import ImageUploadSection from './sections/ImageUploadSection';
import SaleDetailsSection from './sections/SaleDetailsSection';
import { EnhancedAutocomplete } from '../search/EnhancedAutocomplete';

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
  const { addPsaCard, updatePsaCard, loading } = useCollection();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [remainingExistingImages, setRemainingExistingImages] = useState<string[]>(
    initialData?.images || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Legacy showSuggestions state removed - EnhancedAutocomplete handles UI state
  const [priceHistory, setPriceHistory] = useState(initialData?.priceHistory || []);
  const [currentPrice, setCurrentPrice] = useState(initialData?.myPrice || 0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    typeof initialData?.cardId === 'string' ? initialData.cardId : initialData?.cardId?.id || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      setName: initialData?.setName || '',
      cardName: initialData?.cardName || '',
      pokemonNumber: initialData?.pokemonNumber || '',
      baseName: initialData?.baseName || '',
      variety: initialData?.variety || '',
      grade: initialData?.grade || '',
      myPrice: initialData?.myPrice?.toString() || '',
      dateAdded: initialData?.dateAdded || new Date().toISOString().split('T')[0],
      // Sale details for sold items
      paymentMethod: initialData?.saleDetails?.paymentMethod || '',
      actualSoldPrice: initialData?.saleDetails?.actualSoldPrice?.toString() || '',
      deliveryMethod: initialData?.saleDetails?.deliveryMethod || '',
      source: initialData?.saleDetails?.source || '',
      dateSold: initialData?.saleDetails?.dateSold?.split('T')[0] || '', // Convert to date format
      buyerFullName: initialData?.saleDetails?.buyerFullName || '',
      buyerPhoneNumber: initialData?.saleDetails?.buyerPhoneNumber || '',
      buyerEmail: initialData?.saleDetails?.buyerEmail || '',
      trackingNumber: initialData?.saleDetails?.trackingNumber || '',
      // Buyer address fields
      streetName: initialData?.saleDetails?.buyerAddress?.streetName || '',
      postnr: initialData?.saleDetails?.buyerAddress?.postnr || '',
      city: initialData?.saleDetails?.buyerAddress?.city || '',
    },
    mode: 'onChange',
  });

  // Configure autocomplete fields for reusable search (after useForm hook)
  const autocompleteFields: AutocompleteField[] = [
    {
      id: 'setName',
      value: watch('setName') || '',
      placeholder: 'Set Name',
      type: 'set',
      required: true,
    },
    {
      id: 'cardName',
      value: watch('cardName') || '',
      placeholder: 'Card Name',
      type: 'cardProduct',
      required: true,
    },
  ];

  // Create config for enhanced autocomplete
  const autocompleteConfig = createAutocompleteConfig('cards');

  // Update form values when initialData changes (for async data loading)
  useEffect(() => {
    if (isEditing && initialData) {
      console.log('[PSA FORM] Updating form with initialData:', initialData);

      // Access card data from nested cardId object (populated by backend API)
      const cardData = initialData.cardId;
      const setName = cardData?.setId?.setName || initialData.setName || '';
      const cardName = cardData?.cardName || initialData.cardName || '';
      const pokemonNumber = cardData?.pokemonNumber || initialData.pokemonNumber || '';
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
        initialData.dateAdded
          ? new Date(initialData.dateAdded).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );

      // Data has been updated in form values above

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
  }, [isEditing, initialData, setValue]);

  // Form values are managed by the Enhanced Autocomplete component

  // Auto-fill logic is now handled by Enhanced Autocomplete component

  // Watch form fields for validation
  const watchedGrade = watch('grade');
  const watchedPrice = watch('myPrice');

  // Update current price when form price changes
  useEffect(() => {
    if (watchedPrice) {
      const price = parseFloat(watchedPrice);
      if (!isNaN(price)) {
        setCurrentPrice(price);
      }
    }
  }, [watchedPrice]);

  const handleImagesChange = (files: File[], remainingExistingUrls?: string[]) => {
    setSelectedImages(files);
    if (remainingExistingUrls !== undefined) {
      setRemainingExistingImages(remainingExistingUrls);
    }
  };

  const handlePriceUpdate = (newPrice: number, date: string) => {
    // Add new price to history
    const newEntry = { price: newPrice, dateUpdated: date };
    setPriceHistory(prev => [...prev, newEntry]);

    // Update current price and form field
    setCurrentPrice(newPrice);
    setValue('myPrice', newPrice.toString());
  };

  // Note: Event handlers removed - EnhancedAutocomplete component handles all autocomplete functionality

  const onSubmit = async (data: FormData) => {
    console.log('[PSA FORM SUBMIT] ===== SUBMIT STARTED =====');
    console.log('[PSA FORM SUBMIT] isEditing:', isEditing);
    console.log('[PSA FORM SUBMIT] initialData?.sold:', initialData?.sold);
    console.log('[PSA FORM SUBMIT] Form data received:', data);
    console.log('[PSA FORM SUBMIT] selectedImages count:', selectedImages.length);
    console.log('[PSA FORM SUBMIT] priceHistory:', priceHistory);

    setIsSubmitting(true);

    try {
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        console.log('[PSA FORM SUBMIT] Uploading images:', selectedImages.length);
        imageUrls = await uploadMultipleImages(selectedImages);
        console.log('[PSA FORM SUBMIT] Images uploaded successfully:', imageUrls);
      } else {
        console.log('[PSA FORM SUBMIT] No new images to upload');
      }

      // Prepare card data based on item status
      let cardData: Partial<IPsaGradedCard>;

      if (isEditing && initialData?.sold) {
        console.log('[PSA FORM SUBMIT] Processing sold item - updating sale details only');
        // For sold items, only update sale details
        cardData = {
          saleDetails: {
            ...initialData.saleDetails,
            paymentMethod: data.paymentMethod as 'CASH' | 'Mobilepay' | 'BankTransfer' | undefined,
            actualSoldPrice: data.actualSoldPrice ? parseFloat(data.actualSoldPrice) : undefined,
            deliveryMethod: data.deliveryMethod as 'Sent' | 'Local Meetup' | undefined,
            source: data.source as 'Facebook' | 'DBA' | undefined,
            dateSold: data.dateSold ? new Date(data.dateSold).toISOString() : undefined,
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
        console.log(
          '[PSA FORM SUBMIT] Processing unsold item edit - updating price and images only'
        );
        // For editing unsold items, only update price and images (preserve card info)
        // Use currentPrice from price history updates, not the disabled form field
        const priceToUse = currentPrice > 0 ? currentPrice : parseFloat(data.myPrice);
        // Combine new uploaded images with remaining existing images
        const finalImages = [...remainingExistingImages, ...imageUrls];
        cardData = {
          myPrice: priceToUse,
          images: finalImages,
          priceHistory: priceHistory.length > 0 ? priceHistory : initialData?.priceHistory,
        };
        console.log('[PSA FORM SUBMIT] Edit data prepared:', {
          myPrice: priceToUse,
          originalFormPrice: parseFloat(data.myPrice),
          currentPriceFromHistory: currentPrice,
          finalImageCount: finalImages.length,
          remainingExistingImages: remainingExistingImages.length,
          newUploadedImages: imageUrls.length,
          priceHistoryCount: cardData.priceHistory?.length || 0,
        });
      } else {
        console.log('[PSA FORM SUBMIT] Processing new item creation');
        
        // Validate that a card has been selected
        if (!selectedCardId) {
          throw new Error('Please select a card from the search suggestions');
        }

        // For new items, use cardId reference (backend schema requirement)
        cardData = {
          cardId: selectedCardId,
          grade: data.grade,
          myPrice: parseFloat(data.myPrice),
          dateAdded: new Date(data.dateAdded).toISOString(),
          images: imageUrls.length > 0 ? imageUrls : [],
          // Use the updated price history, or create initial entry for new cards
          priceHistory:
            priceHistory.length > 0
              ? priceHistory
              : [
                  {
                    price: parseFloat(data.myPrice),
                    dateUpdated: new Date().toISOString(),
                  },
                ],
        };
      }

      console.log('[PSA FORM SUBMIT] Final card data to submit:', cardData);
      console.log('[PSA FORM SUBMIT] API call parameters:', {
        isEditing,
        itemId: initialData?.id,
        updateFunction: isEditing ? 'updatePsaCard' : 'addPsaCard',
      });

      if (isEditing && initialData?.id) {
        console.log('[PSA FORM SUBMIT] Calling updatePsaCard with ID:', initialData.id);
        const result = await updatePsaCard(initialData.id, cardData);
        console.log('[PSA FORM SUBMIT] Update successful, result:', result);
      } else {
        console.log('[PSA FORM SUBMIT] Calling addPsaCard');
        const result = await addPsaCard(cardData);
        console.log('[PSA FORM SUBMIT] Creation successful, result:', result);
      }

      console.log('[PSA FORM SUBMIT] ===== SUBMIT COMPLETED SUCCESSFULLY =====');
      onSuccess();
    } catch (error) {
      console.error('[PSA FORM SUBMIT] ===== SUBMIT FAILED =====');
      console.error('[PSA FORM SUBMIT] Error details:', error);
      console.error('[PSA FORM SUBMIT] Error message:', error?.message);
      console.error('[PSA FORM SUBMIT] Error stack:', error?.stack);
      // Error handling is done by useCollection hook
    } finally {
      setIsSubmitting(false);
      console.log('[PSA FORM SUBMIT] Submit process finished, isSubmitting set to false');
    }
  };

  if (loading && !isSubmitting) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Form Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6'>
        <div className='flex items-center'>
          <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
            <Award className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <h3 className='text-lg font-semibold text-blue-900'>
              {isEditing ? 'Edit PSA Graded Card' : 'Add PSA Graded Card'}
            </h3>
            <p className='text-blue-700 text-sm'>
              {isEditing
                ? initialData?.sold
                  ? 'Update buyer information and tracking details'
                  : 'Update price and images (card info is locked after adding)'
                : 'Add a new PSA graded card to your collection'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Information Section - Enhanced Autocomplete Integration */}
      {!(isEditing && initialData?.sold) && (
        <div className='bg-white border border-gray-200 rounded-lg p-6'>
          <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center justify-between'>
            <div className='flex items-center'>
              <Award className='w-5 h-5 mr-2 text-gray-600' />
              Card Information
            </div>
            {watch('setName') && (
              <div className='flex items-center text-sm text-blue-600'>
                <Award className='w-4 h-4 mr-1' />
                Filtering by: {watch('setName')}
              </div>
            )}
          </h4>

          {/* Enhanced Autocomplete for Hierarchical Search */}
          <div className='mb-6'>
            <EnhancedAutocomplete
              config={autocompleteConfig}
              fields={autocompleteFields}
              onSelectionChange={selectedData => {
                console.log('[PSA CARD] ===== ENHANCED AUTOCOMPLETE SELECTION =====');
                console.log('[PSA CARD] Enhanced autocomplete selection:', selectedData);

                // Auto-fill form fields based on selection
                if (selectedData) {
                  // The selectedData contains the raw card data from the search API
                  console.log('[PSA CARD] Raw selected data:', selectedData);

                  // Store the selected card ID for backend submission
                  if (selectedData.id) {
                    setSelectedCardId(selectedData.id);
                    console.log('[PSA CARD] Selected card ID:', selectedData.id);
                  }

                  // Auto-fill set name from setInfo or direct setName
                  const setName = selectedData.setInfo?.setName || selectedData.setName;
                  if (setName) {
                    setValue('setName', setName, { shouldValidate: true });
                    clearErrors('setName'); // Clear any validation errors
                  }

                  // Auto-fill card name
                  if (selectedData.cardName) {
                    setValue('cardName', selectedData.cardName, { shouldValidate: true });
                    clearErrors('cardName'); // Clear any validation errors
                  }

                  // Auto-fill pokemon number
                  if (selectedData.pokemonNumber) {
                    setValue('pokemonNumber', selectedData.pokemonNumber, { shouldValidate: true });
                    clearErrors('pokemonNumber'); // Clear any validation errors
                  }

                  // Auto-fill base name
                  if (selectedData.baseName) {
                    setValue('baseName', selectedData.baseName, { shouldValidate: true });
                    clearErrors('baseName'); // Clear any validation errors
                  }

                  // Auto-fill variety (always set, even if empty)
                  const varietyValue = selectedData.variety || '';
                  console.log('[PSA CARD] Variety value:', {
                    raw: selectedData.variety,
                    processed: varietyValue,
                    type: typeof selectedData.variety,
                  });
                  setValue('variety', varietyValue, { shouldValidate: true });
                  clearErrors('variety'); // Clear any validation errors

                  console.log('[PSA CARD] Auto-filled fields:', {
                    setName: selectedData.setInfo?.setName || selectedData.setName,
                    cardName: selectedData.cardName,
                    pokemonNumber: selectedData.pokemonNumber,
                    baseName: selectedData.baseName,
                    variety: selectedData.variety,
                  });
                }
              }}
              onError={error => {
                console.error('[PSA CARD] Enhanced autocomplete error:', error);
              }}
              variant='premium'
              showMetadata={true}
              allowClear={true}
              disabled={isEditing}
              className='premium-search-integration'
            />
          </div>

          {/* Additional Card Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Pokemon Number */}
            <div>
              <Input
                label='Pokémon Number'
                {...register('pokemonNumber')}
                error={errors.pokemonNumber?.message}
                placeholder='e.g., 006, 025, 150'
                disabled={isEditing}
                className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Base Name */}
            <div>
              <Input
                label='Base Name'
                {...register('baseName', {
                  required: 'Base name is required',
                  minLength: { value: 2, message: 'Base name must be at least 2 characters' },
                })}
                error={errors.baseName?.message}
                placeholder='e.g., Charizard, Pikachu, Mew'
                disabled={isEditing}
                className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Variety */}
            <div className='md:col-span-2'>
              <Input
                label='Variety'
                {...register('variety')}
                error={errors.variety?.message}
                placeholder='e.g., Holo, Shadowless, 1st Edition'
                disabled={isEditing}
                className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Form Registration for Enhanced Autocomplete Fields */}
          <div className='hidden'>
            {/* Register form fields for validation - Enhanced Autocomplete handles the UI */}
            <input
              {...register('setName', {
                required: 'Set name is required',
                minLength: { value: 2, message: 'Set name must be at least 2 characters' },
              })}
              value={watch('setName') || ''}
              readOnly
            />
            <input
              {...register('cardName', {
                required: 'Card name is required',
                minLength: { value: 2, message: 'Card name must be at least 2 characters' },
              })}
              value={watch('cardName') || ''}
              readOnly
            />
            <input {...register('pokemonNumber')} value={watch('pokemonNumber') || ''} readOnly />
            <input
              {...register('baseName', {
                required: 'Base name is required',
                minLength: { value: 2, message: 'Base name must be at least 2 characters' },
              })}
              value={watch('baseName') || ''}
              readOnly
            />
            <input {...register('variety')} value={watch('variety') || ''} readOnly />
          </div>
        </div>
      )}

      {/* Grading & Pricing Section - Hidden for sold items */}
      <GradingPricingSection
        register={register}
        errors={errors}
        cardType='psa'
        currentGradeOrCondition={watchedGrade}
        currentPrice={watchedPrice}
        isEditing={isEditing}
        priceHistory={priceHistory}
        currentPriceNumber={currentPrice}
        onPriceUpdate={handlePriceUpdate}
        disableGradeConditionEdit={isEditing}
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Image Upload Section - Available for unsold items only */}
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        existingImageUrls={initialData?.images || []}
        maxFiles={8}
        maxFileSize={5}
        title='Card Images'
        isVisible={!(isEditing && initialData?.sold)}
      />

      {/* Sold Item Edit Section - Only for sold items */}
      <SaleDetailsSection
        register={register}
        errors={errors}
        watch={watch}
        isVisible={isEditing && initialData?.sold}
        itemName='card'
      />

      {/* Action Buttons */}
      <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
        <Button type='button' variant='secondary' onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button type='submit' variant='primary' disabled={isSubmitting} className='min-w-[120px]'>
          {isSubmitting ? (
            <div className='flex items-center'>
              <LoadingSpinner size='sm' className='mr-2' />
              {isEditing ? 'Updating...' : 'Adding...'}
            </div>
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
